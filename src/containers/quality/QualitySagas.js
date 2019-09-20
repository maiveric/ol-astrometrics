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
import { Map, OrderedMap, fromJS } from 'immutable';
import { DataApi, PrincipalsApi, SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getSearchTerm, getEntityKeyId, getDateSearchTerm } from '../../utils/DataUtils';
import {
  getAppFromState,
  getQualityFromState,
  getEntitySetId,
  getPropertyTypeId
} from '../../utils/AppUtils';
import {
  LOAD_AGENCIES,
  LOAD_QUALITY_AGENCY_DATA,
  LOAD_QUALITY_DASHBOARD_DATA,
  SET_QUALITY_DASHBOARD_WINDOW,
  loadAgencies,
  loadQualityAgencyData,
  loadQualityDashboardData,
  setQualityDashboardWindow
} from './QualityActionFactory';

import { QUALITY, DASHBOARD_WINDOWS, DATE_FORMATS } from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

function* executeSearchesForWindow(range, readsEntitySetId, dateTimePTId) {

  const labels = [];
  const requests = [];

  const formatter = DATE_FORMATS[range];
  const increment = range === DASHBOARD_WINDOWS.YEAR ? 'month' : 'day';

  let curr = moment().subtract(1, range).add(1, increment);

  while (curr.isSameOrBefore(moment().endOf(increment))) {

    const start = curr.startOf(increment).toISOString(true);
    const end = curr.endOf(increment).toISOString(true);
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

function* loadCountsForIds(ids, range, readsEntitySetId, dateTimePTId, idPTId) {

  const labels = [];
  const requests = [];

  const increment = range === DASHBOARD_WINDOWS.YEAR ? 'month' : 'day';

  const start = moment().subtract(1, range).add(1, increment).startOf(increment).toISOString(true);
  const end = moment().endOf(increment).toISOString(true);

  ids.forEach((id) => {

    const dateFilter = getDateSearchTerm(dateTimePTId, start, end);
    const idFilter = getSearchTerm(idPTId, id);

    labels.push(id);
    requests.push(call(SearchApi.searchEntitySetData, readsEntitySetId, {
      start: 0,
      maxHits: 0,
      fuzzy: false,
      searchTerm: `${idFilter} AND ${dateFilter}`
    }));

  });

  const resp = yield all(requests);

  let counts = OrderedMap();
  labels.forEach((label, index) => {
    const { numHits } = resp[index];
    counts = counts.set(label, numHits || 0);
  });

  return counts;

}

function* loadDashboard() {

  const app = yield select(getAppFromState);
  const quality = yield select(getQualityFromState);

  const range = quality.get(QUALITY.DASHBOARD_WINDOW);

  const recordsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
  const dateTimePTId = yield select(state => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));

  return yield call(executeSearchesForWindow, range, recordsEntitySetId, dateTimePTId);

}

function* loadAgencyCounts() {

  const app = yield select(getAppFromState);
  const quality = yield select(getQualityFromState);

  const range = quality.get(QUALITY.DASHBOARD_WINDOW);
  const agencyIds = quality.get(QUALITY.AGENCIES_BY_ID).keySeq();

  const recordsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
  const dateTimePTId = yield select(state => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));
  const agenciesPTId = yield select(state => getPropertyTypeId(state, PROPERTY_TYPES.AGENCY_NAME));

  return yield call(loadCountsForIds, agencyIds, range, recordsEntitySetId, dateTimePTId, agenciesPTId);

}

function* loadQualityDashboardDataWorker(action :SequenceAction) {
  try {
    yield put(loadQualityDashboardData.request(action.id));

    const searches = yield call(loadDashboard);

    yield put(loadQualityDashboardData.success(action.id, searches));
  }
  catch (error) {
    console.error(error);
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

    const searches = yield call(loadDashboard);
    const agencyCounts = yield call(loadAgencyCounts);

    yield put(setQualityDashboardWindow.success(action.id, { searches, agencyCounts }));
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
function* loadQualityAgencyDataWorker(action :SequenceAction) {
  try {
    yield put(loadQualityAgencyData.request(action.id, action.value));

    const agencyCounts = yield call(loadAgencyCounts);

    yield put(loadQualityAgencyData.success(action.id, agencyCounts));
  }
  catch (error) {
    console.error(error)
    yield put(loadQualityAgencyData.failure(action.id, error));
  }
  finally {
    yield put(loadQualityAgencyData.finally(action.id));
  }
}

export function* loadQualityAgencyDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_QUALITY_AGENCY_DATA, loadQualityAgencyDataWorker);
}

function* loadAgenciesWorker(action :SequenceAction) {
  try {
    yield put(loadAgencies.request(action.id));

    const app = yield select(getAppFromState);
    const agencyEntitySetId = getEntitySetId(app, APP_TYPES.AGENCIES);

    const data = yield call(DataApi.getEntitySetData, agencyEntitySetId);

    let agenciesById = Map();
    fromJS(data).forEach((agency) => {
      const id = agency.getIn([PROPERTY_TYPES.ID, 0]);
      const name = agency.getIn([PROPERTY_TYPES.NAME, 0], agency.getIn([PROPERTY_TYPES.DESCRIPTION, 0], ''));

      agenciesById = agenciesById.set(id, name);
    });


    yield put(loadAgencies.success(action.id, agenciesById));
    yield put(loadQualityAgencyData());
  }
  catch (error) {
    console.error(error)
    yield put(loadAgencies.failure(action.id, error));
  }
  finally {
    yield put(loadAgencies.finally(action.id));
  }
}

export function* loadAgenciesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_AGENCIES, loadAgenciesWorker);
}
