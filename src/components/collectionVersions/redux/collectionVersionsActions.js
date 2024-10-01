import collectionVersionsApiService from '../collectionVersionsApiService'
import versionActionTypes from './collectionVersionsActionTypes'
import pagesActionTypes from '../../pages/redux/pagesActionTypes'
import { SESSION_STORAGE_KEY } from '../../common/utility'
import collectionVersionsActionTypes from './collectionVersionsActionTypes'

export const addParentPageVersion = (newVersion, pageId, customCallback) => {
  newVersion.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    collectionVersionsApiService
      .saveParentPageVersion(pageId, newVersion)
      .then((response) => {
        dispatch(onParentPageVersionAdded(response.data))
        if (customCallback) {
          customCallback(response.data)
        }
      })
      .catch((error) => {
        dispatch(onVersionAddedError(error.response ? error.response.data : error, newVersion))
      })
  }
}

export const onParentPageVersionAdded = (response) => {
  return {
    type: pagesActionTypes.ON_PARENTPAGE_VERSION_ADDED,
    response
  }
}

export const onVersionAddedError = (error, newVersion) => {
  return {
    type: versionActionTypes.ON_VERSION_ADDED_ERROR,
    newVersion,
    error
  }
}

export const onDefaultVersion = (orgId, versionData) => {
  versionData.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    collectionVersionsApiService
      .setDefaultVersion(orgId, versionData)
      .then(() => {
        dispatch(onSetDefaultVersion(versionData))
      })
      .catch((error) => {
        dispatch(onSetDefaultVersionError(error.response ? error.response.data : error))
      })
  }
}
export const onSetDefaultVersion = (versionData) => {
  return {
    type: collectionVersionsActionTypes.ON_DEFAULT_VERSION,
    versionData
  }
}
export const onSetDefaultVersionError = (error) => {
  return {
    type: collectionVersionsActionTypes.ON_DEFAULT_VERSION_ERROR,
    error
  }
}