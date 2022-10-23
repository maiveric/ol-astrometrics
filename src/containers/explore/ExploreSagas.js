/*
 * @flow
 */

import moment from 'moment';
import {
  call,
  put,
  select,
  take,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, Set, fromJS } from 'immutable';
import { DataApi, SearchApi } from 'lattice';
import type { RequestSequence, SequenceAction } from 'redux-reqseq';

import {
  EXECUTE_SEARCH,
  LOAD_HOTLIST_PLATES,
  executeSearch,
  loadHotlistPlates,
} from './ExploreActionFactory';

import searchPerformedConig from '../../config/formconfig/SearchPerformedConfig';
import {
  getAppFromState,
  getEntitySetId,
  getHotlistFromState,
  getSelectedOrganizationId,
} from '../../utils/AppUtils';
import { saveLicensePlateSearch } from '../../utils/CookieUtils';
import { getDateSearchTerm } from '../../utils/DataUtils';
import { getId } from '../../utils/VehicleUtils';
import { AGENCY_VEHICLE_RECORDS_ENTITY_SETS } from '../../utils/constants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';
import {
  APP,
  EXPLORE,
  PARAMETERS,
  SEARCH_PARAMETERS,
} from '../../utils/constants/StateConstants';
import { getSearchFields } from '../parameters/ParametersReducer';
import { submit } from '../submit/SubmitActionFactory';

function takeReqSeqSuccessFailure(reqseq :RequestSequence, seqAction :SequenceAction) {
  return take(
    (anAction :Object) => (anAction.type === reqseq.SUCCESS && anAction.id === seqAction.id)
        || (anAction.type === reqseq.FAILURE && anAction.id === seqAction.id)
  );
}

function* loadHotlistPlatesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadHotlistPlates.request(action.id, action.value));

    const app = yield select(getAppFromState);
    const hotlistEntitySetId = getEntitySetId(app, APP_TYPES.HOTLIST_VEHICLES);

    const plates = [];
    const vehicles = yield call(DataApi.getEntitySetData, hotlistEntitySetId);
    fromJS(vehicles).forEach((vehicle) => {
      plates.push(getId(vehicle).toLowerCase());
    });
    const hotlistPlates = Set(plates);

    yield put(loadHotlistPlates.success(action.id, hotlistPlates));
  }
  catch (error) {
    console.error(error);
    yield put(loadHotlistPlates.failure(action.id, error));
  }
  finally {
    yield put(loadHotlistPlates.finally(action.id));
  }
}

export function* loadHotlistPlatesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HOTLIST_PLATES, loadHotlistPlatesWorker);
}

const getSearchRequest = (
  entitySetId, // app.vehiclerecord
  propertyTypesByFqn,
  searchParameters,
  hotlistPlates,
  agencyVehicleRecordsEntitySets
) => {
  const baseSearch = {
    entitySetIds: undefined,
    start: 0,
    maxHits: 250
  };

  const searchFields = getSearchFields(searchParameters);
  const getPropertyTypeId = (fqn) => propertyTypesByFqn.getIn([fqn, 'id']);
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
        searchTerm: getDateSearchTerm(timestampPropertyTypeId, startStr, endStr)
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

    const plate = searchParameters.get(PARAMETERS.PLATE);
    saveLicensePlateSearch(plate);

    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: plate,
          property: getPropertyTypeId(PROPERTY_TYPES.PLATE),
          exact: false
        }]
      }]
    });
  }

  /* Handle department/agency constraints */
  if (searchFields.includes(SEARCH_TYPES.DEPARTMENT)) {

    // NOTE: 2022-10-23 - search within only one agency entity set
    const agencyName = searchParameters.get(PARAMETERS.DEPARTMENT);
    const agencyEntitySetId = agencyVehicleRecordsEntitySets.findKey((v) => v === agencyName);
    baseSearch.entitySetIds = [agencyEntitySetId || entitySetId];

    constraintGroups.push({
      constraints: [{
        type: 'advanced',
        searchFields: [{
          searchTerm: agencyName,
          property: getPropertyTypeId(PROPERTY_TYPES.PUBLIC_SAFETY_AGENCY_NAME),
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

  if (searchParameters.get(PARAMETERS.HOTLIST_ONLY) && hotlistPlates.size) {
    constraintGroups.push({
      constraints: hotlistPlates.map((plate) => ({
        type: 'advanced',
        searchFields: [{
          searchTerm: plate,
          property: getPropertyTypeId(PROPERTY_TYPES.PLATE),
          exact: false
        }]
      })).toJS(),
      min: 1
    });
  }

  // NOTE: 2022-10-23 - include app.vehiclerecord and all agency
  // entity sets if no department/agency constraints were applied
  baseSearch.entitySetIds = baseSearch.entitySetIds || [
    entitySetId, ...agencyVehicleRecordsEntitySets.keySeq().toJS()
  ];
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

    const hotlistPlates = yield select(getHotlistFromState);

    const app = yield select(getAppFromState);
    const orgId = getSelectedOrganizationId(app);
    const appSettings = app.getIn([APP.SETTINGS_BY_ORG_ID, orgId]);
    const agencyVehicleRecordsEntitySets = appSettings.get(AGENCY_VEHICLE_RECORDS_ENTITY_SETS) || Map();

    const searchRequest = getSearchRequest(
      entitySetId,
      propertyTypesByFqn,
      searchParameters,
      hotlistPlates,
      agencyVehicleRecordsEntitySets
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

      yield put(executeSearch.success(action.id, { results }));

      // yield put(loadEntityNeighbors({
      //   entitySetId,
      //   entityKeyIds: results.hits.map(entity => entity[OPENLATTICE_ID_FQN][0])
      // }));
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
