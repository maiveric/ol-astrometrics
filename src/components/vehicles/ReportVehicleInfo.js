/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-light-svg-icons';
import { faExclamationTriangle } from '@fortawesome/pro-regular-svg-icons';

import SubtleButton from '../buttons/SubtleButton';
import { countWithLabel } from '../../utils/DataUtils';
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
  padding: ${props => (props.noPadding ? 0 : 16)}px;
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

const Img = styled.img.attrs(_ => ({
  alt: ''
}))`
  max-height: 100%;
  max-width: 48%;
  top: 0;
`;

const ReadDetails = styled(BasicRow)`
  color: #CAC9CE;
  font-size: 12px;
`;

const HitType = styled.div`
  padding-left: 8px;
  color: #EE5345 !important;
`;

const AddToReportButton = styled(SubtleButton)`
  background-color: ${props => (props.isInReport ? '#CAC9CE' : 'transparent')};
  color: ${props => (props.isInReport ? '#36353B' : '#ffffff')};
  border-radius: 50%;
  height: 24px !important;
  width: 24px !important;

  &:hover {
    background-color: ${props => (props.isInReport ? '#CAC9CE' : '#4F4E54')} !important;
  }
`;

export const VehicleImageRow = ({
  plateSrc,
  vehicleSrc
}) => (
  <Photos>
    { plateSrc ? <Img src={plateSrc} /> : null }
    { plateSrc ? <Img src={vehicleSrc} /> : null }
  </Photos>
);

const ReportVehicleInfo = ({
  vehicle,
  read,
  onClick,
  isUnselected,
  isInReport,
  timestampDesc,
  toggleReport
} :Props) => {

  const plate = read.getIn([PROPERTY_TYPES.PLATE, 0], '');
  const state = read.getIn([PROPERTY_TYPES.STATE, 0], 'CA');

  const vehicleImages = read.get(PROPERTY_TYPES.VEHICLE_IMAGE, List());
  const plateImages = read.get(PROPERTY_TYPES.LICENSE_PLATE_IMAGE, List());

  const onToggleReport = (e) => {
    e.stopPropagation();
    toggleReport();
  };

  const timestamp = moment(read.getIn([PROPERTY_TYPES.TIMESTAMP, 0], List()));
  const timestampStr = timestamp ? timestamp.format('MM/DD/YY hh:mm A') : '';

  const hitTypes = read.get(PROPERTY_TYPES.HIT_TYPE, List());

  return (
    <Card onClick={onClick} isUnselected={isUnselected}>


      <Section>

        <VehicleImageRow plateSrc={plateImages.get(0)} vehicleSrc={vehicleImages.get(0)} />

        <ReadDetails>
          {timestampStr}
        </ReadDetails>

      </Section>
    </Card>
  );
};

ReportVehicleInfo.defaultProps = {
  timestampDesc: false
};

export default ReportVehicleInfo;
