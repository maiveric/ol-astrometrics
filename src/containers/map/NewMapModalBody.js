import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { STATE, DRAW } from '../../utils/constants/StateConstants';

import StyledInput from '../../components/controls/StyledInput';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import SubtleButton from '../../components/buttons/SubtleButton';

import * as DrawActionFactory from './DrawActionFactory';

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: 40px;
  width: 100%;

  button {
    max-width: 113px;

    &:last-child {
      margin-left: 10px;
    }
  }
`;

const Label = styled.span`
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  margin-bottom: 8px;
`;

const NewMapModalBody = ({
  actions,
  newMapName
}) => {

  const onInputChange = ({ target }) => {
    actions.editMapName(target.value);
  };

  const clearAndClose = () => {
    actions.editMapName('');
    actions.toggleCreateNewMap(false);
  };

  return (
    <>
      <Label>Name of the map</Label>
      <StyledInput value={newMapName} onChange={onInputChange} />
      <ButtonRow>
        <SubtleButton onClick={clearAndClose}>Cancel</SubtleButton>
        <SecondaryButton onClick={actions.saveMap}>Save</SecondaryButton>
      </ButtonRow>
    </>
  );
};

function mapStateToProps(state :Map<*, *>) :Object {
  const draw = state.get(STATE.DRAW);

  return {
    newMapName: draw.get(DRAW.NEW_MAP_NAME)
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(NewMapModalBody);
