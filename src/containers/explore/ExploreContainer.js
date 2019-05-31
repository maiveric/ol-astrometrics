/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import type { RequestSequence } from 'redux-reqseq';

import Sidebar from './Sidebar';
import SelectedVehicleSidebar from '../vehicles/SelectedVehicleSidebar';
import SearchParameters from '../parameters/SearchParameters';
import SimpleMap from '../../components/maps/SimpleMap';
import ManageAlertsContainer from '../alerts/ManageAlertsContainer';
import {
  STATE,
  ALERTS,
  EDM,
  EXPLORE,
  PARAMETERS,
  SEARCH_PARAMETERS
} from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import * as AlertActionFactory from '../alerts/AlertActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';

type Props = {
  alertModalOpen :boolean;
  drawMode :boolean;
  displayFullSearchOptions :boolean;
  results :List<*>;
  selectedEntityKeyIds :Set<*>;
  selectedReadId :string;
  searchParameters :Map<*, *>;
  filter :string;
  edm :Map<*, *>;
  actions :{
    loadAlerts :(edm :Map) => void;
    loadDataModel :() => void;
    loadDepartmentsAndDevices :() => void;
    setDrawMode :(isDrawMode :boolean) => void;
    updateSearchParameters :({ field :string, value :string }) => void;
    toggleAlertModal :(modalOpen :boolean) => void;
    selectEntity :RequestSequence;
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
    actions.loadAlerts();
  }

  componentDidUpdate(prevProps) {
    const { actions, edm } = this.props;
    if (!prevProps.edm.get(EDM.ENTITY_SETS).size && edm.get(EDM.ENTITY_SETS).size) {
      actions.loadDepartmentsAndDevices();
    }
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
      alertModalOpen,
      drawMode,
      displayFullSearchOptions,
      filter,
      results,
      searchParameters,
      selectedEntityKeyIds,
      selectedReadId
    } = this.props;

    const entities = filter.length
      ? results.filter(hit => hit.get(PROPERTY_TYPES.HIT_TYPE, List()).includes(filter))
      : results;

    return (
      <Wrapper>
        <SearchParameters />
        {displayFullSearchOptions ? null : <Sidebar />}
        {selectedEntityKeyIds.size && !displayFullSearchOptions ? <SelectedVehicleSidebar /> : null}
        <ModalTransition>
          {alertModalOpen && (
            <Modal onClose={() => actions.toggleAlertModal(false)}>
              <ManageAlertsContainer />
            </Modal>
          )}
        </ModalTransition>
        <SimpleMap
            drawMode={drawMode}
            searchParameters={searchParameters}
            setDrawMode={actions.setDrawMode}
            setSearchZones={this.setSearchZones}
            entities={entities}
            selectEntity={actions.selectEntity}
            selectedEntityKeyIds={selectedEntityKeyIds}
            selectedReadId={selectedReadId}
            heatmap />
      </Wrapper>
    );
  }
}


function mapStateToProps(state :Map<*, *>) :Object {
  const edm = state.get(STATE.EDM);
  const explore = state.get(STATE.EXPLORE);
  const params = state.get(STATE.PARAMETERS);
  const alerts = state.get(STATE.ALERTS);

  return {
    edm,

    filter: explore.get(EXPLORE.FILTER),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    selectedReadId: explore.get(EXPLORE.SELECTED_READ_ID),

    displayFullSearchOptions: params.get(SEARCH_PARAMETERS.DISPLAY_FULL_SEARCH_OPTIONS),
    searchParameters: params.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    drawMode: params.get(SEARCH_PARAMETERS.DRAW_MODE),

    alertModalOpen: alerts.get(ALERTS.ALERT_MODAL_OPEN)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AlertActionFactory).forEach((action :string) => {
    actions[action] = AlertActionFactory[action];
  });

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

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExploreContainer));
