import React from 'react';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';

import SubtleButton from '../buttons/SubtleButton';
import { SIDEBAR_WIDTH, HEADER_HEIGHT } from '../../core/style/Sizes';

const FIELDS = {
  BACKGROUND: 'BACKGROUND',
  HOVER: 'HOVER',
  SECONDARY_TEXT: 'SECONDARY_TEXT',
  BORDER: 'BORDER'
}

const DEFAULT = {
  [FIELDS.BACKGROUND]: '#1F1E24',
  [FIELDS.SECONDARY_TEXT]: '#807F85',
  [FIELDS.BORDER]: '#36353B'
};

const LIGHT = {
  [FIELDS.BACKGROUND]: '#36353B',
  [FIELDS.SECONDARY_TEXT]: '#98979D',
  [FIELDS.BORDER]: '#4F4E54'
};

const getScheme = (props, field) => (props.light ? LIGHT : DEFAULT)[field];

const Sidebar = styled.div`
  width: ${SIDEBAR_WIDTH}px;
  height: 100%;
  position: fixed;
  z-index: 2;
  background-color: ${DEFAULT.BACKGROUND};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0px -5px 10px rgba(0, 0, 0, 0.25);
`;

export default Sidebar;

export const ScrollableSidebar = styled(Sidebar)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  top: ${HEADER_HEIGHT}px;
  bottom: 0;
  height: calc(100% - ${HEADER_HEIGHT}px);
  color: #ffffff;

  overflow-y: scroll;
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;

  &::-webkit-scrollbar {
    display: none;
  }
`;


/* Header */

export const PaddedSection = styled.div`
  width: 100%;
  padding: 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: ${props => (props.borderBottom ? `1px solid ${getScheme(props, FIELDS.BORDER)}` : 'none')};

  &:hover {
    cursor: ${props => (props.clickable ? 'pointer' : 'default')};
  }
`;

export const HeaderSection = styled(PaddedSection).attrs({
  borderBottom: true
})`
  background-color: ${props => getScheme(props, FIELDS.BACKGROUND)};
  ${props => (props.noPadBottom ? css`
    padding-bottom: 0;
  ` : '')}
`;

const BackButton = styled(SubtleButton).attrs({
  noHover: true
})`
  color: ${props => getScheme(props, FIELDS.SECONDARY_TEXT)};
  display: flex;
  align-items: center;
  padding: 0;
  font-size: 11px;

  span {
    padding-left: 5px;
  }
`;

export const SidebarHeader = ({
  backButtonText,
  backButtonOnClick,
  light,
  noPadBottom,
  mainContent
}) => (
  <HeaderSection light={light} noPadBottom={noPadBottom}>
    <BackButton onClick={backButtonOnClick} light={light}>
      <FontAwesomeIcon icon={faChevronLeft} />
      <span>{backButtonText}</span>
    </BackButton>
    {mainContent}
  </HeaderSection>
);
