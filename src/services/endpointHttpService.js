import axios from 'axios'
import logger from './logService'
import 'react-toastify/dist/ReactToastify.css'
import { getProxyToken } from '../components/auth/authServiceV2'

// axios.defaults.baseURL = import.meta.env.VITE_API_URL;
let endpointInstance = axios.create()

endpointInstance.interceptors.response.use(null, (error) => {
  const expectedError = (error.response && error.response.status >= 400 && error.response.status < 500) || axios.isCancel(error)
  if (!expectedError) {
    logger.log(!error)
  }
  return Promise.reject(error)
})

function setProxyToken(jwt) {
  endpointInstance.defaults.headers.common.proxy_auth_token = jwt
}

function addProxyToken() {
  const proxyToken = getProxyToken()
  if (proxyToken) {
    endpointInstance.defaults.headers.common.proxy_auth_token = proxyToken
  }
  return endpointInstance
}

async function getMethod(url, config = null) {
  endpointInstance = addProxyToken()
  return await endpointInstance.get(url, config)
}
async function postMethod(url, data = null, config = null) {
  endpointInstance = addProxyToken()
  return await endpointInstance.post(url, data, config)
}

async function putMethod(url, data = null, config = null) {
  endpointInstance = addProxyToken()
  return await endpointInstance.put(url, data, config)
}

async function deleteMethod(url, config = null) {
  endpointInstance = addProxyToken()
  return await endpointInstance.delete(url, config)
}

function requestMethod() {
  endpointInstance = addProxyToken()
  return endpointInstance.request
}

async function patchMethod(url, data = null, config = null) {
  endpointInstance = addProxyToken()
  return await endpointInstance.patch(url, data, config)
}

export default {
  get: getMethod,
  post: postMethod,
  put: putMethod,
  delete: deleteMethod,
  request: requestMethod(),
  patch: patchMethod,
  setProxyToken
}
