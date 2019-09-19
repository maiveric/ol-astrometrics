/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { QUALITY, DASHBOARD_WINDOWS } from '../../utils/constants/StateConstants';
import {
  loadQualityDashboardData,
  setQualityDashboardWindow
} from './QualityActionFactory';

const {
  IS_LOADING,
  DASHBOARD_DATA,
  DASHBOARD_WINDOW
} = QUALITY;

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING]: false,
  [DASHBOARD_DATA]: List(),
  [DASHBOARD_WINDOW]: DASHBOARD_WINDOWS.WEEK
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadQualityDashboardData.case(action.type): {
      return loadQualityDashboardData.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING, true),
        SUCCESS: () => state.set(DASHBOARD_DATA, action.value),
        FINALLY: () => state.set(IS_LOADING, false)
      });
    }

    case setQualityDashboardWindow.case(action.type): {
      return setQualityDashboardWindow.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING, true).set(DASHBOARD_WINDOW, action.value),
        SUCCESS: () => state.set(DASHBOARD_DATA, action.value),
        FINALLY: () => state.set(IS_LOADING, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
