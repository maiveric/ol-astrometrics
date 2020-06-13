/*
 * @flow
 */

import moment from 'moment';
import { List, Map, fromJS } from 'immutable';

import {
  EDIT_SEARCH_PARAMETERS,
  SELECT_ADDRESS,
  SELECT_AGENCY,
  SET_DRAW_MODE,
  UPDATE_SEARCH_PARAMETERS,
  geocodeAddress,
  loadDepartmentsAndDevices
} from './ParametersActionFactory';

import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';
import { PARAMETERS, SEARCH_PARAMETERS as SEARCH_PARAMETERS_FIELDS } from '../../utils/constants/StateConstants';
import {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  EXECUTE_SEARCH,
  UNMOUNT_EXPLORE
} from '../explore/ExploreActionFactory';

const {
  DISPLAY_FULL_SEARCH_OPTIONS,
  DRAW_MODE,
  SEARCH_PARAMETERS,
  IS_LOADING_ADDRESSES,
  DONE_LOADING_ADDRESSES,
  ADDRESS_SEARCH_RESULTS,
  IS_LOADING_AGENCIES,
  DONE_LOADING_AGENCIES,
  AGENCY_OPTIONS,
  DEVICE_OPTIONS,
  DEVICES_BY_AGENCY
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
  DEVICE,
  MAKE,
  MODEL,
  COLOR,
  ACCESSORIES,
  STYLE,
  LABEL,
  NOT_READY
} = PARAMETERS;

const INITIAL_SEARCH_PARAMETERS :Map<> = fromJS({
  [CASE_NUMBER]: '',
  [REASON]: '',
  [PLATE]: '',
  [ADDRESS]: '',
  [LATITUDE]: '',
  [LONGITUDE]: '',
  [RADIUS]: 10,
  [SEARCH_ZONES]: [],
  [START]: moment().subtract(1, 'year').add(1, 'day').toISOString(true),
  [END]: moment().toISOString(true),
  [DEPARTMENT]: '',
  [DEVICE]: '',
  [MAKE]: '',
  [MODEL]: '',
  [COLOR]: '',
  [ACCESSORIES]: '',
  [STYLE]: '',
  [LABEL]: ''
});

// const INITIAL_STATE :Map<> = fromJS({
//   [DISPLAY_FULL_SEARCH_OPTIONS]: true,
//   [DRAW_MODE]: false,
//   [SEARCH_PARAMETERS]: INITIAL_SEARCH_PARAMETERS,
//   [IS_LOADING_ADDRESSES]: false,
//   [DONE_LOADING_ADDRESSES]: false,
//   [ADDRESS_SEARCH_RESULTS]: List(),
//   [IS_LOADING_AGENCIES]: false,
//   [DONE_LOADING_AGENCIES]: false,
//   [AGENCY_OPTIONS]: Map(),
//   [DEVICE_OPTIONS]: Map(),
//   [DEVICES_BY_AGENCY]: Map()
// });

const INITIAL_STATE = fromJS(JSON.parse('{"devicesByAgency":{},"displayFullSearchOptions":true,"drawMode":false,"doneLoadingAddresses":true,"deviceOptions":{},"isLoadingAddresses":false,"searchParameters":{"start":"2012-01-01T10:58-0700","color":"","reason":"Locate Stolen, Wanted, or Suspect Vehicles","model":"","latitude":"37.4863239","departmentId":"","make":"","longitude":"-122.2325233","accessories":"","style":"","radius":"50","department":"","label":"","address":"Redwood City, San Mateo County, California, United States of America","device":"","plate":"1319724","caseNumber":"TESTING","end":"2019-09-10T10:58:10.985-07:00","searchZones":[]},"isLoadingAgencies":false,"agencyOptions":{},"addressSearchResults":[{"boundingbox":["37.447637","37.569534","-122.288383","-122.139775"],"display_name":"Redwood City, San Mateo County, California, United States of America","lon":"-122.2325233","osm_type":"relation","osm_id":112309,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright","place_id":42760405,"importance":0.685450296760682,"class":"place","icon":"/nominatim/images/mapicons/poi_place_city.p.20.png","type":"city","lat":"37.4863239"},{"boundingbox":["37.4808284","37.4908284","-122.2367222","-122.2267222"],"display_name":"Redwood City, James Avenue, Redwood City, San Mateo County, California, 94063, United States of America","lon":"-122.2317222","osm_type":"node","osm_id":6111971160,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright","place_id":11327587,"importance":0.347489186851341,"class":"railway","icon":"/nominatim/images/mapicons/transport_train_station2.p.20.png","type":"station","lat":"37.4858284"},{"boundingbox":["37.4853668","37.4854668","-122.2309257","-122.2308257"],"display_name":"Redwood City, Winslow Street, Redwood City, San Mateo County, California, 94063, United States of America","lon":"-122.2308757","osm_type":"node","osm_id":6138188707,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright","place_id":10512713,"importance":0.201,"class":"railway","type":"stop","lat":"37.4854168"},{"boundingbox":["37.4861314","37.4862314","-122.2320381","-122.2319381"],"display_name":"Redwood City, Broadway, Redwood City, San Mateo County, California, 94063, United States of America","lon":"-122.2319881","osm_type":"node","osm_id":6138188706,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright","place_id":11355868,"importance":0.201,"class":"railway","type":"stop","lat":"37.4861814"}],"doneLoadingAgencies":false}'));

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case geocodeAddress.case(action.type): {
      return geocodeAddress.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ADDRESSES, true).set(DONE_LOADING_ADDRESSES, false),
        SUCCESS: () => state.set(ADDRESS_SEARCH_RESULTS, fromJS(action.value)),
        FINALLY: () => state.set(IS_LOADING_ADDRESSES, false).set(DONE_LOADING_ADDRESSES, true)
      });
    }

    case loadDepartmentsAndDevices.case(action.type): {
      return loadDepartmentsAndDevices.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_AGENCIES, true).set(DONE_LOADING_AGENCIES, false),
        SUCCESS: () => state
          .set(AGENCY_OPTIONS, action.value.departmentOptions)
          .set(DEVICE_OPTIONS, action.value.deviceOptions)
          .set(DEVICES_BY_AGENCY, action.value.devicesByAgency),
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
  const areRequiredCriteriaUnmet = !search.get(CASE_NUMBER, '').length || !search.get(REASON, '').length;

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

  if (areRequiredCriteriaUnmet || numRequiredFields < 2) {
    searchFields.push(NOT_READY);
  }


  // Additional optional search types
  if ((search.get(DEPARTMENT) || '').length) {
    searchFields.push(SEARCH_TYPES.DEPARTMENT);
  }

  if ((search.get(DEVICE) || '').length) {
    searchFields.push(SEARCH_TYPES.DEVICE);
  }

  if (search.get(MAKE, '').length) {
    searchFields.push(SEARCH_TYPES.MAKE);
  }

  if (search.get(MODEL, '').length) {
    searchFields.push(SEARCH_TYPES.MODEL);
  }

  if (search.get(COLOR, '').length) {
    searchFields.push(SEARCH_TYPES.COLOR);
  }

  if (search.get(ACCESSORIES, '').length) {
    searchFields.push(SEARCH_TYPES.ACCESSORIES);
  }

  if (search.get(STYLE, '').length) {
    searchFields.push(SEARCH_TYPES.STYLE);
  }

  if (search.get(LABEL, '').length) {
    searchFields.push(SEARCH_TYPES.LABEL);
  }

  return searchFields;
}

export default reducer;
