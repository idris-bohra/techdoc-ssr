import React from 'react'
import DeleteModal from '../common/deleteModal'

function showDeleteEndpointModal(props, handleDelete, onHide, title, message, selectedEndpoint) {
  return (
    <DeleteModal
      {...props}
      handle_delete={handleDelete}
      show
      onHide={onHide}
      title={title}
      message={message}
      deleted_endpoint={selectedEndpoint}
    />
  )
}

export default {
  showDeleteEndpointModal
}
