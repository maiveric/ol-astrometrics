import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { ID_FIELDS } from '../../utils/constants/DataConstants';
import { REPORT, EXPLORE } from '../../utils/constants/StateConstants';

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
      alias: 'existingReport',
      name: APP_TYPES.REPORTS,
      id: ID_FIELDS.REPORT_ID,
      fields: {}
    },
    {
      alias: 'newReport',
      name: APP_TYPES.REPORTS,
      fields: {
        [REPORT.NEW_REPORT_NAME]: PROPERTY_TYPES.NAME,
        [REPORT.NEW_REPORT_CASE]: PROPERTY_TYPES.TYPE,
        [ID_FIELDS.USER_AUTH_ID]: PROPERTY_TYPES.REPORT_CREATOR_ID,
        [PROPERTY_TYPES.REPORT_CREATED_DATE_TIME]: PROPERTY_TYPES.REPORT_CREATED_DATE_TIME
      }
    },
    {
      alias: 'read',
      name: APP_TYPES.RECORDS,
      multipleValuesField: EXPLORE.READ_IDS_TO_ADD_TO_REPORT,
      id: ID_FIELDS.READ_ID,
      fields: {}
    },
    {
      alias: 'recordedBy',
      name: APP_TYPES.RECORDED_BY,
      fields: {
        [PROPERTY_TYPES.REPORT_CREATED_DATE_TIME]: PROPERTY_TYPES.TIMESTAMP
      }
    },
    {
      alias: 'registeredFor',
      name: APP_TYPES.REGISTERED_FOR,
      fields: {
        [PROPERTY_TYPES.COMPLETED_DATE_TIME]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    }
  ],
  associations: [
    {
      src: 'newReport',
      dst: 'user',
      association: 'recordedBy'
    },
    {
      src: 'read',
      dst: 'newReport',
      association: 'registeredFor'
    },
    {
      src: 'read',
      dst: 'existingReport',
      association: 'registeredFor'
    },
  ]
};

export default config;
