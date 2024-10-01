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

export function approvePage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/state`, { state: ENTITY_STATUS.APPROVED })
}

export function pendingPage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/state`, { state: ENTITY_STATUS.PENDING })
}

export function draftPage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/state`, { state: ENTITY_STATUS.DRAFT })
}

export function rejectPage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/state`, { state: ENTITY_STATUS.REJECT })
}

export default {
  approvePage,
  pendingPage,
  draftPage,
  rejectPage
}
