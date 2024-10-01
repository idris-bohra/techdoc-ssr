import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiUrl = import.meta.env.VITE_API_URL

function environmentsUrl() {
  return `${apiUrl}/orgs/${getOrgId()}/environments`
}

function environmentUrl(environmentId) {
  return `${apiUrl}/orgs/${getOrgId()}/environments/${environmentId}`
}

export function getEnvironments() {
  return http.get(environmentsUrl())
}

export function getEnvironment(environmentId) {
  return http.get(environmentUrl(environmentId))
}

export function saveEnvironment(environment, type) {
  return http.post(environmentsUrl(), environment, type)
}

export function updateEnvironment(environmentId, environment) {
  return http.put(`${environmentUrl(environmentId)}`, environment)
}

export function deleteEnvironment(environmentId) {
  return http.delete(`${environmentUrl(environmentId)}`)
}

export function importPostmanEnvironment(environment) {
  return http.post(`${apiUrl}/import/environment`, environment)
}

export default {
  getEnvironments,
  getEnvironment,
  saveEnvironment,
  updateEnvironment,
  deleteEnvironment,
  importPostmanEnvironment
}
