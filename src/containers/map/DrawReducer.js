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
  SET_DRAW_CONTROL
} from './DrawActionFactory';

const {
  DRAW_CONTROL,
  DRAW_ZONES
} = DRAW;

const INITIAL_STATE :Map<> = fromJS({
  [DRAW_CONTROL]: null,
  [DRAW_ZONES]: []
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case SET_DRAW_CONTROL:
      return state.set(DRAW_CONTROL, action.value);

    case DISCARD_DRAW_ZONES: {
      const drawControl = state.get(DRAW_CONTROL);
      if (drawControl) {
        drawControl.deleteAll();
      }
      return state;
    }

    default:
      return state;
  }
}

export default reducer;
