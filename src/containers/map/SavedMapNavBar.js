import React from 'react';

import moment from 'moment';
import styled from 'styled-components';
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as DrawActionFactory from './DrawActionFactory';

import InnerNavBar from '../../components/nav/InnerNavBar';
import SearchableSelect from '../../components/controls/SearchableSelect';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';
import { getDrawCoordsFromFeatures } from '../../utils/MapUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { NEW_MAP } from '../../utils/constants/ExploreConstants';
import {
  DRAW,
  PARAMETERS,
  SAVED_MAP,
  STATE
} from '../../utils/constants/StateConstants';

const NavBar = styled(InnerNavBar)`
  justify-content: space-between;
  padding: 0 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  button {
    margin: 0 5px;
    min-width: 105px;
  }
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  max-width: 300px;
`;

const Icon = styled(FontAwesomeIcon)`
  margin-right: 10px;
`;

class SavedMapNavBar extends React.Component {

  saveMap = () => {
    const { actions } = this.props;
    actions.toggleCreateNewMap(true);
  }

  discardMap = () => {
    const { actions } = this.props;
    actions.discardDrawZones();
  }

  getSelectOptions = () => {
    const { savedMaps } = this.props;
    let options = OrderedMap().set('', NEW_MAP);

    savedMaps.entrySeq().forEach(([entityKeyId, savedMap]) => {

      try {
        const {
          [SAVED_MAP.NAME]: name,
          [SAVED_MAP.DATE_CREATED]: dateCreated
        } = JSON.parse(savedMap.getIn([PROPERTY_TYPES.TEXT, 0], '{}'));

        const formattedDate = moment(dateCreated).format('MM/DD/YYYY');

        const label = `${name} (${formattedDate})`;
        options = options.set(entityKeyId, label);
      }
      catch (error) {
        console.error(error);
      }
    });

    return options;
  }

  onSelect = (entityKeyId) => {
    const { actions, savedMaps } = this.props;
    actions.selectMap(entityKeyId);

    const coordinates = getDrawCoordsFromFeatures(
      JSON.parse(savedMaps.get(entityKeyId, Map()).getIn([PROPERTY_TYPES.TEXT, 0], '{}'))
    );

    actions.updateSearchParameters({
      field: PARAMETERS.SEARCH_ZONES,
      value: coordinates
    });
  }

  render() {
    const { currentZones, savedMaps, selectedMapId } = this.props;

    return (
      <NavBar bottom>

        <StyledSearchableSelect
            value={selectedMapId}
            searchPlaceholder="New map"
            onSelect={this.onSelect}
            options={this.getSelectOptions()}
            openAbove
            short />

        <ButtonGroup>
          <SecondaryButton onClick={this.discardMap} disabled={!currentZones.size}>
            <Icon icon={faTrash} />
            Discard
          </SecondaryButton>
          <SecondaryButton onClick={this.saveMap} disabled={!currentZones.size}>
            <Icon icon={faSave} />
            Save
          </SecondaryButton>
        </ButtonGroup>

      </NavBar>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const draw = state.get(STATE.DRAW);

  return {
    currentZones: draw.get(DRAW.DRAW_ZONES),
    savedMaps: draw.get(DRAW.SAVED_MAPS),
    selectedMapId: draw.get(DRAW.SELECTED_MAP_ID)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DrawActionFactory).forEach((action :string) => {
    actions[action] = DrawActionFactory[action];
  });

  Object.keys(ParametersActionFactory).forEach((action :string) => {
    actions[action] = ParametersActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(SavedMapNavBar);
