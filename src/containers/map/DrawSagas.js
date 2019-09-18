/*
 * @flow
 */

import moment from 'moment';
import {
  all,
  call,
  put,
  select,
  take,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { AppApi, EntityDataModelApi, SearchApi } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import type { SequenceAction } from 'redux-reqseq';

import NewMapConfig from '../../config/formconfig/NewMapConfig';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  getAppFromState,
  getEntitySetId,
  getParamsFromState,
  getDrawFromState,
  getUserIdFromState
} from '../../utils/AppUtils';
import {
  LOAD_SAVED_MAPS,
  SAVE_MAP,
  loadSavedMaps,
  saveMap
} from './DrawActionFactory';
import { submit } from '../submit/SubmitActionFactory';

import { APP_TYPES } from '../../utils/constants/DataModelConstants';
import { DRAW, PARAMETERS, SAVED_MAP } from '../../utils/constants/StateConstants';

function takeReqSeqSuccessFailure(reqseq :RequestSequence, seqAction :SequenceAction) {
  return take(
    (anAction :Object) => (anAction.type === reqseq.SUCCESS && anAction.id === seqAction.id)
        || (anAction.type === reqseq.FAILURE && anAction.id === seqAction.id)
  );
}

function* saveMapWorker(action :SequenceAction) {
  try {
    yield put(saveMap.request(action.id));

    const userInfo = AuthUtils.getUserInfo();
    const userId = userInfo.email || userInfo.id;

    const draw = yield select(getDrawFromState);
    const params = yield select(getParamsFromState);

    const mapDefinition = {
      [SAVED_MAP.NAME]: draw.get(DRAW.NEW_MAP_NAME),
      [SAVED_MAP.FEATURES]: draw.get(DRAW.DRAW_ZONES),
      [SAVED_MAP.DATE_CREATED]: moment().toISOString(true),
      [SAVED_MAP.CREATED_BY]: userId
    };

    const app = yield select(getAppFromState);
    const config = NewMapConfig;
    const values = {
      [DRAW.NEW_MAP_DEFINITION]: JSON.stringify(mapDefinition),
      [PARAMETERS.CASE_NUMBER]: params.get(PARAMETERS.CASE_NUMBER)
    };

    const submitAction = submit({
      app,
      config,
      values,
      includeUserId: true
    });
    yield put(submitAction);
    const submitRes = yield takeReqSeqSuccessFailure(submit, submitAction);

    if (submitRes.type === submit.SUCCESS) {

      const { value } = submitRes;
      const newMapEntityKeyId = value[APP_TYPES.SAVED_MAP][0];

      const reloadMapsAction = loadSavedMaps();
      yield put(reloadMapsAction);
      yield takeReqSeqSuccessFailure(submit, reloadMapsAction);

      yield put(saveMap.success(action.id, newMapEntityKeyId));
    }
    else {
      yield put(saveMap.failure(action.id));
    }

    yield put(saveMap.success(action.id, mapDefinition));
  }
  catch (error) {
    yield put(saveMap.failure(action.id, error));
  }
  finally {
    yield put(saveMap.finally(action.id));
  }
}

export function* saveMapWatcher() :Generator<*, *, *> {
  yield takeEvery(SAVE_MAP, saveMapWorker);
}

function* loadSavedMapsWorker(action :SequenceAction) {
  try {
    yield put(loadSavedMaps.request(action.id));
    const app = yield select(getAppFromState);
    const userEntitySetId = getEntitySetId(app, APP_TYPES.USERS);
    const savedMapsEntitySetId = getEntitySetId(app, APP_TYPES.SAVED_MAPS);
    const userEntityKeyId = getUserIdFromState(app);

    const savedMapNeighbors = yield call(
      SearchApi.searchEntityNeighborsWithFilter,
      userEntitySetId,
      {
        entityKeyIds: [userEntityKeyId],
        sourceEntitySetIds: [savedMapsEntitySetId],
        destinationEntitySetIds: []
      }
    );

    let savedMaps = Map();
    const savedMapsForUser = savedMapNeighbors[userEntityKeyId];

    if (savedMapsForUser) {

      fromJS(savedMapsForUser).forEach((neighborObj) => {
        const neighborDetails = neighborObj.get('neighborDetails');
        const entityKeyId = getEntityKeyId(neighborDetails);
        savedMaps = savedMaps.set(entityKeyId, neighborDetails);
      });

    }

    yield put(loadSavedMaps.success(action.id, savedMaps));
  }
  catch (error) {
    console.error(error);
    yield put(loadSavedMaps.failure(action.id, error));
  }
  finally {
    yield put(loadSavedMaps.finally(action.id));
  }
}

export function* loadSavedMapsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_SAVED_MAPS, loadSavedMapsWorker);
}
