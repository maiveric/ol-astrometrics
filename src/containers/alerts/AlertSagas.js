/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { PersistentSearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_ALERT,
  EXPIRE_ALERT,
  LOAD_ALERTS,
  createAlert,
  expireAlert,
  loadAlerts
} from './AlertActionFactory';

function* createAlertWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(createAlert.request(action.id));

    yield call(PersistentSearchApi.createPersistentSearch, action.value);

    yield put(createAlert.success(action.id));
    yield put(loadAlerts());
  }
  catch (error) {
    console.error(error)
    yield put(createAlert.failure(action.id, error));
  }
  finally {
    yield put(createAlert.finally(action.id));
  }
}

export function* createAlertWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_ALERT, createAlertWorker);
}

function* expireAlertWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(expireAlert.request(action.id));

    yield call(PersistentSearchApi.expirePersistentSearch, action.value);

    yield put(expireAlert.success(action.id));
    yield put(loadAlerts());
  }
  catch (error) {
    console.error(error);
    yield put(expireAlert.failure(action.id, error));
  }
  finally {
    yield put(expireAlert.finally(action.id));
  }
}

export function* expireAlertWatcher() :Generator<*, *, *> {
  yield takeEvery(EXPIRE_ALERT, expireAlertWorker);
}

function* loadAlertsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadAlerts.request(action.id));

    const alerts = yield call(PersistentSearchApi.loadPersistentSearches, true);

    yield put(loadAlerts.success(action.id, alerts));
  }
  catch (error) {
    console.error(error);
    yield put(loadAlerts.failure(action.id, error));
  }
  finally {
    yield put(loadAlerts.finally(action.id));
  }
}

export function* loadAlertsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_ALERTS, loadAlertsWorker);
}
