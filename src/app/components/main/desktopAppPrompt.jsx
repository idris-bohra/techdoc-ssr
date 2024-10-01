import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { closeModal } from '../modals/redux/modalsActions'
import { connect, useDispatch } from 'react-redux'
import { DESKTOP_APP_DOWNLOAD } from '../modals/modalTypes'
import { toast } from 'react-toastify'
import withRouter from '../common/withRouter'
import { useNavigate } from 'react-router-dom'

const mapDispatchToProps = (dispatch) => {
  return {
    close_modal: () => dispatch(closeModal())
  }
}

const mapStateToProps = (state) => {
  return {
    modals: state.modals,
    tabs: state.tabs
  }
}

function DesktopAppDownloadModal(props) {
  const navigate = useNavigate()
  const [isAppInstalled, setIsAppInstalled] = useState(false)
  const shouldShowModal = !window.matchMedia('(display-mode: standalone)').matches 

  const handleDownloadClick = () => {
    
    if (props.modals.installPrompt) {
      props.modals.installPrompt.prompt()
      props.modals.installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
      })
    } else {
      toast.success('App is installed already')
      setIsAppInstalled(true)
    }
  }

  const show = shouldShowModal && props.modals.activeModal === DESKTOP_APP_DOWNLOAD 

  const onHide = () => {
    const { orgId } = props.params
    navigate(`/orgs/${orgId}/dashboard`, { replace: true })
    props.close_modal()
  }
  return (
    show && (
      <Modal {...props} backdrop='static' show centered onHide={onHide}>
        <Modal.Header className='no-header' closeButton />
        <Modal.Body className='download-app-pop'>
          {props.modals.modalData ? props.modals.modalData : <h5 className='text-center'>Seems you have already used 10 tabs.</h5>}
          <p className='max-90 mb-3'>
            We suggest you use our desktop app for a better user experience.
            <br />
            Also, enjoy other benefits like
          </p>
          <ol>
            <li>The desktop agent overcomes the Cross Object Resource Sharing (CORS) limitations of browsers</li>
            <li>Better shortcuts</li>
            <li>Dark mode</li>
            <li>Extendend capabilites</li>
          </ol>
        </Modal.Body>
        <Modal.Footer className='text-center justify-content-center'>
          <button onClick={handleDownloadClick} disabled={isAppInstalled} className='btn btn-primary'>
            Download Desktop App
          </button>
        </Modal.Footer>
      </Modal>
    )
  )
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DesktopAppDownloadModal))
