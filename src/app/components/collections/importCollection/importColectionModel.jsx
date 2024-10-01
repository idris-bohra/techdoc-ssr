import React from 'react';
import { Modal } from 'react-bootstrap';
import DragAndDropUploader from '../../common/dragAndDropModel/DragAndDropUploader';

const ImportCollectionModal = ({ show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Collection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DragAndDropUploader importType='collection'  onClose={onClose} />
      </Modal.Body>
    </Modal>
  );
};

export default ImportCollectionModal;
