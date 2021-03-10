/*
 * @flow
 */

import axios from 'axios';
import qs from 'query-string';
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
  GEOCODE_ADDRESS,
  LOAD_DEPARTMENTS_AND_DEVICES,
  REVERSE_GEOCODE_COORDINATES,
  geocodeAddress,
  loadDepartmentsAndDevices,
  reverseGeocodeCoordinates
} from './ParametersActionFactory';

import { getAppFromState, getEntitySetId } from '../../utils/AppUtils';
import { formatDescriptionIdForDisplay, formatNameIdForDisplay, getEntityKeyId } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

declare var __MAPBOX_TOKEN__;

const SACRAMENTO_LAT_LONG = '-121.4944,38.5816';
const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

function* getGeocodedResults(addressOrCoords) :Generator<*, *, *> {
  if (!addressOrCoords) {
    return [];
  }

  const params = {
    access_token: __MAPBOX_TOKEN__,
    autocomplete: true,
    proximity: SACRAMENTO_LAT_LONG
  };

  const queryString = qs.stringify(params);

  const { data: suggestions } = yield call(axios, {
    method: 'get',
    url: `${GEOCODING_API}/${window.encodeURI(addressOrCoords)}.json?${queryString}`,
  });

  const formattedSuggestions = suggestions.features.map((sugg) => {
    const { place_name: value, geometry } = sugg;
    const { coordinates } = geometry;
    const [lon, lat] = coordinates;
    return {
      ...sugg,
      label: value,
      value,
      lon,
      lat
    };
  });

  return formattedSuggestions;
}

function* geocodeAddressWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(geocodeAddress.request(action.id));
    const results = yield call(getGeocodedResults, action.value);
    yield put(geocodeAddress.success(action.id, results));
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

function* reverseGeocodeCoordinatesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(reverseGeocodeCoordinates.request(action.id));

    const requestedCoords = action.value;
    const indexedResults = yield all(requestedCoords.toJS().map((coords) => call(getGeocodedResults, coords)));

    let addressesByCoords = Map();
    requestedCoords.forEach((coords, idx) => {
      if (!coords) {
        return;
      }

      const [long, lat] = coords;
      const latLongAsString = `${lat}, ${long}`;
      const resultForCoords = indexedResults[idx];

      let resultStr = '';

      if (resultForCoords && resultForCoords.length) {
        resultStr = resultForCoords[0].label;
      }

      addressesByCoords = addressesByCoords.set(latLongAsString, resultStr);
    });

    yield put(reverseGeocodeCoordinates.success(action.id, fromJS(addressesByCoords)));
  }
  catch (error) {
    yield put(reverseGeocodeCoordinates.failure(action.id, error));
  }
  finally {
    yield put(reverseGeocodeCoordinates.finally(action.id));
  }
}

export function* reverseGeocodeCoordinatesWatcher() :Generator<*, *, *> {
  yield takeEvery(REVERSE_GEOCODE_COORDINATES, reverseGeocodeCoordinatesWorker);
}

const getDeviceDataAsMap = (entities) => {
  let map = OrderedMap();

  fromJS(entities).forEach((entity) => {
    const id = entity.getIn([PROPERTY_TYPES.ID, 0]);
    if (id) {
      map = map.set(id, formatDescriptionIdForDisplay(entity));
    }
  });

  return map.sort();
};

const getAgencyDataAsMap = (entities) => {
  let map = OrderedMap();

  fromJS(entities).forEach((entity) => {
    const name = formatNameIdForDisplay(entity);
    if (name) {
      map = map.set(name, name);
    }
  });

  return map.sort();
};

function* loadDepartmentsAndDevicesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadDepartmentsAndDevices.request(action.id));

    const app = yield select(getAppFromState);

    const agenciesEntitySetId = getEntitySetId(app, APP_TYPES.AGENCIES);
    const devicesEntitySetId = getEntitySetId(app, APP_TYPES.CAMERAS);

    const [departments, devices] = yield all([
      call(DataApi.getEntitySetData, agenciesEntitySetId),
      call(DataApi.getEntitySetData, devicesEntitySetId)
    ]);

    const immutableDepartments = fromJS(departments);

    const agencyEntityKeyIds = immutableDepartments.map(getEntityKeyId).toJS();

    let devicesByAgencyEntityKeyId = {};
    if (agencyEntityKeyIds.length) {
      devicesByAgencyEntityKeyId = yield call(SearchApi.searchEntityNeighborsWithFilter, agenciesEntitySetId, {
        entityKeyIds: agencyEntityKeyIds,
        sourceEntitySetIds: [devicesEntitySetId],
        destinationEntitySetIds: [devicesEntitySetId]
      });
    }
    devicesByAgencyEntityKeyId = fromJS(devicesByAgencyEntityKeyId);

    let devicesByAgency = Map();

    immutableDepartments.forEach((agency) => {
      const agencyName = agency.getIn([PROPERTY_TYPES.NAME, 0]);

      let deviceIds = List();
      devicesByAgencyEntityKeyId.get(getEntityKeyId(agency), List()).forEach((deviceNeighbor) => {

        const deviceId = deviceNeighbor.getIn(['neighborDetails', PROPERTY_TYPES.ID, 0]);
        deviceIds = deviceIds.push(deviceId);
      });

      devicesByAgency = devicesByAgency.set(agencyName, deviceIds);
    });

    yield put(loadDepartmentsAndDevices.success(action.id, {
      departmentOptions: getAgencyDataAsMap(departments),
      deviceOptions: getDeviceDataAsMap(devices),
      devicesByAgency
    }));
  }

  catch (error) {
    console.error(error);
    yield put(loadDepartmentsAndDevices.failure(action.id, error));
  }
  finally {
    yield put(loadDepartmentsAndDevices.finally(action.id));
  }
}

export function* loadDepartmentsAndDevicesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_DEPARTMENTS_AND_DEVICES, loadDepartmentsAndDevicesWorker);
}
