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
import SearchParameters from './SearchParameters';
import SimpleMap from '../../components/maps/SimpleMap';
import { STATE, EXPLORE, PARAMETERS } from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';

type Props = {
  displayFullSearchOptions :boolean,
  drawMode :boolean,
  results :List<*>,
  selectedEntityKeyIds :Set<*>,
  searchParameters :Map<*, *>,
  filter :string,
  actions :{
    editSearchParameters :(editing :boolean) => void,
    executeSearch :(searchParameters :Object) => void,
    geocodeAddress :(address :string) => void,
    selectAddress :(address :Object) => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    setDrawMode :(drawMode :boolean) => void,
    updateSearchParameters :({ field :string, value :string }) => void,
    searchAgencies :({ entitySetId :string, value :string }) => void,
    selectAgency :(agency :Map) => void
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
      displayFullSearchOptions,
      drawMode,
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
        <SearchParameters isTopNav={!displayFullSearchOptions || drawMode} />
        {displayFullSearchOptions ? null : <Sidebar />}
        <SimpleMap
            drawMode={drawMode}
            setDrawMode={actions.setDrawMode}
            setSearchZones={this.setSearchZones}
            searchParameters={searchParameters}
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
  return {
    displayFullSearchOptions: explore.get(EXPLORE.DISPLAY_FULL_SEARCH_OPTIONS),
    drawMode: explore.get(EXPLORE.DRAW_MODE),
    filter: explore.get(EXPLORE.FILTER),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    searchParameters: explore.get(EXPLORE.SEARCH_PARAMETERS)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EdmActionFactory).forEach((action :string) => {
    actions[action] = EdmActionFactory[action];
  });

  Object.keys(EntitySetActionFactory).forEach((action :string) => {
    actions[action] = EntitySetActionFactory[action];
  });

  Object.keys(ExploreActionFactory).forEach((action :string) => {
    actions[action] = ExploreActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExploreContainer));
