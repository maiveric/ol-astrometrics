/*
 * @flow
 */

import React, { Fragment } from 'react';

import moment from 'moment';
import styled from 'styled-components';
import { faMap } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import BasicButton from '../../components/buttons/BasicButton';
import Checkbox from '../../components/controls/StyledCheckbox';
import RoundButton from '../../components/buttons/RoundButton';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';
import { PaddedSection, ScrollableSidebar, SidebarHeader } from '../../components/body/Sidebar';
import { VehicleHeader, VehicleImageRow } from '../../components/vehicles/VehicleCard';
import { getCoordinates, getDisplayNameForId, getEntityKeyId } from '../../utils/DataUtils';
import { getPlate } from '../../utils/VehicleUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { EXPLORE, SEARCH_PARAMETERS, STATE } from '../../utils/constants/StateConstants';

type Props = {
  selectedEntityKeyIds :Set<*>;
  entitiesById :Map<*, *>;
  selectedReadId :string;
  departmentOptions :Map;
  readIdsForReport :Set;
  deviceOptions :Map;
  results :List;
  actions :{
    deselectReadsForReport :(set :Set) => void;
    selectEntity :(entityKeyId ?:string) => void;
    selectReadsForReport :(set :Set) => void;
    toggleAddReadsToReportModal :(value :boolean) => void;
  };
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

const SelectedPaddedSection = styled(PaddedSection)`
  background-color: #121117;
`;

const SelectedRead = styled(PaddedSection)`
  display: flex;
  flex-direction: column;
  background-color: #121117;
`;

const ReadDetail = styled.div`
  display: flex;
  flex-direction: column;
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

  padding-top: ${(props) => props.paddingTop || 0}px;

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

  getLatLong = (entityKeyId) => {
    const { entitiesById } = this.props;

    return getCoordinates(entitiesById.get(entityKeyId, Map()));
  }

  openGoogleMaps = (e, entityKeyId) => {
    e.stopPropagation();
    const [longitude, latitude] = this.getLatLong(entityKeyId);
    const path = `http://www.google.com/maps/place/${latitude},${longitude}`;
    window.open(path, '_blank');
  }

  renderSelectedReadDetails = () => {
    const {
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
      .get(PROPERTY_TYPES.PUBLIC_SAFETY_AGENCY_NAME, List())
      .map((d) => getDisplayNameForId(departmentOptions, d))
      .join(', ');

    details.Source = read.get(PROPERTY_TYPES.OL_DATA_SOURCE, List()).join(', ');

    details.Device = read
      .get(PROPERTY_TYPES.CAMERA_ID, List())
      .map((d) => getDisplayNameForId(deviceOptions, d))
      .join(', ');

    details.Year = read.get(PROPERTY_TYPES.YEAR, List()).join(', ');
    details.Accessories = read.get(PROPERTY_TYPES.ACCESSORIES, List()).join(', ');

    const [longitude, latitude] = this.getLatLong(selectedReadId);
    details['Lat/Long'] = `${latitude}, ${longitude}`;

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

  selectEntity = (data ?:string) => {
    const { actions } = this.props;
    actions.selectEntity(data);
  }

  addToReport = () => {
    const { actions } = this.props;
    actions.toggleAddReadsToReportModal(true);
  }

  // NOTE: 2021-11-02 - this is useful, consider bringing it back
  // getReportsForRead = (readEntityKeyId) => {
  //   const { neighborsById, reportEntityKeyIds, reportEntitySetId } = this.props;
  //
  //   const reports = neighborsById
  //     .get(readEntityKeyId, List())
  //     .filter(neighbor => neighbor.getIn(['neighborEntitySet', 'id']) === reportEntitySetId)
  //     .map(neighbor => neighbor.get('neighborDetails', Map()))
  //     .filter(nd => reportEntityKeyIds.has(getEntityKeyId(nd)));
  //
  //   if (!reports.size) {
  //     return null;
  //   }
  //
  //   return <ReadReportTooltip reports={reports} />
  // }

  renderReadList = () => {
    const {
      actions,
      readIdsForReport,
      selectedReadId,
      selectedEntityKeyIds,
      entitiesById
    } = this.props;

    const idAndTimestamp = selectedEntityKeyIds.map((entityKeyId) => {
      const timestamp = moment(entitiesById.getIn([entityKeyId, PROPERTY_TYPES.TIMESTAMP, 0], ''));
      return [entityKeyId, timestamp];
    }).sort(([id1, t1], [id2, t2]) => (t1.isAfter(t2) ? -1 : 1));

    return idAndTimestamp.map(([entityKeyId, timestamp]) => {

      const isInReport = readIdsForReport.has(entityKeyId);
      const isSelected = entityKeyId === selectedReadId;

      const getOnChange = (entityKeyId, ignoreIfSelected) => {
        if (ignoreIfSelected && isSelected) {
          return;
        }

        const idSet = Set.of(entityKeyId);
        if (isInReport) {
          actions.deselectReadsForReport(idSet);
        }
        else {
          actions.selectReadsForReport(idSet);
        }
      };

      const WrapperComponent = isSelected ? SelectedPaddedSection : PaddedSection;

      return (
        <Fragment key={entityKeyId}>
          <WrapperComponent borderBottom clickable onClick={e => this.selectEntity(entityKeyId)}>
            <Row>
              <FlexRow>
                <Checkbox
                    checked={isInReport}
                    onClick={() => getOnChange(entityKeyId, true)}
                    onChange={() => getOnChange(entityKeyId)} />
                <span>{timestamp.isValid() ? timestamp.format('MM/DD/YY hh:mm a') : 'Invalid timestamp'}</span>
              </FlexRow>
              <RoundButton onClick={(e) => this.openGoogleMaps(e, entityKeyId)}>
                <FontAwesomeIcon icon={faMap} />
              </RoundButton>
            </Row>
          </WrapperComponent>
          {
            isSelected ? this.renderSelectedReadDetails() : null
          }
        </Fragment>
      );
    });
  }

  renderHeader = () => {
    const {
      actions,
      selectedEntityKeyIds,
      entitiesById,
      results: vehicleRecords,
      selectedReadId,
    } = this.props;

    const vehicleRecord = vehicleRecords.filter((record) => getEntityKeyId(record) === selectedReadId).first();
    const plate = getPlate(vehicleRecord);

    const isHit = !!selectedEntityKeyIds.find((entityKeyId) => !!entitiesById
      .getIn([entityKeyId, PROPERTY_TYPES.HIT_TYPE, 0]));

    return (
      <SidebarHeader
          backButtonText="Back to search results"
          backButtonOnClick={() => actions.selectEntity()}
          mainContent={<VehicleHeader plate={plate} isHit={isHit} />}
          noPadBottom
          light />
    );
  }

  renderReportSection = () => {
    const { actions, selectedEntityKeyIds, readIdsForReport } = this.props;

    const isInReport = selectedEntityKeyIds.subtract(readIdsForReport).isEmpty();

    const onCheck = isInReport ? actions.deselectReadsForReport : actions.selectReadsForReport;

    return (
      <PaddedSection borderBottom>
        <ReportDefinitionRow>
          <div>
            <span>Select vehicle reads to include in the report</span>
          </div>
          <div>
            <BasicButton disabled={!readIdsForReport.size} onClick={this.addToReport}>Add to report</BasicButton>
          </div>
        </ReportDefinitionRow>
        <ReportDefinitionRow paddingTop={20}>
          <Checkbox checked={isInReport} onChange={() => onCheck(selectedEntityKeyIds)} />
        </ReportDefinitionRow>
      </PaddedSection>
    );
  }

  render() {
    return (
      <ScrollableSidebar>
        {this.renderHeader()}
        {this.renderReportSection()}
        {this.renderReadList()}
      </ScrollableSidebar>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const parameters = state.get(STATE.PARAMETERS);
  return {
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    selectedReadId: explore.get(EXPLORE.SELECTED_READ_ID),
    readIdsForReport: explore.get(EXPLORE.READ_IDS_TO_ADD_TO_REPORT),
    entitiesById: explore.get(EXPLORE.ENTITIES_BY_ID),
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
