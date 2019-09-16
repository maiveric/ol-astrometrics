/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, OrderedMap } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import SubtleButton from '../../components/buttons/SubtleButton';
import InfoButton from '../../components/buttons/InfoButton';
import {
  STATE,
  EDM,
  REPORT,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getValue } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  isLoadingReports :boolean,
  isSubmitting :boolean,
  entityKeyId :string,
  entitySetId :string,
  name :string,
  namePropertyTypeId :string,
  reports :Map,
  actions :{
    toggleRenameReportModal :(isOpen :boolean) => void,
    loadReports :() => void,
    setReportValue :({ field :string, value :string }) => void,
    partialReplaceEntity :(
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
    const { actions, reports, entityKeyId } = this.props;

    if (entityKeyId) {
      const value = getValue(reports.get(entityKeyId), PROPERTY_TYPES.NAME);

      actions.setReportValue({
        field: REPORT.NEW_REPORT_NAME,
        value
      });
    }
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

  rename = () => {
    const {
      actions,
      namePropertyTypeId,
      entityKeyId,
      entitySetId,
      name
    } = this.props;

    actions.partialReplaceEntity({
      entityKeyId,
      entitySetId,
      values: {
        [namePropertyTypeId]: [name]
      },
      callback: () => {
        actions.toggleRenameReportModal(false);
        actions.loadReports();
      }
    });
  }

  render() {
    const {
      actions,
      name,
      isLoadingReports,
      isSubmitting,
      entityKeyId
    } = this.props;

    if (!entityKeyId) {
      return null;
    }

    if (isLoadingReports || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    const canSubmit = !!name;

    return (
      <FormContainer>
        <Section>
          <SectionRow>
            <EvenlySpacedRow>
              <ModalHeader>Rename report</ModalHeader>
            </EvenlySpacedRow>
          </SectionRow>
        </Section>

        <Section>

          <SectionRow>
            <InputHeader>Name of the report</InputHeader>
            <StyledInput value={name} onChange={this.getOnChange(REPORT.NEW_REPORT_NAME)} />
          </SectionRow>

        </Section>

        <Section>
          <SectionRow>
            <CenteredRow>
              <SubtleButton onClick={() => actions.toggleRenameReportModal(false)}>Cancel</SubtleButton>
              <InfoButton disabled={!canSubmit} onClick={this.rename}>Update</InfoButton>
            </CenteredRow>
          </SectionRow>
        </Section>

      </FormContainer>
    );
  }

}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const reports = state.get(STATE.REPORT);
  const submit = state.get(STATE.SUBMIT);

  return {
    isLoadingReports: reports.get(REPORT.IS_LOADING_REPORTS),
    isSubmitting: submit.get(SUBMIT.SUBMITTING),
    reports: reports.get(REPORT.REPORTS),
    name: reports.get(REPORT.NEW_REPORT_NAME),
    entityKeyId: reports.get(REPORT.RENAME_REPORT_MODAL_OPEN),
    namePropertyTypeId: edm.getIn([EDM.PROPERTY_TYPES, PROPERTY_TYPES.NAME, 'id']),
    entitySetId: getEntitySetId(app, APP_TYPES.REPORTS)
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
