/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import { Constants, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import { getSearchFields } from './ExploreReducer';
import { getEntityKeyId } from '../../utils/DataUtils';
import { PARAMETERS } from '../../utils/constants/StateConstants';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';
import {
  EXECUTE_SEARCH,
  GEOCODE_ADDRESS,
  LOAD_ENTITY_NEIGHBORS,
  SEARCH_AGENCIES,
  executeSearch,
  geocodeAddress,
  loadEntityNeighbors,
  searchAgencies
} from './ExploreActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const GEOCODER_URL_PREFIX = 'http://ec2-160-1-30-195.us-gov-west-1.compute.amazonaws.com/nominatim/search/';
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

function* loadEntityNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const { entitySetId, entityKeyIds } = action.value;
    yield put(loadEntityNeighbors.request(action.id, action.value));

    const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, entityKeyIds);
    yield put(loadEntityNeighbors.success(action.id, neighborsById));
  }
  catch (error) {
    console.error(error);
    yield put(loadEntityNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadEntityNeighbors.finally(action.id));
  }
}

export function* loadEntityNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_ENTITY_NEIGHBORS, loadEntityNeighborsWorker);
}

const getSearchRequest = (
  entitySetId,
  propertyTypesByFqn,
  searchParameters
) => {
  const baseSearch = {
    entitySetIds: [entitySetId],
    start: 0,
    maxHits: 3000
  };

  const searchFields = getSearchFields(searchParameters);

  const timestampPropertyTypeId = propertyTypesByFqn.getIn([PROPERTY_TYPES.TIMESTAMP, 'id']);
  const coordinatePropertyTypeId = propertyTypesByFqn.getIn([PROPERTY_TYPES.COORDINATE, 'id']);
  const platePropertyTypeId = propertyTypesByFqn.getIn([PROPERTY_TYPES.PLATE, 'id']);
  const namePropertyTypeId = propertyTypesByFqn.getIn([PROPERTY_TYPES.NAME, 'id']);
  const agencyIdPropertyTypeId = propertyTypesByFqn.getIn([PROPERTY_TYPES.AGENCY_NAME, 'id']);
  const deviceIdPropertyTypeId = propertyTypesByFqn.getIn([PROPERTY_TYPES.CAMERA_ID, 'id']);

  const constraintGroups = [];

  /* handle time constraints */
  if (searchFields.includes(SEARCH_TYPES.TIME_RANGE)) {
    const start = moment(searchParameters.get(PARAMETERS.START));
    const end = moment(searchParameters.get(PARAMETERS.END));
    const startStr = start.isValid() ? start.toISOString(true) : '*';
    const endStr = end.isValid() ? end.toISOString(true) : '*';
    constraintGroups.push({
      constraints: [{
        type: 'simple',
        searchTerm: `${timestampPropertyTypeId}:[${startStr} TO ${endStr}]`
      }]
    });
  }

  /* handle geo polygon constraints */
  if (searchFields.includes(SEARCH_TYPES.GEO_ZONES)) {
    constraintGroups.push({
      min: 1,
      constraints: [{
        type: 'geoPolygon',
        propertyTypeId: coordinatePropertyTypeId,
        zones: searchParameters.get(PARAMETERS.SEARCH_ZONES, [])
      }]
    });
  }

  /* handle geo radius + distance constraints */
  if (searchFields.includes(SEARCH_TYPES.GEO_RADIUS)) {
    constraintGroups.push({
      constraints: [{
        type: 'geoDistance',
        propertyTypeId: coordinatePropertyTypeId,
        latitude: searchParameters.get(PARAMETERS.LATITUDE),
        longitude: searchParameters.get(PARAMETERS.LONGITUDE),
        radius: searchParameters.get(PARAMETERS.RADIUS),
        unit: 'miles'
      }]
    });
  }

  /* Handle license plate constraints */
  if (searchFields.includes(SEARCH_TYPES.PLATE)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.PLATE),
          property: platePropertyTypeId,
          exact: false
        }]
      }]
    });
  }

  /* Handle department/agency constraints */
  if (searchFields.includes(SEARCH_TYPES.DEPARTMENT)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.DEPARTMENT_ID),
          property: agencyIdPropertyTypeId,
          exact: true
        }]
      }]
    });
  }

  /* Handle device constraints */
  if (searchFields.includes(SEARCH_TYPES.DEVICE)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.DEVICE),
          property: deviceIdPropertyTypeId,
          exact: false
        }]
      }]
    });
  }

  return Object.assign({}, baseSearch, { constraints: constraintGroups });
};

function* executeSearchWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(executeSearch.request(action.id));
    const {
      entitySetId,
      propertyTypesByFqn,
      searchParameters
    } = action.value;

    const results = yield call(SearchApi.executeSearch, getSearchRequest(
      entitySetId,
      propertyTypesByFqn,
      searchParameters
    ));

    yield put(executeSearch.success(action.id, results));

    yield put(loadEntityNeighbors({
      entitySetId,
      entityKeyIds: results.hits.map(entity => entity[OPENLATTICE_ID_FQN][0])
    }));
  }
  catch (error) {
    console.error(error);
    yield put(executeSearch.failure(action.id, error));
  }
  finally {
    yield put(executeSearch.finally(action.id));
  }
}

export function* executeSearchWatcher() :Generator<*, *, *> {
  yield takeEvery(EXECUTE_SEARCH, executeSearchWorker);
}

function* searchAgenciesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(searchAgencies.request(action.id));
    const { value, entitySetId } = action.value;

    const results = yield call(SearchApi.searchEntitySetData, entitySetId, {
      start: 0,
      maxHits: 20,
      searchTerm: value
    });

    const { hits } = results;
    yield put(searchAgencies.success(action.id, hits));
  }
  catch (error) {
    yield put(searchAgencies.failure(action.id, error));
  }
  finally {
    yield put(searchAgencies.finally(action.id));
  }
}

export function* searchAgenciesWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_AGENCIES, searchAgenciesWorker);
}
