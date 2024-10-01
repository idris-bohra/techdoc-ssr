import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiBaseUrl = import.meta.env.VITE_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return import.meta.env.VITE_API_URL + `/orgs/${orgId}`
}

function collectionPagesUrl(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}`
}

function getAllPagesUrl(id) {
  return `${apiBaseUrl}/orgs/${id}/pages`
}
export function getAllPages(id) {
  return http.get(getAllPagesUrl(id))
}

export function saveCollectionPage(rootParentId, page) {
  return http.post(collectionPagesUrl(rootParentId), page)
}

export function updatePage(pageId, page) {
  const apiUrl = getApiUrl()
  return http.put(`${apiUrl}/pages/${pageId}`, page)
}

export function deletePage(pageId, page) {
  const apiUrl = getApiUrl()
  return http.delete(`${apiUrl}/pages/${pageId}`, { data: page })
}

export function duplicatePage(pageId) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/duplicatePages/${pageId}`)
}

export function updatePageOrder(pagesOrder) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/updatePagesOrder`, {
    pagesOrder: pagesOrder
  })
}

export function dragAndDropApi(body) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/dragAndDrop`, body)
}

export default {
  updatePage,
  deletePage,
  duplicatePage,
  getAllPages,
  updatePageOrder,
  saveCollectionPage,
  dragAndDropApi
}
