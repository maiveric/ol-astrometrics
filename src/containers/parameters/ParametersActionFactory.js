/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_SEARCH_PARAMETERS :string = 'EDIT_SEARCH_PARAMETERS';
const editSearchParameters :RequestSequence = newRequestSequence(EDIT_SEARCH_PARAMETERS);

const GEOCODE_ADDRESS :string = 'GEOCODE_ADDRESS';
const geocodeAddress :RequestSequence = newRequestSequence(GEOCODE_ADDRESS);

const LOAD_DEPARTMENTS_AND_DEVICES :string = 'LOAD_DEPARTMENTS_AND_DEVICES';
const loadDepartmentsAndDevices :RequestSequence = newRequestSequence(LOAD_DEPARTMENTS_AND_DEVICES);

const SELECT_ADDRESS :string = 'SELECT_ADDRESS';
const selectAddress :RequestSequence = newRequestSequence(SELECT_ADDRESS);

const SET_DRAW_MODE :string = 'SET_DRAW_MODE';
const setDrawMode :RequestSequence = newRequestSequence(SET_DRAW_MODE);

const UPDATE_SEARCH_PARAMETERS :string = 'UPDATE_SEARCH_PARAMETERS';
const updateSearchParameters :RequestSequence = newRequestSequence(UPDATE_SEARCH_PARAMETERS);

export {
  EDIT_SEARCH_PARAMETERS,
  GEOCODE_ADDRESS,
  LOAD_DEPARTMENTS_AND_DEVICES,
  SELECT_ADDRESS,
  SET_DRAW_MODE,
  UPDATE_SEARCH_PARAMETERS,
  editSearchParameters,
  geocodeAddress,
  loadDepartmentsAndDevices,
  selectAddress,
  setDrawMode,
  updateSearchParameters
};
