/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_ALERTS :string = 'LOAD_ALERTS';
const loadAlerts :RequestSequence = newRequestSequence(LOAD_ALERTS);

const SET_ALERT_VALUE :string = 'SET_ALERT_VALUE';
const setAlertValue :RequestSequence = newRequestSequence(SET_ALERT_VALUE);

const TOGGLE_ALERT_MODAL :string = 'TOGGLE_ALERT_MODAL';
const toggleAlertModal :RequestSequence = newRequestSequence(TOGGLE_ALERT_MODAL);

export {
  LOAD_ALERTS,
  SET_ALERT_VALUE,
  TOGGLE_ALERT_MODAL,
  loadAlerts,
  setAlertValue,
  toggleAlertModal
};
