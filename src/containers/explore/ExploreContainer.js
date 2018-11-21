/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Sidebar from './Sidebar';
import SearchParameters from '../parameters/SearchParameters';
import SimpleMap from '../../components/maps/SimpleMap';
import {
  STATE,
  EXPLORE,
  PARAMETERS,
  SEARCH_PARAMETERS
} from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';

type Props = {
  drawMode :boolean,
  displayFullSearchOptions :boolean,
  results :List<*>,
  selectedEntityKeyIds :Set<*>,
  searchParameters :Map<*, *>,
  filter :string,
  actions :{
    loadDataModel :() => void,
    setDrawMode :(isDrawMode :boolen) => void,
    updateSearchParameters :({ field :string, value :string }) => void
  }
};

type State = {

};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

class ExploreContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.loadDataModel();
  }

  setSearchZones = (searchZones) => {
    const { actions } = this.props;
    actions.updateSearchParameters({
      field: PARAMETERS.SEARCH_ZONES,
      value: searchZones
    });
    actions.setDrawMode(false);
  }

  render() {
    const {
      actions,
      drawMode,
      displayFullSearchOptions,
      filter,
      results,
      searchParameters,
      selectedEntityKeyIds
    } = this.props;

    const entities = filter.length
      ? results.filter(hit => hit.get(PROPERTY_TYPES.HIT_TYPE, List()).includes(filter))
      : results;

    return (
      <Wrapper>
        <SearchParameters />
        {displayFullSearchOptions ? null : <Sidebar />}
        <SimpleMap
            drawMode={drawMode}
            searchParameters={searchParameters}
            setDrawMode={actions.setDrawMode}
            setSearchZones={this.setSearchZones}
            entities={entities}
            selectEntity={actions.selectEntity}
            selectedEntityKeyIds={selectedEntityKeyIds}
            heatmap />
      </Wrapper>
    );
  }
}


function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const params = state.get(STATE.PARAMETERS);

  return {
    filter: explore.get(EXPLORE.FILTER),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),

    displayFullSearchOptions: params.get(SEARCH_PARAMETERS.DISPLAY_FULL_SEARCH_OPTIONS),
    searchParameters: params.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    drawMode: params.get(SEARCH_PARAMETERS.DRAW_MODE)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EdmActionFactory).forEach((action :string) => {
    actions[action] = EdmActionFactory[action];
  });

  Object.keys(ExploreActionFactory).forEach((action :string) => {
    actions[action] = ExploreActionFactory[action];
  });

  Object.keys(ParametersActionFactory).forEach((action :string) => {
    actions[action] = ParametersActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExploreContainer));
