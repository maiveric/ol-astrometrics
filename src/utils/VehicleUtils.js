import { List, Map } from 'immutable';

import { getEntityKeyId } from './DataUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from './constants/DataModelConstants';

export const getVehicleList = (results, neighborsById) => results
  .flatMap(record => neighborsById
    .get(getEntityKeyId(record), List())
    .map(neighbor => [neighbor, record]))
  .filter(([neighbor]) => neighbor.getIn(['neighborEntitySet', 'name']) === ENTITY_SETS.CARS);

export const getRecordsByVehicleId = (vehicleList) => {
  let recordsByVehicleId = Map();

  vehicleList.forEach(([neighbor, record]) => {
    const entityKeyId = getEntityKeyId(neighbor.get('neighborDetails'));
    recordsByVehicleId = recordsByVehicleId.set(
      entityKeyId,
      recordsByVehicleId.get(entityKeyId, List()).push(record)
    );
  });

  return recordsByVehicleId;
};

export const getFilteredVehicles = (vehicleList, recordsByVehicleId, filter) => {
  let seen = recordsByVehicleId.keySeq().toSet();

  return vehicleList.map(([val]) => val).filter((entity) => {
    const entityKeyId = getEntityKeyId(entity.get('neighborDetails'));

    const matchesFilter = !filter.length || recordsByVehicleId
      .get(entityKeyId)
      .flatMap(record => record.get(PROPERTY_TYPES.HIT_TYPE, List()))
      .filter(hitType => hitType === filter).size > 0;
    const shouldInclude = seen.has(entityKeyId) && matchesFilter;
    seen = seen.delete(entityKeyId);
    return shouldInclude;
  });
};
