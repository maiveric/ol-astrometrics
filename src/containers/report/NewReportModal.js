/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Map, OrderedMap } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import SubtleButton from '../../components/buttons/SubtleButton';
import InfoButton from '../../components/buttons/InfoButton';
import NewReportConfig from '../../config/formconfig/NewReportConfig';
import {
  STATE,
  PARAMETERS,
  REPORT,
  SEARCH_PARAMETERS,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  isLoadingReports :boolean,
  isSubmitting :boolean,
  caseNum :string,
  name :string,
  parameters :Map,
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

const SectionRow = styled.div`
  width: ${props => (props.rowCount ? ((100 / props.rowCount) - 1) : 100)}%;
  padding-bottom: 32px;
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

const CenteredRow = styled(Row)`
  justify-content: center;
  margin-top: 20px;

  button {
    margin: 0 10px;
    width: 50%;
  }
`;

const EvenlySpacedRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
`;

class NewReportModal extends React.Component<Props, State> {

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

  render() {
    const {
      actions,
      caseNum,
      name,
      isLoadingReports,
      isSubmitting
    } = this.props;

    if (isLoadingReports || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    const canSubmit = caseNum && name;

    return (
      <FormContainer>
        <Section>
          <SectionRow>
            <EvenlySpacedRow>
              <ModalHeader>New report</ModalHeader>
            </EvenlySpacedRow>
          </SectionRow>
        </Section>

        <Section>

          <SectionRow>
            <InputHeader>Case number</InputHeader>
            <Accent>*</Accent>
            <StyledInput value={caseNum} onChange={this.getOnChange(REPORT.NEW_REPORT_CASE)} />
          </SectionRow>

          <SpaceBetweenRow>

            <SectionRow>
              <InputHeader>Name of the report</InputHeader>
              <Accent>*</Accent>
              <StyledInput value={name} onChange={this.getOnChange(REPORT.NEW_REPORT_NAME)} />
            </SectionRow>

          </SpaceBetweenRow>
        </Section>

        <Section>
          <SectionRow>
            <CenteredRow>
              <SubtleButton onClick={() => actions.toggleReportModal(false)}>Cancel</SubtleButton>
              <InfoButton disabled={!canSubmit} onClick={this.createReport}>Create</InfoButton>
            </CenteredRow>
          </SectionRow>
        </Section>

      </FormContainer>
    );
  }

}

function mapStateToProps(state :Map<*, *>) :Object {
  const reports = state.get(STATE.REPORT);
  const parameters = state.get(STATE.PARAMETERS);
  const submit = state.get(STATE.SUBMIT);

  return {
    isLoadingReports: reports.get(REPORT.IS_LOADING_REPORTS),
    caseNum: reports.get(REPORT.NEW_REPORT_CASE),
    name: reports.get(REPORT.NEW_REPORT_NAME),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewReportModal));
