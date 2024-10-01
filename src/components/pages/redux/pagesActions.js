import { toast } from 'react-toastify'
import { store } from '../../../store/store'
import pageApiService from '../pageApiService'
import pagesActionTypes from './pagesActionTypes'
import { operationsAfterDeletion, deleteAllPagesAndTabsAndReactQueryData, SESSION_STORAGE_KEY } from '../../common/utility'
import endpointApiService from '../../endpoints/endpointApiService'
import endpointsActionTypes from '../../endpoints/redux/endpointsActionTypes'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'
import { navigateTo } from '../../../navigationService'
import { getCurrentOrg } from '../../auth/authServiceV2'
import tabsActionTypes from '../../tabs/redux/tabsActionTypes'
import { onPageStateSuccess } from '../../publicEndpoint/redux/publicEndpointsActions'
import { replaceTab } from '../../tabs/redux/tabsActions'

export const updateEndpoint = (editedEndpoint, stopSaveLoader) => {
  return (dispatch) => {
    const id = editedEndpoint.id
    const updatedEndpoint = editedEndpoint
    delete updatedEndpoint.id

    endpointApiService
      .updateEndpoint(id, updatedEndpoint)
      .then((response) => {
        dispatch(onEndpointUpdated(response.data))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
        toast.success('Endpoint updated successfully')
      })
      .catch((error) => {
        // dispatch(onEndpointUpdatedError(error.response ? error.response.data : error, originalEndpoint))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
      })
  }
}

export const onEndpointUpdatedError = (error, originalEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR,
    error,
    originalEndpoint
  }
}

export const updatePageName = (id, updatedName) => {
  const dataToSend = { name: updatedName }
  return async (dispatch) => {
    const res = await pageApiService.updatePage(id, dataToSend)
    if (res) {
      dispatch({
        type: pagesActionTypes.ON_PAGE_RENAME,
        payload: { id, updatedName }
      })
    }
  }
}

export const updatePageContent = (id, content, name) => {
  return async (dispatch) => {
    const dataToSend = { name, contents: content }
    await pageApiService.updatePage(id, dataToSend)
    dispatch({ type: tabsActionTypes.DELETE_TAB_NAME, payload: { id } })
    dispatch({ type: tabsActionTypes.SET_TAB_MODIFIED, payload: { id, flag: false } })
    dispatch(onPageStateSuccess({ id, isPublished: false }))
  }
}

export const updatePage = (editedPage) => {
  editedPage.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    const dataToSend = {
      name: editedPage.name,
      urlName: editedPage.urlName,
      contents: editedPage?.contents || null,
      state: editedPage.state,
      collectionId: editedPage.collectionId,
      urlMappingFlag: editedPage.urlMappingFlag,
      prevUrlName: editedPage.prevUrlName
    }
    pageApiService
      .updatePage(editedPage.id, dataToSend)
      .then((response) => {
        if (response.data.newUrlMapping) {
          const oldUrls = store.getState().pages?.[editedPage.id]?.oldUrls
          oldUrls[response.data.newUrlMapping.id] = response.data.newUrlMapping.oldUrl
          dispatch(onPageUpdated({ ...response.data.updatedPage, oldUrls }))
          return response.data.updatedPage
        }
        dispatch(onPageUpdated(response.data))
        toast.success('Updated successfully')
        return response.data
      })
      .catch((error) => {
        toast.error(error.message)
      })
  }
}

export const updatePageRequest = (editedPage) => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_REQUEST,
    editedPage
  }
}

export const onPageUpdated = (response) => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED,
    response
  }
}

export const onPageUpdatedError = (error, originalPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED_ERROR,
    error,
    originalPage
  }
}

export const updateContent = async ({ pageData, id }) => {
  delete pageData.id
  delete pageData.versionId
  try {
    const data = await pageApiService.updatePage(id, pageData)
    return data.data
  } catch (error) {
    console.error(error)
  }
}

export const updateEndpointRequest = (editedEndpoint) => {
  return {
    type: pagesActionTypes.UPDATE_ENDPOINT_REQUEST,
    editedEndpoint
  }
}

export const onEndpointUpdated = (response) => {
  return {
    type: pagesActionTypes.ON_ENDPOINT_UPDATED,
    response
  }
}

export const addPage = (rootParentId, newPage, pageId) => {
  newPage.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  const orgId = getCurrentOrg()?.id
  return (dispatch) => {
    pageApiService
      .saveCollectionPage(rootParentId, newPage)
      .then((response) => {
        const data = response.data.page
        dispatch(onParentPageAdded(response.data))
        const newTab = { id: data.id, type: "page", status: "SAVED", previewMode: false, isModified: false }
        dispatch(replaceTab(pageId, newTab))
        navigateTo(`/orgs/${orgId}/dashboard/page/${data.id}`)
      })
      .catch((error) => {
        dispatch(onPageAddedError(error.response ? error.response.data : error, newPage))
      })
  }
}

export const addPageRequestInCollection = (rootParentId, newPage) => {
  return {
    type: pagesActionTypes.ADD_PARENT_PAGE_REQUEST,
    rootParentId,
    newPage
  }
}

export const onParentPageAdded = (response) => {
  return {
    type: pagesActionTypes.ON_PARENT_PAGE_ADDED,
    page: response.page,
    version: response.version
  }
}

export const onPageAddedError = (error, newPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_ADDED_ERROR,
    newPage,
    error
  }
}

export const deletePage = (page) => {
  page.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    pageApiService
      .deletePage(page?.id, page)
      .then((res) => {
        deleteAllPagesAndTabsAndReactQueryData(page.id)
          .then((data) => {
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES, data: data.pages })
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_TABS, data: data.tabs })

            // after deletion operation
            operationsAfterDeletion(data)
            toast.success('Deleted succesfully')
          })
          .catch((error) => {
            console.error(error)
          })
      })
      .catch((error) => {
        dispatch(onPageDeletedError(error.response, page))
      })
  }
}

const deletePageAndChildren = (pageId, tabs, pageIds = []) => {
  const pages = store.getState().pages
  if (pages[pageId]) {
    pages[pageId].child.forEach((childPageId) => {
      const newPageIds = [...pageIds, childPageId]
      deletePageAndChildren(childPageId, tabs, newPageIds)
    })
    delete pages[pageId]
  }
  return pages
}

export const deletePageRequest = (page) => {
  return {
    type: pagesActionTypes.DELETE_PAGE_REQUEST,
    page
  }
}

export const onPageDeleted = (page) => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED,
    page
  }
}

export const onPageDeletedError = (error, page) => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED_ERROR,
    error,
    page
  }
}

export const duplicatePage = (page) => {
  return (dispatch) => {
    pageApiService
      .duplicatePage(page.id)
      .then((response) => {
        dispatch(onPageDuplicated(response.data))
      })
      .catch((error) => {
        toast.error(error)
      })
  }
}

export const onPageDuplicated = (response) => {
  return {
    type: pagesActionTypes.ON_PAGE_DUPLICATED,
    response
  }
}

export const updatePageOrder = (pagesOrder) => {
  return (dispatch) => {
    const originalPages = JSON.parse(JSON.stringify(store.getState().pages))
    dispatch(updatePageOrderRequest({ ...store.getState().pages }, pagesOrder))
    pageApiService
      .updatePageOrder(pagesOrder)
      .then((response) => {
        toast.success(response.data)
      })
      .catch((error) => {
        dispatch(onPageOrderUpdatedError(error.response ? error.response.data : error, originalPages))
      })
  }
}

export const updatePageOrderRequest = (pages, pagesOrder) => {
  for (let i = 0; i < pagesOrder.length; i++) {
    pages[pagesOrder[i]].position = i
  }
  return {
    type: pagesActionTypes.ON_PAGES_ORDER_UPDATED,
    pages
  }
}

export const onPageOrderUpdatedError = (error, pages) => {
  return {
    type: pagesActionTypes.ON_PAGES_ORDER_UPDATED_ERROR,
    pages,
    error
  }
}

export const updatePageContentData = (payload) => {
  return {
    type: pagesActionTypes.UPDATE_CONTENT_OF_PAGE,
    payload
  }
}

export const updatePageData = (payload) => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_DATA,
    payload: {
      pageId: payload.pageId,
      data: payload.data
    }
  }
}


export const addChildInParent = (payload) => {
  return {
    type: pagesActionTypes.ADD_CHILD_IN_PARENT,
    payload
  }
}

export const updateNameOfPages = (id, name) => {
  const dataToSend = { name: name }
  return async (dispatch) => {
    const res = await endpointApiService.updateEndpoint(id, dataToSend)
    if (res) {
      dispatch({
        type: pagesActionTypes.UPDATE_NAME_OF_PAGE,
        payload: { id, name }
      })
    }
  }
}


export const addOldUrlOfPage = (payload) => {
  return {
    type: pagesActionTypes.ADD_OLD_URL,
    payload
  }
}

export const deleteOldUrlOfPage = (payload) => {
  return {
    type: pagesActionTypes.DELETE_OLD_URL,
    payload
  }
}

export const updateDragDrop = (draggedId, droppedOnId, pageIds) => {
  let uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    pageApiService
      .dragAndDropApi({ draggedId, droppedOnId, uniqueTabId, pageIds })
      .then((response) => {
        if (response.status == 200) {
          dispatch({
            type: pagesActionTypes.ON_DRAG_DROP,
            payload: response.data
          })
          toast.success('Moved succesfully')
        } else {
          toast.error(response?.data)
        }
      })
      .catch((error) => {
        console.error('Error occurred during drag and drop:', error)
      })
  }
}
