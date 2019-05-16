/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
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
  border: 1px solid #dcdce7;
  border-radius: 3px;
  color: #135;
  flex: 1 0 auto;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 24px;
  outline: none;
  padding: 0 45px 0 20px;
  &:focus {
    border-color: #6124e2;
  }
  &::placeholder {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #8e929b;
  }
`;

const SearchInput = styled.input.attrs({
  type: 'text'
})`
  ${inputStyle}
  background-color: ${props => (props.transparent ? '#f9f9fd' : '#ffffff')};
`;

const SearchIcon = styled.div`
  align-self: center;
  color: #687F96;
  position: absolute;
  margin: 0 20px;
  right: 0
`;


const SearchButton = styled.button`
  ${inputStyle}
  text-align: left;
  background-color: ${props => (props.transparent ? '#f9f9fd' : '#ffffff')};
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
  background-color: #fefefe;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
  position: absolute;
  z-index: 5;
  width: 100%;
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')}};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
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
  color: #2e2e34;
`;

const SearchOption = styled.div`
  padding: 10px 20px;
  color: #000000;
  font-size: 14px;
  font-weight: 400;

  &:hover {
    background-color: #f0f0f7;
    cursor: pointer;
  }

  &:active {
    background-color: #e6e6f7;
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
    options: Immutable.List(),
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
      filteredTypes: props.options.keySeq(),
      isVisibleDataTable: false,
      searchQuery: ''
    };
  }


  componentWillReceiveProps(nextProps :Props) {
    const { value, options } = nextProps;

    this.setState({
      filteredTypes: this.filterResultsForOptions(value, options).keySeq(),
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

  handleOnSelect = (label :string) => {
    const { onSelect, options } = this.props;

    onSelect(options.get(label));
    this.setState({
      searchQuery: ''
    });
  }

  filterResultsForOptions = (value :string, options :Map<*, *>) => {
    const { inexactMatchesAllowed } = this.props;

    return inexactMatchesAllowed
      ? options
      : options.filter((obj, label) => label.toLowerCase().includes(value.toLowerCase()));
  }

  filterResults = (value :string) => {
    const { options } = this.props;
    return this.filterResultsForOptions(value, options)
  }


  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {
    const { onInputChange } = this.props;

    this.setState({
      filteredTypes: this.filterResults(event.target.value).keySeq(),
      searchQuery: event.target.value
    });

    onInputChange(event);
  }

  renderTable = () => {
    const { filteredTypes } = this.state;
    const options = filteredTypes.map(type => (
      <SearchOption
          key={type}
          onMouseDown={() => this.handleOnSelect(type)}>
        {type}
      </SearchOption>
    ));
    return <SearchOptionContainer>{options}</SearchOptionContainer>;
  }

  renderDropdownContents = () => {
    const { filteredTypes, isVisibleDataTable, searchQuery } = this.state;
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
            <Spinner />
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

  render() {
    const {
      className,
      disabled,
      onClear,
      searchPlaceholder,
      selectOnly,
      short,
      transparent,
      value
    } = this.props;
    const { isVisibleDataTable, searchQuery } = this.state;

    return (
      <SearchableSelectWrapper isVisibleDataTable={isVisibleDataTable} className={className}>
        <SearchInputWrapper short={short}>
          {
            selectOnly ? (
              <SearchButton
                  innerRef={(ref) => {
                    this.buttonRef = ref;
                  }}
                  disabled={disabled}
                  transparent={transparent}
                  onBlur={this.hideDataTable}
                  onChange={this.handleOnChangeSearchQuery}
                  onClick={this.showDataTable}>
                {value || searchPlaceholder}
              </SearchButton>
            ) : (
              <SearchInput
                  placeholder={searchPlaceholder}
                  transparent={transparent}
                  value={value || searchQuery}
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
