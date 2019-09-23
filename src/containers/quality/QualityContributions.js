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
  isLoadingAgencies :boolean;
  isLoadingDevices :boolean;
  dashboardWindow :string;
  counts :Map<*>;
  startDate :Object,
  endDate :Object,
  filter :string,
  edm :Map<*, *>;
  agenciesById :Map<*, *>;
  devicesById :Map<*, *>;
  agencyCounts :Map<*, *>;
  deviceCounts :Map<*, *>;
  devicesById :Map<*, *>;
  actions :{
    loadQualityDashboardData :(startDate :Object, endDate :Object) => void;
    loadQualityDeviceData :(key :string) => void;
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

  ${props => (props.clickable ? css`
    &:hover {
      cursor: pointer;
    }
  ` : '')}
`;

const StyledCell = styled(Cell).attrs(({ light }) => ({
  light
}))`${cellStyle}`;

const StyledHeaderCell = styled(HeaderCell).attrs(({ light }) => ({
  light
}))`${cellStyle}`;


class QualityContributions extends React.Component<Props, State> {

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

  sortCountMap = countMap => countMap.sort((v1, v2) => (v1 > v2 ? -1 : 1));

  renderAgencyBreakdown = () => {

    const {
      actions,
      isLoadingAgencies,
      agenciesById,
      agencyCounts
    } = this.props;

    const counts = this.sortCountMap(agencyCounts);

    const getOnClick = key => () => actions.loadQualityDeviceData(key);

    return (
      <>
        <HeaderLabel>Agency contributions</HeaderLabel>

        <Table isLoading={isLoadingAgencies}>
          <tbody>
            <tr>
              <StyledHeaderCell>Agency</StyledHeaderCell>
              <StyledHeaderCell>Count</StyledHeaderCell>
            </tr>
            {counts.entrySeq().map(([key, value]) => (
              <tr key={key}>
                <StyledCell clickable onClick={getOnClick(key)}>{agenciesById.get(key, 'Unknown')}</StyledCell>
                <StyledCell clickable onClick={getOnClick(key)}>{value}</StyledCell>
              </tr>
            ))}
          </tbody>
        </Table>

      </>
    );
  }

  renderDeviceBreakdown = () => {

    const {
      isLoadingDevices,
      devicesById,
      deviceCounts
    } = this.props;

    const counts = this.sortCountMap(deviceCounts);

    return (
      <>
        <HeaderLabel>Device contributions</HeaderLabel>

        <Table light isLoading={isLoadingDevices}>
          <tbody>
            <LightRow>
              <StyledHeaderCell light>Device</StyledHeaderCell>
              <StyledHeaderCell light>Count</StyledHeaderCell>
            </LightRow>
            {counts.entrySeq().map(([key, value]) => (
              <LightRow key={key}>
                <StyledCell light>{devicesById.get(key, 'Unknown')}</StyledCell>
                <StyledCell light>{value}</StyledCell>
              </LightRow>
            ))}
          </tbody>
        </Table>

      </>
    );
  }

  renderReadBreakdowns = () => {
    const {
      isLoadingAgencies,
      isLoadingDevices,
      agenciesById,
      agencyCounts,
      deviceCounts
    } = this.props;

    return (
      <ReadBreakdowns>
        <section>
          {this.renderAgencyBreakdown()}
        </section>
        <section>
          {this.renderDeviceBreakdown()}
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
          <DropdownButton title={`Past ${dashboardWindow}`} options={windowOptions} invisible subtle />
        </SpaceBetweenRow>

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

    isLoadingAgencies: quality.get(QUALITY.IS_LOADING_AGENCY_DATA) || quality.get(QUALITY.IS_LOADING_AGENCIES),
    isLoadingDevices: quality.get(QUALITY.IS_LOADING_DEVICE_DATA),
    isLoadingResults: quality.get(QUALITY.IS_LOADING),
    counts: quality.get(QUALITY.DASHBOARD_DATA),
    agencyCounts: quality.get(QUALITY.AGENCY_COUNTS),
    deviceCounts: quality.get(QUALITY.DEVICE_COUNTS),
    selectedAgencyId: quality.get(QUALITY.SELECTED_AGENCY_ID),
    dashboardWindow: quality.get(QUALITY.DASHBOARD_WINDOW),
    agenciesById: quality.get(QUALITY.AGENCIES_BY_ID),
    devicesById: quality.get(QUALITY.DEVICES_BY_ID)
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QualityContributions));
