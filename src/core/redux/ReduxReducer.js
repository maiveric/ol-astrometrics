/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import EdmReducer from '../../containers/edm/EdmReducer';
import EntitySetReducer from '../../containers/entitysets/EntitySetReducer';
import ExploreReducer from '../../containers/explore/ExploreReducer';
import ParametersReducer from '../../containers/parameters/ParametersReducer';
import ReportReducer from '../../containers/report/ReportReducer';
import { STATE } from '../../utils/constants/StateConstants';

export default function reduxReducer() {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    [STATE.EDM]: EdmReducer,
    [STATE.ENTITY_SETS]: EntitySetReducer,
    [STATE.EXPLORE]: ExploreReducer,
    [STATE.PARAMETERS]: ParametersReducer,
    [STATE.REPORT]: ReportReducer
  });
}
