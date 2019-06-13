import { Constants } from 'lattice';
import {
  List,
  Map,
  isImmutable
} from 'immutable';

import { PERSON_ENTITY_TYPE_FQN, PROPERTY_TYPES, SEARCH_PREFIX } from './constants/DataModelConstants';

const { OPENLATTICE_ID_FQN } = Constants;

export const getFqnObj = (fqnStr) => {
  const splitStr = fqnStr.split('.');
  return {
    namespace: splitStr[0],
    name: splitStr[1]
  };
};

export const getFqnString = (fqn) => {
  let { namespace, name } = fqn;
  if (isImmutable(fqn)) {
    namespace = fqn.get('namespace');
    name = fqn.get('name');
  }
  return `${namespace}.${name}`;
};

export const getEntityKeyId = entity => entity.getIn([OPENLATTICE_ID_FQN, 0]);

export const groupNeighbors = (neighbors) => {
  let groupedNeighbors = Map();
  neighbors.forEach((neighbor) => {
    const assocId = neighbor.getIn(['associationEntitySet', 'id'], null);
    const neighborId = neighbor.getIn(['neighborEntitySet', 'id'], null);

    if (assocId && neighborId) {
      groupedNeighbors = groupedNeighbors.set(
        assocId,
        groupedNeighbors.get(assocId, Map()).set(
          neighborId,
          groupedNeighbors.getIn([assocId, neighborId], List()).push(neighbor)
        )
      );
    }
  });

  return groupedNeighbors;
};

export const getEntitySetPropertyTypes = ({ selectedEntitySet, entityTypesById, propertyTypesById }) => {
  if (!selectedEntitySet) {
    return List();
  }

  return entityTypesById
    .getIn([selectedEntitySet.get('entityTypeId'), 'properties'], List())
    .map(propertyTypeId => propertyTypesById.get(propertyTypeId));
};

export const isPersonType = ({ selectedEntitySet, entityTypesById }) => !!selectedEntitySet && getFqnString(
  entityTypesById.getIn([selectedEntitySet.get('entityTypeId'), 'type'], Map())
) === PERSON_ENTITY_TYPE_FQN;

export const getCoordinates = (entity) => {
  const coords = entity.getIn([PROPERTY_TYPES.COORDINATE, 0], '').split(',');
  const [latitude, longitude] = coords;
  if (Number.isNaN(Number.parseFloat(longitude, 0), 10) || Number.isNaN(Number.parseFloat(latitude, 0), 10)) {
    return [0, 0];
  }

  return [longitude, latitude];
};

export const stripIdField = (entity) => {
  if (isImmutable(entity)) {
    return entity.delete(OPENLATTICE_ID_FQN).delete('id');
  }

  const newEntity = Object.assign({}, entity);
  if (newEntity[OPENLATTICE_ID_FQN]) {
    delete newEntity[OPENLATTICE_ID_FQN];
  }
  if (newEntity.id) {
    delete newEntity.id;
  }
  return newEntity;
};

export const getSearchTerm = (propertyTypeId, searchString) => `${SEARCH_PREFIX}.${propertyTypeId}:"${searchString}"`;

export const getDateSearchTerm = (
  propertyTypeId,
  startDate,
  endDate
) => `${SEARCH_PREFIX}.${propertyTypeId}:[${startDate} TO ${endDate}]`;

export const getDisplayNameForId = (idToNameMap, displayName) => idToNameMap.findKey(value => value === displayName);

export const formatNameIdForDisplay = (entity) => {
  const id = entity.getIn([PROPERTY_TYPES.ID, 0]);
  const name = entity.getIn([PROPERTY_TYPES.NAME, 0], '[unknown]');

  return `${name} (${id})`;
};
