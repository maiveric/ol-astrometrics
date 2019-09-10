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

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_RESULTS]: false,
  [RESULTS]: List(),
  [FILTERED_RESULTS]: List(),
  [START_DATE]: moment().subtract(2, 'weeks'),
  [END_DATE]: moment(),
  [FILTER]: ''
});

const applyFilter = (results, initialFilter) => results.filter((auditEvent) => {

  const filter = initialFilter.trim().toLowerCase();

  if (!filter) {
    return results;
  }

  const personId = auditEvent.get(AUDIT_EVENT.PERSON_ID, '').toLowerCase();
  const caseNumber = auditEvent.get(AUDIT_EVENT.CASE_NUMBER, '').toLowerCase();
  const reason = auditEvent.get(AUDIT_EVENT.REASON, '').toLowerCase(); // TODO do we want to filter on reason?
  const plate = auditEvent.get(AUDIT_EVENT.PLATE, '').toLowerCase();

  return personId.includes(filter) || caseNumber.includes(filter) || reason.includes(filter) || plate.includes(filter);
});

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

    case UPDATE_AUDIT_FILTER:
      return state
        .set(FILTER, action.value.toLowerCase())
        .set(FILTERED_RESULTS, applyFilter(state.get(RESULTS), action.value));

    default:
      return state;
  }
}

export default reducer;
