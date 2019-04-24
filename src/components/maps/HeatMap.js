/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import reactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
import { List, Map } from 'immutable';

import mapMarker from '../../assets/images/map-marker.png';
import { HEATMAP_PAINT, MAP_STYLE } from '../../utils/constants/MapConstants';
import { getCoordinates, getEntityKeyId } from '../../utils/DataUtils';

declare var __MAPBOX_TOKEN__;

type Props = {
  entities :List<Map<*, *>>
};

type State = {

};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const MapComponent = reactMapboxGl({
  accessToken: __MAPBOX_TOKEN__
});

class HeatMap extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {

    };
  }

  getBounds = () => {
    const { entities } = this.props;

    let minX;
    let maxX;
    let minY;
    let maxY;

    entities.forEach((entity) => {
      const [x, y] = getCoordinates(entity);

      if (!minX || x < minX) {
        minX = x;
      }
      if (!maxX || x > maxX) {
        maxX = x;
      }
      if (!minY || y < minY) {
        minY = y;
      }
      if (!maxY || y > maxY) {
        maxY = y;
      }
    });

    return [[minX, minY], [maxX, maxY]];
  }

  getFeatures = () => {
    const { entities } = this.props;

    return entities.filter(entity => getCoordinates(entity)).map(entity => (
      <Feature
          key={getEntityKeyId(entity)}
          coordinates={getCoordinates(entity)} />
    )).toArray();
  }

  render() {
    const image = new Image(20, 30);
    image.src = mapMarker;
    const images = ['mapMarker', image];
    return (
      <Wrapper>
        <div>map!</div>
        <MapComponent
            style={MAP_STYLE.DARK}
            fitBounds={this.getBounds()}
            fitBoundsOptions={{ padding: 50 }}
            containerStyle={{
              height: '100%',
              width: '100%'
            }}>
          <Layer
              type="heatmap"
              id="marker"
              images={images}
              paint={HEATMAP_PAINT}>
            {this.getFeatures()}
          </Layer>
        </MapComponent>
      </Wrapper>
    );
  }
}

export default HeatMap;
