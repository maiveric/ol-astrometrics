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
import Spinner from '../../components/spinner/Spinner';
import BarChart from '../../components/charts/BarChart';
import { getValue } from '../../utils/DataUtils';
import {
  STATE,
  AUDIT,
  AUDIT_EVENT,
  EDM
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
  results :List<*>;
  startDate :Object,
  endDate :Object,
  filters :Map,
  edm :Map<*, *>;
  actions :{
    loadAuditData :(startDate :Object, endDate :Object) => void;
    loadDataModel :() => void;
    updateAuditEnd :(value :string) => void;
    updateAuditStart :(value :string) => void;
    updateAuditFilter :(value :string) => void;
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
  [RANGES.WEEK]: 'MM/DD',
  [RANGES.MONTH]: 'MM/DD',
  [RANGES.YEAR]: 'MMM'
};

class AuditDashboard extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      range: RANGES.WEEK
    };
  }

  getLastValidMoment = () => {
    const { range } = this.state;

    return moment().subtract(1, range).add(1, 'day').startOf('day');
  }

  initializeCountsMap = () => {
    const { range } = this.state;
    const formatter = DATE_FORMATS[range];

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
    const { results } = this.props;
    const { range } = this.state;

    const formatter = DATE_FORMATS[range];

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

  render() {

    const {
      isLoadingEdm,
      isLoadingResults,
      edmLoaded,
      results,
      filter
    } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    return (
      <Wrapper>

        <HeaderLabel>Searches over time</HeaderLabel>
        {this.renderSearchesOverTime()}

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
