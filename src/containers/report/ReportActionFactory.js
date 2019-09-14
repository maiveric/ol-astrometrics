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

export const SET_REPORT_VALUE :string = 'SET_REPORT_VALUE';
export const setReportValue :RequestSequence = newRequestSequence(SET_REPORT_VALUE);

export const LOAD_REPORTS :string = 'LOAD_REPORTS';
export const loadReports :RequestSequence = newRequestSequence(LOAD_REPORTS);

export const CREATE_REPORT :string = 'CREATE_REPORT';
export const createReport :RequestSequence = newRequestSequence(CREATE_REPORT);

export const TOGGLE_REPORT_MODAL :string = 'TOGGLE_REPORT_MODAL';
export const toggleReportModal :RequestSequence = newRequestSequence(TOGGLE_REPORT_MODAL);

export const SELECT_REPORT :string = 'SELECT_REPORT';
export const selectReport :RequestSequence = newRequestSequence(SELECT_REPORT);


export {
  ADD_VEHICLE_TO_REPORT,
  REMOVE_VEHICLE_FROM_REPORT,
  EXPORT_REPORT,
  addVehicleToReport,
  removeVehicleFromReport,
  exportReport
};
