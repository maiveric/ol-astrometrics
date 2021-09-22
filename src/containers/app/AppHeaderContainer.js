/*
 * @flow
 */

import React, { Component } from 'react';

import Select from 'react-select';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import AppNavigationContainer from './AppNavigationContainer';
import { switchOrganization } from './AppActions';

import AstrometricsIcon from '../../components/icons/AstrometricsIcon';
import UsernameAndIcon from '../../components/icons/UsernameAndIcon';
import * as Routes from '../../core/router/Routes';
import { orgSelectStyles } from '../../core/style/OrgSelectStyles';
import { APP_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { APP, STATE } from '../../utils/constants/StateConstants';

const { logout } = AuthActions;

const AppHeaderOuterWrapper = styled.header`
  background-color: #121117;
  border-bottom: 1px solid #36353b;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
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
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  margin: 0 0 0 23px;
`;

const LogoutButton = styled.button`
  background: #36353b;
  border-radius: 3px;
  border: none;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 150%;
  margin-left: 30px;
  padding: 7px 29px;
  text-align: center;

  &:hover {
    background: #4f4e54;
    cursor: pointer;
  }

  &:active {
    background: #4f4e54;
  }
`;

const SupportLink = styled.a.attrs(() => ({
  href: 'mailto:support@openlattice.com'
}))`
  border-radius: 3px;
  border: none;
  color: #fff;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 150%;
  margin-left: 30px;
  text-decoration: none;
`;

const OrgSelect = styled.div`
  margin-right: 24px;
`;

type Props = {
  actions :{
    logout :() => void;
    switchOrganization :(orgId :string) => Object;
  };
  app :Map;
  isAdmin :boolean;
  loading :boolean;
  organizations :List;
  selectedOrg :string;
};

class AppHeaderContainer extends Component<Props> {

  getDisplayName = () => {
    const userInfo = AuthUtils.getUserInfo() || {};
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
          value={organizations.find((option) => option.value === selectedOrg)}
          isClearable={false}
          isLoading={loading}
          isMulti={false}
          onChange={this.switchOrganization}
          options={organizations.toJS()}
          placeholder="Select..."
          styles={orgSelectStyles} />
    );
  }

  renderLeftSideContent = () => {
    const { isAdmin } = this.props;

    return (
      <LeftSideContentWrapper>
        <LogoTitleWrapperLink to={Routes.MAP_ROUTE}>
          <AstrometricsIcon />
          <AppTitle>
            Astrometrics
          </AppTitle>
        </LogoTitleWrapperLink>
        <AppNavigationContainer isAdmin={isAdmin} />
      </LeftSideContentWrapper>
    );
  }

  renderRightSideContent = () => {

    const { actions } = this.props;

    let logoutText :string = 'Logout';
    const userInfo :{ id ?:string } = AuthUtils.getUserInfo() || { id: '' };
    if (userInfo.id && userInfo.id.startsWith('samlp|NCRIC')) {
      logoutText = 'Back to NCRIC';
    }

    return (
      <RightSideContentWrapper>
        <OrgSelect>{ this.renderOrgSelector() }</OrgSelect>
        <UsernameAndIcon username={this.getDisplayName()} />
        <SupportLink>
          Support
        </SupportLink>
        <LogoutButton onClick={actions.logout}>
          {logoutText}
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
    isAdmin: app.get(APP.IS_ADMIN, false),
    loading: app.get(APP.LOADING, false),
    selectedOrg: app.get(APP.SELECTED_ORG_ID, ''),
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
