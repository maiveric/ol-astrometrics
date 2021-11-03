import { PROPERTY_TYPES } from './constants/DataModelConstants';

export const getPlate = (record) => record.getIn([PROPERTY_TYPES.PLATE, 0], '');
export const getId = (record) => record.getIn([PROPERTY_TYPES.ID, 0], '');
