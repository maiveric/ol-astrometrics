import {
  call,
  put,
  takeEvery,
  select,
  all
} from '@redux-saga/core/effects';
import {
  Constants,
  DataApi,
  EntityDataModelApi,
  SearchApi,
  Models
} from 'lattice';
import { AuthUtils } from 'lattice-auth';

import { stripIdField, getFqnObj, getSearchTerm } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import { APP } from '../../utils/constants/StateConstants';
import { getAppFromState, getEntitySetId } from '../../utils/AppUtils';
import {
  PARTIAL_REPLACE_ENTITY,
  REPLACE_ENTITY,
  SUBMIT,
  partialReplaceEntity,
  replaceEntity,
  submit
} from './SubmitActionFactory';

const {
  FullyQualifiedName
} = Models;

const {
  OPENLATTICE_ID_FQN
} = Constants;

function getFormattedValue(value) {
  const valueIsDefined = v => v !== null && v !== undefined && v !== '';

  /* Value is already formatted as an array -- we should filter for undefined values */
  if (value instanceof Array) {
    return value.filter(valueIsDefined);
  }

  /* Value must be converted to an array if it is defined */
  return valueIsDefined(value) ? [value] : [];
}

function getEntityDetails(entityDescription, propertyTypesByFqn, values) {
  const { fields } = entityDescription;
  const entityDetails = {};
  Object.keys(fields).forEach((field) => {
    const fqn = fields[field];
    const propertyTypeId = propertyTypesByFqn[fqn].id;
    const formattedArrayValue = getFormattedValue(values[field]);
    if (formattedArrayValue.length) {
      entityDetails[propertyTypeId] = formattedArrayValue;
    }
  });
  return entityDetails;
}

function shouldCreateEntity(entityDescription, values, details) {
  /* new entities should not be empty (but okay for existing ones for purposes of creating edges) */
  if (!entityDescription.id && (Object.keys(entityDescription.fields).length && !Object.keys(details).length)) {
    return false;
  }

  if (entityDescription.ignoreIfFalse) {
    let allFalse = true;
    entityDescription.ignoreIfFalse.forEach((field) => {
      if (values[field]) allFalse = false;
    });
    if (allFalse) return false;
  }
  return true;
}

function* replaceEntityWorker(action) {
  try {
    yield put(replaceEntity.request(action.id));
    const {
      entityKeyId,
      entitySetId,
      values,
      callback
    } = action.value;

    yield call(DataApi.replaceEntityInEntitySetUsingFqns, entitySetId, entityKeyId, stripIdField(values));

    yield put(replaceEntity.success(action.id));
    if (callback) {
      callback();
    }
  }
  catch (error) {
    yield put(replaceEntity.failure(action.id, error));
  }
  finally {
    yield put(replaceEntity.finally(action.id));
  }
}

function* replaceEntityWatcher() {
  yield takeEvery(REPLACE_ENTITY, replaceEntityWorker);
}

function* partialReplaceEntityWorker(action) {
  try {
    yield put(partialReplaceEntity.request(action.id));
    const {
      entityKeyId,
      entitySetId,
      values,
      callback
    } = action.value;

    const entities = {
      [entityKeyId]: values
    };

    yield call(DataApi.updateEntityData, entitySetId, entities, 'PartialReplace');

    yield put(partialReplaceEntity.success(action.id));
    if (callback) {
      callback();
    }
  }
  catch (error) {
    yield put(partialReplaceEntity.failure(action.id, error));
  }
  finally {
    yield put(partialReplaceEntity.finally(action.id));
  }
}

function* partialReplaceEntityWatcher() {
  yield takeEvery(PARTIAL_REPLACE_ENTITY, partialReplaceEntityWorker);
}

const getEntityIdObject = (entitySetId, idOrIndex, isId) => ({
  entitySetId,
  idOrIndex,
  isId
});

const getAuth0Id = () => {
  const { id } = AuthUtils.getUserInfo();
  return id;
}

export function* getOrCreateUserId() {
  try {
    const userId = getAuth0Id();

    const app = yield select(getAppFromState);
    const userEntitySetId = getEntitySetId(app, APP_TYPES.USERS);

    const personIdPropertyTypeId = yield call(
      EntityDataModelApi.getPropertyTypeId,
      getFqnObj(PROPERTY_TYPES.PERSON_ID)
    );

    const userSearchResults = yield call(SearchApi.searchEntitySetData, userEntitySetId, {
      searchTerm: getSearchTerm(personIdPropertyTypeId, userId),
      start: 0,
      maxHits: 1
    });

    /* If the user entity already exists, return its id from the search result */
    if (userSearchResults.hits.length) {
      return userSearchResults.hits[0][OPENLATTICE_ID_FQN][0];
    }

    /* Otherwise, create a new entity and return its id */
    const idList = yield call(DataApi.createOrMergeEntityData, userEntitySetId, [
      { [personIdPropertyTypeId]: [userId] }
    ]);
    return idList[0];

  }
  catch (error) {
    console.error('Unable to get or create user id');
    console.error(error);
    return undefined;
  }
}

function* submitWorkerNew(action) {
  const {
    config,
    values,
    callback,
    includeUserId
  } = action.value;

  try {
    yield put(submit.request(action.id));

    const app = yield select(getAppFromState);

    if (includeUserId) {
      const userId = yield call(getOrCreateUserId);
      values[ID_FIELDS.USER_ID] = userId;
      values[ID_FIELDS.USER_AUTH_ID] = getAuth0Id();
    }

    const allEntitySetIds = config.entitySets.map(({ name }) => getEntitySetId(app, name));

    const edmDetailsRequest = allEntitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: [
        'PropertyTypeInEntitySet'
      ]
    }));
    const edmDetails = yield call(EntityDataModelApi.getEntityDataModelProjection, edmDetailsRequest);

    const propertyTypesByFqn = {};
    Object.values(edmDetails.propertyTypes).forEach((propertyType) => {
      const fqn = new FullyQualifiedName(propertyType.type).toString();
      propertyTypesByFqn[fqn] = propertyType;
    });

    const entitySetNamesById = {}; // es_uuid -> entitySetName
    const entityIdsByAlias = {}; // alias -> [ { entitySetId, idOrIndex, isId }... ]
    const associationsByAlias = {}; // alias -> [ { entitySetId, entityDetails }... ]
    const entities = {}; // entitySetId -> [ entities... ]
    const associations = {}; // entitySetId -> [ DataAssociation... ]

    const associationEntities = config.associations.map(associationDetails => associationDetails.association);

    config.entitySets.forEach((entityDescription, index) => {
      const {
        alias,
        name,
        multipleValuesField,
        id
      } = entityDescription;
      const isNotAssociationEntity = !associationEntities.includes(entityDescription.alias);
      const entitySetId = allEntitySetIds[index];
      entitySetNamesById[entitySetId] = name;

      /* Initialize keys in maps */
      if (isNotAssociationEntity) {
        entityIdsByAlias[alias] = [];

        if (!entities[entitySetId]) {
          entities[entitySetId] = [];
        }
      }
      else if (!associations[entitySetId]) {
        associations[entitySetId] = [];
        associationsByAlias[alias] = [];
      }

      const entityList = (multipleValuesField) ? values[multipleValuesField] : [values];
      if (entityList) {
        entityList.forEach((entityValues) => {
          const entityDetails = getEntityDetails(entityDescription, propertyTypesByFqn, entityValues);

          if (shouldCreateEntity(entityDescription, entityValues, entityDetails)) {

            if (isNotAssociationEntity) {
              const isId = !!id;
              const idOrIndex = isId ? entityValues[id] : entities[entitySetId].length;
              if (idOrIndex !== undefined && idOrIndex !== null) {

                const entityIdObject = getEntityIdObject(entitySetId, idOrIndex, isId);
                entityIdsByAlias[alias].push(entityIdObject);

                if (!isId) {
                  entities[entitySetId].push(entityDetails);
                }
              }
            }
            else {
              associationsByAlias[alias].push({ entitySetId, entityDetails });
            }
          }
        });
      }
    });

    config.associations.forEach((associationDescription) => {
      const { src, dst, association } = associationDescription;
      associationsByAlias[association].forEach((associationEntityIdObj) => {
        const { entitySetId, entityDetails } = associationEntityIdObj;

        entityIdsByAlias[src].forEach((srcEntityIdObj) => {

          entityIdsByAlias[dst].forEach((dstEntityIdObj) => {

            const srcKey = srcEntityIdObj.isId ? 'srcEntityKeyId' : 'srcEntityIndex';
            const dstKey = dstEntityIdObj.isId ? 'dstEntityKeyId' : 'dstEntityIndex';

            const dataAssociation = {
              srcEntitySetId: srcEntityIdObj.entitySetId,
              [srcKey]: srcEntityIdObj.idOrIndex,
              dstEntitySetId: dstEntityIdObj.entitySetId,
              [dstKey]: dstEntityIdObj.idOrIndex,
              data: entityDetails
            };

            associations[entitySetId].push(dataAssociation);
          });
        });
      });
    });

    const dataGraphIdsById = yield call(DataApi.createEntityAndAssociationData, { entities, associations });
    const dataGraphIds = {};
    Object.keys(dataGraphIdsById).forEach((entitySetId) => {
      const name = entitySetNamesById[entitySetId];
      if (name) {
        dataGraphIds[name] = dataGraphIdsById[entitySetId];
      }
    });
    yield put(submit.success(action.id, dataGraphIds)); // TODO include dataGraphIds

    if (callback) {
      callback(dataGraphIds);
    }
  }
  catch (error) {
    console.error(error);
    yield put(submit.failure(action.id, error));
  }
  finally {
    yield put(submit.finally(action.id));
  }
}

function* submitWatcher() {
  yield takeEvery(SUBMIT, submitWorkerNew);
}

export {
  partialReplaceEntityWatcher,
  replaceEntityWatcher,
  submitWatcher
};
