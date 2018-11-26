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

import DropdownButton from '../../components/buttons/DropdownButton';
import Spinner from '../../components/spinner/Spinner';
import VehicleCard from '../../components/vehicles/VehicleCard';
import {
  EDM,
  STATE,
  EXPLORE,
  REPORT
} from '../../utils/constants/StateConstants';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';

type Props = {
  recordEntitySetId :string,
  displayFullSearchOptions :boolean,
  isLoadingResults :boolean,
  isLoadingNeighbors :boolean,
  results :List<*>,
  selectedEntityKeyIds :Set<*>,
  neighborsById :List<*>,
  searchParameters :Map<*, *>,
  geocodedAddresses :List<*>,
  filter :string,
  actions :{
    editSearchParameters :(editing :boolean) => void,
    executeSearch :(searchParameters :Object) => void,
    geocodeAddress :(address :string) => void,
    selectAddress :(address :Object) => void,
    selectEntity :(entityKeyId :string) => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    updateSearchParameters :({ field :string, value :string }) => void,
    setFilter :(filter :string) => void,
    addVehicleToReport :(entityKeyId :string) => void,
    removeVehicleFromReport :(entityKeyId :string) => void,
  }
};

type State = {
  sort :string
};

const SidebarWrapper = styled.div`
  position: absolute;
  z-index: 1;
  right: 0;
  width: 500px;
  padding: 100px 30px 30px 30px;
  background-color: rgba(26, 16, 59, 0.9);
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;

  h1 {
    font-size: 20px;
    font-weight: 400;
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
  overflow-y: scroll;
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SORT_TYPE = {
  RELEVANCE: 'Relevance',
  NUM_APPEARANCES: '# Appearances',
  LICENSE_PLATE: 'License Plate',
  NEWEST: 'Newest',
  OLDEST: 'Oldest'
};

class Sidebar extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      sort: SORT_TYPE.RELEVANCE
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
    const { filter, results, neighborsById } = this.props;

    let recordsByVehicleId = Map();
    let seen = Set();
    const vehicleList = results.flatMap((record) => {
      return neighborsById.get(getEntityKeyId(record), List()).map(neighbor => [neighbor, record]);
    }).filter(([neighbor]) => neighbor.getIn(['neighborEntitySet', 'name']) === ENTITY_SETS.CARS);

    vehicleList.forEach(([neighbor, record]) => {
      const entityKeyId = getEntityKeyId(neighbor.get('neighborDetails'));
      seen = seen.add(entityKeyId);
      recordsByVehicleId = recordsByVehicleId.set(
        entityKeyId,
        recordsByVehicleId.get(entityKeyId, List()).push(record)
      );
    });

    const vehicles = vehicleList.map(([val]) => val).filter((entity) => {
      const entityKeyId = getEntityKeyId(entity.get('neighborDetails'));

      const matchesFilter = !filter.length || recordsByVehicleId
        .get(entityKeyId)
        .flatMap(record => record.get(PROPERTY_TYPES.HIT_TYPE, List()))
        .filter(hitType => hitType === filter).size > 0;
      const shouldInclude = seen.has(entityKeyId) && matchesFilter;
      seen = seen.delete(entityKeyId);
      return shouldInclude;
    });

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

  render() {
    const {
      actions,
      displayFullSearchOptions,
      geocodedAddresses,
      results,
      selectedEntityKeyIds,
      searchParameters,
      isLoadingResults,
      isLoadingNeighbors,
      reportVehicles
    } = this.props;
    const { sort } = this.state;

    if (isLoadingResults || isLoadingNeighbors) {
      return <SidebarWrapper><Spinner /></SidebarWrapper>;
    }

    const { vehicles, recordsByVehicleId } = this.getVehicleList();

    const sortedVehicles = this.sortVehicles(
      vehicles.map(vehicle => vehicle.get('neighborDetails', Map())),
      recordsByVehicleId
    );

    return (
      <SidebarWrapper>
        <h1>{vehicles.size} vehicles found</h1>
        {this.renderFilters(recordsByVehicleId.valueSeq())}
        <VehicleListWrapper>
          {sortedVehicles.map((vehicle) => {
            const entityKeyId = getEntityKeyId(vehicle);
            const isInReport = reportVehicles.has(entityKeyId);
            const toggleReport = isInReport
              ? () => actions.removeVehicleFromReport(entityKeyId)
              : () => actions.addVehicleToReport(entityKeyId);
            return (
              <VehicleCard
                  key={entityKeyId}
                  isUnselected={selectedEntityKeyIds.size && !selectedEntityKeyIds.has(entityKeyId)}
                  onClick={() => this.onVehicleClick(entityKeyId)}
                  vehicle={vehicle}
                  isInReport={isInReport}
                  toggleReport={toggleReport}
                  records={recordsByVehicleId.get(entityKeyId, List())}
                  count={recordsByVehicleId.get(entityKeyId).size}
                  timestampDesc={sort === SORT_TYPE.NEWEST} />
            );
          })}
        </VehicleListWrapper>
      </SidebarWrapper>
    );
  }
}


function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const edm = state.get(STATE.EDM);
  const report = state.get(STATE.REPORT);
  return {
    recordEntitySetId: edm.getIn([EDM.ENTITY_SETS, ENTITY_SETS.RECORDS, 'id']),
    displayFullSearchOptions: explore.get(EXPLORE.DISPLAY_FULL_SEARCH_OPTIONS),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    isLoadingResults: explore.get(EXPLORE.IS_SEARCHING_DATA),
    isLoadingNeighbors: explore.get(EXPLORE.IS_LOADING_ENTITY_NEIGHBORS),
    searchParameters: explore.get(EXPLORE.SEARCH_PARAMETERS),
    geocodedAddresses: explore.get(EXPLORE.ADDRESS_SEARCH_RESULTS),
    filter: explore.get(EXPLORE.FILTER),
    reportVehicles: report.get(REPORT.VEHICLE_ENTITY_KEY_IDS)
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

  Object.keys(ReportActionFactory).forEach((action :string) => {
    actions[action] = ReportActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar));
