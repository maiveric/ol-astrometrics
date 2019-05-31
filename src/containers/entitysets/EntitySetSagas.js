/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  SEARCH_ENTITY_SETS,
  searchEntitySets
} from './EntitySetActionFactory';

function* searchEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(searchEntitySets.request(action.id));
    const results = yield call(SearchApi.searchEntitySetMetaData, action.value);
    yield put(searchEntitySets.success(action.id, results));
  }
  catch (error) {
    console.error(error);
    yield put(searchEntitySets.failure(action.id, error));
  }
  finally {
    yield put(searchEntitySets.finally(action.id));
  }
}

export function* searchEntitySetsWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_ENTITY_SETS, searchEntitySetsWorker);
}
