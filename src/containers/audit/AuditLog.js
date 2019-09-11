/*
 * @flow
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { List, Map, OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  withRouter
} from 'react-router';

import SearchableSelect from '../../components/controls/SearchableSelect';
import StyledInput from '../../components/controls/StyledInput';
import Spinner from '../../components/spinner/Spinner';
import {
  STATE,
  AUDIT,
  AUDIT_EVENT,
  EDM
} from '../../utils/constants/StateConstants';
import { SEARCH_REASONS } from '../../utils/constants/DataConstants';
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
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const AuditTable = styled.table.attrs({
  cellspacing: 0
})`

`;

const cellStyle = css`
  font-size: 14px;
  border-bottom: 1px solid #36353B;
  padding: 8px;

  &:nth-child(1) {
    width: 130px;
  }

  &:nth-child(2) {
    width: 300px;
  }

  &:nth-child(3) {
    width: 130px;
  }

  &:nth-child(4) {
    width: 150px;
  }

  &:nth-child(5) {
    width: 90px;
  }
`;

const Cell = styled.td`
  ${cellStyle}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderCell = styled.th`
  ${cellStyle}

  color: #807F85;
  font-weight: normal;
  text-align: left;
`;

const FilterRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  article {
    width: 32%;
  }
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  p {
    font-weight: 500;
    font-size: 12px;
    margin: 0;
    padding-bottom: 5px;
  }
`;


class AuditLog extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
    };
  }

  onFilterChange = ({ target }) => {
    const { actions } = this.props;
    const { name: field, value } = target;

    actions.updateAuditFilter({ field, value });
  }

  getAsMap = (valueList) => {
    let options = OrderedMap().set('', 'All');
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  renderFilters = () => {
    const { actions, filters } = this.props;

    return (
      <>

        <FilterRow>

          <article>
            <InputGroup>
              <p>Email</p>
              <StyledInput
                  name={AUDIT_EVENT.PERSON_ID}
                  value={filters.get(AUDIT_EVENT.PERSON_ID)}
                  onChange={this.onFilterChange} />
            </InputGroup>
          </article>

          <article>
            <InputGroup>
              <p>Date range</p>
            </InputGroup>
          </article>

          <article>
            <InputGroup>
              <p>Search purpose</p>
            </InputGroup>
            <SearchableSelect
                value={filters.get(AUDIT_EVENT.REASON)}
                searchPlaceholder="Select"
                onSelect={value => actions.updateAuditFilter({ value, field: AUDIT_EVENT.REASON })}
                onClear={() => actions.updateAuditFilter({ value: '', field: AUDIT_EVENT.REASON })}
                options={this.getAsMap(SEARCH_REASONS)}
                selectOnly
                short />
          </article>

        </FilterRow>

        <FilterRow>

          <article>
            <InputGroup>
              <p>Case number</p>
            </InputGroup>
            <StyledInput
                name={AUDIT_EVENT.CASE_NUMBER}
                value={filters.get(AUDIT_EVENT.CASE_NUMBER)}
                onChange={this.onFilterChange} />
          </article>

          <article>
            <InputGroup>
              <p>License plate</p>
            </InputGroup>
            <StyledInput
                name={AUDIT_EVENT.PLATE}
                value={filters.get(AUDIT_EVENT.PLATE)}
                onChange={this.onFilterChange} />
          </article>

          <article>
            <InputGroup>
              <p />
            </InputGroup>
          </article>

        </FilterRow>

      </>
    )
  }

  renderRow = auditEvent => (
    <tr key={auditEvent.get(AUDIT_EVENT.ID, '')}>
      <Cell>{auditEvent.get(AUDIT_EVENT.DATE_TIME, '').format('YYYY-MM-DD HH:mm')}</Cell>
      <Cell>{auditEvent.get(AUDIT_EVENT.PERSON_ID, '')}</Cell>
      <Cell>{auditEvent.get(AUDIT_EVENT.REASON, '')}</Cell>
      <Cell>{auditEvent.get(AUDIT_EVENT.CASE_NUMBER, '')}</Cell>
      <Cell>{auditEvent.get(AUDIT_EVENT.PLATE, '')}</Cell>
    </tr>
  )

  renderTable = () => {
    const { results } = this.props;

    return (
      <AuditTable>
        <tbody>
          <tr>
            <HeaderCell>Timestamp</HeaderCell>
            <HeaderCell>Email</HeaderCell>
            <HeaderCell>Search purpose</HeaderCell>
            <HeaderCell>Case number</HeaderCell>
            <HeaderCell>License plate</HeaderCell>
          </tr>
          {results.map(this.renderRow)}
        </tbody>
      </AuditTable>
    );
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

        {this.renderFilters()}
        {this.renderTable()}

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
    filters: audit.get(AUDIT.FILTER)
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditLog));
