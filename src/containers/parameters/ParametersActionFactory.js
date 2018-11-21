/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const EDIT_SEARCH_PARAMETERS :string = 'EDIT_SEARCH_PARAMETERS';
const editSearchParameters :RequestSequence = newRequestSequence(EDIT_SEARCH_PARAMETERS);

const GEOCODE_ADDRESS :string = 'GEOCODE_ADDRESS';
const geocodeAddress :RequestSequence = newRequestSequence(GEOCODE_ADDRESS);

const SEARCH_AGENCIES :string = 'SEARCH_AGENCIES';
const searchAgencies :RequestSequence = newRequestSequence(SEARCH_AGENCIES);

const SELECT_ADDRESS :string = 'SELECT_ADDRESS';
const selectAddress :RequestSequence = newRequestSequence(SELECT_ADDRESS);

const SELECT_AGENCY :string = 'SELECT_AGENCY';
const selectAgency :RequestSequence = newRequestSequence(SELECT_AGENCY);

const SET_DRAW_MODE :string = 'SET_DRAW_MODE';
const setDrawMode :RequestSequence = newRequestSequence(SET_DRAW_MODE);

const UPDATE_SEARCH_PARAMETERS :string = 'UPDATE_SEARCH_PARAMETERS';
const updateSearchParameters :RequestSequence = newRequestSequence(UPDATE_SEARCH_PARAMETERS);

export {
  EDIT_SEARCH_PARAMETERS,
  GEOCODE_ADDRESS,
  SEARCH_AGENCIES,
  SELECT_ADDRESS,
  SELECT_AGENCY,
  SET_DRAW_MODE,
  UPDATE_SEARCH_PARAMETERS,
  editSearchParameters,
  geocodeAddress,
  searchAgencies,
  selectAddress,
  selectAgency,
  setDrawMode,
  updateSearchParameters
};
