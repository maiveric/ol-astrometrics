import moment from 'moment';
import cookies from 'js-cookie';
import { fromJS } from 'immutable';
import { AuthUtils } from 'lattice-auth';

const { getAuthTokenExpiration } = AuthUtils;

const LICENSE_PLATE_SEARCHES = 'licensePlateSearches';
const TERMS_ACCEPTED_TOKEN = 'openlattice_astrometrics_eula_terms_accepted';

const ALL_COOKIES = [
  LICENSE_PLATE_SEARCHES,
  TERMS_ACCEPTED_TOKEN
];

function getDomain() {

  const { hostname } = window.location;
  const domain = hostname.split('.').splice(-2).join('.');
  const prefix = (hostname === 'localhost') ? '' : '.';
  return `${prefix}${domain}`;
}

const isSafari = () => {
  let { userAgent } = navigator;
  userAgent = userAgent.toLowerCase();

  if (userAgent.indexOf('safari') !== -1) {
    return userAgent.indexOf('chrome') < 0;
  }

  return false;
};

const updateCookie = (cookieName, value) => {
  const { hostname } = window.location;

  if (isSafari()) {
    const expiration = getAuthTokenExpiration();
    localStorage.setItem(cookieName, JSON.stringify({ expiration, value }));
  }

  cookies.set(cookieName, value, {
    SameSite: 'strict',
    domain: getDomain(),
    expires: new Date(getAuthTokenExpiration()),
    path: '/',
    secure: (hostname !== 'localhost'),
  });
};

const getCookie = (key) => {

  if (isSafari()) {
    const object = localStorage.getItem(key);
    if (!object) {
      return undefined;
    }

    const { expiration, value } = JSON.parse(object);
    if (expiration && moment(expiration).isBefore(moment())) {
      localStorage.removeItem(key);
      return undefined;
    }

    return value;
  }

  return cookies.get(key);
};

export const clearCookies = () => {
  const domain = getDomain();
  const path = '/';

  if (isSafari()) {
    ALL_COOKIES.forEach((key) => {
      localStorage.removeItem(key);
    });
  }
  else {
    ALL_COOKIES.forEach((cookieName) => {
      cookies.remove(cookieName, { domain, path });
    });
  }
};

export const getPreviousLicensePlateSearches = () => fromJS(JSON.parse(getCookie(LICENSE_PLATE_SEARCHES) || '[]'));

export const saveLicensePlateSearch = (plate) => {
  const plateList = getPreviousLicensePlateSearches().unshift(plate);
  updateCookie(LICENSE_PLATE_SEARCHES, JSON.stringify(plateList.toJS()));
};

export function termsAreAccepted() {
  return getCookie(TERMS_ACCEPTED_TOKEN);
}

export function acceptTerms() {
  updateCookie(TERMS_ACCEPTED_TOKEN, true);
}
