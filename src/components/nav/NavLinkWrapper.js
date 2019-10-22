import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const NAV_LINK_ACTIVE_CLASSNAME = 'nav-link-active';


export default styled(NavLink).attrs(_ => ({
  activeClassName: NAV_LINK_ACTIVE_CLASSNAME
}))`
  align-items: center;
  border-bottom: 3px solid transparent;
  color: #807F85;
  display: flex;
  font-size: ${props => (props.large ? 24 : 12)}px;
  letter-spacing: 0;
  margin-right: 30px;
  outline: none;
  padding: ${props => (props.large ? '10px 20px' : '15px 0')};
  border-radius: ${props => (props.large ? 33 : 0)}px;
  text-align: left;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: #ffffff;
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.${NAV_LINK_ACTIVE_CLASSNAME} {
    border-bottom: 1px solid #ffffff;
    color: ${props => (props.large ? '#070709' : '#FFFFFF')};
    background-color: ${props => (props.large ? '#E2E1E7' : 'transparent')};
    font-weight: 600;
  }
`;
