export const STATE = {
  APP: 'app',
  AUDIT: 'audit',
  ALERTS: 'ALERTS',
  DRAW: 'draw',
  EDM: 'EDM',
  ENTITY_SETS: 'ENTITY_SETS',
  EXPLORE: 'EXPLORE',
  PARAMETERS: 'PARAMETERS',
  REPORT: 'REPORT',
  SUBMIT: 'SUBMIT'
};

export const APP = {
  SELECTED_ORG_ID: 'selectedOrganizationId',
  CONFIG_BY_ORG_ID: 'appConfigsByOrgId',
  SETTINGS_BY_ORG_ID: 'appSettingsByOrgId',
  ORGS_BY_ID: 'orgsById'
};

export const AUDIT = {
  IS_LOADING_RESULTS: 'isLoadingResults',
  RESULTS: 'results',
  FILTERED_RESULTS: 'filteredResults',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  FILTER: 'filter'
};

export const DRAW = {
  DRAW_CONTROL: 'drawControl',
  DRAW_ZONES: 'drawZones',

  NEW_MAP_NAME: 'newMapName',
  NEW_MAP_DEFINITION: 'newMapDefinition',
  IS_CREATING_MAP: 'isCreatingMap',
  IS_SAVING_MAP: 'isSavingMap',
  SAVED_MAPS: 'savedMaps',
  SELECTED_MAP_ID: 'selectedMapId'
};

export const ALERTS = {
  ALERT_LIST: 'alertList',
  IS_LOADING_ALERTS: 'isLoadingAlerts',
  ALERT_MODAL_OPEN: 'alertModalOpen',
  PLATE: 'plate',
  EXPIRATION: 'expiration',
  CASE_NUMBER: 'caseNumber',
  SEARCH_REASON: 'searchReason'
};

export const EDM = {
  PROPERTY_TYPES: 'propertyTypes',
  IS_LOADING_DATA_MODEL: 'isLoadingDataModel',
  EDM_LOADED: 'edmLoaded'
};

export const ENTITY_SETS = {
  ENTITY_SET_SEARCH_RESULTS: 'entitySetSearchResults',
  IS_LOADING_ENTITY_SETS: 'isLoadingEntitySets',
  SELECTED_ENTITY_SET: 'selectedEntitySet'
};

export const EXPLORE = {
  BREADCRUMBS: 'breadcrumbs',
  ENTITIES_BY_ID: 'entitiesById',
  ENTITY_NEIGHBORS_BY_ID: 'entityNeighborsById',
  FILTER: 'filter',
  IS_LOADING_ENTITY_NEIGHBORS: 'isLoadingEntityNeighbors',
  SEARCH_DATE_TIME: 'searchDateTime',
  IS_SEARCHING_DATA: 'isSearchingData',
  SEARCH_RESULTS: 'searchResults',
  TOTAL_RESULTS: 'numResults',
  SELECTED_ENTITY_KEY_IDS: 'selectedEntityKeyIds',
  SELECTED_READ_ID: 'selectedReadId'
};

export const SEARCH_PARAMETERS = {
  DRAW_MODE: 'drawMode',
  IS_LOADING_ADDRESSES: 'isLoadingAddresses',
  DONE_LOADING_ADDRESSES: 'doneLoadingAddresses',
  ADDRESS_SEARCH_RESULTS: 'addressSearchResults',
  IS_LOADING_AGENCIES: 'isLoadingAgencies',
  DONE_LOADING_AGENCIES: 'doneLoadingAgencies',
  AGENCY_OPTIONS: 'agencyOptions',
  DEVICE_OPTIONS: 'deviceOptions',
  DISPLAY_FULL_SEARCH_OPTIONS: 'displayFullSearchOptions',
  SEARCH_PARAMETERS: 'searchParameters'
};

export const REPORT = {

  VEHICLE_ENTITY_KEY_IDS: 'vehicleEntityKeyIds',

  IS_LOADING_REPORTS: 'isLoadingReports',
  REPORTS: 'reports',
  REPORT_NEIGHBORS: 'reportNeighbors',
  SELECTED_REPORT: 'selectedReport',

  REPORT_MODAL_OPEN: 'reportModalOpen',
  RENAME_REPORT_MODAL_OPEN: 'renameReportModalOpen',
  NEW_REPORT_NAME: 'newReportName',
  NEW_REPORT_CASE: 'newReportCase'
};

export const PARAMETERS = {
  CASE_NUMBER: 'caseNumber',
  REASON: 'reason',
  PLATE: 'plate',
  ADDRESS: 'address',
  LATITUDE: 'latitude',
  LONGITUDE: 'longitude',
  RADIUS: 'radius',
  SEARCH_ZONES: 'searchZones',
  START: 'start',
  END: 'end',
  DEPARTMENT: 'department',
  DEPARTMENT_ID: 'departmentId',
  DEVICE: 'device',
  MAKE: 'make',
  MODEL: 'model',
  COLOR: 'color',
  ACCESSORIES: 'accessories',
  STYLE: 'style',
  LABEL: 'label',

  // placeholder item to indicate search criteria is not met
  NOT_READY: 'notReady'
};

export const SUBMIT = {
  SUBMITTING: 'submitting',
  SUCCESS: 'submitSuccess',
  SUBMITTED: 'submitted',
  ERROR: 'error'
};

export const SAVED_MAP = {
  NAME: 'name',
  FEATURES: 'features',
  DATE_CREATED: 'dateCreated',
  CREATED_BY: 'createdBy'
};

export const AUDIT_EVENT = {
  ID: 'id',
  PERSON_ID: 'personId',
  CASE_NUMBER: 'caseNumber',
  DATE_TIME: 'dateTime',
  REASON: 'reason',
  PLATE: 'plate'
};
