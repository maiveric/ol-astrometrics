/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CREATE_ALERT :string = 'CREATE_ALERT';
const createAlert :RequestSequence = newRequestSequence(CREATE_ALERT);

const EXPIRE_ALERT :string = 'EXPIRE_ALERT';
const expireAlert :RequestSequence = newRequestSequence(EXPIRE_ALERT);

const LOAD_ALERTS :string = 'LOAD_ALERTS';
const loadAlerts :RequestSequence = newRequestSequence(LOAD_ALERTS);

const SET_ALERT_VALUE :string = 'SET_ALERT_VALUE';
const setAlertValue :RequestSequence = newRequestSequence(SET_ALERT_VALUE);

const TOGGLE_ALERT_MODAL :string = 'TOGGLE_ALERT_MODAL';
const toggleAlertModal :RequestSequence = newRequestSequence(TOGGLE_ALERT_MODAL);

export {
  CREATE_ALERT,
  EXPIRE_ALERT,
  LOAD_ALERTS,
  SET_ALERT_VALUE,
  TOGGLE_ALERT_MODAL,
  createAlert,
  expireAlert,
  loadAlerts,
  setAlertValue,
  toggleAlertModal
};
