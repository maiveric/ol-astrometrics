/*
 * @flow
 */

import { put, take } from '@redux-saga/core/effects';
import { push } from 'connected-react-router';
import { AuthActions, AuthUtils } from 'lattice-auth';

import { ROOT } from '../router/Routes';

const { LOGOUT } = AuthActions;

function* logoutWatcher() :Generator<*, *, *> {

  while (true) {
    yield take(LOGOUT);
    const userInfo :{ id ?:string } = AuthUtils.getUserInfo() || { id: '' };
    AuthUtils.clearAuthInfo();
    if (userInfo.id && userInfo.id.startsWith('samlp|NCRIC')) {
      window.location.replace('https://secureauth.ncric.ca.gov/secureauth20');
    }
    else {
      yield put(push(ROOT));
    }
  }
}

export {
  logoutWatcher,
};
