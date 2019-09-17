/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {
  Set,
  Map,
  OrderedSet,
  OrderedMap
} from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthUtils } from 'lattice-auth';
import { DateTimePicker } from '@atlaskit/datetime-picker';

import ReportRow from './ReportRow';
import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import SearchableSelect from '../../components/controls/SearchableSelect';
import InfoButton from '../../components/buttons/InfoButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { SidebarHeader } from '../../components/body/Sidebar';
import { VehicleHeader } from '../../components/vehicles/VehicleCard';
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
import { getEntityKeyId, getValue } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  entityKeyId :string,
  report :Map,
  isLoadingReports :boolean,
  isSubmitting :boolean,
  parameters :Map,
  reportReads :Map,

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
  width: 100%;
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

const VehicleSection = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid #36353B;

  &:last-child {
    border-bottom: 1px solid #36353B;
  }
`;

const ReadsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 50px;
`;

const ReadRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #36353B;
  padding: 16px;
  color: #CAC9CE;
  font-size: 14px;
`;

const ReportDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 150%;
  font-weight: 600;
  font-size: 24px;
  padding-top: 8px;

  span {
    color: #807f85;
    padding-left: 10px;
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

class SelectedReportContainer extends React.Component<Props, State> {

  componentDidMount() {
    const { actions, parameters } = this.props;

    actions.setReportValue({
      field: REPORT.NEW_REPORT_CASE,
      value: parameters.get(PARAMETERS.CASE_NUMBER, '')
    });
  }

  groupReadsByVehicle = () => {
    const { reportReads } = this.props;

    let readsByVehicle = OrderedMap();

    reportReads.forEach((read) => {
      const plate = read.getIn(['neighborDetails', PROPERTY_TYPES.PLATE, 0]);
      readsByVehicle = readsByVehicle.set(plate, readsByVehicle.get(plate, OrderedSet()).add(read));
    });

    readsByVehicle = readsByVehicle.mapEntries(([plate, reads]) => [plate, reads.sort((r1, r2) => {
      const m1 = moment(r1.getIn(['neighborDetails', PROPERTY_TYPES.TIMESTAMP, 0], ''));
      const m2 = r2.getIn(['neighborDetails', PROPERTY_TYPES.TIMESTAMP, 0], '');
      return m1.isAfter(m2) ? -1 : 1;
    })]).sortBy((_, plate) => plate);

    return readsByVehicle;
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

  renderRead = (readObj) => {
    const read = readObj.get('neighborDetails');
    if (!read) {
      return null;
    }

    const entityKeyId = getEntityKeyId(read);

    const dateTime = moment(read.getIn([PROPERTY_TYPES.TIMESTAMP, 0], ''));
    const dateTimeStr = dateTime.isValid() ? dateTime.format('MM/DD/YYYY hh:mm a') : 'Date unknown';

    return (
      <ReadRow key={entityKeyId}>
        <span>{dateTimeStr}</span>
      </ReadRow>
    );
  }

  renderVehicleGroup = (plate, reads) => {

    const state = reads.first().getIn(['neighborDetails', PROPERTY_TYPES.STATE, 0], 'CA');

    return (
      <VehicleSection key={plate}>
        <VehicleHeader plate={plate} state={state} />
        <ReadsWrapper>
          {reads.map(this.renderRead)}
        </ReadsWrapper>
      </VehicleSection>
    );
  }

  renderVehiclesAndReads = () => {
    const readsByVehicle = this.groupReadsByVehicle();
    return readsByVehicle.entrySeq().map(([plate, reads]) => this.renderVehicleGroup(plate, reads));
  }

  renderHeader = () => {
    const { actions, report } = this.props;

    const name = getValue(report, PROPERTY_TYPES.NAME);
    const caseNum = getValue(report, PROPERTY_TYPES.TYPE);

    const reportDetails = (
      <ReportDetails>
        <div>{name}</div>
        <span>{caseNum}</span>
      </ReportDetails>
    );

    return (
      <SidebarHeader
          noBorderBottom
          backButtonText="Back to reports"
          backButtonOnClick={() => actions.selectReport(false)}
          mainContent={reportDetails} />
    );
  }

  render() {
    const { isLoadingReports, isSubmitting, report } = this.props;

    if (!report) {
      return null;
    }

    if (isLoadingReports || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    return (
      <Wrapper>
        {this.renderHeader()}
        {this.renderVehiclesAndReads()}
      </Wrapper>
    );
  }


}

function mapStateToProps(state :Map<*, *>) :Object {
  const reports = state.get(STATE.REPORT);
  const parameters = state.get(STATE.PARAMETERS);
  const edm = state.get(STATE.EDM);
  const submit = state.get(STATE.SUBMIT);

  const entityKeyId = reports.get(REPORT.SELECTED_REPORT);

  return {
    entityKeyId,
    report: reports.getIn([REPORT.REPORTS, entityKeyId]),
    reportReads: reports.getIn([REPORT.READS_BY_REPORT, entityKeyId], Set()),
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectedReportContainer));
