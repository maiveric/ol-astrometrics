/*
 * @flow
 */

export const SEARCH_REASONS :string[] = [
  'Locate Stolen, Wanted, or Suspect Vehicles',
  'Locate Suspect(s) of Criminal Investigation or Arrest Warrant',
  'Locate Witnesses or Victims of Violent Crime',
  'Locate Missing Children and Elderly individuals (Amber / Silver Alerts)',
  'Protect the Public during Special Events / Situational Awareness',
  'Protect Critical Infrastructure'
];

export const ID_FIELDS = {
  USER_ID: 'userId',
  USER_AUTH_ID: 'userAuth0Id',
  READ_ID: 'readId',
  REPORT_ID: 'reportId'
};

export const MAKES = [
  'acura',
  'audi',
  'bmw',
  'buick',
  'cadillac',
  'chevy',
  'chrysler',
  'dodge',
  'fiat',
  'ford',
  'gmc',
  'honda',
  'hyundai',
  'infinity',
  'jeep',
  'kia',
  'lexus',
  'lincoln',
  'mazda',
  'mercedes',
  'mercury',
  'mini',
  'mitsubishi',
  'nissan',
  'pontiac',
  'scion',
  'subaru',
  'suzuki',
  'tesla',
  'toyota',
  'volvo',
  'vw'
];

export const MODELS_BY_MAKE = {
  ford: [
    'ford-mustang-gt',
    'ford-mustang'
  ]
};

export const COLORS = [
  'blue',
  'dark',
  'green',
  'light',
  'red',
  'white',
  'yellow'
];

export const ACCESSORIES = [
  'spare tire',
  'paper-plate',
  'pedestal-spoiler',
  'ca-clean-air-vehicle-sticker',
  'rectangular-sticker',
  'uber-sticker',
  'roof-rack',
  'pickup-ladder-rack',
  'racing-strip'
];

export const STYLES = [
  'box-truck',
  'full-size-van',
  'other-truck',
  'car',
  'pickup',
  'minivan',
  'hatchback',
  'sedan',
  'SUV'
];

export const LABELS = [
  'day',
  'night'
];
