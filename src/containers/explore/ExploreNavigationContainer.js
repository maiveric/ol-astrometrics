/*
 * @flow
 */

import React, { Component } from 'react';


import styled from 'styled-components';
import { withRouter } from 'react-router';

import InnerNavBar from '../../components/nav/InnerNavBar';
import NavLinkWrapper from '../../components/nav/NavLinkWrapper';
import * as Routes from '../../core/router/Routes';

const NavigationContentWrapper = styled(InnerNavBar)`
  padding: 0 28px;
`;

type Props = {};

class ExploreNavigationContainer extends Component<Props> {

  render() {

    return (
      <NavigationContentWrapper>
        <NavLinkWrapper to={Routes.MAP_ROUTE}>
          Map
        </NavLinkWrapper>
        <NavLinkWrapper to={Routes.ALERTS_ROUTE}>
          Alerts
        </NavLinkWrapper>
        <NavLinkWrapper to={Routes.REPORTS_ROUTE}>
          Reports
        </NavLinkWrapper>
      </NavigationContentWrapper>
    );
  }
}

export default withRouter<*>(ExploreNavigationContainer);
