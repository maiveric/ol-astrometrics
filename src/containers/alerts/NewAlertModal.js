/*
 * @flow
 */

import React from 'react';

import moment from 'moment';
import styled from 'styled-components';
import { Map, OrderedMap } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { DateTimePicker } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import * as AlertActionFactory from './AlertActionFactory';

import InfoButton from '../../components/buttons/InfoButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import SearchableSelect from '../../components/controls/SearchableSelect';
import Spinner from '../../components/spinner/Spinner';
import StyledInput, { StyledTextArea } from '../../components/controls/StyledInput';
import SubtleButton from '../../components/buttons/SubtleButton';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';
import { getEntitySetId } from '../../utils/AppUtils';
import { getDateSearchTerm, getSearchTerm } from '../../utils/DataUtils';
import { SEARCH_REASONS } from '../../utils/constants/DataConstants';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import {
  ALERTS,
  EDM,
  PARAMETERS,
  SEARCH_PARAMETERS,
  STATE,
  SUBMIT
} from '../../utils/constants/StateConstants';

type Props = {
  isLoadingAlerts :boolean,
  isSubmitting :boolean,
  caseNum :string,
  searchReason :string,
  plate :string,
  expirationDate :string,
  additionalEmails :string,
  readsEntitySetId :string,
  platePropertyTypeId :string,
  timestampPropertyTypeId :string,
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
  isSettingNewAlert :boolean,
  alertType :string
};

const ALERT_TYPES = {
  CUSTOM_VEHICLE_ALERT: 'ALPR_ALERT',
  HOTLIST_ALERT: 'ALPR_HOTLIST_ALERT'
}

const ModalHeader = styled.div`
  font-size: 20px;
  font-weight: 600;
  line-height: 150%;
`;

const SubHeader = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
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
  width: 100%;
  height: 100%;
`;

const InputHeaderSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const InputHeader = styled.span`
  font-size: 12px;
  font-weight: 500;
  margin: ${(props) => (props.minPadding ? 10 : 20)}px 0 8px 0;
`;

const InputHeaderSubtitle = styled(InputHeader)`
  margin-left: 10px;
  color: #807F85;
  font-weight: normal;
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  width: 100%;
`;

const SectionRow = styled.div`
  width: ${(props) => (props.rowCount ? ((100 / props.rowCount) - 1) : 100)}%;
  padding-bottom: ${(props) => (props.paddingBottom || 32)}px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  button {
    width: fit-content;
  }
`;

const SpaceBetweenRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
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

const AlertTypeButton = styled(SecondaryButton)`
  margin: 5px 0;
  background-color: #4F4E54;
  color: #ffffff;

  &:hover {
    background-color: #605f65 !important;
  }
`;

class NewAlertModal extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      alertType: undefined
    }
  }

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

  getOnClear = (field) => {
    const { actions } = this.props;
    const value = '';
    return () => actions.setAlertValue({ field, value });
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
      additionalEmails,
      readsEntitySetId,
      platePropertyTypeId,
      timestampPropertyTypeId
    } = this.props;

    const expirationMoment = moment(expirationDate);
    if (!expirationMoment.isValid()) {
      return;
    }

    const createDate = moment().toISOString(true);

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
        },
        {
          constraints: [{
            type: 'simple',
            fuzzy: false,
            searchTerm: getDateSearchTerm(timestampPropertyTypeId, createDate, '*')
          }]
        }
      ]
    };

    let emails = additionalEmails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => !!e);
    emails = emails.filter((email, idx) => emails.indexOf(email) === idx);

    const alert = {
      expiration: expirationMoment.toISOString(true),
      type: 'ALPR_ALERT',
      constraints,
      alertMetadata: {
        caseNum,
        searchReason,
        licensePlate: plate,
        createDate
      },
      emails
    };

    actions.createAlert(alert);
  }

  getEmail = () => {
    const { email } = AuthUtils.getUserInfo();
    return email;
  }

  renderHeaderSection = (headerText) => (
    <Section>
      <SectionRow>
        <EvenlySpacedRow>
          <ModalHeader>{headerText}</ModalHeader>
        </EvenlySpacedRow>
      </SectionRow>
    </Section>
  )

  renderEmailSection = () => {
    const { additionalEmails } = this.props;

    return (
      <Section>

        <SectionRow paddingBottom={22}>
          <EvenlySpacedRow>
            <SubHeader>Email alerts</SubHeader>
          </EvenlySpacedRow>
        </SectionRow>

        <SectionRow paddingBottom={1}>
          <InputHeader minPadding>{`Alerts will be sent to ${this.getEmail()}`}</InputHeader>
        </SectionRow>

        <SectionRow>
          <InputHeaderSection>
            <InputHeader minPadding>Additional emails</InputHeader>
            <InputHeaderSubtitle minPadding>Separate emails with commas</InputHeaderSubtitle>
          </InputHeaderSection>
          <StyledTextArea value={additionalEmails} onChange={this.getOnChange(ALERTS.ADDITIONAL_EMAILS)} />
        </SectionRow>

      </Section>
    )
  }

  renderSubmitOrCancel = () => {
    const {
      actions,
      caseNum,
      searchReason,
      plate,
      expirationDate,
      county
    } = this.props;
    const { alertType } = this.state;

    let canSubmit = false;

    if (alertType === ALERT_TYPES.CUSTOM_VEHICLE_ALERT) {
      canSubmit = caseNum
        && searchReason
        && expirationDate
        && moment(expirationDate).isValid()
        && plate
        && plate.length > 3;
    }

    if (alertType === ALERT_TYPES.HOTLIST_ALERT) {
      canSubmit = county
        && expirationDate
        && moment(expirationDate).isValid();
    }

    return (
      <Section>
        <SectionRow>
          <CenteredRow>
            <SubtleButton onClick={() => actions.toggleAlertModal(false)}>Cancel</SubtleButton>
            <InfoButton disabled={!canSubmit} onClick={this.createAlert}>Create Alert</InfoButton>
          </CenteredRow>
        </SectionRow>
      </Section>
    )
  }

  renderCustomAlertFields = () => {
    const {
      actions,
      caseNum,
      searchReason,
      plate,
      expirationDate,
      additionalEmails,
      isLoadingAlerts,
      isSubmitting
    } = this.props;

    return (
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
              options={this.getAsMap(SEARCH_REASONS)}
              onSelect={this.getOnChange(ALERTS.SEARCH_REASON, true)}
              onClear={this.getOnClear(ALERTS.SEARCH_REASON)}
              selectOnly
              transparent
              short />
        </SectionRow>

        <SpaceBetweenRow>

          <SectionRow rowCount={2}>
            <InputHeader>Full license plate</InputHeader>
            <Accent>*</Accent>
            <StyledInput value={plate} onChange={this.getOnChange(ALERTS.PLATE, false, true)} />
          </SectionRow>

          <SectionRow rowCount={2}>
            <InputHeader>Alert expiration date and time</InputHeader>
            <Accent>*</Accent>
            <DateTimePickerWrapper>
              <DateTimePicker
                  minDate={moment().add(1, 'day').toISOString()}
                  onChange={this.getOnChange(ALERTS.EXPIRATION, true)}
                  value={expirationDate} />
            </DateTimePickerWrapper>
          </SectionRow>

        </SpaceBetweenRow>
      </Section>
    );
  }

  renderHotlistFields = () => {
    const {
      actions,
      caseNum,
      searchReason,
      plate,
      expirationDate,
      additionalEmails,
      isLoadingAlerts,
      isSubmitting,
      county
    } = this.props;

    return (
      <Section>
        <SectionRow>
          <InputHeader>County</InputHeader>
          <Accent>*</Accent>
          <StyledInput value={caseNum} onChange={this.getOnChange(ALERTS.CASE_NUMBER)} />
        </SectionRow>

        <SpaceBetweenRow>

          <SectionRow>
            <InputHeader>Alert expiration date</InputHeader>
            <Accent>*</Accent>
            <DateTimePickerWrapper>
              <DateTimePicker
                  minDate={moment().add(1, 'day').toISOString()}
                  onChange={this.getOnChange(ALERTS.EXPIRATION, true)}
                  value={expirationDate} />
            </DateTimePickerWrapper>
          </SectionRow>

        </SpaceBetweenRow>
      </Section>
    )
  }

  renderAlertTypeButton = (text, alertType) => {
    const onClick = () => this.setState({ alertType });
    return <AlertTypeButton onClick={onClick}>{text}</AlertTypeButton>;
  }

  render() {
    const { isLoadingAlerts, isSubmitting } = this.props;
    const { alertType } = this.state;

    if (isLoadingAlerts || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    if (!alertType) {
      return (
        <FormContainer>
          {this.renderHeaderSection('New Alert')}
          {this.renderAlertTypeButton('Hotlist Alert', ALERT_TYPES.HOTLIST_ALERT)}
          {this.renderAlertTypeButton('Custom Vehicle Alert', ALERT_TYPES.CUSTOM_VEHICLE_ALERT)}
        </FormContainer>
      )
    }

    if (alertType === ALERT_TYPES.CUSTOM_VEHICLE_ALERT) {
      return (
        <FormContainer>
          {this.renderHeaderSection('Create new custom vehicle alert')}
          {this.renderCustomAlertFields()}
          {this.renderEmailSection()}
          {this.renderSubmitOrCancel()}
        </FormContainer>
      );
    }

    return (
      <FormContainer>
        {this.renderHeaderSection('Create new hotlist alert')}
        {this.renderHotlistFields()}
        {this.renderEmailSection()}
        {this.renderSubmitOrCancel()}
      </FormContainer>
    )
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
    additionalEmails: alerts.get(ALERTS.ADDITIONAL_EMAILS),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    platePropertyTypeId: edm.getIn([EDM.PROPERTY_TYPES, PROPERTY_TYPES.PLATE, 'id']),
    timestampPropertyTypeId: edm.getIn([EDM.PROPERTY_TYPES, PROPERTY_TYPES.TIMESTAMP, 'id']),
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewAlertModal));
