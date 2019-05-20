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
import BasicButton from '../../components/buttons/BasicButton';
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
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, getSearchTerm } from '../../utils/DataUtils';
import * as AlertActionFactory from './AlertActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  alerts :List,
  isLoadingAlerts :boolean,
  isSubmitting :boolean,
  caseNum :string,
  searchReason :string,
  plate :string,
  expirationDate :string,
  readsEntitySetId :string,
  platePropertyTypeId :string,
  parameters :Map,
  edm :Map,
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
  color: #135;
  font-size: 18px;
  font-weight: 600;
`;

const ModalSubtitle = styled.div`
  color: #8e929b;
  font-style: italic;
  font-size: 14px;
  margin: ${props => (props.adjustTop ? '-20px 0 20px 0' : '-10px 0 10px 0')};
`;

const SubHeader = styled(ModalHeader)`
  font-size: 14px;
`;

const DateTimePickerWrapper = styled.div`
  width: 100%;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 0;
`;

const SpinnerWrapper = styled.div`
  margin: 30px;
  padding: 30px;
  position: relative;
`;

const InputHeader = styled.span`
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 5px 0;
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  width: 100%;
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
  margin-bottom: 20px;
`;

const Alert = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 14px;
  color: ${props => (props.expired ? '#b6bbc7' : '#135')};

  span {
    font-size: 12px;
    width: 100%;
    text-align: center;
  }

  b {
    font-size: 16px;
    font-weight: 600;
  }

  div {
    margin-bottom: 4px;
  }

  padding: 10px 0;
  margin: 10px 0;
  border-bottom: 1px solid #dcdce7;
`;

const NoAlerts = styled.div`
  width: 100%;
  text-align: center;
  margin: 20px 0;
  font-size: 14px;
  color: #8e929b;
`;

class ManageAlertsContainer extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      isSettingNewAlert: false
    };
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
        licensePlate: plate
      }
    };

    actions.createAlert(alert);

    this.setState({ isSettingNewAlert: false });
  }

  renderEmailSubtitle = (adjustTop) => {
    const { email } = AuthUtils.getUserInfo();
    return <ModalSubtitle adjustTop={adjustTop}>{`Alerts will be sent to ${email}`}</ModalSubtitle>;
  }

  renderForm = () => {
    const {
      caseNum,
      searchReason,
      plate,
      expirationDate
    } = this.props;

    const canSubmit = caseNum
      && searchReason
      && expirationDate
      && moment(expirationDate).isValid()
      && plate
      && plate.length > 3;

    return (
      <FormContainer>
        <EvenlySpacedRow>
          <ModalHeader>Create new alert</ModalHeader>
        </EvenlySpacedRow>
        {this.renderEmailSubtitle()}

        <InputHeader>Case number</InputHeader>
        <StyledInput value={caseNum} onChange={this.getOnChange(ALERTS.CASE_NUMBER)} />

        <InputHeader>Search reason</InputHeader>
        <StyledSearchableSelect
            value={searchReason}
            searchPlaceholder="Select"
            onSelect={this.getOnChange(ALERTS.SEARCH_REASON, true)}
            options={this.getAsMap(SEARCH_REASONS)}
            selectOnly
            transparent
            short />

        <InputHeader>Full license plate</InputHeader>
        <StyledInput value={plate} onChange={this.getOnChange(ALERTS.PLATE, false, true)} />

        <InputHeader>Alert expiration date and time</InputHeader>
        <DateTimePickerWrapper>
          <DateTimePicker
              onChange={this.getOnChange(ALERTS.EXPIRATION, true)}
              value={expirationDate}
              dateFormat="MM/DD/YYYY"
              datePickerSelectProps={{
                placeholder: `e.g. ${moment().format('MM/DD/YYYY')}`,
              }} />
        </DateTimePickerWrapper>
        <CenteredRow>
          <SecondaryButton onClick={() => this.setState({ isSettingNewAlert: false })}>Cancel</SecondaryButton>
          <InfoButton disabled={!canSubmit} onClick={this.createAlert}>Create Alert</InfoButton>
        </CenteredRow>

      </FormContainer>
    );
  }

  getExpiration = alert => moment(alert.get('expiration', ''));

  sortAlerts = (a1, a2) => {
    const dt1 = this.getExpiration(a1);
    const dt2 = this.getExpiration(a2);
    return dt1.isValid() && dt1.isAfter(dt2) ? -1 : 1;
  }

  expireAlert = (alert) => {
    const { actions, edm } = this.props;
    const entityKeyId = getEntityKeyId(alert);
    const entitySetId = edm.getIn([EDM.ENTITY_SETS, ENTITY_SETS.ALERTS, 'id']);
    const values = alert.set(PROPERTY_TYPES.END_DATE_TIME, List.of(moment().toISOString(true))).toJS();
    actions.replaceEntity({
      entitySetId,
      entityKeyId,
      values,
      callback: () => actions.loadAlerts({ edm })
    });
  }

  renderAlerts = (sortedAlerts, expired) => {
    const { actions } = this.props;

    if (!sortedAlerts.size) {
      return <NoAlerts>{`No ${expired ? 'expired' : 'active'} alerts`}</NoAlerts>;
    }

    return sortedAlerts.map((alert) => {
      let expiration = moment(alert.get('expiration', ''));
      const alertMetadata = alert.get('alertMetadata', Map());

      expiration = expiration.isValid() ? expiration.format('MM/DD/YYYY hh:mm a') : 'Invalid expiration date';

      return (
        <Alert expired={expired} key={alert.get('id')}>
          <span>{`Expire${expired ? 'd' : 's'} ${expiration}`}</span>
          <div>License plate: <b>{alertMetadata.get('licensePlate')}</b></div>
          <div>Case number: <b>{alertMetadata.get('caseNum')}</b></div>
          <div>Search Reason: <b>{alertMetadata.get('searchReason')}</b></div>
          {
            expired ? null : (
              <CenteredRow>
                <BasicButton onClick={() => actions.expireAlert(alert.get('id'))}>Expire alert</BasicButton>
              </CenteredRow>
            )
          }
        </Alert>
      );
    });
  }

  renderAlertList = () => {
    const { alerts } = this.props;

    let content = <NoAlerts>You have not set any alerts.</NoAlerts>;

    if (alerts.size) {
      const now = moment();

      let active = List();
      let inactive = List();

      alerts.forEach((alert) => {
        const dateTime = this.getExpiration(alert);
        if (dateTime.isValid() && dateTime.isAfter(now)) {
          active = active.push(alert);
        }
        else {
          inactive = inactive.push(alert);
        }
      });

      active = active.sort(this.sortAlerts);
      inactive = inactive.sort(this.sortAlerts);

      content = (
        <>
          <SubHeader>Active alerts</SubHeader>
          {this.renderAlerts(active, false)}
          <SubHeader>Expired alerts</SubHeader>
          {this.renderAlerts(inactive, true)}
        </>
      );
    }

    const now = moment();

    let active = List();
    let inactive = List();

    alerts.forEach((alert) => {
      const dateTime = this.getExpiration(alert);
      if (dateTime.isValid() && dateTime.isAfter(now)) {
        active = active.push(alert);
      }
      else {
        inactive = inactive.push(alert);
      }
    });

    active = active.sort(this.sortAlerts);
    inactive = inactive.sort(this.sortAlerts);

    return (
      <FormContainer>
        <EvenlySpacedRow>
          <ModalHeader>Manage existing alerts</ModalHeader>
          <SecondaryButton onClick={() => this.setState({ isSettingNewAlert: true })}>Create new alert</SecondaryButton>
        </EvenlySpacedRow>
        {this.renderEmailSubtitle(true)}
        {content}
      </FormContainer>
    );
  }

  render() {
    const { isLoadingAlerts, isSubmitting } = this.props;
    const { isSettingNewAlert } = this.state;

    if (isLoadingAlerts || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    return (
      <div>
        {isSettingNewAlert ? this.renderForm() : this.renderAlertList()}
      </div>
    );
  }


}

function mapStateToProps(state :Map<*, *>) :Object {
  const alerts = state.get(STATE.ALERTS);
  const parameters = state.get(STATE.PARAMETERS);
  const edm = state.get(STATE.EDM);
  const submit = state.get(STATE.SUBMIT);

  return {
    alerts: alerts.get(ALERTS.ALERT_LIST),
    isLoadingAlerts: alerts.get(ALERTS.IS_LOADING_ALERTS),
    caseNum: alerts.get(ALERTS.CASE_NUMBER),
    searchReason: alerts.get(ALERTS.SEARCH_REASON),
    plate: alerts.get(ALERTS.PLATE),
    expirationDate: alerts.get(ALERTS.EXPIRATION),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
    readsEntitySetId: edm.getIn([EDM.ENTITY_SETS, ENTITY_SETS.RECORDS, 'id']),
    platePropertyTypeId: edm.getIn([EDM.PROPERTY_TYPES, PROPERTY_TYPES.PLATE, 'id']),
    isSubmitting: submit.get(SUBMIT.SUBMITTING),
    edm
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageAlertsContainer));
