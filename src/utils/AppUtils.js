import { Map, Set } from 'immutable';

import {
  STATE,
  APP,
  EDM,
  EXPLORE,
  SEARCH_PARAMETERS
} from './constants/StateConstants';

export const getAppFromState = state => state.get(STATE.APP, Map());
export const getEdmFromState = state => state.get(STATE.EDM, Map());
export const getAuditFromState = state => state.get(STATE.AUDIT, Map());
export const getQualityFromState = state => state.get(STATE.QUALITY, Map());
export const getParamsFromState = state => state.getIn([STATE.PARAMETERS, SEARCH_PARAMETERS.SEARCH_PARAMETERS], Map());
export const getDrawFromState = state => state.get(STATE.DRAW, Map());

export const getSelectedOrganizationId = (app :Map) => app.get(APP.SELECTED_ORG_ID);

export const getEntitySetId = (app :Map, fqn :string) :string => app.getIn([
  APP.CONFIG_BY_ORG_ID,
  getSelectedOrganizationId(app),
  fqn
]);

export const getPropertyTypeId = (state :Map, fqn :string) => state.getIn([
  STATE.EDM,
  EDM.PROPERTY_TYPES,
  fqn,
  'id'
]);

export const getUserIdFromState = app => app.get(APP.SELF_ENTITY_KEY_ID);

export const getHotlistFromState = state => state.getIn([STATE.EXPLORE, EXPLORE.HOTLIST_PLATES], Set());
