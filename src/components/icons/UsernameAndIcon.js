import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #CAC9CE;
  color: #36353B;
  font-size: 14px;
  font-weight: 600;
`;

const Username = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  margin-left: 12px;
  font-style: normal;
  line-height: 150%;
  /* identical to box height, or 21px */

  text-align: center;

  /* Neutral/07 */

  color: #ffffff;
`;

const UsernameAndIcon = ({ username }) => (
  <Wrapper>
    <Icon><span>{username.length ? username[0].toUpperCase() : '?'}</span></Icon>
    <Username>{username}</Username>
  </Wrapper>
);

export default UsernameAndIcon;
