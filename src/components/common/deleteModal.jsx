import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { closeTab } from '../tabs/redux/tabsActions'
import { onEnter } from './utility'
import { deleteEnvironment } from '../environments/redux/environmentsActions'
import { deleteCollection } from '../collections/redux/collectionsActions'
import { deletePage } from '../pages/redux/pagesActions'

const mapDispatchToProps = (dispatch) => {
  return {
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    delete_environment: (deletedEnvironment) => dispatch(deleteEnvironment(deletedEnvironment)),
    delete_collection: (collection) => dispatch(deleteCollection(collection)),
    delete_page: (page) => dispatch(deletePage(page))
  }
}

class DeleteModal extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.doSubmit()
  }

  doSubmit() {
    this.props.onHide()
    const { title } = this.props
    if (title === 'Delete Collection') {
      const { deleted_collection: collection } = this.props
      this.props.delete_collection(collection, this.props)
    }
    if (title === 'Remove Collection') {
      const { deleted_collection: collection } = this.props
      this.props.remove_public_collection(collection, this.props)
    }
    if (title === 'Delete Version' || title === 'Delete Page') {
      const { deletedPage: page } = this.props
      this.props.delete_page(page, this.props)
    }
    if (title === 'Delete Endpoint') {
      const { deleted_endpoint: endpoint } = this.props
      this.props.handle_delete(endpoint)
    }
    if (title === 'Delete Environment') {
      const { deleted_environment: environment } = this.props
      this.props.delete_environment(environment)
    }
    if (title === 'Delete Sample Response') {
      const sampleResponseArray = [...this.props.endpointContent.sampleResponseArray]
      const sampleResponseFlagArray = [...this.props.sample_response_flag_array]
      const index = this.props.index
      sampleResponseArray.splice(index, 1)
      sampleResponseFlagArray.splice(index, 1)
      this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
    }

    if (title === 'Delete Domain' || title === 'Delete Cookie') {
      this.props.handleEntityDelete()
    }
  }

  render() {
    return (
      <div onKeyPress={(e) => onEnter(e, this.doSubmit.bind(this))}>
        <Modal {...this.props} animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body id='custom-delete-modal-body'>
            <div>
              <p>{this.props.message}</p>
            </div>
            <div className='text-left'>
              <form onSubmit={this.handleSubmit}>
                <button id='custom-delete-modal-delete' className='btn btn-danger btn-sm font-12 mr-2'>
                  {this.props.title === 'Remove Collection' ? 'Remove' : 'Delete'}
                </button>
                <button id='custom-delete-modal-cancel' className='btn btn-secondary outline btn-sm font-12' onClick={this.props.onHide}>
                  Cancel
                </button>
              </form>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(DeleteModal)
