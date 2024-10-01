import clientDataActionTypes from './clientDataActionTypes'

export const addIsExpandedAction = (payload) => {
  return {
    type: clientDataActionTypes.ADD_IS_EXPANDED,
    payload
  }
}

export const setDefaultversionId = (payload) => {
  return {
    type: clientDataActionTypes.DEFAULT_VERSION_ID,
    payload
  }
}

export const updataForIsPublished = (payload) => {
  return {
    type: clientDataActionTypes.UPDATE_FOR_ISPUBLISH,
    payload
  }
}

export const updateEndpointCheckStatus = (payload) => {
  return {
    type: clientDataActionTypes.UDPATE_ENDPOINT_CHECK_STATUS,
    payload
  }
}

export const updateAllEndpointCheckStatus = (payload) => {
  return {
    type: clientDataActionTypes.UPDATE_ALL_ENDPOINTS_CHECK_STATUS,
    payload
  }
}