/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map, Set } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons';

import ToggleReportButton from '../../components/buttons/ToggleReportButton';
import {
  STATE,
  EXPLORE,
  REPORT
} from '../../utils/constants/StateConstants';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';

type Props = {
  results :List<*>,
  selectedEntityKeyIds :Set<*>,
  neighborsById :Map<*, *>,
  entitiesById :Map<*, *>,
  selectedReadId :string,
  reportVehicles :List<*>,
  actions :{
    selectEntity :(entityKeyId :string) => void,
    addVehicleToReport :(entityKeyId :string) => void,
    removeVehicleFromReport :(entityKeyId :string) => void
  }
};

type State = {
  sort :string
};

const SidebarWrapper = styled.div`
  position: absolute;
  z-index: 1;
  left: 0;
  width: 500px;
  padding: 100px 30px 30px 30px;
  background-color: rgba(26, 16, 59, 0.9);
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;
`;


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
  overflow-y: scroll;
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

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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

class SelectedVehicleSidebar extends React.Component<Props, State> {

  getSelectedVehicle = () => {
    const { neighborsById, selectedReadId } = this.props;

    let vehicle;
    neighborsById.get(selectedReadId, List()).forEach((neighborObj) => {
      if (neighborObj.getIn(['neighborEntitySet', 'name']) === ENTITY_SETS.CARS) {
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
      <HeaderRow>
        <VehicleTitle>
          <h1>{vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '')}</h1>
          <span>{`${numReads} read${numReads === 1 ? '' : 's'}`}</span>
        </VehicleTitle>
        <ToggleReportButton isInReport={isInReport} onToggleReport={toggleReport} />
      </HeaderRow>
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
    const { entitiesById, selectedReadId } = this.props;

    const read = entitiesById.get(selectedReadId, Map());

    const vehicleImage = read.getIn([PROPERTY_TYPES.VEHICLE_IMAGE, 0]);
    const plateImage = read.getIn([PROPERTY_TYPES.LICENSE_PLATE_IMAGE, 0]);
    const departments = read.get(PROPERTY_TYPES.AGENCY_NAME, List()).join(', ');
    const devices = read.get(PROPERTY_TYPES.CAMERA_ID, List()).join(', ');
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
    }).sort(([id1, t1], [id2, t2]) => t1.isBefore(t2) ? -1 : 1);

    return (
      <ScrollableCard>
        <h1>All reads for vehicle:</h1>
        <DetailsBody>
          {idAndTimestamp.map(([entityKeyId, timestamp]) => (
            <section key={entityKeyId}>
              <Icon selected={entityKeyId === selectedReadId}><span><span /></span></Icon>
              <SelectableRow
                  key={entityKeyId}
                  isUnselected={entityKeyId !== selectedReadId}
                  onClick={() => actions.selectEntity(entityKeyId)}>
                {timestamp.isValid() ? timestamp.format('MM/DD/YY hh:mm a') : 'Invalid timestamp'}
              </SelectableRow>
            </section>
          ))}
        </DetailsBody>
      </ScrollableCard>
    )
  }

  render() {
    const {
      actions,
      results,
      selectedEntityKeyIds,
      selectedReadId,
      reportVehicles
    } = this.props;

    const vehicle = this.getSelectedVehicle();
    if (!vehicle) {
      return null;
    }

    return (
      <SidebarWrapper>
        {this.renderHitType()}
        {this.renderVehicleDetails(vehicle)}
        {this.renderReadDetails()}
        {this.renderReadList()}
      </SidebarWrapper>
    );
  }
}


function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const report = state.get(STATE.REPORT);
  return {
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    selectedReadId: explore.get(EXPLORE.SELECTED_READ_ID),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    entitiesById: explore.get(EXPLORE.ENTITIES_BY_ID),
    reportVehicles: report.get(REPORT.VEHICLE_ENTITY_KEY_IDS)
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectedVehicleSidebar));
