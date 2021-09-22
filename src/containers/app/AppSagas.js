/*
 * @flow
 */

/* eslint-disable no-use-before-define */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { AuthActions, AccountUtils, AuthUtils } from 'lattice-auth';
import { Map, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import {
  AppApiActions,
  AppApiSagas
} from 'lattice-sagas';
import {
  SearchApi,
  DataApi,
  EntityDataModelApi,
  AuthorizationApi,
  Constants
} from 'lattice';

import Logger from '../../utils/Logger';
import { clearCookies } from '../../utils/CookieUtils';
import { getAppFromState, getEntitySetId } from '../../utils/AppUtils';
import { getFqnObj, getSearchTerm } from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP_NAME, APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { APP } from '../../utils/constants/StateConstants';
import {
  GET_OR_CREATE_USER_ID,
  LOAD_APP,
  SWITCH_ORGANIZATION,
  getOrCreateUserId,
  loadApp,
  switchOrganization
} from './AppActions';

const {
  OPENLATTICE_ID_FQN
} = Constants;

const { getApp, getAppConfigs } = AppApiActions;
const { getAppWorker, getAppConfigsWorker } = AppApiSagas;

const LOG = new Logger('AppSagas');

export const getAuth0Id = () => {
  const { id } = AuthUtils.getUserInfo() || {};
  return id;
};

function* getOrCreateUserIdForEntitySet(userEntitySetId) :Generator<*, *, *> {
  try {
    const userId = getAuth0Id();

    const personIdPropertyTypeId = yield call(
      EntityDataModelApi.getPropertyTypeId,
      getFqnObj(PROPERTY_TYPES.PERSON_ID)
    );

    const userSearchResults = yield call(SearchApi.searchEntitySetData, userEntitySetId, {
      searchTerm: getSearchTerm(personIdPropertyTypeId, userId),
      start: 0,
      maxHits: 1
    });

    /* If the user entity already exists, return its id from the search result */
    if (userSearchResults.hits.length) {
      return userSearchResults.hits[0][OPENLATTICE_ID_FQN][0];
    }

    /* Otherwise, create a new entity and return its id */
    const idList = yield call(DataApi.createOrMergeEntityData, userEntitySetId, [
      { [personIdPropertyTypeId]: [userId] }
    ]);
    return idList[0];

  }
  catch (error) {
    console.error('Unable to get or create user id');
    console.error(error);
    return undefined;
  }
}

function* checkIfAdmin(searchesEntitySetId) :Generator<*, *, *> {
  try {

    // $FlowFixMe
    const [{ permissions }] = yield call(AuthorizationApi.checkAuthorizations, [{
      aclKey: [searchesEntitySetId],
      permissions: ['OWNER']
    }]);

    return permissions.OWNER;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}

function* getOrCreateUserIdWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getOrCreateUserId.request(action.id));

    const app = yield select(getAppFromState);
    const userEntitySetId = getEntitySetId(app, APP_TYPES.USERS);
    const userId = yield call(getOrCreateUserIdForEntitySet, userEntitySetId);

    yield put(getOrCreateUserId.success(action.id, userId));
  }
  catch (error) {
    yield put(getOrCreateUserId.failure(action.id, error));
  }
  finally {
    yield put(getOrCreateUserId.finally(action.id));
  }
}

export function* getOrCreateUserIdWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_OR_CREATE_USER_ID, getOrCreateUserIdWorker)
}

/*
 * loadApp()
 */

function* loadAppWatcher() :Generator<*, *, *> {

  yield takeEvery(LOAD_APP, loadAppWorker);
}

function* loadAppWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(loadApp.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(loadApp.request(action.id));

    /*
     * 1. load App
     */

    let response :any = {};
    response = yield call(getAppWorker, getApp(APP_NAME));
    if (response.error) throw response.error;

    /*
     * 2. load AppConfigs and AppTypes
     */

    const app = response.data;
    response = yield call(getAppConfigsWorker, getAppConfigs(app.id));
    if (response.error) throw response.error;

    const { data: appConfigs } = response;

    let configByOrgId = Map();
    let orgsById = Map();

    appConfigs.forEach((appConfig :Object) => {

      const { organization } :Object = appConfig;
      const orgId :string = organization.id;

      if (fromJS(appConfig.config).size) {

        orgsById = orgsById.set(orgId, fromJS(organization));

        Object.values(APP_TYPES).forEach((fqn) => {

          const { entitySetId } = appConfig.config[fqn];

          configByOrgId = configByOrgId.set(
            orgId,
            configByOrgId.get(orgId, Map()).set(fqn, entitySetId)
          );
        });
      }
    });

    let selectedOrg = AccountUtils.retrieveOrganizationId();

    if ((!selectedOrg && appConfigs.length > 0) || !orgsById.has(selectedOrg)) {
      selectedOrg = appConfigs[0].organization.id;
    }

    const usersEntitySetId = configByOrgId.getIn([selectedOrg, APP_TYPES.USERS]);
    const searchesEntitySetId = configByOrgId.getIn([selectedOrg, APP_TYPES.SEARCHES]);
    const entityKeyId = yield call(getOrCreateUserIdForEntitySet, usersEntitySetId);
    const isAdmin = yield call(checkIfAdmin, searchesEntitySetId);

    yield put(loadApp.success(action.id, {
      configByOrgId,
      orgsById,
      selectedOrg,
      entityKeyId,
      isAdmin
    }));
  }
  catch (error) {
    LOG.error('caught exception in loadAppWorker()', error);
    yield put(loadApp.failure(action.id, error));
  }
  finally {
    yield put(loadApp.finally(action.id));
  }
}

function* switchOrganizationWorker(action :Object) :Generator<*, *, *> {
  yield put(switchOrganization.request(action.id, action.value));
  AccountUtils.storeOrganizationId(action.value);

  const app = yield select(getAppFromState);
  const userEntitySetId = app.getIn([APP.CONFIG_BY_ORG_ID, action.value, APP_TYPES.USERS]);
  const searchesEntitySetId = app.getIn([APP.CONFIG_BY_ORG_ID, action.value, APP_TYPES.SEARCHES]);
  const entityKeyId = yield call(getOrCreateUserIdForEntitySet, userEntitySetId);
  const isAdmin = yield call(checkIfAdmin, searchesEntitySetId);

  yield put(switchOrganization.success(action.id, { entityKeyId, isAdmin }));
}

function* switchOrganizationWatcher() :Generator<*, *, *> {
  yield takeEvery(SWITCH_ORGANIZATION, switchOrganizationWorker);
}

function cleanupWorker() {
  clearCookies();
}

function* authExpirationCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActions.AUTH_EXPIRED, cleanupWorker);
}

function* authFailureCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActions.AUTH_FAILURE, cleanupWorker);
}

function* logoutCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActions.LOGOUT, cleanupWorker);
}

export {
  loadAppWatcher,
  loadAppWorker,
  authExpirationCleanupWatcher,
  authFailureCleanupWatcher,
  logoutCleanupWatcher,
  switchOrganizationWatcher
};
