/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Map, OrderedMap, Set } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';

import Spinner from '../../components/spinner/Spinner';
import SubtleButton from '../../components/buttons/SubtleButton';
import DeleteButton from '../../components/buttons/DeleteButton';
import { VehicleHeader } from '../../components/vehicles/VehicleCard';
import {
  STATE,
  REPORT,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getValue } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as ReportActionFactory from './ReportActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

type Props = {
  isSubmitting :boolean,
  isRemovingEntireVehicle :boolean,
  entitySetId :string,
  read :Map,
  readsToRemove :Set,
  actions :{
    toggleDeleteReadsModal :(isOpen :boolean) => void,
    deleteEntities :(
      entityKeyId :string,
      entitySetId :string,
      values :Object,
      callback :Function
    ) => void
  }
}

const ModalHeader = styled.div`
  font-size: 20px;
  font-weight: 600;
  line-height: 150%;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 0;
  width: 100%;
`;

const SpinnerWrapper = styled.div`
  margin: 30px;
  padding: 30px;
  position: relative;
  width: 100%;
  height: 100%;
`;

const SectionRow = styled.div`
  width: ${props => (props.rowCount ? ((100 / props.rowCount) - 1) : 100)}%;
  padding-bottom: ${props => (props.unpad ? 6 : 32)}px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  button {
    width: fit-content;
  }
`;

const CenteredRow = styled(Row)`
  justify-content: center;
  margin-top: 20px;

  button {
    margin: 0 10px;
    width: 50%;
  }
`;

const ReportDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 150%;
  font-weight: 600;
  font-size: 14px;

  span {
    color: #807f85;
    padding-left: 10px;
  }
`;

const Text = styled.div`
  font-size: 14px;
`;

class DeleteVehicleReadsModal extends React.Component<Props, State> {

  getOnChange = (field, noEventObj, filterWildcards) => {
    const { actions } = this.props;
    return (e) => {
      let value = noEventObj ? e : e.target.value;
      if (value && filterWildcards) {
        value = value.replace(/\*/g, '');
      }
      actions.setReportValue({ field, value });
    };
  }

  getAsMap = (valueList) => {
    let options = OrderedMap();
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  onDelete = () => {
    const { actions, readsToRemove, entitySetId } = this.props;

    actions.deleteEntities({
      entitySetId,
      entityKeyIds: readsToRemove.toJS(),
      callback: () => {
        actions.toggleDeleteReadsModal(false);
        actions.loadReports();
      }
    });
  }

  render() {
    const {
      readsToRemove,
      isSubmitting,
      actions,
      read,
      isRemovingEntireVehicle
    } = this.props;

    if (!readsToRemove.size) {
      return null;
    }

    const plate = getValue(read, PROPERTY_TYPES.PLATE);
    const state = getValue(read, PROPERTY_TYPES.STATE, 'CA');
    const dateTime = moment(getValue(read, PROPERTY_TYPES.TIMESTAMP)).format('MM/DD/YYYY hh:mm a');

    const vehiclePrefix = isRemovingEntireVehicle
      ? 'This will remove the vehicle and related reads from the report. '
      : '';
    const infoText = `${vehiclePrefix}You will not be able to undo this action.`;

    if (isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    return (
      <FormContainer>
        <SectionRow>
          <ModalHeader>{`Delete ${isRemovingEntireVehicle ? 'vehicle' : 'read'}?`}</ModalHeader>
        </SectionRow>


        <SectionRow unpad={!isRemovingEntireVehicle}>
          <ReportDetails>
            <VehicleHeader state={state} plate={plate} noPadding />
          </ReportDetails>
        </SectionRow>

        { isRemovingEntireVehicle ? null : (
          <SectionRow>
            <ReportDetails>
              <div>{dateTime}</div>
            </ReportDetails>
          </SectionRow>
        )}

        <SectionRow>
          <Text>{infoText}</Text>
        </SectionRow>

        <SectionRow>
          <CenteredRow>
            <SubtleButton onClick={() => actions.toggleDeleteReadsModal(false)}>Cancel</SubtleButton>
            <DeleteButton onClick={this.onDelete}>Remove</DeleteButton>
          </CenteredRow>
        </SectionRow>

      </FormContainer>
    );
  }

}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const reports = state.get(STATE.REPORT);
  const submit = state.get(STATE.SUBMIT);

  const entityKeyId = reports.get(REPORT.SELECTED_REPORT);
  const reportReads = reports.getIn([REPORT.READS_BY_REPORT, entityKeyId], Set());
  const readAssocEntityKeyId = reports.get(REPORT.READS_TO_DELETE).first();
  const readNeighborToRemove = reportReads
    .find(n => n.getIn(['associationDetails', OPENLATTICE_ID_FQN, 0]) === readAssocEntityKeyId);
  const read = readNeighborToRemove ? readNeighborToRemove.get('neighborDetails', Map()) : null;

  return {
    entitySetId: getEntitySetId(app, APP_TYPES.REGISTERED_FOR),
    isRemovingEntireVehicle: reports.get(REPORT.IS_REMOVING_ENTIRE_VEHICLE),
    readsToRemove: reports.get(REPORT.READS_TO_DELETE),
    read,
    isSubmitting: submit.get(SUBMIT.SUBMITTING)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ReportActionFactory).forEach((action :string) => {
    actions[action] = ReportActionFactory[action];
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

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DeleteVehicleReadsModal));
