import { bodyTypesEnums } from '../components/common/bodyTypeEnums'

import querystring from 'querystring'
import FormData from 'form-data'
import axios from 'axios'

export async function makeHttpRequestThroughAxios({ api: url, method, body: data, headers, cancelToken }) {
  headers = headers || {}

  const options = {
    method: method,
    url: encodeURI(url),
    headers,
    data,
    proxy: false,
    cancelToken
  }
  if (headers['content-type'] === bodyTypesEnums['multipart/form-data']) {
    const bodyFormData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      bodyFormData.append(key, value)
    }
    options.data = bodyFormData
  } else if (headers['content-type'] === bodyTypesEnums['application/x-www-form-urlencoded']) {
    options.data = querystring.stringify(data)
  }

  return new Promise((resolve, reject) => {
    axios(options)
      .then(function (response) {
        resolve({
          status: 200,
          data: prepareResponse(response)
        })
      })
      .catch(function (error) {
        if (axios.isCancel(error)) {
          resolve({
            status: 200,
            data: { success: false, error }
          })
        } else if (!error.response) {
          resolve({
            status: 200,
            data: { success: false, error }
          })
        } else {
          resolve({
            status: 200,
            data: prepareResponse(error.response)
          })
        }
      })
  })
}

function prepareResponse(data) {
  return {
    success: true,
    status: data.status,
    statusText: data.statusText,
    response: data.data,
    headers: data.headers
  }
}
