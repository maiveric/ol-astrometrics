/*
 * @flow
 */

import React from 'react';

import moment from 'moment';
import styled from 'styled-components';
import { faChevronLeft, faPrint } from '@fortawesome/pro-regular-svg-icons';
import { faBell } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, OrderedMap } from 'immutable';
import { DateTimePicker } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import * as ParametersActionFactory from './ParametersActionFactory';
import { getSearchFields } from './ParametersReducer';

import ButtonToolbar from '../../components/buttons/ButtonToolbar';
import InfoButton from '../../components/buttons/InfoButton';
import SearchableSelect from '../../components/controls/SearchableSelect';
import Slider from '../../components/controls/Slider';
import drawIcon from '../../assets/svg/draw-icon.svg';
import * as AlertActionFactory from '../alerts/AlertActionFactory';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as ReportActionFactory from '../report/ReportActionFactory';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
import { getEntitySetId } from '../../utils/AppUtils';
import { getPreviousLicensePlateSearches } from '../../utils/CookieUtils';
import {
  ACCESSORIES,
  COLORS,
  MAKES,
  SEARCH_REASONS,
  STYLES
} from '../../utils/constants/DataConstants';
import { APP_TYPES } from '../../utils/constants/DataModelConstants';
import {
  EDM,
  EXPLORE,
  PARAMETERS,
  REPORT,
  SEARCH_PARAMETERS,
  STATE
} from '../../utils/constants/StateConstants';

type Props = {
  isTopNav :boolean;
  recordEntitySetId :string;
  propertyTypesByFqn :Map<*, *>;
  searchParameters :Map<*, *>;
  geocodedAddresses :List<*>;
  isLoadingAddresses :boolean;
  noAddressResults :boolean;
  isDrawMode :boolean;
  agencyOptions :Map<*>;
  deviceOptions :Map<*>;
  devicesByAgency :Map<*>;
  isLoadingResults :boolean;
  isLoadingNeighbors :boolean;
  reportVehicles :Set<*>;
  results :List<*>;
  neighborsById :Map<*, *>;
  actions :{
    clearExploreSearchResults :RequestSequence;
    editSearchParameters :RequestSequence;
    executeSearch :RequestSequence;
    exportReport :RequestSequence;
    geocodeAddress :RequestSequence;
    selectAddress :RequestSequence;
    setDrawMode :RequestSequence;
    toggleAlertModal :RequestSequence;
    updateSearchParameters :RequestSequence;
  };
};

const SearchParameterWrapper = styled.div`
  width: ${SIDEBAR_WIDTH}px;
  height: 100%;
  position: relative;
  z-index: 2;
  background-color: #1F1E24;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0px -5px 10px rgba(0, 0, 0, 0.25);
`;

const MenuSection = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 24px 32px;
  border-bottom: 1px solid #36353B;
`;

const InnerWrapper = styled.div`
  position: absolute;
  top: 0;
  width: ${SIDEBAR_WIDTH}px;
  height: calc(100% - 68px);
  overflow-y: scroll;
  display: flex;
  flex-direction: column;

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #CAC9CE;
    border-radius: 10px;
  }
`;

type State = {
  isExpanded :boolean
};

const Row = styled.div`
  width: ${(props) => (props.width || '100')}%;
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StyledInputWrapper = styled.div`
  width: 100%;
  height: 39px;
  position: relative;
`;

const StyledInput = styled.input.attrs(_ => ({
  type: 'text'
}))`
  width: 100%;
  background: #4F4E54;

  background: #36353B;
  color: #ffffff;
  border-radius: 3px;
  border: none;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;

  &:focus {
    border: 1px solid #98979D;
    background: #4F4E54;
    outline: none;
  }

  &:hover {
    background: #4F4E54;
  }
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
  justify-content: ${(props) => (props.distribute ? 'space-evenly' : 'flex-start')};
  align-items: center;
  width: ${(props) => (props.width || '100%')};
  min-width: ${(props) => (props.distribute ? props.width : 'auto')};
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

const Label = styled.span`
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 10px;
`;

const InlineGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  margin-bottom: 10px;

  ${Label} {
    margin-bottom: 0;
  }
`;

const HelperText = styled.span`
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  color: #807F85 !important;

  padding-left: ${(props) => (props.offsetLeft ? 8 : 0)}px;
`;

const Accent = styled.span`
  color: #e53b36 !important;
`;

const SearchButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 0px;
  padding: 16px 32px;
  left: 0;
  width: ${SIDEBAR_WIDTH}px;
`;

class SearchParameters extends React.Component<Props, State> {

  addressSearchTimeout :any;

  constructor(props :Props) {
    super(props);
    this.state = {
      isExpanded: false
    };

    this.addressSearchTimeout = null;
  }

  handleAddressChange = (e) => {
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

  getOnChange = (field) => {
    const { actions } = this.props;
    return (e) => {
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
      options = options.set(addr, addr.get('display_name'));
    });

    return options;
  }

  onDateTimeChange = (value, field) => {
    const { actions } = this.props;
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

  exitDrawMode = () => {
    const { actions } = this.props;
    actions.setDrawMode(false);
    actions.updateSearchParameters({
      field: PARAMETERS.SEARCH_ZONES,
      value: List()
    });
  }

  renderFullSearchParameters() {
    const {
      actions,
      searchParameters,
      isLoadingAddresses,
      isDrawMode,
      noAddressResults,
      agencyOptions,
      deviceOptions,
      devicesByAgency
    } = this.props;

    let filteredDeviceOptions = deviceOptions;
    const agencyId = searchParameters.get(PARAMETERS.DEPARTMENT);
    if (agencyId) {
      const devicesForAgency = devicesByAgency.get(agencyId, List());
      filteredDeviceOptions = deviceOptions.filter((_, deviceId) => devicesForAgency.includes(deviceId));
    }

    const onAgencyChange = (value) => {
      if (value !== agencyId) {
        actions.updateSearchParameters({ field: PARAMETERS.DEPARTMENT, value });
        actions.updateSearchParameters({ field: PARAMETERS.DEVICE, value: '' });
      }
    };

    return (
      <SearchParameterWrapper>
        <InnerWrapper>

          <MenuSection>

            <Row>
              <InputGroup>
                <Label>
                  Case number
                  <Accent>*</Accent>
                </Label>
                {this.renderInput(PARAMETERS.CASE_NUMBER)}
              </InputGroup>
            </Row>

            <Row>
              <InputGroup>
                <Label>
                  Search reason
                  <Accent>*</Accent>
                </Label>
                <StyledSearchableSelect
                    value={searchParameters.get(PARAMETERS.REASON)}
                    searchPlaceholder="Select"
                    options={this.getAsMap(SEARCH_REASONS)}
                    onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.REASON, value })}
                    onClear={() => actions.updateSearchParameters({ field: PARAMETERS.REASON, value: '' })}
                    selectOnly
                    short />
              </InputGroup>
            </Row>

          </MenuSection>

          <MenuSection>

            <Row>
              <InputGroup>
                <HelperText>
                  At least two of license plate, location, or search date range must be present to search.
                </HelperText>
              </InputGroup>
            </Row>

            <Row>
              <InputGroup>
                <InlineGroup>
                  <Label>Full or partial plate </Label>
                  <HelperText offsetLeft> Minimum 3 characters</HelperText>
                </InlineGroup>
                <StyledSearchableSelect
                    inputValue={searchParameters.get(PARAMETERS.PLATE)}
                    searchPlaceholder=""
                    onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.PLATE, value })}
                    onInputChange={({ target }) => {
                      actions.updateSearchParameters({ field: PARAMETERS.PLATE, value: target.value });
                    }}
                    options={this.getAsMap(getPreviousLicensePlateSearches())}
                    allowFreeEntry
                    short />
              </InputGroup>
            </Row>

          </MenuSection>

          <MenuSection>

            <Row>
              <ButtonToolbar
                  value={isDrawMode}
                  options={[
                    {
                      value: false,
                      label: 'Address',
                      onClick: this.exitDrawMode
                    },
                    {
                      value: true,
                      label: 'Draw',
                      onClick: this.resetAndGoToDrawMode
                    }
                  ]} />
            </Row>

            {
              isDrawMode ? (
                <Row>
                  <HelperText>
                    <span>Start defining multiple search zones by clicking the </span>
                    <img src={drawIcon} />
                    <span>
                      {` draw button on the top right corner of the map.
                        Click and release to place a corner of a polygon, and click a placed corner a second time
                        to complete a polygon. Click then drag any corner to edit.`}
                    </span>
                  </HelperText>
                </Row>
              ) : (
                <>

                  <Row>
                    <InputGroup>
                      <Label>Street address</Label>
                      <StyledSearchableSelect
                          inputValue={searchParameters.get(PARAMETERS.ADDRESS)}
                          searchPlaceholder="Enter address"
                          onInputChange={this.handleAddressChange}
                          onSelect={actions.selectAddress}
                          options={this.getAddressesAsMap()}
                          isLoadingResults={isLoadingAddresses}
                          noResults={noAddressResults}
                          inexactMatchesAllowed
                          short />
                    </InputGroup>
                  </Row>

                  <Row>
                    <InputGroup>
                      <InlineGroup>
                        <Label>Search radius</Label>
                        <HelperText offsetLeft>Maximum 50 miles</HelperText>
                      </InlineGroup>
                      <StyledInputWrapper>
                        <Slider
                            min={0}
                            max={50}
                            value={20}
                            unitLabel="mi"
                            onChange={(value) => {
                              actions.updateSearchParameters({
                                field: PARAMETERS.RADIUS,
                                value
                              });
                            }} />
                      </StyledInputWrapper>
                    </InputGroup>
                  </Row>

                </>
              )
            }
          </MenuSection>

          <MenuSection>

            <Row>
              <InputGroup>
                <Label>Search start</Label>
                <DateTimePickerWrapper>
                  <DateTimePicker
                      minDate={moment().subtract(1, 'year').add(1, 'day').toISOString()}
                      disableFuture
                      onChange={(value) => this.onDateTimeChange(value, PARAMETERS.START)}
                      value={searchParameters.get(PARAMETERS.START)} />
                </DateTimePickerWrapper>
              </InputGroup>
            </Row>

            <Row>
              <InputGroup>
                <Label>Search end</Label>
                <DateTimePickerWrapper>
                  <DateTimePicker
                      minDate={moment().subtract(1, 'year').add(1, 'day').toISOString()}
                      disableFuture
                      onChange={(value) => this.onDateTimeChange(value, PARAMETERS.END)}
                      value={searchParameters.get(PARAMETERS.END)} />
                </DateTimePickerWrapper>
              </InputGroup>
            </Row>

          </MenuSection>

          <MenuSection>

            <Row>
              <InputGroup>
                <Label>Department (optional)</Label>
                <StyledSearchableSelect
                    value={searchParameters.get(PARAMETERS.DEPARTMENT)}
                    onSelect={onAgencyChange}
                    onClear={() => actions.updateSearchParameters({ field: PARAMETERS.DEPARTMENT, value: '' })}
                    options={agencyOptions}
                    short />
              </InputGroup>
            </Row>
            <Row>
              <InputGroup>
                <Label>Device (optional)</Label>
                <StyledSearchableSelect
                    value={searchParameters.get(PARAMETERS.DEVICE)}
                    onSelect={(value) => actions.updateSearchParameters({ field: PARAMETERS.DEVICE, value })}
                    onClear={() => actions.updateSearchParameters({ field: PARAMETERS.DEVICE, value: '' })}
                    options={filteredDeviceOptions}
                    short />
              </InputGroup>
            </Row>

          </MenuSection>
          {this.renderSearchButton()}

        </InnerWrapper>
      </SearchParameterWrapper>
    );
  }

  onMakeChange = (value) => {
    const { actions } = this.props;
    actions.updateSearchParameters({ field: PARAMETERS.MAKE, value });
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
    const isReadyToSubmit = !getSearchFields(searchParameters).includes(PARAMETERS.NOT_READY);

    return (
      <SearchButtonWrapper>
        <InfoButton fullSize onClick={this.onSearchSubmit} disabled={!isReadyToSubmit}>Search for vehicles</InfoButton>
      </SearchButtonWrapper>
    );
  }

  //* This is not currently used, but leaving the code here for future use */
  renderAdditionalDetails = () => {
    const { isExpanded } = this.state;
    const { actions, searchParameters } = this.props;

    if (!isExpanded) {
      return null;
    }

    return (
      <>
        <MenuSection>

          <Row>
            <InputGroup>
              <Label>Make</Label>
              <StyledSearchableSelect
                  value={searchParameters.get(PARAMETERS.MAKE)}
                  onSelect={value => this.onMakeChange(value)}
                  onClear={() => this.onMakeChange('')}
                  options={this.getAsMap(MAKES)}
                  openAbove
                  short />
            </InputGroup>
          </Row>

          <Row>
            <InputGroup>
              <Label>Color</Label>
              <StyledSearchableSelect
                  value={searchParameters.get(PARAMETERS.COLOR)}
                  onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.COLOR, value })}
                  onClear={() => actions.updateSearchParameters({ field: PARAMETERS.COLOR, value: '' })}
                  options={this.getAsMap(COLORS)}
                  openAbove
                  short />
            </InputGroup>
          </Row>

          <Row>
            <InputGroup>
              <Label>Accessories</Label>
              <StyledSearchableSelect
                  value={searchParameters.get(PARAMETERS.ACCESSORIES)}
                  onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.ACCESSORIES, value })}
                  onInputChange={({ target }) => {
                    actions.updateSearchParameters({ field: PARAMETERS.ACCESSORIES, value: target.value });
                  }}
                  onClear={() => actions.updateSearchParameters({ field: PARAMETERS.ACCESSORIES, value: '' })}
                  options={this.getAsMap(ACCESSORIES)}
                  openAbove
                  short />
            </InputGroup>
          </Row>

          <Row>
            <InputGroup>
              <Label>Style</Label>
              <StyledSearchableSelect
                  value={searchParameters.get(PARAMETERS.STYLE)}
                  onSelect={value => actions.updateSearchParameters({ field: PARAMETERS.STYLE, value })}
                  onClear={() => actions.updateSearchParameters({ field: PARAMETERS.STYLE, value: '' })}
                  options={this.getAsMap(STYLES)}
                  openAbove
                  short />
            </InputGroup>
          </Row>

        </MenuSection>

      </>
    );
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
    const { isTopNav, searchParameters } = this.props;

    return isTopNav ? null : this.renderFullSearchParameters();
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const explore = state.get(STATE.EXPLORE);
  const edm = state.get(STATE.EDM);
  const params = state.get(STATE.PARAMETERS);
  const report = state.get(STATE.REPORT);

  const geocodedAddresses = params.get(SEARCH_PARAMETERS.ADDRESS_SEARCH_RESULTS, List());

  return {
    recordEntitySetId: getEntitySetId(app, APP_TYPES.RECORDS),
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
    isDrawMode: params.get(SEARCH_PARAMETERS.DRAW_MODE),
    isTopNav: !params.get(SEARCH_PARAMETERS.DISPLAY_FULL_SEARCH_OPTIONS),
    agencyOptions: params.get(SEARCH_PARAMETERS.AGENCY_OPTIONS),
    deviceOptions: params.get(SEARCH_PARAMETERS.DEVICE_OPTIONS),
    devicesByAgency: params.get(SEARCH_PARAMETERS.DEVICES_BY_AGENCY),

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

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchParameters));
