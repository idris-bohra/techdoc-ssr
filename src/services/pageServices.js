import http from './httpService'

const apiUrl = import.meta.env.VITE_API_URL

export const getPageContent = async (orgId, pageId) => {
  const data = await http.get(apiUrl + `/orgs/${orgId}/pages/${pageId}/content`)
  return data?.data?.contents || ''
}

export default {
  getPageContent
}
