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
import { List, OrderedMap, fromJS } from 'immutable';
import { AppApi, PrincipalsApi, SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getFqnString, getEntityKeyId, getDateSearchTerm } from '../../utils/DataUtils';
import {
  getAppFromState,
  getQualityFromState,
  getEntitySetId,
  getPropertyTypeId
} from '../../utils/AppUtils';
import {
  LOAD_QUALITY_DASHBOARD_DATA,
  SET_QUALITY_DASHBOARD_WINDOW,
  loadQualityDashboardData,
  setQualityDashboardWindow
} from './QualityActionFactory';

import { QUALITY, DASHBOARD_WINDOWS, DATE_FORMATS } from '../../utils/constants/StateConstants';
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
}

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

function* executeSearchesForWindow(range, readsEntitySetId, dateTimePTId) {

  const labels = [];
  const requests = [];

  const formatter = DATE_FORMATS[range]
  const increment = range === DASHBOARD_WINDOWS.YEAR ? 'month' : 'day';

  let curr = moment().subtract(1, range).add(1, increment);

  while (curr.isSameOrBefore(moment().endOf(increment))) {

    const start = curr.startOf(increment).toISOString();
    const end = curr.endOf(increment).toISOString();
    labels.push(curr.format(formatter));

    requests.push(call(SearchApi.searchEntitySetData, readsEntitySetId, {
      start: 0,
      maxHits: 0,
      fuzzy: false,
      searchTerm: getDateSearchTerm(dateTimePTId, start, end)
    }));

    curr = curr.add(1, increment);
  }

  const resp = yield all(requests);

  let counts = OrderedMap();
  labels.forEach((label, index) => {
    const { numHits } = resp[index];
    counts = counts.set(label, numHits || 0);
  });

  return counts;
}

function* loadDashboard({ start, end }) {

  const app = yield select(getAppFromState);
  const quality = yield select(getQualityFromState);

  const range = quality.get(QUALITY.DASHBOARD_WINDOW);

  const recordsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
  const dateTimePTId = yield select(state => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));

  return yield call(executeSearchesForWindow, range, recordsEntitySetId, dateTimePTId);

}

function* loadQualityDashboardDataWorker(action :SequenceAction) {
  try {
    yield put(loadQualityDashboardData.request(action.id));

    const searches = yield call(loadDashboard, {});

    yield put(loadQualityDashboardData.success(action.id, searches));
  }
  catch (error) {
    console.error(error)
    yield put(loadQualityDashboardData.failure(action.id, error));
  }
  finally {
    yield put(loadQualityDashboardData.finally(action.id));
  }
}

export function* loadQualityDashboardDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_QUALITY_DASHBOARD_DATA, loadQualityDashboardDataWorker);
}

function* setQualityDashboardWindowWorker(action :SequenceAction) {
  try {
    yield put(setQualityDashboardWindow.request(action.id, action.value));

    const searches = yield call(loadDashboard, {});

    yield put(setQualityDashboardWindow.success(action.id, searches));
  }
  catch (error) {
    console.error(error)
    yield put(setQualityDashboardWindow.failure(action.id, error));
  }
  finally {
    yield put(setQualityDashboardWindow.finally(action.id));
  }
}

export function* setQualityDashboardWindowWatcher() :Generator<*, *, *> {
  yield takeEvery(SET_QUALITY_DASHBOARD_WINDOW, setQualityDashboardWindowWorker);
}
