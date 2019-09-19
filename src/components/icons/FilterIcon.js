import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  background-color: #E2E1E7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 1px;
`;

const Line = styled.div`
  height: 1px;
  width: ${props => props.length}px;
  background-color: #070709;
  &:not(:last-child) {
    margin-bottom: 3px;
  }
`;

export default () => (
  <Wrapper>
    <Line length={12} />
    <Line length={8} />
    <Line length={4} />
  </Wrapper>
);
