/*
 * @flow
 */

import {
  Constants,
  DataApi,
  DataIntegrationApi,
  EntityDataModelApi,
  SearchApi,
  Models
} from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { List, Map, fromJS } from 'immutable';
import {
  call,
  put,
  takeEvery,
  all
} from 'redux-saga/effects';

import { getFqnObj } from '../../utils/DataUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { EDM } from '../../utils/constants/StateConstants';
import {
  LOAD_ALERTS,
  loadAlerts
} from './AlertActionFactory';

const {
  OPENLATTICE_ID_FQN
} = Constants;

const getUserId = () => {
  const userInfo = AuthUtils.getUserInfo();
  let userId = userInfo.id;
  if (userInfo.email && userInfo.email.length > 0) {
    userId = userInfo.email;
  }
  return userId;
};

function* loadAlertsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadAlerts.request(action.id));
    const { edm } = action.value;
    const entitySets = edm.get(EDM.ENTITY_SETS, Map());
    const propertyTypes = edm.get(EDM.PROPERTY_TYPES, Map());

    let entitySetId = entitySets.getIn([ENTITY_SETS.USERS, 'id']);
    let alertEntitySetId = entitySets.getIn([ENTITY_SETS.ALERTS, 'id']);
    let propertyTypeId = propertyTypes.getIn([PROPERTY_TYPES.PERSON_ID, 'id']);

    if (!entitySetId || !alertEntitySetId || !propertyTypeId) {
      [entitySetId, alertEntitySetId, propertyTypeId] = yield all([
        call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.USERS),
        call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.ALERTS),
        call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.PERSON_ID)),
      ]);
    }

    const userId = getUserId();
    const searchResults = yield call(SearchApi.searchEntitySetData, entitySetId, {
      start: 0,
      maxHits: 1,
      searchTerm: `${propertyTypeId}:"${userId}"`
    });

    let alerts = List();
    const { hits } = searchResults;
    if (hits.length) {
      const userEntityKeyId = hits[0][OPENLATTICE_ID_FQN][0];

      const alertNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, entitySetId, {
        entityKeyIds: [userEntityKeyId],
        src: [alertEntitySetId]
      });

      alerts = fromJS(alertNeighbors)
        .valueSeq()
        .flatMap(val => val)
        .map(obj => obj.get('neighborDetails'))
        .filter(val => !!val)
        .toList();
    }

    yield put(loadAlerts.success(action.id, alerts));
  }
  catch (error) {
    console.error(error)
    yield put(loadAlerts.failure(action.id, error));
  }
  finally {
    yield put(loadAlerts.finally(action.id));
  }
}

export function* loadAlertsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_ALERTS, loadAlertsWorker);
}
