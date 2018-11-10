/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_EXPLORE_SEARCH_RESULTS :string = 'CLEAR_EXPLORE_SEARCH_RESULTS';
const clearExploreSearchResults :RequestSequence = newRequestSequence(CLEAR_EXPLORE_SEARCH_RESULTS);

const EDIT_SEARCH_PARAMETERS :string = 'EDIT_SEARCH_PARAMETERS';
const editSearchParameters :RequestSequence = newRequestSequence(EDIT_SEARCH_PARAMETERS);

const EXECUTE_SEARCH :string = 'EXECUTE_SEARCH';
const executeSearch :RequestSequence = newRequestSequence(EXECUTE_SEARCH);

const GEOCODE_ADDRESS :string = 'GEOCODE_ADDRESS';
const geocodeAddress :RequestSequence = newRequestSequence(GEOCODE_ADDRESS);

const LOAD_ENTITY_NEIGHBORS :string = 'LOAD_ENTITY_NEIGHBORS';
const loadEntityNeighbors :RequestSequence = newRequestSequence(LOAD_ENTITY_NEIGHBORS);

const SEARCH_AGENCIES :string = 'SEARCH_AGENCIES';
const searchAgencies :RequestSequence = newRequestSequence(SEARCH_AGENCIES);

const SELECT_ADDRESS :string = 'SELECT_ADDRESS';
const selectAddress :RequestSequence = newRequestSequence(SELECT_ADDRESS);

const SELECT_AGENCY :string = 'SELECT_AGENCY';
const selectAgency :RequestSequence = newRequestSequence(SELECT_AGENCY);

const SELECT_BREADCRUMB :string = 'SELECT_BREADCRUMB';
const selectBreadcrumb :RequestSequence = newRequestSequence(SELECT_BREADCRUMB);

const SELECT_ENTITY :string = 'SELECT_ENTITY';
const selectEntity :RequestSequence = newRequestSequence(SELECT_ENTITY);

const SET_DRAW_MODE :string = 'SET_DRAW_MODE';
const setDrawMode :RequestSequence = newRequestSequence(SET_DRAW_MODE);

const SET_FILTER :string = 'SET_FILTER';
const setFilter :RequestSequence = newRequestSequence(SET_FILTER);

const UNMOUNT_EXPLORE :string = 'UNMOUNT_EXPLORE';
const unmountExplore :RequestSequence = newRequestSequence(UNMOUNT_EXPLORE);

const UPDATE_SEARCH_PARAMETERS :string = 'UPDATE_SEARCH_PARAMETERS';
const updateSearchParameters :RequestSequence = newRequestSequence(UPDATE_SEARCH_PARAMETERS);

export {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  EDIT_SEARCH_PARAMETERS,
  EXECUTE_SEARCH,
  GEOCODE_ADDRESS,
  LOAD_ENTITY_NEIGHBORS,
  SEARCH_AGENCIES,
  SELECT_ADDRESS,
  SELECT_AGENCY,
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  SET_DRAW_MODE,
  SET_FILTER,
  UNMOUNT_EXPLORE,
  UPDATE_SEARCH_PARAMETERS,
  clearExploreSearchResults,
  editSearchParameters,
  executeSearch,
  geocodeAddress,
  loadEntityNeighbors,
  searchAgencies,
  selectAddress,
  selectAgency,
  selectBreadcrumb,
  selectEntity,
  setDrawMode,
  setFilter,
  unmountExplore,
  updateSearchParameters
};
