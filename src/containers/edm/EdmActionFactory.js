/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const LOAD_DATA_MODEL :string = 'LOAD_DATA_MODEL';
const loadDataModel :RequestSequence = newRequestSequence(LOAD_DATA_MODEL);

export {
  LOAD_DATA_MODEL,
  loadDataModel
};
