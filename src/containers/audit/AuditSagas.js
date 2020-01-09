/*
 * @flow
 */

import moment from 'moment';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { PrincipalsApi, SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getEntityKeyId, getDateSearchTerm } from '../../utils/DataUtils';
import {
  getAppFromState,
  getAuditFromState,
  getEntitySetId,
  getPropertyTypeId
} from '../../utils/AppUtils';
import {
  APPLY_FILTERS,
  LOAD_AUDIT_DATA,
  LOAD_AUDIT_DASHBOARD_DATA,
  SET_AUDIT_DASHBOARD_WINDOW,
  applyFilters,
  loadAuditData,
  loadAuditDashboardData,
  setAuditDashboardWindow
} from './AuditActionFactory';

import { AUDIT, AUDIT_EVENT } from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

const getEmailFromSubjectId = (subjectId, usersById) => {
  const user = usersById[subjectId];

  if (!user) {
    return undefined;
  }

  const { email, user_id: userId } = user;

  return email || userId;
};

const getEmailFromNeighbors = (neighborsById, entityKeyId, usersById) => {

  const neighbors = neighborsById[entityKeyId];
  if (neighbors && neighbors.length) {

    const [{ neighborDetails }] = neighbors;

    if (neighborDetails) {
      const { [PROPERTY_TYPES.PERSON_ID]: personIds } = neighborDetails;

      if (personIds && personIds.length) {

        const id = getEmailFromSubjectId(personIds[0], usersById);

        if (id) {
          return id;
        }
      }
    }
  }

  return 'Unknown';
};

const getPlateFromSearch = (search, platePTId) => {
  let licensePlate = '';
  try {
    const params = JSON.parse(search.getIn([PROPERTY_TYPES.SEARCH_QUERY, 0], '{}'));
    const { constraints } = params;
    constraints.forEach(({ constraints: nestedConstraints }) => {

      nestedConstraints.forEach((constraint) => {
        const { searchFields } = constraint;

        if (searchFields && searchFields.length) {
          searchFields.forEach(({ property, searchTerm }) => {

            if (property === platePTId) {
              licensePlate = searchTerm;
            }

          });
        }

      });
    });
  }
  catch (error) {
    console.error(`Unable to parse JSON from search ${search.toJS()}`);
  }

  return licensePlate;
};

function* getUsersById() {
  try {
    const users = yield call(PrincipalsApi.getAllUsers);

    return users;
  }
  catch (error) {
    console.error(error);
    return {};
  }
}

function* getAuditData({ start, end }) {

  const usersById = yield call(getUsersById);

  const app = yield select(getAppFromState);
  const audit = yield select(getAuditFromState);

  const searchesEntitySetId = getEntitySetId(app, APP_TYPES.SEARCHES);
  const usersEntitySetId = getEntitySetId(app, APP_TYPES.USERS);
  const dateTimePTId = yield select(state => getPropertyTypeId(state, PROPERTY_TYPES.LAST_REPORTED_DATE_TIME));
  const platePTId = yield select(state => getPropertyTypeId(state, PROPERTY_TYPES.PLATE));

  const startDate = start || audit.get(AUDIT.START_DATE).format('YYYY-MM-DD');
  const endDate = end || audit.get(AUDIT.END_DATE).format('YYYY-MM-DD');

  const { hits } = yield call(SearchApi.searchEntitySetData, searchesEntitySetId, {
    start: 0,
    maxHits: 10000,
    fuzzy: false,
    searchTerm: getDateSearchTerm(dateTimePTId, startDate, endDate)
  });
  const searches = fromJS(hits);

  let formattedSearches = List();
  let entityKeyIdsWithoutUsers = List();

  const searchesWithoutUsers = searches.map((search) => {
    const entityKeyId = getEntityKeyId(search);
    const email = getEmailFromSubjectId(search.getIn([PROPERTY_TYPES.PERSON_ID, 0]), usersById);
    const licensePlate = getPlateFromSearch(search, platePTId);

    const formattedSearch = Map()
      .set(AUDIT_EVENT.ID, entityKeyId)
      .set(AUDIT_EVENT.PERSON_ID, email)
      .set(AUDIT_EVENT.CASE_NUMBER, search.getIn([PROPERTY_TYPES.CASE_NUMBER, 0], 'Unknown'))
      .set(AUDIT_EVENT.REASON, search.getIn([PROPERTY_TYPES.SEARCH_REASON, 0], 'Unknown'))
      .set(AUDIT_EVENT.DATE_TIME, moment(search.getIn([PROPERTY_TYPES.LAST_REPORTED_DATE_TIME, 0], '')))
      .set(AUDIT_EVENT.PLATE, licensePlate);

    if (email) {
      formattedSearches = formattedSearches.push(formattedSearch);
      return null;
    }

    entityKeyIdsWithoutUsers = entityKeyIdsWithoutUsers.push(entityKeyId);
    return formattedSearch;
  }).filter(s => s);

  if (entityKeyIdsWithoutUsers.size) {

    const neighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, searchesEntitySetId, {
      entityKeyIds: entityKeyIdsWithoutUsers.toJS(),
      sourceEntitySetIds: [usersEntitySetId],
      destinationEntitySetIds: [usersEntitySetId]
    });

    searchesWithoutUsers.forEach((search) => {
      const entityKeyId = search.get(AUDIT_EVENT.ID);
      const email = getEmailFromNeighbors(neighbors, entityKeyId, usersById);

      formattedSearches = formattedSearches.push(search.set(AUDIT_EVENT.PERSON_ID, email));
    });
  }

  return formattedSearches.sort((search1, search2) => {
    const dateTime1 = search1.get(AUDIT_EVENT.DATE_TIME, moment(''));
    const dateTime2 = search2.get(AUDIT_EVENT.DATE_TIME, moment(''));

    return dateTime1.isAfter(dateTime2) ? -1 : 1;
  });

}

function* loadAuditDataWorker(action :SequenceAction) {
  try {
    yield put(loadAuditData.request(action.id));

    const searches = yield call(getAuditData, {});

    yield put(loadAuditData.success(action.id, searches));
  }
  catch (error) {
    console.error(error)
    yield put(loadAuditData.failure(action.id, error));
  }
  finally {
    yield put(loadAuditData.finally(action.id));
  }
}

export function* loadAuditDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_AUDIT_DATA, loadAuditDataWorker);
}

function* applyFiltersWorker(action :SequenceAction) {
  try {
    yield put(applyFilters.request(action.id, action.value));

    const searches = yield call(getAuditData, {});

    yield put(applyFilters.success(action.id, searches));
  }
  catch (error) {
    console.error(error)
    yield put(applyFilters.failure(action.id, error));
  }
  finally {
    yield put(applyFilters.finally(action.id));
  }
}

export function* applyFiltersWatcher() :Generator<*, *, *> {
  yield takeEvery(APPLY_FILTERS, applyFiltersWorker);
}

function* loadAuditDashboardDataWorker(action :SequenceAction) {
  try {
    yield put(loadAuditDashboardData.request(action.id, action.value));

    const audit = yield select(getAuditFromState);
    const window = audit.get(AUDIT.DASHBOARD_WINDOW);

    const searches = yield call(getAuditData, {
      start: moment().subtract(1, window).toISOString(true),
      end: moment().toISOString(true)
    });

    yield put(loadAuditDashboardData.success(action.id, searches));
  }
  catch (error) {
    console.error(error);
    yield put(loadAuditDashboardData.failure(action.id, error));
  }
  finally {
    yield put(loadAuditDashboardData.finally(action.id));
  }
}

export function* loadAuditDashboardDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_AUDIT_DASHBOARD_DATA, loadAuditDashboardDataWorker);
}

function* setAuditDashboardWindowWorker(action :SequenceAction) {
  try {
    const window = action.value;
    yield put(setAuditDashboardWindow.request(action.id, window));

    const searches = yield call(getAuditData, {
      start: moment().subtract(1, window).toISOString(true),
      end: moment().toISOString(true)
    });

    yield put(setAuditDashboardWindow.success(action.id, searches));
  }
  catch (error) {
    console.error(error)
    yield put(setAuditDashboardWindow.failure(action.id, error));
  }
  finally {
    yield put(setAuditDashboardWindow.finally(action.id));
  }
}

export function* setAuditDashboardWindowWatcher() :Generator<*, *, *> {
  yield takeEvery(SET_AUDIT_DASHBOARD_WINDOW, setAuditDashboardWindowWorker);
}
