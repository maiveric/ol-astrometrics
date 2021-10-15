/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import {
  loadQualityAgencyData,
  loadQualityDashboardData,
  setQualityDashboardWindow,
} from './QualityActionFactory';

import { DASHBOARD_WINDOWS, QUALITY } from '../../utils/constants/StateConstants';

const {
  AGENCIES_BY_ID,
  DEVICES_BY_AGENCY,
  AGENCY_COUNTS,
  SELECTED_AGENCY_ID,
  IS_LOADING_AGENCIES,
  IS_LOADING_AGENCY_DATA,
  IS_LOADING_DEVICE_DATA,
  IS_LOADING,
  DASHBOARD_DATA,
  DASHBOARD_WINDOW
} = QUALITY;

const INITIAL_STATE :Map<> = fromJS({
  [AGENCIES_BY_ID]: Map(),
  [DEVICES_BY_AGENCY]: Map(),
  [AGENCY_COUNTS]: Map(),
  [SELECTED_AGENCY_ID]: undefined,
  [IS_LOADING]: false,
  [IS_LOADING_AGENCIES]: false,
  [IS_LOADING_AGENCY_DATA]: false,
  [IS_LOADING_DEVICE_DATA]: false,
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
        SUCCESS: () => state
          .set(DASHBOARD_DATA, action.value.searches)
          .set(AGENCY_COUNTS, action.value.agencyCounts),
        FINALLY: () => state.set(IS_LOADING, false)
      });
    }

    case loadQualityAgencyData.case(action.type): {
      return loadQualityAgencyData.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_AGENCY_DATA, true),
        SUCCESS: () => state.set(AGENCY_COUNTS, action.value),
        FINALLY: () => state.set(IS_LOADING_AGENCY_DATA, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
