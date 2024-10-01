import http from '../../services/httpService'
import httpService from '../../services/endpointHttpService'
import { getOrgId } from '../common/utility'

const apiUrl = import.meta.env.VITE_API_URL
const orgId = getOrgId()

function getApiEndpoint() {
const orgId = getOrgId()
  return `${apiUrl}/orgs/${orgId}/collections`
}

function collectionUrl(id) {
  const apiEndpoint = getApiEndpoint(orgId)
  return `${apiEndpoint}/${id}`
}

export function getCollections(orgId) {
  return http.get(apiUrl + `/orgs/${orgId}/collections`)
}

export function getAllDeletedCollections(orgId) {
  return http.get(apiUrl + `/orgs/${orgId}/deletedCollections`)
}

export function restoreCollection(orgId, data,collectionId) {
  return http.put(apiUrl + `/orgs/${orgId}/restore/${collectionId}`,{data})
}

export function getCollectionsByCustomDomain(domain) {
  const apiEndpoint = getApiEndpoint(orgId)
  return httpService.get(apiEndpoint, { params: { custom_domain: domain } })
}

export function getCollection(collectionId) {
  return http.get(collectionUrl(collectionId))
}

export function saveCollection(collection) {
  const apiEndpoint = getApiEndpoint(orgId)
  return http.post(apiEndpoint, collection)
}

export function updateCollection(collectionId, collection) {
  return http.put(collectionUrl(collectionId), collection)
}

export function deleteCollection(collectionId, collection) {
  return http.delete(collectionUrl(collectionId), { data: collection })
}

export function duplicateCollection(collectionId) {
  return http.post(`${apiUrl}/orgs/${orgId}/duplicateCollections/${collectionId}`)
}

export function importCollectionService(openApiObject, uniqueTabId, defaultView) {
  const orgId = getOrgId()
  return http.post(`${apiUrl}/orgs/${orgId}/importCollection?defaultView=${defaultView}&uniqueTabId=${uniqueTabId}`, openApiObject);
}

export default {
  getCollections,
  getCollection,
  getAllDeletedCollections,
  saveCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  getCollectionsByCustomDomain,
  restoreCollection,
  importCollectionService
}
