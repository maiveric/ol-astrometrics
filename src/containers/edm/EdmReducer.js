/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import { EDM } from '../../utils/constants/StateConstants';
import { loadDataModel } from './EdmActionFactory';

const {
  IS_LOADING_DATA_MODEL,
  PROPERTY_TYPES,
  EDM_LOADED
} = EDM;

const INITIAL_STATE :Map<> = fromJS({
  [EDM_LOADED]: false,
  [IS_LOADING_DATA_MODEL]: false,
  [PROPERTY_TYPES]: Map()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadDataModel.case(action.type): {
      return loadDataModel.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_DATA_MODEL, true),
        SUCCESS: () => state
          .set(PROPERTY_TYPES, action.value.propertyTypes)
          .set(EDM_LOADED, true),
        FINALLY: () => state.set(IS_LOADING_DATA_MODEL, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
