/*
 * @flow
 */

import moment from 'moment';
import { List, Map, fromJS } from 'immutable';

import { AUDIT } from '../../utils/constants/StateConstants';
import {
  UPDATE_AUDIT_START,
  UPDATE_AUDIT_END,
  UPDATE_AUDIT_FILTER,
  loadAuditData
} from './AuditActionFactory';

const {
  IS_LOADING_RESULTS,
  RESULTS,
  START_DATE,
  END_DATE,
  FILTER
} = AUDIT;

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_RESULTS]: false,
  [RESULTS]: List(),
  [START_DATE]: moment().subtract(2, 'weeks'),
  [END_DATE]: moment(),
  [FILTER]: ''
});

// const applyFilter = (results, )

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadAuditData.case(action.type): {
      return loadAuditData.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_RESULTS, true),
        SUCCESS: () => state.set(RESULTS, action.value),
        FINALLY: () => state.set(IS_LOADING_RESULTS, false)
      });
    }

    case UPDATE_AUDIT_START:
      return state.set(START_DATE, action.value);

    case UPDATE_AUDIT_END:
      return state.set(END_DATE, action.value);

    case UPDATE_AUDIT_FILTER:
      return state.set(FILTER, action.value);

    default:
      return state;
  }
}

export default reducer;
