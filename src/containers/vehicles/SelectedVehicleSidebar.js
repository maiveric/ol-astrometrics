/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map, Set } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faMap } from '@fortawesome/pro-light-svg-icons';

import { ScrollableSidebar, SidebarHeader, PaddedSection } from '../../components/body/Sidebar';
import ToggleReportButton from '../../components/buttons/ToggleReportButton';
import BasicButton from '../../components/buttons/BasicButton';
import RoundButton from '../../components/buttons/RoundButton';
import Checkbox from '../../components/controls/StyledCheckbox';
import { VehicleHeader } from '../../components/vehicles/VehicleCard';
import {
  STATE,
  EXPLORE,
  REPORT,
  SEARCH_PARAMETERS
} from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, getDisplayNameForId, getCoordinates } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';

type Props = {
  vehiclesEntitySetId :string,
  selectedEntityKeyIds :Set<*>,
  neighborsById :Map<*, *>,
  entitiesById :Map<*, *>,
  selectedReadId :string,
  reportVehicles :List<*>,
  departmentOptions :Map,
  deviceOptions :Map,
  actions :{
    selectEntity :(entityKeyId :string) => void,
    addVehicleToReport :(entityKeyId :string) => void,
    removeVehicleFromReport :(entityKeyId :string) => void
  }
};

type State = {
  sort :string
};

const Card = styled.div`
  background-color: #ffffff;
  padding: 15px;
  border-radius: 5px;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`;

const ScrollableCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: black;

  h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 20px 0;
  }
`;

const SelectableRow = styled.button`
  background-color: #ffffff;
  border: none;
  color: ${props => (props.isUnselected ? 'rgb(145,145,145)' : 'black')};
  font-weight: ${props => (props.isUnselected ? 300 : 600)};

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
`;

const VehicleTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  h1 {
    font-size: 20px;
    font-weight: 400;
    margin: 0 10px 0 0;
    letter-spacing: 2px;
  }

  span {
    background-color: #ffffff;
    color: rgba(26, 16, 59);
    padding: 3px 15px;
    border-radius: 15px;
  }
`;

const HitType = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  color: #ff3c5d;

  span {
    margin-left: 10px;
    font-weight: 600;
  }
`;

const ImageRow = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;

  img {
    width: 49%;
    max-height: 150px;
  }
`;

const DetailsBody = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  section {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    span {
      min-width: 100px;
      color: rgb(145, 145, 145);
      font-weight: 300;
    }

    div {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: black;

      i {
        font-weight: 300;
      }
    }
  }

  section:not(:last-child) {
    border-bottom: 1px solid rgb(220, 220, 230);
    padding-bottom: 6px;
    margin-bottom: 6px;
  }
`;

const Icon = styled.span`
  width: 18px;
  min-width: 18px !important;
  height: 18px;
  border-radius: 50%;
  background-color: ${props => (props.selected ? '#ff3c5d' : '#ffffff')};
  position: relative;
  z-index: 1;

  span {
    width: 12px;
    min-width: 12px !important;
    height: 12px;
    border-radius: 50%;
    background-color: #ffffff;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 2;

    span {
      width: 6px;
      min-width: 6px !important;
      height: 6px;
      border-radius: 50%;
      background-color: ${props => (props.selected ? '#ff3c5d' : '#ffffff')};
      position: absolute;
      z-index: 3;
    }
  }
`;

const ReportDefinitionRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: #807F85;

  div {
    width: 49%;
    line-height: 100%;
  }

  span {
    font-size: 12px;
  }

  button {
    width: 100%;
    padding: 8px;
  }
`;

class SelectedVehicleSidebar extends React.Component<Props, State> {

  getSelectedVehicle = () => {
    const { neighborsById, selectedReadId, vehiclesEntitySetId } = this.props;

    let vehicle;
    neighborsById.get(selectedReadId, List()).forEach((neighborObj) => {
      if (neighborObj.getIn(['neighborEntitySet', 'id']) === vehiclesEntitySetId) {
        vehicle = neighborObj.get('neighborDetails', Map());
      }
    });

    return vehicle;
  }

  renderVehicleDetails = (vehicle) => {
    const { actions, reportVehicles, selectedEntityKeyIds } = this.props;

    const vehicleEntityKeyId = getEntityKeyId(vehicle);
    const isInReport = reportVehicles.has(vehicleEntityKeyId);
    const toggleReport = isInReport
      ? () => actions.removeVehicleFromReport(vehicleEntityKeyId)
      : () => actions.addVehicleToReport(vehicleEntityKeyId);

    const numReads = selectedEntityKeyIds.size;

    return (
      <Row>
        <VehicleTitle>
          <h1>{vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '')}</h1>
          <span>{`${numReads} read${numReads === 1 ? '' : 's'}`}</span>
        </VehicleTitle>
        <ToggleReportButton isInReport={isInReport} onToggleReport={toggleReport} />
      </Row>
    );
  }

  renderHitType = () => {
    const { entitiesById, selectedReadId } = this.props;

    const read = entitiesById.get(selectedReadId, Map());
    const hitTypes = read.get(PROPERTY_TYPES.HIT_TYPE, List()).join(', ');

    return hitTypes.length ? (
      <HitType>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <span>{hitTypes}</span>
      </HitType>
    ) : null;
  }

  renderReadDetails = () => {
    const {
      departmentOptions,
      deviceOptions,
      entitiesById,
      selectedReadId
    } = this.props;

    const read = entitiesById.get(selectedReadId, Map());

    const vehicleImage = read.getIn([PROPERTY_TYPES.VEHICLE_IMAGE, 0]);
    const plateImage = read.getIn([PROPERTY_TYPES.LICENSE_PLATE_IMAGE, 0]);
    const departments = read
      .get(PROPERTY_TYPES.AGENCY_NAME, List())
      .map(d => getDisplayNameForId(departmentOptions, d))
      .join(', ');
    const devices = read
      .get(PROPERTY_TYPES.CAMERA_ID, List())
      .map(d => getDisplayNameForId(deviceOptions, d))
      .join(', ');
    const color = read.get(PROPERTY_TYPES.COLOR, List()).join(', ');
    const make = read.get(PROPERTY_TYPES.MAKE, List()).join(', ');
    const model = read.get(PROPERTY_TYPES.MODEL, List()).join(', ');
    const year = read.get(PROPERTY_TYPES.YEAR, List()).join(', ');
    const accessories = read.get(PROPERTY_TYPES.ACCESSORIES, List()).join(', ');
    const timestamp = moment(read.getIn([PROPERTY_TYPES.TIMESTAMP, 0], ''));
    const timestampStr = timestamp.isValid() ? timestamp.format('MM/DD/YY hh:mm A') : '';

    return (
      <>
        <Card>
          <ImageRow>
            {plateImage ? <img src={plateImage} alt="" /> : null}
            {vehicleImage ? <img src={vehicleImage} alt="" /> : null}
          </ImageRow>
          <DetailsBody>
            <section>
              <span>Timestamp</span>
              <div>{timestampStr}</div>
            </section>
            <section>
              <span>Dept</span>
              <div>{departments}</div>
            </section>
            <section>
              <span>Device</span>
              <div>{devices}</div>
            </section>
            {
              color ? (
                <section>
                  <span>Color</span>
                  <div>{color}</div>
                </section>
              ) : null
            }
            {
              make ? (
                <section>
                  <span>Make</span>
                  <div>{make}</div>
                </section>
              ) : null
            }
            {
              model ? (
                <section>
                  <span>Model</span>
                  <div>{model}</div>
                </section>
              ) : null
            }
            {
              year ? (
                <section>
                  <span>Year</span>
                  <div>{year}</div>
                </section>
              ) : null
            }
            {
              accessories ? (
                <section>
                  <span>Accessories</span>
                  <div>{accessories}</div>
                </section>
              ) : null
            }
          </DetailsBody>
        </Card>
      </>
    );
  }

  openGoogleMaps = (entityKeyId) => {
    const { entitiesById } = this.props;

    const [longitude, latitude] = getCoordinates(entitiesById.get(entityKeyId, Map()));
    const path = `http://www.google.com/maps/place/${latitude},${longitude}`;
    window.open(path, '_blank');
  }

  renderReadList = () => {
    const {
      actions,
      selectedReadId,
      selectedEntityKeyIds,
      entitiesById
    } = this.props;

    const idAndTimestamp = selectedEntityKeyIds.map((entityKeyId) => {
      const timestamp = moment(entitiesById.getIn([entityKeyId, PROPERTY_TYPES.TIMESTAMP, 0], ''));
      return [entityKeyId, timestamp];
    }).sort(([id1, t1], [id2, t2]) => (t1.isBefore(t2) ? -1 : 1));

    return idAndTimestamp.map(([entityKeyId, timestamp]) => (
      <PaddedSection key={entityKeyId} borderBottom>
        <Row>
          <FlexRow>
            <Checkbox checked={false} onChange={console.log} />
            <span>{timestamp.isValid() ? timestamp.format('MM/DD/YY hh:mm a') : 'Invalid timestamp'}</span>
          </FlexRow>
          <RoundButton onClick={() => this.openGoogleMaps(entityKeyId)}>
            <FontAwesomeIcon icon={faMap} />
          </RoundButton>
        </Row>
      </PaddedSection>
    ));
  }

  renderHeader = () => {
    const { actions, selectedEntityKeyIds, entitiesById } = this.props;

    const vehicle = this.getSelectedVehicle();

    const plate = vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '');
    const state = vehicle.getIn([PROPERTY_TYPES.STATE, 0], 'CA');

    const isHit = !!selectedEntityKeyIds.find(entityKeyId => !!entitiesById
      .getIn([entityKeyId, PROPERTY_TYPES.HIT_TYPE, 0]));

    return (
      <SidebarHeader
          backButtonText="Back to search results"
          backButtonOnClick={() => actions.selectEntity()}
          mainContent={<VehicleHeader state={state} plate={plate} isHit={isHit} />}
          noPadBottom
          light />
    );
  }

  renderReportSection = (vehicle) => {
    const { actions, reportVehicles } = this.props;

    const entityKeyId = getEntityKeyId(vehicle);
    const isInReport = reportVehicles.has(entityKeyId);

    const onCheckTemp = isInReport ? actions.removeVehicleFromReport : actions.addVehicleToReport;

    return (
      <PaddedSection borderBottom>
        <ReportDefinitionRow>
          <div>
            <span>Select vehicle reads to include in the report</span>
          </div>
          <div>
            <BasicButton>Add to report</BasicButton>
          </div>
        </ReportDefinitionRow>
        <ReportDefinitionRow>
          <Checkbox checked={isInReport} onChange={() => onCheckTemp(entityKeyId)} />
        </ReportDefinitionRow>
      </PaddedSection>
    );
  }

  render() {

    const vehicle = this.getSelectedVehicle();
    if (!vehicle) {
      return null;
    }

    return (
      <ScrollableSidebar>
        {this.renderHeader()}
        {this.renderReportSection(vehicle)}
        {this.renderHitType()}
        {this.renderReadList()}
      </ScrollableSidebar>
    );
  }
}


function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const explore = state.get(STATE.EXPLORE);
  const report = state.get(STATE.REPORT);
  const parameters = state.get(STATE.PARAMETERS);
  return {
    vehiclesEntitySetId: getEntitySetId(app, APP_TYPES.CARS),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    selectedReadId: explore.get(EXPLORE.SELECTED_READ_ID),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    entitiesById: explore.get(EXPLORE.ENTITIES_BY_ID),
    reportVehicles: report.get(REPORT.VEHICLE_ENTITY_KEY_IDS),
    departmentOptions: parameters.get(SEARCH_PARAMETERS.AGENCY_OPTIONS),
    deviceOptions: parameters.get(SEARCH_PARAMETERS.DEVICE_OPTIONS),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ExploreActionFactory).forEach((action :string) => {
    actions[action] = ExploreActionFactory[action];
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectedVehicleSidebar));
