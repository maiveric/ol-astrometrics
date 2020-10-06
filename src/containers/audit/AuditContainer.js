/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router';

import AuditLog from './AuditLog';
import AuditDashboard from './AuditDashboard';
import StyledInput from '../../components/controls/StyledInput';
import Spinner from '../../components/spinner/Spinner';
import NavLinkWrapper from '../../components/nav/NavLinkWrapper';
import {
  STATE,
  AUDIT,
  EDM
} from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
import * as Routes from '../../core/router/Routes';
import * as AuditActionFactory from './AuditActionFactory';
import * as EdmActionFactory from '../edm/EdmActionFactory';

type Props = {
  edmLoaded :boolean;
  isLoadingEdm :boolean;
  isLoadingResults :boolean;
  results :List<*>;
  startDate :Object,
  endDate :Object,
  filter :string,
  edm :Map<*, *>;
  actions :{
    loadAuditData :(startDate :Object, endDate :Object) => void;
    loadAuditDashboardData :(startDate :Object, endDate :Object) => void;
    loadDataModel :() => void;
    updateAuditEnd :(value :string) => void;
    updateAuditStart :(value :string) => void;
    updateAuditFilter :(value :string) => void;
  }
};

type State = {
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #1F1E24;
  padding: 56px 96px;
`;

const Header = styled.div`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
  padding-bottom: 50px;
`;

class AuditContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const { actions, edmLoaded } = this.props;

    if (!edmLoaded) {
      actions.loadDataModel();
    }
    else {
      actions.loadAuditData();
      actions.loadAuditDashboardData();
    }
  }

  componentDidUpdate(prevProps) {
    const { actions, edmLoaded } = this.props;

    if (!prevProps.edmLoaded && edmLoaded) {
      actions.loadAuditData();
      actions.loadAuditDashboardData();
    }
  }

  render() {

    const {
      isLoadingEdm,
      isLoadingResults
    } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    return (
      <Wrapper>

        <Header>
          <NavLinkWrapper to={Routes.AUDIT_DASHBOARD_ROUTE} large="true">
            Dashboard
          </NavLinkWrapper>
          <NavLinkWrapper to={Routes.AUDIT_LOG_ROUTE} large="true">
            Log
          </NavLinkWrapper>
        </Header>

        <Switch>
          <Route path={Routes.AUDIT_LOG_ROUTE} component={AuditLog} />
          <Route path={Routes.AUDIT_DASHBOARD_ROUTE} component={AuditDashboard} />
          <Redirect to={Routes.AUDIT_LOG_ROUTE} />
        </Switch>

      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const audit = state.get(STATE.AUDIT);
  const edm = state.get(STATE.EDM);

  return {
    edmLoaded: edm.get(EDM.EDM_LOADED),
    isLoadingEdm: edm.get(EDM.IS_LOADING_DATA_MODEL),

    isLoadingResults: audit.get(AUDIT.IS_LOADING_RESULTS),
    results: audit.get(AUDIT.FILTERED_RESULTS),
    startDate: audit.get(AUDIT.START_DATE),
    endDate: audit.get(AUDIT.END_DATE),
    filter: audit.get(AUDIT.FILTER)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AuditActionFactory).forEach((action :string) => {
    actions[action] = AuditActionFactory[action];
  });

  Object.keys(EdmActionFactory).forEach((action :string) => {
    actions[action] = EdmActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditContainer));
