/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router';

import Spinner from '../../components/spinner/Spinner';
import {
  STATE,
  AUDIT,
  EDM
} from '../../utils/constants/StateConstants';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';
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
  background-color: #1F1E24;
`;

const MainContent = styled.div`
  height: 100%;
  width: 100%;
`;

class AuditContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    const { actions, edmLoaded } = this.props;

    if (!edmLoaded) {
      actions.loadDataModel();
    }
  }

  componentDidUpdate(prevProps) {
    const { actions, edmLoaded } = this.props;

    if (!prevProps.edmLoaded && edmLoaded) {
      actions.loadAuditData();
    }
  }

  render() {

    const { isLoadingEdm, isLoadingResults } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    return (
      <Wrapper>

        <MainContent>

          <div>Audit log.</div>


        </MainContent>

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
    results: audit.get(AUDIT.RESULTS),
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditContainer));
