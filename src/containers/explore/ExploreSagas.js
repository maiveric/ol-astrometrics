/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import { Constants, SearchApi } from 'lattice';
import {
  call,
  put,
  take,
  takeEvery
} from 'redux-saga/effects';

import searchPerformedConig from '../../config/formconfig/SearchPerformedConfig';
import { getSearchFields } from '../parameters/ParametersReducer';
import { getEntityKeyId } from '../../utils/DataUtils';
import { EXPLORE, PARAMETERS, SEARCH_PARAMETERS } from '../../utils/constants/StateConstants';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';
import { submit } from '../submit/SubmitActionFactory';
import {
  EXECUTE_SEARCH,
  LOAD_ENTITY_NEIGHBORS,
  executeSearch,
  loadEntityNeighbors
} from './ExploreActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

function takeReqSeqSuccessFailure(reqseq :RequestSequence, seqAction :SequenceAction) {
  return take(
    (anAction :Object) => (anAction.type === reqseq.SUCCESS && anAction.id === seqAction.id)
        || (anAction.type === reqseq.FAILURE && anAction.id === seqAction.id)
  );
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

    const searchRequest = getSearchRequest(
      entitySetId,
      propertyTypesByFqn,
      searchParameters
    );

    const logSearchAction = submit({
      config: searchPerformedConig,
      values: {
        [PARAMETERS.REASON]: searchParameters.get(PARAMETERS.REASON),
        [PARAMETERS.CASE_NUMBER]: searchParameters.get(PARAMETERS.CASE_NUMBER),
        [SEARCH_PARAMETERS.SEARCH_PARAMETERS]: JSON.stringify(searchRequest),
        [EXPLORE.SEARCH_DATE_TIME]: moment().toISOString(true)
      },
      includeUserId: true
    });
    yield put(logSearchAction);
    const logSearchResponseAction = yield takeReqSeqSuccessFailure(submit, logSearchAction);
    if (logSearchResponseAction.type === submit.SUCCESS) {
      const results = yield call(SearchApi.executeSearch, searchRequest);

      yield put(executeSearch.success(action.id, results));

      yield put(loadEntityNeighbors({
        entitySetId,
        entityKeyIds: results.hits.map(entity => entity[OPENLATTICE_ID_FQN][0])
      }));
    }
    else {
      console.error('Unable to log search.')
      yield put(executeSearch.failure(action.id));
    }
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
