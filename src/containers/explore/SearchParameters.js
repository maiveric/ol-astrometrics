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
  faPrint
} from '@fortawesome/pro-regular-svg-icons';

import {
  faBell,
  faBookmark,
  faPencil
} from '@fortawesome/pro-solid-svg-icons';

import InfoButton from '../../components/buttons/InfoButton';
import SearchableSelect from '../../components/controls/SearchableSelect';
import { getSearchFields } from './ExploreReducer';
import { SEARCH_REASONS } from '../../utils/constants/DataConstants';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import {
  EDM,
  STATE,
  EXPLORE,
  PARAMETERS
} from '../../utils/constants/StateConstants';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';

type Props = {
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
  isTopNav? :boolean,
  actions :{
    editSearchParameters :(editing :boolean) => void,
    geocodeAddress :(address :string) => void,
    searchAgencies :({ entitySetId :string, value :string }) => void,
    selectAgency :(agency :Map) => void,
    updateSearchParameters :({ field :string, value :string }) => void,
    selectAddress :(address :Object) => void,
    executeSearch :(searchParameters :Object) => void,
    setDrawMode :(drawMode :boolean) => void
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
  height: 38px;
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
  justify-content: ${props => (props.distribute ? 'space-between' : 'flex-start')};
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

  div {
    margin-left: 10px;
    font-size: 16px;
  }

  &:hover {
    cursor: pointer;
    color: #ffffff;
  }

  &:focus {
    outline: none;
  }
`;

const DrawWrapperButton = styled.button`
  background: transparent;
  border: none;
  width: 100%;
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

class SearchParameters extends React.Component<Props> {

  static defaultProps = {
    isTopNav: false
  }

  constructor(props :Props) {
    super(props);
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

  renderFullSearchParameters() {
    const {
      actions,
      searchParameters,
      isLoadingAddresses,
      noAddressResults,
      isLoadingAgencies,
      noAgencyResults
    } = this.props;

    const isReadyToSubmit = getSearchFields(searchParameters).length > 0;

    return (
      <SearchParameterWrapper>
        <InnerWrapper>
          <h1>ALPR Vehicle Search</h1>
          <Row>
            <Row width={20}>
              <InputGroup>
                <span>Case Number</span>
                {this.renderInput(PARAMETERS.CASE_NUMBER)}
              </InputGroup>
            </Row>
            <Row width={53}>
              <InputGroup>
                <span>Search Reason</span>
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
                <span>Full or Partial Plate</span>
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
                <DrawWrapperButton onClick={() => actions.setDrawMode(true)}>
                  <FontAwesomeIcon icon={faPencil} />
                  <span>Draw on map</span>
                </DrawWrapperButton>
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
            <div>todo</div>
            <InfoButton onClick={this.onSearchSubmit} disabled={!isReadyToSubmit}>Search for vehicles</InfoButton>
          </Row>
        </InnerWrapper>
      </SearchParameterWrapper>
    );
  }

  formatDateTime = (dateTime) => {
    const momentDT = moment(dateTime);
    return momentDT.isValid() ? momentDT.format('MM/DD/YY HH:mm a') : '';
  }

  renderTopNav = () => {
    const { actions, searchParameters } = this.props;

    return (
      <TopNavBar>
        <TopNavSection width="230px">
          <button
              type="button"
              onClick={() => {
                actions.editSearchParameters(true);
                actions.setDrawMode(false);
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
          <TopNavLargeButton>
            <FontAwesomeIcon icon={faBookmark} />
            <div>Save search</div>
          </TopNavLargeButton>
          <TopNavLargeButton>
            <FontAwesomeIcon icon={faBell} />
            <div>Set alerts</div>
          </TopNavLargeButton>
          <TopNavLargeButton>
            <FontAwesomeIcon icon={faPrint} />
            <div>Export</div>
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

  const geocodedAddresses = explore.get(EXPLORE.ADDRESS_SEARCH_RESULTS, List());
  const agencySearchResults = explore.get(EXPLORE.AGENCY_SEARCH_RESULTS, List());

  return {
    entitySets: edm.get(EDM.ENTITY_SETS),
    recordEntitySetId: edm.getIn([EDM.ENTITY_SETS, ENTITY_SETS.RECORDS, 'id']),
    propertyTypesByFqn: edm.get(EDM.PROPERTY_TYPES),
    displayFullSearchOptions: explore.get(EXPLORE.DISPLAY_FULL_SEARCH_OPTIONS),
    drawMode: explore.get(EXPLORE.DRAW_MODE),
    filter: explore.get(EXPLORE.FILTER),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    selectedEntityKeyIds: explore.get(EXPLORE.SELECTED_ENTITY_KEY_IDS),
    isLoadingResults: explore.get(EXPLORE.IS_SEARCHING_DATA),
    searchParameters: explore.get(EXPLORE.SEARCH_PARAMETERS),
    geocodedAddresses,
    isLoadingAddresses: explore.get(EXPLORE.IS_LOADING_ADDRESSES),
    noAddressResults: explore.get(EXPLORE.DONE_LOADING_ADDRESSES) && !geocodedAddresses.size,
    agencySearchResults,
    isLoadingAgencies: explore.get(EXPLORE.IS_LOADING_AGENCIES),
    noAgencyResults: explore.get(EXPLORE.DONE_LOADING_AGENCIES) && !agencySearchResults.size
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

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchParameters));
