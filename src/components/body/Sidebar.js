import styled from 'styled-components';
import { SIDEBAR_WIDTH } from '../../core/style/Sizes';

export default styled.div`
  width: ${SIDEBAR_WIDTH}px;
  height: 100%;
  position: fixed;
  z-index: 2;
  background-color: #1F1E24;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0px -5px 10px rgba(0, 0, 0, 0.25);
`;
