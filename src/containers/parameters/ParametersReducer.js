/*
 * @flow
 */

import moment from 'moment';
import { List, Map, fromJS } from 'immutable';

import { SEARCH_PARAMETERS as SEARCH_PARAMETERS_FIELDS, PARAMETERS } from '../../utils/constants/StateConstants';
import {
  EDIT_SEARCH_PARAMETERS,
  SELECT_ADDRESS,
  SELECT_AGENCY,
  SET_DRAW_MODE,
  UPDATE_SEARCH_PARAMETERS,
  geocodeAddress,
  searchAgencies
} from './ParametersActionFactory';

import {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  EXECUTE_SEARCH,
  UNMOUNT_EXPLORE
} from '../explore/ExploreActionFactory';

import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';

const {
  DISPLAY_FULL_SEARCH_OPTIONS,
  DRAW_MODE,
  SEARCH_PARAMETERS,
  IS_LOADING_ADDRESSES,
  DONE_LOADING_ADDRESSES,
  ADDRESS_SEARCH_RESULTS,
  IS_LOADING_AGENCIES,
  DONE_LOADING_AGENCIES,
  AGENCY_SEARCH_RESULTS
} = SEARCH_PARAMETERS_FIELDS;

const {
  CASE_NUMBER,
  REASON,
  PLATE,
  ADDRESS,
  LATITUDE,
  LONGITUDE,
  RADIUS,
  SEARCH_ZONES,
  START,
  END,
  DEPARTMENT,
  DEPARTMENT_ID,
  DEVICE
} = PARAMETERS;

const INITIAL_SEARCH_PARAMETERS :Map<> = fromJS({
  [CASE_NUMBER]: '',
  [REASON]: '',
  [PLATE]: '',
  [ADDRESS]: '',
  [LATITUDE]: '',
  [LONGITUDE]: '',
  [RADIUS]: '',
  [SEARCH_ZONES]: [],
  [START]: moment().subtract(1, 'year').toISOString(true),
  [END]: moment().toISOString(true),
  [DEPARTMENT]: '',
  [DEPARTMENT_ID]: '',
  [DEVICE]: ''
});

const INITIAL_STATE :Map<> = fromJS({
  [DISPLAY_FULL_SEARCH_OPTIONS]: true,
  [DRAW_MODE]: false,
  [SEARCH_PARAMETERS]: INITIAL_SEARCH_PARAMETERS,
  [IS_LOADING_ADDRESSES]: false,
  [DONE_LOADING_ADDRESSES]: false,
  [ADDRESS_SEARCH_RESULTS]: List(),
  [IS_LOADING_AGENCIES]: false,
  [DONE_LOADING_AGENCIES]: false,
  [AGENCY_SEARCH_RESULTS]: List()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case geocodeAddress.case(action.type): {
      return geocodeAddress.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ADDRESSES, true).set(DONE_LOADING_ADDRESSES, false),
        SUCCESS: () => state.set(ADDRESS_SEARCH_RESULTS, fromJS(action.value)),
        FINALLY: () => state.set(IS_LOADING_ADDRESSES, false).set(DONE_LOADING_ADDRESSES, true)
      });
    }

    case searchAgencies.case(action.type): {
      return searchAgencies.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_AGENCIES, true).set(DONE_LOADING_AGENCIES, false),
        SUCCESS: () => state.set(AGENCY_SEARCH_RESULTS, fromJS(action.value)),
        FINALLY: () => state.set(IS_LOADING_AGENCIES, false).set(DONE_LOADING_AGENCIES, true)
      });
    }

    case EDIT_SEARCH_PARAMETERS: {
      if (action.value) {
        return state
          .set(DISPLAY_FULL_SEARCH_OPTIONS, action.value)
          .setIn([SEARCH_PARAMETERS, SEARCH_ZONES], List());
      }
      return state.set(DISPLAY_FULL_SEARCH_OPTIONS, false);
    }

    case SELECT_ADDRESS:
      return state
        .setIn([SEARCH_PARAMETERS, LATITUDE], action.value.get('lat'))
        .setIn([SEARCH_PARAMETERS, LONGITUDE], action.value.get('lon'))
        .setIn([SEARCH_PARAMETERS, ADDRESS], action.value.get('display_name'));

    case SELECT_AGENCY:
      return state
        .setIn([SEARCH_PARAMETERS, DEPARTMENT], action.value.title)
        .setIn([SEARCH_PARAMETERS, DEPARTMENT_ID], action.value.id);

    case SET_DRAW_MODE:
      return state.set(DRAW_MODE, action.value);

    case UPDATE_SEARCH_PARAMETERS:
      return state.setIn([SEARCH_PARAMETERS, action.value.field], action.value.value);

    case EXECUTE_SEARCH:
      return state.set(DISPLAY_FULL_SEARCH_OPTIONS, false);

    case CLEAR_EXPLORE_SEARCH_RESULTS:
    case UNMOUNT_EXPLORE:
      return state.set(DISPLAY_FULL_SEARCH_OPTIONS, true);

    default:
      return state;
  }
}

const isNum = num => !Number.isNaN(Number.parseFloat(num));

export function getSearchFields(search :Map<*, *>) {
  const searchFields = [];

  // Case number and search reason are required fields
  if (!search.get(CASE_NUMBER, '').length || !search.get(REASON, '').length) {
    return [];
  }

  // At least 2 fields of license plate / geo search / time range must be present
  let numRequiredFields = 0;

  if (search.get(PLATE, '').length >= 3) {
    searchFields.push(SEARCH_TYPES.PLATE);
    numRequiredFields += 1;
  }

  const start = moment(search.get(START, ''));
  const end = moment(search.get(END, ''));
  if (start.isValid() && end.isValid()) {
    searchFields.push(SEARCH_TYPES.TIME_RANGE);
    numRequiredFields += 1;
  }

  if (search.get(SEARCH_ZONES).length) {
    searchFields.push(SEARCH_TYPES.GEO_ZONES);
    numRequiredFields += 1;
  }
  else if (isNum(search.get(LATITUDE)) && isNum(search.get(LONGITUDE)) && isNum(search.get(RADIUS))) {
    searchFields.push(SEARCH_TYPES.GEO_RADIUS);
    numRequiredFields += 1;
  }

  if (numRequiredFields < 2) {
    return [];
  }


  // Additional optional search types
  if (search.get(DEPARTMENT_ID, '').length) {
    searchFields.push(SEARCH_TYPES.DEPARTMENT);
  }

  if (search.get(DEVICE, '').length) {
    searchFields.push(SEARCH_TYPES.DEVICE);
  }

  return searchFields;
}

export default reducer;
