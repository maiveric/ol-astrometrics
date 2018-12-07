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
import {
  call,
  put,
  takeEvery,
  all
} from 'redux-saga/effects';

import { stripIdField, getFqnObj } from '../../utils/DataUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import {
  REPLACE_ENTITY,
  SUBMIT,
  replaceEntity,
  submit
} from './SubmitActionFactory';

const {
  FullyQualifiedName
} = Models;

const {
  OPENLATTICE_ID_FQN
} = Constants;

function getEntityId(primaryKey, propertyTypesById, values, fields) {
  const fieldNamesByFqn = {};
  Object.keys(fields).forEach((field) => {
    const fqn = fields[field];
    fieldNamesByFqn[fqn] = field;
  });
  const pKeyVals = [];
  primaryKey.forEach((pKey) => {
    const propertyTypeFqn = new FullyQualifiedName(propertyTypesById[pKey].type).toString();
    const fieldName = fieldNamesByFqn[propertyTypeFqn];
    const value = values[fieldName];
    const rawValues = [value] || [];
    const encodedValues = [];
    rawValues.forEach((rawValue) => {
      encodedValues.push(btoa(rawValue));
    });
    pKeyVals.push(btoa(encodeURI(encodedValues.join(','))));
  });
  return pKeyVals.join(',');
}

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
  if (!entityDescription.id && !Object.keys(details).length) {
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

function* replaceEntityWorker(action :SequenceAction) :Generator<*, *, *> {
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

function* replaceEntityWatcher() :Generator<*, *, *> {
  yield takeEvery(REPLACE_ENTITY, replaceEntityWorker);
}

const getEntityIdObject = (entitySetId, idOrIndex, isId) => ({
  entitySetId,
  idOrIndex,
  isId
});

function* getOrCreateUserId() :Generator<*, *, *> {
  try {
    const userInfo = AuthUtils.getUserInfo();
    let userId = userInfo.id;
    if (userInfo.email && userInfo.email.length > 0) {
      userId = userInfo.email;
    }

    const [userEntitySetId, personIdPropertyTypeId] = yield all([
      call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.USERS),
      call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.PERSON_ID))
    ]);

    const userSearchResults = yield call(SearchApi.searchEntitySetData, userEntitySetId, {
      searchTerm: `${personIdPropertyTypeId}:"${userId}"`,
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

function* submitWorkerNew(action :SequenceAction) :Generator<*, *, *> {
  const {
    config,
    values,
    callback,
    includeUserId
  } = action.value;

  try {
    yield put(submit.request(action.id));

    if (includeUserId) {
      const userId = yield call(getOrCreateUserId);
      values[ID_FIELDS.USER_ID] = userId;
    }

    const allEntitySetIdsRequest = config.entitySets
      .map(entitySet => call(EntityDataModelApi.getEntitySetId, entitySet.name));
    const allEntitySetIds = yield all(allEntitySetIdsRequest);


    const edmDetailsRequest = allEntitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: [
        'EntitySet',
        'EntityType',
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
    console.error(error)
    yield put(submit.failure(action.id, error));
  }
  finally {
    yield put(submit.finally(action.id));
  }
}

function* submitWorker(action :SequenceAction) :Generator<*, *, *> {
  const { config, values, callback } = action.value;

  try {
    yield put(submit.request(action.id));
    const allEntitySetIdsRequest = config.entitySets.map(entitySet =>
      call(EntityDataModelApi.getEntitySetId, entitySet.name));
    const allEntitySetIds = yield all(allEntitySetIdsRequest);

    const edmDetailsRequest = allEntitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: [
        'EntitySet',
        'EntityType',
        'PropertyTypeInEntitySet'
      ]
    }));
    const edmDetails = yield call(EntityDataModelApi.getEntityDataModelProjection, edmDetailsRequest);

    const propertyTypesByFqn = {};
    Object.values(edmDetails.propertyTypes).forEach((propertyType) => {
      const fqn = new FullyQualifiedName(propertyType.type).toString();
      propertyTypesByFqn[fqn] = propertyType;
    });

    const mappedEntities = {};
    config.entitySets.forEach((entityDescription, index) => {
      const entitySetId = allEntitySetIds[index];
      const primaryKey = edmDetails.entityTypes[edmDetails.entitySets[entitySetId].entityTypeId].key;
      const entityList = (entityDescription.multipleValuesField)
        ? values[entityDescription.multipleValuesField] : [values];
      if (entityList) {
        const entitiesForAlias = [];
        entityList.forEach((entityValues) => {
          const details = getEntityDetails(entityDescription, propertyTypesByFqn, entityValues);
          if (shouldCreateEntity(entityDescription, entityValues, details)) {
            let entityId;
            if (entityDescription.entityId) {
              let entityIdVal = entityValues[entityDescription.entityId];
              if (entityIdVal instanceof Array && entityIdVal.length) {
                [entityIdVal] = entityIdVal;
              }
              entityId = entityIdVal;
            }
            else {
              entityId = getEntityId(primaryKey, edmDetails.propertyTypes, entityValues, entityDescription.fields);
            }
            if (entityId && entityId.length) {
              const key = {
                entitySetId,
                entityId
              };
              const entity = { key, details };
              entitiesForAlias.push(entity);
            }
          }
        });
        mappedEntities[entityDescription.alias] = entitiesForAlias;
      }
    });

    const associationAliases = {};
    config.associations.forEach((associationDescription) => {
      const { src, dst, association } = associationDescription;
      const completeAssociation = associationAliases[association] || {
        src: [],
        dst: []
      };
      if (!completeAssociation.src.includes(src)) completeAssociation.src.push(src);
      if (!completeAssociation.dst.includes(dst)) completeAssociation.dst.push(dst);
      associationAliases[association] = completeAssociation;
    });

    const entities = [];
    const associations = [];

    Object.keys(mappedEntities).forEach((alias) => {
      if (associationAliases[alias]) {
        mappedEntities[alias].forEach((associationEntityDescription) => {
          const associationDescription = associationAliases[alias];
          associationDescription.src.forEach((srcAlias) => {
            mappedEntities[srcAlias].forEach((srcEntity) => {
              associationDescription.dst.forEach((dstAlias) => {
                mappedEntities[dstAlias].forEach((dstEntity) => {
                  const src = srcEntity.key;
                  const dst = dstEntity.key;

                  if (src && dst) {
                    const association = Object.assign({}, associationEntityDescription, { src, dst });
                    associations.push(association);
                  }
                });
              });
            });
          });
        });
      }
      else {
        mappedEntities[alias].forEach((entity) => {
          entities.push(entity);
        });
      }
    });

    yield call(DataIntegrationApi.createEntityAndAssociationData, { entities, associations });
    yield put(submit.success(action.id));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    console.error(error)
    yield put(submit.failure(action.id, error));
  }
  finally {
    yield put(submit.finally(action.id));
  }
}

function* submitWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT, submitWorkerNew);
}

export {
  replaceEntityWatcher,
  submitWatcher
};
