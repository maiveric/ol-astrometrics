import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { OrderedMap } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash } from '@fortawesome/pro-light-svg-icons';

import SearchableSelect from '../../components/controls/SearchableSelect';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import InnerNavBar from '../../components/nav/InnerNavBar';
import { NEW_MAP } from '../../utils/constants/ExploreConstants';
import * as DrawActionFactory from './DrawActionFactory';

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
    console.log('save');
  }

  discardMap = () => {
    const { actions } = this.props;
    actions.discardDrawZones();
    console.log('discard');
  }

  getSelectOptions = () => {
    let options = OrderedMap().set(NEW_MAP, NEW_MAP);

    return options;
  }

  onSelect = (value) => {
    console.log('selected')
    console.log(value);
  }

  render() {

    const currentMap = NEW_MAP;

    return (
      <NavBar bottom>

        <StyledSearchableSelect
            value={currentMap}
            searchPlaceholder=""
            onSelect={this.onSelect}
            options={this.getSelectOptions()}
            openAbove
            short />

        <ButtonGroup>
          <SecondaryButton onClick={this.discardMap}>
            <Icon icon={faTrash} />
            Discard
          </SecondaryButton>
          <SecondaryButton onClick={this.saveMap}>
            <Icon icon={faSave} />
            Save
          </SecondaryButton>
        </ButtonGroup>

      </NavBar>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DrawActionFactory).forEach((action :string) => {
    actions[action] = DrawActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}


export default connect(null, mapDispatchToProps)(SavedMapNavBar);
