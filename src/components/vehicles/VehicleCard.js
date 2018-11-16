/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-light-svg-icons';

import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

type Props = {
  vehicle :Map<*, *>,
  records :List<*>,
  count :number,
  isUnselected :boolean,
  onClick: () => void,
  timestampDesc? :boolean
};

const Card = styled.div`
  background-color: #ffffff;
  padding: 15px;
  border-radius: 5px;
  margin: 10px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  opacity: ${props => (props.isUnselected ? 0.75 : 1)};

  &:hover {
    cursor: pointer;
  }
`;

const Photos = styled.div`
  width: 25%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding-right: 10px;
`;

const VehicleImg = styled.img.attrs({
  alt: ''
})`
  width: 100%;
  height: 48%;
  top: 0;
`;

const PlateImg = styled.img.attrs({
  alt: ''
})`
  width: 100%;
  height: 49%;
  bottom: 0;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
  font-size: 14px;
  color: #000000;
`;

const DetailsHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 15px;

  section {
    display: flex;
    flex-direction: column;

    span {
      font-size: 14px;
      font-weight: 300;
      margin-bottom: 5px;
    }

    span:last-child {
      font-size: 15px;
      font-weight: bold;
      letter-spacing: 2px;
    }
  }

  button {
    border-radius: 3px;
    background-color: #f0f0f7;
    height: 30px;
    padding: 0 10px;
    border: none;
    color: #b7bbc6;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    span {
      color: #414345;
      margin-left: 5px;
      font-size: 12px;
      font-weight: 400;
    }

    &:hover {
      background-color: #dcdce7;
      cursor: pointer;
    }

    &:focus {
      outline: none;
    }
  }
`;

const DetailsBody = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  section {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    span {
      min-width: 100px;
      color: rgb(145, 145, 145);
      font-weight: 300;
    }

    div {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      i {
        font-weight: 300;
      }
    }
  }

  section:not(:last-child) {
    border-bottom: 1px solid rgb(220, 220, 230);
    padding-bottom: 6px;
    margin-bottom: 6px;
  }
`;

const VehicleCard = ({
  vehicle,
  count,
  records,
  onClick,
  isUnselected,
  timestampDesc
} :Props) => {

  const make = vehicle.getIn([PROPERTY_TYPES.MAKE, 0], '');
  const model = vehicle.getIn([PROPERTY_TYPES.MODEL, 0], '');
  const year = vehicle.getIn([PROPERTY_TYPES.YEAR, 0], '');
  const plate = vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '');
  const state = vehicle.getIn([PROPERTY_TYPES.STATE, 0], 'California');

  const vehicleImages = records.flatMap(record => record.get(PROPERTY_TYPES.VEHICLE_IMAGE, List()));
  const plateImages = records.flatMap(record => record.get(PROPERTY_TYPES.LICENSE_PLATE_IMAGE, List()));

  const makeModelString = `${make} ${model}`.trim();

  const addToReport = (e) => {
    e.stopPropagation();
    console.log('add to report!')
  }

  const getUniqueValues = (fqn) => {
    const allValues = records.flatMap(record => record.get(fqn, List()));
    return allValues.filter((val, index) => allValues.indexOf(val) === index);
  };

  let timestamp;
  records
    .flatMap(record => record.get(PROPERTY_TYPES.TIMESTAMP, List()))
    .map(dt => moment(dt))
    .filter(dt => dt.isValid())
    .forEach((dt) => {
      if (!timestamp) {
        timestamp = dt;
      }
      else {
        const shouldReplace = timestampDesc ? dt.isAfter(timestamp) : dt.isBefore(timestamp);
        if (shouldReplace) {
          timestamp = dt;
        }
      }
    });

  const timestampStr = timestamp ? timestamp.format('MM/DD/YY hh:mm A') : '';

  const devices = getUniqueValues(PROPERTY_TYPES.CAMERA_ID);
  const departments = getUniqueValues(PROPERTY_TYPES.AGENCY_NAME);

  return (
    <Card onClick={onClick} isUnselected={isUnselected}>
      <Photos>
        { vehicleImages.size ? <VehicleImg src={vehicleImages.get(0)} alt="" /> : null }
        { plateImages.size ? <PlateImg src={plateImages.get(0)} alt="" /> : null }

      </Photos>
      <Details>
        <DetailsHeader>
          <section>
            <span>{state}</span>
            <span>{plate}</span>
          </section>
          <button onClick={addToReport}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Add to report</span>
          </button>
        </DetailsHeader>
        <DetailsBody>
          <section>
            <span>Make / Model</span>
            <div>{makeModelString.length ? makeModelString : <i>Unknown</i>}</div>
          </section>
          <section>
            <span>Timestamp</span>
            <div>{timestampStr}</div>
          </section>
          <section>
            <span>Dept</span>
            <div>{departments.join(', ')}</div>
          </section>
          <section>
            <span>Device</span>
            <div>{devices.join(', ')}</div>
          </section>
        </DetailsBody>
      </Details>
    </Card>
  );
};

VehicleCard.defaultProps = {
  timestampDesc: false
}

export default VehicleCard;
