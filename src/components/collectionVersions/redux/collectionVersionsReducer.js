import versionActionTypes from './collectionVersionsActionTypes'
import collectionsActionTypes from '../../collections/redux/collectionsActionTypes'
import { toast } from 'react-toastify'
import publicEndpointsActionTypes from '../../publicEndpoint/redux/publicEndpointsActionTypes'

const initialState = {}

function versionsReducer(state = initialState, action) {
  let versions = {}

  switch (action.type) {
    case versionActionTypes.UPDATE_VERSION_REQUEST:
      return {
        ...state,
        [action.editedVersion.id]: action.editedVersion
      }

    case versionActionTypes.ON_VERSION_UPDATED:
      return {
        ...state,
        [action.response.id]: action.response
      }

    case versionActionTypes.ON_VERSION_UPDATED_ERROR:
      toast.error(action.error)
      return {
        ...state,
        [action.originalVersion.id]: action.originalVersion
      }

    case versionActionTypes.ON_VERSION_ADDED_ERROR:
      toast.error(action.error)
      versions = { ...state }
      delete versions[action.newVersion.requestId]
      return versions

    case versionActionTypes.ON_VERSION_DUPLICATED: {
      versions = { ...state }
      const version = action.response.version
      versions = { ...versions, [version.id]: version }
      return versions
    }

    case collectionsActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.versions }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...state, ...action.data.versions }

    default:
      return state
  }
}

export default versionsReducer
