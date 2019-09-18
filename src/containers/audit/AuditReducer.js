/*
 * @flow
 */

import moment from 'moment';
import { List, Map, fromJS } from 'immutable';

import { AUDIT, AUDIT_EVENT, DASHBOARD_WINDOWS } from '../../utils/constants/StateConstants';
import {
  UPDATE_AUDIT_FILTER,
  UPDATE_AUDIT_END,
  UPDATE_AUDIT_START,
  RESET_FILTERS,
  applyFilters,
  setAuditDashboardWindow,
  loadAuditData,
  loadAuditDashboardData
} from './AuditActionFactory';

const {
  IS_LOADING_RESULTS,
  RESULTS,
  DASHBOARD_WINDOW,
  DASHBOARD_RESULTS,
  FILTERED_RESULTS,
  START_DATE,
  END_DATE,
  FILTER
} = AUDIT;

const INITIAL_FILTERS = fromJS({
  [AUDIT_EVENT.PERSON_ID]: '',
  [AUDIT_EVENT.CASE_NUMBER]: '',
  [AUDIT_EVENT.REASON]: '',
  [AUDIT_EVENT.PLATE]: '',
});

const getStartDate = () => moment().subtract(2, 'weeks').startOf('day');

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_RESULTS]: false,
  [RESULTS]: List(),
  [DASHBOARD_WINDOW]: DASHBOARD_WINDOWS.WEEK,
  [DASHBOARD_RESULTS]: List(),
  [FILTERED_RESULTS]: List(),
  [START_DATE]: getStartDate(),
  [END_DATE]: moment(),
  [FILTER]: INITIAL_FILTERS
});

const applyFilter = (results, filters) => {
  const activeFilters = filters.map(val => val.trim().toLowerCase()).filter(val => !!val);

  if (!activeFilters.size) {
    return results;
  }

  /* Filter to audit events where there are no filters that don't match the values */
  return results.filter(auditEvent => !activeFilters
    .find((filter, field) => !auditEvent.get(field, '').toLowerCase().includes(filter)));
};

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadAuditData.case(action.type): {
      return loadAuditData.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_RESULTS, true),
        SUCCESS: () => state
          .set(RESULTS, action.value)
          .set(FILTERED_RESULTS, applyFilter(action.value, state.get(FILTER))),
        FINALLY: () => state.set(IS_LOADING_RESULTS, false)
      });
    }

    case loadAuditDashboardData.case(action.type): {
      return loadAuditDashboardData.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_RESULTS, true),
        SUCCESS: () => state.set(DASHBOARD_RESULTS, action.value),
        FINALLY: () => state.set(IS_LOADING_RESULTS, false)
      });
    }

    case setAuditDashboardWindow.case(action.type): {
      return setAuditDashboardWindow.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_RESULTS, true).set(DASHBOARD_WINDOW, action.value),
        SUCCESS: () => state.set(DASHBOARD_RESULTS, action.value),
        FINALLY: () => state.set(IS_LOADING_RESULTS, false)
      });
    }

    case applyFilters.case(action.type): {
      return applyFilters.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_RESULTS, true),
        SUCCESS: () => state
          .set(RESULTS, action.value)
          .set(FILTERED_RESULTS, applyFilter(action.value, state.get(FILTER))),
        FINALLY: () => state.set(IS_LOADING_RESULTS, false)
      });
    }

    case UPDATE_AUDIT_START:
      return state.set(START_DATE, moment(action.value));

    case UPDATE_AUDIT_END:
      return state.set(END_DATE, moment(action.value));

    case UPDATE_AUDIT_FILTER: {
      const newFilters = state.get(FILTER).set(action.value.field, action.value.value);
      return state.set(FILTER, newFilters);
    }

    case RESET_FILTERS:
      return state
        .set(FILTER, INITIAL_FILTERS)
        .set(START_DATE, getStartDate())
        .set(END_DATE, moment());

    default:
      return state;
  }
}

export default reducer;
