import styled from 'styled-components';

export default styled.button`
  width: 32px;
  min-width: 32px;
  height: 32px;
  min-height: 32px;
  border-radius: 50%;
  background-color: #36353B;
  color: #E2E1E7;
  border: none;

  &:hover:enabled {
    cursor: pointer;
    background-color: #4F4E54;
  }

  &:disabled {
    background-color: #36353B;
  }

  &:focus {
    outline: none;
  }
`;
