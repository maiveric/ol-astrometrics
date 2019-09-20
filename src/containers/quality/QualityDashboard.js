/*
 * @flow
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { OrderedMap, Map, Set } from 'immutable';
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
  Table,
  Cell,
  HeaderCell,
  LightRow
} from '../../components/body/Table';
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
  agenciesById :Map<*, *>;
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

const ReadBreakdowns = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  section {
    width: 49%;
    display: flex;
    flex-direction: column;
  }
`;

const cellStyle = css`

  &:nth-child(2) {
    text-align: right;
  }
`;

const StyledCell = styled(Cell).attrs(_ => ({
  light: true
}))`${cellStyle}`;

const StyledHeaderCell = styled(HeaderCell).attrs(_ => ({
  light: true
}))`${cellStyle}`;


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

    renderBreakdown = (header, label, countMap, labelMapper) => {

      let counts = OrderedMap();

      countMap.entrySeq().forEach(([key, count]) => {
        counts = counts.set(labelMapper(key), count);
      });

      return (
        <>
          <HeaderLabel>{header}</HeaderLabel>

          <Table>
            <tbody>
              <LightRow>
                <StyledHeaderCell>{label}</StyledHeaderCell>
                <StyledHeaderCell>Count</StyledHeaderCell>
              </LightRow>
              {counts.sort((v1, v2) => (v1 > v2 ? -1 : 1)).entrySeq().map(([key, value]) => (
                <LightRow key={key}>
                  <StyledCell>{key}</StyledCell>
                  <StyledCell>{value}</StyledCell>
                </LightRow>
              ))}
            </tbody>
          </Table>

        </>
      );
    }

  renderReadBreakdowns = () => {
    const { agencyCounts, agenciesById } = this.props;

    const agencyMapper = id => agenciesById.get(id, 'Unknown');

    return (
      <ReadBreakdowns>
        <section>
          {this.renderBreakdown('Agency contributions', 'Agency', agencyCounts, agencyMapper)}
        </section>
      </ReadBreakdowns>
    );
  }

  render() {

    const {
      actions,
      isLoadingEdm,
      isLoadingResults,
      dashboardWindow,
      agenciesById
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

        {this.renderReadBreakdowns()}

      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const quality = state.get(STATE.QUALITY);
  const edm = state.get(STATE.EDM);

  return {
    edmLoaded: edm.get(EDM.EDM_LOADED),
    isLoadingEdm: edm.get(EDM.IS_LOADING_DATA_MODEL),

    isLoadingResults: quality.get(QUALITY.IS_LOADING),
    counts: quality.get(QUALITY.DASHBOARD_DATA),
    agencyCounts: quality.get(QUALITY.AGENCY_COUNTS),
    dashboardWindow: quality.get(QUALITY.DASHBOARD_WINDOW),
    agenciesById: quality.get(QUALITY.AGENCIES_BY_ID),
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
