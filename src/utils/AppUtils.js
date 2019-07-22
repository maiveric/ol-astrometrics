import { Map } from 'immutable';

import { STATE, APP } from './constants/StateConstants';

export const getAppFromState = state => state.get(STATE.APP, Map());

export const getSelectedOrganizationId = (app :Map) => app.get(APP.SELECTED_ORG_ID);

export const getEntitySetId = (app :Map, fqn :string) :string => app.getIn([
  APP.CONFIG_BY_ORG_ID,
  getSelectedOrganizationId(app),
  fqn
]);
