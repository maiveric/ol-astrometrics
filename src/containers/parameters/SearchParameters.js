/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { List, Map, OrderedMap } from 'immutable';
import { DateTimePicker } from '@atlaskit/datetime-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faMinus,
  faPlus,
  faPrint
} from '@fortawesome/pro-regular-svg-icons';

import {
  faBell,
  faBookmark,
  faPencil
} from '@fortawesome/pro-solid-svg-icons';

import InfoButton from '../../components/buttons/InfoButton';
import SearchableSelect from '../../components/controls/SearchableSelect';
import { getVehicleList, getRecordsByVehicleId, getFilteredVehicles } from '../../utils/VehicleUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { getSearchFields } from './ParametersReducer';
import {
  SEARCH_REASONS,
  MAKES,
  MODELS_BY_MAKE,
  COLORS,
  ACCESSORIES,
  STYLES,
  LABELS
} from '../../utils/constants/DataConstants';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import {
  EDM,
  STATE,
  EXPLORE,
  PARAMETERS,
  REPORT,
  SEARCH_PARAMETERS
} from '../../utils/constants/StateConstants';
import * as AlertActionFactory from '../alerts/AlertActionFactory';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';
import * as ParametersActionFactory from './ParametersActionFactory';

type Props = {
  isTopNav :boolean,
  entitySets :Map<*, *>,
  recordEntitySetId :string,
  propertyTypesByFqn :Map<*, *>,
  searchParameters :Map<*, *>,
  geocodedAddresses :List<*>,
  isLoadingAddresses :boolean,
  noAddressResults :boolean,
  agencySearchResults :List<*>,
  isLoadingAgencies :boolean,
  noAgencyResults :boolean,
  isLoadingResults :boolean,
  isLoadingNeighbors :boolean,
  reportVehicles :Set<*>,
  results :List<*>,
  neighborsById :Map<*, *>,
  actions :{
    editSearchParameters :(editing :boolean) => void,
    geocodeAddress :(address :string) => void,
    searchAgencies :({ entitySetId :string, value :string }) => void,
    selectAgency :(agency :Map) => void,
    updateSearchParameters :({ field :string, value :string }) => void,
    selectAddress :(address :Object) => void,
    executeSearch :(searchParameters :Object) => void,
    setDrawMode :(drawMode :boolean) => void,
    exportReport :(vehicleIds :Set) => void,
    toggleAlertModal :(modalOpen :boolean) => void
  }
};

const SearchParameterWrapper = styled.div`
  width: 100%;
  position: fixed;
  padding: 50px 0;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const InnerWrapper = styled.div`
  width: 1300px;
  display: flex;
  flex-direction: column;

  h1 {
    color: #ffffff;
    font-size: 22px;
    font-weight: 400;
    margin-bottom: 50px;
  }
`;

type State = {
  isExpanded :boolean
};

const Row = styled.div`
  width: ${props => (props.width || '100')}%;
  margin-top: ${props => (props.marginTop ? 30 : 0)}px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SubHeader = styled.div`
  margin: 30px 0 15px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StyledInputWrapper = styled.div`
  width: 100%;
  height: 39px;
  position: relative;

  input {
    position: absolute;
    padding-right: 32%;
  }

  span {
    height: 100%;
    width: 30%;
    margin: 0;
    right: 0;
    background-color: #555e6f;
    z-index: 2;
    position: absolute;
    border-radius: 0 3px 3px 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
`;

const StyledInput = styled.input.attrs({
  type: 'text'
})`
  width: 100%;
  border-radius: 3px;
  padding: 10px 15px;
  border: none;
  height: 39px;

  &:focus {
    outline: none;
  }
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  span {
    color: #ffffff;
    font-size: 12px;
    font-weight: 300;
    margin-bottom: 10px;
  }
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  width: 100%;
`;

const DateTimePickerWrapper = styled.div`
  width: 100%;

  & > div {
    height: 38px;
  }
`;

const TopNavBar = styled(SearchParameterWrapper)`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px 15px;

  span {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
    font-size: 13px;
    margin-right: 8px;
  }

  div {
    color: rgba(255, 255, 255, 0.75);
    font-size: 15px;
  }

  button {
    background: transparent;
    border: none;
    display: flex;
    flex-direction: row;
    display: flex;
    flex-direction: row;
    align-items: center;

    &:hover {
      cursor: pointer;

      span {
        color: rgba(255, 255, 255, 0.7);
      }

      div {
        color: rgb(255, 255, 255);
      }
    }

    &:focus {
      outline: none;
    }
  }
`;

const TopNavSection = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: ${props => (props.distribute ? 'space-evenly' : 'flex-start')};
  align-items: center;
  width: ${props => (props.width || '100%')};
  min-width: ${props => (props.distribute ? props.width : 'auto')};
`;

const TopNavButtonGroup = styled.div`
  height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 20px;

  span {
    margin-bottom: 12px;
  }
`;

const TopNavLargeButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);

  img {
    height: 20px;
  }

  div, a {
    margin-left: 10px;
    font-size: 16px;
  }

  a {
    color: rgba(255, 255, 255, 0.8) !important;
    text-decoration: none !important;

    &:hover {
      color: #ffffff !important;
    }
  }

  &:hover:enabled {
    cursor: pointer;
    color: #ffffff;
  }

  &:focus {
    outline: none;
  }
`;

const ButtonWrapper = styled.button`
  background: transparent;
  border: none;
  width: ${props => (props.fitContent ? 'fit-content' : '100%')};
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #649df7;

  span {
    margin-left: 10px;
  }

  &:hover:not(:disabled) {
    cursor: pointer;
    color: #7cacf8;
  }

  &:focus {
    outline: none;
  }


  &:disabled {
    color: gray;
  }

`;

class SearchParameters extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      isExpanded: false
    };

    this.addressSearchTimeout = null;
    this.departmentSearchTimeout = null;
  }

  handleAddressChange = (e :SyntheticEvent) => {
    const { actions } = this.props;
    const { value } = e.target;

    actions.updateSearchParameters({
      field: PARAMETERS.ADDRESS,
      value
    });

    clearTimeout(this.addressSearchTimeout);

    this.addressSearchTimeout = setTimeout(() => {
      actions.geocodeAddress(value);
    }, 500);
  }

  handleDepartmentChange = (e :SyntheticEvent) => {
    const { actions, entitySets } = this.props;
    const { value } = e.target;

    actions.updateSearchParameters({
      field: PARAMETERS.DEPARTMENT,
      value
    });

    const entitySetId = entitySets.getIn([ENTITY_SETS.AGENCIES, 'id']);

    clearTimeout(this.departmentSearchTimeout);

    this.departmentSearchTimeout = setTimeout(() => {
      actions.searchAgencies({ value, entitySetId });
    }, 500);
  }

  getOnChange = (field) => {
    const { actions } = this.props;
    return (e :SyntheticEvent) => {
      const { value } = e.target;
      actions.updateSearchParameters({ field, value });
    };
  }

  renderInput = (field) => {
    const { searchParameters } = this.props;

    const value = searchParameters.get(field, '');
    const onChange = this.getOnChange(field);

    return <StyledInput value={value} onChange={onChange} />;
  }

  getAsMap = (valueList) => {
    let options = OrderedMap();
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  getAddressesAsMap = () => {
    const { geocodedAddresses } = this.props;
    let options = OrderedMap();
    geocodedAddresses.forEach((addr) => {
      options = options.set(addr.get('display_name'), addr);
    });

    return options;
  }

  getDepartmentsAsMap = () => {
    const { agencySearchResults } = this.props;
    let options = OrderedMap();
    agencySearchResults.forEach((agency) => {
      const id = agency.getIn([PROPERTY_TYPES.ID, 0], '');
      const title = agency.getIn([PROPERTY_TYPES.DESCRIPTION, 0], agency.getIn([PROPERTY_TYPES.NAME, 0], id));
      options = options.set(title, { id, title });
    });

    return options;
  }

  onDateTimeChange = (newDate, field) => {
    const { actions } = this.props;
    const value = newDate.endsWith('T')
      ? moment(newDate.slice(0, newDate.length - 1)).toISOString(true)
      : newDate;
    actions.updateSearchParameters({ field, value });
  }

  onSearchSubmit = () => {
    const {
      recordEntitySetId,
      propertyTypesByFqn,
      searchParameters,
      actions
    } = this.props;
    actions.executeSearch({
      entitySetId: recordEntitySetId,
      propertyTypesByFqn,
      searchParameters
    });
  }

  resetAndGoToDrawMode = () => {
    const { actions } = this.props;
    actions.setDrawMode(true);
    actions.updateSearchParameters({
      field: PARAMETERS.SEARCH_ZONES,
      value: List()
    });
  }

  renderFullSearchParameters() {
    const { isExpanded } = this.state;
    const {
      actions,
      searchParameters,
      isLoadingAddresses,
      noAddressResults,
      isLoadingAgencies,
      noAgencyResults
    } = this.props;

    return (
      <SearchParameterWrapper>
        <InnerWrapper>
          <h1>ALPR Vehicle Search</h1>
          <Row>
            <Row width={20}>
              <InputGroup>
                <span>Case Number*</span>
                {this.renderInput(PARAMETERS.CASE_NUMBER)}
              </InputGroup>
            </Row>
            <Row width={53}>
              <InputGroup>
                <span>Search Reason*</span>
                <StyledSearchableSelect
                    value={searchParameters.get(PARAMETERS.REASON)}
                    searchPlaceholder="Select"
                    onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.REASON, value })}
                    options={this.getAsMap(SEARCH_REASONS)}
                    selectOnly
                    transparent
                    short />
              </InputGroup>
            </Row>
            <Row width={20}>
              <InputGroup>
                <span>Full or Partial Plate (minimum 3 characters)</span>
                {this.renderInput(PARAMETERS.PLATE)}
              </InputGroup>
            </Row>
          </Row>
          <SubHeader>Location</SubHeader>
          <Row>
            <Row width={65.5}>
              <InputGroup>
                <span>Street Address</span>
                <StyledSearchableSelect
                    value={searchParameters.get(PARAMETERS.ADDRESS)}
                    searchPlaceholder="Enter address"
                    onInputChange={this.handleAddressChange}
                    onSelect={actions.selectAddress}
                    options={this.getAddressesAsMap()}
                    isLoadingResults={isLoadingAddresses}
                    noResults={noAddressResults}
                    transparent
                    short />
              </InputGroup>
            </Row>
            <Row width={31}>
              <Row width={46}>
                <InputGroup>
                  <span>Search Radius</span>
                  <StyledInputWrapper>
                    {this.renderInput(PARAMETERS.RADIUS)}
                    <span>miles</span>
                  </StyledInputWrapper>
                </InputGroup>
              </Row>
              <Row width={46}>
                <span />
                <ButtonWrapper onClick={this.resetAndGoToDrawMode}>
                  <FontAwesomeIcon icon={faPencil} />
                  <span>Draw on map</span>
                </ButtonWrapper>
              </Row>
            </Row>
          </Row>
          <SubHeader>Additional Parameters</SubHeader>
          <Row>
            <Row width={31}>
              <InputGroup>
                <span>Time start</span>
                <DateTimePickerWrapper>
                  <DateTimePicker
                      hideIcon
                      onChange={value => this.onDateTimeChange(value, PARAMETERS.START)}
                      value={searchParameters.get(PARAMETERS.START)}
                      dateFormat="MM/DD/YYYY"
                      datePickerSelectProps={{
                        placeholder: `e.g. ${moment().format('MM/DD/YYYY')}`,
                      }} />
                </DateTimePickerWrapper>
              </InputGroup>
            </Row>
            <Row width={31}>
              <InputGroup>
                <span>Time end</span>
                <DateTimePickerWrapper>
                  <DateTimePicker
                      hideIcon
                      onChange={value => this.onDateTimeChange(value, PARAMETERS.END)}
                      value={searchParameters.get(PARAMETERS.END)}
                      dateFormat="MM/DD/YYYY"
                      datePickerSelectProps={{
                        placeholder: `e.g. ${moment().format('MM/DD/YYYY')}`,
                      }} />
                </DateTimePickerWrapper>
              </InputGroup>
            </Row>
            <Row width={31}>
              <Row width={46}>
                <InputGroup>
                  <span>Department (optional)</span>
                  <StyledSearchableSelect
                      value={searchParameters.get(PARAMETERS.DEPARTMENT)}
                      onInputChange={this.handleDepartmentChange}
                      onSelect={actions.selectAgency}
                      options={this.getDepartmentsAsMap()}
                      isLoadingResults={isLoadingAgencies}
                      noResults={noAgencyResults}
                      transparent
                      short />
                </InputGroup>
              </Row>
              <Row width={46}>
                <InputGroup>
                  <span>Device (optional)</span>
                  {this.renderInput(PARAMETERS.DEVICE)}
                </InputGroup>
              </Row>
            </Row>
          </Row>
          <Row marginTop>
            <InputGroup>
              <span>
                *Required fields. Additionally, at least two of license plate, location, or time range must be present to perform a search.
              </span>
            </InputGroup>
          </Row>
          <Row>
            <ButtonWrapper fitContent onClick={this.toggleAdditionalDetails}>
              <FontAwesomeIcon icon={isExpanded ? faMinus : faPlus} />
              <span>Additional Details</span>
            </ButtonWrapper>
            { isExpanded ? null : this.renderSearchButton() }
          </Row>
          {
            isExpanded ? (
              <>
                <Row marginTop>
                  <Row width={15}>
                    <InputGroup>
                      <span>Make</span>
                      <StyledSearchableSelect
                          value={searchParameters.get(PARAMETERS.MAKE)}
                          onSelect={value => this.onMakeChange(value)}
                          onClear={() => this.onMakeChange('')}
                          options={this.getAsMap(MAKES)}
                          transparent
                          short />
                    </InputGroup>
                  </Row>
                  <Row width={15}>
                    <InputGroup>
                      <span>Model</span>
                      <StyledSearchableSelect
                          value={searchParameters.get(PARAMETERS.MODEL)}
                          onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.MODEL, value })}
                          onClear={() => actions.updateSearchParameters({ field: PARAMETERS.MODEL, value: '' })}
                          options={this.getAsMap(MODELS_BY_MAKE[searchParameters.get(PARAMETERS.MAKE)] || [])}
                          transparent
                          short />
                    </InputGroup>
                  </Row>
                  <Row width={15}>
                    <InputGroup>
                      <span>Color</span>
                      <StyledSearchableSelect
                          value={searchParameters.get(PARAMETERS.COLOR)}
                          onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.COLOR, value })}
                          onClear={() => actions.updateSearchParameters({ field: PARAMETERS.COLOR, value: '' })}
                          options={this.getAsMap(COLORS)}
                          transparent
                          short />
                    </InputGroup>
                  </Row>
                  <Row width={15}>
                    <InputGroup>
                      <span>Accessories</span>
                      <StyledSearchableSelect
                          value={searchParameters.get(PARAMETERS.ACCESSORIES)}
                          onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.ACCESSORIES, value })}
                          onInputChange={({ target }) => {
                            actions.updateSearchParameters({ field: PARAMETERS.ACCESSORIES, value: target.value });
                          }}
                          onClear={() => actions.updateSearchParameters({ field: PARAMETERS.ACCESSORIES, value: '' })}
                          options={this.getAsMap(ACCESSORIES)}
                          transparent
                          short />
                    </InputGroup>
                  </Row>
                  <Row width={15}>
                    <InputGroup>
                      <span>Style</span>
                      <StyledSearchableSelect
                          value={searchParameters.get(PARAMETERS.STYLE)}
                          onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.STYLE, value })}
                          onClear={() => actions.updateSearchParameters({ field: PARAMETERS.STYLE, value: '' })}
                          options={this.getAsMap(STYLES)}
                          transparent
                          short />
                    </InputGroup>
                  </Row>
                  <Row width={15}>
                    <InputGroup>
                      <span>Label</span>
                      <StyledSearchableSelect
                          value={searchParameters.get(PARAMETERS.LABEL)}
                          onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.LABEL, value })}
                          onClear={() => actions.updateSearchParameters({ field: PARAMETERS.LABEL, value: '' })}
                          options={this.getAsMap(LABELS)}
                          selectOnly
                          transparent
                          short />
                    </InputGroup>
                  </Row>
                </Row>
                <Row marginTop>
                  <Row width={10} />
                  {this.renderSearchButton()}
                </Row>
              </>
            ) : null
          }
        </InnerWrapper>
      </SearchParameterWrapper>
    );
  }

  onMakeChange = (value) => {
    const { actions } = this.props;
    actions.updateSearchParameters({ field: PARAMETERS.MAKE, value });
    actions.updateSearchParameters({ field: PARAMETERS.MODEL, value: '' });
  }

  toggleAdditionalDetails = () => {
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded });
  }

  formatDateTime = (dateTime) => {
    const momentDT = moment(dateTime);
    return momentDT.isValid() ? momentDT.format('MM/DD/YY HH:mm a') : '';
  }

  renderSearchButton = () => {
    const { searchParameters } = this.props;
    const isReadyToSubmit = getSearchFields(searchParameters).length > 0;

    return <InfoButton onClick={this.onSearchSubmit} disabled={!isReadyToSubmit}>Search for vehicles</InfoButton>;
  }

  renderTopNav = () => {
    const {
      actions,
      searchParameters,
      isLoadingResults,
      isLoadingNeighbors,
      reportVehicles,
      results,
      neighborsById
    } = this.props;

    return (
      <TopNavBar>
        <TopNavSection width="230px">
          <button
              type="button"
              onClick={() => {
                actions.editSearchParameters(true);
                actions.setDrawMode(false);
                actions.clearExploreSearchResults();
              }}>
            <span><FontAwesomeIcon icon={faChevronLeft} /></span>
            <div>Update search</div>
          </button>
        </TopNavSection>
        <TopNavSection>
          <TopNavButtonGroup>
            <span>Reason</span>
            <div>{searchParameters.get(PARAMETERS.REASON)}</div>
          </TopNavButtonGroup>
          <TopNavButtonGroup>
            <span>Plate number</span>
            <div>{searchParameters.get(PARAMETERS.PLATE)}</div>
          </TopNavButtonGroup>
          <TopNavButtonGroup>
            <span>Time start</span>
            <div>{this.formatDateTime(searchParameters.get(PARAMETERS.START))}</div>
          </TopNavButtonGroup>
          <TopNavButtonGroup>
            <span>Time end</span>
            <div>{this.formatDateTime(searchParameters.get(PARAMETERS.END))}</div>
          </TopNavButtonGroup>
        </TopNavSection>
        <TopNavSection width="480px" distribute>
          <TopNavLargeButton onClick={() => actions.toggleAlertModal(true)}>
            <FontAwesomeIcon icon={faBell} />
            <div>Manage alerts</div>
          </TopNavLargeButton>
          <TopNavLargeButton
              onClick={() => actions.exportReport({
                searchParameters,
                reportVehicles,
                results,
                neighborsById
              })}
              disabled={isLoadingResults || isLoadingNeighbors}>
            <FontAwesomeIcon icon={faPrint} />
            <div>Export report</div>
          </TopNavLargeButton>
        </TopNavSection>
      </TopNavBar>
    );
  }

  render() {
    const { isTopNav } = this.props;

    return isTopNav ? this.renderTopNav() : this.renderFullSearchParameters();
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const edm = state.get(STATE.EDM);
  const params = state.get(STATE.PARAMETERS);
  const report = state.get(STATE.REPORT);

  const geocodedAddresses = params.get(SEARCH_PARAMETERS.ADDRESS_SEARCH_RESULTS, List());
  const agencySearchResults = params.get(SEARCH_PARAMETERS.AGENCY_SEARCH_RESULTS, List());

  return {
    entitySets: edm.get(EDM.ENTITY_SETS),
    recordEntitySetId: edm.getIn([EDM.ENTITY_SETS, ENTITY_SETS.RECORDS, 'id']),
    propertyTypesByFqn: edm.get(EDM.PROPERTY_TYPES),

    filter: explore.get(EXPLORE.FILTER),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    isLoadingResults: explore.get(EXPLORE.IS_SEARCHING_DATA),
    isLoadingNeighbors: explore.get(EXPLORE.IS_LOADING_ENTITY_NEIGHBORS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),

    searchParameters: params.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    geocodedAddresses,
    isLoadingAddresses: params.get(SEARCH_PARAMETERS.IS_LOADING_ADDRESSES),
    noAddressResults: params.get(SEARCH_PARAMETERS.DONE_LOADING_ADDRESSES) && !geocodedAddresses.size,
    agencySearchResults,
    isLoadingAgencies: params.get(SEARCH_PARAMETERS.IS_LOADING_AGENCIES),
    noAgencyResults: params.get(SEARCH_PARAMETERS.DONE_LOADING_AGENCIES) && !agencySearchResults.size,
    isTopNav: params.get(SEARCH_PARAMETERS.DRAW_MODE) || !params.get(SEARCH_PARAMETERS.DISPLAY_FULL_SEARCH_OPTIONS),

    reportVehicles: report.get(REPORT.VEHICLE_ENTITY_KEY_IDS)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AlertActionFactory).forEach((action :string) => {
    actions[action] = AlertActionFactory[action];
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchParameters));
