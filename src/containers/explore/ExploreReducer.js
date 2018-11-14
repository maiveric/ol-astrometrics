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

import { EXPLORE, PARAMETERS } from '../../utils/constants/StateConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  EDIT_SEARCH_PARAMETERS,
  SELECT_ADDRESS,
  SELECT_AGENCY,
  SELECT_ENTITY,
  SET_DRAW_MODE,
  SET_FILTER,
  UNMOUNT_EXPLORE,
  UPDATE_SEARCH_PARAMETERS,
  executeSearch,
  geocodeAddress,
  loadEntityNeighbors,
  searchAgencies
} from './ExploreActionFactory';

import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';

const {
  DISPLAY_FULL_SEARCH_OPTIONS,
  DRAW_MODE,
  ENTITY_NEIGHBORS_BY_ID,
  ENTITIES_BY_ID,
  FILTER,
  IS_LOADING_ENTITY_NEIGHBORS,
  IS_SEARCHING_DATA,
  SEARCH_PARAMETERS,
  SELECTED_ENTITY_KEY_IDS,
  IS_LOADING_ADDRESSES,
  DONE_LOADING_ADDRESSES,
  ADDRESS_SEARCH_RESULTS,
  IS_LOADING_AGENCIES,
  DONE_LOADING_AGENCIES,
  AGENCY_SEARCH_RESULTS,
  SEARCH_RESULTS,
  TOTAL_RESULTS
} = EXPLORE;

const {
  CASE_NUMBER,
  REASON,
  PLATE,
  ADDRESS,
  LATITUDE,
  LONGITUDE,
  RADIUS,
  SEARCH_ZONES,
  START,
  END,
  DEPARTMENT,
  DEPARTMENT_ID,
  DEVICE
} = PARAMETERS;

const INITIAL_SEARCH_PARAMETERS :Map<> = fromJS({
  [CASE_NUMBER]: '',
  [REASON]: '',
  [PLATE]: '',
  [ADDRESS]: '',
  [LATITUDE]: '',
  [LONGITUDE]: '',
  [RADIUS]: '',
  [SEARCH_ZONES]: [],
  [START]: '',
  [END]: '',
  [DEPARTMENT]: '',
  [DEPARTMENT_ID]: '',
  [DEVICE]: ''
});

const INITIAL_STATE :Map<> = fromJS({
  [DISPLAY_FULL_SEARCH_OPTIONS]: true,
  [DRAW_MODE]: false,
  [ENTITY_NEIGHBORS_BY_ID]: Map(),
  [ENTITIES_BY_ID]: Map(),
  [FILTER]: '',
  [IS_LOADING_ENTITY_NEIGHBORS]: false,
  [IS_SEARCHING_DATA]: false,
  [SEARCH_PARAMETERS]: INITIAL_SEARCH_PARAMETERS,
  [IS_LOADING_ADDRESSES]: false,
  [DONE_LOADING_ADDRESSES]: false,
  [ADDRESS_SEARCH_RESULTS]: List(),
  [IS_LOADING_AGENCIES]: false,
  [DONE_LOADING_AGENCIES]: false,
  [AGENCY_SEARCH_RESULTS]: List(),
  [SEARCH_RESULTS]: List(),
  [SELECTED_ENTITY_KEY_IDS]: Set(),
  [TOTAL_RESULTS]: 0
});

const updateEntitiesIdForNeighbors = (initEntitiesById, neighborLists) => {
  let entitiesById = initEntitiesById;
  neighborLists.forEach((neighborList) => {
    neighborList.forEach((neighborObj) => {
      const association = neighborObj.get('associationDetails', Map());
      const neighbor = neighborObj.get('neighborDetails', Map());
      if (association) {
        const associationEntityKeyId = getEntityKeyId(association);
        entitiesById = entitiesById.set(
          associationEntityKeyId,
          entitiesById.get(associationEntityKeyId, Map()).merge(association)
        );
      }
      if (neighbor) {
        const neighborEntityKeyId = getEntityKeyId(neighbor);
        entitiesById = entitiesById.set(
          neighborEntityKeyId,
          entitiesById.get(neighborEntityKeyId, Map()).merge(neighbor)
        );
      }
    });
  });

  return entitiesById;
};

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case geocodeAddress.case(action.type): {
      return geocodeAddress.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ADDRESSES, true).set(DONE_LOADING_ADDRESSES, false),
        SUCCESS: () => state.set(ADDRESS_SEARCH_RESULTS, fromJS(action.value)),
        FINALLY: () => state.set(IS_LOADING_ADDRESSES, false).set(DONE_LOADING_ADDRESSES, true)
      });
    }

    case searchAgencies.case(action.type): {
      return searchAgencies.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_AGENCIES, true).set(DONE_LOADING_AGENCIES, false),
        SUCCESS: () => state.set(AGENCY_SEARCH_RESULTS, fromJS(action.value)),
        FINALLY: () => state.set(IS_LOADING_AGENCIES, false).set(DONE_LOADING_AGENCIES, true)
      });
    }

    case loadEntityNeighbors.case(action.type): {
      return loadEntityNeighbors.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ENTITY_NEIGHBORS, true),
        SUCCESS: () => {
          const neighborsById = fromJS(action.value);

          const entitiesById = updateEntitiesIdForNeighbors(state.get(ENTITIES_BY_ID), neighborsById.valueSeq());

          return state
            .set(ENTITY_NEIGHBORS_BY_ID, state.get(ENTITY_NEIGHBORS_BY_ID).merge(neighborsById))
            .set(ENTITIES_BY_ID, entitiesById);
        },
        FINALLY: () => state.set(IS_LOADING_ENTITY_NEIGHBORS, false)
      });
    }

    case executeSearch.case(action.type): {
      return executeSearch.reducer(state, action, {
        REQUEST: () => state
          .set(IS_SEARCHING_DATA, true)
          .set(SEARCH_RESULTS, List())
          .set(TOTAL_RESULTS, 0)
          .set(DISPLAY_FULL_SEARCH_OPTIONS, false),
        SUCCESS: () => {
          const { hits, numHits } = action.value;
          const results = fromJS(hits);
          let entitiesById = state.get(ENTITIES_BY_ID);
          results.forEach((result) => {
            entitiesById = entitiesById.set(getEntityKeyId(result), result);
          });
          return state
            .set(SEARCH_RESULTS, results)
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
          .set(DISPLAY_FULL_SEARCH_OPTIONS, action.value)
          .setIn([SEARCH_PARAMETERS, SEARCH_ZONES], List())
          .set(IS_SEARCHING_DATA, false)
          .set(SEARCH_RESULTS, List())
          .set(TOTAL_RESULTS, 0);
      }
      return state.set(DISPLAY_FULL_SEARCH_OPTIONS, false);
    }

    case SELECT_ADDRESS:
      return state
        .setIn([SEARCH_PARAMETERS, LATITUDE], action.value.get('lat'))
        .setIn([SEARCH_PARAMETERS, LONGITUDE], action.value.get('lon'))
        .setIn([SEARCH_PARAMETERS, ADDRESS], action.value.get('display_name'));

    case SELECT_AGENCY:
      return state
        .setIn([SEARCH_PARAMETERS, DEPARTMENT], action.value.title)
        .setIn([SEARCH_PARAMETERS, DEPARTMENT_ID], action.value.id);

    case SELECT_ENTITY: {
      let selectedEntityKeyIds = Set();

      if (action.value) {
        selectedEntityKeyIds = selectedEntityKeyIds.add(action.value);
        let idsToMatch = Set().add(action.value);
        if (state.get(ENTITY_NEIGHBORS_BY_ID).has(action.value)) {
          state.getIn([ENTITY_NEIGHBORS_BY_ID, action.value], List()).forEach((neighborObj) => {
            const entityKeyId = getEntityKeyId(neighborObj.get('neighborDetails', Map()));
            if (entityKeyId) {
              selectedEntityKeyIds = selectedEntityKeyIds.add(entityKeyId);
              idsToMatch = idsToMatch.add(entityKeyId);
            }
          });
        }

        state.get(ENTITY_NEIGHBORS_BY_ID).entrySeq().forEach(([entityKeyId, neighborList]) => {
          neighborList.forEach((neighbor) => {
            if (idsToMatch.has(getEntityKeyId(neighbor.get('neighborDetails', Map())))) {
              selectedEntityKeyIds = selectedEntityKeyIds.add(entityKeyId);
            }
          });
        });
      }

      return state.set(SELECTED_ENTITY_KEY_IDS, selectedEntityKeyIds);
    }

    case SET_DRAW_MODE:
      return state.set(DRAW_MODE, action.value);

    case SET_FILTER:
      return state.set(FILTER, action.value);

    case UPDATE_SEARCH_PARAMETERS:
      return state.setIn([SEARCH_PARAMETERS, action.value.field], action.value.value);

    case CLEAR_EXPLORE_SEARCH_RESULTS:
    case UNMOUNT_EXPLORE:
      return state
        .set(DISPLAY_FULL_SEARCH_OPTIONS, true)
        .set(IS_LOADING_ENTITY_NEIGHBORS, false)
        .set(IS_SEARCHING_DATA, false)
        .set(SEARCH_RESULTS, List())
        .set(TOTAL_RESULTS, 0);

    default:
      return state;
  }
}

const isNum = num => !Number.isNaN(Number.parseFloat(num));

export function getSearchFields(search :Map<*, *>) {
  const searchFields = [];

  // Case number and search reason are required fields
  if (!search.get(CASE_NUMBER, '').length || !search.get(REASON, '').length) {
    return [];
  }

  // At least 2 fields of license plate / geo search / time range must be present
  let numRequiredFields = 0;

  if (search.get(PLATE, '').length >= 3) {
    searchFields.push(SEARCH_TYPES.PLATE);
    numRequiredFields += 1;
  }

  const start = moment(search.get(START, ''));
  const end = moment(search.get(END, ''));
  if (start.isValid() && end.isValid() && end.diff(start, 'years', true) <= 1) {
    searchFields.push(SEARCH_TYPES.TIME_RANGE);
    numRequiredFields += 1;
  }

  if (search.get(SEARCH_ZONES).length) {
    searchFields.push(SEARCH_TYPES.GEO_ZONES);
    numRequiredFields += 1;
  }
  else if (isNum(search.get(LATITUDE)) && isNum(search.get(LONGITUDE)) && isNum(search.get(RADIUS))) {
    searchFields.push(SEARCH_TYPES.GEO_RADIUS);
    numRequiredFields += 1;
  }

  if (numRequiredFields < 2) {
    return [];
  }


  // Additional optional search types
  if (search.get(DEPARTMENT_ID, '').length) {
    searchFields.push(SEARCH_TYPES.DEPARTMENT);
  }

  if (search.get(DEVICE, '').length) {
    searchFields.push(SEARCH_TYPES.DEVICE);
  }

  return searchFields;
}

export default reducer;
