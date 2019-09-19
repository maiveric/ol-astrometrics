/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

export const LOAD_AUDIT_DATA :string = 'LOAD_AUDIT_DATA';
export const loadAuditData :RequestSequence = newRequestSequence(LOAD_AUDIT_DATA);

export const LOAD_AUDIT_DASHBOARD_DATA :string = 'LOAD_AUDIT_DASHBOARD_DATA';
export const loadAuditDashboardData :RequestSequence = newRequestSequence(LOAD_AUDIT_DASHBOARD_DATA);

export const SET_AUDIT_DASHBOARD_WINDOW :string = 'SET_AUDIT_DASHBOARD_WINDOW';
export const setAuditDashboardWindow :RequestSequence = newRequestSequence(SET_AUDIT_DASHBOARD_WINDOW);

export const UPDATE_AUDIT_FILTER :string = 'UPDATE_AUDIT_FILTER';
export const updateAuditFilter :RequestSequence = newRequestSequence(UPDATE_AUDIT_FILTER);

export const UPDATE_AUDIT_START :string = 'UPDATE_AUDIT_START';
export const updateAuditStart :RequestSequence = newRequestSequence(UPDATE_AUDIT_START);

export const UPDATE_AUDIT_END :string = 'UPDATE_AUDIT_END';
export const updateAuditEnd :RequestSequence = newRequestSequence(UPDATE_AUDIT_END);

export const RESET_FILTERS :string = 'RESET_FILTERS';
export const resetFilters :RequestSequence = newRequestSequence(RESET_FILTERS);

export const APPLY_FILTERS :string = 'APPLY_FILTERS';
export const applyFilters :RequestSequence = newRequestSequence(APPLY_FILTERS);
