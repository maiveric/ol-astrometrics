/*
 * @flow
 */

export const ROOT :string = '/';

export const LOGIN :string = '/login';

/* Main paths */
export const EXPLORE :string = '/explore';
export const AUDIT :string = '/audit';
export const QUALITY :string = '/quality';

/* Explore paths */
export const MAP :string = '/map';
export const ALERTS :string = '/alerts';
export const REPORTS :string = '/reports';

export const MAP_ROUTE = `${EXPLORE}${MAP}`;
export const ALERTS_ROUTE = `${EXPLORE}${ALERTS}`;
export const REPORTS_ROUTE = `${EXPLORE}${REPORTS}`;

/* Audit paths */
export const LOG :string = '/log';
export const DASHBOARD :string = '/dashboard';

export const AUDIT_LOG_ROUTE = `${AUDIT}${LOG}`;
export const AUDIT_DASHBOARD_ROUTE = `${AUDIT}${DASHBOARD}`;
