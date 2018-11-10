export const PERSON_ENTITY_TYPE_FQN = 'general.person';

export const ENTITY_SETS = {
  RECORDS: 'NCRICVehicleRecords',
  CAMERAS: 'NCRICImageSources',
  LOCATIONS: 'NCRICLocations',
  AGENCIES: 'NCRICAgencies',
  CONFIDENCE_METRICS: 'NCRICConfidenceMetrics',
  HITS: 'NCRICHits',
  RECORDED_BY: 'NCRICRecordedBy',
  CARS: 'NCRICVehicles'
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
  CONFIDENCE: 'ol.confidence'
};
