/*
 * @flow
 */

import moment from 'moment';
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { AppApi, PrincipalsApi, SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getFqnString, getEntityKeyId, getDateSearchTerm } from '../../utils/DataUtils';
import {
  getAppFromState,
  getAuditFromState,
  getEntitySetId,
  getPropertyTypeId
} from '../../utils/AppUtils';
import {
  APPLY_FILTERS,
  LOAD_AUDIT_DATA,
  UPDATE_AUDIT_END,
  UPDATE_AUDIT_START,
  applyFilters,
  loadAuditData,
  updateAuditEnd,
  updateAuditStart
} from './AuditActionFactory';

import { AUDIT, AUDIT_EVENT } from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

const getEmailFromNeighbors = (neighborsById, entityKeyId, usersById) => {
  const neighbors = neighborsById[entityKeyId];
  if (neighbors && neighbors.length) {

    const [{ neighborDetails }] = neighbors;

    if (neighborDetails) {
      const { [PROPERTY_TYPES.PERSON_ID]: personIds } = neighborDetails;

      if (personIds && personIds.length) {

        const { email, user_id: userId } = usersById[personIds[0]];

        const id = email || userId;

        if (id) {
          return id;
        }
      }
    }
  }

  return 'Unknown';
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

  const entityKeyIds = searches.map(getEntityKeyId).toJS();
  const neighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, searchesEntitySetId, {
    entityKeyIds,
    sourceEntitySetIds: [],
    destinationEntitySetIds: [usersEntitySetId]
  });

  return searches.map((search) => {
    const entityKeyId = getEntityKeyId(search);
    const email = getEmailFromNeighbors(neighbors, entityKeyId, usersById);

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

    return Map()
      .set(AUDIT_EVENT.ID, entityKeyId)
      .set(AUDIT_EVENT.PERSON_ID, email)
      .set(AUDIT_EVENT.CASE_NUMBER, search.getIn([PROPERTY_TYPES.CASE_NUMBER, 0], 'Unknown'))
      .set(AUDIT_EVENT.REASON, search.getIn([PROPERTY_TYPES.SEARCH_REASON, 0], 'Unknown'))
      .set(AUDIT_EVENT.DATE_TIME, moment(search.getIn([PROPERTY_TYPES.LAST_REPORTED_DATE_TIME, 0], '')))
      .set(AUDIT_EVENT.PLATE, licensePlate);
  }).sort((search1, search2) => {
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
