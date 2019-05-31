/*
* @flow
*/

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_VEHICLE_TO_REPORT :string = 'ADD_VEHICLE_TO_REPORT';
const addVehicleToReport :RequestSequence = newRequestSequence(ADD_VEHICLE_TO_REPORT);

const REMOVE_VEHICLE_FROM_REPORT :string = 'REMOVE_VEHICLE_FROM_REPORT';
const removeVehicleFromReport :RequestSequence = newRequestSequence(REMOVE_VEHICLE_FROM_REPORT);

const EXPORT_REPORT :string = 'EXPORT_REPORT';
const exportReport :RequestSequence = newRequestSequence(EXPORT_REPORT);

export {
  ADD_VEHICLE_TO_REPORT,
  REMOVE_VEHICLE_FROM_REPORT,
  EXPORT_REPORT,
  addVehicleToReport,
  removeVehicleFromReport,
  exportReport
};
