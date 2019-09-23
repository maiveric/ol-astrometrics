/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { QUALITY, DASHBOARD_WINDOWS } from '../../utils/constants/StateConstants';
import {
  loadQualityDashboardData,
  setQualityDashboardWindow,
  loadAgencies,
  loadQualityAgencyData,
  loadQualityDeviceData
} from './QualityActionFactory';

const {
  AGENCIES_BY_ID,
  DEVICES_BY_ID,
  DEVICES_BY_AGENCY,
  AGENCY_COUNTS,
  DEVICE_COUNTS,
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
  [DEVICES_BY_ID]: Map(),
  [DEVICES_BY_AGENCY]: Map(),
  [AGENCY_COUNTS]: Map(),
  [DEVICE_COUNTS]: Map(),
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
          .set(DEVICE_COUNTS, action.value.deviceCounts)
          .set(AGENCY_COUNTS, action.value.agencyCounts),
        FINALLY: () => state.set(IS_LOADING, false)
      });
    }

    case loadAgencies.case(action.type): {
      return loadAgencies.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_AGENCIES, true),
        SUCCESS: () => {
          const { agenciesById, devicesByAgency, devicesById } = action.value;
          return state
            .set(AGENCIES_BY_ID, agenciesById)
            .set(DEVICES_BY_ID, devicesById)
            .set(DEVICES_BY_AGENCY, devicesByAgency);
        },
        FINALLY: () => state.set(IS_LOADING_AGENCIES, false)
      });
    }

    case loadQualityAgencyData.case(action.type): {
      return loadQualityAgencyData.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_AGENCY_DATA, true),
        SUCCESS: () => state.set(AGENCY_COUNTS, action.value),
        FINALLY: () => state.set(IS_LOADING_AGENCY_DATA, false)
      });
    }

    case loadQualityDeviceData.case(action.type): {
      return loadQualityDeviceData.reducer(state, action, {
        REQUEST: () => state
          .set(IS_LOADING_DEVICE_DATA, true)
          .set(SELECTED_AGENCY_ID, action.value),
        SUCCESS: () => state.set(DEVICE_COUNTS, action.value),
        FINALLY: () => state.set(IS_LOADING_DEVICE_DATA, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
