import styled from 'styled-components';

const SecondaryButton = styled.button`
  border-radius: 3px;
  background-color: #CAC9CE;
  color: #070709;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 150%;
  padding: 7px;
  width: 100%;
  border: none;

  &:hover:enabled {
    background-color: #E2E1E7;
    cursor: pointer;
  }

  &:disabled {
    color: #98979D;
  }

  &:focus {
    outline: none;
  }

  &:focus {
    outline: none;
  }

`;

export default SecondaryButton;
