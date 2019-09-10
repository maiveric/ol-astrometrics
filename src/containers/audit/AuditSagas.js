/*
 * @flow
 */

import moment from 'moment';
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { AppApi, PrincipalsApi, SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getFqnString, getEntityKeyId, getDateSearchTerm } from '../../utils/DataUtils';
import {
  getAppFromState,
  getAuditFromState,
  getEntitySetId,
  getPropertyTypeId
} from '../../utils/AppUtils';
import {
  LOAD_AUDIT_DATA,
  loadAuditData
} from './AuditActionFactory';

import { AUDIT } from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

const getEmailFromNeighbors = (neighborsById, entityKeyId, usersById) => {
  const neighbors = neighborsById[entityKeyId];
  if (neighbors && neighbors.length) {

    const [{ neighborDetails }] = neighbors;

    if (neighborDetails) {
      const { [PROPERTY_TYPES.PERSON_ID]: personIds } = neighborDetails;

      if (personIds && personIds.length) {

        const { email, user_id: userId } = usersById[personIds[0]];

        const id = email || userId;

        if (id) {
          return id;
        }
      }
    }
  }

  return 'Unknown';
};

function* getUsersById() {
  try {
    const users = yield call(PrincipalsApi.getAllUsers);

    return users;
  }
  catch (error) {
    console.error(error);
    return {};
  }
}

function* loadAuditDataWorker(action :SequenceAction) {
  try {
    yield put(loadAuditData.request(action.id));

    const usersById = yield call(getUsersById);

    const app = yield select(getAppFromState);
    const audit = yield select(getAuditFromState);

    const searchesEntitySetId = getEntitySetId(app, APP_TYPES.SEARCHES);
    const usersEntitySetId = getEntitySetId(app, APP_TYPES.USERS);
    const dateTimePTId = yield select(state => getPropertyTypeId(state, PROPERTY_TYPES.LAST_REPORTED_DATE_TIME));

    const startDate = audit.get(AUDIT.START_DATE).format('YYYY-MM-DD');
    const endDate = audit.get(AUDIT.END_DATE).format('YYYY-MM-DD');

    const { hits } = yield call(SearchApi.searchEntitySetData, searchesEntitySetId, {
      start: 0,
      maxHits: 10000,
      fuzzy: false,
      searchTerm: getDateSearchTerm(dateTimePTId, startDate, endDate)
    });
    let searches = fromJS(hits);

    const entityKeyIds = searches.map(getEntityKeyId).toJS();
    const neighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, searchesEntitySetId, {
      entityKeyIds,
      sourceEntitySetIds: [],
      destinationEntitySetIds: [usersEntitySetId]
    });

    searches = searches.map((search) => {
      const email = getEmailFromNeighbors(neighbors, getEntityKeyId(search), usersById);
      return search.set([PROPERTY_TYPES.PERSON_ID], email);
    }).sort((search1, search2) => {
      const dateTime1 = search1.getIn([PROPERTY_TYPES.LAST_REPORTED_DATE_TIME, 0], '');
      const dateTime2 = search2.getIn([PROPERTY_TYPES.LAST_REPORTED_DATE_TIME, 0], '');

      return moment(dateTime1).isAfter(dateTime2) ? -1 : 1;
    });

    yield put(loadAuditData.success(action.id, searches));
  }
  catch (error) {
    console.error(error)
    yield put(loadAuditData.failure(action.id, error));
  }
  finally {
    yield put(loadAuditData.finally(action.id));
  }
}

export function* loadAuditDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_AUDIT_DATA, loadAuditDataWorker);
}
