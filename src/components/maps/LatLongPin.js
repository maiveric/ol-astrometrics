import React from 'react';
import styled from 'styled-components';
import { Marker } from 'react-mapbox-gl';
import { Map } from 'immutable';

import { MAP_STYLE } from '../../utils/constants/MapConstants';
import { PARAMETERS } from '../../utils/constants/StateConstants';

type Props = {
  isMapStyleLoading :boolean,
  mapMode :string,
  searchParameters :Map<*, *>
};

const Pin = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  div:first-child {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background-color: ${props => props.color};
    margin-bottom: -5px;
  }

  div:last-child {
    width: 2px;
    background-color: ${props => props.color};
    height: 16px;
  }
`;

class LatLongPin extends React.Component<Props> {

  render() {
    const { mapMode, searchParameters } = this.props;

    const latitude = searchParameters.get(PARAMETERS.LATITUDE);
    const longitude = searchParameters.get(PARAMETERS.LONGITUDE);

    if (!latitude || !longitude) {
      return null;
    }

    let color = 'white';
    if (mapMode === MAP_STYLE.LIGHT) {
      color = 'black';
    }

    return (
      <Marker coordinates={[longitude, latitude]} anchor="bottom">
        <Pin color={color}>
          <div />
          <div />
        </Pin>
      </Marker>
    );
  }
}

export default LatLongPin;
