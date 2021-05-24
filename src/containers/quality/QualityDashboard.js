/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import * as QualityActionFactory from './QualityActionFactory';

import BarChart from '../../components/charts/BarChart';
import DropdownButton from '../../components/buttons/DropdownButton';
import Spinner from '../../components/spinner/Spinner';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import { HeaderCell, LightRow, Table } from '../../components/body/Table';
import {
  DASHBOARD_WINDOWS,
  DATE_FORMATS,
  EDM,
  QUALITY,
  STATE
} from '../../utils/constants/StateConstants';

type Props = {
  agencyCounts :Map;
  counts :Map<*>;
  dashboardWindow :string;
  isLoadingAgencies :boolean;
  isLoadingEdm :boolean;
  isLoadingResults :boolean;
  actions :{
    setQualityDashboardWindow :(label :string) => void;
  }
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #1F1E24;
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

const StyledHeaderCell = styled(HeaderCell).attrs(() => ({
  light: true
}))`
  &:nth-child(3) {
    text-align: right;
  }
`;

class QualityDashboard extends React.Component<Props> {

  renderReadsOverTime = () => {
    const { counts, dashboardWindow } = this.props;

    const formatter = DATE_FORMATS[dashboardWindow];

    return (
      <BarChart color="#34B88B" resourceType="reads" countsMap={counts} formatter={formatter} yAxisWide />
    );
  }

  renderReadBreakdowns = () => {

    const { agencyCounts, isLoadingAgencies } = this.props;

    const rows = [];
    let total = 0;

    agencyCounts.forEach((dataSourceMap :Map, agencyId :string) => {
      let agencyTotal = 0;
      dataSourceMap.forEach((count :number, dataSource :string) => {
        agencyTotal += count;
        total += count;
        if (count > 0) {
          rows.push([agencyId, dataSource, count]);
        }
      });
      if (agencyTotal === 0) {
        rows.push([agencyId, '', 0]);
      }
    });

    rows.sort((row1, row2) => (row1[2] > row2[2] ? -1 : 1));

    return (
      <ReadBreakdowns>
        <section>
          <HeaderLabel>Agency contributions</HeaderLabel>
          <Table isLoading={isLoadingAgencies}>
            <tbody>
              <LightRow>
                <StyledHeaderCell>Agency</StyledHeaderCell>
                <StyledHeaderCell>Source</StyledHeaderCell>
                <StyledHeaderCell>Count</StyledHeaderCell>
              </LightRow>
              {
                rows.map((row) => (
                  <LightRow key={`${row[0]}_${row[1]}`}>
                    <StyledHeaderCell>{row[0]}</StyledHeaderCell>
                    <StyledHeaderCell>{row[1]}</StyledHeaderCell>
                    <StyledHeaderCell>{row[2]}</StyledHeaderCell>
                  </LightRow>
                ))
              }
              <LightRow>
                <StyledHeaderCell>Total</StyledHeaderCell>
                <StyledHeaderCell />
                <StyledHeaderCell>{total}</StyledHeaderCell>
              </LightRow>
            </tbody>
          </Table>
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
    } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    const windowOptions = (Object.values(DASHBOARD_WINDOWS) :any).map((label) => ({
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
    agencyCounts: quality.get(QUALITY.AGENCY_COUNTS),
    counts: quality.get(QUALITY.DASHBOARD_DATA),
    dashboardWindow: quality.get(QUALITY.DASHBOARD_WINDOW),
    isLoadingAgencies: quality.get(QUALITY.IS_LOADING_AGENCY_DATA) || quality.get(QUALITY.IS_LOADING_AGENCIES),
    isLoadingEdm: edm.get(EDM.IS_LOADING_DATA_MODEL),
    isLoadingResults: quality.get(QUALITY.IS_LOADING),
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
