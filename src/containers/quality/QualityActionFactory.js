/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

export const LOAD_QUALITY_DASHBOARD_DATA :string = 'LOAD_QUALITY_DASHBOARD_DATA';
export const loadQualityDashboardData :RequestSequence = newRequestSequence(LOAD_QUALITY_DASHBOARD_DATA);

export const SET_QUALITY_DASHBOARD_WINDOW :string = 'SET_QUALITY_DASHBOARD_WINDOW';
export const setQualityDashboardWindow :RequestSequence = newRequestSequence(SET_QUALITY_DASHBOARD_WINDOW);
