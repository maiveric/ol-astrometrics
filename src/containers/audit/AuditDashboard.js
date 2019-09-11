/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  withRouter
} from 'react-router';

import StyledInput from '../../components/controls/StyledInput';
import Spinner from '../../components/spinner/Spinner';
import {
  STATE,
  AUDIT,
  EDM
} from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
import * as Routes from '../../core/router/Routes';
import * as AuditActionFactory from './AuditActionFactory';
import * as EdmActionFactory from '../edm/EdmActionFactory';

type Props = {
  edmLoaded :boolean;
  isLoadingEdm :boolean;
  isLoadingResults :boolean;
  results :List<*>;
  startDate :Object,
  endDate :Object,
  filter :string,
  edm :Map<*, *>;
  actions :{
    loadAuditData :(startDate :Object, endDate :Object) => void;
    loadDataModel :() => void;
    updateAuditEnd :(value :string) => void;
    updateAuditStart :(value :string) => void;
    updateAuditFilter :(value :string) => void;
  }
};

type State = {
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;


class AuditDashboard extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
    };
  }

  onFilterChange = ({ target }) => {
    const { actions } = this.props;
    const { value } = target;

    actions.updateAuditFilter(value);
  }


  render() {

    const {
      isLoadingEdm,
      isLoadingResults,
      edmLoaded,
      results,
      filter
    } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    return (
      <Wrapper>


        <div>Audit dashboard.</div>

        <div>Edm loaded?</div>
        <div>{edmLoaded}</div>
        <div>{`${edmLoaded}`}</div>

        <StyledInput value={filter} onChange={this.onFilterChange} />

      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const audit = state.get(STATE.AUDIT);
  const edm = state.get(STATE.EDM);

  return {
    edmLoaded: edm.get(EDM.EDM_LOADED),
    isLoadingEdm: edm.get(EDM.IS_LOADING_DATA_MODEL),

    isLoadingResults: audit.get(AUDIT.IS_LOADING_RESULTS),
    results: audit.get(AUDIT.FILTERED_RESULTS),
    startDate: audit.get(AUDIT.START_DATE),
    endDate: audit.get(AUDIT.END_DATE),
    filter: audit.get(AUDIT.FILTER)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AuditActionFactory).forEach((action :string) => {
    actions[action] = AuditActionFactory[action];
  });

  Object.keys(EdmActionFactory).forEach((action :string) => {
    actions[action] = EdmActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditDashboard));
