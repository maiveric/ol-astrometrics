import styled, { css } from 'styled-components';

export const Table = styled.table.attrs(_ => ({
  cellspacing: '0'
}))`
border-collapse: collapse;
`;

const cellStyle = css`
  font-size: 14px;
  border-bottom: 1px solid #36353B;
  padding: 8px;
`;

const lightStyle = css`
  padding: 8px 24px;
  background-color: #36353B;
  border-bottom: 1px solid #1F1E24;
`;

export const Cell = styled.td`
  ${cellStyle}
  ${props => (props.light ? lightStyle : '')}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HeaderCell = styled.th`
  ${cellStyle}
  ${props => (props.light ? lightStyle : '')}

  color: ${props => (props.light ? '#98979D' : '#807F85')};
  padding-top: 16px;
  padding-bottom: 16px;
  font-weight: normal;
  text-align: left;
`;

export const LightRow = styled.tr`
  th:first-child {
    border-radius: 3px 0 0 0;
  }
  th:last-child {
    border-radius: 0 3px 0 0;
  }

  &:last-child {

    td:first-child {
      border-radius: 0 0 0 3px;
    }

    td:last-child {
      border-radius: 0 0 3px 0;
    }

  }

`;

export default Table;
