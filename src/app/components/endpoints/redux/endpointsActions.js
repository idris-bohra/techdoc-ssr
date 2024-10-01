import { toast } from 'react-toastify'
import { store } from '../../../store/store'
import endpointApiService from '../endpointApiService'
import endpointsActionTypes from './endpointsActionTypes'
import { getOrgId, operationsAfterDeletion, deleteAllPagesAndTabsAndReactQueryData, SESSION_STORAGE_KEY } from '../../common/utility'
import shortid from 'shortid'
import pagesActionTypes from '../../pages/redux/pagesActionTypes'
import { addChildInParent } from '../../pages/redux/pagesActions'
import { replaceTabForUntitled } from '../../tabs/redux/tabsActions'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'

export const formatResponseToSend = (response) => {
  return {
    id: response.data.id,
    requestType: response.data.requestType,
    name: response.data.name,
    urlName: response.data.urlName,
    parentId: response.data.parentId,
    child: [],
    state: response.data.state,
    isPublished: response.data.isPublished,
    type: response.data.type || 4,
    versionId: response.data.versionId || null,
    collectionId: response.data.collectionId,
    protocolType: response.data.protocolType
  }
}

export const addEndpoint = (navigate, newEndpoint, rootParentId, customCallback, props) => {
  newEndpoint.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  const orgId = getOrgId()
  return (dispatch) => {
    const prevCurrentTabId = store.getState()?.tabs?.activeTabId
    endpointApiService
      .saveEndpoint(rootParentId, { ...newEndpoint })
      .then(async (response) => {
        const responseToSend = formatResponseToSend(response)
        const data = await dispatch(addChildInParent(responseToSend))
        navigate(`/orgs/${orgId}/dashboard/endpoint/${data?.payload?.id}`)
        if (props?.params?.endpointId === 'new') {
          dispatch(replaceTabForUntitled(data.payload.id, prevCurrentTabId))
        }
        if (customCallback) {
          customCallback({ closeForm: true, stopLoader: true })
        }
      })
      .catch((error) => {
        if (customCallback) {
          customCallback({ closeForm: false, stopLoader: true })
        }
      })
  }
}

export const addExampleRequest = (navigate, id,editedEndpoint=null, customCallback) => {
  if(editedEndpoint == null){
    editedEndpoint = {};
    editedEndpoint.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  }
  editedEndpoint.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  const orgId = getOrgId()
  return (dispatch) => {
    endpointApiService
      .addExampleRequest(id, { ...editedEndpoint })
      .then(async (response) => {
        const responseToSend = formatResponseToSend(response)
        const data = await dispatch(addChildInParent(responseToSend))
        navigate(`/orgs/${orgId}/dashboard/endpoint/${data?.payload?.id}`)
        if (customCallback) {
          customCallback({ closeForm: true, stopLoader: true })
        }
      })
      .catch((error) => {
        if (customCallback) {
          customCallback({ closeForm: false, stopLoader: true })
        }
      })
  }
}

export const updateEndpoint = (editedEndpoint, stopSaveLoader) => {
  return (dispatch) => {
    // const originalEndpoint = JSON.parse(JSON.stringify(store.getState().endpoints[editedEndpoint.id]))
    // dispatch(updateEndpointRequest(editedEndpoint))
    const id = editedEndpoint.id
    const updatedEndpoint = editedEndpoint
    delete updatedEndpoint.id
    delete updatedEndpoint.groupId
    endpointApiService
      .updateEndpoint(id, updatedEndpoint)
      .then((response) => {
        // dispatch(onEndpointUpdated(response.data))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
      })
      .catch((error) => {
        // dispatch(onEndpointUpdatedError(error.response ? error.response.data : error, originalEndpoint))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
      })
  }
}

export const deleteEndpoint = (endpoint) => {
  endpoint.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    endpointApiService
      .deleteEndpoint(endpoint.id, endpoint)
      .then((res) => {
        deleteAllPagesAndTabsAndReactQueryData(endpoint.id)
          .then((data) => {
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES, data: data.pages })
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_TABS, data: data.tabs })

            // after deletion operation
            operationsAfterDeletion(data)
            toast.success('Endpoint Deleted Successfully')
          })
          .catch((error) => {
            console.error('Can not delete endpoint', error)
          })
      })
      .catch((error) => {
        dispatch(onEndpointDeletedError(error.response, endpoint))
      })
  }
}

export const duplicateEndpoint = (endpoint) => {
  return (dispatch) => {
    endpointApiService
      .duplicateEndpoint(endpoint.id)
      .then((response) => {
        const responseToSend = formatResponseToSend(response)
        dispatch(onEndpointDuplicated(responseToSend))
      })
      .catch((error) => {
        toast.error(error)
      })
  }
}

export const moveEndpoint = (endpointId, sourceGroupId, destinationGroupId) => {
  return (dispatch) => {
    dispatch(moveEndpointRequest(endpointId, sourceGroupId, destinationGroupId))

    endpointApiService.moveEndpoint(endpointId, { groupId: destinationGroupId }).then((response) => {
      dispatch(moveEndpointSuccess(response.data))
    })
  }
}

export const moveEndpointRequest = (endpointId, sourceGroupId, destinationGroupId) => {
  return {
    type: endpointsActionTypes.MOVE_ENDPOINT_REQUEST,
    endpointId,
    sourceGroupId,
    destinationGroupId
  }
}

export const moveEndpointSuccess = (response) => {
  return {
    type: endpointsActionTypes.MOVE_ENDPOINT_SUCCESS,
    response
  }
}

export const onEndpointAddedError = (error, newEndpoint, requestId) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_ADDED_ERROR,
    newEndpoint,
    error,
    requestId
  }
}

export const onEndpointUpdatedError = (error, originalEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR,
    error,
    originalEndpoint
  }
}

export const deleteEndpointRequest = (endpoint) => {
  return {
    type: pagesActionTypes.DELETE_ENDPOINT_REQUEST,
    endpoint
  }
}

export const onEndpointDeleted = (response) => {
  return {
    type: pagesActionTypes.ON_ENDPOINT_DELETED,
    response
  }
}

export const onEndpointDeletedError = (error, endpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DELETED_ERROR,
    error,
    endpoint
  }
}

export const onEndpointDuplicated = (response) => {
  return {
    type: pagesActionTypes.ON_ENDPOINT_DUPLICATED,
    response
  }
}
