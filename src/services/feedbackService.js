import http from './httpService'
const apiUrl = import.meta.env.VITE_API_URL

export const like = async (pageId) => {
  await http.post(apiUrl + `/feedback/positive`,{pageId})
}

export const dislike = async (feedback) => {
  const {pageId, comment, email} = feedback
  await http.post(apiUrl + `/feedback/negative`, {pageId, comment, email})
}

export const getFeedbacks = async(collectionId) => {
  const response = await http.get(apiUrl + `/feedback/${collectionId}`) 
  return response.data.feedbacks;
}

export default {
    like,
    dislike,
    getFeedbacks
}
