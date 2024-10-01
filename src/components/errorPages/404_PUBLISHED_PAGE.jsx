import React, { Component } from 'react'

class ERROR_404_PUBLISHED_PAGE extends Component {
  state = {}
  render() {
    const message =
      this.props.location?.error?.response?.data || this.props.error_msg || 'Content Not Found. Please Enter the url Path correctly.'
    return (
      <div className='text-center errorPage'>
        <h4>OOPS! 404</h4>
        {message ? <h3>{message}</h3> : null}
        <button
          onClick={() => {
            window.location.href = '/'
          }}
          mat-button
        >
          Return to Main Page
        </button>
      </div>
    )
  }
}

export default ERROR_404_PUBLISHED_PAGE
