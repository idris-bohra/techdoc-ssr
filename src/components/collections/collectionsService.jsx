import React from 'react'
import DeleteModal from '../common/deleteModal'
import MoveModal from '../common/moveModal/moveModal'

function showDeleteCollectionModal(props, onHide, title, message, selectedCollection) {
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deleted_collection={selectedCollection} />
}

function showMoveCollectionModal() {
  return <MoveModal title={'title'} />
}

export default {
  showDeleteCollectionModal,
  showMoveCollectionModal
}
