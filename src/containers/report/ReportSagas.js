/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import JSPDF from 'jspdf';
import { Map, List } from 'immutable';
import { Constants, SearchApi } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import {
  all,
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import { getVehicleList, getRecordsByVehicleId, getFilteredVehicles } from '../../utils/VehicleUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { PARAMETERS } from '../../utils/constants/StateConstants';
import {
  EXPORT_REPORT,
  exportReport
} from './ReportActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const DATE_FORMAT = 'MM/DD/YYYY h:mm a';

const MAX_Y = 260;
const LARGE_FONT_SIZE = 15;
const MEDIUM_FONT_SIZE = 14;
const FONT_SIZE = 10;
const X_MARGIN = 10;
const X_MARGIN_INDENT = 15;
const X_MAX = 200;
const IMG_MIN = 50;
const IMG_MAX = 150;
const Y_INC = 5;
const Y_INC_SMALL = 4;
const Y_INC_LARGE = 7;

const PIXEL_TO_MM_MULTIPLIER = 25;

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
  imageDataMap :Map
) => {
  let [y, page] = tryIncrementPage(doc, yInit, pageInit, headerText);

  const licenseUrl = data.getIn([PROPERTY_TYPES.LICENSE_PLATE_IMAGE, 0]);
  const vehicleUrl = data.getIn([PROPERTY_TYPES.VEHICLE_IMAGE, 0]);

  const licenseImg = imageDataMap.get(licenseUrl);
  const vehicleImg = imageDataMap.get(vehicleUrl);

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
  imageDataMap :Map
) => {
  let [y, page] = tryIncrementPage(doc, yInit, pageInit, headerText);

  const dateTime = moment(data.getIn([PROPERTY_TYPES.TIMESTAMP, 0], ''));
  const hitType = data.getIn([PROPERTY_TYPES.HIT_TYPE, 0], '');
  const agency = data.getIn([PROPERTY_TYPES.AGENCY_NAME, 0], '');
  const cameraId = data.getIn([PROPERTY_TYPES.CAMERA_ID, 0], '');
  const coords = data.getIn([PROPERTY_TYPES.COORDINATE, 0], 'Unknown');
  const dateTimeStr = dateTime.isValid() ? dateTime.format('M/D/YYYY h:mm a') : 'Unknown';

  [y, page] = recordImages(doc, y, page, headerText, data, imageDataMap);
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
  imageDataMap :Map
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
      [y, page] = record(doc, y, page, headerText, sortedRecord, imageDataMap);
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
  imageDataMap :Map
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
      imageDataMap
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
      width /= PIXEL_TO_MM_MULTIPLIER;
      height /= PIXEL_TO_MM_MULTIPLIER;

      if (width > IMG_MAX) {
        const multiplier = IMG_MAX / width;
        width = IMG_MAX;
        height *= multiplier;
      }
      else if (width < IMG_MIN) {
        const multiplier = IMG_MIN / width;
        width = IMG_MIN;
        height *= multiplier;
      }

      resolve({ width, height });
    };
    img.src = dataURL;
  });
};

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
  images = images.map((resp) => {
    if (resp && resp.data) {
      const arr = new Uint8Array(resp.data);
      const raw = String.fromCharCode.apply(null, arr);
      const base64Str = btoa(raw);
      return `data:image/jpeg;base64,${base64Str}`;
    }
    return null;
  });

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


    const recordAndVehicleList = getVehicleList(results, neighborsById);
    const recordsByVehicleId = getRecordsByVehicleId(recordAndVehicleList);
    const vehicleList = getFilteredVehicles(recordAndVehicleList, recordsByVehicleId, '')
      .map(neighborObj => neighborObj.get('neighborDetails', Map()))
      .filter(entity => reportVehicles.has(getEntityKeyId(entity)))
      .sort((v1, v2) => (v1.getIn([PROPERTY_TYPES.PLATE, 0], '') < v2.getIn([PROPERTY_TYPES.PLATE, 0], '') ? -1 : 1));

    const imageDataMap = yield call(loadImageDataMap, recordsByVehicleId, vehicleList.map(val => getEntityKeyId(val)));

    let y = 15;
    let page = 1;
    const doc = new JSPDF();
    doc.setFont('helvetica', 'normal');

    y = header(doc, y, headerText);
    y = searchDetails(doc, y, searchParameters);
    y = vehicles(doc, y, headerText, vehicleList, recordsByVehicleId, imageDataMap);

    doc.save(getReportTitle(searchParameters));


    yield put(exportReport.success(action.id));
  }
  catch (error) {
    console.error(error)
    yield put(exportReport.failure(action.id, error));
  }
  finally {
    yield put(exportReport.finally(action.id));
  }
}

export function* exportReportWatcher() :Generator<*, *, *> {
  yield takeEvery(EXPORT_REPORT, exportReportWorker);
}
