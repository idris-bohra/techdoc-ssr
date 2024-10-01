import { QueryCache } from 'react-query'
import * as _ from 'lodash'
import * as Sentry from '@sentry/react'
import { store } from '../../store/store'
import Joi from 'joi-browser'
import jwtDecode from 'jwt-decode'
import { cloneDeep } from 'lodash'
import { getCurrentUser } from '../auth/authServiceV2'
import { bodyTypesEnums, rawTypesEnums } from './bodyTypeEnums'
import { navigateTo } from '../../navigationService'
export const ADD_GROUP_MODAL_NAME = 'Add Page'
export const ADD_VERSION_MODAL_NAME = 'Add Version'
export const ADD_PAGE_MODAL_NAME = 'Add Parent Page'
export const DEFAULT_URL = 'https://'

// 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
export const statesEnum = {
  PENDING_STATE: 0,
  REJECT_STATE: 3,
  APPROVED_STATE: 2,
  DRAFT_STATE: 1
}

export const SESSION_STORAGE_KEY = {
  CURRENT_PUBLISH_ID_SHOW: 'currentPublishIdToShow',
  PUBLIC_COLLECTION_ID: 'publicCollectionId',
  UNIQUE_TAB_ID: 'uniqueTabId'
}

export function sentryIntegration() {
  Sentry.init({
    dsn: 'https://86101cad854954725647e4b1b405ba9b@o4506399919243264.ingest.sentry.io/4506399921143808',
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [
          'localhost',
          'localhost:3000',
          'https://dev-techdoc.walkover.in/',
          'https://techdoc.walkover.in/',
          /^https:\/\/yourserver\.io\/api/
        ]
      }),
      new Sentry.Replay()
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  })
}

export function getDomainName(hostname) {
  const firstTLDs =
    'ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|be|bf|bg|bh|bi|bj|bm|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|cl|cm|cn|co|cr|cu|cv|cw|cx|cz|de|dj|dk|dm|do|dz|ec|ee|eg|es|et|eu|fi|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jo|jp|kg|ki|km|kn|kp|kr|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|na|nc|ne|nf|ng|nl|no|nr|nu|nz|om|pa|pe|pf|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|yt'.split(
      '|'
    )

  const secondTLDs =
    'com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|北海道|和歌山|神奈川|鹿児島|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|flå|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|орг|обр|упр|alt|nis|jpn|mex|ath|iki|nid|gda|inc'.split(
      '|'
    )

  const knownSubdomains =
    'www|studio|mail|remote|blog|webmail|server|ns1|ns2|smtp|secure|vpn|m|shop|ftp|mail2|test|portal|ns|ww1|host|support|dev|web|bbs|ww42|squatter|mx|email|1|mail1|2|forum|owa|www2|gw|admin|store|mx1|cdn|api|exchange|app|gov|2tty|vps|govyty|hgfgdf|news|1rer|lkjkui'

  const knownSubdomainsRegExp = new RegExp(`^(${knownSubdomains}).`, 'i')
  hostname = hostname.replace(knownSubdomainsRegExp, '')

  const parts = hostname.split('.')

  while (parts.length > 3) {
    parts.shift()
  }

  if (
    parts.length === 3 &&
    ((parts[1].length > 2 && parts[2].length > 2) || (secondTLDs.indexOf(parts[1]) === -1 && firstTLDs.indexOf(parts[2]) === -1))
  ) {
    parts.shift()
  }

  return parts[0] || ''
}

export const msgText = {
  publishPage: 'These changes will soon go live on your Public API doc',
  unpublishPage: 'You are about to Unpublish Page from your Public API doc.',
  viewSwitch: 'Do you wish to set it as default view?',
  publishEndpoint: 'These changes will soon go live on your Public API doc',
  unpublishEndpoint: 'You are about to Unpublish Endpoint from your Public API doc.',
  adminAccees: 'Admin access required'
}

export function isDashboardRoute(props, sidebar = false) {
  // now our own domain will only be considered as dashboard route
  if (
    isTechdocOwnDomain() &&
    (props.location.pathname.includes('/dashboard') ||
      props.location.pathname.includes('/orgs/:orgId/dashboard') ||
      (sidebar === true && props.location.pathname.includes('/orgs/:orgId/admin/publish')) ||
      (sidebar === true && props.location.pathname.includes('/orgs/:orgId/admin/feedback')))
  ) {
    return true
  } else return false
}

export function redirectToDashboard(orgId) {
  if (isElectron()) {
    window.location.hash = `/orgs/${orgId}/dashboard`
    window.location.reload()
  } else {
    window.location = `/orgs/${orgId}/dashboard`
  }
}

export function isElectron() {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.indexOf(' electron/') !== -1
}

export function openExternalLink(link) {
  if (isElectron()) {
    window.require('electron').shell.openExternal(link)
  } else {
    window.open(link, '_blank')
  }
}

export function isSavedEndpoint(props) {
  const pathname = props.location.pathname
  if (pathname.split('/')[4] === 'endpoint' && pathname.split('/')[5] !== 'new') {
    return true
  } else return false
}

export function setTitle(title) {
  if (typeof title === 'string') {
    if (title.trim().length > 0) {
      document.title = title.trim() + ' API Documentation'
    } else {
      document.title = 'API Documentation'
    }
  }
}

function imageExists(url, exists) {
  const img = new window.Image()
  img.onload = function () {
    exists(true)
  }
  img.onerror = function () {
    exists(false)
  }
  img.src = url
}

export function setFavicon(link) {
  if (typeof link === 'string') {
    if (link.trim().length > 0) {
      imageExists(link.trim(), function (exists) {
        if (exists) {
          document.getElementById('favicon').href = link.trim()
        }
      })
    }
  }
}

export function validate(data, schema) {
  const options = { abortEarly: false }
  const { error } = Joi.validate(data, schema, options)
  if (!error) return null
  const errors = {}
  for (const item of error.details) errors[item.path[0]] = item.message
  return errors
}

export function comparePositions(a, b) {
  if (parseInt(a.position) < parseInt(b.position)) return -1
  else if (parseInt(a.position) > parseInt(b.position)) return 1
  else return 0
}

export function getProfileName(currentUser) {
  let name = ''
  if (typeof currentUser.name === 'string') {
    name = currentUser.first_name.trim()
  }
  name = name.trim()
  if (name) {
    return name
  } else {
    return null
  }
}

export function onEnter(event, submitForm) {
  if (event.charCode === 13) {
    submitForm()
  }
}

export function toTitleCase(str) {
  if (!str) return str
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export function getOrgId() {
  const state = store.getState()
  const currentOrganization = state?.organizations?.currentOrg
  return currentOrganization?.id
}

export function handleChangeInUrlField(data) {
  const inputValue = data
  const protocolRegex = /^(?:([a-z]+:\/\/))/i
  const protocol = inputValue.split('/')[0]
  /** Checks if there is two protocols one after one either by mean of pasting URL
   * or by appending by mistake, in that case first protocol from left is  removed */
  if (inputValue.match(protocolRegex)) {
    const domain = inputValue.substring(protocol.length + 2)
    if (domain.match(protocolRegex)) {
      data = domain
    }
  }
  return data
}

export function handleBlurInUrlField(data) {
  const inputValue = data
  const protocolRegex = /^(?:([a-z]+:\/\/))/i
  let protocol = inputValue?.split('/')[0]
  protocol = inputValue.substring(0, protocol.length + 2)
  // Checks for inputValue has protocol or not, and if not then prefixes https:// with it
  if (!protocol.match(protocolRegex)) {
    data = `https://${inputValue}`
  }
  return data
}

/** Utility function to format size in Bytes to respective decimal places */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function isValidDomain() {
  const domainsList = import.meta.env.VITE_DOMAINS_LIST ? import.meta.env.VITE_DOMAINS_LIST.split(',') : []
  const currentDomain = window.location.href.split('/')[2]
  const path = window.location.href.split('/')[3]
  return domainsList.includes(currentDomain) && path !== 'p'
}

export function isNotDashboardOrDocView(props, view) {
  return !isDashboardRoute(props) || view === 'doc'
}

export function isDashboardAndTestingView(props, view) {
  return isDashboardRoute(props) && (view === 'testing' || !isSavedEndpoint(props))
}

function checkVariableExist(id, entity) {
  if (entity && entity?.id && entity?.state !== undefined && entity.state !== null) return true
  return false
}

export function isStateApproved(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity?.state === statesEnum.APPROVED_STATE
}

export function isStatePending(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity?.state === statesEnum.PENDING_STATE
}

export function isStateDraft(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity?.state === statesEnum.DRAFT_STATE
}

export function isStateReject(id, entity) {
  if (!checkVariableExist(id, entity)) return false
  return entity?.state === statesEnum.REJECT_STATE
}

export function hexToRgb(hex, opacity) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')' // return 23,14,45 -> reformat if needed
  }
  return null
}

export function sensitiveInfoFound(endpoint) {
  // check for sensitive info in request here
  let result = false
  // first check access_token in params
  if (typeof endpoint?.params?.access_token === 'object') {
    const value = typeof endpoint.params.access_token.value === 'string' ? endpoint.params.access_token.value : ''
    const authData = value.split(' ')
    if (authData.length === 1) {
      try {
        jwtDecode(authData[0])
        return true
      } catch (err) {
        result = false
      }
    }
  }
  // first check Authorization in headers
  if (typeof endpoint?.headers?.Authorization === 'object') {
    const value = typeof endpoint.headers.Authorization.value === 'string' ? endpoint.headers.Authorization.value : ''
    const authData = value.split(' ')
    if (authData.length === 1) {
      try {
        jwtDecode(authData[0])
        return true
      } catch (err) {
        result = false
      }
    }
    if (authData.length === 2) {
      switch (authData[0]) {
        case 'Basic':
          try {
            const string = authData[1]
            window.atob(string)
            return true
          } catch (err) {
            result = false
          }
          break
        case 'Bearer':
          try {
            jwtDecode(authData[1])
            return true
          } catch (err) {
            result = false
          }
          break
        default:
          result = false
      }
    }
  }
  // check for all params if theres any JWT token
  if (typeof endpoint.params === 'object') {
    Object.entries(endpoint?.params).forEach((entry) => {
      const value = typeof entry[1].value === 'string' ? entry[1].value : ''
      const authData = value.split(' ')
      authData.forEach((item) => {
        try {
          jwtDecode(item)
          result = true
        } catch (err) { }
      })
    })
  }
  // check all headers if theres any JWT token
  if (typeof endpoint.headers === 'object') {
    Object.entries(endpoint.headers).forEach((entry) => {
      const value = typeof entry[1].value === 'string' ? entry[1].value : ''
      const authData = value.split(' ')
      authData.forEach((item) => {
        try {
          jwtDecode(item)
          result = true
        } catch (err) { }
      })
    })
  }
  return result
}

export function getEntityState(entityId, entity) {
  // 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
  const isPublic = entity[entityId]?.isPublished
  if (isStatePending(entityId, entity)) return 0
  if (isStateReject(entityId, entity)) return 3
  if (isStateApproved(entityId, entity)) return 2
  if (isStateDraft(entityId, entity) && isPublic) return 'Request Publish'
  if (isStateDraft(entityId, entity) && !isPublic) return 'Make Public'
}

export function validateEmail(email) {
  const emailIdValidationRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
  return emailIdValidationRegex.test(email)
}

export function getUserProfile() {
  let user = getCurrentUser()
  try {
    return user
  } catch (e) { }
}

export function getCurrentUserSSLMode() {
  let sslModeData = window.localStorage.getItem('ssl-mode')
  const user = getUserProfile() || {}
  try {
    sslModeData = JSON.parse(sslModeData)
    const { identifier } = user
    return sslModeData?.[identifier]
  } catch (e) { }
}

export function setCurrentUserSSLMode(sslModeFlag) {
  let sslModeData = window.localStorage.getItem('ssl-mode') || '{}'
  const user = getUserProfile() || {}
  const { identifier } = user
  try {
    sslModeData = JSON.parse(sslModeData || '{}')
    const sslMode = { ...sslModeData, [identifier]: sslModeFlag }
    window.localStorage.setItem('ssl-mode', JSON.stringify(sslMode))
  } catch (e) { }
}

export function compareAlphabetically(a, b, data) {
  let order = 0
  const item1 = data[a].name.toLowerCase()
  const item2 = data[b].name.toLowerCase()
  if (item1 < item2) order = -1
  else if (item1 > item2) order = 1
  return order
}

const modifyEndpointContent = (endpointData, untitledData) => {
  const endpoint = cloneDeep(endpointData)
  const untitled = cloneDeep(untitledData)
  untitled.data.name = endpoint?.name || 'Endpoint'
  untitled.data.method = endpoint?.requestType || 'GET'

  // This code will help in storing the old endpoint body data to new endpoint body data architecture (so we do not lost the old data saved inside the DB).
  // TODO - Below code should be removed later.
  if (endpoint?.protocolType === 2) {
    untitled.protocolType = 2
    untitled.data.body = { query: endpoint.body.query, variables: endpoint.body.variables }
  } else {
    const bodyType = endpoint.body?.type || ''
    if (
      [rawTypesEnums.JSON, rawTypesEnums.HTML, rawTypesEnums.JavaScript, rawTypesEnums.XML, rawTypesEnums.TEXT].includes(bodyType) &&
      endpoint.body.raw
    ) {
      untitled.data.body = endpoint.body
    } else if (
      [rawTypesEnums.JSON, rawTypesEnums.HTML, rawTypesEnums.JavaScript, rawTypesEnums.XML, rawTypesEnums.TEXT].includes(bodyType)
    ) {
      untitled.data.body = { ...untitled.data.body, type: bodyType, raw: { rawType: bodyType, value: endpoint?.body?.value } }
    } else if (bodyType === bodyTypesEnums['application/x-www-form-urlencoded'] || bodyType === bodyTypesEnums['multipart/form-data']) {
      if (endpoint.body[bodyType]) {
        untitled.data.body = endpoint.body
      } else {
        untitled.data.body = { ...untitled.data.body, type: bodyType, [bodyType]: endpoint.body?.value || [] }
      }
    } else if (bodyType === bodyTypesEnums['none']) {
      if (
        endpoint.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] ||
        endpoint.body?.[bodyTypesEnums['multipart/form-data']] ||
        endpoint.body?.[bodyTypesEnums['raw']]
      ) {
        untitled.data.body = endpoint.body
      } else {
        untitled.data.body = { ...untitled.data.body, ...endpoint.body }
      }
      delete endpoint.body?.value
    } // ends here
  }
  delete endpoint.body?.value

  untitled.data.uri = endpoint.uri
  untitled.data.updatedUri = endpoint.uri
  untitled.data.URL = endpointData?.URL
  untitled.authorizationData = endpoint?.authorizationData || untitled.authorizationData
  const headersData = endpoint.headers
    ? Object.keys(endpoint.headers).map((key) => {
      return { key, ...endpoint.headers[key] }
    })
    : []

  const paramsData = endpoint.params
    ? Object.keys(endpoint.params).map((key) => {
      return { key, ...endpoint.params[key] }
    })
    : []

  const path = endpoint.pathVariables
    ? Object.keys(endpoint.pathVariables).map((key) => {
      return { key, ...endpoint.pathVariables[key] }
    })
    : []
  if (!endpoint.docViewData || endpoint.docViewData.length === 0) {
    untitled.docViewData = [
      { type: 'host' },
      { type: 'body' },
      { type: 'params' },
      { type: 'pathVariables' },
      { type: 'headers' },
      { type: 'sampleResponse' }
    ]
  } else {
    untitled.docViewData = endpoint.docViewData
  }
  headersData.push({ checked: 'notApplicable', key: '', value: '', description: '' })
  paramsData.push({ checked: 'notApplicable', key: '', value: '', description: '' })
  path.push({ checked: 'notApplicable', key: '', value: '', description: '' })
  untitled.originalHeaders = headersData
  untitled.originalParams = paramsData
  untitled.pathVariables = path
  untitled.sampleResponseArray = endpoint.sampleResponse || []
  untitled.postScriptText = endpoint.postScript
  untitled.preScriptText = endpoint.preScript
  untitled.host['BASE_URL'] = endpoint.BASE_URL
  untitled.testResponse = {}
  untitled.flagResponse = false
  untitled.bodyDescription = endpointData.bodyDescription
  untitled.description = endpointData.description
  return { ...untitled }
}

export function getOnlyUrlPathById(id, sidebar, mode = 'external') {
  let path = []
  // not add invisible parent page name in path
  while (sidebar?.[id]?.type > 0) {
    const itemName = mode === 'internal' ? sidebar[id].name : sidebar[id].urlName
    path.push(itemName)
    id = sidebar?.[id]?.parentId
  }
  let actualPath = path.reverse().join('/')
  return actualPath
}

export function getUrlPathById(id, sidebar) {
  let path = []
  let versionName = null
  // not add invisible parent page name in path
  while (sidebar?.[id]?.type > 0) {
    if (sidebar[id].type == 2) {
      versionName = sidebar[id].urlName
    } else {
      path.push(sidebar[id].urlName)
    }
    id = sidebar?.[id]?.parentId
  }

  let actualPath = path.reverse().join('/')
  if (versionName) {
    actualPath = `${actualPath}?version=${versionName}`
  }
  // always add collectionId in query params in url if own domain
  if (isTechdocOwnDomain()) {
    let collectionId = sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID)
    let operator = versionName ? '&' : '?' // if versionName is added then add & else add ?
    actualPath = actualPath + operator + `collectionId=${collectionId}`
  }
  return actualPath
}
export function isTechdocOwnDomain() {
  const domainsList = import.meta.env.VITE_DOMAINS_LIST ? import.meta.env.VITE_DOMAINS_LIST.split(',') : []
  const currentDomain = window.location.href.split('/')[2]
  return domainsList.includes(currentDomain)
}

export function isOnPublishedPage() {
  const path = window.location.pathname.split('/')[1] // example http://localhost:3000/p/
  return (isTechdocOwnDomain() && path == 'p') || !isTechdocOwnDomain()
}

export function isOnRedirectionPage() {
  return window.location.pathname.includes('/redirections')
}

const deleteSidebarData = (pages, tabs, pageId, deletedTabIds, deletedIds) => {
  if (pages[pageId]) {
    pages[pageId].child.forEach((childPageId) => {
      deleteSidebarData(pages, tabs, childPageId, deletedTabIds, deletedIds)
    })

    // creating data for deleting from react query
    pages[pageId]?.type == 4 ? deletedIds.endpointIds.push(pageId) : deletedIds.pageIds.push(pageId)

    delete pages[pageId]

    // if tabs if present in the tabs
    if (tabs.tabs[pageId]) {
      delete tabs.tabs[pageId]
      deletedTabIds.add(pageId)
    }
  }
}

export const deleteAllPagesAndTabsAndReactQueryData = async (pageId, collectionId) => {
  try {
    const deletedTabIds = new Set() // to keep set of ids deleted

    // for deleting from react query
    let deletedIds = {}
    deletedIds.pageIds = []
    deletedIds.endpointIds = []

    let foundActiveTabId = false // used to check if the deleted tab id is actively open right now

    // get pages and tabs data form redux
    let { pages, tabs } = store.getState()
    pages = _.cloneDeep(pages)
    tabs = _.cloneDeep(tabs)

    if (collectionId && tabs.tabs?.[collectionId]) {
      delete tabs.tabs[collectionId]
      tabs.tabsOrder = tabs.tabsOrder.filter((tab) => tab !== collectionId)
      if (tabs?.activeTabId == collectionId) {
        foundActiveTabId = true
      }
    }

    // update the parent's child
    let parentId = pages[pageId]?.parentId
    if (parentId != null) {
      pages[parentId].child = pages[parentId].child.filter((id) => id !== pageId)
    }

    deleteSidebarData(pages, tabs, pageId, deletedTabIds, deletedIds) // deleting sidebar data

    // filter tabsOrder from the ids which are deleted and also set foundActiveTabId = true; if tab id deleted is active id
    let tabsOrder = tabs.tabsOrder.filter((id) => {
      if (tabs?.activeTabId == id) {
        foundActiveTabId = true
      }
      return !deletedTabIds.has(id)
    })

    tabs.tabsOrder = _.cloneDeep(tabsOrder)

    deleteFromReactQuery(deletedIds) // deleting from react query

    // change active tab id if tab id
    if (foundActiveTabId) {
      if (tabs?.tabsOrder?.length > 0) {
        tabs.activeTabId = _.cloneDeep(tabs.tabsOrder[0])
      } else if (tabs?.tabsOrder?.length == 0) {
        tabs.activeTabId = null
      }
    }
    // things left to do , if activeTabId found then change activeTabId and change path
    return { pages, tabs, changePath: foundActiveTabId, openNewTab: !(tabs?.tabsOrder?.length > 0) }
  } catch (err) {
    console.error(err)
    return null
  }
}

function deleteFromReactQuery(deletedIds) {
  const queryCache = new QueryCache()
  if (deletedIds?.pageIds?.length > 0) {
    queryCache.remove(['pageContent', deletedIds.pageIds])
  }
  if (deletedIds?.endpointIds?.length > 0) {
    queryCache.remove(['endpoint', deletedIds.endpointIds])
  }
}

export const operationsAfterDeletion = (data) => {
  // if path needs to be changed with new activeId if tabsOrder length > 0
  if (data?.changePath && data?.tabs?.tabsOrder?.length > 0) {
    navigateTo(`/orgs/${getOrgId()}/dashboard`)
  }
  // when no tabs are opened then redirect to new tab and open new tab
  if (data?.openNewTab) {
    navigateTo(`/orgs/${getOrgId()}/dashboard`)
  }
}

export const trimString = (str) => {
  return str?.trim()
}

export const modifyDataForBulkPublish = (collectionData, allPagesData, collectionId) => {
  const rootParentId = collectionData?.[collectionId]?.rootParentId
  const formatedData = {
    name: collectionData?.[collectionId]?.name || null,
    metadata: { rootParentId, collectionId },
    children: modifiedData(allPagesData?.[rootParentId]?.child || [], allPagesData)
  }
  return formatedData
}

const modifiedData = (childs, allPagesData) => {
  return childs?.map((singleId) => {
    return {
      name: allPagesData?.[singleId]?.name,
      children: modifiedData(allPagesData?.[singleId]?.child || [], allPagesData),
      metadata: { actualId: singleId }
    }
  })
}

export const modifyCheckBoxDataToSend = (flattenData, allSelectedIds, dataToPublishSet) => {
  allSelectedIds.forEach((singleId) => {
    if (!dataToPublishSet.has(singleId)) dataToPublishSet.add(singleId)
    addItsParent(flattenData, singleId, dataToPublishSet)
  })
}

function addItsParent(flattenData, singleId, dataToPublishSet) {
  let parentId = flattenData?.[singleId]?.parent
  while (parentId !== null) {
    if (dataToPublishSet.has(parentId) || !parentId) break
    dataToPublishSet.add(parentId)
    parentId = flattenData?.[parentId]?.parent
  }
}

export const parseCronExpression = (cronExpression) => {
  const [minute, hour, , , dayOfWeek] = cronExpression.split(' ').map(num => (num === '*' ? '*' : parseInt(num, 10)));

  let basicRunFrequency;
  let runFrequency = null;
  let runTime = `${hour === '*' ? '00' : String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  if (hour === '*' && minute !== '*') {
    basicRunFrequency = 'Hourly';
  } else if (dayOfWeek === '*') {
    basicRunFrequency = 'Daily';
  } else {
    basicRunFrequency = 'Weekly';
    switch (dayOfWeek) {
      case '1-5':
        runFrequency = 'Every weekday (Monday-Friday)';
        break;
      case 1:
        runFrequency = 'Every Monday';
        break;
      case 2:
        runFrequency = 'Every Tuesday';
        break;
      case 3:
        runFrequency = 'Every Wednesday';
        break;
      case 4:
        runFrequency = 'Every Thursday';
        break;
      case 5:
        runFrequency = 'Every Friday';
        break;
      default:
        runFrequency = 'Every day';
        break;
    }
  }

  return { basicRunFrequency, runFrequency, runTime };
};


export const generateCronExpression = (basicRunFrequency, runFrequency, runTime) => {
  const [hour, minute] = runTime.split(':').map((num) => parseInt(num, 10))
  if (basicRunFrequency === 'Hourly') {
    return `${minute} * * * *`
  } else if (basicRunFrequency === 'Daily') {
    return `${minute} ${hour} * * *`
  } else if (basicRunFrequency === 'Weekly') {
    switch (runFrequency) {
      case 'Every weekday (Monday-Friday)':
        return `${minute} ${hour} * * 1-5`
      case 'Every Monday':
        return `${minute} ${hour} * * 1`
      case 'Every Tuesday':
        return `${minute} ${hour} * * 2`
      case 'Every Wednesday':
        return `${minute} ${hour} * * 3`
      case 'Every Thursday':
        return `${minute} ${hour} * * 4`
      case 'Every Friday':
        return `${minute} ${hour} * * 5`
      default:
        // Fallback to every day if no match
        return `${minute} ${hour} * * *`
    }
  } else {
    // Fallback to daily if no basic frequency matches
    return `${minute} ${hour} * * *`
  }
}

export const isOrgDocType = () => {
  const state = store.getState();
  return state?.organizations?.currentOrg?.meta?.type === 0 ? false : true
}

export default {
  isDashboardRoute,
  isElectron,
  isSavedEndpoint,
  setTitle,
  setFavicon,
  getProfileName,
  onEnter,
  toTitleCase,
  getOrgId,
  ADD_GROUP_MODAL_NAME,
  ADD_VERSION_MODAL_NAME,
  ADD_PAGE_MODAL_NAME,
  handleChangeInUrlField,
  handleBlurInUrlField,
  formatBytes,
  isValidDomain,
  DEFAULT_URL,
  isNotDashboardOrDocView,
  isDashboardAndTestingView,
  isStateApproved,
  isStatePending,
  isStateDraft,
  isStateReject,
  sensitiveInfoFound,
  hexToRgb,
  msgText,
  getEntityState,
  validateEmail,
  getUserProfile,
  compareAlphabetically,
  sentryIntegration,
  modifyEndpointContent,
  isTechdocOwnDomain,
  SESSION_STORAGE_KEY,
  isOnPublishedPage,
  deleteAllPagesAndTabsAndReactQueryData,
  operationsAfterDeletion,
  trimString,
  modifyDataForBulkPublish,
  isOnRedirectionPage,
  isOrgDocType,
}
