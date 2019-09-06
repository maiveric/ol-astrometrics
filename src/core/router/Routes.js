/*
 * @flow
 */

export const ROOT :string = '/';

export const LOGIN :string = '/login';

export const EXPLORE :string = '/explore';
export const MAP :string = '/map';
export const ALERTS :string = '/alerts';
export const REPORTS :string = '/reports';

export const MAP_ROUTE = `${EXPLORE}${MAP}`;
export const ALERTS_ROUTE = `${EXPLORE}${ALERTS}`;
export const REPORTS_ROUTE = `${EXPLORE}${REPORTS}`;
