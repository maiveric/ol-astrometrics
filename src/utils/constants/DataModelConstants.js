export const PERSON_ENTITY_TYPE_FQN = 'general.person';

export const ENTITY_SETS = {
  RECORDS: 'NCRICVehicleRecords',
  CAMERAS: 'NCRICImageSources',
  LOCATIONS: 'NCRICLocations',
  AGENCIES: 'NCRICAgencies',
  CONFIDENCE_METRICS: 'NCRICConfidenceMetrics',
  HITS: 'NCRICHits',
  RECORDED_BY: 'NCRICRecordedBy',
  CARS: 'NCRICVehicles',
  USERS: 'NCRICUsers',
  ALERTS: 'NCRICVehicleAlerts',
  REGISTERED_FOR: 'NCRICRegisteredFor',
  SEARCHES: 'NCRICALPRSearches',
  SEARCHED_BY: 'NCRICSearchedBy'
};

export const PROPERTY_TYPES = {
  LATITUDE: 'location.latitude',
  LONGITUDE: 'location.longitude',
  COORDINATE: 'ol.locationcoordinates',

  STATE: 'vehicle.licensestate',
  YEAR: 'vehicle.year',
  COLOR: 'vehicle.color',
  VIN: 'vehicle.vin',
  MAKE: 'vehicle.make',
  MODEL: 'vehicle.model',
  PLATE: 'vehicle.licensenumber',
  VEHICLE_IMAGE: 'ol.vehicleimage',
  LICENSE_PLATE_IMAGE: 'ol.licenseplateimage',

  // agency
  NAME: 'ol.name',
  ID: 'ol.id',
  AGENCY_NAME: 'publicsafety.agencyname',
  CAMERA_ID: 'ol.resourceid',
  HIT_TYPE: 'ol.description',
  DESCRIPTION: 'ol.description',

  TIMESTAMP: 'ol.datelogged',
  CONFIDENCE: 'ol.confidence',

  PERSON_ID: 'nc.SubjectIdentification',
  COMPLETED_DATE_TIME: 'date.completeddatetime',
  LAST_REPORTED_DATE_TIME: 'ol.datetimelastreported',
  END_DATE_TIME: 'ol.datetimeend',
  SEARCH_REASON: 'ol.searchreason',
  CASE_NUMBER: 'criminaljustice.casenumber',
  SEARCH_QUERY: 'ol.searchquery'
};
