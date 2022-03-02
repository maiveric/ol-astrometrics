/*
 * @flow
 */

import React from 'react';

import Papa from 'papaparse';
import styled, { css } from 'styled-components';
import { List, Map, OrderedMap } from 'immutable';
import { DateTimePicker } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import {
  withRouter
} from 'react-router';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownload } from '@fortawesome/pro-light-svg-icons';

import * as AuditActionFactory from './AuditActionFactory';

import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import SearchableSelect from '../../components/controls/SearchableSelect';
import Spinner from '../../components/spinner/Spinner';
import StyledInput from '../../components/controls/StyledInput';
import FileSaver from '../../utils/FileSaver';
import * as EdmActionFactory from '../edm/EdmActionFactory';
import { Cell, HeaderCell, Table } from '../../components/body/Table';
import { SEARCH_REASONS } from '../../utils/constants/DataConstants';
import {
  AUDIT,
  AUDIT_EVENT,
  EDM,
  STATE
} from '../../utils/constants/StateConstants';

type Props = {
  edmLoaded :boolean;
  isLoadingEdm :boolean;
  isLoadingResults :boolean;
  results :List<*>;
  startDate :Object,
  endDate :Object,
  filters :Map,
  edm :Map<*, *>;
  actions :{
    loadAuditData :(startDate :Object, endDate :Object) => void;
    loadDataModel :() => void;
    updateAuditEnd :(value :string) => void;
    updateAuditStart :(value :string) => void;
    updateAuditFilter :(value :string) => void;
    resetFilters :() => void;
    applyFilters :() => void;
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

const FilterRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 20px;

  article {
    width: 32%;
  }

`;

const DownloadButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin: 10px 0;

  button {
    padding: 10px 15px;
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
    min-height: 29px;
  }
`;

const cellStyle = css`
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

const StyledCell = styled(Cell)`${cellStyle}`;
const StyledHeaderCell = styled(HeaderCell)`${cellStyle}`;

const DoubleInputSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  article {
    width: 48%;
  }

  button {
    width: 48%;
  }
`;

const ButtonText = styled.span`
  margin-left: 5px;
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

  formatISODate = (date) => date.format('YYYY-MM-DD');

  renderFilters = () => {
    const {
      actions,
      filters,
      startDate,
      endDate
    } = this.props;

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
              <DoubleInputSection>

                <article>
                  <DateTimePicker
                      onChange={actions.updateAuditStart}
                      value={this.formatISODate(startDate)} />
                </article>

                <article>
                  <DateTimePicker
                      disableFuture
                      onChange={actions.updateAuditEnd}
                      value={this.formatISODate(endDate)} />
                </article>

              </DoubleInputSection>
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
              <DoubleInputSection>
                <BasicButton onClick={actions.resetFilters}>
                  Clear
                </BasicButton>
                <InfoButton onClick={actions.applyFilters}>
                  Filter
                </InfoButton>
              </DoubleInputSection>
            </InputGroup>
          </article>

        </FilterRow>

      </>
    );
  }

  renderRow = (auditEvent) => (
    <tr key={auditEvent.get(AUDIT_EVENT.ID, '')}>
      <StyledCell>{auditEvent.get(AUDIT_EVENT.DATE_TIME, '').format('YYYY-MM-DD HH:mm')}</StyledCell>
      <StyledCell>{auditEvent.get(AUDIT_EVENT.PERSON_ID, '')}</StyledCell>
      <StyledCell>{auditEvent.get(AUDIT_EVENT.REASON, '')}</StyledCell>
      <StyledCell>{auditEvent.get(AUDIT_EVENT.CASE_NUMBER, '')}</StyledCell>
      <StyledCell>{auditEvent.get(AUDIT_EVENT.PLATE, '')}</StyledCell>
    </tr>
  )

  renderTable = () => {
    const { results } = this.props;

    return (
      <Table>
        <tbody>
          <tr>
            <StyledHeaderCell>Timestamp</StyledHeaderCell>
            <StyledHeaderCell>Email</StyledHeaderCell>
            <StyledHeaderCell>Search purpose</StyledHeaderCell>
            <StyledHeaderCell>Case number</StyledHeaderCell>
            <StyledHeaderCell>License plate</StyledHeaderCell>
          </tr>
          {results.map(this.renderRow)}
        </tbody>
      </Table>
    );
  }

  renderDownloadButton = () => {
    const { results } = this.props;

    const disabled = !results.size;

    const onDownload = () => {

      const formattedResults = results.map((auditEvent) => ({
        Timestamp: auditEvent.get(AUDIT_EVENT.DATE_TIME, '').format('YYYY-MM-DD HH:mm'),
        Email: auditEvent.get(AUDIT_EVENT.PERSON_ID, ''),
        'Search purpose': auditEvent.get(AUDIT_EVENT.REASON, ''),
        'Case number': auditEvent.get(AUDIT_EVENT.CASE_NUMBER, ''),
        'License plate': auditEvent.get(AUDIT_EVENT.PLATE, '')
      })).toJS();

      FileSaver.saveFile(Papa.unparse(formattedResults), 'ALPR_Audit_Log', 'csv');
    };

    return (
      <DownloadButtonRow>
        <BasicButton disabled={disabled} onClick={onDownload}>
          <FontAwesomeIcon icon={faCloudDownload} />
          <ButtonText>Download</ButtonText>
        </BasicButton>
      </DownloadButtonRow>
    );
  }

  render() {
    const { isLoadingEdm, isLoadingResults } = this.props;

    if (isLoadingEdm || isLoadingResults) {
      return <Wrapper><Spinner /></Wrapper>;
    }

    return (
      <Wrapper>

        {this.renderFilters()}
        {this.renderDownloadButton()}
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
