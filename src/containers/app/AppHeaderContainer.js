/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions } from 'lattice-auth';
import { Button, Colors } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import AppNavigationContainer from './AppNavigationContainer';
import OpenLatticeLogo from '../../assets/images/logo_v2.png';
import * as Routes from '../../core/router/Routes';
import {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_WIDTH,
  APP_CONTENT_PADDING,
} from '../../core/style/Sizes';

const { logout } = AuthActions;
const { NEUTRALS } = Colors;

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_HEADER_BORDER :string = '#e6e6eb';

const AppHeaderOuterWrapper = styled.header`
  border-bottom: 1px solid ${APP_HEADER_BORDER};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const AppHeaderInnerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: ${APP_CONTAINER_WIDTH}px;
  padding: 0 ${APP_CONTENT_PADDING}px;
`;

const LeftSideContentWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
`;

const RightSideContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: flex-end;
`;

const LogoTitleWrapperLink = styled(Link)`
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

const AppLogoIcon = styled.img.attrs({
  alt: 'OpenLattice Logo Icon',
  src: OpenLatticeLogo,
})`
  height: 26px;
`;

const AppTitle = styled.h1`
  color: ${NEUTRALS[0]};
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  margin: 0 0 0 10px;
`;

const LogoutButton = styled(Button)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 30px;
  padding: 6px 29px;
`;

const SupportLink = styled.a.attrs({
  href: 'https://support.openlattice.com/servicedesk/customer/portal/1/user/login?destination=portal%2F1'
})`
  text-decoration: none;
  border: none;
  border-radius: 3px;
  background-color: #f0f0f7;
  color: #8e929b;
  font-family: 'Open Sans', sans-serif;
  padding: 12px 35px;
  font-size: 12px;
  line-height: 16px;
  margin-left: 30px;
  padding: 6px 29px;

  &:hover:enabled {
    background-color: #dcdce7;
    cursor: pointer;
  }

  &:active {
    background-color: #b6bbc7;
    color: #ffffff;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    color: #b6bbc7;
  }
`;

type Props = {
  actions :{
    logout :() => void;
  };
};

class AppHeaderContainer extends Component<Props> {

  renderLeftSideContent = () => (
    <LeftSideContentWrapper>
      <LogoTitleWrapperLink to={Routes.ROOT}>
        <AppLogoIcon />
        <AppTitle>
          Astrometrics
        </AppTitle>
      </LogoTitleWrapperLink>
      <AppNavigationContainer />
    </LeftSideContentWrapper>
  )

  renderRightSideContent = () => {

    const { actions } = this.props;
    return (
      <RightSideContentWrapper>
        <SupportLink>
          Contact Support
        </SupportLink>
        <LogoutButton onClick={actions.logout}>
          Log Out
        </LogoutButton>
      </RightSideContentWrapper>
    );
  }

  render() {

    return (
      <AppHeaderOuterWrapper>
        <AppHeaderInnerWrapper>
          { this.renderLeftSideContent() }
          { this.renderRightSideContent() }
        </AppHeaderInnerWrapper>
      </AppHeaderOuterWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    isLoadingApp: state.getIn(['app', 'isLoadingApp'], false),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ logout }, dispatch)
  };
}

export default withRouter<*>(
  connect(mapStateToProps, mapDispatchToProps)(AppHeaderContainer)
);
