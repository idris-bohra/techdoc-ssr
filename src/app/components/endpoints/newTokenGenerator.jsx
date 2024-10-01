import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'react-bootstrap'
import endpointApiService from './endpointApiService'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { grantTypesEnums, inputFieldsEnums, codeMethodTypesEnums, clientAuthenticationTypeEnums } from '../common/authorizationEnums.js'
import { toast } from 'react-toastify'
import shortid from 'shortid'
import { addToken } from '../../store/tokenData/tokenDataActions.js'
import './endpoints.scss'

const URI = require('urijs')

const options = {
  refetchOnWindowFocus: false,
  cacheTime: 5000000,
  enabled: true,
  staleTime: Infinity,
  retry: 3
}

function TokenGenerator(props) {
  const { activeTabId } = useSelector((state) => {
    return {
      activeTabId: state.tabs.activeTabId,
    }
  })
  const params = useParams();

  const dispatch = useDispatch()

  const queryClient = useQueryClient()

  const endpointId = params.endpointId !== 'new' ? params.endpointId : activeTabId;
  const queryKey = ['endpoint', endpointId];

  const { data: endpointStoredData } = useQuery(queryKey, options);

  const [data, setData] = useState({
    tokenName: endpointStoredData?.authorizationData?.authorization?.oauth2?.tokenName || 'Token Name',
    selectedGrantType: endpointStoredData?.authorizationData?.authorization?.oauth2?.selectedGrantType || grantTypesEnums.authorizationCode,
    callbackUrl: `${import.meta.env.VITE_UI_URL}/auth/redirect` || '',
    authUrl: endpointStoredData?.authorizationData?.authorization?.oauth2?.authUrl || '',
    username: endpointStoredData?.authorizationData?.authorization?.oauth2?.username || '',
    password: endpointStoredData?.authorizationData?.authorization?.oauth2?.password || '',
    accessTokenUrl: endpointStoredData?.authorizationData?.authorization?.oauth2?.accessTokenUrl || '',
    clientId: endpointStoredData?.authorizationData?.authorization?.oauth2?.clientId || '',
    clientSecret: endpointStoredData?.authorizationData?.authorization?.oauth2?.clientSecret || '',
    scope: endpointStoredData?.authorizationData?.authorization?.oauth2?.scope || '',
    state: endpointStoredData?.authorizationData?.authorization?.oauth2?.state || '',
    clientAuthentication: endpointStoredData?.authorizationData?.authorization?.oauth2?.clientAuthentication || clientAuthenticationTypeEnums?.sendOnHeaders,
    codeMethod: endpointStoredData?.authorizationData?.authorization?.oauth2?.codeMethod || codeMethodTypesEnums.sh256,
    codeVerifier: endpointStoredData?.authorizationData?.authorization?.oauth2?.codeVerifier || '',
    refreshTokenUrl: endpointStoredData?.authorizationData?.authorization?.oauth2?.refreshTokenUrl || '',
  })

  const dataRef = useRef(data);

  useEffect(() => {
    function receiveMessage(event) {
      if (event?.data && event?.data?.techdocAuthenticationDetails) {
        getAuthenticationDetails(event?.data?.techdocAuthenticationDetails, dataRef.current)
      }
    }

    window.addEventListener('message', receiveMessage, false);
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, [])

  useEffect(() => {
    dataRef.current = data
  }, [data])


  const getAuthenticationDetails = async (authDetail, configurationDetails) => {
    const code = authDetail.code;
    const state = authDetail.state;
    if (configurationDetails.selectedGrantType === grantTypesEnums.authorizationCode || configurationDetails.selectedGrantType === grantTypesEnums.authorizationCodeWithPkce) {
      let accessTokenData
      try {
        accessTokenData = await endpointApiService.getTokenAuthorizationCodeAndAuthorizationPKCE(configurationDetails.accessTokenUrl, code, configurationDetails)
      }
      catch (error) {
        console.error(error)
        return toast.error('Access Token Not Found, Try Again!')
      }
      const createdTime = getCurrentTimeOfTokenGeneration()
      try {
        storeTokenInsideLocalState({ ...accessTokenData, createdTime, state })
        return toast.success('Access Token Added!')
      }
      catch (error) {
        console.error(error)
        return toast.error('Access Token Not Found, Try Again!')
      }
    }
    else if (configurationDetails.selectedGrantType === grantTypesEnums.implicit) {
      if (!authDetail?.implicitDetails?.access_token) return toast.error('could not get the access token');
      const createdTime = getCurrentTimeOfTokenGeneration()
      try {
        storeTokenInsideLocalState({ ...authDetail?.implicitDetails, createdTime })
        return toast.success('Access Token Added!')
      }
      catch (error) {
        console.error(error)
        return toast.error('Access Token Not Found, Try Again!')
      }
    }
  }

  const getCurrentTimeOfTokenGeneration = () => {
    const dateTimeOfTokenGeneration = new Date();
    dateTimeOfTokenGeneration.setSeconds(dateTimeOfTokenGeneration.getSeconds() - 20);
    return dateTimeOfTokenGeneration;
  }

  const getAcessTokenForPasswordAndClientGrantType = async () => {
    try {
      const responseData = await endpointApiService.getTokenPasswordAndClientGrantType(data.accessTokenUrl, dataRef.current);
      const createdTime = getCurrentTimeOfTokenGeneration()
      storeTokenInsideLocalState({ ...responseData, createdTime })
      return toast.success('Access Token Added!')
    }
    catch (error) {
      console.error(error)
      return toast.error('Access Token Not Found, Try Again!')
    }
  }

  const storeTokenInsideLocalState = (tokenDetails) => {
    if (!tokenDetails) return;
    const accessTokenUniqueId = shortid.generate();
    const storeTokenDetails = {
      id: accessTokenUniqueId,
      accessToken: tokenDetails?.access_token || null,
      tokenName: dataRef.current?.tokenName || null,
      grantType: dataRef.current?.selectedGrantType || null,
      endpointId: params?.endpointId || null,
      refreshToken: tokenDetails?.refresh_token || null,
      refreshTokenUrl: dataRef.current?.refreshTokenUrl || null,
      expiryTime: tokenDetails?.expires_in || null,
      scope: dataRef.current?.scope || null,
      clientId: dataRef.current?.clientId || null,
      clientSecret: dataRef.current?.clientSecret || null,
      state: tokenDetails?.state || null,
      accessTokenUrl: dataRef.current?.accessTokenUrl || null,
      tokenType: tokenDetails?.token_type || null,
      createdTime: tokenDetails.createdTime,
    }
    dispatch(addToken(storeTokenDetails))
  }

  async function makeRequest() {
    const grantType = dataRef.current.selectedGrantType
    let requestApi = ''
    const paramsObject = makeParams(grantType)
    const params = URI.buildQuery(paramsObject)
    if (grantType === grantTypesEnums.implicit || grantType === grantTypesEnums.authorizationCode || grantType === grantTypesEnums.authorizationCodeWithPkce) {
      requestApi = dataRef.current.authUrl + '?' + params
    }
    if (grantType === grantTypesEnums.passwordCredentials || grantType === grantTypesEnums.clientCredentials) {
      return getAcessTokenForPasswordAndClientGrantType()
    }
    if (grantType === grantTypesEnums.authorizationCode || grantType === grantTypesEnums.authorizationCodeWithPkce) {
      requestApi = requestApi + '&response_type=code'
    } else {
      requestApi = requestApi + '&response_type=token'
    }
    var options = "width=200,height=200,resizable=yes,scrollbars=yes,status=yes";
    window.open(requestApi, '_blank', options)
  }

  function makeParams(grantType) {
    const params = {}
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      switch (keys[i]) {
        case 'username':
          if (grantType === grantTypesEnums.passwordCredentials) {
            params.username = data[keys[i]]
          }
          break
        case 'password':
          if (grantType === grantTypesEnums.passwordCredentials) {
            params.password = data[keys[i]]
          }
          break
        case 'callbackUrl':
          if (grantType === grantTypesEnums.implicit || grantType === grantTypesEnums.authorizationCode || grantType === grantTypesEnums.authorizationCodeWithPkce) {
            params.redirect_uri = data[keys[i]]
          }
          break
        case 'clientId':
          params.client_id = data[keys[i]]
          break
        case 'clientSecret':
          if (
            grantType === grantTypesEnums.passwordCredentials ||
            grantType === grantTypesEnums.clientCredentials
          ) {
            params.client_secret = data[keys[i]]
          }
          break
        case 'scope':
          params[keys[i]] = data[keys[i]]
          break
        case 'state':
          if (grantType === grantTypesEnums.implicit || grantType === grantTypesEnums.authorizationCode || grantType === grantTypesEnums.authorizationCodeWithPkce) {
            params[keys[i]] = data[keys[i]]
          }
        case 'codeMethod':
          if (grantType === grantTypesEnums.authorizationCodeWithPkce) {
            params['code_challenge_method'] = data[keys[i]];
          }
        case 'codeVerifier':
          if (grantType === grantTypesEnums.authorizationCodeWithPkce) {
            params['code_challenge'] = data[keys[i]];
          }
          break
        default:
          continue
      }
    }
    return params
  }

  function setClientAuthorization(e) {
    setData((prev) => { return { ...prev, clientAuthentication: e.target.value } })
  }

  function handleGrantTypeClick(key) {
    setData((prev) => { return { ...prev, selectedGrantType: grantTypesEnums[key] } })
  }

  function handleInputFieldChange(e, key) {
    setData((prev) => { return { ...prev, [key]: e.target.value } })
  }

  function handleSaveConfiguration() {
    if (data.tokenName.length > 25) return toast.error('Token Name character limit is 25')
    const endpointDataToSend = endpointStoredData;
    if (!(endpointDataToSend?.authorizationData?.authorization?.oauth2)) {
      endpointDataToSend.authorizationData.authorization = { oauth2: {} }
    }
    endpointDataToSend.authorizationData.authorization.oauth2 = { ...endpointDataToSend.authorizationData.authorization.oauth2, ...data }
    queryClient.setQueryData(queryKey, endpointDataToSend)
    if (params.endpointId === 'new') {
      localStorage.setItem(activeTabId, JSON.stringify(endpointDataToSend));
      props.handleSaveEndpoint(null, endpointDataToSend)
      props.onHide();
      return;
    }
    props.onHide();
    props.handleSaveEndpoint(endpointId, endpointDataToSend)
  }

  function renderInput(key) {
    const grantType = data.selectedGrantType
    switch (key) {
      case 'grantType':
        return (
          <>
            <label className='basic-auth-label'>{inputFieldsEnums[key]}</label>
            <div className='dropdown basic-auth-input'>
              <button
                className='btn dropdown-toggle new-token-generator-dropdown w-100'
                id='dropdownMenuButton'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                {data.selectedGrantType}
              </button>
              <div className='dropdown-menu new-token-generator-dropdown-menu' aria-labelledby='dropdownMenuButton'>
                {Object.keys(grantTypesEnums).map((key) => (
                  <button key={key} className='dropdown-item' onClick={() => handleGrantTypeClick(key)}>
                    {grantTypesEnums[key]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )
      case 'clientAuthentication':
        return (
          <>
            <label className='basic-auth-label'>{inputFieldsEnums[key]}</label>
            <div className='dropdown basic-auth-input'>
              <button
                className='btn dropdown-toggle new-token-generator-dropdown w-100'
                id='dropdownMenuButton'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                {data.clientAuthentication}
              </button>
              <div className='dropdown-menu new-token-generator-dropdown-menu' aria-labelledby='dropdownMenuButton'>
                <button value={clientAuthenticationTypeEnums.sendOnHeaders} className='dropdown-item' onClick={setClientAuthorization}>
                  {clientAuthenticationTypeEnums.sendOnHeaders}
                </button>
                <button value={clientAuthenticationTypeEnums.sendOnBody} className='dropdown-item' onClick={setClientAuthorization}>
                  {clientAuthenticationTypeEnums.sendOnBody}
                </button>
              </div>
            </div>
          </>
        )
      case 'callbackUrl':
        if (grantType === grantTypesEnums.authorizationCode || grantType === grantTypesEnums.implicit || grantType === grantTypesEnums.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        break
      case 'authUrl':
        if (grantType === grantTypesEnums.authorizationCode || grantType === grantTypesEnums.implicit || grantType === grantTypesEnums.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        break
      case 'codeMethod':
        if (grantType === grantTypesEnums.authorizationCodeWithPkce) {
          return codeMethodInputField(key)
        }
        return null;
      case 'codeVerifier':
        if (grantType === grantTypesEnums.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        return null;
      case 'state':
        if (grantType === grantTypesEnums.authorizationCode || grantType === grantTypesEnums.implicit || grantType === grantTypesEnums.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        break
      case 'username':
        if (grantType === grantTypesEnums.passwordCredentials) {
          return fetchDefaultInputField(key)
        }
        break
      case 'password':
        if (grantType === grantTypesEnums.passwordCredentials) {
          return fetchDefaultInputField(key)
        }
        break
      case 'accessTokenUrl':
        if (grantType === grantTypesEnums.implicit) {
          return
        }
        return fetchDefaultInputField(key)
      case 'clientSecret':
        if (grantType === grantTypesEnums.implicit) {
          return
        }
        return fetchDefaultInputField(key)
      default:
        return fetchDefaultInputField(key)
    }
  }

  function fetchDefaultInputField(key) {
    return (
      <>
        <label className='basic-auth-label'>{inputFieldsEnums[key]}</label>
        <input
          id='input'
          className={`token-generator-input-field ${key === 'callbackUrl' && 'disable-callback'}`}
          name={key}
          value={data[key]}
          onChange={(e) => handleInputFieldChange(e, key)}
          disabled={key === 'callbackUrl'}
        />
      </>
    )
  }

  function codeMethodInputField(key) {
    return (
      <>
        <label className='basic-auth-label'>{inputFieldsEnums[key]}</label>
        <div className='dropdown basic-auth-input'>
          <button
            className='btn dropdown-toggle new-token-generator-dropdown'
            id='dropdownMenuButton'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'
          >
            {data.codeMethod}
          </button>
          <div className='dropdown-menu new-token-generator-dropdown-menu' aria-labelledby='dropdownMenuButton'>
            {Object.keys(codeMethodTypesEnums).map((key) => (
              <button key={key} className='dropdown-item' onClick={() => handleCodeMethodClick(codeMethodTypesEnums[key])}>
                {codeMethodTypesEnums[key]}
              </button>
            ))}
          </div>
        </div>
      </>
    )
  }

  const handleCodeMethodClick = (value) => {
    setData((prev) => { return { ...prev, codeMethod: value } })
  }

  const closeModal = () => {
    props.onHide()
  }

  return (
    <Modal onHide={closeModal} id='modal-new-token-generator' className='get-access-token' size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered show={props?.show}>

      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>{props?.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className='new-token-generator-modal-body'>

        {Object.keys(inputFieldsEnums).map((key) => (
          <div key={key} className='input-field-wrapper'>{renderInput(key)}</div>
        ))}

        <div className='text-right'>
          <button className='btn btn-secondary outline btn-sm font-12 ml-2' onClick={handleSaveConfiguration}>Save</button>
          <button className='btn btn-primary btn-sm font-12 ml-2' type='button' onClick={makeRequest}>Request Token</button>
        </div>

      </Modal.Body>
    </Modal>
  )
}

export default TokenGenerator