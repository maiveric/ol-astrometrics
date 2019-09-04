import { newRequestSequence } from 'redux-reqseq';

export const DISCARD_DRAW_ZONES = 'DISCARD_DRAW_ZONES';
export const discardDrawZones = newRequestSequence(DISCARD_DRAW_ZONES);

export const SET_DRAW_CONTROL = 'SET_DRAW_CONTROL';
export const setDrawControl = newRequestSequence(SET_DRAW_CONTROL);

export const SET_DRAW_ZONES = 'SET_DRAW_ZONES';
export const setDrawZones = newRequestSequence(SET_DRAW_ZONES);

export const TOGGLE_CREATE_NEW_MAP = 'TOGGLE_CREATE_NEW_MAP';
export const toggleCreateNewMap = newRequestSequence(TOGGLE_CREATE_NEW_MAP);

export const EDIT_MAP_NAME = 'EDIT_MAP_NAME';
export const editMapName = newRequestSequence(EDIT_MAP_NAME);

export const SAVE_MAP = 'SAVE_MAP';
export const saveMap = newRequestSequence(SAVE_MAP);
