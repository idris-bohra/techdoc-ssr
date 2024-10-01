import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'

function ConfirmationModal(props) {

  const handleSave = () => {
    props.proceed_button_callback()
    props.onHide()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Modal onHide={props.onHide} show={props.show} animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title className='font-16'>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body id='custom-delete-modal-body'>
        <div className='text-left mt-4 mb-2'>
          <button id='custom-delete-modal-delete'
            className='btn btn-primary btn-sm font-12'
            onClick={() => handleSave()}
            onKeyDown={handleKeyDown}
            autoFocus
          >
            {props.submitButton || 'Yes'}
          </button>

          <button id='custom-delete-modal-cancel' className='btn btn-danger btn-sm font-12 ml-2' onClick={() => props.onHide()}>
            {props.rejectButton || 'No'}
          </button>
        </div>
      </Modal.Body>
    </Modal >
  )
}

export default ConfirmationModal
