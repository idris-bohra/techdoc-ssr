import collectionsActionTypes from './collectionsActionTypes'
import publicEndpointsActionTypes from '../../publicEndpoint/redux/publicEndpointsActionTypes'
import { toast } from 'react-toastify'
import versionActionTypes from '../../collectionVersions/redux/collectionVersionsActionTypes'
import generalActionsTypes from '../../redux/generalActionTypes'

const initialState = {}

function collectionsReducer(state = initialState, action) {
  let collections = {}
  switch (action.type) {
    case versionActionTypes.IMPORT_VERSION:
      if (action.response.collection) {
        return {
          ...state,
          [action.response.collection.id]: action.response.collection
        }
      }
      return { ...state }

    case collectionsActionTypes.ON_COLLECTIONS_FETCHED:
      const collectionState = state
      const obj = action.collections || {}
      const data = {}
      try {
        const keyArray = Object.keys(obj) || []
        keyArray.forEach((key) => {
          if (collectionState?.[key]) data[key] = { ...collectionState[key], ...obj[key] }
          else data[key] = { ...obj[key] }
        })
      } catch (error) {
        console.error(error)
      }
      return { ...data }

    case collectionsActionTypes.ON_COLLECTIONS_FETCHED_ERROR:
      return state

    case collectionsActionTypes.ADD_COLLECTION_REQUEST:
      return {
        ...state,
        [action.newCollection.requestId]: action.newCollection
      }

    case collectionsActionTypes.ON_COLLECTION_ADDED: {
      collections = { ...state }
      delete collections[action.response.requestId]
      const { page, ...newCollection } = action.response
      collections[action.response.id] = newCollection
      return collections
    }

    case collectionsActionTypes.ON_COLLECTION_ADDED_ERROR:
      toast.error(action.error)
      collections = { ...state }
      delete collections[action.newCollection.requestId]
      return collections

    case collectionsActionTypes.UPDATE_COLLECTION_REQUEST:
      return {
        ...state,
        [action.editedCollection.id]: action.editedCollection
      }

    case collectionsActionTypes.ON_COLLECTION_UPDATED:
      const updatedCollection = {
        ...state[action.response.id],
        ...action.response
      }
      return {
        ...state,
        [action.response.id]: updatedCollection
      }

    case collectionsActionTypes.ON_COLLECTION_UPDATED_ERROR:
      toast.error(action.error)
      return {
        ...state,
        [action.originalCollection.id]: action.originalCollection
      }

    case collectionsActionTypes.DELETE_COLLECTION_REQUEST:
      collections = { ...state }
      delete collections[action.collection.id]
      return collections

    case collectionsActionTypes.ON_COLLECTION_DELETED:
      return state

    case collectionsActionTypes.ON_COLLECTION_DELETED_ERROR:
      toast.error(action.error)
      if (action.error?.status === 404) return state
      return {
        ...state,
        [action.collection.id]: action.collection
      }

    case collectionsActionTypes.ON_COLLECTION_DUPLICATED: {
      collections = { ...state }
      const collection = action.response.collection
      collections = { ...collections, [collection.id]: collection }
      return collections
    }

    case collectionsActionTypes.ON_COLLECTION_DUPLICATED_ERROR:
      toast.error(action.error)
      return state

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...state, ...action.data.collections }

    case collectionsActionTypes.ON_PUBLIC_COLLECTION_FETCHED:
      return { ...action.data.collections }

    case collectionsActionTypes.ON_PUBLIC_COLLECTION_FETCHED_ERROR:
      toast.error(action.error)
      return state

    case collectionsActionTypes.IMPORT_COLLECTION_REQUEST:
      return {
        ...state,
        [action.collection.id]: action.collection
      }

    case collectionsActionTypes.ON_COLLECTION_IMPORTED:
      return {
        ...state,
        [action.collection.id]: {
          ...state[action.collection.id],
          ...action.collection
        }
      }

    case collectionsActionTypes.ON_COLLECTION_IMPORTED_ERROR:
      if (action.collection && action.collection.id) {
        const updatedCollections = { ...state }
        delete updatedCollections[action.collection.id]
        return updatedCollections
      }
      return state

    case generalActionsTypes.ADD_COLLECTIONS:
      return { ...action.data }

    default:
      return state
  }
}

export default collectionsReducer
