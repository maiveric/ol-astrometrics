import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InfoButton from '../../components/buttons/InfoButton';
import { acceptTerms, termsAreAccepted } from '../../utils/CookieUtils';

import * as RoutingActionFactory from '../../core/router/RoutingActionFactory'

import {
  EULA_TITLE,
  FIELDS,
  CONTENT_TYPES,
  EULA_CONTENT
} from './EulaConstants';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #18161b;
  color: #ffffff;
  padding: 64px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 60px;

  article {
    line-height: 150%;
  }

  article:first-child {
    width: 288px;
    font-weight: 600;
    font-size: 20px;
  }

  article:last-child {
    width: 608px;
    margin-left: 32px;
    display: flex;
    flex-direction: column;
    align-items: ${props => (props.footer ? 'flex-end' : 'flex-start')};

    font-size: ${props => (props.header ? 34 : 16)}px;
    color: ${props => (props.header ? '#ffffff' : '#E2E1E7')};

    p {
      padding-bottom: 15px;
      margin: 0;
    }

    ul {
      margin-top: 0;
    }
  }

`;

class EulaContainer extends React.Component {

  componentDidMount() {
    if (termsAreAccepted()) {
      this.redirect();
    }
  }

  redirect = () => {
    const { actions } = this.props;
    actions.goToRoot();
  }

  acceptTerms = () => {
    acceptTerms();
    this.redirect();
  }

  renderData = (dataRows) => {

    return dataRows.map((item, index) => {
      const {
        [FIELDS.TYPE]: type,
        [FIELDS.VALUE]: value
      } = item;

      const key = `${item}-${index}`;

      switch (type) {

        case CONTENT_TYPES.BULLET: {
          return (
            <ul key={key}>
              {value.map(listItem => <li key={`${key}-${listItem}`}>{listItem}</li>)}
            </ul>
          );
        }

        case CONTENT_TYPES.TEXT:
        default: {
          return <p key={key}>{value}</p>;
        }
      }
    });


  }

  renderRows = () => Object.entries(EULA_CONTENT).map(([header, dataRows]) => (
    <Row id={header}>
      <article>{header}</article>
      <article>{this.renderData(dataRows)}</article>
    </Row>
  ))

  render() {
    return (
      <Wrapper>
        <Row header>
          <article />
          <article>
            {EULA_TITLE}
          </article>
        </Row>
        {this.renderRows()}
        <Row footer>
          <article />
          <article>
            <InfoButton onClick={this.acceptTerms}>Accept</InfoButton>
          </article>
        </Row>
      </Wrapper>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(RoutingActionFactory).forEach((action :string) => {
    actions[action] = RoutingActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(EulaContainer);
