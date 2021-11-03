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
import type { RequestSequence } from 'redux-reqseq';

import { ScrollableSidebar, SidebarHeader, PaddedSection } from '../../components/body/Sidebar';
import DropdownButton from '../../components/buttons/DropdownButton';
import Spinner from '../../components/spinner/Spinner';
import Pagination from '../../components/pagination/Pagination';
import VehicleCard from '../../components/vehicles/VehicleCard';
import { STATE, EXPLORE, SEARCH_PARAMETERS } from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, countWithLabel } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import { getPlate } from '../../utils/VehicleUtils';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';

type Props = {
  isLoadingResults :boolean;
  results :List<*>;
  selectedEntityKeyIds :Set<*>;
  hotlistPlates :Set<*>;
  departmentOptions :Map;
  deviceOptions :Map;
  selectedReadPlate :string;
  actions :{
    editSearchParameters :RequestSequence;
    executeSearch :RequestSequence;
    geocodeAddress :RequestSequence;
    loadDataModel :RequestSequence;
    selectAddress :RequestSequence;
    selectEntity :RequestSequence;
    setFilter :RequestSequence;
    updateSearchParameters :RequestSequence;
  };
};

type State = {
  sort :string,
  page :number
};

const VehicleReadCount = styled.div`
  padding-top: 4px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;

  div:last-child {
    padding-left: 10px;
    color: #807F85;
  }
`;

const FilterBar = styled.div`
  padding-bottom: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const FilterGroup = styled.div`
  width: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const FilterLabel = styled.span`
  font-weight: normal;
  padding-right: 10px;
  color: #807F85;
`;

const SORT_TYPE = {
  RELEVANCE: 'Relevance',
  NUM_APPEARANCES: '# Appearances',
  LICENSE_PLATE: 'License Plate',
  NEWEST: 'Newest',
  OLDEST: 'Oldest'
};

const PAGE_SIZE = 5;

class Sidebar extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      sort: SORT_TYPE.RELEVANCE,
      page: 1
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.loadDataModel();
  }

  renderFilters = () => {
    const { sort } = this.state;
    const sortOptions = Object.values(SORT_TYPE).map((label :any) => ({
      label,
      onClick: () => this.setState({ sort: label })
    }));
    return (
      <FilterBar>
        <FilterGroup>
          <FilterLabel>Sort by </FilterLabel>
          <DropdownButton title={sort} options={sortOptions} invisible />
        </FilterGroup>
      </FilterBar>
    );
  }

  onVehicleClick = (entityKeyId) => {
    const { actions, selectedEntityKeyIds } = this.props;
    const data = selectedEntityKeyIds.has(entityKeyId) ? undefined : entityKeyId;
    actions.selectEntity(data);
  }

  sortVehicleRecords = (vehicleRecords) => {

    const { sort } = this.state;
    const vehicleRecordsByPlate = vehicleRecords.groupBy(getPlate);
    const getNumResults = (record) => vehicleRecordsByPlate.get(getPlate(record), List()).count();
    const getDateLoggedMoment = (record) => moment(record.getIn([PROPERTY_TYPES.TIMESTAMP, 0], ''));

    switch (sort) {
      case SORT_TYPE.LICENSE_PLATE:
        return vehicleRecords.sort((r1, r2) => (getPlate(r1) < getPlate(r2) ? -1 : 1));

      case SORT_TYPE.NUM_APPEARANCES:
        return vehicleRecords.sort((r1, r2) => (getNumResults(r1) > getNumResults(r2) ? -1 : 1));

      case SORT_TYPE.NEWEST:
        return vehicleRecords.sort((r1, r2) => (getDateLoggedMoment(r1).isAfter(getDateLoggedMoment(r2)) ? -1 : 1));

      case SORT_TYPE.OLDEST:
        return vehicleRecords.sort((r1, r2) => (getDateLoggedMoment(r1).isBefore(getDateLoggedMoment(r2)) ? -1 : 1));

      case SORT_TYPE.RELEVANCE:
      default:
        return vehicleRecords;
    }
  }

  renderHeader = (numVehicles) => {
    const { actions, results } = this.props;

    const numReads = results.size;

    return (
      <SidebarHeader
          backButtonText="Update search"
          backButtonOnClick={() => actions.editSearchParameters(true)}
          mainContent={(
            <VehicleReadCount>
              <div>{countWithLabel(numVehicles, 'vehicle')}</div>
              <div>{countWithLabel(numReads, 'read')}</div>
            </VehicleReadCount>
          )} />
    );
  }

  renderVehicles = (vehicleRecordsByPlatePage) => {
    const {
      departmentOptions,
      deviceOptions,
      hotlistPlates,
      selectedReadPlate
    } = this.props;
    const { sort } = this.state;

    return vehicleRecordsByPlatePage.map((vehicleRecords, plate) => {
      const vehicleRecord = vehicleRecords.first();
      const entityKeyId = getEntityKeyId(vehicleRecord);
      const isStolen = hotlistPlates.has(plate.toLowerCase());
      return (
        <VehicleCard
            key={entityKeyId}
            isUnselected={plate !== selectedReadPlate}
            onClick={() => this.onVehicleClick(entityKeyId)}
            vehicle={vehicleRecord}
            departmentOptions={departmentOptions}
            deviceOptions={deviceOptions}
            records={vehicleRecords}
            count={vehicleRecords.count()}
            isStolen={isStolen}
            timestampDesc={sort !== SORT_TYPE.OLDEST} />
      );
    }).valueSeq();
  }

  render() {

    const {
      isLoadingResults,
      results: vehicleRecords,
    } = this.props;
    const { page } = this.state;

    if (isLoadingResults) {
      return <ScrollableSidebar><Spinner /></ScrollableSidebar>;
    }

    const sortedVehicleRecords = this.sortVehicleRecords(vehicleRecords);
    const vehicleRecordsByPlate = sortedVehicleRecords.groupBy(getPlate);
    const vehicleRecordsByPlatePage = vehicleRecordsByPlate.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
      <ScrollableSidebar>
        {this.renderHeader(vehicleRecordsByPlate.count())}
        <PaddedSection>
          {this.renderFilters()}
          {this.renderVehicles(vehicleRecordsByPlatePage)}
          <Pagination
              numPages={Math.ceil(vehicleRecordsByPlate.count() / PAGE_SIZE)}
              activePage={page}
              onChangePage={(newPage) => this.setState({ page: newPage })} />
        </PaddedSection>
      </ScrollableSidebar>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const explore = state.get(STATE.EXPLORE);
  const parameters = state.get(STATE.PARAMETERS);

  const selectedReadId = explore.get(EXPLORE.SELECTED_READ_ID);
  const results = explore.get(EXPLORE.SEARCH_RESULTS);

  const selectedReadPlate = results.filter((read) => getEntityKeyId(read) === selectedReadId).map(getPlate).first();

  return {
    recordEntitySetId: getEntitySetId(app, APP_TYPES.RECORDS),
    results,
    selectedReadPlate,
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    isLoadingResults: explore.get(EXPLORE.IS_SEARCHING_DATA),
    hotlistPlates: explore.get(EXPLORE.HOTLIST_PLATES),
    departmentOptions: parameters.get(SEARCH_PARAMETERS.AGENCY_OPTIONS),
    deviceOptions: parameters.get(SEARCH_PARAMETERS.DEVICE_OPTIONS),
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

  Object.keys(ReportActionFactory).forEach((action :string) => {
    actions[action] = ReportActionFactory[action];
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar));
