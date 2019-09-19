/*
 * @flow
 */

import React, { Component } from 'react';


import styled from 'styled-components';
import { withRouter } from 'react-router';

import NavLinkWrapper from '../../components/nav/NavLinkWrapper';
import * as Routes from '../../core/router/Routes';

const NavigationContentWrapper = styled.nav`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
  margin-left: 30px;
`;

type Props = {
  isAdmin :boolean
};

const AppNavigationContainer = ({ isAdmin }) => (
  <NavigationContentWrapper>
    <NavLinkWrapper to={Routes.EXPLORE}>
      Search
    </NavLinkWrapper>
    {
      isAdmin ? (
        <>
          <NavLinkWrapper to={Routes.AUDIT}>
            Audit Log
          </NavLinkWrapper>
        </>
      ) : null
    }
  </NavigationContentWrapper>
);

export default withRouter<*>(AppNavigationContainer);
