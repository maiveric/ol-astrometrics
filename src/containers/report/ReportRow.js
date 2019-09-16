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
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, getValue } from '../../utils/DataUtils';
import * as ReportActionFactory from './ReportActionFactory';

type Props = {
  report :Map,
  actions :{
    selectReport :Function,
    toggleRenameReportModal :Function,
    toggleDeleteReportModal :Function
  }
}

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

export const ReportHeaderRow = styled.div`
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

const Icon = styled(FontAwesomeIcon).attrs(_ => ({
  icon: faChevronRight
}))`
  color: #CAC9CE;
`;


const ReportRow = ({ actions, report } :Props) => {

  const entityKeyId = getEntityKeyId(report);

  return (
    <Report>
      <ReportHeaderRow>
        <div>
          <div>{getValue(report, PROPERTY_TYPES.NAME)}</div>
          <span>{getValue(report, PROPERTY_TYPES.TYPE)}</span>
        </div>

        <div>
          <SubtleButton onClick={() => actions.toggleRenameReportModal(entityKeyId)}>Rename</SubtleButton>
          <SubtleButton onClick={() => actions.toggleDeleteReportModal(entityKeyId)}>Delete</SubtleButton>
          <SubtleButton noHover onClick={() => actions.selectReport(entityKeyId)}>
            <Icon />
          </SubtleButton>
        </div>
      </ReportHeaderRow>

    </Report>
  );
};

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
export default withRouter(connect(null, mapDispatchToProps)(ReportRow));
