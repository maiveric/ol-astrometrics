/*
* @flow
*/

import { Constants } from 'lattice';
import {
  List,
  Map,
  isImmutable
} from 'immutable';

import { PERSON_ENTITY_TYPE_FQN, PROPERTY_TYPES } from './constants/DataModelConstants';

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
  const longitude = entity.getIn([PROPERTY_TYPES.LONGITUDE, 0]);
  const latitude = entity.getIn([PROPERTY_TYPES.LATITUDE, 0]);
  if (Number.isNaN(Number.parseFloat(longitude, 0), 10) || Number.isNaN(Number.parseFloat(latitude, 0), 10)) {
    return undefined;
  }

  return [longitude, latitude];
};
