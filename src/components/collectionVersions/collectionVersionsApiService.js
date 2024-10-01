import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiBaseUrl = import.meta.env.VITE_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return apiBaseUrl + `/orgs/${orgId}`
}

function collectionParentPagesUrl(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}/versions`
}

export function saveParentPageVersion(pageId, collectionParentPage) {
  return http.post(collectionParentPagesUrl(pageId), collectionParentPage)
}

export function setDefaultVersion(orgId, versionData) {
  const apiUrl = getApiUrl()
  return http.put(`${apiUrl}/defaultVersion`, versionData)
}

export default {
  saveParentPageVersion,
  setDefaultVersion
}
