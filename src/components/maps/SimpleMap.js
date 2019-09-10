import React from 'react';
import styled from 'styled-components';
import reactMapboxGl, {
  Feature,
  GeoJSONLayer,
  Layer,
  Marker
} from 'react-mapbox-gl';
import { List, Map, Set } from 'immutable';

import DrawComponent from '../../containers/map/DrawComponent';
import mapMarker from '../../assets/images/map-marker.png';
import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';
import { HEATMAP_PAINT, MAP_STYLE } from '../../utils/constants/MapConstants';
import { PARAMETERS } from '../../utils/constants/StateConstants';
import { SEARCH_ZONE_COLORS } from '../../utils/constants/Colors';
import { SIDEBAR_WIDTH, INNER_NAV_BAR_HEIGHT } from '../../core/style/Sizes';
import { getCoordinates, getEntityKeyId } from '../../utils/DataUtils';
import { getSearchFields } from '../../containers/parameters/ParametersReducer';

declare var __MAPBOX_TOKEN__;

const COORDS = {
  CONTINENTAL_US: [[-124.7844079, 24.7433195], [-66.9513812, 49.3457868]],
  BAY_AREA: [[-123.025192, 38.117602], [-121.170329, 37.086658]]
};

const DEFAULT_COORDS = COORDS.BAY_AREA;

const LAYERS = {
  ALL_SOURCE_FEATURES: 'allsourcefeatures',
  SELECTED_SOURCE_FEATURES: 'selectedsourcefeatures',
  SELECTED_READ: 'selectedread',
  SEARCH_RADIUS: 'searchradius'
};

type Props = {
  drawMode :boolean,
  entities :List<Map<*, *>>,
  heatmap? :boolean,
  searchParameters :Map<*, *>,
  selectedEntityKeyIds :Set<*>,
  selectedReadId :string,
  setSearchZones :(searchZones :number[][]) => void,
  selectEntity :(entityKeyId :string) => void
};

type State = {
  fitToBounds :boolean
};

const Wrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: calc(100% - ${SIDEBAR_WIDTH}px);
  height: calc(100% - ${INNER_NAV_BAR_HEIGHT - 1}px);
  bottom: 0;
  right: 0;
`;

const Pin = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  div:first-child {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background-color: white;
    margin-bottom: -5px;
  }

  div:last-child {
    width: 2px;
    background-color: white;
    height: 16px;
  }
`;

const MapComponent = reactMapboxGl({
  accessToken: __MAPBOX_TOKEN__,
  logoPosition: 'top-right'
});

class SimpleMap extends React.Component<Props, State> {

  static defaultProps = {
    heatmap: false
  }

  constructor(props) {
    super(props);
    this.state = {
      fitToBounds: true
    };
  }

  componentWillReceiveProps(nextProps) {
    const { entities } = this.props;
    if (!nextProps.entities.size || entities !== nextProps.entities) {
      this.setState({ fitToBounds: true });
    }
    else {
      this.setState({ fitToBounds: false });
    }
  }

  getBounds = () => {
    const { entities } = this.props;

    /* Show bay area if no entities present to display */
    if (!entities.size) {
      return DEFAULT_COORDS;
    }

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

  metersToPixelsAtMaxZoom = (meters, latitude) => meters / 0.075 / Math.cos(latitude * Math.PI / 180);

  milesToPixelsAtMaxZoom = (miles, latitude) => this.metersToPixelsAtMaxZoom(miles * 1609.34, latitude);

  renderLatLong = () => {
    const { searchParameters } = this.props;

    const latitude = searchParameters.get(PARAMETERS.LATITUDE);
    const longitude = searchParameters.get(PARAMETERS.LONGITUDE);

    if (!latitude || !longitude) {
      return null;
    }

    return (
      <Marker coordinates={[longitude, latitude]} anchor="bottom">
        <Pin>
          <div />
          <div />
        </Pin>
      </Marker>
    );
  }

  renderSearchAreaLayer = () => {
    const { entities, searchParameters } = this.props;
    const radius = searchParameters.get(PARAMETERS.RADIUS);
    const latitude = searchParameters.get(PARAMETERS.LATITUDE);
    const longitude = searchParameters.get(PARAMETERS.LONGITUDE);

    if (radius && latitude && longitude) {
      return (
        <Layer
            type="circle"
            id={LAYERS.SEARCH_RADIUS}
            paint={{
              'circle-opacity': entities.size ? 0.1 : 0.3,
              'circle-color': SEARCH_ZONE_COLORS[0],
              'circle-stroke-color': SEARCH_ZONE_COLORS[0],
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

  renderSearchZones = () => {
    const { entities, searchParameters } = this.props;

    return searchParameters.get(PARAMETERS.SEARCH_ZONES, []).map((zone, index) => {
      const color = SEARCH_ZONE_COLORS[index % SEARCH_ZONE_COLORS.length];

      return (
        <GeoJSONLayer
            key={`polygon-${index}`}
            fillPaint={{
              'fill-opacity': entities.size ? 0.1 : 0.3,
              'fill-color': color,
              'fill-stroke-color': color,
              'fill-stroke-width': 1,
            }}
            data={{
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [zone]
              }
            }} />
      );
    });
  }

  mapEntityToFeature = (entity) => {
    const entityKeyId = getEntityKeyId(entity);
    return {
      type: 'Feature',
      properties: { entityKeyId },
      geometry: {
        type: 'Point',
        coordinates: getCoordinates(entity)
      }
    };
  }

  getSourceLayer = (id, entityFilter) => {
    const { entities } = this.props;

    return (
      <GeoJSONLayer
          id={id}
          data={{
            type: 'FeatureCollection',
            features: entities.filter(entityFilter).map(this.mapEntityToFeature).toArray()
          }}
          fillOnClick={console.log}
          circleOnClick={console.log} />
    );
  }

  addSource = () => this.getSourceLayer(LAYERS.ALL_SOURCE_FEATURES, entity => getCoordinates(entity))

  addSelectedSource = () => {
    const { selectedEntityKeyIds } = this.props;

    return this.getSourceLayer(
      LAYERS.SELECTED_SOURCE_FEATURES,
      entity => selectedEntityKeyIds.has(getEntityKeyId(entity)) && getCoordinates(entity)
    );
  }

  addSelectedReadSource = () => {
    const { selectedReadId } = this.props;

    return this.getSourceLayer(
      LAYERS.SELECTED_READ,
      entity => getEntityKeyId(entity) === selectedReadId && getCoordinates(entity)
    );
  }

  renderSelectedFeatures = () => (
    <Layer
        type="circle"
        sourceId={LAYERS.SELECTED_SOURCE_FEATURES}
        paint={{
          'circle-opacity': 1,
          'circle-color': SEARCH_ZONE_COLORS[0],
          'circle-radius': 8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 4,
          'circle-stroke-opacity': 1
        }} />
  )

  renderSelectedReadFeature = () => (
    <Layer
        type="circle"
        sourceId={LAYERS.SELECTED_READ}
        paint={{
          'circle-opacity': 1,
          'circle-color': '#ff3c5d',
          'circle-radius': 8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 4,
          'circle-stroke-opacity': 1
        }} />
  )

  renderSelectedFeaturesInnerCircles = () => (
    <Layer
        type="circle"
        sourceId={LAYERS.SELECTED_SOURCE_FEATURES}
        paint={{
          'circle-opacity': 1,
          'circle-color': '#ffffff',
          'circle-radius': 4
        }} />
  )

  renderUnclusteredPoints = () => {
    const { selectedEntityKeyIds } = this.props;

    return (
      <Layer
          id="data-points"
          type="circle"
          sourceId={LAYERS.ALL_SOURCE_FEATURES}
          paint={{
            'circle-opacity': selectedEntityKeyIds.size ? 0.4 : 1,
            'circle-color': SEARCH_ZONE_COLORS[0],
            'circle-radius': 6,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': selectedEntityKeyIds.size ? 0.4 : 1
          }} />
    );
  }

  onPointClick = (e) => {
    const { selectEntity, selectedEntityKeyIds } = this.props;

    const { features } = e;
    if (features && features.length > 0) {
      const { properties } = features[0];
      if (properties) {
        const { entityKeyId } = properties;
        const value = selectedEntityKeyIds.has(entityKeyId) ? undefined : entityKeyId;
        selectEntity(value);
      }
    }
  }

  onMapClick = () => {
    const { selectEntity, selectedEntityKeyIds } = this.props;

    if (selectedEntityKeyIds.size) {
      selectEntity();
    }
  }

  renderAddressAndRadiusSearchParams = (searchFields) => {
    const { drawMode } = this.props;

    const shouldRender = searchFields.includes(SEARCH_TYPES.GEO_RADIUS) && !drawMode;

    const radiusArea = this.renderSearchAreaLayer();
    const addressPin = this.renderLatLong();

    return shouldRender ? (
      <>
        {radiusArea}
        {addressPin}
      </>
    ) : null;
  }

  renderReads = () => {

    return (
      <>
        {this.addSource()}
        {this.renderUnclusteredPoints()}
      </>
    );
  }

  renderSelectedReads = () => {

    return (
      <>
        {this.addSelectedSource()}
        {this.addSelectedReadSource()}
        {this.renderSelectedFeatures()}
        {this.renderSelectedReadFeature()}
        {this.renderSelectedFeaturesInnerCircles()}
      </>
    )
  }

  render() {
    const { searchParameters } = this.props;
    const { fitToBounds } = this.state;

    const searchFields = getSearchFields(searchParameters);

    const optionalProps = fitToBounds ? {
      fitBounds: this.getBounds(),
      fitBoundsOptions: {
        padding: {
          top: 130,
          bottom: 50,
          left: 50,
          right: 550
        }
      }
    } : {};

    return (
      <Wrapper>
        <MapComponent
            style={MAP_STYLE.DARK}
            onStyleLoad={(map) => {
              map.on('click', 'data-points', this.onPointClick);
            }}
            onClick={this.onMapClick}
            containerStyle={{
              height: '100%',
              width: '100%'
            }}
            {...optionalProps}>

          <DrawComponent />

          {this.renderReads()}

          {this.renderSelectedReads()}

          {this.renderSearchZones()}
          {this.renderAddressAndRadiusSearchParams(searchFields)}
        </MapComponent>
      </Wrapper>
    );
  }
}

export default SimpleMap;
