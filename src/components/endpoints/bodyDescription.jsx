import React, { Component } from 'react'
import './publicEndpoint.scss'
import DisplayBodyDescription from './displayBodyDescription'
import bodyDescriptionService from './bodyDescriptionService'
import { rawTypesEnums } from '../common/bodyTypeEnums'

class BodyDescription extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bodyDescription: null
    }
  }

  componentDidMount() {
    if (bodyDescriptionService.parseBody(this.props.body)) {
      bodyDescriptionService.handleUpdate(false, this.props)
    } else {
      if (this.props.body === '') {
        bodyDescriptionService.handleUpdate(true, this.props, 'Empty json body')
      } else bodyDescriptionService.handleUpdate(true, this.props, 'Please Enter Valid JSON')
    }
  }

  render() {
    return (
      <div>
        {this.props.body_type === rawTypesEnums.JSON && (
          <div>
            <DisplayBodyDescription body_description={this.props.body_description} {...this.props} />
          </div>
        )}
      </div>
    )
  }
}

export default BodyDescription
