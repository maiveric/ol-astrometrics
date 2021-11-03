/*
 * @flow
 */

import moment from 'moment';
import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';

import { EXPLORE } from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { MAP_STYLE } from '../../utils/constants/MapConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import { getPlate } from '../../utils/VehicleUtils';
import {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  SELECT_ENTITY,
  SELECT_READS_FOR_REPORT,
  DESELECT_READS_FOR_REPORT,
  SET_FILTER,
  SET_MAP_MODE,
  SET_MAP_STYLE_LOADED,
  UNMOUNT_EXPLORE,
  executeSearch,
  loadHotlistPlates
} from './ExploreActionFactory';

import { EDIT_SEARCH_PARAMETERS } from '../parameters/ParametersActionFactory';

const {
  ENTITIES_BY_ID,
  FILTER,
  HOTLIST_PLATES,
  IS_LOADING_HOTLIST_PLATES,
  IS_MAP_STYLE_LOADING,
  IS_SEARCHING_DATA,
  MAP_MODE,
  READ_IDS_TO_ADD_TO_REPORT,
  SEARCH_DATE_TIME,
  SELECTED_ENTITY_KEY_IDS,
  SELECTED_READ_ID,
  SEARCH_RESULTS,
  TOTAL_RESULTS,
} = EXPLORE;

const INITIAL_STATE :Map<> = fromJS({
  [ENTITIES_BY_ID]: Map(),
  [FILTER]: '',
  [HOTLIST_PLATES]: Set(),
  [IS_LOADING_HOTLIST_PLATES]: false,
  [IS_MAP_STYLE_LOADING]: true,
  [IS_SEARCHING_DATA]: false,
  [MAP_MODE]: MAP_STYLE.DARK,
  [READ_IDS_TO_ADD_TO_REPORT]: Set(),
  [SEARCH_RESULTS]: List(),
  [SELECTED_ENTITY_KEY_IDS]: Set(),
  [SELECTED_READ_ID]: undefined,
  [TOTAL_RESULTS]: 0
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadHotlistPlates.case(action.type): {
      return loadHotlistPlates.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_HOTLIST_PLATES, true),
        SUCCESS: () => state.set(HOTLIST_PLATES, action.value),
        FINALLY: () => state.set(IS_LOADING_HOTLIST_PLATES, false)
      });
    }

    case executeSearch.case(action.type): {
      return executeSearch.reducer(state, action, {
        REQUEST: () => state
          .set(IS_SEARCHING_DATA, true)
          .set(SEARCH_RESULTS, List())
          .set(SEARCH_DATE_TIME, moment().toISOString(true))
          .set(TOTAL_RESULTS, 0),
        SUCCESS: () => {
          const { results } = action.value;
          const { hits, numHits } = results;
          const reads = fromJS(hits);
          let entitiesById = state.get(ENTITIES_BY_ID);
          reads.forEach((result) => {
            entitiesById = entitiesById.set(getEntityKeyId(result), result);
          });

          return state
            .set(SEARCH_RESULTS, reads)
            .set(ENTITIES_BY_ID, entitiesById)
            .set(TOTAL_RESULTS, numHits);
        },
        FAILURE: () => state.set(SEARCH_RESULTS, List()).set(TOTAL_RESULTS, 0),
        FINALLY: () => state.set(IS_SEARCHING_DATA, false)
      });
    }

    case EDIT_SEARCH_PARAMETERS: {
      if (action.value) {
        return state
          .set(IS_SEARCHING_DATA, false)
          .set(SEARCH_RESULTS, List())
          .set(TOTAL_RESULTS, 0);
      }
      return state;
    }

    case SELECT_ENTITY: {

      const entityKeyId = action.value;

      const targetVehicleRecord = state
        .get(SEARCH_RESULTS)
        .find((vehicleRecord) => getEntityKeyId(vehicleRecord) === entityKeyId);

      const targetPlate = getPlate(targetVehicleRecord || Map());

      let selectedEntityKeyIds = Set();
      state.get(SEARCH_RESULTS)
        .filter((vehicleRecord) => getPlate(vehicleRecord) === targetPlate)
        .forEach((vehicleRecord) => {
          selectedEntityKeyIds = selectedEntityKeyIds.add(getEntityKeyId(vehicleRecord));
        });

      let newState = state
        .set(SELECTED_ENTITY_KEY_IDS, selectedEntityKeyIds)
        .set(SELECTED_READ_ID, entityKeyId || selectedEntityKeyIds.first());

      if (!entityKeyId) {
        newState = newState.set(READ_IDS_TO_ADD_TO_REPORT, Set());
      }

      return newState;
    }

    case SELECT_READS_FOR_REPORT:
      return state.set(READ_IDS_TO_ADD_TO_REPORT, state.get(READ_IDS_TO_ADD_TO_REPORT).union(action.value));

    case DESELECT_READS_FOR_REPORT:
      return state.set(READ_IDS_TO_ADD_TO_REPORT, state.get(READ_IDS_TO_ADD_TO_REPORT).subtract(action.value));

    case SET_FILTER:
      return state.set(FILTER, action.value);

    case SET_MAP_MODE:
      return state.set(MAP_MODE, action.value).set(IS_MAP_STYLE_LOADING, true);

    case SET_MAP_STYLE_LOADED:
      return state.set(IS_MAP_STYLE_LOADING, false);

    case CLEAR_EXPLORE_SEARCH_RESULTS:
    case UNMOUNT_EXPLORE:
      return state
        .set(IS_SEARCHING_DATA, false)
        .set(SEARCH_RESULTS, List())
        .set(SELECTED_ENTITY_KEY_IDS, Set())
        .set(SELECTED_READ_ID, undefined)
        .set(TOTAL_RESULTS, 0);

    default:
      return state;
  }
}

export default reducer;
