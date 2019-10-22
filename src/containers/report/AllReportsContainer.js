/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map, OrderedMap } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthUtils } from 'lattice-auth';
import { DateTimePicker } from '@atlaskit/datetime-picker';

import ReportRow from './ReportRow';
import SelectedReportContainer from './SelectedReportContainer';
import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import SearchableSelect from '../../components/controls/SearchableSelect';
import InfoButton from '../../components/buttons/InfoButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import {
  STATE,
  ALERTS,
  REPORT,
  EDM,
  PARAMETERS,
  SEARCH_PARAMETERS,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { SIDEBAR_WIDTH, INNER_NAV_BAR_HEIGHT } from '../../core/style/Sizes';
import { SEARCH_REASONS } from '../../utils/constants/DataConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, getSearchTerm } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  reports :List,
  isLoadingReports :boolean,
  isSubmitting :boolean,
  selectedReportId :string,
  parameters :Map,
  edm :Map,

  actions :{
    loadReports :(edm :Map) => void,
    toggleReportModal :(isOpen :boolean) => void,
    setReportValue :({ field :string, value :string }) => void,
    submit :(
      values :Object,
      config :Object,
      includeUserId :boolean,
      callback :Function
    ) => void,
    replaceEntity :(
      entityKeyId :string,
      entitySetId :string,
      values :Object,
      callback :Function
    ) => void
  }
}

const Wrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: calc(100% - ${SIDEBAR_WIDTH}px);
  height: calc(100% - ${INNER_NAV_BAR_HEIGHT - 1}px);
  background-color: #1F1E24;
  color: #ffffff;
  bottom: 0;
  right: 0;
  padding: 56px 104px;
  line-height: 150%;
`;

const ModalHeader = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-size: 24px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 0;
`;

const SpinnerWrapper = styled.div`
  margin: 30px;
  padding: 30px;
  position: relative;
  width: 100%;
  height: 100%;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  button {
    width: fit-content;
  }
`;

const EvenlySpacedRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const NoReports = styled.div`
  width: 100%;
  font-size: 14px;
  color: #98979D;
`;

class AllReportsContainer extends React.Component<Props, State> {

  componentDidMount() {
    const { actions, parameters } = this.props;

    actions.setReportValue({
      field: REPORT.NEW_REPORT_CASE,
      value: parameters.get(PARAMETERS.CASE_NUMBER, '')
    });
  }

  getAsMap = (valueList) => {
    let options = OrderedMap();
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  getExpiration = alert => moment(alert.get('expiration', ''));

  sortReports = (a1, a2) => {
    const dt1 = this.getExpiration(a1);
    const dt2 = this.getExpiration(a2);
    return dt1.isValid() && dt1.isAfter(dt2) ? -1 : 1;
  }

  renderReportList = () => {
    const { actions, reports } = this.props;

    let content = <NoReports>You have no reports.</NoReports>;


    if (reports.size) {
      content = reports.valueSeq().sort(this.sortReports)
        .map(report => <ReportRow key={getEntityKeyId(report)} report={report} />);

    }

    return (
      <FormContainer>
        <EvenlySpacedRow>
          <ModalHeader>Reports</ModalHeader>
          <InfoButton onClick={() => actions.toggleReportModal(true)}>New report</InfoButton>
        </EvenlySpacedRow>
        {content}
      </FormContainer>
    );
  }

  render() {
    const { isLoadingReports, isSubmitting, selectedReportId } = this.props;

    let content;

    if (isLoadingReports || isSubmitting) {
      content = <Spinner />;
    }

    else if (selectedReportId) {
      content = <SelectedReportContainer />;
    }

    else {
      content = this.renderReportList();
    }

    return (
      <Wrapper>
        {content}
      </Wrapper>
    );
  }


}

function mapStateToProps(state :Map<*, *>) :Object {
  const reports = state.get(STATE.REPORT);
  const parameters = state.get(STATE.PARAMETERS);
  const edm = state.get(STATE.EDM);
  const submit = state.get(STATE.SUBMIT);

  return {
    reports: reports.get(REPORT.REPORTS),
    selectedReportId: reports.get(REPORT.SELECTED_REPORT),
    isLoadingReports: reports.get(REPORT.IS_LOADING_REPORTS),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    isSubmitting: submit.get(SUBMIT.SUBMITTING),
    edm
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ReportActionFactory).forEach((action :string) => {
    actions[action] = ReportActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AllReportsContainer));
