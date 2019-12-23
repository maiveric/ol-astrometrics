import React from 'react';
import styled from 'styled-components';
import { Feature, Layer } from 'react-mapbox-gl';
import { Map } from 'immutable';

import { MAP_STYLE, LAYERS } from '../../utils/constants/MapConstants';
import { PARAMETERS } from '../../utils/constants/StateConstants';
import {
  SEARCH_ZONE_COLORS_DARK,
  SEARCH_ZONE_COLORS_LIGHT
} from '../../utils/constants/Colors';

type Props = {
  entityCount :number,
  isMapStyleLoading :boolean,
  mapMode :string,
  searchParameters :Map<*, *>
};

class SearchRadius extends React.Component<Props> {

  shouldComponentUpdate(nextProps) {
    if (nextProps.isMapStyleLoading) {
      return false;
    }
    return true;
  }

  metersToPixelsAtMaxZoom = (meters, latitude) => meters / 0.075 / Math.cos(latitude * Math.PI / 180);

  milesToPixelsAtMaxZoom = (miles, latitude) => this.metersToPixelsAtMaxZoom(miles * 1609.34, latitude);

  render() {
    const { entityCount, mapMode, searchParameters } = this.props;
    const radius = searchParameters.get(PARAMETERS.RADIUS);
    const latitude = searchParameters.get(PARAMETERS.LATITUDE);
    const longitude = searchParameters.get(PARAMETERS.LONGITUDE);

    const colors = mapMode === MAP_STYLE.LIGHT ? SEARCH_ZONE_COLORS_LIGHT : SEARCH_ZONE_COLORS_DARK;

    if (radius && latitude && longitude) {
      return (
        <Layer
            type="circle"
            id={LAYERS.SEARCH_RADIUS}
            paint={{
              'circle-opacity': entityCount ? 0.1 : 0.3,
              'circle-color': colors[0],
              'circle-stroke-color': colors[0],
              'circle-stroke-width': 1,
              'circle-radius': {
                stops: [
                  [0, 0],
                  [20, this.milesToPixelsAtMaxZoom(radius, latitude)]
                ],
                base: 2
              },
            }}>
          <Feature coordinates={[longitude, latitude]} />
        </Layer>
      );
    }

    return null;
  }
}

export default SearchRadius;
