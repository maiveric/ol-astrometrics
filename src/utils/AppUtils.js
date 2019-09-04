import { Map } from 'immutable';

import { STATE, APP, SEARCH_PARAMETERS } from './constants/StateConstants';

export const getAppFromState = state => state.get(STATE.APP, Map());
export const getParamsFromState = state => state.getIn([STATE.PARAMETERS, SEARCH_PARAMETERS.SEARCH_PARAMETERS], Map());
export const getDrawFromState = state => state.get(STATE.DRAW, Map());

export const getSelectedOrganizationId = (app :Map) => app.get(APP.SELECTED_ORG_ID);

export const getEntitySetId = (app :Map, fqn :string) :string => app.getIn([
  APP.CONFIG_BY_ORG_ID,
  getSelectedOrganizationId(app),
  fqn
]);
