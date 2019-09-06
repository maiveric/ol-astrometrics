/*
 * @flow
 */

import React, { Component } from 'react';


import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';

import InnerNavBar from '../../components/nav/InnerNavBar';
import * as Routes from '../../core/router/Routes';

const { NEUTRALS, PURPLES } = Colors;

const NAV_LINK_ACTIVE_CLASSNAME :string = 'nav-link-active';

const NavigationContentWrapper = styled(InnerNavBar)`
  padding: 0 28px;
`;

const NavLinkWrapper = styled(NavLink).attrs({
  activeClassName: NAV_LINK_ACTIVE_CLASSNAME
})`
  align-items: center;
  border-bottom: 3px solid transparent;
  color: #807F85;
  display: flex;
  font-size: 12px;
  letter-spacing: 0;
  margin-right: 30px;
  outline: none;
  padding: 20px 0;
  text-align: left;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: #ffffff;
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.${NAV_LINK_ACTIVE_CLASSNAME} {
    border-bottom: 1px solid #ffffff;
    color: #FFFFFF;
    font-weight: 600;
  }
`;

type Props = {};

class AppNavigationContainer extends Component<Props> {

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

export default withRouter<*>(AppNavigationContainer);
