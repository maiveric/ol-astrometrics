/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import JSPDF from 'jspdf';
import {
  all,
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import { Map, List, fromJS } from 'immutable';
import { SearchApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getVehicleList, getRecordsByVehicleId, getFilteredVehicles } from '../../utils/VehicleUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { getAppFromState, getEntitySetId, getUserIdFromState } from '../../utils/AppUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { PARAMETERS } from '../../utils/constants/StateConstants';
import {
  EXPORT_REPORT,
  LOAD_REPORTS,
  exportReport,
  loadReports
} from './ReportActionFactory';

declare var __MAPBOX_TOKEN__;

const DATE_FORMAT = 'MM/DD/YYYY h:mm a';

const MAX_Y = 260;
const LARGE_FONT_SIZE = 15;
const MEDIUM_FONT_SIZE = 14;
const FONT_SIZE = 10;
const X_MARGIN = 10;
const X_MARGIN_INDENT = 15;
const X_MAX = 200;
const IMG_SIZE = 50;
const Y_INC = 5;
// const Y_INC_SMALL = 4;
const Y_INC_LARGE = 7;

const PIXEL_TO_MM_MULTIPLIER = 25;
const MAP_IMG_PIXELS = 600;

const getStaticMapPathCall = (lat, long) => call(axios, {
  method: 'get',
  url: `https://api.mapbox.com/v4/mapbox.streets/pin-l-car+000(${long},${lat})/${long},${lat},15/${MAP_IMG_PIXELS}x${MAP_IMG_PIXELS}.png?access_token=${__MAPBOX_TOKEN__}`,
  responseType: 'arraybuffer'
});

const thinLine = (doc :Object, y :number, xOffset? :number) :void => {
  doc.setLineWidth(0.1);
  doc.setDrawColor(152);
  const x = xOffset || X_MARGIN;
  doc.line(x, y, X_MAX - X_MARGIN, y);
  doc.setFont('helvetica', 'normal');
};

const thickLine = (doc :Object, y :number, gray? :boolean) :void => {
  doc.setLineWidth(0.5);
  if (gray) {
    doc.setDrawColor(152);
  }
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
  doc.setDrawColor(0);
  doc.setFont('helvetica', 'normal');
};

const getReportTitle = (searchParameters) => {
  const now = moment().format('MM-DD-YYYY-h:mma');
  return `${searchParameters.get(PARAMETERS.CASE_NUMBER)}-Vehicle-Report-${now}.pdf`;
};

const newPage = (doc :Object, pageInit :number, name? :string) :number[] => {
  const page = pageInit + 1;
  doc.addPage();
  if (name) {
    doc.setFontSize(12);
    doc.setFontType('normal');
    doc.text(10, X_MARGIN, `${name} - ${page}`);
  }
  doc.setFontSize(10);
  thickLine(doc, 15);
  return [25, page];
};

const tryIncrementPage = (doc :Object, yInit :number, pageInit :number, name :string) => {
  let y = yInit;
  let page = pageInit;
  if (y > MAX_Y) {
    [y, page] = newPage(doc, page, name);
  }
  return [y, page];
};

const header = (doc :Object, yInit :number, headerText :string) :number => {
  let y = yInit;
  doc.setFontSize(LARGE_FONT_SIZE);
  doc.text(X_MARGIN, y, headerText);
  y += Y_INC;
  doc.setFontType('normal');
  thickLine(doc, y);
  y += Y_INC_LARGE;
  return y;
};

const searchDetails = (doc :Object, yInit :number, searchParameters :Map) :number => {
  let y = yInit;

  const caseNum = searchParameters.get(PARAMETERS.CASE_NUMBER, '');
  const searchReason = searchParameters.get(PARAMETERS.REASON, '');
  const start = moment(searchParameters.get(PARAMETERS.START, ''));
  const startStr = start.isValid() ? start.format(DATE_FORMAT) : '(no start date)';
  const end = moment(searchParameters.get(PARAMETERS.END, ''));
  const endStr = end.isValid() ? end.format(DATE_FORMAT) : '(no end date)';
  const plate = searchParameters.get(PARAMETERS.PLATE, '');

  doc.setFontSize(MEDIUM_FONT_SIZE);
  doc.text(X_MARGIN, y, 'Search Details');
  y += Y_INC;
  thickLine(doc, y);
  y += Y_INC_LARGE;

  doc.setFontSize(FONT_SIZE);
  doc.text(X_MARGIN, y, `Case Number: ${caseNum}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `Search Reason: ${searchReason}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `Date/Time Range: ${startStr} to ${endStr}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `License Plate: ${plate}`);
  y += Y_INC_LARGE;
  thickLine(doc, y);
  y += Y_INC_LARGE;

  return y;
};

const recordImages = (
  doc :Object,
  yInit :number,
  pageInit :number,
  headerText :string,
  data :Map,
  imageDataMap :Map,
  locationDataMap :Map
) => {
  let [y, page] = tryIncrementPage(doc, yInit, pageInit, headerText);

  const licenseUrl = data.getIn([PROPERTY_TYPES.LICENSE_PLATE_IMAGE, 0]);
  const vehicleUrl = data.getIn([PROPERTY_TYPES.VEHICLE_IMAGE, 0]);

  const licenseImg = imageDataMap.get(licenseUrl);
  const vehicleImg = imageDataMap.get(vehicleUrl);

  const locationImg = locationDataMap.get(getEntityKeyId(data));

  if ((licenseImg && y + licenseImg.height > MAX_Y) || (vehicleImg && y + vehicleImg.height > MAX_Y)) {
    [y, page] = newPage(doc, page, headerText);
  }

  let maxHeight = 0;
  let xOffset = X_MARGIN;
  if (licenseImg) {
    const { height, width, imgSrc } = licenseImg;
    doc.addImage(imgSrc, 'JPEG', xOffset, y, width, height);

    maxHeight = height;
    xOffset += width + X_MARGIN;
  }

  if (vehicleImg) {
    const { height, width, imgSrc } = vehicleImg;
    if (height > maxHeight) {
      maxHeight = height;
    }
    doc.addImage(imgSrc, 'JPEG', xOffset, y, width, height);
    xOffset += width + X_MARGIN;
  }

  if (locationImg) {
    const { height, width, imgSrc } = locationImg;
    if (height > maxHeight) {
      maxHeight = height;
    }
    doc.addImage(imgSrc, 'JPEG', xOffset, y, width, height);
    xOffset += width + X_MARGIN;
  }

  if (maxHeight > 0) {
    maxHeight += Y_INC;
  }

  return [y + maxHeight, page];
};

const record = (
  doc :Object,
  yInit :number,
  pageInit :number,
  headerText :string,
  data :Map,
  imageDataMap :Map,
  locationDataMap :Map
) => {
  let [y, page] = tryIncrementPage(doc, yInit, pageInit, headerText);

  const dateTime = moment(data.getIn([PROPERTY_TYPES.TIMESTAMP, 0], ''));
  const hitType = data.getIn([PROPERTY_TYPES.HIT_TYPE, 0], '');
  const agency = data.getIn([PROPERTY_TYPES.AGENCY_NAME, 0], '');
  const cameraId = data.getIn([PROPERTY_TYPES.CAMERA_ID, 0], '');
  const coords = data.getIn([PROPERTY_TYPES.COORDINATE, 0], 'Unknown');
  const dateTimeStr = dateTime.isValid() ? dateTime.format('M/D/YYYY h:mm a') : 'Unknown';

  [y, page] = recordImages(doc, y, page, headerText, data, imageDataMap, locationDataMap);
  [y, page] = tryIncrementPage(doc, y, page, headerText);

  doc.setFontSize(FONT_SIZE);
  doc.text(X_MARGIN, y, `Date/Time: ${dateTimeStr}`);
  y += Y_INC;
  doc.text(X_MARGIN_INDENT, y, `Hit Type: ${hitType}`);
  y += Y_INC;
  doc.text(X_MARGIN_INDENT, y, `Agency: ${agency}`);
  y += Y_INC;
  doc.text(X_MARGIN_INDENT, y, `Camera ID: ${cameraId}`);
  y += Y_INC;
  doc.text(X_MARGIN_INDENT, y, `Coordinates: ${coords}`);
  y += Y_INC_LARGE;

  return [y, page];
};

const vehicleDetails = (
  doc :Object,
  yInit :number,
  pageInit :number,
  headerText :string,
  vehicle :Map,
  records :List,
  imageDataMap :Map,
  locationDataMap :Map
) => {
  let [y, page] = tryIncrementPage(doc, yInit, pageInit, headerText);

  const plate = vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '');

  doc.setFontSize(MEDIUM_FONT_SIZE);
  y += Y_INC_LARGE;
  doc.text(X_MARGIN, y, `${plate} (${records.size})`);
  y += Y_INC_LARGE;

  records
    .sort((r1, r2) => (moment(r1.getIn([PROPERTY_TYPES.TIMESTAMP, 0], ''))
      .isBefore(r2.getIn([PROPERTY_TYPES.TIMESTAMP, 0], '')) ? -1 : 1))
    .forEach((sortedRecord, index) => {
      [y, page] = record(doc, y, page, headerText, sortedRecord, imageDataMap, locationDataMap);
      if (index !== records.size - 1) {
        thinLine(doc, y);
        y += Y_INC_LARGE * 2;
      }
    });

  thickLine(doc, y);
  y += Y_INC_LARGE;

  return [y, page];
};

const vehicles = (
  doc :Object,
  yInit :number,
  headerText :string,
  vehicleList :List,
  recordsByVehicleId :Map,
  imageDataMap :Map,
  locationDataMap :Map
) :number => {
  let y = yInit;

  doc.setFontSize(MEDIUM_FONT_SIZE);
  doc.text(X_MARGIN, y, `Vehicles (${vehicleList.size})`);
  y += Y_INC;
  thickLine(doc, y);
  y += Y_INC_LARGE;
  let page = 1;

  vehicleList.forEach((vehicle) => {
    [y, page] = vehicleDetails(
      doc,
      y,
      page,
      headerText,
      vehicle,
      recordsByVehicleId.get(getEntityKeyId(vehicle), List()),
      imageDataMap,
      locationDataMap
    );
  });

  return y;
};

const getLoadImageDataCall = url => call(axios, {
  method: 'get',
  url,
  responseType: 'arraybuffer'
});

const getImageDimensions = (dataURL) => {
  if (!dataURL) {
    return [0, 0];
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      /* Step 1: resize height / wid0th to millimeter sizes */
      width /= PIXEL_TO_MM_MULTIPLIER;
      height /= PIXEL_TO_MM_MULTIPLIER;

      /* Step 2: resize to desired image width, while maintaining proportions */
      const multiplier = IMG_SIZE / width;
      width = IMG_SIZE;
      height *= multiplier;

      resolve({ width, height });
    };
    img.src = dataURL;
  });
};

const responseToBase64 = (response) => {
  if (response && response.data) {
    const arr = new Uint8Array(response.data);
    let binary = '';
    arr.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64Str = btoa(binary);
    return `data:image/jpeg;base64,${base64Str}`;
  }
  return null;
};

function* loadRecordLocationImages(recordsByVehicleId :Map, vehicleIds :List) {
  const coords = recordsByVehicleId.entrySeq()
    .filter(([key]) => vehicleIds.includes(key))
    .flatMap(([key, value]) => value).map((neighborDetails) => {
      const entityKeyId = getEntityKeyId(neighborDetails);
      const [lat, long] = neighborDetails.getIn([PROPERTY_TYPES.COORDINATE, 0], '').split(',');
      return [entityKeyId, lat, long];
    })
    .filter(val => !!val[1] && !!val[1].length && !!val[2] && !!val[2].length);

  let images = yield all(coords.toJS().map(([id, lat, long]) => getStaticMapPathCall(lat, long)));
  images = images.map(responseToBase64);

  let idToImage = Map();
  coords.forEach(([id], index) => {
    const imgSrc = images[index];
    idToImage = idToImage.set(id, {
      imgSrc,
      height: IMG_SIZE,
      width: IMG_SIZE
    });
  });

  return idToImage;
}

function* loadImageDataMap(recordsByVehicleId :Map, vehicleIds :List) {
  const urls = recordsByVehicleId.entrySeq()
    .filter(([key]) => vehicleIds.includes(key))
    .flatMap(([key, value]) => value).map((neighborDetails) => {
      const licenseImg = neighborDetails.getIn([PROPERTY_TYPES.LICENSE_PLATE_IMAGE, 0]);
      const vehicleImg = neighborDetails.getIn([PROPERTY_TYPES.VEHICLE_IMAGE, 0]);
      return List.of(licenseImg, vehicleImg);
    })
    .flatMap(val => val)
    .filter(val => !!val);

  let images = yield all(urls.toJS().map(getLoadImageDataCall));
  images = images.map(responseToBase64);

  const dimensions = yield all(images.map(getImageDimensions));

  let urlToImage = Map();
  urls.forEach((url, index) => {
    const imgSrc = images[index];
    const { width, height } = dimensions[index];
    urlToImage = urlToImage.set(url, { imgSrc, width, height });
  });

  return urlToImage;
}

function* exportReportWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    searchParameters,
    reportVehicles,
    results,
    neighborsById
  } = action.value;

  try {
    yield put(exportReport.request(action.id));

    const caseNum = searchParameters.get(PARAMETERS.CASE_NUMBER, '');
    const headerText = `Vehicle Report - ${caseNum} - ${moment().format(DATE_FORMAT)}`;

    const app = yield select(getAppFromState);

    const recordAndVehicleList = getVehicleList(results, neighborsById, getEntitySetId(app, APP_TYPES.CARS));
    const recordsByVehicleId = getRecordsByVehicleId(recordAndVehicleList);
    const vehicleList = getFilteredVehicles(recordAndVehicleList, recordsByVehicleId, '')
      .map(neighborObj => neighborObj.get('neighborDetails', Map()))
      .filter(entity => reportVehicles.has(getEntityKeyId(entity)))
      .sort((v1, v2) => (v1.getIn([PROPERTY_TYPES.PLATE, 0], '') < v2.getIn([PROPERTY_TYPES.PLATE, 0], '') ? -1 : 1));

    const vehicleIds = vehicleList.map(val => getEntityKeyId(val));
    const [imageDataMap, locationDataMap] = yield all([
      call(loadImageDataMap, recordsByVehicleId, vehicleIds),
      call(loadRecordLocationImages, recordsByVehicleId, vehicleIds)
    ]);

    let y = 15;
    let page = 1;
    const doc = new JSPDF();
    doc.setFont('helvetica', 'normal');

    y = header(doc, y, headerText);
    y = searchDetails(doc, y, searchParameters);
    y = vehicles(doc, y, headerText, vehicleList, recordsByVehicleId, imageDataMap, locationDataMap);

    doc.save(getReportTitle(searchParameters));


    yield put(exportReport.success(action.id));
  }
  catch (error) {
    console.error(error);
    yield put(exportReport.failure(action.id, error));
  }
  finally {
    yield put(exportReport.finally(action.id));
  }
}

export function* exportReportWatcher() :Generator<*, *, *> {
  yield takeEvery(EXPORT_REPORT, exportReportWorker);
}


function* loadReportsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadReports.request(action.id));

    const app = yield select(getAppFromState);
    const userEntitySetId = getEntitySetId(app, APP_TYPES.USERS);
    const reportsEntitySetId = getEntitySetId(app, APP_TYPES.REPORTS);
    const readsEntitySetId = getEntitySetId(app, APP_TYPES.RECORDS);
    const userEntityKeyId = getUserIdFromState(app);

    const reportNeighbors = yield call(
      SearchApi.searchEntityNeighborsWithFilter,
      userEntitySetId,
      {
        entityKeyIds: [userEntityKeyId],
        sourceEntitySetIds: [reportsEntitySetId],
        destinationEntitySetIds: []
      }
    );

    let reports = Map();
    let readsByReport = Map();

    const reportsForUser = reportNeighbors[userEntityKeyId];

    if (reportsForUser) {

      fromJS(reportsForUser).forEach((neighborObj) => {
        const neighborDetails = neighborObj.get('neighborDetails');
        const entityKeyId = getEntityKeyId(neighborDetails);
        reports = reports.set(entityKeyId, neighborDetails);
      });


      readsByReport = yield call(
        SearchApi.searchEntityNeighborsWithFilter,
        reportsEntitySetId,
        {
          entityKeyIds: reports.keySeq().toJS(),
          sourceEntityKeyIds: [readsEntitySetId],
          destinationEntitySetIds: []
        }
      );

      readsByReport = fromJS(readsByReport);
    }

    yield put(loadReports.success(action.id, { reports, readsByReport }));
  }
  catch (error) {
    console.error(error);
    yield put(loadReports.failure(action.id, error));
  }
  finally {
    yield put(loadReports.finally(action.id));
  }
}


export function* loadReportsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REPORTS, loadReportsWorker);
}
