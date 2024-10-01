import React from 'react'
import DeleteModal from '../common/deleteModal'

function showDeletePageModal(props, onHide, title, message, selectedPage) {
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deletedPage={selectedPage} />
}

export default {
  showDeletePageModal
}
