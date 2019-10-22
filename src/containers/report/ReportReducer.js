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
  REMOVE_VEHICLE_FROM_REPORT,
  TOGGLE_ADD_READS_TO_REPORT_MODAL,
  TOGGLE_REPORT_MODAL,
  TOGGLE_RENAME_REPORT_MODAL,
  TOGGLE_DELETE_REPORT_MODAL,
  TOGGLE_DELETE_READS_MODAL,
  SELECT_REPORT,
  SET_REPORT_VALUE,
  createReport,
  loadReports
} from './ReportActionFactory';

const {
  VEHICLE_ENTITY_KEY_IDS,

  IS_LOADING_REPORTS,
  REPORTS,
  READS_BY_REPORT,
  SELECTED_REPORT,

  ADD_READS_TO_REPORT_MODAL_OPEN,
  REPORT_MODAL_OPEN,
  RENAME_REPORT_MODAL_OPEN,
  NEW_REPORT_NAME,
  NEW_REPORT_CASE,
  REPORT_TO_DELETE,
  READS_TO_DELETE,
  IS_REMOVING_ENTIRE_VEHICLE
} = REPORT;

const INITIAL_STATE :Map<> = fromJS({
  [VEHICLE_ENTITY_KEY_IDS]: Set(),

  [IS_LOADING_REPORTS]: false,
  [REPORTS]: Map(),
  [READS_BY_REPORT]: Map(),
  [SELECTED_REPORT]: undefined,

  [REPORT_MODAL_OPEN]: false,
  [RENAME_REPORT_MODAL_OPEN]: undefined,
  [REPORT_TO_DELETE]: undefined,
  [READS_TO_DELETE]: Set(),
  [IS_REMOVING_ENTIRE_VEHICLE]: false,
  [NEW_REPORT_NAME]: '',
  [NEW_REPORT_CASE]: ''
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case createReport.case(action.type): {
      return createReport.reducer(state, action, {
        FINALLY: () => state.set(REPORT_MODAL_OPEN, false)
      });
    }

    case loadReports.case(action.type): {
      return loadReports.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_REPORTS, true),
        SUCCESS: () => {
          const { reports, readsByReport } = action.value;
          return state.set(REPORTS, reports).set(READS_BY_REPORT, readsByReport);
        },
        FAILURE: () => state.set(REPORTS, Map()),
        FINALLY: () => state.set(IS_LOADING_REPORTS, false)
      });
    }

    case SET_REPORT_VALUE: {
      const { field, value } = action.value;
      return state.set(field, value);
    }

    case SELECT_REPORT:
      return state.set(SELECTED_REPORT, action.value);

    case TOGGLE_ADD_READS_TO_REPORT_MODAL:
      return state.set(ADD_READS_TO_REPORT_MODAL_OPEN, !!action.value);

    case TOGGLE_REPORT_MODAL:
      return state.set(REPORT_MODAL_OPEN, !!action.value);

    case TOGGLE_RENAME_REPORT_MODAL:
      return state.set(RENAME_REPORT_MODAL_OPEN, action.value);

    case TOGGLE_DELETE_REPORT_MODAL:
      return state.set(REPORT_TO_DELETE, action.value);

    case TOGGLE_DELETE_READS_MODAL: {
      if (!action.value) {
        return state.set(IS_REMOVING_ENTIRE_VEHICLE, false).set(READS_TO_DELETE, Set());
      }
      return state
        .set(IS_REMOVING_ENTIRE_VEHICLE, !!action.value.isVehicle)
        .set(READS_TO_DELETE, action.value.entityKeyIds);
    }

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
