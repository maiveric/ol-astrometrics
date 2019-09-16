import styled from 'styled-components';

const InfoButton = styled.button`
  border-radius: 3px;
  background-color: #EE5345;
  color: #ffffff;
  border: none;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  padding: 10px 70px;
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
