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

import QualityDashboard from './QualityDashboard';
import QualityContributions from './QualityContributions';
import StyledInput from '../../components/controls/StyledInput';
import Spinner from '../../components/spinner/Spinner';
import NavLinkWrapper from '../../components/nav/NavLinkWrapper';
import {
  STATE,
  AUDIT,
  EDM,
  QUALITY
} from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
import * as Routes from '../../core/router/Routes';
import * as QualityActionFactory from './QualityActionFactory';
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
    loadQualityDashboardData :(startDate :Object, endDate :Object) => void;
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
      actions.loadAgencies();
    }
  }

  componentDidUpdate(prevProps) {
    const { actions, edmLoaded } = this.props;

    if (!prevProps.edmLoaded && edmLoaded) {
      actions.loadQualityDashboardData();
      actions.loadAgencies();
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
    isLoadingAgencies: audit.get(AUDIT.IS_LOADING_AGENCIES),
    results: audit.get(AUDIT.FILTERED_RESULTS),
    startDate: audit.get(AUDIT.START_DATE),
    endDate: audit.get(AUDIT.END_DATE),
    filter: audit.get(AUDIT.FILTER)
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
