import React, { Component } from 'react'
import './updateStatus.scss'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { Spinner } from 'react-bootstrap'
import { isElectron, formatBytes } from '../common/utility'

const type = {
  UPDATE_AVAILABLE: 'UPDATE_AVAILABLE',
  DOWNLOAD_PROGRESS: 'DOWNLOAD_PROGRESS',
  UPDATE_DOWNLOADED: 'UPDATE_DOWNLOADED',
  ERROR: 'ERROR',
  CHECKING_FOR_UPDATES: 'CHECKING_FOR_UPDATES',
  UPDATE_NOT_AVAILABLE: 'UPDATE_NOT_AVAILABLE'
}

class UpdateStatus extends Component {
  state = {
    data: null,
    message: '',
    updateStatusDisplay: false,
    progressBar: false,
    closeButton: false,
    showSpinner: false
  }

  componentDidMount() {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('app-update-channel', this.handleAutoUpdateEvents.bind(this))
    }
  }

  handleAutoUpdateEvents(event, text) {
    let message = ''
    switch (text.type) {
      case type.UPDATE_AVAILABLE:
        message = 'Update Available'
        this.setState({ message, updateStatusDisplay: true, showSpinner: false })
        break
      case type.DOWNLOAD_PROGRESS:
        message = 'An Update is downloading'
        this.setState({ message, progressBar: true, data: text.data, updateStatusDisplay: true, showSpinner: false })
        break
      case type.UPDATE_DOWNLOADED:
        message = 'Update downloaded. Restart app to install.'
        this.setState({ message, closeButton: true, updateStatusDisplay: true, progressBar: false, showSpinner: false })
        break
      case type.ERROR:
        message = 'Somthing went wrong, while trying to update'
        this.setState({ message, showSpinner: false, updateStatusDisplay: true, closeButton: true })
        break
      case type.CHECKING_FOR_UPDATES:
        message = 'Checking For Updates'
        this.setState({ message, updateStatusDisplay: true, showSpinner: true })
        break
      case type.UPDATE_NOT_AVAILABLE:
        message = 'Already Up to Date'
        this.setState({ message, updateStatusDisplay: false, showSpinner: false })
        break
      default:
        break
    }
  }

  handleClose = () => {
    this.setState({ updateStatusDisplay: false, progressBar: false, closeButton: false })
  }

  renderProgressDetails = () => {
    const { data } = this.state
    return <small>{`${formatBytes(data.transferred)}/${formatBytes(data.total)} @ ${formatBytes(data.bytesPerSecond)}/s`}</small>
  }

  render() {
    const { showSpinner, updateStatusDisplay, progressBar, data, message, closeButton } = this.state
    return (
      <div>
        {updateStatusDisplay && (
          <div className='update-status-component px-3 py-2'>
            <div className='d-flex align-items-center'>
              {showSpinner && <Spinner className=' mr-2 ' animation='border' size='sm' />}
              <span className='m-0'>
                <strong>{message}</strong>
              </span>
            </div>

            {progressBar && (
              <>
                <ProgressBar variant='warning' now={Math.floor(data.percent)} />
                {this.renderProgressDetails()}
              </>
            )}

            {closeButton && (
              <button type='button' className='close' onClick={this.handleClose}>
                <span aria-hidden='true'>×</span>
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
}

export default UpdateStatus
