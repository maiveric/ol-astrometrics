/*
 * @flow
 */

/* eslint-disable no-use-before-define */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { AuthActions, AccountUtils } from 'lattice-auth';
import type { SequenceAction } from 'redux-reqseq';
import {
  AppApiActions,
  AppApiSagas
} from 'lattice-sagas';

import Logger from '../../utils/Logger';
import { clearCookies } from '../../utils/CookieUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP_NAME } from '../../utils/constants/DataModelConstants';
import {
  LOAD_APP,
  SWITCH_ORGANIZATION,
  loadApp,
  switchOrganization
} from './AppActions';

const { getApp, getAppConfigs } = AppApiActions;
const { getAppWorker, getAppConfigsWorker } = AppApiSagas;

const LOG = new Logger('AppSagas');

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

    yield put(loadApp.success(action.id, { appConfigs }));
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
  yield put(switchOrganization.request(action.id));
  AccountUtils.storeOrganizationId(action.value);
  yield put(switchOrganization.success(action.id));
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
