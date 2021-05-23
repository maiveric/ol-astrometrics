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
import {
  List,
  Map,
  OrderedMap,
  fromJS
} from 'immutable';
import { DataApi, SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOAD_AGENCIES,
  LOAD_QUALITY_AGENCY_DATA,
  LOAD_QUALITY_DASHBOARD_DATA,
  LOAD_QUALITY_DEVICE_DATA,
  SET_QUALITY_DASHBOARD_WINDOW,
  loadAgencies,
  loadQualityAgencyData,
  loadQualityDashboardData,
  loadQualityDeviceData,
  setQualityDashboardWindow,
} from './QualityActionFactory';

import {
  getAppFromState,
  getEntitySetId,
  getPropertyTypeId,
  getQualityFromState
} from '../../utils/AppUtils';
import { getDateSearchTerm, getSearchTerm } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { DASHBOARD_WINDOWS, QUALITY } from '../../utils/constants/StateConstants';

function* executeSearchesForWindow(range, readsEntitySetId, dateTimePTId) {

  const labels = [];
  const requests = [];

  const increment = range === DASHBOARD_WINDOWS.YEAR ? 'month' : 'day';

  let curr = moment().subtract(1, range).add(1, increment);

  while (curr.isSameOrBefore(moment().endOf(increment))) {

    const start = curr.startOf(increment).toISOString(true);
    const end = curr.endOf(increment).toISOString(true);
    labels.push(curr.toISOString(true));

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

function* loadCountsForIds(ids, range, readsEntitySetId, dateTimePTId, idPTId, dataSourcePTID :?string) {

  const increment = range === DASHBOARD_WINDOWS.YEAR ? 'month' : 'day';

  const start = moment().subtract(1, range).add(1, increment).startOf(increment).toISOString(true);
  const end = moment().endOf(increment).toISOString(true);
  const dateFilter = getDateSearchTerm(dateTimePTId, start, end);

  const app = yield select(getAppFromState);
  const dataSourcesESID = getEntitySetId(app, APP_TYPES.TEMP_DATA_SOURCE_ENUM);
  const dataSourcesResponse = yield call(DataApi.getEntitySetData, dataSourcesESID);
  const dataSources = dataSourcesResponse.map((dataSource) => dataSource[PROPERTY_TYPES.NAME][0]);

  const calls = {};
  ids.forEach((id) => {
    const idFilter = getSearchTerm(idPTId, id);
    dataSources.forEach((dataSource) => {
      const dataSourceFilter = getSearchTerm(dataSourcePTID, dataSource);
      const requestId = `${id}|${dataSource}`;
      calls[requestId] = call(SearchApi.searchEntitySetData, readsEntitySetId, {
        fuzzy: false,
        maxHits: 0,
        searchTerm: `${idFilter} AND ${dataSourceFilter} AND ${dateFilter}`,
        start: 0,
      });
    });
  });

  const responses = yield all(calls);

  const counts = Map().withMutations((mutableMap) => {
    ids.forEach((id) => {
      dataSources.forEach((dataSource) => {
        const requestId = `${id}|${dataSource}`;
        const response = responses[requestId];
        mutableMap.setIn([id, dataSource], response.numHits || 0);
      });
    });
  });

  return counts;
}

function* loadDashboard() {

  const app = yield select(getAppFromState);
  const quality = yield select(getQualityFromState);

  const range = quality.get(QUALITY.DASHBOARD_WINDOW);

  const recordsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
  const dateTimePTId = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));

  return yield call(executeSearchesForWindow, range, recordsEntitySetId, dateTimePTId);

}

function* loadAgencyCounts() {

  const app = yield select(getAppFromState);
  const quality = yield select(getQualityFromState);

  const range = quality.get(QUALITY.DASHBOARD_WINDOW);
  const agencyIds = quality.get(QUALITY.AGENCIES_BY_ID).keySeq();

  const recordsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
  const dateTimePTId = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));
  const agenciesPTId = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.PUBLIC_SAFETY_AGENCY_NAME));
  const dataSourcePTID = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.OL_DATA_SOURCE));

  return yield call(loadCountsForIds, agencyIds, range, recordsEntitySetId, dateTimePTId, agenciesPTId, dataSourcePTID);
}

function* loadDeviceCounts(agencyId :?string) {

  const app = yield select(getAppFromState);
  const quality = yield select(getQualityFromState);

  const range = quality.get(QUALITY.DASHBOARD_WINDOW);
  const selectedAgencyId = agencyId || quality.get(QUALITY.SELECTED_AGENCY_ID);
  const deviceIds = quality.getIn([QUALITY.DEVICES_BY_AGENCY, selectedAgencyId], List());

  if (!selectedAgencyId || !deviceIds.size) {
    return Map();
  }

  const recordsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
  const dateTimePTId = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.TIMESTAMP));
  const devicesPTId = yield select((state) => getPropertyTypeId(state, PROPERTY_TYPES.CAMERA_ID));

  return yield call(loadCountsForIds, deviceIds, range, recordsEntitySetId, dateTimePTId, devicesPTId);
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

    const [searches, agencyCounts, deviceCounts] = yield all([
      call(loadDashboard),
      call(loadAgencyCounts),
      call(loadDeviceCounts)
    ]);

    yield put(setQualityDashboardWindow.success(action.id, { searches, agencyCounts, deviceCounts }));
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

function* loadQualityDeviceDataWorker(action :SequenceAction) {
  try {
    yield put(loadQualityDeviceData.request(action.id, action.value));

    const deviceCounts = yield call(loadDeviceCounts, action.value);

    yield put(loadQualityDeviceData.success(action.id, deviceCounts));
  }
  catch (error) {
    console.error(error);
    yield put(loadQualityDeviceData.failure(action.id, error));
  }
  finally {
    yield put(loadQualityDeviceData.finally(action.id));
  }
}

export function* loadQualityDeviceDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_QUALITY_DEVICE_DATA, loadQualityDeviceDataWorker);
}

function* loadAgenciesWorker(action :SequenceAction) {
  try {
    yield put(loadAgencies.request(action.id));

    const app = yield select(getAppFromState);
    const agenciesESID = getEntitySetId(app, APP_TYPES.STANDARDIZED_AGENCIES);

    let agencies = yield call(DataApi.getEntitySetData, agenciesESID);
    agencies = fromJS(agencies);

    let agenciesById = Map();
    agencies.forEach((agency) => {
      const agencyId = agency.getIn([PROPERTY_TYPES.ID, 0]);
      const agencyName = agency.getIn([PROPERTY_TYPES.NAME, 0]);
      agenciesById = agenciesById.set(agencyId, agencyName);
    });

    // NOTE: 2021-05-23 - removing for now in order to implement https://jira.openlattice.com/browse/APPS-2950
    // const devicesEntitySetId = getEntitySetId(app, APP_TYPES.CAMERAS);
    // const agencyEntityKeyIds = agencies.map(getEntityKeyId);
    // let devicesByAgencyEntityKeyId = yield call(SearchApi.searchEntityNeighborsWithFilter, agenciesESID, {
    //   entityKeyIds: agencyEntityKeyIds.toJS(),
    //   sourceEntitySetIds: [devicesEntitySetId],
    //   destinationEntitySetIds: [devicesEntitySetId]
    // });
    // devicesByAgencyEntityKeyId = fromJS(devicesByAgencyEntityKeyId);
    // let devicesById = Map();
    // let devicesByAgency = Map();
    // agencies.forEach((agency) => {
    //   const agencyId = agency.getIn([PROPERTY_TYPES.ID, 0]);
    //   const agencyName = agency.getIn([PROPERTY_TYPES.NAME, 0]);
    //
    //   let deviceIds = List();
    //   devicesByAgencyEntityKeyId.get(getEntityKeyId(agency), List()).forEach((deviceNeighbor) => {
    //     const device = deviceNeighbor.get('neighborDetails', Map());
    //
    //     const deviceId = device.getIn([PROPERTY_TYPES.ID, 0]);
    //     const deviceName = device.getIn([PROPERTY_TYPES.NAME, 0], agency.getIn([PROPERTY_TYPES.DESCRIPTION, 0], ''));
    //
    //     deviceIds = deviceIds.push(deviceId);
    //     devicesById = devicesById.set(deviceId, deviceName);
    //   });
    //
    //   agenciesById = agenciesById.set(agencyId, agencyName);
    //   devicesByAgency = devicesByAgency.set(agencyName, deviceIds);
    // });

    yield put(loadAgencies.success(action.id, { agenciesById }));
    yield put(loadQualityAgencyData());
  }
  catch (error) {
    console.error(error);
    yield put(loadAgencies.failure(action.id, error));
  }
  finally {
    yield put(loadAgencies.finally(action.id));
  }
}

export function* loadAgenciesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_AGENCIES, loadAgenciesWorker);
}
