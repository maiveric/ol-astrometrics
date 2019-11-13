/*
* @flow
*/

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EXPORT_REPORT :string = 'EXPORT_REPORT';
const exportReport :RequestSequence = newRequestSequence(EXPORT_REPORT);

export const SET_REPORT_VALUE :string = 'SET_REPORT_VALUE';
export const setReportValue :RequestSequence = newRequestSequence(SET_REPORT_VALUE);

export const LOAD_REPORTS :string = 'LOAD_REPORTS';
export const loadReports :RequestSequence = newRequestSequence(LOAD_REPORTS);

export const CREATE_REPORT :string = 'CREATE_REPORT';
export const createReport :RequestSequence = newRequestSequence(CREATE_REPORT);

export const TOGGLE_ADD_READS_TO_REPORT_MODAL :string = 'TOGGLE_ADD_READS_TO_REPORT_MODAL';
export const toggleAddReadsToReportModal :RequestSequence = newRequestSequence(TOGGLE_ADD_READS_TO_REPORT_MODAL);

export const TOGGLE_REPORT_MODAL :string = 'TOGGLE_REPORT_MODAL';
export const toggleReportModal :RequestSequence = newRequestSequence(TOGGLE_REPORT_MODAL);

export const TOGGLE_RENAME_REPORT_MODAL :string = 'TOGGLE_RENAME_REPORT_MODAL';
export const toggleRenameReportModal :RequestSequence = newRequestSequence(TOGGLE_RENAME_REPORT_MODAL);

export const TOGGLE_DELETE_REPORT_MODAL :string = 'TOGGLE_DELETE_REPORT_MODAL';
export const toggleDeleteReportModal :RequestSequence = newRequestSequence(TOGGLE_DELETE_REPORT_MODAL);

export const SELECT_REPORT :string = 'SELECT_REPORT';
export const selectReport :RequestSequence = newRequestSequence(SELECT_REPORT);

export const TOGGLE_DELETE_READS_MODAL :string = 'TOGGLE_DELETE_READS_MODAL';
export const toggleDeleteReadsModal :RequestSequence = newRequestSequence(TOGGLE_DELETE_READS_MODAL);


export {
  EXPORT_REPORT,
  exportReport
};
