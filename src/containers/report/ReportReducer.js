/*
 * @flow
 */

import {
  Map,
  Set,
  fromJS
} from 'immutable';

import { REPORT } from '../../utils/constants/StateConstants';
import { CLEAR_EXPLORE_SEARCH_RESULTS, UNMOUNT_EXPLORE } from '../explore/ExploreActionFactory';
import {
  ADD_VEHICLE_TO_REPORT,
  REMOVE_VEHICLE_FROM_REPORT
} from './ReportActionFactory';

const {
  VEHICLE_ENTITY_KEY_IDS
} = REPORT;

const INITIAL_STATE :Map<> = fromJS({
  [VEHICLE_ENTITY_KEY_IDS]: Set()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case ADD_VEHICLE_TO_REPORT:
      return state.set(VEHICLE_ENTITY_KEY_IDS, state.get(VEHICLE_ENTITY_KEY_IDS).add(action.value));

    case REMOVE_VEHICLE_FROM_REPORT:
      return state.set(VEHICLE_ENTITY_KEY_IDS, state.get(VEHICLE_ENTITY_KEY_IDS).delete(action.value));

    case CLEAR_EXPLORE_SEARCH_RESULTS:
    case UNMOUNT_EXPLORE:
      return state.set(VEHICLE_ENTITY_KEY_IDS, Set());

    default:
      return state;
  }
}

export default reducer;
