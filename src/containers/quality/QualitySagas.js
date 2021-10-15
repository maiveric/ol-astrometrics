/*
 * @flow
 */

import _chunk from 'lodash/chunk';
import moment from 'moment';
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, OrderedMap, Set } from 'immutable';
import { DataApi, SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOAD_QUALITY_AGENCY_DATA,
  LOAD_QUALITY_DASHBOARD_DATA,
  SET_QUALITY_DASHBOARD_WINDOW,
  loadQualityAgencyData,
  loadQualityDashboardData,
  setQualityDashboardWindow,
} from './QualityActionFactory';

import {
  getAppFromState,
  getEntitySetId,
  getPropertyTypeId,
  getQualityFromState,
  getSelectedOrganizationId,
} from '../../utils/AppUtils';
import { getDateSearchTerm, getSearchTerm } from '../../utils/DataUtils';
import { AGENCY_VEHICLE_RECORDS_ENTITY_SETS } from '../../utils/constants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { APP, DASHBOARD_WINDOWS, QUALITY } from '../../utils/constants/StateConstants';

function* executeSearchesForWindow(range, dateTimePTId) {

  const app = yield select(getAppFromState);
  const orgId = getSelectedOrganizationId(app);
  const appSettings = app.getIn([APP.SETTINGS_BY_ORG_ID, orgId]);
  const agencyVehicleRecordsEntitySets = appSettings.get(AGENCY_VEHICLE_RECORDS_ENTITY_SETS) || Set();

  const requests = [];
  const increment = 'day';

  let curr = moment().subtract(1, range).add(1, increment);
  while (curr.isSameOrBefore(moment().endOf(increment))) {

    const start = curr.startOf(increment).toISOString(true);
    const end = curr.endOf(increment).toISOString(true);
    const datetime = curr.toISOString(true);

    agencyVehicleRecordsEntitySets.keySeq().forEach((entitySetId) => {
      requests.push({
        [`${datetime}__${entitySetId}`]: call(
          SearchApi.searchEntitySetData,
          entitySetId,
          {
            fuzzy: false,
            maxHits: 0,
            searchTerm: getDateSearchTerm(dateTimePTId, start, end),
            start: 0,
          }
        )
      });
    });

    curr = curr.add(1, increment);
  }

  let responses = {};
  const chunks = _chunk(requests, 100);
  for (let i = 0; i < chunks.length; i += 1) {
    let chunkCalls = {};
    chunks[i].forEach((searchCall) => {
      chunkCalls = { ...chunkCalls, ...searchCall };
    });
    try {
      const chunkResponses = yield all(chunkCalls);
      responses = { ...responses, ...chunkResponses };
    }
    catch (e) {
      console.error(e);
    }
  }

  const counts = OrderedMap().withMutations((map) => {
    Object.keys(responses).forEach((requestId) => {
      const response = responses[requestId];
      if (response) {
        const { numHits } = response;
        const datetime = requestId.split('__')[0];
        map.update(datetime, (count = 0) => count + numHits);
      }
    });
  });

  return counts;
}

function* loadCountsForIds(range, dateTimePTId, dataSourcePTID :?string) {

  const app = yield select(getAppFromState);
  const orgId = getSelectedOrganizationId(app);
  const appSettings = app.getIn([APP.SETTINGS_BY_ORG_ID, orgId]);
  const agencyVehicleRecordsEntitySets = appSettings.get(AGENCY_VEHICLE_RECORDS_ENTITY_SETS) || Map();

  const increment = range === DASHBOARD_WINDOWS.MONTH ? 'month' : 'day';

  const start = moment().subtract(1, range).add(1, increment).startOf(increment).toISOString(true);
  const end = moment().endOf(increment).toISOString(true);
  const dateFilter = getDateSearchTerm(dateTimePTId, start, end);

  const dataSourcesESID = getEntitySetId(app, APP_TYPES.TEMP_DATA_SOURCE_ENUM);
  const dataSourcesResponse = yield call(DataApi.getEntitySetData, dataSourcesESID);
  const dataSources = dataSourcesResponse.map((dataSource) => dataSource[PROPERTY_TYPES.NAME][0]);

  const requests = [];
  agencyVehicleRecordsEntitySets.forEach((agencyName, agencyEntitySetId) => {
    dataSources.forEach((dataSource) => {
      const dataSourceFilter = getSearchTerm(dataSourcePTID, dataSource);
      requests.push({
        [`${agencyName}|${dataSource}`]: call(SearchApi.searchEntitySetData, agencyEntitySetId, {
          fuzzy: false,
          maxHits: 0,
          searchTerm: `${dataSourceFilter} AND ${dateFilter}`,
          start: 0,
        })
      });
    });
  });

  let responses = {};
  const chunks = _chunk(requests, 100);
  for (let i = 0; i < chunks.length; i += 1) {
    let chunkCalls = {};
    chunks[i].forEach((searchCall) => {
      chunkCalls = { ...chunkCalls, ...searchCall };
    });
    try {
      const chunkResponses = yield all(chunkCalls);
      responses = { ...responses, ...chunkResponses };
    }
    catch (e) {
      console.error(e);
    }
  }

  const counts = Map().withMutations((mutableMap) => {
    agencyVehicleRecordsEntitySets.forEach((agencyName) => {
      dataSources.forEach((dataSource) => {
        const requestId = `${agencyName}|${dataSource}`;
        const response = responses[requestId];
        if (response) {
          mutableMap.setIn([agencyName, dataSource], response.numHits || 0);
        }
      });
    });
  });

  return counts;
}

function* loadDashboard() {
  const quality = yield select(getQualityFromState);
  const range = quality.get(QUALITY.DASHBOARD_WINDOW);
  const dateTimePTId = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));
  return yield call(executeSearchesForWindow, range, dateTimePTId);
}

function* loadAgencyCounts() {
  const quality = yield select(getQualityFromState);
  const range = quality.get(QUALITY.DASHBOARD_WINDOW);
  const dateTimePTId = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));
  const dataSourcePTID = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.OL_DATA_SOURCE));
  return yield call(loadCountsForIds, range, dateTimePTId, dataSourcePTID);
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

    const [searches, agencyCounts] = yield all([
      call(loadDashboard),
      call(loadAgencyCounts),
    ]);

    yield put(setQualityDashboardWindow.success(action.id, { searches, agencyCounts }));
  }
  catch (error) {
    console.error(error);
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
    console.error(error);
    yield put(loadQualityAgencyData.failure(action.id, error));
  }
  finally {
    yield put(loadQualityAgencyData.finally(action.id));
  }
}

export function* loadQualityAgencyDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_QUALITY_AGENCY_DATA, loadQualityAgencyDataWorker);
}
