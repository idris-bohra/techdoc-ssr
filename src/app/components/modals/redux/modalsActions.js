import modalsActionTypes from './modalsActionTypes'

export const openModal = (modalType, modalData = null) => {
  return (dispatch) => {
    dispatch({
      type: modalsActionTypes.ON_OPEN_MODAL,
      payload: modalType,
      data: modalData
    })
  }
}

export const closeModal = () => {
  return (dispatch) => {
    dispatch({
      type: modalsActionTypes.ON_CLOSE_MODAL
    })
  }
}

export const publishData = (payload) => {
  return {
    type: modalsActionTypes.ON_PUBLISH_DOC,
    payload
  }
}

export const installModal = (event) => {
  return (dispatch) => {
    dispatch({
      type: modalsActionTypes.ON_INSTALL_MODAL,
      payload: event
    })
  }
}

export const updateStateOfCurlSlider = (payload) => {
  return (dispatch) => {
    dispatch({
      type: modalsActionTypes.ON_CURL_SLIDER_OPEN,
      payload
    })
  }
}

export default {
  openModal,
  closeModal,
  installModal,
  updateStateOfCurlSlider,
}
