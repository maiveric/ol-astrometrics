/*
 * @flow
 */

import React, { Fragment } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map, Set } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/pro-light-svg-icons';

import { ScrollableSidebar, SidebarHeader, PaddedSection } from '../../components/body/Sidebar';
import BasicButton from '../../components/buttons/BasicButton';
import RoundButton from '../../components/buttons/RoundButton';
import Checkbox from '../../components/controls/StyledCheckbox';
import { VehicleHeader, VehicleImageRow } from '../../components/vehicles/VehicleCard';
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
  font-size: 14px;
`;

const SelectedRead = styled(PaddedSection)`
  display: flex;
  flex-direction: column;
  background-color: #121117;
`;

const ReadDetail = styled(Row)`
  font-size: 14px;
  line-height: 150%;

  span {
    color: #807F85;
  }

  div {
    color: #ffffff;
  }

  &:not(:last-child) {
    padding-bottom: 4px;
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

  openGoogleMaps = (e, entityKeyId) => {
    const { entitiesById } = this.props;

    e.stopPropagation();

    const [longitude, latitude] = getCoordinates(entitiesById.get(entityKeyId, Map()));
    const path = `http://www.google.com/maps/place/${latitude},${longitude}`;
    window.open(path, '_blank');
  }

  renderSelectedReadDetails = () => {
    const {
      actions,
      departmentOptions,
      deviceOptions,
      entitiesById,
      selectedReadId
    } = this.props;

    const read = entitiesById.get(selectedReadId, Map());

    const details = {};

    const make = read.get(PROPERTY_TYPES.MAKE, List()).join(', ');
    const model = read.get(PROPERTY_TYPES.MODEL, List()).join(', ');
    let makeModelStr = `${make}`;
    if (model) {
      makeModelStr = `${makeModelStr}${makeModelStr ? ' ' : ''}${model}`;
    }
    details['Make/model'] = makeModelStr;
    details.Color = read.get(PROPERTY_TYPES.COLOR, List()).join(', ');

    details.Department = read
      .get(PROPERTY_TYPES.AGENCY_NAME, List())
      .map(d => getDisplayNameForId(departmentOptions, d))
      .join(', ');

    details.Device = read
      .get(PROPERTY_TYPES.CAMERA_ID, List())
      .map(d => getDisplayNameForId(deviceOptions, d))
      .join(', ');

    details.Year = read.get(PROPERTY_TYPES.YEAR, List()).join(', ');
    details.Accessories = read.get(PROPERTY_TYPES.ACCESSORIES, List()).join(', ');

    const vehicleSrc = read.getIn([PROPERTY_TYPES.VEHICLE_IMAGE, 0]);
    const plateSrc = read.getIn([PROPERTY_TYPES.LICENSE_PLATE_IMAGE, 0]);

    return (
      <SelectedRead>

        <VehicleImageRow vehicleSrc={vehicleSrc} plateSrc={plateSrc} />

        {Object.entries(details).map(([label, value], index) => {
          if (!value) {
            return null;
          }

          return (
            <ReadDetail key={`${label}-${index}`}>
              <span>{label}</span>
              <div>{value}</div>
            </ReadDetail>
          );
        })}

      </SelectedRead>
    );
  }

  selectEntity = (e, data) => {
    const { actions, vehiclesEntitySetId } = this.props;
    e.stopPropagation();
    actions.selectEntity({ data, vehiclesEntitySetId });
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
      <Fragment key={entityKeyId}>
        <PaddedSection borderBottom clickable onClick={e => this.selectEntity(e, entityKeyId)}>
          <Row>
            <FlexRow>
              <Checkbox checked={false} onChange={console.log} />
              <span>{timestamp.isValid() ? timestamp.format('MM/DD/YY hh:mm a') : 'Invalid timestamp'}</span>
            </FlexRow>
            <RoundButton onClick={e => this.openGoogleMaps(e, entityKeyId)}>
              <FontAwesomeIcon icon={faMap} />
            </RoundButton>
          </Row>
        </PaddedSection>
        {
          entityKeyId === selectedReadId ? this.renderSelectedReadDetails() : null
        }
      </Fragment>
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
