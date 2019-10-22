import styled from 'styled-components';

const BasicButton = styled.button`
  border: none;
  border-radius: 3px;
  background-color: #CAC9CE;
  color: #070709;
  font-family: 'Open Sans', sans-serif;
  padding: 12px 35px;
  font-size: 14px;
  font-weight: 500;

  &:hover:enabled {
    background-color: #E2E1E7;
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    color: #98979D;
  }
`;

export default BasicButton;
