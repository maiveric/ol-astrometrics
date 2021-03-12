/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getEntityKeyId } from '../../utils/DataUtils';
import { getAppFromState, getEntitySetId, getUserIdFromState } from '../../utils/AppUtils';
import { APP_TYPES } from '../../utils/constants/DataModelConstants';
import {
  LOAD_REPORTS,
  loadReports
} from './ReportActionFactory';

declare var __MAPBOX_TOKEN__;

function* loadReportsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadReports.request(action.id));

    const app = yield select(getAppFromState);
    const userEntitySetId = getEntitySetId(app, APP_TYPES.USERS);
    const reportsEntitySetId = getEntitySetId(app, APP_TYPES.REPORTS);
    const readsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
    const userEntityKeyId = getUserIdFromState(app);

    const reportNeighbors = yield call(
      SearchApi.searchEntityNeighborsWithFilter,
      userEntitySetId,
      {
        entityKeyIds: [userEntityKeyId],
        sourceEntitySetIds: [reportsEntitySetId],
        destinationEntitySetIds: []
      }
    );

    let reports = Map();
    let readsByReport = Map();

    const reportsForUser = reportNeighbors[userEntityKeyId];

    if (reportsForUser) {

      fromJS(reportsForUser).forEach((neighborObj) => {
        const neighborDetails = neighborObj.get('neighborDetails');
        const entityKeyId = getEntityKeyId(neighborDetails);
        reports = reports.set(entityKeyId, neighborDetails);
      });

      readsByReport = yield call(
        SearchApi.searchEntityNeighborsWithFilter,
        reportsEntitySetId,
        {
          entityKeyIds: reports.keySeq().toJS(),
          sourceEntityKeyIds: [readsEntitySetId],
          destinationEntitySetIds: []
        }
      );

      readsByReport = fromJS(readsByReport);
    }

    yield put(loadReports.success(action.id, { reports, readsByReport }));
  }
  catch (error) {
    console.error(error);
    yield put(loadReports.failure(action.id, error));
  }
  finally {
    yield put(loadReports.finally(action.id));
  }
}

export function* loadReportsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REPORTS, loadReportsWorker);
}
