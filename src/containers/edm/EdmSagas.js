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
import { EntityDataModelApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getFqnString } from '../../utils/DataUtils';
import {
  LOAD_DATA_MODEL,
  loadDataModel
} from './EdmActionFactory';

import { ENTITY_SETS } from '../../utils/constants/DataModelConstants';

function* loadDataModelWorker(action :SequenceAction) {
  try {
    yield put(loadDataModel.request(action.id));
    const entitySetIds = yield all(
      Object.values(ENTITY_SETS).map(name => call(EntityDataModelApi.getEntitySetId, name))
    );
    const projection = yield call(EntityDataModelApi.getEntityDataModelProjection, entitySetIds
      .filter(id => !!id)
      .map(id => ({
        id,
        type: 'EntitySet',
        include: ['EntitySet', 'PropertyTypeInEntitySet']
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
