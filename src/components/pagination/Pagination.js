/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';

const PageList = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  list-style: none;
  margin-top: 20px;

  li:last-child {
    width: 24px;
  }
`;

const PageListItem = styled.li`
  width: ${props => ((props.disabled) ? '0' : 'auto')};
  visibility: ${props => ((props.disabled) ? 'hidden' : '')};

  a {
    color: ${props => (props.active ? 'rgb(26,16,59)' : '#e4d8ff')};
    background-color: ${props => (props.active ? '#e4d8ff' : '')};
    border-radius: ${props => (props.active ? '2px' : '')};
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
  }

  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  onChangePage :() => void,
  numPages :number,
  activePage :number
}

// pagination start page is START_PAGE
const START_PAGE = 1;
// only MAX_PAGE_DISPLAY pages are displayed in the pagination controls.
const MAX_PAGE_DISPLAY = 4;
// if the active page is less than SHIFT_THRESHOLD,
// the pages displayed in the pagination controls does not shift.
const SHIFT_THRESHOLD = 3;

const Pagination = (props :Props) => {

  const { numPages } = props;
  const { activePage } = props;
  const { onChangePage } = props;
  const frontArrowDisabled = activePage === 1;
  const frontJumpDisabled = (activePage <= SHIFT_THRESHOLD) || (numPages <= MAX_PAGE_DISPLAY);
  const backArrowDisabled = activePage === numPages;
  const backJumpDisabled = (activePage > numPages - SHIFT_THRESHOLD) || (numPages <= MAX_PAGE_DISPLAY);

  if (!numPages || numPages <= 1) {
    return null;
  }
  // `pages` is an array that controls which pages are displayed in the pagination controls
  let pages;
  let start = START_PAGE;
  let end;
  // If the page count is less than the MAX_PAGE_DISPLAY,
  // the page count (numPages) will control `pages`.
  if (numPages <= MAX_PAGE_DISPLAY) {
    pages = [...Array(numPages).keys()].map(v => start + v);
  }
  // If the page count is greater than the MAX_PAGE_DISPLAY and the active page is less than 4,
  // `pages` does not shift.
  else if (activePage < SHIFT_THRESHOLD) {
    end = MAX_PAGE_DISPLAY;
    pages = [...Array(1 + (end - start)).keys()].map(v => start + v);
  }
  // If the page count is greater than the MAX_PAGE_DISPLAY and the active page is greater than 4,
  // `pages` shifts based on an offset from the current page. The offset is half of the MAX_PAGE_DISPLAY.
  else {
    start = activePage - Math.floor(MAX_PAGE_DISPLAY / 2);
    if (!frontJumpDisabled) start += 1;
    end = activePage + Math.floor(MAX_PAGE_DISPLAY / 2);
    if (!backJumpDisabled) end -= 1;
    // if the last page number is displayed, `pages` will no longer shift;
    if (end > numPages) {
      start = numPages - SHIFT_THRESHOLD;
      end = numPages;
    }
    pages = [...Array(1 + (end - start)).keys()].map(v => start + v);
  }


  const indices = pages.map((page) => {
    const active = activePage === page;

    return (
      <PageListItem key={page} active={active}>
        <a onClick={() => onChangePage(page)}>{page}</a>
      </PageListItem>
    );
  });

  return (
    <PageList>
      <PageListItem disabled={frontArrowDisabled}>
        <a onClick={() => onChangePage(activePage - 1)}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </a>
      </PageListItem>
      <PageListItem disabled={frontJumpDisabled || frontArrowDisabled}>
        <a onClick={() => onChangePage(1)}>1</a>
      </PageListItem>
      <PageListItem disabled={frontJumpDisabled || frontArrowDisabled}>
        <a onClick={() => onChangePage(activePage - 1)}>...</a>
      </PageListItem>
      {indices}
      <PageListItem disabled={backJumpDisabled || backArrowDisabled}>
        <a onClick={() => onChangePage(activePage + 1)}>...</a>
      </PageListItem>
      <PageListItem disabled={backJumpDisabled || backArrowDisabled}>
        <a onClick={() => onChangePage(numPages)}>{numPages}</a>
      </PageListItem>
      <PageListItem disabled={backArrowDisabled}>
        <a onClick={() => onChangePage(activePage + 1)}>
          <FontAwesomeIcon icon={faAngleRight} />
        </a>
      </PageListItem>
    </PageList>
  );
};

export default Pagination;
