/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect, Route, Switch } from 'react-router';
import type { RequestSequence } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import EulaContainer from '../eula/EulaContainer';
import ExploreContainer from '../explore/ExploreContainer';
import Spinner from '../../components/spinner/Spinner';
import * as Routes from '../../core/router/Routes';
import { loadApp } from './AppActions';
import { termsAreAccepted } from '../../utils/CookieUtils';
import { APP_NAME } from '../../utils/constants/Constants';
import { APP_CONTAINER_WIDTH } from '../../core/style/Sizes';

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_CONTENT_BG :string = '#f8f8fb';

const AppContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  min-width: ${APP_CONTAINER_WIDTH}px;
  padding: 0;
`;

const AppContentOuterWrapper = styled.main`
  background-color: ${APP_CONTENT_BG};
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  position: relative;
`;

const AppContentInnerWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
`;

type Props = {
  actions :{
    loadApp :RequestSequence;
    loadDepartmentsAndDevices :RequestSequence;
  };
  isLoadingApp :boolean;
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;
    actions.loadApp(APP_NAME);
  }

  renderAppContent = () => {

    const { isLoadingApp } = this.props;
    if (isLoadingApp) {
      return (
        <Spinner />
      );
    }

    if (!termsAreAccepted()) {
      return <EulaContainer />;
    }

    return (
      <Switch>
        <Route path={Routes.EXPLORE} component={ExploreContainer} />
        <Redirect to={Routes.EXPLORE} />
      </Switch>
    );
  }

  render() {

    return (
      <AppContainerWrapper>
        <AppHeaderContainer />
        <AppContentOuterWrapper>
          <AppContentInnerWrapper>
            { this.renderAppContent() }
          </AppContentInnerWrapper>
        </AppContentOuterWrapper>
      </AppContainerWrapper>
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
    actions: bindActionCreators({ loadApp }, dispatch)
  };
}

export default connect<*, *, *, *, *, *>(mapStateToProps, mapDispatchToProps)(AppContainer);
