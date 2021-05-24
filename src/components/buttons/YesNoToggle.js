import React from 'react';
import styled from 'styled-components';

const SliderWrapper = styled.div`
  width: 42px;
  height: 24px;
  border-radius: 18px;
  background-color: ${props => props.isActive ? '#6D49FE' : '#444448'};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${props => props.isActive ? 'flex-end' : 'flex-start'};

  &:hover {
    cursor: ${props => props.isDisabled ? 'default' : 'pointer'};
  }
`;

const Button = styled.div`
  background-color: ${props => props.isDisabled ? '#69696c' : '#ffffff'};
  height: 18px;
  width: 18px;
  margin: 0 3px;
  border-radius: 50%;
`

const YesNoToggle = ({ isActive, isDisabled, onToggle }) => {

  const onClick = (e) => {
    if (isDisabled) {
      return;
    }
    onToggle(e);
  }

  return (
    <SliderWrapper isActive={isActive} isDisabled={isDisabled} onClick={onClick}>
      <Button isDisabled={isDisabled} />
    </SliderWrapper>
  )
}

export default YesNoToggle;
