/*
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';

import LatticeAuth from 'lattice-auth';
import { ConnectedRouter } from 'connected-react-router/immutable';
import { normalize } from 'polished';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import UnderMaintenance from './components/maintenance/UnderMaintenance';
import AppContainer from './containers/app/AppContainer';
import initializeReduxStore from './core/redux/ReduxStore';
import initializeRouterHistory from './core/router/RouterHistory';
import * as Routes from './core/router/Routes';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

const { AuthRoute, AuthUtils } = LatticeAuth;

/* eslint-disable */
// TODO: move into core/styles
const NormalizeCSS = createGlobalStyle`
  ${normalize()}
`;

const GlobalStyle = createGlobalStyle`
  html,
  body {
    background-color: #1F1E24;
    color: #ffffff;
    font-family: 'Open Sans', sans-serif;
    height: 100%;
    width: 100%;
    line-height: 150%;
  }

  * {
    box-sizing: border-box;
  }

  *::before,
  *::after {
    box-sizing: border-box;
  }

  #app {
    display: block;
    height: 100%;
    width: 100%;
  }
`;
/* eslint-enable */

/*
 * !!! MUST HAPPEN FIRST !!!
 */

LatticeAuth.configure({
  auth0ClientId: __AUTH0_CLIENT_ID__,
  auth0Domain: __AUTH0_DOMAIN__,
  authToken: AuthUtils.getAuthToken(),
});

/*
 * !!! MUST HAPPEN FIRST !!!
 */

const routerHistory = initializeRouterHistory();
const reduxStore = initializeReduxStore(routerHistory);

const IS_UNDER_MAINTENANCE = false;

const APP_ROOT_NODE = document.getElementById('app');

if (IS_UNDER_MAINTENANCE) {
  ReactDOM.render(
    <UnderMaintenance />,
    APP_ROOT_NODE
  );
}

else if (APP_ROOT_NODE) {
  ReactDOM.render(
    <Provider store={reduxStore}>
      <>
        <ConnectedRouter history={routerHistory}>
          <AuthRoute path={Routes.ROOT} component={AppContainer} />
        </ConnectedRouter>
        <NormalizeCSS />
        <GlobalStyle />
      </>
    </Provider>,
    APP_ROOT_NODE
  );
}
