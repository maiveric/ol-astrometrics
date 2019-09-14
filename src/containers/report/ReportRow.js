/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';

import SubtleButton from '../../components/buttons/SubtleButton';
import {
  STATE,
  ALERTS,
  EDM,
  SEARCH_PARAMETERS,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, getValue } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  report :Map,
  actions :{
    selectReport :Function
  }
}

type State = {
  expanded :boolean
};

const Report = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 14px;
}

  padding: 16px;
  border-bottom: 1px solid #36353B;

  &:first-child {
    border-top: 1px solid #36353B;
  }
`;

const ReportHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 14px;
  color: ${props => (props.expired ? '#b6bbc7' : '#135')};

  div {
    display: flex;
    flex-direction: row;
    align-items: center;

    &:first-child {

      div {
        color: ${props => (props.expired ? '#807F85' : '#ffffff')};
        font-size: 14px;
        font-weight: 600;
        margin-right: 10px;
      }

      span {
        color: #807F85;
        font-size: 14px;
      }
    }

    &:last-child {

      button {
        margin-left: 10px;
      }

    }
  }
`;

const Icon = styled(FontAwesomeIcon).attrs(props => ({
  icon: faChevronRight
}))`
  color: #CAC9CE;
`;


class ReportRow extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  render() {
    const { actions, report, entitySetId } = this.props;

    const entityKeyId = getEntityKeyId(report);

    const onDelete = () => {

      actions.deleteEntity({
        entitySetId,
        entityKeyId,
        callback: () => actions.loadReports()
      });
    }


    return (
      <Report>
        <ReportHeaderRow>
          <div>
            <div>{getValue(report, PROPERTY_TYPES.NAME)}</div>
            <span>{getValue(report, PROPERTY_TYPES.TYPE)}</span>
          </div>

          <div>
            <SubtleButton onClick={() => actions.toggleRenameReportModal(entityKeyId)}>Rename</SubtleButton>
            <SubtleButton onClick={onDelete}>Delete</SubtleButton>
            <SubtleButton noHover onClick={() => actions.selectReport(entityKeyId)}>
              <Icon />
            </SubtleButton>
          </div>
        </ReportHeaderRow>

      </Report>
    );
  }


}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const alerts = state.get(STATE.ALERTS);
  const parameters = state.get(STATE.PARAMETERS);
  const edm = state.get(STATE.EDM);
  const submit = state.get(STATE.SUBMIT);

  return {
    entitySetId: getEntitySetId(app, APP_TYPES.REPORTS),

    alertsEntitySetId: getEntitySetId(app, APP_TYPES.ALERTS),
    readsEntitySetId: getEntitySetId(app, APP_TYPES.RECORDS),
    alerts: alerts.get(ALERTS.ALERT_LIST),
    isLoadingAlerts: alerts.get(ALERTS.IS_LOADING_ALERTS),
    caseNum: alerts.get(ALERTS.CASE_NUMBER),
    searchReason: alerts.get(ALERTS.SEARCH_REASON),
    plate: alerts.get(ALERTS.PLATE),
    expirationDate: alerts.get(ALERTS.EXPIRATION),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    platePropertyTypeId: edm.getIn([EDM.PROPERTY_TYPES, PROPERTY_TYPES.PLATE, 'id']),
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ReportRow));
