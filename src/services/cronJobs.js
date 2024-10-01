import http from './httpService'
const apiUrl = import.meta.env.VITE_API_URL

export const addCron = async (cronScheduler) => {
  const { collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status } = cronScheduler;
  const body = { collectionId, cron_name, cron_expression, description, environmentId, emails, endpointIds, status };
  return await http.post(apiUrl + `/cron`, body);
}

export const updateCron = async (cron) => {
  const { id } = cron
  await http.put(`${apiUrl}/cron/${id}`, cron)
}

export const getCronByCollection = async (collectionId) => {
  const response = await http.get(`${apiUrl}/cron/collection/${collectionId}`)
  return response?.data;
}

export const cronStatus = async (cronId, status) => {
  await http.put(`${apiUrl}/cron/status/${cronId}`, { status: status })
}

export const deleteCron = async (cronId) => {
  await http.delete(apiUrl + `/cron/${cronId}`)
}

export const addWebhook = async (payload) => {
  return await http.post(apiUrl + `/create-webhook-token`, { payload });
}

export default {
  addCron,
  updateCron,
  getCronByCollection,
  deleteCron,
  cronStatus,
  addWebhook
}
