/*
 * @flow
 */

import axios from 'axios';
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { DataApi, SearchApi } from 'lattice';
import { fromJS, OrderedMap } from 'immutable';

import { getEdm, getEntitySetId } from '../../utils/AppUtils';
import { formatNameIdForDisplay } from '../../utils/DataUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import {
  GEOCODE_ADDRESS,
  LOAD_DEPARTMENTS_AND_DEVICES,
  geocodeAddress,
  loadDepartmentsAndDevices
} from './ParametersActionFactory';

const GEOCODER_URL_PREFIX = 'https://osm.openlattice.com/nominatim/search/';
const GEOCODER_URL_SUFFIX = '?format=json';

function* geocodeAddressWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(geocodeAddress.request(action.id));

    const response = yield call(axios, {
      method: 'get',
      url: `${GEOCODER_URL_PREFIX}${window.encodeURI(action.value)}${GEOCODER_URL_SUFFIX}`
    });

    yield put(geocodeAddress.success(action.id, response.data));
  }
  catch (error) {
    yield put(geocodeAddress.failure(action.id, error));
  }
  finally {
    yield put(geocodeAddress.finally(action.id));
  }
}

export function* geocodeAddressWatcher() :Generator<*, *, *> {
  yield takeEvery(GEOCODE_ADDRESS, geocodeAddressWorker);
}

const getDataAsMap = (entities) => {
  let map = OrderedMap();

  fromJS(entities).forEach((entity) => {
    const id = entity.getIn([PROPERTY_TYPES.ID, 0]);
    map = map.set(formatNameIdForDisplay(entity), id);
  });

  return map;
};

function* loadDepartmentsAndDevicesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadDepartmentsAndDevices.request(action.id));

    const edm = yield select(getEdm);

    const [departments, devices] = yield all([
      call(DataApi.getEntitySetData, getEntitySetId(edm, ENTITY_SETS.AGENCIES)),
      call(DataApi.getEntitySetData, getEntitySetId(edm, ENTITY_SETS.CAMERAS))
    ]);

    yield put(loadDepartmentsAndDevices.success(action.id, {
      departmentOptions: getDataAsMap(departments),
      deviceOptions: getDataAsMap(devices)
    }));
  }
  catch (error) {
    yield put(loadDepartmentsAndDevices.failure(action.id, error));
  }
  finally {
    yield put(loadDepartmentsAndDevices.finally(action.id));
  }
}

export function* loadDepartmentsAndDevicesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_DEPARTMENTS_AND_DEVICES, loadDepartmentsAndDevicesWorker);
}
