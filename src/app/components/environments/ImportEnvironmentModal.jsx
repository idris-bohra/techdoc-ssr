import React from 'react';
import { Modal } from 'react-bootstrap';
import DragAndDropUploader from '../common/dragAndDropModel/DragAndDropUploader';

const ImportEnvironmentModal = ({ show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Environment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DragAndDropUploader  importType='environment' onClose={onClose} />
      </Modal.Body>
    </Modal>
  );
};

export default ImportEnvironmentModal;
