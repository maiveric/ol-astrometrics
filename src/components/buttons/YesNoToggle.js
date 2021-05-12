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
    cursor: pointer;
  }
`;

const Button = styled.div`
  background-color: #ffffff;
  height: 18px;
  width: 18px;
  margin: 0 3px;
  border-radius: 50%;
`

const YesNoToggle = ({ isActive, onToggle} ) => {

  return (
    <SliderWrapper isActive={isActive} onClick={onToggle}>
      <Button />
    </SliderWrapper>
  )
}

export default YesNoToggle;
