/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';

import * as AlertSagas from '../../containers/alerts/AlertSagas';
import * as AppSagas from '../../containers/app/AppSagas';
import * as AuditSagas from '../../containers/audit/AuditSagas';
import * as DrawSagas from '../../containers/map/DrawSagas';
import * as EdmSagas from '../../containers/edm/EdmSagas';
import * as ExploreSagas from '../../containers/explore/ExploreSagas';
import * as ParametersSagas from '../../containers/parameters/ParametersSagas';
import * as QualitySagas from '../../containers/quality/QualitySagas';
import * as ReportSagas from '../../containers/report/ReportSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as SubmitSagas from '../../containers/submit/SubmitSagas';
import { logoutWatcher } from '../auth/AuthSagas';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    /*
     * NOTE: we're using a custom logout watcher "logoutWatcher" to handle the conditional redirect
     */
    fork(logoutWatcher),

    /* "lattice-auth" sagas */
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),

    /* AlertSagas */
    fork(AlertSagas.createAlertWatcher),
    fork(AlertSagas.expireAlertWatcher),
    fork(AlertSagas.loadAlertsWatcher),

    /* AppSagas */
    fork(AppSagas.loadAppWatcher),
    fork(AppSagas.switchOrganizationWatcher),
    fork(AppSagas.authExpirationCleanupWatcher),
    fork(AppSagas.authFailureCleanupWatcher),
    fork(AppSagas.logoutCleanupWatcher),
    fork(AppSagas.getOrCreateUserIdWatcher),

    /* AuditSagas */
    fork(AuditSagas.loadAuditDataWatcher),
    fork(AuditSagas.applyFiltersWatcher),
    fork(AuditSagas.loadAuditDashboardDataWatcher),
    fork(AuditSagas.setAuditDashboardWindowWatcher),

    /* DrawSagas */
    fork(DrawSagas.loadSavedMapsWatcher),
    fork(DrawSagas.saveMapWatcher),

    /* EdmSagas */
    fork(EdmSagas.loadDataModelWatcher),

    /* ExploreSagas */
    fork(ExploreSagas.executeSearchWatcher),
    fork(ExploreSagas.loadEntityNeighborsWatcher),

    /* ParametersSagas */
    fork(ParametersSagas.geocodeAddressWatcher),
    fork(ParametersSagas.loadDepartmentsAndDevicesWatcher),

    /* QualitySagas */
    fork(QualitySagas.loadQualityDashboardDataWatcher),
    fork(QualitySagas.setQualityDashboardWindowWatcher),
    fork(QualitySagas.loadAgenciesWatcher),
    fork(QualitySagas.loadQualityAgencyDataWatcher),
    fork(QualitySagas.loadQualityDeviceDataWatcher),

    /* ReportSagas */
    fork(ReportSagas.exportReportWatcher),
    fork(ReportSagas.loadReportsWatcher),

    /* RoutingSagas */
    fork(RoutingSagas.goToPathWatcher),
    fork(RoutingSagas.goToRootWatcher),

    /* SubmitSagas */
    fork(SubmitSagas.deleteEntityWatcher),
    fork(SubmitSagas.deleteEntitiesWatcher),
    fork(SubmitSagas.partialReplaceEntityWatcher),
    fork(SubmitSagas.replaceEntityWatcher),
    fork(SubmitSagas.submitWatcher),
  ]);
}
