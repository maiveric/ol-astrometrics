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

  &:hover:enabled {
    background-color: #FF6B5E;
    cursor: pointer;
  }

  &:disabled {
    background-color: #A4453D;
    color: #C27771;
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
