/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SUBMIT :string = 'CLEAR_SUBMIT';
const clearSubmit :RequestSequence = newRequestSequence(CLEAR_SUBMIT);

const DELETE_ENTITY :string = 'DELETE_ENTITY';
const deleteEntity :RequestSequence = newRequestSequence(DELETE_ENTITY);

const DELETE_ENTITIES :string = 'DELETE_ENTITIES';
const deleteEntities :RequestSequence = newRequestSequence(DELETE_ENTITIES);

const REPLACE_ENTITY :string = 'REPLACE_ENTITY';
const replaceEntity :RequestSequence = newRequestSequence(REPLACE_ENTITY);

const PARTIAL_REPLACE_ENTITY :string = 'PARTIAL_REPLACE_ENTITY';
const partialReplaceEntity :RequestSequence = newRequestSequence(PARTIAL_REPLACE_ENTITY);

const SUBMIT :string = 'SUBMIT';
const submit :RequestSequence = newRequestSequence(SUBMIT);

export {
  CLEAR_SUBMIT,
  DELETE_ENTITY,
  DELETE_ENTITIES,
  PARTIAL_REPLACE_ENTITY,
  REPLACE_ENTITY,
  SUBMIT,
  clearSubmit,
  deleteEntity,
  deleteEntities,
  partialReplaceEntity,
  replaceEntity,
  submit
};
