import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import { DRAW, PARAMETERS } from '../../utils/constants/StateConstants';

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
      alias: 'map',
      name: APP_TYPES.SAVED_MAPS,
      fields: {
        [PARAMETERS.CASE_NUMBER]: PROPERTY_TYPES.ID,
        [DRAW.NEW_MAP_DEFINITION]: PROPERTY_TYPES.TEXT
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
      src: 'map',
      dst: 'user',
      association: 'searchedBy'
    }
  ]
};

export default config;
