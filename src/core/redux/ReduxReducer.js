/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import AlertReducer from '../../containers/alerts/AlertReducer';
import AuditReducer from '../../containers/audit/AuditReducer';
import DrawReducer from '../../containers/map/DrawReducer';
import EdmReducer from '../../containers/edm/EdmReducer';
import ExploreReducer from '../../containers/explore/ExploreReducer';
import ParametersReducer from '../../containers/parameters/ParametersReducer';
import ReportReducer from '../../containers/report/ReportReducer';
import SubmitReducer from '../../containers/submit/SubmitReducer';
import { STATE } from '../../utils/constants/StateConstants';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    router: connectRouter(routerHistory),
    [STATE.ALERTS]: AlertReducer,
    [STATE.AUDIT]: AuditReducer,
    [STATE.DRAW]: DrawReducer,
    [STATE.EDM]: EdmReducer,
    [STATE.EXPLORE]: ExploreReducer,
    [STATE.PARAMETERS]: ParametersReducer,
    [STATE.REPORT]: ReportReducer,
    [STATE.SUBMIT]: SubmitReducer,
  });
}
