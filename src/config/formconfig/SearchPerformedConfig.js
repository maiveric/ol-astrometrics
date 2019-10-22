import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import { EXPLORE, PARAMETERS, SEARCH_PARAMETERS } from '../../utils/constants/StateConstants';

const config = {
  entitySets: [
    {
      alias: 'user',
      name: APP_TYPES.USERS,
      id: ID_FIELDS.USER_ID,
      fields: {
        [ID_FIELDS.USER_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      alias: 'search',
      name: APP_TYPES.SEARCHES,
      fields: {
        [PARAMETERS.REASON]: PROPERTY_TYPES.SEARCH_REASON,
        [PARAMETERS.CASE_NUMBER]: PROPERTY_TYPES.CASE_NUMBER,
        [EXPLORE.SEARCH_DATE_TIME]: PROPERTY_TYPES.LAST_REPORTED_DATE_TIME,
        [SEARCH_PARAMETERS.SEARCH_PARAMETERS]: PROPERTY_TYPES.SEARCH_QUERY,
        [ID_FIELDS.USER_AUTH_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      alias: 'searchedBy',
      name: APP_TYPES.SEARCHED_BY,
      fields: {}
    }
  ],
  associations: [
    {
      src: 'search',
      dst: 'user',
      association: 'searchedBy'
    }
  ]
};

export default config;
