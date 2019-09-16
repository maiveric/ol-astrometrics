import styled from 'styled-components';

const InfoButton = styled.button`
  border-radius: ${props => (props.round ? '50%' : '3px')};
  background-color: #674FEF;
  color: #ffffff;
  border: none;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  padding: ${props => (props.round ? '5px 8px' : '10px 70px')};
  width: ${props => (props.fullSize ? '100%' : 'fit-content')};

  &:hover {
    background-color: #8471F1;
    cursor: pointer;
  }

  &:active {
    background-color: #8471F1;
  }

  &:disabled {
    background-color: #48416E;
    color: #5F5887;
    border: none;

    &:hover {
      cursor: default;
    }
  }

  &:focus {
    outline: none;
  }
`;

export default InfoButton;
