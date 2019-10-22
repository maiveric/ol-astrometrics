/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

export const LOAD_APP :'LOAD_APP' = 'LOAD_APP';
export const loadApp :RequestSequence = newRequestSequence(LOAD_APP);

export const SWITCH_ORGANIZATION :'SWITCH_ORGANIZATION' = 'SWITCH_ORGANIZATION';
export const switchOrganization :RequestSequence = newRequestSequence(SWITCH_ORGANIZATION);

export const GET_OR_CREATE_USER_ID :'GET_OR_CREATE_USER_ID' = 'GET_OR_CREATE_USER_ID';
export const getOrCreateUserId :RequestSequence = newRequestSequence(GET_OR_CREATE_USER_ID);
