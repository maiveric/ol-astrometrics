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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-light-svg-icons';

import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import SearchableSelect from '../../components/controls/SearchableSelect';
import SubtleButton from '../../components/buttons/SubtleButton';
import InfoButton from '../../components/buttons/InfoButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import NewReportConfig from '../../config/formconfig/NewReportConfig';
import { ReportHeaderRow } from './ReportRow';
import { StyledDatePicker } from '../../components/controls/DateTimePicker';
import { VehicleHeader } from '../../components/vehicles/VehicleCard';
import {
  STATE,
  EDM,
  EXPLORE,
  PARAMETERS,
  REPORT,
  SEARCH_PARAMETERS,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, getValue } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  isLoadingReports :boolean,
  isSubmitting :boolean,
  caseNum :string,
  name :string,
  parameters :Map,
  entitiesById :Map,
  readIdsForReport :Set,
  actions :{
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

type State = {
  isCreating :boolean
}

const ModalHeader = styled.div`
  font-size: 20px;
  font-weight: 600;
  line-height: 150%;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 0;
  width: 100%;
`;

const Accent = styled.span`
  color: #e53b36 !important;
`;

const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  &:not(:last-child) {
    border-bottom: 1px solid #36353B;
  }
  padding-top: 32px;
`;

const SpinnerWrapper = styled.div`
  margin: 30px;
  padding: 30px;
  position: relative;
  width: 100%;
  height: 100%;
`;

const InputHeader = styled.span`
  font-size: 12px;
  font-weight: 500;
  margin: 20px 0 8px 0;
`;

const ButtonLabel = styled.span`
  font-size: ${props => (props.small ? 12 : 14)}px;
  font-weight: 500;
  padding-left: 8px;
`;

const SectionRow = styled.div`
  width: ${props => (props.rowCount ? ((100 / props.rowCount) - 1) : 100)}%;
  padding-bottom: 32px;
`;

const AddTag = styled.article`
  background-color: #C4C4C4;
  color: #070709;
  border-radius: 2px;
  padding: 4px 8px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  button {
    width: fit-content;
  }
`;

const SpaceBetweenRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
`;

const StyledReportHeaderRow = styled(ReportHeaderRow)`

  padding: 7px 8px;
  border-radius: 3px;

  article {
    visibility: hidden;
  }

  &:hover {
    cursor: pointer;
    background-color: #36353B;

    article {
      visibility: visible;
    }
  }
`;

const EvenlySpacedRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
`;

const MinorText = styled.div`
  font-size: 14px;
  line-height: 150%;
  color: #807F85;
  padding-top: 8px;
`;

const MainContent = styled.div`
  min-height: 280px;
  height: 280px;
  width: 100%;
  overflow-y: auto;
`;

class AddReadsToReportModal extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      isCreating: false
    };
  }

  componentDidMount() {
    const { actions, parameters } = this.props;

    actions.setReportValue({
      field: REPORT.NEW_REPORT_CASE,
      value: parameters.get(PARAMETERS.CASE_NUMBER, '')
    });

    actions.setReportValue({
      field: REPORT.NEW_REPORT_NAME,
      value: ''
    });
  }

  getOnChange = (field, noEventObj, filterWildcards) => {
    const { actions } = this.props;
    return (e) => {
      let value = noEventObj ? e : e.target.value;
      if (value && filterWildcards) {
        value = value.replace(/\*/g, '');
      }
      actions.setReportValue({ field, value });
    };
  }

  getAsMap = (valueList) => {
    let options = OrderedMap();
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  createReport = () => {
    const {
      actions,
      caseNum,
      name
    } = this.props;

    actions.submit({
      config: NewReportConfig,
      includeUserId: true,
      values: {
        [REPORT.NEW_REPORT_NAME]: name,
        [REPORT.NEW_REPORT_CASE]: caseNum,
        [PROPERTY_TYPES.REPORT_CREATED_DATE_TIME]: moment().toISOString(true)
      },
      callback: () => {
        actions.toggleReportModal(false);
        actions.loadReports();
      }
    });
  }

  addReadsToReport = (reportEntityKeyId) => {
    const { isCreating } = this.state;
    const {
      actions,
      readIdsForReport,
      caseNum,
      name
    } = this.props;

    const now = moment().toISOString(true);

    const readIdValues = readIdsForReport.map(id => ({
      [ID_FIELDS.READ_ID]: id
    })).toJS();

    const values = {
      [EXPLORE.READ_IDS_TO_ADD_TO_REPORT]: readIdValues,
      [PROPERTY_TYPES.COMPLETED_DATE_TIME]: now
    };

    if (isCreating) {
      Object.assign(values, {
        [REPORT.NEW_REPORT_CASE]: caseNum,
        [REPORT.NEW_REPORT_NAME]: name,
        [PROPERTY_TYPES.REPORT_CREATED_DATE_TIME]: now
      });
    }
    else {
      Object.assign(values, {
        [ID_FIELDS.REPORT_ID]: reportEntityKeyId
      });
    }

    actions.submit({
      values,
      config: NewReportConfig,
      includeUserId: !!isCreating,
      callback: () => {
        actions.toggleAddReadsToReportModal(false);
        actions.loadReports();
      }
    });
  }

  renderVehicleHeader = () => {
    const { entitiesById, readIdsForReport } = this.props;

    const read = entitiesById.get(readIdsForReport.first());

    const plate = read.getIn([PROPERTY_TYPES.PLATE, 0], '');
    const state = read.getIn([PROPERTY_TYPES.STATE, 0], 'CA');

    return <VehicleHeader state={state} plate={plate} noPadding />;
  }

  renderNewReportInfo = () => {
    const { caseNum, name } = this.props;

    return (
      <>

        <SectionRow>
          <InputHeader>Case number</InputHeader>
          <Accent>*</Accent>
          <StyledInput value={caseNum} disabled />
        </SectionRow>

        <SpaceBetweenRow>

          <SectionRow>
            <InputHeader>Name of the report</InputHeader>
            <Accent>*</Accent>
            <StyledInput value={name} onChange={this.getOnChange(REPORT.NEW_REPORT_NAME)} />
          </SectionRow>

        </SpaceBetweenRow>
      </>
    );
  }

  renderReportRow = ([entityKeyId, report]) => {

    return (
      <StyledReportHeaderRow key={entityKeyId} onClick={() => this.addReadsToReport(entityKeyId)}>
        <div>
          <div>{getValue(report, PROPERTY_TYPES.NAME)}</div>
          <span>{getValue(report, PROPERTY_TYPES.TYPE)}</span>
        </div>
        <AddTag>
          <FontAwesomeIcon icon={faPlus} />
          <ButtonLabel small>Add</ButtonLabel>
        </AddTag>
      </StyledReportHeaderRow>
    );
  }

  renderReportSelection = () => {
    const { reports } = this.props;

    return (
      <>

        <SectionRow>
          <InfoButton round onClick={() => this.setState({ isCreating: true })}>
            <FontAwesomeIcon icon={faPlus} />
          </InfoButton>
          <ButtonLabel>Create new report</ButtonLabel>
        </SectionRow>

        {reports.entrySeq().map(this.renderReportRow)}

      </>
    )
  }

  render() {
    const {
      actions,
      isLoadingReports,
      isSubmitting,
      readIdsForReport,
      caseNum,
      name
    } = this.props;

    const { isCreating } = this.state;

    if (!readIdsForReport || !readIdsForReport.size) {
      return null;
    }

    if (isLoadingReports || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    const canSubmit = caseNum && name;

    const cancelFn = () => (isCreating
      ? this.setState({ isCreating: false })
      : actions.toggleAddReadsToReportModal(false));

    return (
      <FormContainer>
        <Section>
          <SectionRow>
            <EvenlySpacedRow>
              <ModalHeader>Choose report</ModalHeader>
            </EvenlySpacedRow>
          </SectionRow>
          {this.renderVehicleHeader()}
          <SectionRow>
            <MinorText>Choose a report to add the vehicle reads.</MinorText>
          </SectionRow>
        </Section>

        <Section>
          <MainContent>
            { isCreating ? this.renderNewReportInfo() : this.renderReportSelection() }
          </MainContent>
        </Section>

        <Section>
          <SpaceBetweenRow>
            <SubtleButton onClick={cancelFn}>Cancel</SubtleButton>
            {
              isCreating
                ? <InfoButton disabled={!canSubmit} onClick={this.addReadsToReport}>Create & add</InfoButton>
                : null
            }
          </SpaceBetweenRow>
        </Section>

      </FormContainer>
    );
  }

}

function mapStateToProps(state :Map<*, *>) :Object {
  const reports = state.get(STATE.REPORT);
  const parameters = state.get(STATE.PARAMETERS);
  const submit = state.get(STATE.SUBMIT);
  const explore = state.get(STATE.EXPLORE);

  return {
    isLoadingReports: reports.get(REPORT.IS_LOADING_REPORTS),
    reports: reports.get(REPORT.REPORTS),
    caseNum: reports.get(REPORT.NEW_REPORT_CASE),
    name: reports.get(REPORT.NEW_REPORT_NAME),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    entitiesById: explore.get(EXPLORE.ENTITIES_BY_ID),
    readIdsForReport: explore.get(EXPLORE.READ_IDS_TO_ADD_TO_REPORT),
    isSubmitting: submit.get(SUBMIT.SUBMITTING)
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AddReadsToReportModal));
