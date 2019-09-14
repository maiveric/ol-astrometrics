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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';

import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import SearchableSelect from '../../components/controls/SearchableSelect';
import SubtleButton from '../../components/buttons/SubtleButton';
import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import {
  STATE,
  ALERTS,
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

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  padding-top: 20px;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: ${props => props.width || 100}%;
  max-width: ${props => props.width || 100}%;

  span {
    font-size: 11px;
    color: #807F85;
  }

  div {
    font-size: 14px;
    color: #B1B0B6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;


class ReportRow extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  onRename = () => {
    console.log('rename');
  }

  onDelete = () => {
    console.log('delete');
  }

  render() {
    const { actions, report, expired } = this.props;

    const entityKeyId = getEntityKeyId(report);

    return (
      <Report expired={expired}>
        <ReportHeaderRow>
          <div>
            <div>{getValue(report, PROPERTY_TYPES.NAME)}</div>
            <span>{getValue(report, PROPERTY_TYPES.CASE_NUMBER)}</span>
          </div>

          <div>
            <SubtleButton onClick={this.onRename}>Rename</SubtleButton>
            <SubtleButton onClick={this.onDelete}>Delete</SubtleButton>
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

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ReportRow));
