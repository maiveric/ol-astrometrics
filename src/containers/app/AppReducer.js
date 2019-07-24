/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import isNumber from 'lodash/isNumber';
import type { SequenceAction } from 'redux-reqseq';
import { AccountUtils } from 'lattice-auth';

import { loadApp, SWITCH_ORGANIZATION } from './AppActions';

import { APP_TYPES } from '../../utils/constants/DataModelConstants';
import { APP } from '../../utils/constants/StateConstants';

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    loadApp: Map(),
  },
  errors: {
    loadApp: Map(),
  },
  isLoadingApp: false,
  [APP.SELECTED_ORG_ID]: undefined,
  [APP.SETTINGS_BY_ORG_ID]: Map(),
  [APP.CONFIG_BY_ORG_ID]: Map(),
  [APP.ORGS_BY_ID]: Map()
});

export default function appReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case loadApp.case(action.type): {
      return loadApp.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isLoadingApp', true)
            .setIn(['actions', 'loadApp', seqAction.id], fromJS(seqAction));
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = (action :any);
          if (!state.hasIn(['actions', 'loadApp', seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }


          const { appConfigs } = value;

          let newState :Map<*, *> = state;

          let entitySetsByOrgId = Map();
          let configByOrgId = Map();
          let orgsById = Map();

          appConfigs.forEach((appConfig :Object) => {

            const { organization } :Object = appConfig;
            const orgId :string = organization.id;

            if (fromJS(appConfig.config).size) {

              orgsById = orgsById.set(orgId, fromJS(organization));

              Object.values(APP_TYPES).forEach((fqn) => {

                const { entitySetId } = appConfig.config[fqn];

                newState = newState.setIn(
                  [fqn, APP.ENTITY_SETS_BY_ORG, orgId],
                  entitySetId
                );
                configByOrgId = configByOrgId.set(
                  orgId,
                  configByOrgId.get(orgId, Map()).set(fqn, entitySetId)
                );
                entitySetsByOrgId = entitySetsByOrgId.set(
                  orgId,
                  entitySetsByOrgId.get(orgId, Map()).set(entitySetId, fqn)
                );
              });
            }
          });

          let selectedOrg = AccountUtils.retrieveOrganizationId();

          if ((!selectedOrg && appConfigs.length > 0) || !orgsById.has(selectedOrg)) {
            selectedOrg = appConfigs[0].organization.id;
          }

          return newState
            .set(APP.CONFIG_BY_ORG_ID, configByOrgId)
            .set(APP.ORGS_BY_ID, orgsById)
            .set(APP.SELECTED_ORG_ID, selectedOrg);
        },
        FAILURE: () => {

          const seqAction :SequenceAction = (action :any);
          const error = {};

          /*
           * value is expected to be an error object. for lattice-sagas / lattice-js, the error object is expected
           * to be the Axios error object. for more info:
           *   https://github.com/axios/axios#handling-errors
           */
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            // for now, we only care about the HTTP status code. we can get more fancy later on.
            error.status = axiosError.response.status;
          }

          // TODO: there's probably a significantly better way of handling errors
          return state.setIn(['errors', 'loadApp'], fromJS(error));
        },
        FINALLY: () => {
          const seqAction :SequenceAction = (action :any);
          return state
            .set('isLoadingApp', false)
            .deleteIn(['actions', 'loadApp', seqAction.id]);
        }
      });
    }

    case SWITCH_ORGANIZATION:
      return state.set(APP.SELECTED_ORG_ID, action.value);

    default:
      return state;
  }
}
