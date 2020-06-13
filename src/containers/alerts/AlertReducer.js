/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { ALERTS } from '../../utils/constants/StateConstants';
import {
  SET_ALERT_VALUE,
  TOGGLE_ALERT_MODAL,
  createAlert,
  loadAlerts
} from './AlertActionFactory';

import {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  UNMOUNT_EXPLORE
} from '../explore/ExploreActionFactory';

const {
  ALERT_LIST,
  ALERT_MODAL_OPEN,
  IS_LOADING_ALERTS,
  PLATE,
  EXPIRATION,
  CASE_NUMBER,
  SEARCH_REASON,
  ADDITIONAL_EMAILS
} = ALERTS;

const INITIAL_STATE :Map<> = fromJS({
  [ALERT_LIST]: List(),
  [ALERT_MODAL_OPEN]: false,
  [IS_LOADING_ALERTS]: false,
  [PLATE]: '',
  [EXPIRATION]: '',
  [CASE_NUMBER]: '',
  [SEARCH_REASON]: '',
  [ADDITIONAL_EMAILS]: ''
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case createAlert.case(action.type): {
      return createAlert.reducer(state, action, {
        FINALLY: () => state.set(ALERT_MODAL_OPEN, false)
      });
    }

    case loadAlerts.case(action.type): {
      return loadAlerts.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ALERTS, true),
        SUCCESS: () => state.set(ALERT_LIST, fromJS(action.value)),
        FAILURE: () => state.set(ALERT_LIST, List()),
        FINALLY: () => state.set(IS_LOADING_ALERTS, false)
      });
    }

    case SET_ALERT_VALUE: {
      const { field, value } = action.value;
      return state.set(field, value);
    }

    case TOGGLE_ALERT_MODAL:
      return state.set(ALERT_MODAL_OPEN, !!action.value);

    case CLEAR_EXPLORE_SEARCH_RESULTS:
    case UNMOUNT_EXPLORE: {
      return INITIAL_STATE.set(ALERT_LIST, state.get(ALERT_LIST));
    }

    default:
      return state;
  }
}


export default reducer;
