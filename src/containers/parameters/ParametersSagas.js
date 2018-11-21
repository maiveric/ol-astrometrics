/*
 * @flow
 */

import axios from 'axios';
import { SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  GEOCODE_ADDRESS,
  SEARCH_AGENCIES,
  geocodeAddress,
  searchAgencies
} from './ParametersActionFactory';

const GEOCODER_URL_PREFIX = 'http://ec2-160-1-30-195.us-gov-west-1.compute.amazonaws.com/nominatim/search/';
const GEOCODER_URL_SUFFIX = '?format=json';

function* geocodeAddressWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(geocodeAddress.request(action.id));

    const response = yield call(axios, {
      method: 'get',
      url: `${GEOCODER_URL_PREFIX}${window.encodeURI(action.value)}${GEOCODER_URL_SUFFIX}`
    });

    yield put(geocodeAddress.success(action.id, response.data));
  }
  catch (error) {
    yield put(geocodeAddress.failure(action.id, error));
  }
  finally {
    yield put(geocodeAddress.finally(action.id));
  }
}

export function* geocodeAddressWatcher() :Generator<*, *, *> {
  yield takeEvery(GEOCODE_ADDRESS, geocodeAddressWorker);
}

function* searchAgenciesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(searchAgencies.request(action.id));
    const { value, entitySetId } = action.value;

    const results = yield call(SearchApi.searchEntitySetData, entitySetId, {
      start: 0,
      maxHits: 20,
      searchTerm: value
    });

    const { hits } = results;
    yield put(searchAgencies.success(action.id, hits));
  }
  catch (error) {
    yield put(searchAgencies.failure(action.id, error));
  }
  finally {
    yield put(searchAgencies.finally(action.id));
  }
}

export function* searchAgenciesWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_AGENCIES, searchAgenciesWorker);
}
