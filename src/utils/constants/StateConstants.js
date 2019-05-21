export const STATE = {
  ALERTS: 'ALERTS',
  EDM: 'EDM',
  ENTITY_SETS: 'ENTITY_SETS',
  EXPLORE: 'EXPLORE',
  PARAMETERS: 'PARAMETERS',
  REPORT: 'REPORT',
  SUBMIT: 'SUBMIT'
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
  ENTITY_SETS: 'entitySets',
  PROPERTY_TYPES: 'propertyTypes',
  IS_LOADING_DATA_MODEL: 'isLoadingDataModel'
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
  VEHICLE_ENTITY_KEY_IDS: 'vehicleEntityKeyIds'
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
  LABEL: 'label'
};

export const SUBMIT = {
  SUBMITTING: 'submitting',
  SUCCESS: 'submitSuccess',
  SUBMITTED: 'submitted',
  ERROR: 'error'
};
