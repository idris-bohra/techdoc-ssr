import http from './httpService'

const apiUrl = import.meta.env.VITE_API_URL

export function getCollectionsAndPages(orgId, queryParamsString = '') {
  return http.get(apiUrl + `/orgs/${orgId}/getSideBarData${queryParamsString}`)
}

export async function moveCollectionsAndPages(moveToOrgId, collection, flag = true) {
  const { id, orgId, name } = collection
  return http.put(apiUrl + `/orgs/${orgId}/collections/${id}`, { orgId: moveToOrgId, name, collectionMoved : true });
}

export function getPublishedContentByPath(queryParamsString = '') {
  return http.get(apiUrl + `/getPublishedDataByPath${queryParamsString}`)
}

export async function getPublishedContentByIdAndType(id, type) {
  let data = await http.get(apiUrl + `/pages/${id}/getPublishedData?type=${type}`)
  return (type == 4 || type == 5) ? data?.data?.publishedContent || '' : data?.data?.publishedContent?.contents || ''
}

export async function runAutomation(details) {
  let data = await http.post(apiUrl + `/run/automation`, details)
  return data;
}

export async function generateDescription(endpointIds) {
  let data = await http.post(apiUrl + '/generate-description', {endpointIds})
  return data;
}

export default {
  getCollectionsAndPages,
  getPublishedContentByPath,
  getPublishedContentByIdAndType,
  moveCollectionsAndPages,
  runAutomation,
  generateDescription,
}
