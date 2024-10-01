import React, { Component } from 'react'
import { ReactComponent as DocIcon } from '../../../assets/icons/doc.svg'
import { ReactComponent as ApiIcon } from '../../../assets/icons/api.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info.svg'
import shortid from 'shortid'
import Joi from 'joi-browser'
import './defaultViewModal.scss'
import { Modal, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { addNewTab } from '../../tabs/redux/tabsActions'
import { onEnter, toTitleCase, validate } from '../../common/utility'
import Form from '../../common/form'
import { addPage } from '../../pages/redux/pagesActions'
import withRouter from '../../common/withRouter'
export const defaultViewTypes = {
  TESTING: 'testing',
  DOC: 'doc'
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_new_tab: () => dispatch(addNewTab()),
    add_page: (rootParentId, newPage) => dispatch(addPage(rootParentId, newPage))
  }
}
export class DefaultViewModal extends Form {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
    this.state = {
      showPageForm: {
        addPage: false
      },
      data: {
        name: ''
      },
      errors: {
        name: ''
      }
    }

    this.schema = {
      name: Joi.string().min(1).max(100).required().label('Name'),
      contents: Joi.string().allow(null, ''),
      state: Joi.valid(0, 1, 2, 3)
    }
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.doSubmit()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showPageForm.addPage && !prevState.showPageForm.addPage) {
      if (this.inputRef.current) {
        this.inputRef.current.focus()
      }
    }
  }

  async doSubmit() {
    const errors = validate({ name: this.state.data.name }, this.schema)
    if (errors) {
      this.setState({ errors })
      return null
    }
    if (!this.state.selectedCollection && this.props.addEntity) {
      this.setState({ versionRequired: true })
      return
    }
    const collections = this.props?.selectedCollection
    this.props.onHide()
    let { name } = { ...this.state?.data }
    name = toTitleCase(name)
    if (this.props.title === 'Add Parent Page' || this.props.addEntity) {
      const rootParentId = collections?.rootParentId
      const data = { ...this.state.data, name }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props.pageType === 1 ? shortid.generate() : null,
        pageType: this.props.pageType
      }
      this.props.add_page(rootParentId, newPage)
    }

    if (this.props?.title === 'Add Page' || this.props?.title === 'Add Sub Page' || this.props?.addEntity) {
      const selectedId = this.props?.title === 'Add Page' ? this.props?.selectedVersion : this.props?.selectedPage
      const ParentId = selectedId
      const data = { ...this.state.data }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props?.pageType === 1 ? shortid.generate() : null,
        pageType: this.props?.pageType,
        state: 1
      }
      this.props.add_page(ParentId, newPage)
    }
  }
  renderCollectionDetailsForm() {
    return (
      <div className='mt-5'>
        {this.renderInput('name', 'Name', this.props.title, 'Page name', false, false, '*name accepts min 1 & max 100 characters')}
        <div className='text-left mt-4 mx-2'>
          <Button onClick={this.handleSubmit}>Submit</Button>
        </div>
      </div>
    )
  }

  renderTestingButton() {
    return (
      <button
        className='block-view-btn mr-3'
        onClick={() => {
          this.props.add_new_tab()
          this.props.onHide()
        }}
      >
        <ApiIcon/>
        {'Create API'}
      </button>
    )
  }

  renderDocButton() {
    return (
      <button
        className='block-view-btn'
        onClick={() => {
          this.setState({ showPageForm: { addPage: true } })
        }}
      >
        <DocIcon/>
        {'Create Page'}
      </button>
    )
  }

  renderButtons() {
    return (
      <>
        <div className='d-flex justify-content-center'>
          {this.renderTestingButton()}
          {this.renderDocButton()}
        </div>
        {this.state.showPageForm.addPage && this.renderCollectionDetailsForm()}
        <div className='info mt-5 d-flex align-items-center'>
         <InfoIcon className='mr-2' alt='' /> 
          <span>You can always choose to Test the API's or make the Testing API description</span>
        </div>
      </>
    )
  }

  renderInModal() {
    return (
      <div
        onKeyPress={(e) => {
          onEnter(e, this.handleKeyPress.bind(this))
        }}
      >
        <Modal
          size='sm'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
          onHide={this.props.onHide}
          show={this.props.show}
        >
          <div>
            <Modal.Header className='custom-collection-modal-container' closeButton>
              <Modal.Title id='contained-modal-title-vcenter'>{'Start adding in your collection'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{this.renderButtons()}</Modal.Body>
          </div>
        </Modal>
      </div>
    )
  }

  render() {
    return this.props.showOnlyForm ? this.renderButtons() : this.renderInModal()
  }
}

export default connect(null, mapDispatchToProps)(withRouter(DefaultViewModal))
