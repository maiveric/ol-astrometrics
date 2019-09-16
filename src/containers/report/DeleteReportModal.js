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
import SubtleButton from '../../components/buttons/SubtleButton';
import DeleteButton from '../../components/buttons/DeleteButton';
import {
  STATE,
  REPORT,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getValue } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  isSubmitting :boolean,
  entityKeyId :string,
  entitySetId :string,
  report :Map,
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

const SpinnerWrapper = styled.div`
  margin: 30px;
  padding: 30px;
  position: relative;
  width: 100%;
  height: 100%;
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

const ReportDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 150%;
  font-weight: 600;
  font-size: 14px;

  span {
    color: #807f85;
    padding-left: 10px;
  }
`;

const Text = styled.div`
  font-size: 14px;
`;

class DeleteReportModal extends React.Component<Props, State> {

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

  onDelete = () => {
    const { actions, entityKeyId, entitySetId } = this.props;

    actions.deleteEntity({
      entitySetId,
      entityKeyId,
      callback: () => {
        actions.toggleDeleteReportModal(false);
        actions.loadReports();
      }
    });
  }

  render() {
    const {
      entityKeyId,
      isSubmitting,
      actions,
      report
    } = this.props;

    if (!entityKeyId) {
      return null;
    }

    const name = getValue(report, PROPERTY_TYPES.NAME);
    const caseNum = getValue(report, PROPERTY_TYPES.TYPE);

    if (isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    return (
      <FormContainer>
        <SectionRow>
          <ModalHeader>Delete report?</ModalHeader>
        </SectionRow>


        <SectionRow>
          <ReportDetails>
            <div>{name}</div>
            <span>{caseNum}</span>
          </ReportDetails>
        </SectionRow>

        <SectionRow>
          <Text>You will not be able to undo this action.</Text>
        </SectionRow>

        <SectionRow>
          <CenteredRow>
            <SubtleButton onClick={() => actions.toggleDeleteReportModal(false)}>Cancel</SubtleButton>
            <DeleteButton onClick={this.onDelete}>Delete</DeleteButton>
          </CenteredRow>
        </SectionRow>

      </FormContainer>
    );
  }

}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const reports = state.get(STATE.REPORT);
  const submit = state.get(STATE.SUBMIT);

  const entityKeyId = reports.get(REPORT.REPORT_TO_DELETE);

  return {
    entityKeyId,
    entitySetId: getEntitySetId(app, APP_TYPES.REPORTS),
    report: reports.getIn([REPORT.REPORTS, entityKeyId]),
    caseNum: reports.get(REPORT.NEW_REPORT_CASE),
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DeleteReportModal));
