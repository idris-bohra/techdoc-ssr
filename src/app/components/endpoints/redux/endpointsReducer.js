import endpointsActionTypes from './endpointsActionTypes'
import { toast } from 'react-toastify'
import versionActionTypes from '../../collectionVersions/redux/collectionVersionsActionTypes'
import collectionActionTypes from '../../collections/redux/collectionsActionTypes'
import publicEndpointsActionTypes from '../../publicEndpoint/redux/publicEndpointsActionTypes'

const initialState = {}

function endpointsReducer(state = initialState, action) {
  let endpoints = {}
  switch (action.type) {
    case endpointsActionTypes.MOVE_ENDPOINT_REQUEST:
      endpoints = { ...state }
      endpoints[action.endpointId].groupId = action.destinationGroupId
      return endpoints

    case endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR:
      toast.error(action.error)
      return {
        ...state,
        [action.originalEndpoint.id]: action.originalEndpoint
      }
    case versionActionTypes.ON_VERSION_DUPLICATED:
      return { ...state, ...action.response.endpoints }

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.endpoints }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...action.data.endpoints }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED_ERROR:
      toast.error(action.error)
      return state

    case publicEndpointsActionTypes.ON_ENDPOINT_STATE_ERROR:
      toast.error(action.error)
      return { ...state }

    case collectionActionTypes.ON_COLLECTION_DELETED:
    case versionActionTypes.ON_VERSION_DELETED:
      endpoints = { ...state }
      action.payload.endpointIds.forEach((eId) => {
        delete endpoints[eId]
      })
      return endpoints

    default:
      return state
  }
}

export default endpointsReducer
