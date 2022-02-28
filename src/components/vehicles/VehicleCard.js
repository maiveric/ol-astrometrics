/*
 * @flow
 */

import React from 'react';

import moment from 'moment';
import styled from 'styled-components';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';

import { HEADER_HEIGHT, INNER_NAV_BAR_HEIGHT, SIDEBAR_WIDTH } from '../../core/style/Sizes';
import { countWithLabel } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

type Props = {
  vehicle :Map<*, *>,
  records :List<*>,
  isUnselected :boolean,
  isStolen :boolean,
  onClick :() => void,
  timestampDesc? :boolean,
};

const Card = styled.div`
  background-color: #36353B;
  border-radius: 3px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  opacity: ${(props) => (props.isUnselected ? 0.75 : 1)};
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
  padding: ${(props) => (props.noPadding ? 0 : 16)}px;
  border-bottom: 1px solid #1F1E24;

  div:first-child {
    width: fit-content;
    display: flex;
    flex-direction: row;
    align-items: center;

    span {
      padding: 2px 5px;
      background-color: ${(props) => (props.printable ? '#ffffff' : '#98979D')};
      border-radius: 5px;
      border: ${(props) => (props.printable ? '1px solid black' : 'none')};
      color: ${(props) => (props.printable ? 'black' : '#070709')};
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
      color: ${(props) => (props.printable ? 'black' : '#ffffff')};
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

const ImageTooltip = styled.img.attrs(_ => ({
  alt: ''
}))`
  visibility: hidden;
  position: fixed;
  left: ${SIDEBAR_WIDTH}px;
  top: ${HEADER_HEIGHT + INNER_NAV_BAR_HEIGHT}px;
  max-height: calc(100vh - ${HEADER_HEIGHT + INNER_NAV_BAR_HEIGHT}px);
  max-width: calc(100vw - ${SIDEBAR_WIDTH}px);
  display: none;
`;

const HoverableImage = styled.div`
  max-height: 100%;
  max-width: 48%;
  top: 0;
  z-index: 100;
  &:hover {
    ${ImageTooltip} {
      visibility: visible;
      display: unset;
    }
  }
`;

const Img = styled.img.attrs(_ => ({
  alt: ''
}))`
  max-height: 100%;
  max-width: 100%;
`;

const ReadDetails = styled(BasicRow)`
  color: #CAC9CE;
  font-size: 12px;
  justify-content: flex-start;

  span {
    padding-left: 10px;
  }
`;

const StolenTag = styled.div`
  width: 64px;
  height: 19px;
  border-radius: 4px;
  background-color: #9C2D23;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 !important;

  p {
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    padding: 0;
  }
`;

export const VehicleHeader = ({
  state,
  plate,
  isStolen,
  noPadding,
  printable
}) => (
  <HeaderRow noPadding={noPadding} printable={printable}>
    <div>
      {state && <span>{state}</span>}
      <div>{plate}</div>
      {isStolen ? <StolenTag><p>Stolen</p></StolenTag> : null}
    </div>
  </HeaderRow>
);

const VehicleImage = ({ src }) => {
  if (!src) {
    return null;
  }

  return (
    <HoverableImage>
      <Img src={src} />
      <ImageTooltip src={src} />
    </HoverableImage>
  );
};

export const VehicleImageRow = ({
  plateSrc,
  vehicleSrc
}) => (
  <Photos>
    <VehicleImage src={plateSrc} />
    <VehicleImage src={vehicleSrc} />
  </Photos>
);

const VehicleCard = ({
  vehicle,
  records,
  onClick,
  isUnselected,
  isStolen,
  timestampDesc
} :Props) => {

  const plate = vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '');
  const state = vehicle.getIn([PROPERTY_TYPES.STATE, 0], 'CA');

  const vehicleImages = records.flatMap((record) => record.get(PROPERTY_TYPES.VEHICLE_IMAGE, List()));
  const plateImages = records.flatMap((record) => record.get(PROPERTY_TYPES.LICENSE_PLATE_IMAGE, List()));

  let timestamp;
  records
    .flatMap((record) => record.get(PROPERTY_TYPES.TIMESTAMP, List()))
    .map((dt) => moment(dt))
    .filter((dt) => dt.isValid())
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

  const numReadsText = countWithLabel(records.size, 'read');
  const timestampLabel = timestampDesc ? 'Latest' : 'Earliest';
  const timestampStr = timestamp ? `${timestampLabel} on ${timestamp.format('MM/DD/YY hh:mm A')}` : '';

  return (
    <Card onClick={onClick} isUnselected={isUnselected}>
      <VehicleHeader state={state} plate={plate} isStolen={isStolen} />
      <Section>
        <VehicleImageRow plateSrc={plateImages.get(0)} vehicleSrc={vehicleImages.get(0)} />
        <ReadDetails>
          <FontAwesomeIcon icon={faVideo} />
          <span>{numReadsText}</span>
          <span>{timestampStr}</span>
        </ReadDetails>
      </Section>
    </Card>
  );
};

VehicleCard.defaultProps = {
  timestampDesc: false
};

export default VehicleCard;
