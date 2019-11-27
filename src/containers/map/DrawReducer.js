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

import { DRAW } from '../../utils/constants/StateConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  DISCARD_DRAW_ZONES,
  SET_DRAW_CONTROL,
  SET_DRAW_ZONES,
  TOGGLE_CREATE_NEW_MAP,
  EDIT_MAP_NAME,
  SELECT_MAP,
  saveMap,
  loadSavedMaps
} from './DrawActionFactory';

import { EXECUTE_SEARCH } from '../explore/ExploreActionFactory';

const {
  DRAW_CONTROL,
  DRAW_ZONES,

  NEW_MAP_NAME,
  IS_CREATING_MAP,
  IS_SAVING_MAP,
  SAVED_MAPS,
  SELECTED_MAP_ID
} = DRAW;

const INITIAL_STATE :Map<> = fromJS({
  [DRAW_CONTROL]: null,
  [DRAW_ZONES]: [],

  [IS_CREATING_MAP]: false,
  [IS_SAVING_MAP]: false,
  [NEW_MAP_NAME]: '',

  [SAVED_MAPS]: List(),
  [SELECTED_MAP_ID]: ''
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case SET_DRAW_CONTROL:
      return state.set(DRAW_CONTROL, action.value.draw);

    case EXECUTE_SEARCH:
    case DISCARD_DRAW_ZONES: {
      const drawControl = state.get(DRAW_CONTROL);
      if (drawControl) {
        drawControl.deleteAll();
      }
      return state.set(DRAW_ZONES, List());
    }

    case SET_DRAW_ZONES:
      return state.set(DRAW_ZONES, fromJS(Object.values(action.value)));

    case TOGGLE_CREATE_NEW_MAP:
      return state.set(IS_CREATING_MAP, action.value);

    case EDIT_MAP_NAME:
      return state.set(NEW_MAP_NAME, action.value);

    case SELECT_MAP:
      return state.set(SELECTED_MAP_ID, action.value);

    case saveMap.case(action.type): {
      return saveMap.reducer(state, action, {
        REQUEST: () => state.set(IS_SAVING_MAP, true),
        SUCCESS: () => state.set(SELECTED_MAP_ID, action.value),
        FINALLY: () => state.set(IS_SAVING_MAP, false)
      });
    }

    case loadSavedMaps.case(action.type): {
      return loadSavedMaps.reducer(state, action, {
        SUCCESS: () => state.set(SAVED_MAPS, action.value),
        FAILURE: () => state.set(SAVED_MAPS, List()),
      });
    }

    default:
      return state;
  }
}

export default reducer;
