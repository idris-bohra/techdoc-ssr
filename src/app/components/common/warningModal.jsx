import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'

function WarningModal({ show, onHide, title, message, ignoreButtonCallback }) {
  return (
    <Modal show={show} onHide={onHide} animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        <div className='text-right'>
          <button className='btn btn-primary btn-lg mr-2' onClick={onHide}>
            Go Back
          </button>
          <button
            className='btn btn-danger btn-lg mr-2'
            onClick={() => {
              ignoreButtonCallback()
              onHide()
            }}
          >
            Proceed
          </button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

WarningModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  ignoreButtonCallback: PropTypes.func
}

WarningModal.defaultProps = {
  title: 'Warning',
  message: "Something's Not Right, Please try again later."
}

export default WarningModal
