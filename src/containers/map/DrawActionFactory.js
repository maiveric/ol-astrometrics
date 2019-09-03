import { newRequestSequence } from 'redux-reqseq';

export const DISCARD_DRAW_ZONES = 'DISCARD_DRAW_ZONES';
export const discardDrawZones = newRequestSequence(DISCARD_DRAW_ZONES);

export const SET_DRAW_CONTROL = 'SET_DRAW_CONTROL';
export const setDrawControl = newRequestSequence(SET_DRAW_CONTROL);
