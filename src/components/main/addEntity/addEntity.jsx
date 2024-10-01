import React, { Component } from 'react'
import Joi from 'joi-browser'
import './addEntity.scss'
import { toTitleCase } from '../../common/utility'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { ReactComponent as HelpIcon } from '../../../assets/icons/helpcircle.svg'
import { moveToNextStep } from '../../../services/widgetService'

const entityENUM = {
  endpoint: {
    key: 'endpoint',
    message: 'Add the API endpoint details from right section.',
    tooltip: ''
  },
  version: {
    key: 'version',
    message: 'Add your Page.',
    tooltip:
      'Versioning helps in maintaining API changes without breaking existing implementations. This gives consumers more choices without having to upgrade to the latest version'
  },
  page: {
    key: 'page', // rootpage
    message: 'No page added.',
    tooltip: 'Page help categorize APIs'
  },
  group: {
    key: 'group',
    message: 'No group added.',
    tooltip: 'Groups help categorize APIs'
  }
}

export class AddEntity extends Component {
  state = {
    entityName: '',
    errors: {}
  }

  schema = {
    entityName: Joi.string().required().min(2).max(30).trim().label(`${this.props.type} name`)
  }

  validate() {
    const options = { abortEarly: false }
    const { error } = Joi.validate({ entityName: this.state.entityName }, this.schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  }

  handleChange(e) {
    this.setState({ entityName: e.target.value, errors: {} })
  }

  handleSubmit(e) {
    e.preventDefault()
    if (this.props.type && this.props.type === 'endpoint') {
      const endpoint = this.props.endpoint
      const errors = this.validate()
      if (errors) {
        this.setState({ errors })
        return
      }
      endpoint.name = toTitleCase(this.state.entityName)
      this.props.addEndpoint(endpoint)
      moveToNextStep(4)
    } else {
      this.props.addNewEntity(this.props.entity)
    }
  }

  renderForm() {
    return (
      <form
        onSubmit={(e) => {
          this.handleSubmit(e)
        }}
        className='quick-add-endpoint'
      >
        <p>{entityENUM[this.props.type].message}</p>
        {this.props.type && this.props.type === 'endpoint' && (
          <div>
            <input
              name={this.props.type || 'name'}
              placeholder={this.props.placeholder}
              className='entity-input'
              value={this.state.entityName}
              onChange={(e) => {
                this.handleChange(e)
              }}
            />
            <small className='entity-name-error'> {this.state.errors.entityName}</small>
          </div>
        )}
        <div className='d-flex align-items-center'>
          <button type='submit' className='entity-submit-btn'>{`Add ${this.props.type}`}</button>
          {this.props.type && this.props.type !== 'endpoint' && this.renderToolTip(this.props.type)}
        </div>
      </form>
    )
  }

  renderEmptyMessage() {
    return (
      <div className='d-flex empty-box justify-content-between'>
        <p className='mb-0 f-12 pl-3'>{entityENUM[this.props.type].message} </p>
        {this.renderToolTip(this.props.type)}
      </div>
    )
  }

  renderToolTip(type) {
    return (
      <>
        {this.props.type !== 'endpoint' && (
          <OverlayTrigger placement='right' overlay={<Tooltip> {entityENUM[this.props.type].tooltip} </Tooltip>}>
            <HelpIcon />
          </OverlayTrigger>
        )}
      </>
    )
  }

  render() {
    return <div>{this.renderEmptyMessage()}</div>
  }
}

export default AddEntity
