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

import AlertRow from './AlertRow';
import Spinner from '../../components/spinner/Spinner';
import InfoButton from '../../components/buttons/InfoButton';
import {
  STATE,
  ALERTS,
  PARAMETERS,
  SEARCH_PARAMETERS,
  SUBMIT
} from '../../utils/constants/StateConstants';
import { SIDEBAR_WIDTH, INNER_NAV_BAR_HEIGHT } from '../../core/style/Sizes';
import * as AlertActionFactory from './AlertActionFactory';
import * as SubmitActionFactory from '../submit/SubmitActionFactory';

type Props = {
  alerts :List,
  isLoadingAlerts :boolean,
  isSubmitting :boolean,
  parameters :Map,
  actions :{
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

const Wrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: calc(100% - ${SIDEBAR_WIDTH}px);
  height: calc(100% - ${INNER_NAV_BAR_HEIGHT - 1}px);
  background-color: #1F1E24;
  color: #ffffff;
  bottom: 0;
  right: 0;
  padding: 56px 104px;
  line-height: 150%;
`;

const ModalHeader = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-size: 24px;
`;

const ModalSubtitle = styled.div`
  color: #8e929b;
  font-style: italic;
  font-size: 14px;
  margin: ${props => (props.adjustTop ? '-20px 0 20px 0' : '-10px 0 10px 0')};
`;

const SubHeader = styled(ModalHeader)`
  font-weight: 500;
  font-size: 16px;
  margin-top: 40px;
  margin-bottom: 16px;
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

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  button {
    width: fit-content;
  }
`;

const EvenlySpacedRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const NoAlerts = styled.div`
  width: 100%;
  font-size: 14px;
  color: #98979D;
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

  getAsMap = (valueList) => {
    let options = OrderedMap();
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  renderEmailSubtitle = (adjustTop) => {
    const { email } = AuthUtils.getUserInfo();
    return <ModalSubtitle adjustTop={adjustTop}>{`Alerts will be sent to ${email}`}</ModalSubtitle>;
  }

  getExpiration = alert => moment(alert.get('expiration', ''));

  sortAlerts = (a1, a2) => {
    const dt1 = this.getExpiration(a1);
    const dt2 = this.getExpiration(a2);
    return dt1.isValid() && dt1.isAfter(dt2) ? -1 : 1;
  }

  renderAlerts = (sortedAlerts, expired) => {

    if (!sortedAlerts.size) {
      return <NoAlerts>{`You have no ${expired ? 'expired' : 'active'} alerts.`}</NoAlerts>;
    }

    return sortedAlerts.map(alert => <AlertRow key={alert.get('id')} alert={alert} expired={expired} />);
  }

  renderAlertList = () => {
    const { actions, alerts } = this.props;

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

    return (
      <FormContainer>
        <EvenlySpacedRow>
          <ModalHeader>Alerts</ModalHeader>
          <InfoButton onClick={() => actions.toggleAlertModal(true)}>Create new alert</InfoButton>
        </EvenlySpacedRow>
        {content}
      </FormContainer>
    );
  }

  render() {
    const { isLoadingAlerts, isSubmitting } = this.props;

    if (isLoadingAlerts || isSubmitting) {
      return <SpinnerWrapper><Spinner /></SpinnerWrapper>;
    }

    return (
      <Wrapper>
        {this.renderAlertList()}
      </Wrapper>
    );
  }


}

function mapStateToProps(state :Map<*, *>) :Object {
  const alerts = state.get(STATE.ALERTS);
  const parameters = state.get(STATE.PARAMETERS);
  const submit = state.get(STATE.SUBMIT);

  return {
    alerts: alerts.get(ALERTS.ALERT_LIST),
    isLoadingAlerts: alerts.get(ALERTS.IS_LOADING_ALERTS),
    parameters: parameters.get(SEARCH_PARAMETERS.SEARCH_PARAMETERS),
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
