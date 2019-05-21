/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';

import * as AlertSagas from '../../containers/alerts/AlertSagas';
import * as AppSagas from '../../containers/app/AppSagas';
import * as EdmSagas from '../../containers/edm/EdmSagas';
import * as EntitySetSagas from '../../containers/entitysets/EntitySetSagas';
import * as ExploreSagas from '../../containers/explore/ExploreSagas';
import * as ParametersSagas from '../../containers/parameters/ParametersSagas';
import * as ReportSagas from '../../containers/report/ReportSagas';
import * as SubmitSagas from '../../containers/submit/SubmitSagas';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    /* "lattice-auth" sagas */
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    /* AlertSagas */
    fork(AlertSagas.createAlertWatcher),
    fork(AlertSagas.expireAlertWatcher),
    fork(AlertSagas.loadAlertsWatcher),

    /* AppSagas */
    fork(AppSagas.loadAppWatcher),
    fork(AppSagas.authExpirationCleanupWatcher),
    fork(AppSagas.authFailureCleanupWatcher),
    fork(AppSagas.logoutCleanupWatcher),

    /* EdmSagas */
    fork(EdmSagas.loadDataModelWatcher),

    /* EntitySetSagas */
    fork(EntitySetSagas.searchEntitySetsWatcher),

    /* ExploreSagas */
    fork(ExploreSagas.executeSearchWatcher),
    fork(ExploreSagas.loadEntityNeighborsWatcher),

    /* ParametersSagas */
    fork(ParametersSagas.geocodeAddressWatcher),
    fork(ParametersSagas.loadDepartmentsAndDevicesWatcher),

    /* ReportSagas */
    fork(ReportSagas.exportReportWatcher),

    /* SubmitSagas */
    fork(SubmitSagas.replaceEntityWatcher),
    fork(SubmitSagas.submitWatcher)
  ]);
}
