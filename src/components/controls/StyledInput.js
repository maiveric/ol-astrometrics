import React from 'react';
import styled, { css } from 'styled-components';

const inputStyle = css`
  display: flex;
  flex: 0 1 auto;
  width: 100%;
  font-size: 14px;
  line-height: 19px;
  border-radius: 3px;
  background-color: #36353B;
  border: none;
  color: #ffffff;
  padding: 10px 20px;

  &:hover {
    background-color: #4F4E54;
  }

  &:focus {
    outline: none;
    background-color: #4F4E54;
    border: solid 1px #98979D;
  }

  &::placeholder {
    color: #807F85;
  }

  &:disabled {
    border-radius: 3px;
    color: #8e929b;
    font-weight: normal;
    cursor: default;
  }
`;

const StyledInput = styled.input`${inputStyle}`;
export const StyledTextArea = styled.textarea`${inputStyle}`;

export default StyledInput;
