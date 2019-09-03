import styled, { css } from 'styled-components';

import { SIDEBAR_WIDTH, HEADER_HEIGHT, INNER_NAV_BAR_HEIGHT } from '../../core/style/Sizes';

export default styled.div`
  position: fixed;
  right: 0;
  z-index: 10;
  width: 100%;
  height: ${INNER_NAV_BAR_HEIGHT}px;
  background-color: #1F1E24;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: calc(100% - ${SIDEBAR_WIDTH}px);
  ${props => (
    props.bottom
      ? css`
        border-top: 1px solid #36353B;
        bottom: 0;
      `
      : css`
        border-bottom: 1px solid #36353B;
        top: ${HEADER_HEIGHT}px;
      `
  )}
`;
