/*
 * @flow
 */

import moment from 'moment';
import { List, Map, fromJS } from 'immutable';

import { AUDIT, AUDIT_EVENT } from '../../utils/constants/StateConstants';
import {
  UPDATE_AUDIT_START,
  UPDATE_AUDIT_END,
  UPDATE_AUDIT_FILTER,
  loadAuditData
} from './AuditActionFactory';

const {
  IS_LOADING_RESULTS,
  RESULTS,
  FILTERED_RESULTS,
  START_DATE,
  END_DATE,
  FILTER
} = AUDIT;

const INITIAL_FILTERS = fromJS({
  [AUDIT_EVENT.PERSON_ID]: '',
  [AUDIT_EVENT.CASE_NUMBER]: '',
  [AUDIT_EVENT.REASON]: '',
  [AUDIT_EVENT.PLATE]: ''
});

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_RESULTS]: false,
  [RESULTS]: List(),
  [FILTERED_RESULTS]: List(),
  [START_DATE]: moment().subtract(2, 'weeks'),
  [END_DATE]: moment(),
  [FILTER]: INITIAL_FILTERS
});

const applyFilter = (results, filters) => {
  const activeFilters = filters.map(val => val.trim().toLowerCase()).filter(val => !!val);

  if (!activeFilters.size) {
    return results;
  }

  return results.filter(auditEvent => activeFilters
    .find((filter, field) => auditEvent.get(field, '').toLowerCase().includes(filter)));
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

    case UPDATE_AUDIT_START:
      return state.set(START_DATE, action.value);

    case UPDATE_AUDIT_END:
      return state.set(END_DATE, action.value);

    case UPDATE_AUDIT_FILTER: {
      const newFilters = state.get(FILTER).set(action.value.field, action.value.value);
      return state
        .set(FILTER, newFilters)
        .set(FILTERED_RESULTS, applyFilter(state.get(RESULTS), newFilters));
    }

    default:
      return state;
  }
}

export default reducer;
