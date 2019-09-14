/*
 * @flow
 */

import React, { Component } from 'react';

import Select from 'react-select';
import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import { Button, Colors } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import AppNavigationContainer from './AppNavigationContainer';
import AstrometricsIcon from '../../components/icons/AstrometricsIcon';
import UsernameAndIcon from '../../components/icons/UsernameAndIcon';
import * as Routes from '../../core/router/Routes';
import { STATE, APP } from '../../utils/constants/StateConstants';
import { APP_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { switchOrganization } from './AppActions';
import { orgSelectStyles } from '../../core/style/OrgSelectStyles';

const { logout } = AuthActions;

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_HEADER_BORDER :string = '#36353B';

const AppHeaderOuterWrapper = styled.header`
  border-bottom: 1px solid ${APP_HEADER_BORDER};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  background-color: #121117;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
`;

const AppHeaderInnerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  min-width: ${APP_CONTAINER_WIDTH}px;
  padding: 0 24px;
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

const AppTitle = styled.h1`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  margin: 0 0 0 23px;
`;

const LogoutButton = styled(Button)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 30px;
  padding: 7px 29px;
  background: #36353B;
  border-radius: 3px;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  border: none;

  text-align: center;

  color: #FFFFFF;

  &:hover {
    background: #4F4E54;
  }

  &:active {
    background: #4F4E54;
  }
`;

const SupportLink = styled.a.attrs(_ => ({
  href: 'https://support.openlattice.com/servicedesk/customer/portal/1/user/login?destination=portal%2F1'
}))`
  text-decoration: none;
  border: none;
  border-radius: 3px;
  color: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  margin-left: 30px;
`;

const OrgSelect = styled.div`
  margin-right: 24px;
`;

type Props = {
  actions :{
    logout :() => void;
    switchOrganization :(orgId :string) => Object;
  };
};

class AppHeaderContainer extends Component<Props> {

  getDisplayName = () => {
    const userInfo = AuthUtils.getUserInfo();
    return (userInfo.email && userInfo.email.length > 0) ? userInfo.email : '';
  };

  switchOrganization = (organization) => {
    const { actions, app } = this.props;
    const selectedOrganizationId = app.get(APP.SELECTED_ORG_ID);
    if (organization.value !== selectedOrganizationId) {
      actions.switchOrganization(organization.value);
    }
  }

  renderOrgSelector = () => {
    const { organizations, selectedOrg, loading } = this.props;

    return (
      <Select
          value={organizations.find(option => option.value === selectedOrg)}
          isClearable={false}
          isLoading={loading}
          isMulti={false}
          onChange={this.switchOrganization}
          options={organizations.toJS()}
          placeholder="Select..."
          styles={orgSelectStyles} />
    );
  }

  renderLeftSideContent = () => (
    <LeftSideContentWrapper>
      <LogoTitleWrapperLink to={Routes.ROOT}>
        <AstrometricsIcon />
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
        <OrgSelect>{ this.renderOrgSelector() }</OrgSelect>
        <UsernameAndIcon username={this.getDisplayName()} />
        <SupportLink>
          Support
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

  const app = state.get(STATE.APP);

  const organizations = app.get(APP.ORGS_BY_ID).entrySeq().map(([value, organization]) => {
    const label = organization.get('title', '');
    return { label, value };
  });

  return {
    app,
    organizations,
    selectedOrg: app.get(APP.SELECTED_ORG_ID, ''),
    loading: app.get(APP.LOADING, false),
    isLoadingApp: state.getIn(['app', 'isLoadingApp'], false),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ logout, switchOrganization }, dispatch)
  };
}

export default withRouter<*>(
  connect(mapStateToProps, mapDispatchToProps)(AppHeaderContainer)
);
