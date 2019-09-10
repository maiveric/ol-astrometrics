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
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';
import type { RequestSequence } from 'redux-reqseq';

import BasicSidebar from '../../components/body/Sidebar';
import SubtleButton from '../../components/buttons/SubtleButton';
import DropdownButton from '../../components/buttons/DropdownButton';
import Spinner from '../../components/spinner/Spinner';
import Pagination from '../../components/pagination/Pagination';
import VehicleCard from '../../components/vehicles/VehicleCard';
import {
  STATE,
  EXPLORE,
  REPORT,
  SEARCH_PARAMETERS
} from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import { getVehicleList, getRecordsByVehicleId, getFilteredVehicles } from '../../utils/VehicleUtils';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';

type Props = {
  isLoadingResults :boolean;
  isLoadingNeighbors :boolean;
  results :List<*>;
  selectedEntityKeyIds :Set<*>;
  selectedReadId :string;
  neighborsById :List<*>;
  filter :string;
  reportVehicles :List<*>;
  departmentOptions :Map;
  deviceOptions :Map;
  vehiclesEntitySetId :string;
  actions :{
    addVehicleToReport :RequestSequence;
    editSearchParameters :RequestSequence;
    executeSearch :RequestSequence;
    geocodeAddress :RequestSequence;
    loadDataModel :RequestSequence;
    removeVehicleFromReport :RequestSequence;
    selectAddress :RequestSequence;
    selectEntity :RequestSequence;
    setFilter :RequestSequence;
    updateSearchParameters :RequestSequence;
  };
};

type State = {
  sort :string
};

const SidebarWrapper = styled(BasicSidebar)`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;

  overflow-y: scroll;
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PaddedSection = styled.div`
  width: 100%;
  padding: 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const HeaderSection = styled(PaddedSection)`
  border-bottom: 1px solid #36353B;
`;

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
  margin: 10px 0 20px 0;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const FilterGroup = styled.div`
  width: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;

  span {
    font-weight: 300;
    padding-right: 10px;
    width: 30%;
  }

  article {
    width: 70%;
  }
`;

const VehicleListWrapper = styled.div`
  height: 100%;
`;

const BackButton = styled(SubtleButton).attrs({
  noHover: true
})`
  color: #807F85;
  display: flex;
  align-items: center;
  padding: 0;
  font-size: 11px;

  span {
    padding-left: 5px;
  }
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

  getFilterOptions = (records) => {
    const { actions } = this.props;
    let hitTypes = List();
    records
      .forEach(recordList => recordList
        .forEach(record => record.get(PROPERTY_TYPES.HIT_TYPE, List())
          .forEach((hitType) => {
            if (!hitTypes.includes(hitType)) {
              hitTypes = hitTypes.push(hitType);
            }
          })));

    return [
      {
        label: 'All',
        onClick: () => actions.setFilter('')
      },
      ...hitTypes.map(hitType => ({
        label: hitType,
        onClick: () => actions.setFilter(hitType)
      })).toJS()
    ];
  }

  renderFilters = (records) => {
    const { filter } = this.props;
    const { sort } = this.state;
    const filterTitle = filter.length ? filter : 'All';

    const sortOptions = Object.values(SORT_TYPE).map(label => ({
      label,
      onClick: () => this.setState({ sort: label })
    }));
    return (
      <FilterBar>
        <FilterGroup>
          <span>Sort by: </span>
          <DropdownButton title={sort} options={sortOptions} invisible />
        </FilterGroup>
        <FilterGroup>
          <span>Filter: </span>
          <article>
            <DropdownButton title={filterTitle} options={this.getFilterOptions(records)} invisible />
          </article>
        </FilterGroup>
      </FilterBar>
    );
  }

  getVehicleList = () => {
    const {
      filter,
      results,
      neighborsById,
      vehiclesEntitySetId
    } = this.props;

    const vehicleList = getVehicleList(results, neighborsById, vehiclesEntitySetId);
    const recordsByVehicleId = getRecordsByVehicleId(vehicleList);
    const vehicles = getFilteredVehicles(vehicleList, recordsByVehicleId, filter);

    return { vehicles, recordsByVehicleId };
  }

  onVehicleClick = (entityKeyId) => {
    const { actions, selectedEntityKeyIds } = this.props;
    const value = selectedEntityKeyIds.has(entityKeyId) ? undefined : entityKeyId;
    actions.selectEntity(value);
  }

  sortVehicles = (vehicles, recordsByVehicleId) => {
    const { sort } = this.state;

    const getLicensePlate = vehicle => vehicle.getIn([PROPERTY_TYPES.PLATE, 0], '');

    const getTimestamps = vehicle => recordsByVehicleId.get(getEntityKeyId(vehicle), List())
      .flatMap(record => record.get(PROPERTY_TYPES.TIMESTAMP, List()))
      .map(timestamp => moment(timestamp))
      .filter(datetime => datetime.isValid());

    const getNumResults = vehicle => recordsByVehicleId.get(getEntityKeyId(vehicle), List()).size;

    switch (sort) {
      case SORT_TYPE.LICENSE_PLATE:
        return vehicles.sort((v1, v2) => (getLicensePlate(v1) < getLicensePlate(v2) ? -1 : 1));

      case SORT_TYPE.NUM_APPEARANCES:
        return vehicles.sort((v1, v2) => (getNumResults(v1) > getNumResults(v2) ? -1 : 1));

      case SORT_TYPE.NEWEST:
        return vehicles.map((vehicle) => {
          let latest;
          getTimestamps(vehicle).forEach((datetime) => {
            if (!latest || datetime.isAfter(latest)) {
              latest = datetime;
            }
          });
          return [vehicle, latest];
        }).sort(([v1, latest1], [v2, latest2]) => (latest1.isAfter(latest2) ? -1 : 1))
          .map(([vehicle]) => vehicle);

      case SORT_TYPE.OLDEST:
        return vehicles.map((vehicle) => {
          let earliest;
          getTimestamps(vehicle).forEach((datetime) => {
            if (!earliest || datetime.isBefore(earliest)) {
              earliest = datetime;
            }
          });
          return [vehicle, earliest];
        }).sort(([v1, earliest1], [v2, earliest2]) => (earliest1.isBefore(earliest2) ? -1 : 1))
          .map(([vehicle]) => vehicle);

      case SORT_TYPE.RELEVANCE:
      default:
        return vehicles;
    }
  }

  vehicleIsUnselected = (records) => {
    const { selectedReadId } = this.props;
    if (selectedReadId) {
      let unselected = true;
      records.forEach((record) => {
        if (selectedReadId === getEntityKeyId(record)) {
          unselected = false;
        }
      });
      return unselected;
    }

    return false;
  }

  renderHeader = (numVehicles) => {
    const { actions, results } = this.props;

    const numReads = results.size;

    return (
      <HeaderSection>
        <BackButton onClick={() => actions.editSearchParameters(true)}>
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Update search</span>
        </BackButton>
        <VehicleReadCount>
          <div>{`${numVehicles} vehicles`}</div>
          <div>{`${numReads} reads`}</div>
        </VehicleReadCount>
      </HeaderSection>
    );
  }

  render() {
    const {
      actions,
      departmentOptions,
      deviceOptions,
      isLoadingResults,
      isLoadingNeighbors,
      reportVehicles
    } = this.props;
    const { sort, page } = this.state;

    if (isLoadingResults || isLoadingNeighbors) {
      return <SidebarWrapper><Spinner /></SidebarWrapper>;
    }

    const { vehicles, recordsByVehicleId } = this.getVehicleList();

    const sortedVehicles = this.sortVehicles(
      vehicles.map(vehicle => vehicle.get('neighborDetails', Map())),
      recordsByVehicleId
    );

    const vehiclePage = sortedVehicles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
      <SidebarWrapper>
        {this.renderHeader(vehicles.size)}
        <PaddedSection>
          {this.renderFilters(recordsByVehicleId.valueSeq())}
          {vehiclePage.map((vehicle) => {
            const entityKeyId = getEntityKeyId(vehicle);
            const isInReport = reportVehicles.has(entityKeyId);
            const toggleReport = isInReport
              ? () => actions.removeVehicleFromReport(entityKeyId)
              : () => actions.addVehicleToReport(entityKeyId);
            return (
              <VehicleCard
                  key={entityKeyId}
                  isUnselected={this.vehicleIsUnselected(recordsByVehicleId.get(entityKeyId, List()))}
                  onClick={() => this.onVehicleClick(entityKeyId)}
                  vehicle={vehicle}
                  departmentOptions={departmentOptions}
                  deviceOptions={deviceOptions}
                  isInReport={isInReport}
                  toggleReport={toggleReport}
                  records={recordsByVehicleId.get(entityKeyId, List())}
                  count={recordsByVehicleId.get(entityKeyId).size}
                  timestampDesc={sort === SORT_TYPE.NEWEST} />
            );
          })}
          <Pagination
              numPages={Math.ceil(sortedVehicles.size / PAGE_SIZE)}
              activePage={page}
              onChangePage={newPage => this.setState({ page: newPage })} />
        </PaddedSection>
      </SidebarWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const explore = state.get(STATE.EXPLORE);
  const report = state.get(STATE.REPORT);
  const parameters = state.get(STATE.PARAMETERS);
  return {
    recordEntitySetId: getEntitySetId(app, APP_TYPES.RECORDS),
    vehiclesEntitySetId: getEntitySetId(app, APP_TYPES.CARS),
    displayFullSearchOptions: explore.get(EXPLORE.DISPLAY_FULL_SEARCH_OPTIONS),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    selectedReadId: explore.get(EXPLORE.SELECTED_READ_ID),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    isLoadingResults: explore.get(EXPLORE.IS_SEARCHING_DATA),
    isLoadingNeighbors: explore.get(EXPLORE.IS_LOADING_ENTITY_NEIGHBORS),
    searchParameters: explore.get(EXPLORE.SEARCH_PARAMETERS),
    geocodedAddresses: explore.get(EXPLORE.ADDRESS_SEARCH_RESULTS),
    filter: explore.get(EXPLORE.FILTER),
    departmentOptions: parameters.get(SEARCH_PARAMETERS.AGENCY_OPTIONS),
    deviceOptions: parameters.get(SEARCH_PARAMETERS.DEVICE_OPTIONS),
    reportVehicles: report.get(REPORT.VEHICLE_ENTITY_KEY_IDS)
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
