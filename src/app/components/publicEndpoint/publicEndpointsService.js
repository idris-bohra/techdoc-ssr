import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const ENTITY_STATUS = {
  PENDING: 0,
  DRAFT: 1,
  APPROVED: 2,
  REJECT: 3
};

function getApiUrl() {
  const orgId = getOrgId()
  return import.meta.env.VITE_API_URL + `/orgs/${orgId}`
}

export function approveEndpoint(endpointId, uniqueTabId) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpointId}/state`, { state: ENTITY_STATUS.APPROVED, uniqueTabId })
}

export function pendingEndpoint(endpoint) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/state`, { state: ENTITY_STATUS.PENDING })
}

export function draftEndpoint(endpoint, uniqueTabId) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/state`, { state: ENTITY_STATUS.DRAFT, uniqueTabId })
}

export function rejectEndpoint(endpoint) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/state`, { state: ENTITY_STATUS.REJECT })
}

export default {
  approveEndpoint,
  pendingEndpoint,
  draftEndpoint,
  rejectEndpoint
}