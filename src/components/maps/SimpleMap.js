import React from 'react';
import styled from 'styled-components';
import DrawControl from 'react-mapbox-gl-draw';
import reactMapboxGl, {
  Feature,
  GeoJSONLayer,
  Layer,
} from 'react-mapbox-gl';
import { List, Map, Set } from 'immutable';

import mapMarker from '../../assets/images/map-marker.png';
import { SEARCH_TYPES } from '../../utils/constants/ExploreConstants';
import { DRAW_INSTRUCTIONS, HEATMAP_PAINT, MAP_STYLE } from '../../utils/constants/MapConstants';
import { PARAMETERS } from '../../utils/constants/StateConstants';
import { SEARCH_ZONE_COLORS } from '../../utils/constants/Colors';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
import { getCoordinates, getEntityKeyId } from '../../utils/DataUtils';
import { getSearchFields } from '../../containers/parameters/ParametersReducer';

declare var __MAPBOX_TOKEN__;

const COORDS = {
  CONTINENTAL_US: [[-124.7844079, 24.7433195], [-66.9513812, 49.3457868]],
  BAY_AREA: [[-123.025192, 38.117602], [-121.170329, 37.086658]]
};

const DEFAULT_COORDS = COORDS.BAY_AREA;

type Props = {
  drawMode :boolean,
  entities :List<Map<*, *>>,
  heatmap? :boolean,
  searchParameters :Map<*, *>,
  selectedEntityKeyIds :Set<*>,
  selectedReadId :string,
  setDrawMode :(drawMode :boolean) => void,
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
  height: 100%;
  bottom: 0;
  right: 0;
`;

const DrawModeInstructionBox = styled.div`
  position: absolute;
  z-index: 1;
  top: 150px;
  right: 50px;
  background-color: rgba(0, 0, 0, 0.7);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 3px;
  padding: 20px;
  display: flex;
  flex-direction: row;
  width: 650px;

  section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: space-between;

    &:first-child {
      width: 100%;
      font-size: 15px;

      span {
        font-style: italic;
        font-weight: 600;
        margin-bottom: 15px;
      }
    }

    &:last-child {
      width: 220px;
      margin-left: 20px;

      button {
        height: 48%;
        width: 100%;
        border: none;
        border-radius: 3px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 15px;

        &:first-child {
          background-color: #6124e2;

          &:hover {
            background-color: #8045ff;
          }

          &:active {
            background-color: #361876;
          }
        }

        &:last-child {
          background-color: transparent;

          &:hover {
            color: #dcdce7;
          }
        }

        &:hover {
          cursor: pointer;
        }

        &:focus {
          outline: none;
        }
      }
    }
  }
`;

const MapComponent = reactMapboxGl({
  accessToken: __MAPBOX_TOKEN__
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

  renderDefaultLayer = () => {
    const image = new Image(20, 30);
    image.src = mapMarker;
    const images = ['mapMarker', image];
    return (
      <Layer
          type="symbol"
          id="symbol"
          images={images}
          layout={{ 'icon-image': 'mapMarker' }}>
        {this.getFeatures()}
      </Layer>
    );
  }

  renderHeatmapLayer = () => (
    <Layer
        type="heatmap"
        id="heatmap"
        paint={HEATMAP_PAINT}>
      {this.getFeatures()}
    </Layer>
  )

  metersToPixelsAtMaxZoom = (meters, latitude) => meters / 0.075 / Math.cos(latitude * Math.PI / 180);

  milesToPixelsAtMaxZoom = (miles, latitude) => this.metersToPixelsAtMaxZoom(miles * 1609.34, latitude);

  renderSearchAreaLayer = () => {
    const { searchParameters } = this.props;
    const radius = searchParameters.get(PARAMETERS.RADIUS);
    const latitude = searchParameters.get(PARAMETERS.LATITUDE);
    const longitude = searchParameters.get(PARAMETERS.LONGITUDE);

    if (radius && latitude && longitude) {
      return (
        <Layer
            type="circle"
            id="search-radius"
            paint={{
              'circle-opacity': 0.3,
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

  saveSearchZones = () => {
    const { setSearchZones } = this.props;
    const searchZones = this.drawControl.draw.getAll();
    if (searchZones && searchZones.features && searchZones.features.length) {
      const coordinateSets = searchZones.features.map(feature => feature.geometry.coordinates[0]);
      setSearchZones(coordinateSets);
    }
  }

  renderSearchZones = () => {
    const { searchParameters } = this.props;

    return searchParameters.get(PARAMETERS.SEARCH_ZONES, []).map((zone, index) => {
      return (
        <GeoJSONLayer
            key={`polygon-${index}`}
            fillPaint={{
              'fill-opacity': 0.3,
              'fill-color': SEARCH_ZONE_COLORS[index % SEARCH_ZONE_COLORS.length]
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

  renderDrawModeInstructions = () => {
    const { setDrawMode } = this.props;

    return (
      <DrawModeInstructionBox>
        <section>
          <span>Drawing mode</span>
          <div>{DRAW_INSTRUCTIONS}</div>
        </section>
        <section>
          <button onClick={this.saveSearchZones}>Save search zones</button>
          <button onClick={() => setDrawMode(false)}>Cancel</button>
        </section>
      </DrawModeInstructionBox>
    );
  }

  renderDrawControl = () => {
    return (
      <DrawControl
          ref={(drawControl) => {
            this.drawControl = drawControl;
          }}
          position="bottom-right"
          displayControlsDefault={false}
          controls={{
            polygon: true,
            trash: true
          }} />
    );
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

  getSourceLayer = (id, entityFilter, shouldCluster) => {
    const { entities } = this.props;

    return (
      <GeoJSONLayer
          id={id}
          data={{
            type: 'FeatureCollection',
            features: entities.filter(entityFilter).map(this.mapEntityToFeature).toArray()
          }}
          fillOnClick={console.log}
          circleOnClick={console.log}
          sourceOptions={{
            cluster: shouldCluster,
            clusterMaxZoom: 14,
            clusterRadius: 50
          }} />
    );
  }

  addSource = () => this.getSourceLayer('sourcefeatures', entity => getCoordinates(entity), true)

  addSelectedSource = () => {
    const { selectedEntityKeyIds } = this.props;

    return this.getSourceLayer(
      'selectedsourcefeatures',
      entity => selectedEntityKeyIds.has(getEntityKeyId(entity)) && getCoordinates(entity),
      false
    );
  }

  addSelectedReadSource = () => {
    const { selectedReadId } = this.props;

    return this.getSourceLayer(
      'selectedread',
      entity => getEntityKeyId(entity) === selectedReadId && getCoordinates(entity),
      false
    );
  }

  renderClusters = () => {
    const { selectedEntityKeyIds } = this.props;
    return (
      <Layer
          type="circle"
          sourceId="sourcefeatures"
          filter={['has', 'point_count']}
          paint={{
            'circle-opacity': selectedEntityKeyIds.size ? 0.4 : 1,
            'circle-color': SEARCH_ZONE_COLORS[0],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              10,
              20,
              20,
              100,
              30,
              300,
              40,
              500,
              50
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': selectedEntityKeyIds.size ? 0.4 : 1
          }} />
    );
  }

  renderSelectedFeatures = () => (
    <Layer
        type="circle"
        sourceId="selectedsourcefeatures"
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
        sourceId="selectedread"
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
        sourceId="selectedsourcefeatures"
        paint={{
          'circle-opacity': 1,
          'circle-color': '#ffffff',
          'circle-radius': 4
        }} />
  )

  renderClusteredCounts = () => {
    return (
      <Layer
          type="symbol"
          sourceId="sourcefeatures"
          filter={['has', 'point_count']}
          layout={{
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }} />
    );
  }

  renderUnclusteredPoints = () => {
    const { selectedEntityKeyIds } = this.props;

    return (
      <Layer
          id="data-points"
          type="circle"
          sourceId="sourcefeatures"
          filter={['!', ['has', 'point_count']]}
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

  render() {
    const { drawMode, searchParameters } = this.props;
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

          {this.addSource()}
          {drawMode ? this.renderDrawModeInstructions() : null}
          {drawMode ? this.renderDrawControl() : null}
          {this.renderClusters()}
          {this.renderClusteredCounts()}
          {this.renderUnclusteredPoints()}
          {/* {heatmap ? this.renderHeatmapLayer() : this.renderDefaultLayer()} */}

          {this.addSelectedSource()}
          {this.addSelectedReadSource()}
          {this.renderSelectedFeatures()}
          {this.renderSelectedReadFeature()}
          {this.renderSelectedFeaturesInnerCircles()}

          {this.renderSearchZones()}
          {searchFields.includes(SEARCH_TYPES.GEO_RADIUS) && !drawMode ? this.renderSearchAreaLayer() : null}
        </MapComponent>
      </Wrapper>
    );
  }
}

export default SimpleMap;
