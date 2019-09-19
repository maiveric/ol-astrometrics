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

import StyledInput from '../../components/controls/StyledInput';
import Spinner from '../../components/spinner/Spinner';
import NavLinkWrapper from '../../components/nav/NavLinkWrapper';
import BarChart from '../../components/charts/BarChart';
import DropdownButton from '../../components/buttons/DropdownButton';
import {
  STATE,
  AUDIT,
  QUALITY,
  EDM,
  DASHBOARD_WINDOWS
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
  dashboardWindow :string;
  counts :Map<*>;
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
`;

const Header = styled.div`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
  padding-bottom: 50px;
`;

const SpaceBetweenRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLabel = styled.div`
  padding-top: 56px;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  padding-bottom: 24px;
  color: #ffffff;
`;

class QualityDashboard extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
    };
  }

  renderReadsOverTime = () => {
    const { counts } = this.props;

    return (
      <BarChart color="#34B88B" resourceType="searches" countsMap={counts} />
    );

  }


  render() {

    const {
      actions,
      isLoadingEdm,
      isLoadingResults,
      dashboardWindow
    } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    const windowOptions = Object.values(DASHBOARD_WINDOWS).map(label => ({
      label: `Past ${label}`,
      onClick: () => actions.setQualityDashboardWindow(label)
    }));

    return (
      <Wrapper>

        <SpaceBetweenRow>
          <HeaderLabel>Reads over time</HeaderLabel>
          <DropdownButton title={`Past ${dashboardWindow}`} options={windowOptions} invisible subtle />
        </SpaceBetweenRow>

        {this.renderReadsOverTime()}

      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const audit = state.get(STATE.AUDIT);
  const quality = state.get(STATE.QUALITY);
  const edm = state.get(STATE.EDM);

  return {
    edmLoaded: edm.get(EDM.EDM_LOADED),
    isLoadingEdm: edm.get(EDM.IS_LOADING_DATA_MODEL),

    isLoadingResults: quality.get(QUALITY.IS_LOADING),
    counts: quality.get(QUALITY.DASHBOARD_DATA),
    dashboardWindow: quality.get(QUALITY.DASHBOARD_WINDOW),

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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QualityDashboard));
