import React from 'react';
import styled from 'styled-components';

import AstrometricsIcon from '../icons/AstrometricsIcon';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const Text = styled.div`
  max-width: 500px;
  font-size:  18px;
  font-family: 'Open Sans'
`;

const LogoTitleWrapperLink = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  padding: 15px 0;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    outline: none;
    text-decoration: none;
  }
`;

const AppTitle = styled.h1`
  color: black;
  font-family: 'Open Sans';
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  margin: 0 0 0 23px;
`;

export default class UnderMaintenance extends React.Component {

  render() {

    return (
      <Wrapper>
        <LogoTitleWrapperLink>
          <AstrometricsIcon />
          <AppTitle>
            Astrometrics
          </AppTitle>
        </LogoTitleWrapperLink>
        <Text>
          <span>
            <span>Astrometrics is currently under maintenance. Please check back later, or either email </span>
            <a href="mailto:brandon@openlattice.com">support@openlattice.com</a>
            <span> or call 650-597-2989 if you have any questions.</span>
          </span>
        </Text>
      </Wrapper>
    );
  }
}
