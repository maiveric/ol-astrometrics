/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { LOAD_REPORTS, loadReports } from './ReportActionFactory';

import {
  getAppFromState,
  getEntitySetId,
  getSelectedOrganizationId,
  getUserIdFromState,
} from '../../utils/AppUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { AGENCY_VEHICLE_RECORDS_ENTITY_SETS } from '../../utils/constants';
import { APP_TYPES } from '../../utils/constants/DataModelConstants';
import { APP } from '../../utils/constants/StateConstants';

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

      const orgId = getSelectedOrganizationId(app);
      const appSettings = app.getIn([APP.SETTINGS_BY_ORG_ID, orgId]);
      const agencyVehicleRecordsEntitySets = appSettings.get(AGENCY_VEHICLE_RECORDS_ENTITY_SETS) || Map();
      readsByReport = yield call(SearchApi.searchEntityNeighborsWithFilter, reportsEntitySetId, {
        entityKeyIds: reports.keySeq().toJS(),
        sourceEntitySetIds: [readsEntitySetId, ...agencyVehicleRecordsEntitySets.keySeq().toJS()],
        destinationEntitySetIds: []
      });

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
