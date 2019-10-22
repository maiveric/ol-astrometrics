/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_EXPLORE_SEARCH_RESULTS :string = 'CLEAR_EXPLORE_SEARCH_RESULTS';
const clearExploreSearchResults :RequestSequence = newRequestSequence(CLEAR_EXPLORE_SEARCH_RESULTS);

const EXECUTE_SEARCH :string = 'EXECUTE_SEARCH';
const executeSearch :RequestSequence = newRequestSequence(EXECUTE_SEARCH);

const LOAD_ENTITY_NEIGHBORS :string = 'LOAD_ENTITY_NEIGHBORS';
const loadEntityNeighbors :RequestSequence = newRequestSequence(LOAD_ENTITY_NEIGHBORS);

const SELECT_BREADCRUMB :string = 'SELECT_BREADCRUMB';
const selectBreadcrumb :RequestSequence = newRequestSequence(SELECT_BREADCRUMB);

const SELECT_ENTITY :string = 'SELECT_ENTITY';
const selectEntity :RequestSequence = newRequestSequence(SELECT_ENTITY);

const SET_FILTER :string = 'SET_FILTER';
const setFilter :RequestSequence = newRequestSequence(SET_FILTER);

const UNMOUNT_EXPLORE :string = 'UNMOUNT_EXPLORE';
const unmountExplore :RequestSequence = newRequestSequence(UNMOUNT_EXPLORE);

export const SELECT_READS_FOR_REPORT :string = 'SELECT_READS_FOR_REPORT';
export const selectReadsForReport :RequestSequence = newRequestSequence(SELECT_READS_FOR_REPORT);

export const DESELECT_READS_FOR_REPORT :string = 'DESELECT_READS_FOR_REPORT';
export const deselectReadsForReport :RequestSequence = newRequestSequence(DESELECT_READS_FOR_REPORT);

export {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  EXECUTE_SEARCH,
  LOAD_ENTITY_NEIGHBORS,
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  SET_FILTER,
  UNMOUNT_EXPLORE,
  clearExploreSearchResults,
  executeSearch,
  loadEntityNeighbors,
  selectBreadcrumb,
  selectEntity,
  setFilter,
  unmountExplore
};
