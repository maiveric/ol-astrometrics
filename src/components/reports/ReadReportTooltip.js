/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/pro-regular-svg-icons';

import { getEntityKeyId, getValue } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

const Tooltip = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 5;
  margin-top: -60px;
  width: 230px;
  padding: 12px;
  border-radius: 3px;
  background-color: #E2E1E7;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  font-size: 12px;
  font-weight: 400;
  line-height: 150%;
  color: #000000;
  line-height: normal;
  visibility: hidden;

  article {
    margin-bottom: 8px;
  }

  section {
    display: flex;
    flex-direction: row;
    align-items: center;

    div {
      font-weight: 600;
    }

    span {
      color: #807F85;
      padding-left: 10px;
    }
  }
`;


const TooltipButton = styled.div`
  background-color: #36353B;
  color: #E2E1E7;
  padding: 0;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  margin-left: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    ${Tooltip} {
      visibility: visible;
    }
  }
`;

type Props = {
  reports :List
};

const ReadReportTooltip = ({ reports } :Props) => {

  if (!reports) {
    return null;
  }

  const renderReportRow = (report) => {
    const entityKeyId = getEntityKeyId(report);
    const name = getValue(report, PROPERTY_TYPES.NAME);
    const caseNum = getValue(report, PROPERTY_TYPES.TYPE);

    return (
      <section key={entityKeyId}>
        <div>{name}</div>
        <span>{caseNum}</span>
      </section>
    );
  };

  return (
    <TooltipButton>
      <span><FontAwesomeIcon icon={faCheck} /></span>
      <Tooltip>
        <article>This read has been added to</article>
        {reports.map(renderReportRow)}
      </Tooltip>
    </TooltipButton>
  );
};

export default ReadReportTooltip;
