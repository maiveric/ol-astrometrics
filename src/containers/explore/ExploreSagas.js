/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import {
  call,
  put,
  take,
  takeEvery
} from '@redux-saga/core/effects';
import { Constants, SearchApi } from 'lattice';

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

  const getPropertyTypeId = fqn => propertyTypesByFqn.getIn([fqn, 'id']);

  const timestampPropertyTypeId = getPropertyTypeId(PROPERTY_TYPES.TIMESTAMP);

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
        propertyTypeId: getPropertyTypeId(PROPERTY_TYPES.COORDINATE),
        zones: searchParameters.get(PARAMETERS.SEARCH_ZONES, [])
      }]
    });
  }

  /* handle geo radius + distance constraints */
  if (searchFields.includes(SEARCH_TYPES.GEO_RADIUS)) {
    constraintGroups.push({
      constraints: [{
        type: 'geoDistance',
        propertyTypeId: getPropertyTypeId(PROPERTY_TYPES.COORDINATE),
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
          property: getPropertyTypeId(PROPERTY_TYPES.PLATE),
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
          property: getPropertyTypeId(PROPERTY_TYPES.AGENCY_NAME),
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
          property: getPropertyTypeId(PROPERTY_TYPES.CAMERA_ID),
          exact: false
        }]
      }]
    });
  }

  /* Handle make constraints */
  if (searchFields.includes(SEARCH_TYPES.MAKE)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.MAKE),
          property: getPropertyTypeId(PROPERTY_TYPES.MAKE),
          exact: true
        }]
      }]
    });
  }

  /* Handle model constraints */
  if (searchFields.includes(SEARCH_TYPES.MODEL)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.MODEL),
          property: getPropertyTypeId(PROPERTY_TYPES.MODEL),
          exact: false
        }]
      }]
    });
  }

  /* Handle color constraints */
  if (searchFields.includes(SEARCH_TYPES.COLOR)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.COLOR),
          property: getPropertyTypeId(PROPERTY_TYPES.COLOR),
          exact: true
        }]
      }]
    });
  }

  /* Handle accessory constraints */
  if (searchFields.includes(SEARCH_TYPES.ACCESSORIES)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.ACCESSORIES),
          property: getPropertyTypeId(PROPERTY_TYPES.ACCESSORIES),
          exact: true
        }]
      }]
    });
  }

  /* Handle style constraints */
  if (searchFields.includes(SEARCH_TYPES.STYLE)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.STYLE),
          property: getPropertyTypeId(PROPERTY_TYPES.STYLE),
          exact: true
        }]
      }]
    });
  }

  /* Handle label constraints */
  if (searchFields.includes(SEARCH_TYPES.LABEL)) {
    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: searchParameters.get(PARAMETERS.LABEL),
          property: getPropertyTypeId(PROPERTY_TYPES.LABEL),
          exact: true
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
      console.error('Unable to log search.');
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
