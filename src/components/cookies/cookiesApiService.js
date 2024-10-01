import http from '../../services/httpService'

const apiUrl = import.meta.env.VITE_API_URL

function addDomain(data) {
  return http.post(`${apiUrl}/cookies`, data)
}

function getAllCookies() {
  return http.get(`${apiUrl}/cookies`)
}

function deleteDomain(id) {
  return http.delete(`${apiUrl}/cookies/${id}`)
}

function updateDomain(id, data) {
  return http.put(`${apiUrl}/cookies/${id}`, data)
}

export default {
  addDomain,
  getAllCookies,
  deleteDomain,
  updateDomain
}
