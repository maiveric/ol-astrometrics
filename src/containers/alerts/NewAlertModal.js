/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map, OrderedMap } from 'immutable';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthUtils } from 'lattice-auth';
import { DateTimePicker } from '@atlaskit/datetime-picker';

import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import SearchableSelect from '../../components/controls/SearchableSelect';
import SubtleButton from '../../components/buttons/SubtleButton';
import InfoButton from '../../components/buttons/InfoButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import {
  STATE,
  ALERTS,
  EDM,
  PARAMETERS,
  SEARCH_PARAMETERS,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { SEARCH_REASONS } from '../../utils/constants/DataConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getSearchTerm } from '../../utils/DataUtils';
import { getEntitySetId } from '../../utils/AppUtils';
import * as AlertActionFactory from './AlertActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  isLoadingAlerts :boolean,
  isSubmitting :boolean,
  caseNum :string,
  searchReason :string,
  plate :string,
  expirationDate :string,
  readsEntitySetId :string,
  platePropertyTypeId :string,
  parameters :Map,
  actions :{
    loadAlerts :(edm :Map) => void,
    setAlertValue :({ field :string, value :string }) => void,
    submit :(
      values :Object,
      config :Object,
      includeUserId :boolean,
      callback :Function
    ) => void,
    replaceEntity :(
      entityKeyId :string,
      entitySetId :string,
      values :Object,
      callback :Function
    ) => void
  }
}

type State = {
  isSettingNewAlert :boolean
};

const ModalHeader = styled.div`
  font-size: 20px;
  font-weight: 600;
  line-height: 150%;
`;

const ModalSubtitle = styled.div`
  color: #8e929b;
  font-style: italic;
  font-size: 14px;
  margin: ${props => (props.adjustTop ? '-20px 0 20px 0' : '-10px 0 10px 0')};
`;

const DateTimePickerWrapper = styled.div`
  width: 100%;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 0;
  width: 100%;
`;

const Accent = styled.span`
  color: #e53b36 !important;
`;

const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  &:not(:last-child) {
    border-bottom: 1px solid #36353B;
  }
  padding-top: 32px;
`;

const SpinnerWrapper = styled.div`
  margin: 30px;
  padding: 30px;
  position: relative;
`;

const InputHeader = styled.span`
  font-size: 12px;
  font-weight: 500;
  margin: 20px 0 8px 0;
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  width: 100%;
`;

const SectionRow = styled.div`
  width: 100%;
  padding-bottom: 32px;
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

const EvenlySpacedRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
`;

class ManageAlertsContainer extends React.Component<Props, State> {

  componentDidMount() {
    const { actions, parameters } = this.props;
    actions.setAlertValue({
      field: ALERTS.CASE_NUMBER,
      value: parameters.get(PARAMETERS.CASE_NUMBER, '')
    });
    actions.setAlertValue({
      field: ALERTS.SEARCH_REASON,
      value: parameters.get(PARAMETERS.REASON, '')
    });
    actions.setAlertValue({
      field: ALERTS.EXPIRATION,
      value: moment().add(1, 'month').toISOString()
    });
  }

  getOnChange = (field, noEventObj, filterWildcards) => {
    const { actions } = this.props;
    return (e) => {
      let value = noEventObj ? e : e.target.value;
      if (value && filterWildcards) {
        value = value.replace(/\*/g, '');
      }
      actions.setAlertValue({ field, value });
    };
  }

  getAsMap = (valueList) => {
    let options = OrderedMap();
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  createAlert = () => {
    const {
      actions,
      caseNum,
      searchReason,
      plate,
      expirationDate,
      readsEntitySetId,
      platePropertyTypeId
    } = this.props;

    const expirationMoment = moment(expirationDate);
    if (!expirationMoment.isValid()) {
      return;
    }

    const constraints = {
      entitySetIds: [readsEntitySetId],
      start: 0,
      maxHits: 3000,
      constraints: [
        {
          constraints: [{
            type: 'simple',
            searchTerm: getSearchTerm(platePropertyTypeId, plate)
          }]
        }
      ]
    };

    const alert = {
      expiration: expirationMoment.toISOString(true),
      type: 'ALPR_ALERT',
      constraints,
      alertMetadata: {
        caseNum,
        searchReason,
        licensePlate: plate,
        createDate: moment().toISOString(true)
      }
    };

    actions.createAlert(alert);
  }

  renderEmailSubtitle = (adjustTop) => {
    const { email } = AuthUtils.getUserInfo();
    return <ModalSubtitle adjustTop={adjustTop}>{`Alerts will be sent to ${email}`}</ModalSubtitle>;
  }

  render() {
    const {
      actions,
      caseNum,
      searchReason,
      plate,
      expirationDate,
      isLoadingAlerts,
      isSubmitting
    } = this.props;

    if (isLoadingAlerts || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    const canSubmit = caseNum
      && searchReason
      && expirationDate
      && moment(expirationDate).isValid()
      && plate
      && plate.length > 3;

    return (
      <FormContainer>
        <Section>
          <SectionRow>
            <EvenlySpacedRow>
              <ModalHeader>Create new alert</ModalHeader>
            </EvenlySpacedRow>
          </SectionRow>
        </Section>

        <Section>
          <SectionRow>
            <InputHeader>Case number</InputHeader>
            <Accent>*</Accent>
            <StyledInput value={caseNum} onChange={this.getOnChange(ALERTS.CASE_NUMBER)} />
          </SectionRow>

          <SectionRow>
            <InputHeader>Search reason</InputHeader>
            <Accent>*</Accent>
            <StyledSearchableSelect
                value={searchReason}
                searchPlaceholder="Select"
                onSelect={this.getOnChange(ALERTS.SEARCH_REASON, true)}
                options={this.getAsMap(SEARCH_REASONS)}
                selectOnly
                transparent
                short />
          </SectionRow>

          <SectionRow>
            <InputHeader>Full license plate</InputHeader>
            <Accent>*</Accent>
            <StyledInput value={plate} onChange={this.getOnChange(ALERTS.PLATE, false, true)} />
          </SectionRow>

          <SectionRow>
            <InputHeader>Alert expiration date and time</InputHeader>
            <Accent>*</Accent>
            <DateTimePickerWrapper>
              <DateTimePicker
                  onChange={this.getOnChange(ALERTS.EXPIRATION, true)}
                  value={expirationDate}
                  dateFormat="MM/DD/YYYY"
                  datePickerSelectProps={{
                    placeholder: `e.g. ${moment().format('MM/DD/YYYY')}`,
                  }} />
            </DateTimePickerWrapper>
          </SectionRow>
        </Section>

        <Section>
          <SectionRow>
            <CenteredRow>
              <SubtleButton onClick={() => actions.toggleAlertModal(false)}>Cancel</SubtleButton>
              <InfoButton disabled={!canSubmit} onClick={this.createAlert}>Create Alert</InfoButton>
            </CenteredRow>
          </SectionRow>
        </Section>

      </FormContainer>
    );
  }

}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const alerts = state.get(STATE.ALERTS);
  const parameters = state.get(STATE.PARAMETERS);
  const edm = state.get(STATE.EDM);
  const submit = state.get(STATE.SUBMIT);

  return {
    readsEntitySetId: getEntitySetId(app, APP_TYPES.RECORDS),
    isLoadingAlerts: alerts.get(ALERTS.IS_LOADING_ALERTS),
    caseNum: alerts.get(ALERTS.CASE_NUMBER),
    searchReason: alerts.get(ALERTS.SEARCH_REASON),
    plate: alerts.get(ALERTS.PLATE),
    expirationDate: alerts.get(ALERTS.EXPIRATION),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    platePropertyTypeId: edm.getIn([EDM.PROPERTY_TYPES, PROPERTY_TYPES.PLATE, 'id']),
    isSubmitting: submit.get(SUBMIT.SUBMITTING)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AlertActionFactory).forEach((action :string) => {
    actions[action] = AlertActionFactory[action];
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageAlertsContainer));
