/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';

type Props = {
  entitySet :Immutable.Map<*, *>,
  onClick :(entitySet :Immutable.Map<*, *>) => void
}

type State = {
  expanded :boolean
}

const RightJustifyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const DetailsButton = styled.button`
  border-radius: 2px;
  background-color: #ffffff;
  border: 1px solid #dcdce7;
  padding: 4px 10px;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #8e929b;
  display: flex;
  flex-direction: row;
  align-items: center;

  &:hover {
    cursor: pointer;
    box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.07);
  }

  &:focus {
    outline: none;
  }
`;

const Card = styled.div`
  width: 470px;
  height: fit-content;
  margin: 10px;
  padding: 25px;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #dcdce7;

  &:hover {
    cursor: pointer;
    box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.07);
  }

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #2e2e34;
    margin: 0 0 15px 0;
    overflow: ${props => (props.expanded ? 'visible' : 'hidden')};
    text-overflow: ellipsis;
    white-space: ${props => (props.expanded ? 'normal' : 'nowrap')};
  }

  span {
    margin: 10px 0;
    min-height: 13px;
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    color: #8e929b;
    overflow: ${props => (props.expanded ? 'visible' : 'hidden')};
    text-overflow: ellipsis;
    white-space: ${props => (props.expanded ? 'normal' : 'nowrap')};
    display: block;
  }
`;

const DownIcon = styled(FontAwesomeIcon).attrs({
  icon: faChevronDown
})`
  margin-left: 5px;
`;

const UpIcon = styled(FontAwesomeIcon).attrs({
  icon: faChevronUp
})`
  margin-left: 5px;
`;

export default class EntitySetCard extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  toggleExpand = (e) => {
    e.stopPropagation();
    this.setState({ expanded: !this.state.expanded });
  }

  renderDefaultCard = () => {
    const { entitySet, onClick } = this.props;
    const { expanded } = this.state;

    return (
      <Card onClick={onClick} expanded={expanded}>
        <h1>{entitySet.get('title', '')}</h1>
        <span>{entitySet.get('description', '')}</span>
        <RightJustifyWrapper>
          <DetailsButton onClick={this.toggleExpand}>
            Details
            <DownIcon />
          </DetailsButton>
        </RightJustifyWrapper>
      </Card>
    );
  }

  renderExpandedCard = () => {
    const { entitySet, onClick } = this.props;
    const { expanded } = this.state;

    return (
      <Card onClick={onClick} expanded={expanded}>
        <h1>{entitySet.get('title', '')}</h1>
        <span>{entitySet.get('description', '')}</span>
        <RightJustifyWrapper>
          <DetailsButton onClick={this.toggleExpand}>
            Details
            <UpIcon />
          </DetailsButton>
        </RightJustifyWrapper>
      </Card>
    );
  }

  render() {
    const { expanded } = this.state;
    return expanded ? this.renderExpandedCard() : this.renderDefaultCard();
  }
}
