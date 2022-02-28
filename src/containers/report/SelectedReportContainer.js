/*
 * @flow
 */

import React from 'react';

import ReactToPrint from 'react-to-print';
import moment from 'moment';
import styled, { css } from 'styled-components';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Map,
  OrderedMap,
  OrderedSet,
  Set
} from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import ReportRow from './ReportRow';
import * as ReportActionFactory from './ReportActionFactory';

import InfoButton from '../../components/buttons/InfoButton';
import ReportVehicleInfo from '../../components/vehicles/ReportVehicleInfo';
import Spinner from '../../components/spinner/Spinner';
import SubtleButton from '../../components/buttons/SubtleButton';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';
import { SidebarHeader } from '../../components/body/Sidebar';
import { VehicleHeader } from '../../components/vehicles/VehicleCard';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
import { getCoordinates, getEntityKeyId, getValue } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import {
  PARAMETERS,
  REPORT,
  SEARCH_PARAMETERS,
  STATE,
  SUBMIT
} from '../../utils/constants/StateConstants';

type Props = {
  report :Map,
  isLoadingReports :boolean,
  isReverseGeocoding :boolean,
  isSubmitting :boolean,
  parameters :Map,
  reportReads :Map,
  departmentOptions :Map,
  deviceOptions :Map,
  reverseGeocodeCoords :Map,

  actions :{
    loadReports :(edm :Map) => void,
    toggleReportModal :(isOpen :boolean) => void,
    setReportValue :({ field :string, value :string }) => void,
    toggleDeleteReadsModal :(
      entityKeyIds :Set,
      isVehicle :boolean
    ) => void,
    deleteEntities :(
      entityKeyId :string,
      entitySetId :string,
      values :Object,
      callback :Function
    ) => void
  }
}

type State = {
  expanded :Set
};

const printableStyle = css`
 ${(props) => (props.printable ? css`
   color: black !important;
  ` : '')}
`;

const Wrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: calc(100% - ${SIDEBAR_WIDTH}px);
`;

const Header = styled.div`
  padding-bottom: 40px;
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
  flex-direction: column;
  border-top: 1px solid #36353B;
  padding: 16px;
  color: #CAC9CE;
  font-size: 14px;
  ${printableStyle}
`;

const ReportDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 150%;
  font-weight: 600;
  font-size: 24px;
  padding-top: 8px;
  ${printableStyle}

  span {
    color: #807f85;
    padding-left: 10px;
  }
`;

const PrintableContent = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 30px;
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

const InnerRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HiddenContent = styled.div`
  max-height: 0;
  max-width: 0;
  overflow: hidden;
`;

class SelectedReportContainer extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      expanded: Set()
    };
  }

  componentDidMount() {
    const { actions, parameters } = this.props;

    actions.setReportValue({
      field: REPORT.NEW_REPORT_CASE,
      value: parameters.get(PARAMETERS.CASE_NUMBER, '')
    });

    this.reverseGeocodeReads();
  }

  reverseGeocodeReads = () => {
    const { actions, reportReads } = this.props;

    actions.reverseGeocodeCoordinates(reportReads.map((r) => getCoordinates(r.get('neighborDetails', Map()))));
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

  removeReads = (entityKeyIds, isVehicle) => {
    const { actions } = this.props;
    actions.toggleDeleteReadsModal({ entityKeyIds, isVehicle });
  }

  renderRead = (readObj, isPrinting) => {
    const { expanded } = this.state;
    const { departmentOptions, deviceOptions, reverseGeocodeCoords } = this.props;

    const read = readObj.get('neighborDetails');
    if (!read) {
      return null;
    }

    const entityKeyId = getEntityKeyId(read);
    const associationEntityKeyId = getEntityKeyId(readObj.get('associationDetails'));

    const isExpanded = isPrinting || expanded.has(entityKeyId);

    const dateTime = moment(read.getIn([PROPERTY_TYPES.TIMESTAMP, 0], ''));
    const dateTimeStr = dateTime.isValid() ? dateTime.format('MM/DD/YYYY hh:mm a') : 'Date unknown';

    const onExpand = () => (isExpanded
      ? this.setState({ expanded: expanded.delete(entityKeyId) })
      : this.setState({ expanded: expanded.add(entityKeyId) }));

    const onRemoveFromReport = () => this.removeReads(Set.of(associationEntityKeyId));

    return (
      <ReadRow key={entityKeyId} printable={isPrinting}>
        <InnerRow>
          <span>{dateTimeStr}</span>
          <InnerRow>
            { isPrinting ? null : (
              <>
                <SubtleButton onClick={onRemoveFromReport} noHover>Remove</SubtleButton>
                <SubtleButton onClick={onExpand} noHover>
                  <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </SubtleButton>
              </>
            )}
          </InnerRow>
        </InnerRow>
        { isExpanded
          ? (
            <ReportVehicleInfo
                read={read}
                departmentOptions={departmentOptions}
                deviceOptions={deviceOptions}
                reverseGeocodeCoords={reverseGeocodeCoords}
                printable={isPrinting} />
          ) : null
        }
      </ReadRow>
    );
  }

  renderVehicleGroup = (plate, reads, isPrinting) => {

    const state = reads.first().getIn(['neighborDetails', PROPERTY_TYPES.STATE, 0], 'CA');

    const readIds = reads.map((read) => getEntityKeyId(read.get('associationDetails', Map()))).toSet();

    const removeButton = <SubtleButton onClick={() => this.removeReads(readIds, true)} noHover>Remove</SubtleButton>;

    return (
      <VehicleSection key={plate}>
        <VehicleHeader plate={plate} state={state} addButton={removeButton} printable={isPrinting} />
        <ReadsWrapper>
          {reads.map((read) => this.renderRead(read, isPrinting))}
        </ReadsWrapper>
      </VehicleSection>
    );
  }

  renderVehiclesAndReads = (isPrinting) => {
    const readsByVehicle = this.groupReadsByVehicle();
    return readsByVehicle.entrySeq().map(([plate, reads]) => this.renderVehicleGroup(plate, reads, isPrinting));
  }

  renderHeader = () => {
    const { actions, report } = this.props;

    const name = getValue(report, PROPERTY_TYPES.NAME);
    const caseNum = getValue(report, PROPERTY_TYPES.TYPE);

    const reportDetails = (
      <EvenlySpacedRow>
        <ReportDetails>
          <div>{name}</div>
          <span>{caseNum}</span>
        </ReportDetails>
        <ReactToPrint
            pageStyle={{ padding: '30px' }}
            trigger={() => <InfoButton>Generate PDF</InfoButton>}
            content={() => this.reportRef} />
      </EvenlySpacedRow>
    );

    return (
      <Header>
        <SidebarHeader
            noBorderBottom
            backButtonText="Back to reports"
            backButtonOnClick={() => actions.selectReport(false)}
            mainContent={reportDetails} />
      </Header>
    );
  }

  renderPrintableReport = () => {
    const { report } = this.props;

    const name = getValue(report, PROPERTY_TYPES.NAME);
    const caseNum = getValue(report, PROPERTY_TYPES.TYPE);

    return (
      <HiddenContent>
        <PrintableContent
            ref={(ref) => {
              this.reportRef = ref;
            }}>
          <ReportDetails printable>
            <div>{name}</div>
            <span>{caseNum}</span>
          </ReportDetails>
          {this.renderVehiclesAndReads(true)}
        </PrintableContent>
      </HiddenContent>
    );
  }

  render() {
    const {
      isLoadingReports,
      isReverseGeocoding,
      isSubmitting,
      report
    } = this.props;

    if (!report) {
      return null;
    }

    if (isLoadingReports || isSubmitting || isReverseGeocoding) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    return (
      <Wrapper>
        {this.renderHeader()}
        {this.renderVehiclesAndReads()}
        {this.renderPrintableReport()}
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
    report: reports.getIn([REPORT.REPORTS, entityKeyId]),
    reportReads: reports.getIn([REPORT.READS_BY_REPORT, entityKeyId], Set()),
    isLoadingReports: reports.get(REPORT.IS_LOADING_REPORTS),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    departmentOptions: parameters.get(SEARCH_PARAMETERS.AGENCY_OPTIONS),
    deviceOptions: parameters.get(SEARCH_PARAMETERS.DEVICE_OPTIONS),
    reverseGeocodeCoords: parameters.get(SEARCH_PARAMETERS.REVERSE_GEOCODED_COORDS),
    isReverseGeocoding: parameters.get(SEARCH_PARAMETERS.IS_REVERSE_GEOCODING),
    isSubmitting: submit.get(SUBMIT.SUBMITTING),
    edm
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ParametersActionFactory).forEach((action :string) => {
    actions[action] = ParametersActionFactory[action];
  });

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
