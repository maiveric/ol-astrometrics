/*
 * @flow
 */

import React, { Component } from 'react';


import styled from 'styled-components';
import { withRouter } from 'react-router';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/pro-light-svg-icons';
// import { faSun } from '@fortawesome/pro-solid-svg-icons';

import InnerNavBar from '../../components/nav/InnerNavBar';
import NavLinkWrapper from '../../components/nav/NavLinkWrapper';
import BasicButton from '../../components/buttons/BasicButton';
import * as Routes from '../../core/router/Routes';
import * as ExploreActionFactory from './ExploreActionFactory';
import { STATE, EXPLORE } from '../../utils/constants/StateConstants';
import { MAP_STYLE } from '../../utils/constants/MapConstants';

const NavigationContentWrapper = styled(InnerNavBar)`
  padding: 0 28px;
  justify-content: space-between
`;

const ContentGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const MapButton = styled(BasicButton)`
  padding: 7px 18px;

  span {
    margin-left: 7px;
  }
`;

type Props = {
  mapMode :string;
  actions :{
    setMapMode :Function;
  }
};

class ExploreNavigationContainer extends Component<Props> {

  render() {

    const { mapMode, actions } = this.props;

    let mapButtonText = 'Light';
    let mapButtonIcon = faSun;
    let onClickMode = MAP_STYLE.LIGHT;

    if (mapMode === MAP_STYLE.LIGHT) {
      mapButtonText = 'Dark';
      mapButtonIcon = faMoon;
      onClickMode = MAP_STYLE.DARK;
    }

    return (
      <NavigationContentWrapper>
        <ContentGroup>
          <NavLinkWrapper to={Routes.MAP_ROUTE}>
            Map
          </NavLinkWrapper>
          {/*
          <NavLinkWrapper to={Routes.ALERTS_ROUTE}>
            Alerts
          </NavLinkWrapper>
          */}
          <NavLinkWrapper to={Routes.REPORTS_ROUTE}>
            Reports
          </NavLinkWrapper>
        </ContentGroup>
        <ContentGroup>
          <MapButton onClick={() => actions.setMapMode(onClickMode)}>
            <FontAwesomeIcon icon={mapButtonIcon} />
            <span>{`${mapButtonText} Map`}</span>
          </MapButton>
        </ContentGroup>
      </NavigationContentWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);

  return {
    mapMode: explore.get(EXPLORE.MAP_MODE)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ExploreActionFactory).forEach((action :string) => {
    actions[action] = ExploreActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExploreNavigationContainer));
