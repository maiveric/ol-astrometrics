/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { fork } from 'redux-saga/effects';

import * as AppSagas from '../../containers/app/AppSagas';
import * as EdmSagas from '../../containers/edm/EdmSagas';
import * as EntitySetSagas from '../../containers/entitysets/EntitySetSagas';
import * as ExploreSagas from '../../containers/explore/ExploreSagas';
import * as ParametersSagas from '../../containers/parameters/ParametersSagas';
import * as ReportSagas from '../../containers/report/ReportSagas';

export default function* sagas() :Generator<*, *, *> {

  yield [
    /* "lattice-auth" sagas */
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    /* AppSagas */
    fork(AppSagas.loadAppWatcher),

    /* EdmSagas */
    fork(EdmSagas.loadDataModelWatcher),

    /* EntitySetSagas */
    fork(EntitySetSagas.searchEntitySetsWatcher),

    /* ExploreSagas */
    fork(ExploreSagas.executeSearchWatcher),
    fork(ExploreSagas.loadEntityNeighborsWatcher),

    /* ParametersSagas */
    fork(ParametersSagas.geocodeAddressWatcher),
    fork(ParametersSagas.searchAgenciesWatcher),

    /* ReportSagas */
    fork(ReportSagas.exportReportWatcher)

  ];
}
