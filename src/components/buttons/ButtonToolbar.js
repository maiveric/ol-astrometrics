/*
 * @flow
 */

import React from 'react';
import styled, { css } from 'styled-components';

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: ${props => (props.noPadding ? 0 : '20px')};
`;

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  border-top: 1px solid #CAC9CE;
  border-bottom: 1px solid #CAC9CE;
  border-right: 1px solid #CAC9CE;
  text-decoration: none;
  padding: 10px 50px;
  min-width: 130px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: ${props => (props.selected ? 600 : 400)};
  line-height: 150%;
  background-color: ${props => (props.selected ? '#CAC9CE' : 'transparent')};
  color: ${props => (props.selected ? '#000000' : '#CAC9CE')};

  &:hover {
    cursor: pointer;

    ${(props) => {
      if (!props.selected) {
        return css`
          color: #000000;
          background-color: #CAC9CE;
        `;
      }
      return '';
    }}
  }

  &:focus {
    outline: none;
  }

  &:first-child {
    border-radius: 4px 0 0 4px;
    border-left: 1px solid #ceced9;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

type SearchOption = {
  onClick :() => void,
  value :string,
  label :string
};

type Props = {
  options :SearchOption[],
  value :string,
  noPadding? :boolean
}

const ButtonToolbar = ({ options, value, noPadding } :Props) => (
  <ToolbarWrapper noPadding={noPadding}>
    { options.map(option => (
      <StyledButton
          key={option.value}
          onClick={option.onClick}
          selected={option.value === value}>
        {option.label}
      </StyledButton>
    )) }
  </ToolbarWrapper>
);

ButtonToolbar.defaultProps = {
  noPadding: false
};

export default ButtonToolbar;
