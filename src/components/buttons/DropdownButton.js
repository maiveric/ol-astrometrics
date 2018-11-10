/*
 * @flow
 */

import React from 'react';
import styled, { css } from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import BasicButton from './BasicButton';

type Props = {
  title :string,
  options :{ label :string, onClick :() => void }[],
  openAbove? :boolean,
  invisible? :boolean
}

type State = {
  open :boolean
}

const DropdownButtonWrapper = styled.div`
  border: none;
  ${(props) => {
    if (props.open) {
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

const BaseButton = styled(BasicButton)`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  padding: 0;

  img {
    margin-left: 10px;
  }

  span {
    font-weight: 600 !important;
    width: fit-content !important;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  background-color: ${(props) => {
    if (props.invisible) return 'transparent';
    return props.open ? '#8e929b' : '#f0f0f7';
  }};
  color: ${(props) => {
    if (props.invisible) return '#ffffff';
    return props.open ? '#ffffff' : '#8e929b';
  }};

  &:hover {
    background-color: ${(props) => {
      if (props.invisible) return 'transparent';
      return props.open ? '#8e929b' : '#f0f0f7';
    }} !important;
    color: ${(props) => {
      if (props.invisible) return '#ffffff';
      return props.open ? '#ffffff' : '#8e929b';
    }} !important;
  }
`;

const MenuContainer = styled.div`
  background-color: #fefefe;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
  position: absolute;
  z-index: 1;
  min-width: max-content;
  max-width: 400px;
  visibility: ${props => (props.open ? 'visible' : 'hidden')}};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  bottom: ${(props) => {
    if (props.invisible) {
      return props.openAbove ? '30px' : 'auto';
    }
    return props.openAbove ? '45px' : 'auto';
  }};
  top: ${(props) => {
    if (props.invisible) {
      return props.openAbove ? 'auto' : '30px';
    }
    return props.openAbove ? 'auto' : '45px';
  }};
  left: ${props => (props.openAbove || props.invisible ? 'auto' : '0')};;
  right: ${props => (props.openAbove || props.invisible ? '0' : 'auto')};;
  overflow: visible;
  display: flex;
  flex-direction: column;

  button {
    width: 100%;
    padding: 15px 20px;
    text-transform: none;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #555e6f;
    border: none;
    min-width: fit-content !important;

    &:hover {
      background-color: #e6e6f7;
    }
  }
`;

const StyledIcon = styled(FontAwesomeIcon)`
  margin-left: 10px;
`;

export default class DropdownButton extends React.Component<Props, State> {

  static defaultProps = {
    openAbove: false,
    invisible: false
  };

  constructor(props :Props) {
    super(props);
    this.state = {
      open: false
    };
  }

  toggleDropdown = (e) => {
    e.stopPropagation();
    const { open } = this.state;
    this.setState({ open: !open });
  };

  getOptionFn = optionFn => (e) => {
    e.stopPropagation();
    optionFn(e);
  }

  handleOnClick = (e) => {
    e.stopPropagation();
    this.setState({ open: false });
  }

  render() {
    const {
      invisible,
      openAbove,
      options,
      title
    } = this.props;
    const { open } = this.state;

    const icon = open ? faChevronUp : faChevronDown;
    return (
      <DropdownButtonWrapper open={open}>
        <BaseButton open={open} invisible={invisible} onClick={this.toggleDropdown} onBlur={this.toggleDropdown}>
          <span>{title}</span>
          <StyledIcon icon={icon} />
        </BaseButton>
        <MenuContainer open={open} openAbove={openAbove} invisible={invisible}>
          {options.map(option => (
            <button type="button" key={option.label} onClick={this.handleOnClick} onMouseDown={option.onClick}>
              {option.label}
            </button>))
          }
        </MenuContainer>
      </DropdownButtonWrapper>
    );
  }
}
