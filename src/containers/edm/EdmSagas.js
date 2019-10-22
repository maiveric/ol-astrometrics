/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { AppApi, EntityDataModelApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getFqnString, getFqnObj } from '../../utils/DataUtils';
import {
  LOAD_DATA_MODEL,
  loadDataModel
} from './EdmActionFactory';

import { APP_TYPES } from '../../utils/constants/DataModelConstants';

function* loadDataModelWorker(action :SequenceAction) {
  try {
    yield put(loadDataModel.request(action.id));
    const appTypes = yield all(
      Object.values(APP_TYPES).map(fqn => call(AppApi.getAppTypeByFqn, getFqnObj(fqn)))
    );
    const entityTypeIds = appTypes.map(({ entityTypeId }) => entityTypeId);
    const projection = yield call(EntityDataModelApi.getEntityDataModelProjection, entityTypeIds
      .filter(id => !!id)
      .map(id => ({
        id,
        type: 'EntityType',
        include: ['PropertyTypeInEntitySet']
      })));

    let entitySets = Map();
    let propertyTypes = Map();

    fromJS(projection.entitySets).forEach((entitySet) => {
      entitySets = entitySets.set(entitySet.get('name'), entitySet);
    });

    fromJS(projection.propertyTypes).forEach((propertyType) => {
      propertyTypes = propertyTypes.set(getFqnString(propertyType.get('type')), propertyType);
    });

    yield put(loadDataModel.success(action.id, { entitySets, propertyTypes }));
  }
  catch (error) {
    yield put(loadDataModel.failure(action.id, error));
  }
  finally {
    yield put(loadDataModel.finally(action.id));
  }
}

export function* loadDataModelWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_DATA_MODEL, loadDataModelWorker);
}
