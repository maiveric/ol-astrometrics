export const MAP_STYLE = {
  DEFAULT: 'mapbox://styles/mapbox/streets-v9',
  DARK: 'mapbox://styles/mapbox/dark-v9',
  LIGHT: 'mapbox://styles/mapbox/light-v9'
};

export const HEATMAP_PAINT = {
  // increase weight as diameter breast height increases
  'heatmap-weight': {
    property: 'dbh',
    type: 'exponential',
    stops: [
      [1, 0],
      [62, 1]
    ]
  },
  // increase intensity as zoom level increases
  'heatmap-intensity': {
    stops: [
      [11, 1],
      [15, 3]
    ]
  },
  // assign color values be applied to points depending on their density
  // increase radius as zoom increases
  'heatmap-radius': {
    stops: [
      [11, 15],
      [15, 20]
    ]
  },
  // decrease opacity to transition into the circle layer
  // 'heatmap-opacity': {
  //   default: 1,
  //   stops: [
  //     [14, 1],
  //     [15, 0]
  //   ]
  // }
};

export const DRAW_INSTRUCTIONS = 'Define as many search zones as you want by selecting the square icon in the bottom left hand corner and drawing polygons on the map. Click and release to place a corner of a polygon, and click a placed corner a second time to complete a polygon. Click then drag any corner to edit.';
