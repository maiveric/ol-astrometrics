import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  STATE,
  DRAW,
  SEARCH_PARAMETERS,
  PARAMETERS
} from '../../utils/constants/StateConstants';

import StyledInput from '../../components/controls/StyledInput';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import SubtleButton from '../../components/buttons/SubtleButton';
import Spinner from '../../components/spinner/Spinner';

import * as DrawActionFactory from './DrawActionFactory';
import * as ParametersActionFactory from '../parameters/ParametersActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

const Input = styled(StyledInput)`
  margin-bottom: 10px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: 30px;
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
  isSubmitting,
  newMapName,
  caseNumber
}) => {

  if (isSubmitting) {
    return <Spinner light />;
  }

  const onInputChange = ({ target }) => {
    actions.editMapName(target.value);
  };

  const onCaseNumberChange = ({ target }) => {

    actions.updateSearchParameters({
      field: PARAMETERS.CASE_NUMBER,
      value: target.value
    });

  };

  const clearAndClose = () => {
    actions.editMapName('');
    actions.toggleCreateNewMap(false);
  };

  const isReadyToSubmit = () => {
    return newMapName && caseNumber;
  };

  return (
    <>
      <Label>Case number</Label>
      <Input value={caseNumber} onChange={onCaseNumberChange} />
      <Label>Name of the map</Label>
      <Input value={newMapName} onChange={onInputChange} />
      <ButtonRow>
        <SubtleButton onClick={clearAndClose}>Cancel</SubtleButton>
        <SecondaryButton onClick={actions.saveMap} disabled={!isReadyToSubmit()}>Save</SecondaryButton>
      </ButtonRow>
    </>
  );
};

function mapStateToProps(state :Map<*, *>) :Object {
  const draw = state.get(STATE.DRAW);
  const params = state.get(STATE.PARAMETERS);

  return {
    newMapName: draw.get(DRAW.NEW_MAP_NAME),
    caseNumber: params.getIn([SEARCH_PARAMETERS.SEARCH_PARAMETERS, PARAMETERS.CASE_NUMBER], ''),
    isSubmitting: draw.get(DRAW.IS_SAVING_MAP)
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

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewMapModalBody);
