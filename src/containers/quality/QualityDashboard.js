/*
 * @flow
 */

import React from 'react';

import styled, { css } from 'styled-components';
import { Map, OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import * as QualityActionFactory from './QualityActionFactory';

import BarChart from '../../components/charts/BarChart';
import DropdownButton from '../../components/buttons/DropdownButton';
import Spinner from '../../components/spinner/Spinner';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import {
  Cell,
  HeaderCell,
  LightRow,
  Table
} from '../../components/body/Table';
import {
  DASHBOARD_WINDOWS,
  DATE_FORMATS,
  EDM,
  QUALITY,
  STATE
} from '../../utils/constants/StateConstants';

type Props = {
  agenciesById :Map<*, *>;
  agencyCounts :Map;
  counts :Map<*>;
  dashboardWindow :string;
  isLoadingAgencies :boolean;
  isLoadingEdm :boolean;
  isLoadingResults :boolean;
  actions :{
    loadQualityDashboardData :(startDate :Object, endDate :Object) => void;
    loadDataModel :() => void;
    setQualityDashboardWindow :(label :string) => void;
    updateAuditEnd :(value :string) => void;
    updateAuditStart :(value :string) => void;
    updateAuditFilter :(value :string) => void;
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

const cellStyle = css`

  &:nth-child(2) {
    text-align: right;
  }
`;

const StyledCell = styled(Cell).attrs(() => ({
  light: true
}))`${cellStyle}`;

const StyledHeaderCell = styled(HeaderCell).attrs(() => ({
  light: true
}))`${cellStyle}`;


class QualityDashboard extends React.Component<Props> {

  renderReadsOverTime = () => {
    const { counts, dashboardWindow } = this.props;

    const formatter = DATE_FORMATS[dashboardWindow];

    return (
      <BarChart color="#34B88B" resourceType="reads" countsMap={counts} formatter={formatter} yAxisWide />
    );
  }

    renderBreakdown = (header, label, countMap, labelMapper, isLoading) => {

      let counts = OrderedMap();

      countMap.entrySeq().forEach(([key, count]) => {
        counts = counts.set(labelMapper(key), count);
      });

      return (
        <>
          <HeaderLabel>{header}</HeaderLabel>

          <Table isLoading={isLoading}>
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
    const { agencyCounts, agenciesById, isLoadingAgencies } = this.props;

    const agencyMapper = (id) => agenciesById.get(id, 'Unknown');

    const counts = OrderedMap().withMutations((mutator) => {
      agencyCounts.forEach((count, key) => {
        const agencyName = agencyMapper(key);
        const mappedCount = mutator.get(agencyName, 0);
        if (count > mappedCount) {
          mutator.set(agencyName, count);
        }
        else {
          mutator.set(agencyName, mappedCount);
        }
      });
    });

    return (
      <ReadBreakdowns>
        <section>
          <>
            <HeaderLabel>Agency contributions</HeaderLabel>

            <Table isLoading={isLoadingAgencies}>
              <tbody>
                <LightRow>
                  <StyledHeaderCell>Agency</StyledHeaderCell>
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

    const windowOptions = Object.values(DASHBOARD_WINDOWS).map((label) => ({
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
    agenciesById: quality.get(QUALITY.AGENCIES_BY_ID),
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
