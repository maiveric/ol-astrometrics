/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import { Constants, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import {
  EXPORT_REPORT,
  exportReport
} from './ReportActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

function* exportReportWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(exportReport.request(action.id));

    console.log(action.value.toJS())

    yield put(exportReport.success(action.id));
  }
  catch (error) {
    yield put(exportReport.failure(action.id, error));
  }
  finally {
    yield put(exportReport.finally(action.id));
  }
}

export function* exportReportWatcher() :Generator<*, *, *> {
  yield takeEvery(EXPORT_REPORT, exportReportWorker);
}
