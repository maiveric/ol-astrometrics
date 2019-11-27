/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

const Control = styled.label`
  display: block;
  position: relative;
  padding: 0 10px 0 30px;
  margin-bottom: 15px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: normal;
  color: #36353B;
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};

  input {
    position: absolute;
    z-index: -1;
    opacity: 0;
  }
`;

const CheckboxInput = styled.input.attrs(_ => ({
  type: 'checkbox'
}))`
  position: absolute;
  z-index: -1;
  opacity: 0;
`;

const CheckboxIndicator = styled.div`
  position: absolute;
  top: -3px;
  left: 0;
  height: 20px;
  width: 20px;
  border-radius: 2px;
  background: #4F4E54;
  border: 1px solid #807F85;

  ${Control}:hover input ~ &,
  ${Control} input:focus & {
    background: #36353B;
  }

  ${Control} input:checked ~ & {
    background: #CAC9CE;
  }

  ${Control}:hover input:not([disabled]):checked ~ &,
  ${Control} input:checked:focus & {
    background: #B1B0B6;
  }

  ${Control} input:disabled ~ & {
    background: #36353B;
    opacity: 0.6;
    pointer-events: none;
  }

  &:after {
    content: '';
    position: absolute;
    display: none;
    left: 8px;
    top: 4px;
    width: 3px;
    height: 8px;
    border: solid #36353B;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);

    ${Control} input:checked ~ & {
      display: block;
    }

    ${Control} & {
      left: 7px;
      top: 4px;
      width: 5px;
      height: 10px;
      border: solid #36353B;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    ${Control} input:disabled ~ & {
      border-color: transparent;
    }
  }
`;

type Props = {
  name :string,
  label :string,
  value :string,
  checked :boolean,
  onChange :(event :Object) => void,
  onClick? :(event :Object) => void,
  disabled? :boolean,
  dataSection? :?string
};

const StyledCheckbox = ({
  name,
  label,
  value,
  checked,
  onChange,
  onClick,
  disabled,
  dataSection
} :Props) => (
  <Control disabled={disabled} checked={checked} onClick={onClick}>{label}
    <CheckboxInput
        data-section={dataSection}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <CheckboxIndicator />
  </Control>
);

StyledCheckbox.defaultProps = {
  disabled: false,
  dataSection: '',
  onClick: () => {}
};

export default StyledCheckbox;
