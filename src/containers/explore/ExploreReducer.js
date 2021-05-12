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
  loadEntityNeighbors,
  loadHotlistPlates
} from './ExploreActionFactory';

import { EDIT_SEARCH_PARAMETERS } from '../parameters/ParametersActionFactory';

const {
  ENTITY_NEIGHBORS_BY_ID,
  ENTITIES_BY_ID,
  FILTER,
  HOTLIST_PLATES,
  IS_LOADING_ENTITY_NEIGHBORS,
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
  [ENTITY_NEIGHBORS_BY_ID]: Map(),
  [ENTITIES_BY_ID]: Map(),
  [FILTER]: '',
  [HOTLIST_PLATES]: Set(),
  [IS_LOADING_ENTITY_NEIGHBORS]: false,
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

const getSelectedDataFromNeighbors = (state, data, vehiclesEntitySetId) => {
  const readEntityKeyId = data;

  let selectedEntityKeyIds = Set();
  let idsToMatch = Set.of(readEntityKeyId);
  let selectedReadId = readEntityKeyId;

  state.getIn([ENTITY_NEIGHBORS_BY_ID, readEntityKeyId], List()).forEach((neighborObj) => {
    if (neighborObj.getIn(['neighborEntitySet', 'id']) === vehiclesEntitySetId) {
      const entityKeyId = getEntityKeyId(neighborObj.get('neighborDetails') || Map());
      if (entityKeyId) {
        idsToMatch = idsToMatch.add(entityKeyId);
      }
    }
  });

  state.get(ENTITY_NEIGHBORS_BY_ID).entrySeq().forEach(([entityKeyId, neighborList]) => {
    neighborList.forEach((neighbor) => {
      if (idsToMatch.has(getEntityKeyId(neighbor.get('neighborDetails') || Map()))) {
        selectedEntityKeyIds = selectedEntityKeyIds.add(entityKeyId);
      }
    });
  });

  if (selectedEntityKeyIds.size && !selectedEntityKeyIds.has(selectedReadId)) {
    selectedReadId = selectedEntityKeyIds.first();
  }

  return { selectedEntityKeyIds, selectedReadId };
}

const getSeletedDataFromSearchResults = (state, data) => {
  let selectedEntityKeyIds = Set();
  const plate = data;

  state.get(SEARCH_RESULTS).filter((result) => getPlate(result) === plate).forEach(result => {
    selectedEntityKeyIds = selectedEntityKeyIds.add(getEntityKeyId(result));
  });

  const selectedReadId = selectedEntityKeyIds.first();

  return { selectedEntityKeyIds, selectedReadId };
}

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
          const { results, vehicleEntitySetId } = action.value;
          const { hits, numHits } = results;
          const reads = fromJS(hits);
          let entitiesById = state.get(ENTITIES_BY_ID);
          reads.forEach((result) => {
            entitiesById = entitiesById.set(getEntityKeyId(result), result);
          });

          let neighborsById = Map();
          reads.forEach((result) => {
            const plate = getPlate(result);
            neighborsById = neighborsById.set(getEntityKeyId(result), fromJS([{
              'neighborEntitySet': {
                'id': vehicleEntitySetId
              },
              'neighborDetails': {
                [PROPERTY_TYPES.PLATE]: [plate],
                [PROPERTY_TYPES.ID]: [plate],
                'openlattice.@id': [plate],
                isIntermediate: true
              }
            }]));
          });
          return state
            .set(SEARCH_RESULTS, reads)
            .set(ENTITIES_BY_ID, entitiesById)
            .set(TOTAL_RESULTS, numHits)
            .set(ENTITY_NEIGHBORS_BY_ID, neighborsById);
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
      const { data, vehiclesEntitySetId, isIntermediate } = action.value;

      let selectedEntityKeyIds = Set();
      let selectedReadId = undefined;

      if (data) {
        ({ selectedEntityKeyIds, selectedReadId } = isIntermediate
          ? getSeletedDataFromSearchResults(state, data, vehiclesEntitySetId)
          : getSelectedDataFromNeighbors(state, data, vehiclesEntitySetId))
      }

      let newState = state
        .set(SELECTED_ENTITY_KEY_IDS, selectedEntityKeyIds)
        .set(SELECTED_READ_ID, selectedReadId);

      if (!selectedReadId) {
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
        .set(IS_LOADING_ENTITY_NEIGHBORS, false)
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
