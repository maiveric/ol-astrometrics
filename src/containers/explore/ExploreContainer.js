/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router';
import type { RequestSequence } from 'redux-reqseq';

import Sidebar from '../../components/body/Sidebar';
import VehicleSidebar from './VehicleListSidebar';
import SelectedVehicleSidebar from '../vehicles/SelectedVehicleSidebar';
import SearchParameters from '../parameters/SearchParameters';
import SimpleMap from '../../components/maps/SimpleMap';
import Modal from '../../components/modals/Modal';
import NewMapModalBody from '../map/NewMapModalBody';
import ExploreNavigationContainer from './ExploreNavigationContainer';
import SavedMapNavBar from '../map/SavedMapNavBar';
import ManageAlertsContainer from '../alerts/ManageAlertsContainer';
import NewAlertModal from '../alerts/NewAlertModal';
import NewReportModal from '../report/NewReportModal';
import RenameReportModal from '../report/RenameReportModal';
import DeleteReportModal from '../report/DeleteReportModal';
import AddReadsToReportModal from '../report/AddReadsToReportModal';
import AllReportsContainer from '../report/AllReportsContainer';
import {
  STATE,
  ALERTS,
  DRAW,
  EDM,
  EXPLORE,
  PARAMETERS,
  REPORT,
  SEARCH_PARAMETERS
} from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
import { getEntitySetId } from '../../utils/AppUtils';
import * as Routes from '../../core/router/Routes';
import * as AlertActionFactory from '../alerts/AlertActionFactory';
import * as DrawActionFactory from '../map/DrawActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';

type Props = {
  edmLoaded :boolean;
  alertModalOpen :boolean;
  newMapModalOpen :boolean;
  addReadsToReportModalOpen :boolean;
  reportModalOpen :boolean;
  renameReportModalOpen :boolean;
  deleteReportModalOpen :boolean;
  drawMode :boolean;
  displayFullSearchOptions :boolean;
  results :List<*>;
  selectedEntityKeyIds :Set<*>;
  selectedReadId :string;
  vehiclesEntitySetId :string;
  searchParameters :Map<*, *>;
  filter :string;
  edm :Map<*, *>;
  actions :{
    loadAlerts :(edm :Map) => void;
    loadReports :() => void;
    loadDataModel :() => void;
    loadDepartmentsAndDevices :() => void;
    loadSavedMaps :() => void;
    setDrawMode :(isDrawMode :boolean) => void;
    updateSearchParameters :({ field :string, value :string }) => void;
    toggleAlertModal :(modalOpen :boolean) => void;
    selectEntity :RequestSequence;
    laodSavedMaps :RequestSequence;
  }
};

type State = {

};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const LeftSidebar = styled.div`
  height: 100%;
  max-width: ${SIDEBAR_WIDTH}px;
`;

const MainContent = styled.div`
  height: 100%;
  width: calc(100% - ${SIDEBAR_WIDTH}px);
`;

class ExploreContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    const { actions, edmLoaded } = this.props;
    actions.loadDataModel();
    actions.loadAlerts();

    if (edmLoaded) {
      this.loadDataDependingOnEDM(this.props);
    }
  }

  componentDidUpdate(prevProps) {
    const { edmLoaded } = this.props;

    if (!prevProps.edmLoaded && edmLoaded) {
      this.loadDataDependingOnEDM(this.props);
    }
  }

  loadDataDependingOnEDM = (props) => {
    const { actions } = props;

    actions.loadDepartmentsAndDevices();
    actions.loadSavedMaps();
    actions.loadReports();
  }

  setSearchZones = (searchZones) => {
    const { actions } = this.props;
    actions.updateSearchParameters({
      field: PARAMETERS.SEARCH_ZONES,
      value: searchZones
    });
    actions.setDrawMode(false);
  }

  selectEntity = (data) => {
    const { actions, vehiclesEntitySetId } = this.props;
    actions.selectEntity({ data, vehiclesEntitySetId });
  }

  renderModal = () => {
    const {
      actions,
      alertModalOpen,
      newMapModalOpen,
      addReadsToReportModalOpen,
      reportModalOpen,
      renameReportModalOpen,
      deleteReportModalOpen
    } = this.props;

    let modalProps = {
      isOpen: false,
      onClose: () => {}
    };
    let content;

    if (newMapModalOpen) {
      modalProps = {
        isOpen: true,
        header: 'Save current map',
        onClose: () => actions.toggleCreateNewMap(false)
      };

      content = <NewMapModalBody />;
    }

    else if (reportModalOpen) {
      modalProps = {
        isOpen: true,
        onClose: () => actions.toggleReportModal(false)
      };

      content = <NewReportModal />;
    }

    else if (renameReportModalOpen) {
      modalProps = {
        isOpen: true,
        onClose: () => actions.toggleRenameReportModal(false)
      };

      content = <RenameReportModal />;
    }

    else if (deleteReportModalOpen) {
      modalProps = {
        isOpen: true,
        onClose: () => actions.toggleDeleteReportModal(false)
      };

      content = <DeleteReportModal />;
    }

    else if (addReadsToReportModalOpen) {
      modalProps = {
        isOpen: true,
        onClose: () => actions.toggleAddReadsToReportModal(false)
      };

      content = <AddReadsToReportModal />;
    }

    else if (alertModalOpen) {
      modalProps = {
        isOpen: true,
        onClose: () => actions.toggleAlertModal(false)
      };
      content = <NewAlertModal />;
    }

    return (
      <Modal {...modalProps}>{content}</Modal>
    );
  }

  renderMap = () => {
    const {
      actions,
      drawMode,
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
      <>
        <SimpleMap
            drawMode={drawMode}
            searchParameters={searchParameters}
            setDrawMode={actions.setDrawMode}
            setSearchZones={this.setSearchZones}
            entities={entities}
            selectEntity={this.selectEntity}
            selectedEntityKeyIds={selectedEntityKeyIds}
            selectedReadId={selectedReadId}
            heatmap />
        {drawMode ? <SavedMapNavBar /> : null}
      </>
    );
  }

  renderAlerts = () => {
    return <div>alerts</div>;
  }

  renderReports = () => {
    return <div>reports</div>;
  }

  renderSidebar = () => {
    const {
      displayFullSearchOptions,
      selectedEntityKeyIds
    } = this.props;

    let sidebarContent;
    if (displayFullSearchOptions) {
      sidebarContent = <SearchParameters />;
    }
    else if (selectedEntityKeyIds.size) {
      sidebarContent = <SelectedVehicleSidebar />;
    }
    else {
      sidebarContent = <VehicleSidebar />;
    }

    return (
      <LeftSidebar>
        <Sidebar>
          {sidebarContent}
        </Sidebar>
        <SearchParameters />
      </LeftSidebar>
    );

  }

  render() {

    return (
      <Wrapper>

        {this.renderModal()}

        {this.renderSidebar()}

        <MainContent>
          <ExploreNavigationContainer />

          <Switch>
            <Route path={Routes.MAP_ROUTE} render={this.renderMap} />
            <Route path={Routes.ALERTS_ROUTE} component={ManageAlertsContainer} />
            <Route path={Routes.REPORTS_ROUTE} component={AllReportsContainer} />
            <Redirect to={Routes.MAP_ROUTE} />
          </Switch>

        </MainContent>

      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const draw = state.get(STATE.DRAW);
  const edm = state.get(STATE.EDM);
  const explore = state.get(STATE.EXPLORE);
  const params = state.get(STATE.PARAMETERS);
  const alerts = state.get(STATE.ALERTS);
  const reports = state.get(STATE.REPORT);

  return {
    edm,
    edmLoaded: edm.get(EDM.EDM_LOADED),

    vehiclesEntitySetId: getEntitySetId(app, APP_TYPES.CARS),
    filter: explore.get(EXPLORE.FILTER),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    selectedReadId: explore.get(EXPLORE.SELECTED_READ_ID),

    displayFullSearchOptions: params.get(SEARCH_PARAMETERS.DISPLAY_FULL_SEARCH_OPTIONS),
    searchParameters: params.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    drawMode: params.get(SEARCH_PARAMETERS.DRAW_MODE),

    alertModalOpen: alerts.get(ALERTS.ALERT_MODAL_OPEN),
    addReadsToReportModalOpen: !!reports.get(REPORT.ADD_READS_TO_REPORT_MODAL_OPEN),
    reportModalOpen: reports.get(REPORT.REPORT_MODAL_OPEN),
    renameReportModalOpen: !!reports.get(REPORT.RENAME_REPORT_MODAL_OPEN),
    deleteReportModalOpen: !!reports.get(REPORT.REPORT_TO_DELETE),
    newMapModalOpen: draw.get(DRAW.IS_CREATING_MAP)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AlertActionFactory).forEach((action :string) => {
    actions[action] = AlertActionFactory[action];
  });

  Object.keys(DrawActionFactory).forEach((action :string) => {
    actions[action] = DrawActionFactory[action];
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

  Object.keys(ReportActionFactory).forEach((action :string) => {
    actions[action] = ReportActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExploreContainer));
