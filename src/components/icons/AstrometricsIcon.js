import React from 'react';
import styled from 'styled-components';

const OuterCircle = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;

  background: #F3F1F5;
`;

const FloatingCircle = styled.div`
  position: absolute;
  width: 7px;
  height: 7px;
  right: 3px;
  top: 3px;
  border-radius: 50%;

  background: #FF83BA;
`;

const InnerCircle = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;

  /* Purple/01 */

  background: #674FEF;
`;

const Icon = () => (
  <OuterCircle>
    <FloatingCircle />
    <InnerCircle />
  </OuterCircle>
);

export default Icon;
