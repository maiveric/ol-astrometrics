/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SEARCH_ENTITY_SETS :string = 'SEARCH_ENTITY_SETS';
const searchEntitySets :RequestSequence = newRequestSequence(SEARCH_ENTITY_SETS);

const SELECT_ENTITY_SET :string = 'SELECT_ENTITY_SET';
const selectEntitySet :RequestSequence = newRequestSequence(SELECT_ENTITY_SET);

export {
  SEARCH_ENTITY_SETS,
  SELECT_ENTITY_SET,
  searchEntitySets,
  selectEntitySet
};
