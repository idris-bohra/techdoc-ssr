import http from '../../services/httpService'
import httpService from '../../services/endpointHttpService'
import qs from 'qs'
import { getOrgId } from '../common/utility'
import { makeHttpRequestThroughAxios } from '../../services/coreRequestService'
import { grantTypesEnums } from '../common/authorizationEnums'
import { introspectionQuery } from './commonIntrospectionQuery'

const apiUrlEndpoint = import.meta.env.VITE_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return import.meta.env.VITE_API_URL + `/orgs/${orgId}`
}

function endpointUrlForCollection(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}/endpoints`
}

export function apiTest(api, method, body, headers, bodyType, cancelToken) {
  if (api.indexOf('localhost') > 0 || api.indexOf('127.0.0.1') > 0) {
    return makeHttpRequestThroughAxios({ api, method, body, headers, bodyType, cancelToken })
  } else {
    const data = {
      url: api,
      method,
      data: bodyType === 'urlEncoded' ? qs.stringify({ body }) : body,
      headers
    }
    return httpService.post(`${apiUrlEndpoint}/test-apis/run`, data, { cancelToken })
  }
}

export function getAllEndpoints(id) {
  return http.get(`${apiUrlEndpoint}/orgs/${id}/endpoints`)
}

export function getEndpoints(parentId) {
  return http.get(endpointUrlForCollection(parentId))
}

export async function getEndpoint(endpointId) {
  const apiUrl = getApiUrl()
  return (await http.get(`${apiUrl}/endpoints/${endpointId}`))?.data
}

export function saveEndpoint(rootParentId, endpoint) {
  return http.post(endpointUrlForCollection(rootParentId), endpoint)
}

export function updateEndpoint(endpointId, endpoint) {
  const apiUrl = getApiUrl()
  
  return http.put(`${apiUrl}/endpoints/${endpointId}`, endpoint)
}

export function addExampleRequest(endpointId, endpoint=null) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/endpoints/sample-request/${endpointId}`, endpoint)
}

export function deleteEndpoint(endpointId, endpoint) {
  const apiUrl = getApiUrl()
  return http.delete(`${apiUrl}/endpoints/${endpointId}`, { data: endpoint })
}

export function duplicateEndpoint(endpointId) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/duplicateEndpoints/${endpointId}`)
}

export function moveEndpoint(endpointId, body) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpointId}/move`, body)
}

export async function setResponse(props, responseData) {
  const versionId = props.groups[props.groupId].versionId
  const authResponses = props.versions[versionId].authorizationResponse
  authResponses.push(responseData)
  await props.set_authorization_responses(versionId, authResponses)
}

export async function getTokenAuthorizationCodeAndAuthorizationPKCE(accessTokenURL, code, data) {
  let body = {
    client_id: data.clientId,
    redirect_uri: data.callbackUrl,
    code: code,
    grant_type: 'authorization_code',
    client_secret: data.clientSecret
  }

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }

  if (data.selectedGrantType === grantTypesEnums.authorizationCodeWithPkce) {
    body.code_verifier = data.codeVerifier
  }

  try {
    const { data: responseData } = await httpService.request({
      url: `${apiUrlEndpoint}/auth/token`,
      method: 'POST',
      data: { tokenBody: body, tokenHeaders: headers, accessTokenUrl: accessTokenURL },
    })
    return responseData.data
  }
  catch (error) {
    throw error
  }
}

export async function getTokenPasswordAndClientGrantType(accessTokenURL, data) {
  let body = {
    client_id: data.clientId,
    client_secret: data.clientSecret,
    scope: data.scope,
    grant_type: 'client_credentials',
  }

  let headers = { 'Content-Type': 'application/x-www-form-urlencoded' }

  if (data.selectedGrantType === grantTypesEnums.passwordCredentials) {
    body.grant_type = 'password'
    body.username = data.username
    body.password = data.password
  }

  try {
    const { data: responseData } = await httpService.request({
      url: `${apiUrlEndpoint}/auth/token`,
      method: 'POST',
      data: { tokenBody: body, tokenHeaders: headers, accessTokenUrl: accessTokenURL },
    })
    return responseData.data
  }
  catch (error) {
    throw error
  }
}

export async function getRefreshToken(singleTokenDetails) {
  let body = {
    client_id: singleTokenDetails.clientId,
    client_secret: singleTokenDetails.clientSecret,
    refresh_token: singleTokenDetails.refreshToken,
    grant_type: 'refresh_token',
  }

  try {
    const { data: responseData } = await httpService.request({
      url: `${apiUrlEndpoint}/auth/token`,
      method: 'POST',
      data: { tokenBody: body, tokenHeaders: {}, accessTokenUrl: singleTokenDetails?.refreshTokenUrl },
    })
    return responseData.data
  }
  catch (error) {
    throw error
  }
}

export async function getSchemaThroughIntrospectionQuery(graphQlAPI) {
  
  try {
    const { data: responseData } = await httpService.request({
      url: graphQlAPI,
      method: 'POST',
      data: { query: introspectionQuery },
    })
    return responseData.data
  }
  catch (error) {
    throw error
  }
}

export default {
  getEndpoints,
  deleteEndpoint,
  apiTest,
  updateEndpoint,
  getEndpoint,
  getAllEndpoints,
  duplicateEndpoint,
  moveEndpoint,
  saveEndpoint,
  getTokenAuthorizationCodeAndAuthorizationPKCE,
  getTokenPasswordAndClientGrantType,
  getRefreshToken,
  addExampleRequest
}
