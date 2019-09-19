/*
 * @flow
 */

import React from 'react';
import moment from 'moment'
import styled, { css } from 'styled-components';
import { List, Map, OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  withRouter
} from 'react-router';
import { StyledDatePicker } from '../../components/controls/DateTimePicker';

import SearchableSelect from '../../components/controls/SearchableSelect';
import StyledInput from '../../components/controls/StyledInput';
import DropdownButton from '../../components/buttons/DropdownButton';
import Spinner from '../../components/spinner/Spinner';
import BarChart from '../../components/charts/BarChart';
import {
  Table,
  Cell,
  HeaderCell,
  LightRow
} from '../../components/body/Table';
import { getValue } from '../../utils/DataUtils';
import {
  STATE,
  AUDIT,
  AUDIT_EVENT,
  EDM,
  DASHBOARD_WINDOWS
} from '../../utils/constants/StateConstants';
import { SEARCH_REASONS } from '../../utils/constants/DataConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import * as Routes from '../../core/router/Routes';
import * as AuditActionFactory from './AuditActionFactory';
import * as EdmActionFactory from '../edm/EdmActionFactory';

type Props = {
  edmLoaded :boolean;
  isLoadingEdm :boolean;
  isLoadingResults :boolean;
  dashboardWindow :string;
  results :List<*>;
  startDate :Object,
  endDate :Object,
  filters :Map,
  edm :Map<*, *>;
  actions :{
    loadAuditDashboardData :(startDate :Object, endDate :Object) => void;
    loadDataModel :() => void;
    updateAuditEnd :(value :string) => void;
    updateAuditStart :(value :string) => void;
    updateAuditFilter :(value :string) => void;
    setAuditDashboardWindow :(value :string) => void;
  }
};

type State = {
  range :string
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const HeaderLabel = styled.div`
  padding-top: 56px;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  padding-bottom: 24px;
  color: #ffffff;
`;

const RANGES = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

const DATE_FORMATS = {
  [DASHBOARD_WINDOWS.WEEK]: 'MM/DD',
  [DASHBOARD_WINDOWS.MONTH]: 'MM/DD',
  [DASHBOARD_WINDOWS.YEAR]: 'MMM'
};

const SpaceBetweenRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SearchBreakdowns = styled.div`
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

class AuditDashboard extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      range: RANGES.WEEK
    };
  }

  getLastValidMoment = () => {
    const { dashboardWindow } = this.props;

    return moment().subtract(1, dashboardWindow).add(1, 'day').startOf('day');
  }

  initializeCountsMap = () => {
    const { dashboardWindow } = this.props;
    const formatter = DATE_FORMATS[dashboardWindow];

    const now = moment();

    let counts = Map();

    let date = this.getLastValidMoment();
    while (date.isSameOrBefore(now)) {
      counts = counts.set(date.format(formatter), 0);
      date = date.add(1, 'day');
    }

    return counts;
  }

  renderSearchesOverTime = () => {
    const { results, dashboardWindow } = this.props;

    const formatter = DATE_FORMATS[dashboardWindow];

    let counts = this.initializeCountsMap();

    const lastValidMoment = this.getLastValidMoment();

    results
      .map(search => search.get(AUDIT_EVENT.DATE_TIME))
      .filter(dateTime => dateTime.isSameOrAfter(lastValidMoment))
      .forEach((dateTime) => {
        const dateTimeStr = dateTime.format(formatter);
        counts = counts.set(dateTimeStr, counts.get(dateTimeStr) + 1);
      });

    return (
      <BarChart color="#816DF0" resourceType="searches" countsMap={counts} />
    );

  }

  renderBreakdown = (header, label, transformMapper) => {
    const { results } = this.props;

    let counts = OrderedMap();

    results.forEach((result) => {
      const value = transformMapper(result);
      counts = counts.set(value, counts.get(value, 0) + 1);
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

  renderSearchBreakdowns = () => (
    <SearchBreakdowns>
      <section>
        {this.renderBreakdown('User activity', 'Username', e => e.get(AUDIT_EVENT.PERSON_ID))}
      </section>
      <section>
        {this.renderBreakdown('Agency activity', 'Agency', e => e.get(AUDIT_EVENT.PERSON_ID).split('@')[1])}
        {this.renderBreakdown('Search purposes', 'Search purpose', e => e.get(AUDIT_EVENT.REASON))}
      </section>
    </SearchBreakdowns>
  );

  render() {

    const {
      actions,
      isLoadingEdm,
      isLoadingResults,
      dashboardWindow,
      edmLoaded,
      results,
      filter
    } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    const windowOptions = Object.values(DASHBOARD_WINDOWS).map(label => ({
      label: `Past ${label}`,
      onClick: () => actions.setAuditDashboardWindow(label)
    }));

    return (
      <Wrapper>

        <SpaceBetweenRow>
          <HeaderLabel>Searches over time</HeaderLabel>
          <DropdownButton title={`Past ${dashboardWindow}`} options={windowOptions} invisible subtle />
        </SpaceBetweenRow>

        {this.renderSearchesOverTime()}

        {this.renderSearchBreakdowns()}

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
    results: audit.get(AUDIT.DASHBOARD_RESULTS),
    dashboardWindow: audit.get(AUDIT.DASHBOARD_WINDOW),
    startDate: audit.get(AUDIT.START_DATE),
    endDate: audit.get(AUDIT.END_DATE),
    filters: audit.get(AUDIT.FILTER)
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditDashboard));
