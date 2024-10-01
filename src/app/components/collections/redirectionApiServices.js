import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiUrl = import.meta.env.VITE_API_URL

export function deleteMappedUrl(id) {
  const orgId = getOrgId()
  return http.delete(apiUrl + `/orgs/${orgId}/urlMappings/${id}`)
}

export function addUrlWithAdditionalPath(pageId, collectionId, path) {
  const orgId = getOrgId()
  const body = { pageId, collectionId, oldUrl: path };
  return http.post(apiUrl + `/orgs/${orgId}/urlMappings`, body)
}