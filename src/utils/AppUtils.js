import { STATE, EDM } from './constants/StateConstants';

export const getEdm = state => state.get(STATE.EDM);

export const getEntitySetId = (edm, entitySetName) => edm.getIn([EDM.ENTITY_SETS, entitySetName, 'id']);
