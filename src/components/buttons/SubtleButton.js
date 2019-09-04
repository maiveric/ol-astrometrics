import styled from 'styled-components';

const SubtleButton = styled.button`
  border-radius: 3px;
  background-color: transparent;
  color: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 150%;
  padding: 7px;
  width: 100%;
  border: none;

  &:hover:enabled {
    background-color: #36353B;
    cursor: pointer;
  }

  &:disabled {
    color: #36353B;
  }

  &:focus {
    outline: none;
  }

`;

export default SubtleButton;
