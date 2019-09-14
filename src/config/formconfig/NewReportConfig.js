import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import { REPORT } from '../../utils/constants/StateConstants';

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
      alias: 'report',
      name: APP_TYPES.REPORTS,
      fields: {
        [REPORT.NEW_REPORT_NAME]: PROPERTY_TYPES.NAME,
        [REPORT.NEW_REPORT_CASE]: PROPERTY_TYPES.TYPE,
        [ID_FIELDS.USER_AUTH_ID]: PROPERTY_TYPES.REPORT_CREATOR_ID,
        [PROPERTY_TYPES.REPORT_CREATED_DATE_TIME]: PROPERTY_TYPES.REPORT_CREATED_DATE_TIME
      }
    },
    {
      alias: 'recordedBy',
      name: APP_TYPES.RECORDED_BY,
      fields: {
        [PROPERTY_TYPES.REPORT_CREATED_DATE_TIME]: PROPERTY_TYPES.TIMESTAMP
      }
    }
  ],
  associations: [
    {
      src: 'report',
      dst: 'user',
      association: 'recordedBy'
    }
  ]
};

export default config;
