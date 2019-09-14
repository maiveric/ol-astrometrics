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
  TOGGLE_REPORT_MODAL,
  SELECT_REPORT,
  SET_REPORT_VALUE,
  createReport,
  loadReports
} from './ReportActionFactory';

const {
  VEHICLE_ENTITY_KEY_IDS,

  IS_LOADING_REPORTS,
  REPORTS,
  REPORT_NEIGHBORS,
  SELECTED_REPORT,

  REPORT_MODAL_OPEN,
  NEW_REPORT_NAME,
  NEW_REPORT_CASE
} = REPORT;

const INITIAL_STATE :Map<> = fromJS({
  [VEHICLE_ENTITY_KEY_IDS]: Set(),

  [IS_LOADING_REPORTS]: false,
  [REPORTS]: Map(),
  [REPORT_NEIGHBORS]: Map(),
  [SELECTED_REPORT]: undefined,

  [REPORT_MODAL_OPEN]: false,
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
        SUCCESS: () => state.set(REPORTS, fromJS(action.value)),
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

    case TOGGLE_REPORT_MODAL:
      return state.set(REPORT_MODAL_OPEN, !!action.value);

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
