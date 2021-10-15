/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router';
import { bindActionCreators } from 'redux';

import QualityDashboard from './QualityDashboard';
import * as QualityActionFactory from './QualityActionFactory';

import NavLinkWrapper from '../../components/nav/NavLinkWrapper';
import Spinner from '../../components/spinner/Spinner';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as Routes from '../../core/router/Routes';
import { AUDIT, EDM, STATE } from '../../utils/constants/StateConstants';

type Props = {
  edmLoaded :boolean;
  isLoadingEdm :boolean;
  isLoadingResults :boolean;
  actions :{
    loadDataModel :() => void;
    loadQualityAgencyData :() => void;
    loadQualityDashboardData :() => void;
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

class QualityContainer extends React.Component<Props, State> {

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
      actions.loadQualityDashboardData();
      actions.loadQualityAgencyData();
    }
  }

  componentDidUpdate(prevProps) {
    const { actions, edmLoaded } = this.props;

    if (!prevProps.edmLoaded && edmLoaded) {
      actions.loadQualityDashboardData();
      actions.loadQualityAgencyData();
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
          <NavLinkWrapper to={Routes.QUALITY_DASHBOARD_ROUTE} large="true">
            Dashboard
          </NavLinkWrapper>
        </Header>
        <Switch>
          <Route path={Routes.QUALITY_DASHBOARD_ROUTE} component={QualityDashboard} />
          <Redirect to={Routes.QUALITY_DASHBOARD_ROUTE} />
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
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(QualityActionFactory).forEach((action :string) => {
    actions[action] = QualityActionFactory[action];
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QualityContainer));
