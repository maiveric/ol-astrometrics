import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import { ALERTS, EXPLORE } from '../../utils/constants/StateConstants';

const config = {
  entitySets: [
    {
      alias: 'user',
      name: ENTITY_SETS.USERS,
      id: ID_FIELDS.USER_ID,
      fields: {
        [ID_FIELDS.USER_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      alias: 'alert',
      name: ENTITY_SETS.ALERTS,
      fields: {
        [ALERTS.SEARCH_REASON]: PROPERTY_TYPES.SEARCH_REASON,
        [ALERTS.CASE_NUMBER]: PROPERTY_TYPES.CASE_NUMBER,
        [EXPLORE.SEARCH_DATE_TIME]: PROPERTY_TYPES.LAST_REPORTED_DATE_TIME,
        [ALERTS.EXPIRATION]: PROPERTY_TYPES.END_DATE_TIME,
        [ALERTS.PLATE]: PROPERTY_TYPES.SEARCH_QUERY
      }
    },
    {
      alias: 'registeredFor',
      name: ENTITY_SETS.REGISTERED_FOR,
      fields: {
        [EXPLORE.SEARCH_DATE_TIME]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    }
  ],
  associations: [
    {
      src: 'alert',
      dst: 'user',
      association: 'registeredFor'
    }
  ]
};

export default config;
