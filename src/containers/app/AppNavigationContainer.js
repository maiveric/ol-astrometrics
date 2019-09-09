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

type Props = {};

class AppNavigationContainer extends Component<Props> {

  render() {

    return (
      <NavigationContentWrapper>
        <NavLinkWrapper to={Routes.EXPLORE}>
          Search
        </NavLinkWrapper>
        <NavLinkWrapper to={Routes.AUDIT}>
          Audit Log
        </NavLinkWrapper>
        <NavLinkWrapper to={Routes.QUALITY}>
          Data Quality
        </NavLinkWrapper>
      </NavigationContentWrapper>
    );
  }
}

export default withRouter<*>(AppNavigationContainer);
