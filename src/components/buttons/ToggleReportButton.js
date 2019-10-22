/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/pro-light-svg-icons';

const Button = styled.button`
  border-radius: 3px;
  background-color: ${props => (props.isInReport ? '#8e929b' : '#f0f0f7')};
  height: 30px;
  padding: 0 10px;
  border: none;
  color: ${props => (props.isInReport ? '#ffffff' : '#b7bbc6')};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  span {
    color: ${props => (props.isInReport ? '#ffffff' : '#414345')};
    margin-left: 5px;
    font-size: 12px;
    font-weight: 400;
  }

  &:hover {
    background-color: ${props => (props.isInReport ? '#555e6f' : '#dcdce7')};
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
}
`;

type Props = {
  isInReport :boolean,
  onToggleReport :Function
};

const ToggleReportButton = ({ isInReport, onToggleReport } :Props) => {

  const reportText = isInReport ? 'Remove from report' : 'Add to report';
  const reportIcon = isInReport ? faTimes : faPlus;

  return (
    <Button onClick={onToggleReport} isInReport={isInReport}>
      <FontAwesomeIcon icon={reportIcon} />
      <span>{reportText}</span>
    </Button>
  );
};

export default ToggleReportButton;
