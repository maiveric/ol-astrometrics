/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { AppApi, EntityDataModelApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getFqnString, getFqnObj } from '../../utils/DataUtils';
import {
  LOAD_AUDIT_DATA,
  loadAuditData
} from './AuditActionFactory';

import { APP_TYPES } from '../../utils/constants/DataModelConstants';

function* loadAuditDataWorker(action :SequenceAction) {
  try {
    yield put(loadAuditData.request(action.id));

    yield put(loadAuditData.success(action.id));
  }
  catch (error) {
    yield put(loadAuditData.failure(action.id, error));
  }
  finally {
    yield put(loadAuditData.finally(action.id));
  }
}

export function* loadAuditDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_AUDIT_DATA, loadAuditDataWorker);
}
