/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faPlus } from '@fortawesome/pro-light-svg-icons';

import SubtleButton from '../buttons/SubtleButton';
import ToggleReportButton from '../buttons/ToggleReportButton';
import { getDisplayNameForId } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

type Props = {
  vehicle :Map<*, *>,
  records :List<*>,
  isUnselected :boolean,
  onClick :() => void,
  timestampDesc? :boolean,
  isInReport :boolean,
  toggleReport :() => void,
  departmentOptions :Map,
  deviceOptions :Map
};

const Card = styled.div`
  background-color: #36353B;
  border-radius: 3px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  opacity: ${props => (props.isUnselected ? 0.75 : 1)};
  margin-bottom: 16px;

  &:hover {
    cursor: pointer;
  }
`;

const Section = styled.div`
  padding: 16px;
`;

const BasicRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderRow = styled(BasicRow)`
  padding: 16px;
  border-bottom: 1px solid #1F1E24;

  div:first-child {
    width: fit-content;
    display: flex;
    flex-direction: row;
    align-items: center;

    span {
      padding: 2px 5px;
      background-color: #98979D;
      border-radius: 5px;
      color: #070709;
      font-size: 11px;
      font-weight: bold;
      display: flex;
      align-items: center;
      max-height: 21px;
    }

    div {
      padding-left: 8px;
      font-weight: 600;
      font-size: 16px;
      color: #ffffff;
    }

  }

  button {
    width: fit-content;
    padding: 0;
  }
`;

const Photos = styled(BasicRow)`
  padding-bottom: 16px;
  align-items: flex-start;
`;

const Img = styled.img.attrs({
  alt: ''
})`
  max-height: 100%;
  max-width: 48%;
  top: 0;
`;

const ReadDetails = styled(BasicRow)`
  color: #CAC9CE;
  font-size: 12px;
`;

const HitType = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  color: #ff3c5d;

  span {
    margin-left: 10px;
    font-weight: 600;
  }
`;

const VehicleCard = ({
  vehicle,
  records,
  onClick,
  isUnselected,
  timestampDesc,
  toggleReport
} :Props) => {

  const plate = vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '');
  const state = vehicle.getIn([PROPERTY_TYPES.STATE, 0], 'CA');

  const vehicleImages = records.flatMap(record => record.get(PROPERTY_TYPES.VEHICLE_IMAGE, List()));
  const plateImages = records.flatMap(record => record.get(PROPERTY_TYPES.LICENSE_PLATE_IMAGE, List()));

  const onToggleReport = (e) => {
    e.stopPropagation();
    toggleReport();
  };

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

  const hitTypes = getUniqueValues(PROPERTY_TYPES.HIT_TYPE);

  const moreReads = records.size - 1;

  return (
    <Card onClick={onClick} isUnselected={isUnselected}>
      {
        hitTypes.size ? (
          <Section>
            <HitType>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{hitTypes.join(', ')}</span>
            </HitType>
          </Section>
        ) : null
      }

      <HeaderRow>
        <div>
          <span>{state}</span>
          <div>{plate}</div>
        </div>

        <SubtleButton onClick={onToggleReport}>
          <FontAwesomeIcon icon={faPlus} />
        </SubtleButton>
      </HeaderRow>

      <Section>

        <Photos>
          { plateImages.size ? <Img src={plateImages.get(0)} /> : null }
          { vehicleImages.size ? <Img src={vehicleImages.get(0)} /> : null }
        </Photos>

        <ReadDetails>
          {`${timestampStr}${moreReads ? ` + ${moreReads} more read${moreReads > 1 ? 's' : ''}` : ''}`}
        </ReadDetails>

      </Section>
    </Card>
  );
};

VehicleCard.defaultProps = {
  timestampDesc: false
};

export default VehicleCard;
