import React, { Component } from 'react'
import { isDashboardRoute, isNotDashboardOrDocView } from '../common/utility'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import SampleResponseForm from './sampleResponseForm'
import DeleteModal from '../common/deleteModal'
import { ReactComponent as DownArrow } from '../../assets/icons/downChevron.svg'
import { FiEdit } from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";
import { RiDeleteBinLine } from "react-icons/ri";

class SampleResponse extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showSampleResponseForm: {
        add: false,
        edit: false,
        delete: false
      }
    }
  }

  openAddForm(obj, index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.add = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      selectedSampleResponse: {
        ...obj
      },
      index
    })
  }

  showAddForm() {
    return (
      this.state.showSampleResponseForm.add && (
        <SampleResponseForm
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          selectedSampleResponse={this.state.selectedSampleResponse}
          index={this.state.index}
        />
      )
    )
  }

  openEditForm(obj, index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.edit = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      selectedSampleResponse: {
        ...obj
      },
      index
    })
  }

  showEditForm() {
    return (
      this.state.showSampleResponseForm.edit && (
        <SampleResponseForm
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          selectedSampleResponse={this.state.selectedSampleResponse}
          index={this.state.index}
        />
      )
    )
  }

  openDeleteForm(index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.delete = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      index
    })
  }

  showDeleteForm() {
    const msg = 'Are you sure you want to delete this sample response?'
    return (
      this.state.showSampleResponseForm.delete && (
        <DeleteModal
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          index={this.state.index}
          message={msg}
        />
      )
    )
  }

  showJSONPretty(data) {
    return <JSONPretty themeClassName='custom-json-pretty' data={data} />
  }

  showSampleResponseBody(data) {
    if (typeof data === 'object') {
      return this.showJSONPretty(data)
    } else {
      try {
        data = JSON.parse(data)
        return this.showJSONPretty(data)
      } catch (err) {
        return <pre>{data}</pre>
      }
    }
  }

  closeForm() {
    const showSampleResponseForm = { add: false, delete: false, edit: false }
    this.setState({ showSampleResponseForm })
  }

  deleteSampleResponse(sampleResponseArray, sampleResponseFlagArray, index) {
    sampleResponseArray.splice(index, 1)
    sampleResponseFlagArray.splice(index, 1)
    this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
  }

  render() {
    const sampleResponseArray = [...this.props?.endpointContent?.sampleResponseArray]
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array]
    return (
      <div
        id='sample-response'
        className={isNotDashboardOrDocView(this.props, this.props.currentView) ? 'testing-view-sample-response' : ''}
      >
        {isDashboardRoute(this.props) ? (
          <div className='add-sample-response'>
            <button className='adddescLink align-left d-flex align-items-center gap-1 icon-button px-2 py-1' onClick={() => this.openAddForm({}, null, 'Add Sample Response')}>
            <FaPlus /> Add Sample Response
            </button>
          </div>
        ) : null}
        {this.showAddForm()}
        {this.showEditForm()}
        {this.showDeleteForm()}
        {sampleResponseArray.map((obj, index) => (
          <div key={index} className='sample-response-item'>
            {isDashboardRoute(this.props) ? (
              <>
                <span
                  className='sample-response-edit cursor-pointer'
                  onClick={() =>
                    this.openDeleteForm(index, 'Delete Sample Response')
                  }
                >
                  <RiDeleteBinLine />
                </span>
                <span className='sample-response-edit cursor-pointer' onClick={() => this.openEditForm(obj, index, 'Edit Sample Response')}>
                <FiEdit />
                </span>
              </>
            ) : null}
            <div className='response-item-status'>
              {' '}
              <h2 className='heading-3'>Status</h2> : {obj.status}
            </div>
            <div className='response-item-status'>
              <h2 className='heading-3'>Description</h2> : {obj.description || ''}
            </div>
            <div className='response-item-status'>
              <h2 className='heading-3'>Body</h2> :{' '}
              {!sampleResponseFlagArray[index] && (
               <DownArrow className="arrowRight" onClick={() => this.props.open_body(index)} />

              )}
              {sampleResponseFlagArray[index] && (
                <>
                <DownArrow className="arrowRight" onClick={() => this.props.close_body(index)} />

                  {/* <img src={DownArrow} alt='down-arrow' onClick={() => this.props.close_body(index)} /> */}
                  {this.showSampleResponseBody(obj.data)}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default SampleResponse
