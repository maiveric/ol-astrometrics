import React, { forwardRef } from 'react';
import styled from 'styled-components';
import ModalDialog, { ModalFooter, ModalTransition } from '@atlaskit/modal-dialog';

const bodyStyles = {
  backgroundColor: '#1F1E24',
  color: '#ffffff',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
};

const ModalBody = forwardRef((props, ref) => {
  const { children } = props;
  return (
    <div ref={ref} style={bodyStyles}>
      {children}
    </div>
  );
});

const Header = styled.div`
  font-weight: 600;
  font-size: 18px;
  line-height: 150%;
  margin-bottom: 32px;
`;

const Modal = ({
  isOpen,
  onClose,
  header,
  children
}) => (
  <ModalTransition>
    {isOpen && (
      <ModalDialog onClose={onClose} components={{ Body: ModalBody }}>
        {header ? <Header>{header}</Header> : null}
        {children}
      </ModalDialog>
    )}
  </ModalTransition>
);

export default Modal;
