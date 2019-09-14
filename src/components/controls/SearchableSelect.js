/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import styled, { css } from 'styled-components';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Spinner from '../spinner/Spinner';
import downArrowIcon from '../../assets/svg/down-arrow.svg';

/*
 * styled components
 */

const SearchableSelectWrapper = styled.div`
  border: none;
  ${(props) => {
    if (props.isVisibleDataTable) {
      return css`
        box-shadow: 0 2px 8px -2px rgba(17, 51, 85, 0.15);
      `;
    }
    return '';
  }}
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  height: ${props => (props.short ? '39px' : '45px')};
  position: relative;
`;

const inputStyle = `
  width: 100%;

  background-color: #36353B !important;
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
    cursor: pointer;
  }

  &::placeholder {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #807F85;
  }
`;

const SearchInput = styled.input.attrs(_ => ({
  type: 'text'
}))`
  ${inputStyle}
  background-color: ${(props) => {
    if (props.disabled) {
      return '#36353B';
    }
    return (props.transparent ? '#f9f9fd' : '#36353B');
  }};
`;

const SearchIcon = styled.div`
  align-self: center;
  color: #687F96;
  position: absolute;
  margin: 0 20px;
  right: 0;
  height: 100%;
  display: flex;
`;


const SearchButton = styled.button`
  ${inputStyle}
  text-align: left;
  background-color: ${props => (props.transparent ? '#f9f9fd' : '#36353B')};
`;

const CloseIcon = styled.div`
  align-self: center;
  color: #687F96;
  position: absolute;
  right: 20px;

  &:hover {
    cursor: pointer;
  }
`;

const DataTableWrapper = styled.div`
  background-color: #36353B;
  border-radius: 3px;
  position: absolute;
  z-index: 5;
  width: 100%;
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')}};
  box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.1);
  margin: ${props => (props.openAbove ? '-303px 0 0 0' : '45px 0 0 0')};
  bottom: ${props => (props.openAbove ? '45px' : 'auto')};
`;

const NoContentWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: ${props => (props.searching ? 50 : 30)}px;
  font-size: 14px;
  font-weight: 600;
  font-style: italic;
  color: #CAC9CE;
`;

const SearchOption = styled.div`
  padding: 7px 24px;
  color: #ffffff;
  font-size: 14px;
  line-height: 150%;
  font-weight: 400;

  &:hover {
    background-color: #4F4E54;
    cursor: pointer;
  }
`;

const SearchOptionContainer = styled.div`
  max-height: 300px;
  overflow-x: auto;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/*
 * types
 */

type Props = {
  options :Map<*, *>,
  className? :string,
  maxHeight? :number,
  searchPlaceholder :string,
  onInputChange? :Function,
  onSelect :Function,
  short :?boolean,
  value :?string,
  inputValue :?string,
  onClear? :?() => void,
  transparent? :boolean,
  openAbove? :boolean,
  selectOnly? :boolean,
  disabled? :boolean,
  isLoadingResults? :boolean,
  noResults? :boolean,
  allowFreeEntry? :boolean,
  inexactMatchesAllowed? :boolean
}

type State = {
  filteredTypes :List<string>,
  isVisibleDataTable :boolean,
  searchQuery :string
}

class SearchableSelect extends React.Component<Props, State> {

  static defaultProps = {
    options: Map(),
    className: '',
    maxHeight: -1,
    searchPlaceholder: 'Search...',
    onSelect: () => {},
    onInputChange: () => {},
    short: false,
    value: '',
    transparent: false,
    openAbove: false,
    selectOnly: false,
    disabled: false,
    isLoadingResults: false,
    noResults: false,
    allowFreeEntry: false,
    inexactMatchesAllowed: false
  };

  constructor(props :Props) {

    super(props);

    this.state = {
      filteredTypes: props.options,
      isVisibleDataTable: false,
      searchQuery: ''
    };
  }


  componentWillReceiveProps(nextProps :Props) {
    const { value, options } = nextProps;

    this.setState({
      filteredTypes: this.filterResultsForOptions(value, options),
      searchQuery: ''
    });
  }

  buttonRef = React.createRef();

  hideDataTable = () => {

    this.setState({
      isVisibleDataTable: false,
      searchQuery: ''
    });
  }

  showDataTable = (e) => {
    e.stopPropagation();

    this.setState({
      isVisibleDataTable: true,
      searchQuery: ''
    });

    if (this.buttonRef && this.buttonRef.focus) {
      this.buttonRef.focus();
    }

  }

  handleOnSelect = (value :string) => {
    const { onSelect } = this.props;

    onSelect(value);
    this.setState({
      searchQuery: ''
    });
  }

  filterResultsForOptions = (value :string, options :Map<*, *>) => {
    const { inexactMatchesAllowed } = this.props;

    return inexactMatchesAllowed
      ? options
      : options.filter((v, key) => key.toLowerCase().includes(value.toLowerCase()));
  }

  filterResults = (value :string) => {
    const { options } = this.props;
    return this.filterResultsForOptions(value, options);
  }

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {
    const { onInputChange } = this.props;

    this.setState({
      filteredTypes: this.filterResults(event.target.value),
      searchQuery: event.target.value
    });

    onInputChange(event);
  }

  renderTable = () => {
    const { filteredTypes } = this.state;

    const options = [];

    filteredTypes.entrySeq().forEach(([value, label]) => {
      options.push(
        <SearchOption
            key={value}
            onMouseDown={() => this.handleOnSelect(value)}>
          {label}
        </SearchOption>
      );
    });

    return <SearchOptionContainer>{options}</SearchOptionContainer>;
  }

  renderDropdownContents = () => {
    const { filteredTypes, isVisibleDataTable } = this.state;
    const {
      allowFreeEntry,
      openAbove,
      isLoadingResults,
      noResults
    } = this.props;

    const noFilteredResults = noResults || !filteredTypes.size;

    if (isLoadingResults) {
      return (
        <DataTableWrapper isVisible openAbove={openAbove}>
          <NoContentWrapper searching>
            <Spinner light />
          </NoContentWrapper>
        </DataTableWrapper>
      );
    }

    if (isVisibleDataTable) {

      if (noFilteredResults && allowFreeEntry) {
        return null;
      }

      return (
        <DataTableWrapper isVisible={isVisibleDataTable} openAbove={openAbove}>
          {noFilteredResults ? <NoContentWrapper>No results</NoContentWrapper> : this.renderTable()}
        </DataTableWrapper>
      );
    }

    return null;
  }

  clearOnDelete = ({ keyCode }) => {
    if (keyCode === 8) { // backspace
      this.handleOnSelect('');
    }
  }

  render() {
    const {
      className,
      disabled,
      onClear,
      searchPlaceholder,
      selectOnly,
      short,
      transparent,
      value,
      inputValue,
      options
    } = this.props;
    const { isVisibleDataTable, searchQuery } = this.state;

    return (
      <SearchableSelectWrapper isVisibleDataTable={isVisibleDataTable} className={className}>
        <SearchInputWrapper short={short}>
          {
            selectOnly ? (
              <SearchButton
                  onKeyUp={this.clearOnDelete}
                  ref={(ref) => {
                    this.buttonRef = ref;
                  }}
                  disabled={disabled}
                  transparent={transparent}
                  onBlur={this.hideDataTable}
                  onChange={this.handleOnChangeSearchQuery}
                  onClick={this.showDataTable}>
                {options.get(value, inputValue) || searchPlaceholder}
              </SearchButton>
            ) : (
              <SearchInput
                  disabled={disabled}
                  placeholder={searchPlaceholder}
                  transparent={transparent}
                  value={options.get(value, inputValue) || searchQuery}
                  onBlur={this.hideDataTable}
                  onChange={this.handleOnChangeSearchQuery}
                  onClick={this.showDataTable} />
            )
          }
          {
            (onClear && value) ? null : (
              <SearchIcon floatRight={selectOnly}>
                <img src={downArrowIcon} alt="" />
              </SearchIcon>
            )
          }
          {
            !onClear || !value
              ? null
              : (
                <CloseIcon onClick={onClear}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseIcon>
              )
          }
        </SearchInputWrapper>
        {this.renderDropdownContents()}
      </SearchableSelectWrapper>
    );
  }
}

export default SearchableSelect;
