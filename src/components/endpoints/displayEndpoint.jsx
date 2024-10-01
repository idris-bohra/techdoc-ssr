import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { Dropdown, ButtonGroup, Button, OverlayTrigger, Tooltip, Form } from 'react-bootstrap'
import { SESSION_STORAGE_KEY, isOnPublishedPage, trimString } from '../common/utility'

import {
  isDashboardRoute,
  isElectron,
  isSavedEndpoint,
  isStateDraft,
  isStateReject,
  isStatePending,
  isStateApproved,
  sensitiveInfoFound,
  msgText,
  getEntityState,
  getCurrentUserSSLMode,
  setCurrentUserSSLMode
} from '../common/utility'
import tabService from '../tabs/tabService'
import { closeTab, updatePostPreScriptExecutedData, updateTab, updateTabDraft } from '../tabs/redux/tabsActions'
import tabStatusTypes from '../tabs/tabStatusTypes'
import CodeTemplate from './codeTemplate'
import SaveAsSidebar from './saveAsSidebar'
import BodyContainer from './displayBody'
import DisplayDescription from './displayDescription'
import DisplayResponse from './displayResponse'
import SampleResponse from './sampleResponse'
import { getCurrentUser, getProxyToken, isAdmin } from '../auth/authServiceV2'
import endpointApiService, { getEndpoint } from './endpointApiService'
import './endpoints.scss'
import GenericTable from './genericTable'
import HostContainer from './hostContainer'
import PublicBodyContainer from './publicBodyContainer'
import { addEndpoint, addExampleRequest } from './redux/endpointsActions'
import { addHistory } from '../history/redux/historyAction'
import Authorization from './displayAuthorization'
import PublicSampleResponse from './publicSampleResponse'
import bodyDescriptionService from './bodyDescriptionService'
import { moveToNextStep } from '../../services/widgetService'
import CookiesModal from '../cookies/cookiesModal'
import moment from 'moment'
import { updateEnvironment } from '../environments/redux/environmentsActions'
import { run, initialize } from '../../services/sandboxservice'
import Script from './script/script'
import * as _ from 'lodash'
import { openModal } from '../modals/redux/modalsActions'
import Axios from 'axios'
import { SortableHandle, SortableContainer, SortableElement } from 'react-18-sortable-hoc'
import ConfirmationModal from '../common/confirmationModal'
import { ReactComponent as DragHandleIcon } from '../../assets/icons/drag-handle.svg'
import { pendingEndpoint, approveEndpoint, rejectEndpoint, draftEndpoint } from '../publicEndpoint/redux/publicEndpointsActions'
import WarningModal from '../common/warningModal'
import { RiDeleteBinLine } from "react-icons/ri";
import { ApproveRejectEntity, PublishEntityButton, UnPublishEntityButton } from '../common/docViewOperations'
import Tiptap from '../tiptapEditor/tiptap'
import { useQuery, useQueryClient } from 'react-query'
import utilityFunctions from '../common/utility.js'
import { getPublishedContentByIdAndType } from '../../services/generalApiService'
import { updateEndpoint } from '../pages/redux/pagesActions.js'
import { statesEnum } from '../common/utility'
import { addAuthorizationDataTypes, grantTypesEnums } from '../common/authorizationEnums.js'
import { updateToken } from '../../store/tokenData/tokenDataActions.js'
import { bodyTypesEnums, rawTypesEnums } from '../common/bodyTypeEnums.js'
import { LiaSaveSolid } from 'react-icons/lia'
import QueryTab from './queryTab/queryTab.jsx'
import { hexToRgb } from '../common/utility'
import { background } from '../backgroundColor.js'
import DisplayUserAndModifiedData from '../common/userService.jsx'
import ApiDocReview from '../apiDocReview/apiDocReview.jsx'
import withRouter from '../common/withRouter.jsx'
import { useParams } from 'react-router-dom'
import { FaPlus } from 'react-icons/fa'
import EndpointBreadCrumb from './endpointBreadCrumb'
import { BsCommand, BsThreeDots } from 'react-icons/bs';
import IconButton from '../common/iconButton.jsx'
import { MdExpandMore } from 'react-icons/md'
import { decodeHtmlEntities, fixSpanTags, getInnerText, getIntoTextBlock, getPathVariableHTML, getQueryParamsHTML, replaceParamsHtmlInHostContainerHtml } from '../../utilities/htmlConverter.js'
import { updatePublicEnv } from '../publishDocs/redux/publicEnvActions.js'
import { IoIosArrowUp } from "react-icons/io";
import { ReactComponent as Example } from '../../assets/icons/example.svg';

const shortid = require('shortid')
const status = require('http-status')
const URI = require('urijs')

const SortableItem = SortableElement(({ children }) => {
  return <>{children}</>
})
const SortableList = SortableContainer(({ children }) => {
  return <>{children}</>
})
const DragHandle = SortableHandle(() => (
  <div className='dragIcon'>
    <DragHandleIcon />
  </div>
))

const mapStateToProps = (state) => {
  return {
    endpoints: state.pages,
    environment: state.environment.environments[state.environment.currentEnvironmentId] || { id: null, name: 'No Environment' },
    currentEnvironmentId: state.environment.currentEnvironmentId,
    currentEnvironment: state?.environment?.environments[state?.environment?.currentEnvironmentId]?.variables || {},
    environments: state.environment.environments,
    historySnapshots: state.history,
    collections: state.collections,
    cookies: state.cookies,
    responseView: state.responseView,
    activeTabId: state.tabs.activeTabId,
    tabs: state?.tabs?.tabs,
    tokenDetails: state?.tokenData?.tokenDetails,
    curlSlider: state.modals?.curlSlider || false,
    users: state.users.usersList,
    pages: state.pages,
    publicEnv: state.publicEnv,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_endpoint: (newEndpoint, rootParentID, callback, props) =>
      dispatch(addEndpoint(ownProps.navigate, newEndpoint, rootParentID, callback, props)),
    update_endpoint: (editedEndpoint, stopSave) => dispatch(updateEndpoint(editedEndpoint, stopSave)),
    example_request: (id,editedEndpoint, callback) => dispatch(addExampleRequest(ownProps.navigate,id,editedEndpoint, callback)),
    close_tab: (id) => dispatch(closeTab(id)),
    add_history: (data) => dispatch(addHistory(data)),
    update_environment: (data) => dispatch(updateEnvironment(data)),
    update_tab: (id, data) => dispatch(updateTab(id, data)),
    open_modal: (modal, data) => dispatch(openModal(modal, data)),
    pending_endpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approve_endpoint: (endpoint, callback) => dispatch(approveEndpoint(endpoint, callback)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    unPublish_endpoint: (endpointId) => dispatch(draftEndpoint(endpointId)),
    update_token: (dataToUpdate) => dispatch(updateToken(dataToUpdate)),
    update_curl_slider: (payload) => dispatch(updateStateOfCurlSlider(payload)),
    update_pre_post_script: (tabId, executionData) => dispatch(updatePostPreScriptExecutedData(tabId, executionData)),
    update_public_env: (key, value) => dispatch(updatePublicEnv(key, value))
  }
}

const untitledEndpointData = {
  data: {
    name: 'Untitled',
    method: 'GET',
    body: {
      type: rawTypesEnums.JSON,
      [bodyTypesEnums['raw']]: { rawType: rawTypesEnums.JSON, value: '' },
      [bodyTypesEnums['application/x-www-form-urlencoded']]: [
        { checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }
      ],
      [bodyTypesEnums['multipart/form-data']]: [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }]
    },
    uri: '',
    updatedUri: '',
    URL: '',
  },
  pathVariables: [],
  environment: {},
  endpoint: {},
  originalHeaders: [
    {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: '',
      type: ''
    }
  ],
  originalParams: [
    {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: '',
      type: ''
    }
  ],
  oldDescription: '',
  headers: [],
  publicBodyFlag: true,
  params: [],
  bodyDescription: {},
  fieldDescription: {},
  sampleResponseArray: [],
  theme: '',
  preScriptText: '',
  postScriptText: '',
  host: {},
  sslMode: getCurrentUserSSLMode(),
  currentView: 'testing',
  docViewData: [
    { type: 'host' },
    { type: 'body' },
    { type: 'params' },
    { type: 'pathVariables' },
    { type: 'headers' },
    { type: 'sampleResponse' }
  ],
  harObject: {},
  authorizationData: {
    authorization: {},
    authorizationTypeSelected: ''
  },
  protocolType: 1
}

const debouncedUpdateDraftData = _.debounce((endpointId, data) => {
  tabService.updateDraftData(endpointId, _.cloneDeep(data))
}, 1000)

const updateTabDraftData = (endpointId, data) => {
  debouncedUpdateDraftData(endpointId, data)
}

const getEndpointContent = async (props) => {
  let isUserOnPublishedPage = isOnPublishedPage()
  let currentIdToShow = isUserOnPublishedPage ? sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) : null

  let endpointId = isUserOnPublishedPage
    ? currentIdToShow
    : props.params.endpointId !== 'new'
      ? props.params?.endpointId
      : props?.activeTabId

  const tabId = props?.tabs[endpointId]
  // showing data from draft if data is modified
  if (!isUserOnPublishedPage && tabId?.isModified && tabId?.type == 'endpoint' && tabId?.draft) {
    return tabId?.draft
  }

  const extractParams = (pattern, pathname) => {
    const patternParts = pattern.split('/')
    const pathParts = pathname.split('/')

    const params = {}
    patternParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const key = part.slice(1)
        params[key] = pathParts[index]
      }
    })

    return params
  }

  // Update the state with the extracted params
  const extractedParams = extractParams('/orgs/:orgId/dashboard/endpoint/:endpointId', window.location.pathname)

  if (extractedParams?.endpointId !== 'new' && props?.pages?.[endpointId] && endpointId) {
    let type = props?.pages?.[currentIdToShow]?.type
    let data = isUserOnPublishedPage ? await getPublishedContentByIdAndType(currentIdToShow, type) : await getEndpoint(endpointId)
    return utilityFunctions.modifyEndpointContent(data, _.cloneDeep(untitledEndpointData))
  }
  return _.cloneDeep(untitledEndpointData)
}

const fetchHistory = (historyId, props) => {
  const history = props?.historySnapshots[historyId]
  let data = history?.endpoint
  let draftData = props?.tabs[historyId]?.draft
  // showing data from draft if data is modified
  if (props?.tabs[historyId]?.isModified && draftData) {
    return { ...draftData, flagResponse: true }
  }
  return { ...utilityFunctions.modifyEndpointContent(_.cloneDeep(data), _.cloneDeep(untitledEndpointData)), flagResponse: true }
}

const withQuery = (WrappedComponent) => {
  return (props) => {
    const params = useParams()
    const queryClient = useQueryClient()
    let currentIdToShow = isOnPublishedPage() ? sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) : null
    let endpointId = isOnPublishedPage() ? currentIdToShow : params.endpointId !== 'new' ? params?.endpointId : props?.activeTabId
    const historyId = params?.historyId

    let queryKey, fetchFunction
    if (historyId && historyId !== 'new') {
      queryKey = ['history', historyId]
      fetchFunction = () => {
        return () => fetchHistory(historyId, props)
      }
    } else {
      queryKey = ['endpoint', endpointId]
      fetchFunction = async () => {
        return getEndpointContent(props)
      };
    }
    const data = useQuery(queryKey, fetchFunction, {
      refetchOnWindowFocus: false,
      cacheTime: 5000000,
      enabled: true,
      staleTime: Infinity,
      retry: 3
    })

    const setOldDataToNewDataForBody = (data) => {

      let endpoint = _.cloneDeep(data.data)
      const bodyType = endpoint?.body?.type
      const untitled = _.cloneDeep(untitledEndpointData.data)
      if (data?.protocolType != 1) {
        untitled.body = data?.data?.body;
      }
      else if (
        [rawTypesEnums.JSON, rawTypesEnums.HTML, rawTypesEnums.JavaScript, rawTypesEnums.XML, rawTypesEnums.TEXT].includes(bodyType) &&
        endpoint.body.raw
      ) {
        untitled.body = endpoint.body
      } else if (
        [rawTypesEnums.JSON, rawTypesEnums.HTML, rawTypesEnums.JavaScript, rawTypesEnums.XML, rawTypesEnums.TEXT].includes(bodyType)
      ) {
        untitled.body = { ...untitled.body, type: bodyType, raw: { rawType: bodyType, value: endpoint?.body?.value } }
      } else if (bodyType === bodyTypesEnums['application/x-www-form-urlencoded'] || bodyType === bodyTypesEnums['multipart/form-data']) {
        if (endpoint.body[bodyType]) {
          untitled.body = endpoint.body
        } else {
          untitled.body = { ...untitled.body, type: bodyType, [bodyType]: endpoint.body?.value || [] }
        }
      } else if (bodyType === bodyTypesEnums['none']) {
        if (
          endpoint.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] ||
          endpoint.body?.[bodyTypesEnums['multipart/form-data']] ||
          endpoint.body?.[bodyTypesEnums['raw']]
        ) {
          untitled.body = endpoint.body
        } else {
          untitled.body = { ...untitled.body, ...endpoint.body }
        }
      }
      delete endpoint.body?.value

      untitled.uri = endpoint.uri
      untitled.URL = endpoint.URL
      untitled.updatedUri = endpoint.updatedUri
      untitled.method = endpoint.method
      untitled.name = endpoint.name
      return _.cloneDeep(untitled)
    }

    const setQueryUpdatedData = (data, callbackFn = null) => {
      let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
      const endpointId = params.endpointId !== 'new' ? params?.endpointId || currentIdToShow : props?.activeTabId
      data.data = setOldDataToNewDataForBody(data)
      queryClient.setQueryData(queryKey, data)
      // only update the data if it is different from default data
      if (!_.isEqual(untitledEndpointData, data)) {
        updateTabDraftData(endpointId, data)
      }
      if (callbackFn) {
        callbackFn()
      }
    }

    const getDataFromReactQuery = (id) => {
      return queryClient.getQueryData(id)
    }
    return (
      <WrappedComponent
        {...props}
        endpointContent={data.data}
        endpointContentLoading={data?.isLoading}
        currentEndpointId={endpointId}
        setQueryUpdatedData={setQueryUpdatedData}
        getDataFromReactQuery={getDataFromReactQuery}
        untitledEndpointData={untitledEndpointData}
      />
    )
  }
}

class DisplayEndpoint extends Component {
  constructor(props) {
    super(props)
    this.handleRemovePublicEndpoint = this.handleRemovePublicEndpoint.bind(this)
    this.myRef = React.createRef()
    this.sideRef = React.createRef()
    this.responseRef = React.createRef();
    this.state = {
      methodList: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      environment: {},
      startTime: '',
      timeElapsed: '',
      response: {},
      endpoint: {},
      title: '',
      flagResponse: false,
      authorizationData: {
        authorization: {},
        authorizationTypeSelected: ''
      },
      oldDescription: '',
      publicBodyFlag: true,
      bodyDescription: {},
      fieldDescription: {},
      sampleResponseFlagArray: [],
      theme: '',
      loader: false,
      saveLoader: false,
      codeEditorVisibility: false,
      isMobileView: false,
      publicEndpointWidth: 0,
      publicEndpointHeight: 0,
      showCookiesModal: false,
      preReqScriptError: '',
      postReqScriptError: '',
      host: {},
      draftDataSet: false,
      runSendRequest: null,
      requestKey: null,
      docOptions: false,
      sslMode: getCurrentUserSSLMode(),
      showAskAiSlider: false,
      endpointContentState: null,
      showEndpointFormModal: false,
      optionalParams: false,
      activeTab: 'default',
      addUrlClass: false,
      fileDownloaded: false,
      sendClickec: false,
      showPublicEnvironments: false,
      loading: false,
      errorFound: true,
    }
    this.setActiveTab = this.setActiveTab.bind(this);
    this.setBody = this.setBody.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.uri = React.createRef()
    this.paramKey = React.createRef()
    this.rawBodyTypes = Object.keys(rawTypesEnums)
  }

  async componentDidMount() {
    this.isMobileView()
    if (this.props.endpointContent) {
      this.setState({ endpointContentState: _.cloneDeep(this.props.endpointContent) })
    }
    this.extractEndpointName()
    // this.endpointId = this.props.endpointId
    this.endpointId = this.props.params.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[5]
        : this.props.location.pathname.split('/')[4]
    if (!this.state.theme) this.setState({ theme: this.props.publicCollectionTheme })

    const { endpointId } = this.props.params
    if (endpointId === 'new') this.setUnsavedTabDataInIDB()
    document.addEventListener('keydown', this.handleKeyDown)
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
    const dynamicColor = hexToRgb(this.props.publicCollectionTheme, 0.02)
    const staticColor = background['background_mainPage']

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `
    }

    this.setState({
      theme: { backgroundStyle }
    })

    const staticColors = background['background_boxes']

    const backgroundStyles = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColors}, ${staticColors})
      `
    }

    this.setState({
      themes: { backgroundStyles }
    })
    this.setState({ fileDownloaded: false })
  }

  componentDidUpdate(prevProps, prevState) {
    const userid = getCurrentUser()?.id
    if (typeof window.SendDataToChatbot === 'function' && this.props?.tabs[this.props?.activeTabId]?.type === 'endpoint') {
      window.SendDataToChatbot({
        bridgeName: 'api',
        threadId: `${userid}-${this.props?.params?.endpointId}`,
        variables: { Proxy_auth_token: getProxyToken(), endpoint: this.props.endpointContent }
      })
    }
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) || this.state.idToRenderState
    if (isOnPublishedPage() && typeof window.SendDataToChatbot === 'function' && this.props?.pages?.[idToRender]?.type === 4) {
      window.SendDataToChatbot({
        bridgeName: 'api',
        threadId: `${userid}-${idToRender}`,
        variables: { Proxy_auth_token: getProxyToken(), endpoint: this.props.endpointContent }
      })
    }
    // window.closeChatbot()
    window.addEventListener('resize', this.updateDimensions)
    if (prevState.isMobileView !== this.state.isMobileView) {
      this.isMobileView()
    }
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.extractEndpointName()
    }

    if (this.props.endpointId !== prevProps.endpointId) {
      this.setState({ flagResponse: false })
    }
    if (
      this.props?.endpointContent &&
      (!_.isEqual(this.state?.endpointContentState?.data, this.props?.endpointContent?.data) ||
        !_.isEqual(this.state?.endpointContentState?.originalParams, this.props?.endpointContent?.originalParams) ||
        !_.isEqual(this.state?.endpointContentState?.originalHeaders, this.props?.endpointContent?.originalHeaders) ||
        !_.isEqual(this.state?.endpointContentState?.pathVariables, this.props?.endpointContent?.pathVariables) ||
        !_.isEqual(this.state?.endpointContentState?.host, this.props?.endpointContent?.host))
    ) {
      this.prepareHarObject()
    }
    if (this.state.endpoint.id !== prevState.endpoint.id) {
      this.setState({ flagResponse: false })
    }

    if (this.props?.endpointContent && !_.isEqual(this.props.endpointContent, this.state.endpointContentState)) {
      this.setState({ endpointContentState: _.cloneDeep(this.props.endpointContent) })
    }
    if (this?.state?.showEndpointFormModal && prevProps.params !== this.props.params) this.setState({ showEndpointFormModal: false })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
    document.removeEventListener('keydown', this.handleKeyDown)
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.removeListener('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  handleShortcuts = (event, data) => {
    const { activeTabId } = this.props.tabs
    const { id: endpointId } = this.props.tab

    if (activeTabId === endpointId) {
      switch (data) {
        case 'TRIGGER_ENDPOINT':
          this.handleSend()
          break
        case 'SAVE_AS':
          this.setState({ saveAsFlag: true }, () => {
            this.openEndpointFormModal()
          })
          break
        case 'SAVE':
          this.handleSave()
          break
        case 'ASK AI':
          this.handleSave()
          break
        default:
      }
    }
  }
  handleKeyDown = (event) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const activeTabId = this.props.activeTabId
    const status = this.props.tabs?.[activeTabId]?.status
    if ((event.metaKey || event.ctrlKey) && event.keyCode === 83) {
      event.preventDefault()
      if (this.props.tab.id === activeTabId) {
        if (status === 'NEW') {
          this.setState({ saveAsFlag: true }, () => {
            this.openEndpointFormModal()
          })
        } else {
          this.handleSave()
        }
      }
    } else if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
      this.handleSend()
    }
    if ((isMac && event.metaKey && event.key === "b") || (!isMac && event.ctrlKey && event.key === "b") && this.props?.tabs[this.props?.activeTabId]?.status !== 'NEW') {
      this.setState({ openPublishConfirmationModal: true })
    }
    if ((isMac && event.metaKey && event.key === "u") || (!isMac && event.ctrlKey && event.key === "u") && this.props?.tabs[this.props?.activeTabId]?.status !== 'NEW' && this.props.pages[this.endpointId]?.isPublished) {
      event.preventDefault();
      this.setState({ openUnPublishConfirmationModal: true })
    }
  }

  updateDimensions = () => {
    this.setState({ publicEndpointWidth: window.innerWidth, publicEndpointHeight: window.innerHeight })
    this.isMobileView()
  }

  isMobileView = () => {
    if (window.innerWidth < 800) {
      this.setState({ isMobileView: true, codeEditorVisibility: true })
    } else {
      this.setState({ isMobileView: false, codeEditorVisibility: false })
    }
  }

  setSslMode() {
    this.setState({ sslMode: !this.state.sslMode }, () => {
      setCurrentUserSSLMode(this.state.sslMode)
    })
  }

  extractEndpointName() {
    if (!isDashboardRoute(this.props, true) && this.props.endpoints) {
      const endpointName = this.props.endpoints[this.props.params.endpointId]?.name
      if (endpointName) this.props.fetch_entity_name(endpointName)
      else this.props.fetch_entity_name()
    }
  }

  getFieldDescription(bodyDescription) {
    const keys = Object.keys(bodyDescription)
    const fieldDescription = {}
    for (let i = 0; i < keys.length; i++) {
      fieldDescription[keys[i]] = bodyDescription[keys[i]].description
    }
    return fieldDescription
  }

  handleChange = (e) => {
    const data = { ...this.props?.endpointContent?.data }
    data[e.currentTarget.name] = e.currentTarget.value
    let tempData = this.props?.endpointContent || {}
    if (e.currentTarget.name === 'URL') {
      const keys = []
      const values = []
      const description = []
      let originalParams = this.props?.endpointContent?.originalParams || {}
      const updatedUri = e.currentTarget.value?.split('?')[1]
      this.setPathVariables(e.currentTarget.value)
      const result = URI.parseQuery(updatedUri)
      for (let i = 0; i < Object.keys(result).length; i++) {
        keys.push(Object.keys(result)[i])
      }
      for (let i = 0; i < keys.length; i++) {
        values.push(result[keys[i]])
        if (originalParams[i]) {
          for (let k = 0; k < originalParams.length; k++) {
            if (originalParams[k].key === keys[i] && originalParams[k].checked === 'true') {
              description[i] = originalParams[k].description
              break
            } else if (k === originalParams.length - 1) {
              description[i] = ''
            }
          }
        }
      }
      originalParams = this.makeOriginalParams(keys, values, description, e.currentTarget.value)
      tempData.originalParams = originalParams
    }
    tempData.data = data
    this.props.setQueryUpdatedData(tempData)
  }

  setUnsavedTabDataInIDB() {
    if (this.props.tab.id === this.props.tabs.activeTabId) {
      clearTimeout(this.saveTimeOut)
      this.saveTimeOut = setTimeout(() => {
        const state = _.cloneDeep(this.state)

        /** clean unnecessary items from state before saving */
        const unnecessaryStateItems = [
          'loader',
          'draftDataSet',
          'saveLoader',
          'codeEditorVisibility',
          'showCookiesModal',
          'methodList',
          'theme',
          'runSendRequest',
          'requestKey'
        ]
        unnecessaryStateItems.forEach((item) => delete state[item])
        this.props.update_tab(this.props.tab.id, { state })
      }, 1000)
    }
  }

  setPathVariables(value) {
    const pathVariablesHtmlData = getPathVariableHTML(value);
    const prevPathVariablesData = this.props?.endpointContent?.pathVariables;
    const pathVariableData = {};
    const pathVariables = [];
    prevPathVariablesData.forEach((pathVar) => {
      pathVariableData[getInnerText(pathVar?.key)] = { value: pathVar?.value, description: pathVar?.description };
    })
    for (let i = 0; i < pathVariablesHtmlData?.length; i++) {
      pathVariables.push({
        checked: 'notApplicable',
        key: fixSpanTags(pathVariablesHtmlData[i]),
        value: pathVariableData[getInnerText(pathVariablesHtmlData[i])]?.value,
        description: pathVariableData[getInnerText(pathVariablesHtmlData[i])]?.description,
      })
    }
    const dummyData = this.props?.endpointContent
    dummyData.pathVariables = pathVariables
    this.props.setQueryUpdatedData(dummyData)
  }

  makeOriginalParams(keys, values, description, value) {
    const originalParams = []
    let trueCounter = 0;
    const queryParamsHtmlData = getQueryParamsHTML(value);
    for (let i = 0; i < this.props?.endpointContent?.originalParams?.length; i++) {
      if (this.props?.endpointContent?.originalParams[i].checked === "false" || this.props?.endpointContent?.originalParams[i].checked === 'false') {
        originalParams.push({
          checked: this.props?.endpointContent?.originalParams[i].checked,
          key: this.props?.endpointContent?.originalParams[i].key,
          value: this.props?.endpointContent?.originalParams[i].value,
          description: this.props?.endpointContent?.originalParams[i].description,
          type: this.props?.endpointContent?.originalParams[i].type
        })
      }
      else if (this.props?.endpointContent?.originalParams[i].checked === "true" && (this.props?.endpointContent?.originalParams[i]?.key?.length > 0 || this.props?.endpointContent?.originalParams[i]?.value?.length > 0 || this.props?.endpointContent?.originalParams[i]?.description?.length > 0)) {
        if (trueCounter > queryParamsHtmlData.length) break;
        originalParams.push({
          checked: "true",
          key: fixSpanTags(queryParamsHtmlData?.[trueCounter]?.key?.html),
          value: fixSpanTags(queryParamsHtmlData?.[trueCounter]?.value?.html),
          description: this.props?.endpointContent?.originalParams[i]?.description,
        })
        trueCounter++;
      }
    }
    while (trueCounter < queryParamsHtmlData.length) {
      originalParams.push({
        checked: 'true',
        key: fixSpanTags(queryParamsHtmlData[trueCounter].key.html),
        value: fixSpanTags(queryParamsHtmlData[trueCounter].value.html),
        description: description[trueCounter] || '',
      })
      trueCounter++;
    }
    originalParams.push({
      checked: 'notApplicable',
      key: '',
      value: '',
      description: '',
      type: ''
    })
    return originalParams
  }

  replaceVariables(str, customEnv) {
    let envVars = this.props?.environment?.variables
    if (customEnv) {
      envVars = customEnv
    }
    str = str?.toString() || ''
    const regexp = /{{((\w|-|\s)+)}}/g
    let match = regexp.exec(str)
    const variables = []
    if (match === null) return str

    if (!envVars) {
      const missingVariable = match[1]
      return `${missingVariable}`
    }

    do {
      variables.push(match[1])
    } while ((match = regexp.exec(str)) !== null)

    for (let i = 0; i < variables.length; i++) {
      const envVariable = envVars[variables[i]]
      if (!envVariable) continue
      const strToReplace = `{{${variables[i]}}}`
      if (envVariable?.currentValue) {
        str = str.replace(strToReplace, envVariable.currentValue)
      } else if (envVariable?.initialValue) {
        str = str.replace(strToReplace, envVariable.initialValue)
      } else {
        str = str.replace(strToReplace, '')
      }
    }
    return str
  }

  replaceVariablesInJson(json, customEnv) {
    const keys = Object.keys(json)
    for (let i = 0; i < keys.length; i++) {
      json[keys[i]] = this.replaceVariables(json[keys[i]], customEnv)
      const updatedKey = this.replaceVariables(keys[i], customEnv)
      if (updatedKey !== keys[i]) {
        json[updatedKey] = json[keys[i]]
        delete json[keys[i]]
      }
    }
    return json
  }

  replaceVariablesInBody(body, bodyType, customEnv) {
    if (bodyType === bodyTypesEnums['multipart/form-data'] || bodyType === bodyTypesEnums['application/x-www-form-urlencoded']) {
      body = this.replaceVariablesInJson(body, customEnv)
    } else if (this.rawBodyTypes?.includes(bodyType)) {
      body = this.replaceVariables(body, customEnv)
    }
    return body
  }

  parseBody(rawBody) {
    let body = {}
    try {
      body = JSON.parse(rawBody)
      return body
    } catch (error) {
      toast.error('Invalid Body')
      return body
    }
  }

  handleErrorResponse(error) {
    const dummyEndpointData = this.props?.endpointContent
    if (error.response) {
      const response = {
        status: error.response.status,
        statusText: status[error.response.status],
        data: error.response.data
      }
      dummyEndpointData.testResponse = response
      dummyEndpointData.flagResponse = true
      this.props.setQueryUpdatedData(dummyEndpointData)
    } else {
      const timeElapsed = new Date().getTime() - this.state.startTime
      const response = {
        data: error.message || 'ERROR:Server Connection Refused'
      }
      dummyEndpointData.testResponse = response
      dummyEndpointData.flagResponse = true
      this.props.setQueryUpdatedData(dummyEndpointData)
      this.setState({ timeElapsed })
    }
  }

  async handleApiCall({ url: api, body, headers: header, bodyType, method, cancelToken, keyForRequest }, preScriptExecution) {
    const currentEndpointId = this.props.currentEndpointId !== 'new' ? this.props.activeTabId : this.props.currentEndpointId
    let responseJson = {}
    try {
      if (isElectron()) {
        // Handle API through Electron Channel
        const { ipcRenderer } = window.require('electron')
        const { sslMode } = this.state
        responseJson = await ipcRenderer.invoke('request-channel', { api, method, body, header, bodyType, keyForRequest, sslMode })
      } else {
        // Handle API through Backend
        responseJson = await endpointApiService.apiTest(api, method, body, header, bodyType, cancelToken)
      }

      if (responseJson.data.success) {
        /** request creation was successfull */
        const currentEnvironment = this.props.environment
        const request = { url: api, body, headers: header, method }
        const code = this.props?.endpointContent?.postScriptText

        this.processResponse(responseJson)

        /** Run Post-Request Script */
        if (!isOnPublishedPage()) {
          const result = this.runScript(code, currentEnvironment, request, responseJson)
          if (!result.success) {
            this.props.update_pre_post_script(currentEndpointId, { preScriptExecution, postScriptExecution: [] })
            this.setState({ postReqScriptError: result.error })
          } else {
            this.setState({ tests: [...this.state.tests, ...result.data.tests] })
            this.props.update_pre_post_script(currentEndpointId, { preScriptExecution, postScriptExecution: result.data.consoleOutput })
          }
        }
      } else {
        /** error occured while creating the request */
        this.handleErrorResponse(responseJson.data.error, this.state.startTime)
      }
    } catch (error) {
      /** if our service fails */
      this.handleErrorResponse(error, this.state.startTime)
    }
  }

  processResponse(responseJson) {
    let response
    if (responseJson?.data?.status) {
      const { status, statusText, response: data, headers } = responseJson.data
      response = { status, statusText, data, headers }
    } else {
      response = { ...responseJson }
    }
    if (responseJson.status === 200) {
      const timeElapsed = new Date().getTime() - this.state.startTime
      const dummyEndpointData = this.props?.endpointContent
      dummyEndpointData.testResponse = response
      dummyEndpointData.flagResponse = true
      this.props.setQueryUpdatedData(dummyEndpointData)
      this.setState({ timeElapsed })
    }
  }

  setPathVariableValues(uris, env) {
    let uri = new URI(uris)
    uri = uri.pathname()
    const pathParameters = uri.split('/')
    const pathVariablesMap = {}

    this.props.endpointContent.pathVariables.forEach((variable) => {
      pathVariablesMap[this.replaceVariables(getInnerText(variable.key), env.variables)] = this.replaceVariables(getInnerText(variable.value), env.variables)
    })

    for (let i = 0; i < pathParameters.length; i++) {
      if (pathParameters[i][0] === ':') {
        const pathVariableKey = pathParameters[i].slice(1).trim()
        if (pathVariablesMap.hasOwnProperty(pathVariableKey) && pathVariablesMap[pathVariableKey] !== '') {
          pathParameters[i] = pathVariablesMap[pathVariableKey]
        } else {
          pathParameters[i] = ':' + pathVariableKey
        }
      }
    }
    const path = pathParameters.join('/')
    return path
  }

  setData = async () => {
    let body = this.props?.endpointContent?.data?.body
    if (this.props?.endpointContent?.data?.body?.type === bodyTypesEnums['raw']) {
      body.value = this.parseBody(body.value)
    }
    body = this.prepareBodyForSending(body)
    const headersData = this.doSubmitHeader('save')
    const updatedParams = this.doSubmitParam()
    const updatedPathVariables = this.doSubmitPathVariables()
    const endpoint = {
      uri: this.props.endpointContent.data.updatedUri,
      name: this.props.endpointContent.data.name,
      requestType: this.props.endpointContent.data.method,
      body: body,
      id: this.state.endpoint.id || null,
      status: this.props.tab?.status || tabStatusTypes.NEW,
      headers: headersData,
      params: updatedParams,
      pathVariables: updatedPathVariables,
      BASE_URL: this.props.endpointContent.host.BASE_URL,
      bodyDescription: this.props.endpointContent.data.body.type === rawTypesEnums.JSON ? this.props.endpointContent.bodyDescription : {},
      authorizationData: this.props.endpointContent.authorizationData,
      protocolType: this.props?.endpointContent.protocolType
    }
    const response = { ...this.props?.endpointContent?.testResponse }
    const createdAt = new Date()
    const timeElapsed = this.state.timeElapsed
    delete response.request
    delete response.config
    const obj = {
      id: shortid.generate(),
      endpoint: { ...endpoint },
      response,
      timeElapsed,
      createdAt
    }
    this.props.add_history(obj)
  }

  checkValue(param, originalParams) {
    let valueFlag = false
    const originalParam = originalParams.find((o) => o.key === param.key)
    if (originalParam.value === null || originalParam.value === '') {
      valueFlag = true
    }
    return valueFlag
  }

  checkEmptyParams() {
    const params = this.props?.endpointContent?.params
    const originalParams = this.props?.endpointContent?.originalParams
    let isEmpty = false
    params.forEach((param) => {
      if (param.checked !== 'notApplicable' && param.checked === 'true' && this.checkValue(param, originalParams)) {
        isEmpty = true
        param.empty = true
      } else {
        param.empty = false
      }
    })
    this.setState({ params })
    return isEmpty
  }

  addhttps(url) {
    if (url) {
      if (this.props?.endpointContent?.data?.updatedUri?.includes('localhost') && !url?.includes('localhost')) {
        url = 'localhost:' + url
      }
      if (!/^(?:f|ht)tps?:\/\//.test(url)) {
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          url = 'http://' + url
        } else {
          url = 'https://' + url
        }
      }
    }
    return url
  }

  prepareHeaderCookies(url) {
    if (!url) return null
    const domainUrl = url.split('/')[2]
    let cookies
    Object.values(this.props.cookies || {}).forEach((domain) => {
      if (domain.domain === domainUrl) {
        cookies = domain?.cookies
      }
    })
    if (cookies) {
      let cookieString = ''
      Object.values(cookies || {}).forEach((cookie) => {
        let time
        const expires = cookie.split(';')[2]
        if (expires.split('=')[1]) {
          time = expires.split('=')[1]
        }
        time = moment(time)
        if (!(time && moment(time).isBefore(moment().format()))) {
          cookieString += cookie.split(';')[0] + '; '
        }
      })
      return cookieString
    }
    return null
  }

  checkTokenExpired(expirationTime, generatedDateTime) {
    if (!expirationTime) return false
    const generatedTime = new Date(generatedDateTime).getTime()
    const expirationDateTime = generatedTime + expirationTime
    const currentTime = new Date().getTime()
    const isExpired = currentTime > expirationDateTime

    return isExpired
  }

  async getRefreshToken(headers, url) {
    let oauth2Data = this.props?.endpointContent?.authorizationData?.authorization?.oauth2
    if (
      this.props?.endpointContent?.authorizationData?.authorizationTypeSelected === 'oauth2' &&
      (this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.grantType === grantTypesEnums.authorizationCode ||
        this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.grantType === grantTypesEnums.authorizationCodeWithPkce)
    ) {
      const generatedDateTime = this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.createdTime
      const expirationTime = this.props.tokenDetails?.[oauth2Data?.selectedTokenId]?.expiryTime
      const isTokenExpired = this.checkTokenExpired(expirationTime, generatedDateTime)
      if (
        isTokenExpired &&
        this.props.tokenDetails[oauth2Data.selectedTokenId]?.refreshTokenUrl &&
        this.props.tokenDetails[oauth2Data.selectedTokenId]?.refreshToken
      ) {
        try {
          const data = await endpointApiService.getRefreshToken(this.props.tokenDetails[oauth2Data.selectedTokenId])
          if (data?.access_token) {
            const dataToUpdate = {
              tokenId: oauth2Data.selectedTokenId,
              accessToken: data.access_token || this.props.tokenDetails[oauth2Data.selectedTokenId]?.accessToken,
              refreshToken: data.refresh_token || this.props.tokenDetails[oauth2Data.selectedTokenId]?.refreshToken,
              expiryTime: data.expires_in || this.props.tokenDetails[oauth2Data.selectedTokenId]?.expiryTime
            }
            this.props.update_token(dataToUpdate)
            if (oauth2Data?.addAuthorizationRequestTo === addAuthorizationDataTypes.requestHeaders && headers?.Authorization) {
              headers.Authorization = `Bearer ${data.access_token}`
              this.setHeaders(data.access_token, 'Authorization.oauth_2')
            } else if (oauth2Data?.addAuthorizationRequestTo === addAuthorizationDataTypes.requestUrl) {
              const urlObj = new URL(url)
              const searchParams = new URLSearchParams(urlObj.search)
              searchParams.set('access_token', data.access_token)
              const newSearchParamsString = searchParams.toString()
              url = urlObj.origin + urlObj.pathname + '?' + newSearchParamsString + urlObj.hash
              this.setParams(data.access_token, 'access_token')
            }
          }
        } catch (error) {
          console.error('could not regenerate the token')
        }
      }
    }
    return { newHeaders: headers, newUrl: url }
  }

  isBase64(response) {
    if (typeof response !== 'string') {
      return false
    }
    const base64Pattern = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
    return base64Pattern.test(response)
  }

  decodeHtmlEntities(input) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    return textarea.value;
  }

  HtmlUrlToString(htmlString) {
    const str = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
    const regex = /{{(.*?)}}/g;
    let matches = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[0]);
    }
    let finalString = str;
    let suggestions = this.props.currentEnvironment;
    if (isOnPublishedPage()) {
      suggestions = this.props.publicEnv;
    }
    matches.forEach(match => {
      const variableName = match.slice(2, -2);
      const suggestion = suggestions[variableName];
      if (suggestion) {
        const valueToReplace = suggestion.currentValue || suggestion.initialValue;
        finalString = finalString.replace(match, valueToReplace);
      }
    });
    return finalString;
  }

  handleSend = async () => {
    const keyForRequest = shortid.generate()
    const runSendRequest = Axios.CancelToken.source()
    const startTime = new Date().getTime()
    const response = {}
    this.setState({ sendClicked: true })
    this.setState({
      startTime,
      response,
      preReqScriptError: '',
      postReqScriptError: '',
      tests: null,
      loader: true,
      requestKey: keyForRequest,
      runSendRequest,
      addUrlClass: false
    })

    if (!isDashboardRoute(this.props, true) && this.checkEmptyParams()) {
      this.setState({ loader: false })
      return
    }

    /** Prepare Headers */
    const headersData = this.doSubmitHeader('send')
    const headerJson = {}
    Object.keys(headersData).forEach((header) => {
      headerJson[getInnerText(header)] = getInnerText(headersData[header].value)
    })

    /** Prepare URL */
    const BASE_URL = this.props.endpointContent.host.BASE_URL || ''
    let url = this.props.endpointContent.data.URL;
    url = this.HtmlUrlToString(decodeHtmlEntities(url));
    let uri = new URI(url)
    let baseUrl
    if (uri.protocol() === 'localhost') {
      baseUrl = uri.origin() || `${uri.protocol()}:`;
    } else {
      baseUrl = uri.origin() || `${uri.protocol()}`;
    }
    const query = uri.query()
    const path = this.setPathVariableValues(url, !isOnPublishedPage() ? this.props.environment : { variables: this.props?.publicEnv });
    url = `${baseUrl}${path}${query ? '?' + query : ''}`
    if (!url) {
      this.setState({ addUrlClass: true })
      setTimeout(() => {
        this.setState({ loader: false })
      }, 500)
      return
    }
    /** Prepare Body & Modify Headers */

    let body, headers
    if (this.checkProtocolType(1)) {
      const data = this.formatBody(this.props?.endpointContent?.data.body, headerJson)
      body = data.body
      headers = data.headers
    } else if (this.checkProtocolType(2)) {
      let variables
      try {
        variables = JSON.parse(this.props?.endpointContent?.data?.body?.variables || '')
      } catch (error) {
        variables = {}
        console.error(error)
      }
      body = { query: this.props?.endpointContent?.data?.body?.query || '', variables }
      headers = headerJson
    }

    /** Add Cookie in Headers */
    const cookiesString = this.prepareHeaderCookies(BASE_URL)
    if (cookiesString) {
      headers.cookie = cookiesString.trim()
    }

    const method = this.checkProtocolType(1) ? this.props?.endpointContent?.data?.method : 'POST'
    /** Set Request Options */
    let requestOptions = null
    const cancelToken = runSendRequest.token
    requestOptions = { url, body, headers, method, cancelToken, keyForRequest }

    const currentEnvironment = this.props.environment
    const code = this.props.endpointContent.preScriptText
    /** Run Pre Request Script */
    let result
    if (!isOnPublishedPage()) {
      result = this.runScript(code, currentEnvironment, requestOptions)
      if (result.success) {
        let { environment, request: { url, headers }, tests } = result.data
        this.setState({ tests })
        /** Replace Environemnt Variables */
        url = this.replaceVariables(url || {}, environment)
        url = this.addhttps(url)
        headers = this.replaceVariablesInJson(headers || {}, environment)
        // Start of Regeneration of AUTH2.0 Token
        const { newHeaders, newUrl } = await this.getRefreshToken(headers, url)
        headers = newHeaders
        url = newUrl
        const bodyType = this.props?.endpointContent?.data?.body?.type
        body = this.replaceVariablesInBody(body, bodyType, environment)
        requestOptions = { ...requestOptions, body, headers, url, bodyType }
        /** Steve Onboarding Step 5 Completed */
        moveToNextStep(5)
        /** Handle Request Call */
        await this.handleApiCall(requestOptions, result?.data?.consoleOutput || '')
        this.setState({
          loader: false,
          runSendRequest: null,
          requestKey: null
        })
        this.setState({ addUrlClass: false })
        setTimeout(() => {
          if (this.responseRef?.current?.scrollIntoView) {
            this.responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 0);
        /** Add to History */
        isDashboardRoute(this.props) && this.setData()
        return
      } else {
        this.setState({ preReqScriptError: result.error, loader: false })
      }
    }
    else {
      url = this.replaceVariables(url || {}, this.props?.publicEnv)
      url = this.addhttps(url)
      headers = this.replaceVariablesInJson(headers || {}, this.props?.publicEnv)
      const bodyType = this.props?.endpointContent?.data?.body?.type
      body = this.replaceVariablesInBody(body, bodyType, this.props?.publicEnv)
      requestOptions = { ...requestOptions, body, headers, url, bodyType }
    }

    try {
      await this.handleApiCall(requestOptions, result?.data?.consoleOutput || '')
    } catch (error) {
      console.error(error)
    }

    this.setState({ loader: false })

    setTimeout(() => {
      if (this.myRef?.current?.scrollIntoView) {
        this.myRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 0)
  }

  runScript(code, environment, request, responseJson) {
    let response

    if (responseJson) {
      const { status, statusText, response: body, headers } = responseJson.data
      response = { status, statusText, body, headers }
      response = { value: response }
    }

    if (code?.trim()?.length === 0 || !isDashboardRoute(this.props, true)) {
      return { success: true, data: { environment: environment.variables, request, response, tests: [] } }
    }

    const env = {}
    if (environment?.variables) {
      for (const [key, value] of Object.entries(environment.variables)) {
        env[key] = value.currentValue
      }
    }

    environment = { value: env, callback: this.envCallback }
    request = { value: request }

    return run(code, initialize({ environment, request, response }))
  }

  envCallback = (variablesObj) => {
    const currentEnv = { ...this.props.environment }
    const variables = {}
    const getInitalValue = (key) => {
      return currentEnv?.variables?.[key]?.initialValue || ''
    }
    if (currentEnv.id) {
      for (const [key, value] of Object.entries(variablesObj)) {
        variables[key] = { initialValue: getInitalValue(key), currentValue: value }
      }
      this.props.update_environment({ ...currentEnv, variables })
    }
  }

  extractPosition(groupId) {
    let count = -1
    for (let i = 0; i < Object.keys(this.props.endpoints).length; i++) {
      if (groupId === this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId) {
        count = count + 1
      }
    }
    return count + 1
  }

  prepareBodyForSaving(body) {
    const data = _.cloneDeep(body)
    if (data?.type === bodyTypesEnums['multipart/form-data']) {
      data[bodyTypesEnums['multipart/form-data']].forEach((item) => {
        if (item.type === 'file') item.value = {}
      })
    }
    return data
  }

  prepareBodyForSending(body) {
    const data = _.cloneDeep(body)
    if (data.type === bodyTypesEnums['multipart/form-data']) {
      data[bodyTypesEnums['multipart/form-data']].forEach((item) => {
        if (item.type === 'file') item.value.srcPath = ''
      })
    }
    return data
  }

  handleSave = async (id, endpointObject, slug, saveType = null) => {
    const { endpointName, endpointDescription } = endpointObject || {}
    let currentTabId = this.props.tab.id
    let parentId = id
    if (
      (currentTabId && !this.props.pages[currentTabId] && !this.state.showEndpointFormModal) ||
      (this.props?.params?.historyId && slug !== 'isHistory')
    ) {
      this.openEndpointFormModal()
    } else {
      let endpointContent = this.props.getDataFromReactQuery(['endpoint', currentTabId])
      const body = this.prepareBodyForSaving(endpointContent?.data?.body)
      const bodyDescription = bodyDescriptionService.handleUpdate(false, {
        body_description: endpointContent?.bodyDescription,
        body: body?.value
      })
      if (this.checkProtocolType(1) && this.props?.endpointContent?.data?.body.type === bodyTypesEnums['raw']) {
        body.value = this.parseBody(body.value)
      }
      const headersData = this.doSubmitHeader('save')
      const updatedParams = this.doSubmitParam()
      let updatedPathVariables = this.doSubmitPathVariables()
      updatedPathVariables = Object.keys(updatedPathVariables).reduce((obj, key) => {
        obj[key] = updatedPathVariables[key]
        return obj
      }, {})
      let endpoint = {
        id: slug === 'isHistory' ? this.props?.params?.historyId : currentTabId,
        URL: endpointContent?.data?.URL,
        name: this.state.saveAsFlag ? endpointName : endpointContent?.data?.name,
        requestType: endpointContent?.data?.method,
        body: body,
        headers: headersData,
        params: updatedParams,
        pathVariables: updatedPathVariables,
        bodyDescription: endpointContent?.bodyDescription,
        authorizationData: endpointContent?.authorizationData,
        notes: endpointContent?.endpoint.notes,
        preScript: endpointContent?.preScriptText,
        postScript: endpointContent?.postScriptText,
        docViewData: endpointContent?.docViewData,
        protocolType: endpointContent?.protocolType || null,
        description: endpointContent?.description || "",
        sampleResponse: endpointContent?.sampleResponseArray || []
      }
      if (trimString(endpoint.name) === '' || trimString(endpoint.name)?.toLowerCase() === 'untitled')
        return toast.error('Please enter Endpoint name')
      else if (currentTabId && !this.props.pages[currentTabId]) {
        // endpoint.requestId = currentTabId
        this.setState({ saveAsLoader: true })
        this.props.add_endpoint(
          endpoint,
          parentId,
          ({ closeForm, stopLoader }) => {
            if (closeForm) this.closeEndpointFormModal()
            if (stopLoader) this.setState({ saveAsLoader: false })
          },
          this.props
        )
        moveToNextStep(4)
      } else if (saveType == 'example') {
        this.setState({ saveAsLoader: true })
        delete endpoint.id
        this.props.example_request(
          currentTabId,
          endpoint,
          ({ closeForm, stopLoader }) => {
            if (closeForm) this.closeEndpointFormModal()
            if (stopLoader) this.setState({ saveAsLoader: false })
          }
        )
      }
      else {
        if (this.state.saveAsFlag || slug === 'isHistory') {
          endpoint.description = endpointDescription || ''
          // 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
          delete endpoint.state
          delete endpoint.isPublished
          this.setState({ saveAsLoader: true })
          this.props.add_endpoint(
            endpoint,
            parentId,
            ({ closeForm, stopLoader }) => {
              if (closeForm) this.closeEndpointFormModal()
              if (stopLoader) this.setState({ saveAsLoader: false })
            },
            this.state.saveAsFlag
          )
          moveToNextStep(4)
        } else {
          // endpoint.isPublished = this.props.endpoints[this.endpointId]?.isPublished
          // not sending isPublished during put method
          // 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
          endpoint.state = statesEnum.DRAFT_STATE
          this.setState({ saveLoader: true })
          this.props.update_endpoint(
            {
              ...endpoint,
              id: currentTabId
            },
            () => {
              this.setState({ saveLoader: false })
            }
          )
          if (endpoint.description !== '') {
            this.props.endpoints[currentTabId].description = true
          } else {
            this.props.endpoints[currentTabId].description = false
          }
          tabService.markTabAsSaved(currentTabId)
        }
      }
    }
  }

  doSubmitPathVariables() {
    if (this.props?.endpointContent.pathVariables) {
      const pathVariables = this.props?.endpointContent?.pathVariables || []
      const endpoint = { ...this.props?.endpointContent }
      endpoint.pathVariables = pathVariables
      this.props.setQueryUpdatedData(endpoint)
      return pathVariables
    }
    return []
  }

  doSubmitHeader(title) {
    const originalHeaders = [...this.props?.endpointContent.originalHeaders]
    originalHeaders.map((item) => {
      if (item.key) {
        item.key = item.key.trim()
      }
    })
    const updatedHeaders = {}
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === '') {
        continue
      } else if (originalHeaders[i].checked === 'true' || title === 'save') {
        updatedHeaders[originalHeaders[i].key] = {
          checked: originalHeaders[i].checked,
          value: originalHeaders[i].value,
          description: originalHeaders[i].description
        }
      }
    }
    const endpoint = { ...this.props?.endpointContent }
    endpoint.headers = { ...updatedHeaders }
    this.props.setQueryUpdatedData(endpoint)
    return updatedHeaders
  }

  setMethod(method) {
    const dummyData = this.props?.endpointContent
    dummyData.data.method = method
    this.props.setQueryUpdatedData(dummyData)
    const response = {}
    this.setState({ response }, () => this.setModifiedTabData())
  }

  setModifiedTabData() {
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id)
      this.setUnsavedTabDataInIDB()
    }
  }

  propsFromChild(name, value, targetName, index) {
    if (name === 'Params') {
      this.handleUpdateUri(value, targetName, index)
      this.setModifiedTabData()
      const dummyData = this?.props?.endpointContent
      dummyData.originalParams = [...value]
      this.setState({ endpointContentState: dummyData })
      this.props.setQueryUpdatedData(dummyData, this.prepareHarObject.bind(this))
    }

    if (name === 'Headers') {
      this.setModifiedTabData()
      const dummyData = this?.props?.endpointContent
      dummyData.originalHeaders = [...value]
      this.setState({ endpointContentState: dummyData })
      this.props.setQueryUpdatedData(dummyData, this.prepareHarObject.bind(this))
    }

    if (name === 'Path Variables') {
      this.setModifiedTabData()
      const dummyData = this?.props?.endpointContent
      dummyData.pathVariables = [...value]
      this.setState({ endpointContentState: dummyData })
      this.props.setQueryUpdatedData(dummyData, this.prepareHarObject.bind(this))
    }

    if (name === 'HostAndUri') {
      this.setModifiedTabData()
    }
  }

  setPublicBody(body) {
    const data = { ...this.props?.endpointContent?.data }
    data.body = { type: data?.body?.type ?? bodyTypesEnums['none'], value: body }
    const tempData = this.props?.endpointContent
    tempData.data = data
    this.props.setQueryUpdatedData(tempData)
    this.setState({ data, publicBodyFlag: false })
  }

  handleUpdateUri(originalParams) {
    const tempdata = this.props.endpointContent;
    let newHTML = tempdata.data.URL;
    let queryParamsHtmlData = getQueryParamsHTML(tempdata.data.URL);
    if (queryParamsHtmlData.length != 0 && queryParamsHtmlData[0]?.key?.startIndex) {
      newHTML = newHTML.substring(0, queryParamsHtmlData[0].key.startIndex);
      if (!newHTML.endsWith('</span>')) newHTML = newHTML + '</span>';
    }
    let count = 0, paramsHTML = '';
    originalParams.forEach((params) => {
      if (params.checked == "true") {
        if (count >= 1) paramsHTML += getIntoTextBlock('&')
        paramsHTML = paramsHTML + `${params.key}${getIntoTextBlock('=')}${params.value}`;
        count++;
      }
    });
    let counter = newHTML.length
    while (counter > -1) {
      if (newHTML[counter] === '?') break;
      counter--;
    }
    if (count === 0) {
      if (counter === -1 || counter === 0) {
        tempdata.data.URL = newHTML;
      }
      else {
        newHTML = newHTML.substring(0, counter);
        if (newHTML.endsWith("<span text-block='true'>") || newHTML.endsWith('<span text-block="true">')) {
          newHTML = newHTML?.slice(0, -24);
        }
        else if (!newHTML.endsWith('</span>')) {
          newHTML = newHTML + '</span>';
        }
        tempdata.data.URL = newHTML;
      }
    }
    else {
      if (counter === -1 || counter === 0) {
        tempdata.data.URL = newHTML + getIntoTextBlock('?') + paramsHTML;
      }
      else {
        tempdata.data.URL = newHTML + paramsHTML;
      }
    }
    this.props.setQueryUpdatedData(tempdata)
  }

  doSubmitParam() {
    const originalParams = [...this.props?.endpointContent.originalParams]
    const updatedParams = {}
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key === '') {
        continue
      } else {
        updatedParams[originalParams[i].key] = {
          checked: originalParams[i].checked,
          value: originalParams[i].value,
          description: originalParams[i].description
        }
      }
    }
    const endpoint = { ...this.props?.endpointContent }
    endpoint.params = { ...updatedParams }
    this.props.setQueryUpdatedData(endpoint)
    return updatedParams
  }

  openEndpointFormModal() {
    this.setState({ showEndpointFormModal: true })
  }

  closeEndpointFormModal() {
    this.setState({ showEndpointFormModal: false, saveAsFlag: false })
  }

  makeHeaders(headersData) {
    const processedHeaders = Object.keys(headersData).map(header => ({
      name: getInnerText(header),
      value: getInnerText(headersData[header].value) || '""',
      comment: headersData[header].description || '',
      type: headersData[header].type || ''
    })).filter(header => header.name || header.value);
    return processedHeaders
  }

  makeParams(params) {
    const processedParams = []
    if (params) {
      for (let i = 0; i < Object.keys(params).length; i++) {
        if (params[Object.keys(params)[i]].checked === 'true') {
          processedParams.push({
            name: getInnerText(params[Object.keys(params)[i]].key),
            value: getInnerText(params[Object.keys(params)[i]].value),
            comment: params[Object.keys(params)[i]].description,
            type: params[Object.keys(params)[i]].type
          })
        }
      }
    }
    return processedParams
  }

  async makePostData(body) {
    const params = []
    let paramsFlag = false
    let postData = {}
    if (body.type === bodyTypesEnums['application/x-www-form-urlencoded'] || body.type === bodyTypesEnums['multipart/form-data']) {
      paramsFlag = true
      let data = body[body.type]
      for (let i = 0; i < data.length; i++) {
        if (data[i].checked === 'true' && getInnerText(data[i].key) !== '') {
          params.push({
            name: getInnerText(data[i].key),
            value: getInnerText(data[i].value),
            fileName: null,
            contentType: null
          })
        }
      }
      postData = {
        mimeType: body?.type,
        params: params,
        comment: ''
      }
    } else {
      postData = {
        mimeType: body?.type,
        params: params,
        text: paramsFlag === false ? body?.raw?.value : '',
        comment: ''
      }
    }
    return postData
  }

  async prepareHarObject() {
    let url = this.props.endpointContent.data.URL;
    url = this.HtmlUrlToString(decodeHtmlEntities(url));
    url = encodeURI(url)
    let uri = new URI(url)
    const baseUrl = uri.origin()
    const query = uri.query()
    const path = this.setPathVariableValues(url, !isOnPublishedPage() ? this.props.environment : { variables: this.props?.publicEnv })
    url = `${baseUrl}${path}${query ? '?' + query : ''}`
    url = decodeURIComponent(url);
    const method = this.props?.endpointContent?.data?.method || ''
    const body = this.props?.endpointContent?.data?.body || {}
    const { originalParams } = this.props?.endpointContent || {}

    const headersData = this.doSubmitHeader('send')
    const harObject = {
      method,
      url: url,
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: this.makeHeaders(headersData || {}),
      postData: body && body.type !== bodyTypesEnums['none'] ? await this.makePostData(body) : null,
      queryString: this.makeParams(originalParams)
    }
    if (!harObject.url.split(':')[1] || harObject.url.split(':')[0] === '') {
      harObject.url = 'https://' + url
    }
    const updatedharObject = {
      ...this.props.endpointContent,
      harObject: harObject
    }
    this.props.setQueryUpdatedData(updatedharObject)
  }

  openCodeTemplate(harObject) {
    this.setState({
      showCodeTemplate: true,
      harObject
    })
  }

  showCodeTemplate() {
    return (
      <CodeTemplate
        show
        onHide={() => {
          this.setState({ showCodeTemplate: false })
        }}
        harObject={this.props?.endpointContent?.harObject}
        title='Generate Code Snippets'
      />
    )
  }

  setBaseUrl(BASE_URL, selectedHost) {
    this.setState({ host: { BASE_URL, selectedHost } })
    const tempData = this?.props?.endpointContent || untitledEndpointData
    tempData.host = { BASE_URL, selectedHost }
    this.props.setQueryUpdatedData(tempData)
  }

  setBody(bodyType, body, rawType) {
    let data = { ...this.props?.endpointContent.data }
    if (this.rawBodyTypes.includes(bodyType)) {
      data.body = { ...data.body, type: bodyType, [bodyTypesEnums['raw']]: { rawType, value: body } }
    } else if (bodyType === bodyTypesEnums['application/x-www-form-urlencoded'] || bodyType === bodyTypesEnums['multipart/form-data']) {
      data.body = { ...data.body, type: bodyType, [bodyType]: body }
    } else if (bodyType === bodyTypesEnums['none']) {
      data.body = { ...data.body, type: bodyType }
    }
    isDashboardRoute(this.props) && this.setHeaders(bodyType, 'content-type')
    this.setModifiedTabData()
    const tempData = this.props.endpointContent
    tempData.data = data
    this.props.setQueryUpdatedData(tempData)
  }

  setQueryTabBody(queryTabData) {

    let data = { ...this.props?.endpointContent.data }
    data.body = queryTabData
    this.setModifiedTabData()
    const tempData = this.props.endpointContent
    tempData.data = data
    this.props.setQueryUpdatedData(tempData)
  }

  setBodyDescription(type, value) {
    const data = {}
    try {
      if (value.trim() === '') {
        data.bodyDescription = {}
        return data
      }
      const body = JSON.parse(value)
      const keys = Object.keys(body)
      const bodyDescription = {}
      for (let i = 0; i < keys.length; i++) {
        if (typeof body[keys[i]] !== 'object') {
          bodyDescription[keys[i]] = {
            default: body[keys[i]],
            description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
            dataType: typeof body[keys[i]]
          }
        } else {
          if (typeof body[keys[i]] === 'object' && Array.isArray(body[keys[i]])) {
            if (body[keys[i]].length !== 0) {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
                dataType: 'Array of ' + typeof body[keys[i]][0]
              }
            } else {
              bodyDescription[keys[i]] = {
                default: [''],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
                dataType: 'Array of string'
              }
            }
          } else if (typeof body[keys[i]] === 'object') {
            const bodyField = body[keys[i]]
            const key = Object.keys(bodyField)
            if (key.length > 0 && typeof bodyField[key[0]] === 'object') {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
                dataType: 'Object of objects'
              }
            } else {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]] ? this.state.fieldDescription[keys[i]] : '',
                dataType: typeof body[keys[i]]
              }
            }
          }
        }
      }
      data.bodyDescription = bodyDescription
      return data
    } catch (error) {
      data.error = error
      return data
    }
  }

  setDescription(bodyDescription) {
    this.setState({ bodyDescription })
    const tempData = this.props.endpointContent
    tempData.bodyDescription = bodyDescription
    this.props.setQueryUpdatedData(tempData)
  }

  setFieldDescription(fieldDescription, bodyDescription) {
    this.setState({ fieldDescription, bodyDescription })
    const tempData = this.props.endpointContent
    tempData.fieldDescription = fieldDescription
    tempData.bodyDescription = bodyDescription
    this.props.setQueryUpdatedData(tempData)
  }

  setParams(value, title, authorizationFlag, tokenIdToSave) {
    const originalParams = this.props.endpointContent.originalParams
    const updatedParams = []
    const emptyParam = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: '',
      type: 'enable'
    }
    let accessTokenIndex = -1
    for (let i = 0; i < originalParams.length; i++) {
      if (getInnerText(originalParams[i].key) === 'access_token') {
        authorizationFlag = true;
        accessTokenIndex = i
      }
      if (originalParams[i].key === title || originalParams[i].key === '') {
        continue
      } else {
        updatedParams.push(originalParams[i])
      }
    }
    if (title === 'access_token' && !authorizationFlag) {
      updatedParams.push({
        checked: 'true',
        key: getIntoTextBlock(title),
        value: getIntoTextBlock(value),
        description: '',
        type: 'disable'
      })
    }
    if (title === 'access_token' && authorizationFlag && accessTokenIndex > -1) {
      updatedParams[accessTokenIndex].value = getIntoTextBlock(value)
    }
    updatedParams.push(emptyParam)
    const dummyData = this.props.endpointContent
    dummyData.originalParams = updatedParams
    if (dummyData?.authorizationData?.authorization?.oauth2) {
      dummyData.authorizationData.authorization.oauth2 = {
        ...dummyData?.authorizationData?.authorization?.oauth2,
        selectedTokenId: tokenIdToSave
      }
    } else {
      dummyData.authorizationData.authorization = { oauth2: {} }
      dummyData.authorizationData.authorization.oauth2 = {
        ...dummyData?.authorizationData?.authorization?.oauth2,
        selectedTokenId: tokenIdToSave
      }
    }
    this.props.setQueryUpdatedData(dummyData)
    this.propsFromChild('Params', updatedParams)
  }

  setHeaders(value, title) {
    const rawBodyTypes = {
      'JavaScript': "application/javascript",
      "JSON": 'application/json',
      "TEXT": 'text/plain',
      'HTML': 'text/html',
      "XML": 'application/xml'
    };
    const originalHeaders = this.props.endpointContent.originalHeaders;
    originalHeaders.pop();
    function findAuthorizationKeyOrContentTypeIndex(title) {
      let getIndex = -1;
      originalHeaders.forEach((headers, index) => {
        if (getInnerText(headers.key) === title) {
          getIndex = index;
          return;
        }
      });
      return getIndex
    }

    if (title === 'oauth2' || title === 'basicAuth') {
      const authorizationKeyIndex = findAuthorizationKeyOrContentTypeIndex('Authorization');
      if (authorizationKeyIndex > -1) {
        originalHeaders[authorizationKeyIndex].value = getIntoTextBlock(value);
      }
      else {
        originalHeaders.push({ checked: 'true', key: getIntoTextBlock('Authorization'), value: getIntoTextBlock(value), description: '', type: 'disable' })
      }
    }
    else if (title === 'content-type') {
      const contentTypeKeyIndex = findAuthorizationKeyOrContentTypeIndex(title);
      if (Object.keys(rawBodyTypes).includes(value) && contentTypeKeyIndex > -1) {
        originalHeaders[contentTypeKeyIndex].value = getIntoTextBlock(rawBodyTypes[value]);
      }
      else if (value === "none") {
        originalHeaders.splice(contentTypeKeyIndex, 1);
      }
      else if (contentTypeKeyIndex > -1) {
        originalHeaders[contentTypeKeyIndex].value = getIntoTextBlock(value);
      }
      else {
        originalHeaders.push({ checked: 'true', key: getIntoTextBlock('content-type'), value: getIntoTextBlock(rawBodyTypes[value]), description: '', type: 'disable' })
      }
    }
    const emptyHeader = { checked: 'notApplicable', key: '', value: '', description: '', type: 'enable' };
    originalHeaders.push(emptyHeader)
    this.props.setQueryUpdatedData({ ...this.props.endpointContent, originalHeaders: [...originalHeaders] })
  }

  deleteHeader() {
    const originalHeaders = this.props.endpointContent.originalHeaders
    const updatedHeaders = []
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === 'Authorization' && originalHeaders[i].type === 'disable') {
        continue
      } else {
        updatedHeaders.push(originalHeaders[i])
      }
    }
    this.propsFromChild('Headers', updatedHeaders)
  }

  deleteParams() {
    const originalParams = this.props.endpointContent.originalParams
    const updatedParams = []
    const emptyParam = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: '',
      type: 'enable'
    }
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key === 'access_token' && originalParams[i].type === 'disable') {
        continue
      } else {
        updatedParams.push(originalParams[i])
      }
    }
    const dummyData = this.props.endpointContent
    dummyData.originalParams = updatedParams
    this.handleUpdateUri(updatedParams)
  }

  identifyBodyType(bodyType) {
    switch (bodyType) {
      case bodyTypesEnums['application/x-www-form-urlencoded']:
        return bodyTypesEnums['application/x-www-form-urlencoded']
      case bodyTypesEnums['multipart/form-data']:
        return bodyTypesEnums['multipart/form-data']
      case rawTypesEnums.TEXT:
        return 'text/plain'
      case rawTypesEnums.JSON:
        return 'application/json'
      case rawTypesEnums.HTML:
        return 'text/HTML'
      case rawTypesEnums.XML:
        return 'application/XML'
      case rawTypesEnums.JavaScript:
        return 'application/JavaScript'
      default:
        break
    }
  }

  propsFromDescription(title, data) {
    if (title === 'data') {
      this.setState({ data: data }, () => this.setModifiedTabData())
    }
    if (title === 'endpoint') this.setState({ endpoint: data })
    if (title === 'oldDescription') this.setState({ oldDescription: data })
    const endpointContent = this.props?.endpointContent
    endpointContent.description = title
    this.props.setQueryUpdatedData(endpointContent)
    this.setModifiedTabData()
  }

  propsFromSampleResponse(sampleResponseArray, sampleResponseFlagArray) {
    this.setState({ sampleResponseFlagArray })
    const updatedEndpointData = {
      ...this.props.endpointContent,
      sampleResponseArray: sampleResponseArray
    }
    this.props.setQueryUpdatedData(updatedEndpointData)
    this.props.update_endpoint({
      id: this.props.currentEndpointId,
      sampleResponse: sampleResponseArray
    })
    if (sampleResponseArray) {
      this.props.endpoints[this.props.currentEndpointId].sampleResponse = true
    } else {
      this.props.endpoints[this.props.currentEndpointId].sampleResponse = false
    }
  }

  makeFormData(body) {
    const formData = {}
    for (let i = 0; i < body.length; i++) {
      if (getInnerText(body[i].key).length !== 0 && body[i].checked === 'true') {
        if (!isElectron() && body[i].type === 'file') {
          continue
        }
        formData[getInnerText(body[i].key)] = getInnerText(body[i].value)
      }
    }
    return formData
  }

  formatBody(body, headers) {
    let finalBodyValue = null
    switch (body.type) {
      case bodyTypesEnums['raw']:
        finalBodyValue = this.parseBody(body?.raw?.value || '')
        return { body: finalBodyValue, headers }
      case bodyTypesEnums['multipart/form-data']: {
        const formData = this.makeFormData(body[bodyTypesEnums['multipart/form-data']])
        headers['content-type'] = bodyTypesEnums['multipart/form-data']
        return { body: formData, headers }
      }
      case bodyTypesEnums['application/x-www-form-urlencoded']: {
        const urlEncodedData = {}
        for (let i = 0; i < body?.[bodyTypesEnums['application/x-www-form-urlencoded']].length; i++) {
          let innerTextKey = getInnerText(body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].key)
          let innerTextValue = getInnerText(body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].value)
          if (innerTextKey.length !== 0 && body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].checked === 'true') {
            urlEncodedData[innerTextKey] = innerTextValue
          }
        }
        return { body: urlEncodedData, headers }
      }
      default:
        return { body: body?.raw?.value, headers }
    }
  }

  setAuthType(type, value) {
    this.setModifiedTabData()
    const dummyData = { ...this.props.endpointContent };
    dummyData.authorizationData = {
      ...dummyData.authorizationData,
      authorizationTypeSelected: type,
      authorization: {
        ...dummyData.authorizationData.authorization,
        'basicAuth': {
          username: value.username,
          password: value.password
        }
      }
    };
    this.props.setQueryUpdatedData(dummyData)
  }

  addSampleResponse(response) {
    const { data, status } = response
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    const description = ''
    const title = ''
    const sampleResponse = { data, status, description, title }
    const sampleResponseArray = [...this.props.endpointContent.sampleResponseArray, sampleResponse]
    sampleResponseFlagArray.push(false)
    this.setState({ sampleResponseFlagArray })
    const updatedEndpointData = {
      ...this.props.endpointContent,
      sampleResponseArray: sampleResponseArray
    }
    this.props.setQueryUpdatedData(updatedEndpointData)
    this.props.update_endpoint({
      id: this.props.currentEndpointId,
      sampleResponse: sampleResponseArray
    })
    if (sampleResponseArray) {
      this.props.endpoints[this.props.currentEndpointId].sampleResponse = true
    } else {
      this.props.endpoints[this.props.currentEndpointId].sampleResponse = false
    }
  }

  openBody(index) {
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    sampleResponseFlagArray[index] = true
    this.setState({ sampleResponseFlagArray })
  }

  closeBody(index) {
    const sampleResponseFlagArray = [...this.state.sampleResponseFlagArray]
    sampleResponseFlagArray[index] = false
    this.setState({ sampleResponseFlagArray })
  }

  handleCancel() {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.invoke('request-cancel', this.state.requestKey)
    } else {
      const CUSTOM_REQUEST_CANCELLATION = 'Request was cancelled'
      this.state.runSendRequest.cancel(CUSTOM_REQUEST_CANCELLATION)
    }
    this.setState({
      loader: false,
      runSendRequest: null,
      requestKey: null
    })
  }

  displayResponse() {
    if (this.isNotDashboardOrDocView() && this.props?.endpointContent?.flagResponse) {
      return (
        <div ref={this.myRef} className='hm-panel endpoint-public-response-container public-doc'>
          <DisplayResponse
            {...this.props}
            loader={this.state.loader}
            timeElapsed={this.state.timeElapsed}
            response={this.props?.endpointContent?.testResponse}
            flagResponse={this.props?.endpointContent?.flagResponse}
            add_sample_response={this.addSampleResponse.bind(this)}
            handleCancel={() => {
              this.handleCancel()
            }}
            tests={this.state.tests}
            sample_response_array={this.props?.endpointContent?.sampleResponseArray}
            sample_response_flag_array={this.state?.sampleResponseFlagArray}
            props_from_parent={this.propsFromSampleResponse.bind(this)}
          />
        </div>
      )
    }
  }

  displayPublicSampleResponse() {
    if (this.props?.endpointContent?.sampleResponseArray?.length) {
      return (
        <div className='mt-3'>
          <PublicSampleResponse
            highlights={this.props?.highlights}
            sample_response_array={this.props?.endpointContent?.sampleResponseArray}
            publicCollectionTheme={this.props?.publicCollectionTheme}
          />
        </div>
      )
    }
  }

  checkProtocolType(protocolType = 1) {
    if (this.props?.endpointContent?.protocolType === protocolType) return true
    return false
  }

  setActiveTab() {
    this.setState({ activeTab: 'default' })
  }

  displayResponseAndSampleResponse() {
    return (
      <>
        <div className='custom-tabs clear-both response-container mb-2'>
          <div className='d-flex justify-content-between align-items-center w-100'>
            <ul className='nav nav-tabs respTabsListing w-100 rounded-0 border-0' id='myTab' role='tablist'>
              <li className='nav-item'>
                <a
                  className='nav-link bg-none active text-secondary'
                  id='pills-response-tab'
                  data-toggle='pill'
                  href={this.isDashboardAndTestingView() ? `#response-${this.props.tab.id}` : '#response'}
                  role='tab'
                  aria-controls={this.isDashboardAndTestingView() ? `response-${this.props.tab.id}` : 'response'}
                  aria-selected='true'
                >
                  Response
                </a>
              </li>
              {getCurrentUser() && (
                <li className='nav-item'>
                  <a
                    className='nav-link text-secondary'
                    id='pills-sample-tab'
                    data-toggle='pill'
                    href={this.isDashboardAndTestingView() ? `#sample-${this.props.tab.id}` : '#sample'}
                    role='tab'
                    aria-controls={this.isDashboardAndTestingView() ? `sample-${this.props.tab.id}` : 'sample'}
                    aria-selected='false'
                  >
                    Sample Response
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className='tab-content responseTabWrapper' id='pills-tabContent'>
            <div
              className='tab-pane fade show active'
              id={this.isDashboardAndTestingView() ? `response-${this.props.tab.id}` : 'response'}
              role='tabpanel'
              aria-labelledby='pills-response-tab'
            >
              <div ref={this.responseRef} className='hm-panel endpoint-public-response-container '>
                <DisplayResponse
                  {...this.props}
                  loader={this.state?.loader}
                  timeElapsed={this.state?.timeElapsed}
                  response={this.props?.endpointContent?.testResponse}
                  tests={this.state.tests}
                  flagResponse={this.props?.endpointContent?.flagResponse}
                  sample_response_array={this.props?.endpointContent?.sampleResponseArray}
                  sample_response_flag_array={this.state.sampleResponseFlagArray}
                  add_sample_response={this.addSampleResponse.bind(this)}
                  props_from_parent={this.propsFromSampleResponse.bind(this)}
                  handleCancel={() => {
                    this.handleCancel()
                  }}
                  handleSave={this.handleSave.bind(this)}
                />
              </div>
            </div>
            {getCurrentUser() && (
              <div
                className='tab-pane fade'
                id={this.isDashboardAndTestingView() ? `sample-${this.props.tab.id}` : 'sample'}
                role='tabpanel'
                aria-labelledby='pills-sample-tab'
              >
                {this.renderSampleResponse()}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  renderSampleResponse() {
    return (
      <SampleResponse
        {...this.props}
        timeElapsed={this.state?.timeElapsed}
        response={this.state?.response}
        flagResponse={this.state?.flagResponse}
        sample_response_array={this.props?.endpointContent?.sampleResponseArray}
        sample_response_flag_array={this.state.sampleResponseFlagArray}
        open_body={this.openBody.bind(this)}
        close_body={this.closeBody.bind(this)}
        props_from_parent={this.propsFromSampleResponse.bind(this)}
        currentView={this.props?.endpointContent?.currentView}
      />
    )
  }

  displayPublicResponse() {
    const historyId = this.props?.params?.historyId
    const testResponse = this.props?.endpointContent?.testResponse

    if (this.isBase64(testResponse?.data)) {
      if (this.state.sendClicked && !this.state.fileDownloaded) {
        try {
          const byteCharacters = atob(testResponse?.data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)

          const blob = new Blob([byteArray.buffer], { type: 'application/pdf' })

          const url = URL.createObjectURL(blob)

          const a = document.createElement('a')
          a.href = url
          a.download = 'file.pdf'
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()

          window.URL.revokeObjectURL(url)
          this.setState({ fileDownloaded: true })
        } catch (error) {
          console.error(error, 'errors')
        }
      }
    }
    return (
      <>
        <div className='response-container endpoint-public-response-container endPointRes'>
          <span className='text-grey'>Response</span>
          <DisplayResponse
            {...this.props}
            loader={this.state.loader}
            tests={this.state.tests}
            timeElapsed={this.state.timeElapsed}
            response={this.props?.historySnapshots[historyId]?.response || testResponse}
            flagResponse={this.props?.endpointContent?.flagResponse}
            handleCancel={() => {
              this.handleCancel()
            }}
          />
        </div>
      </>
    )
  }

  setHostUri(innerHTML) {
    this.handleChange({ currentTarget: { name: 'URL', value: innerHTML } })
  }

  alterEndpointName(name) {
    if (name) {
      const obj = this.state.data
      obj.name = name
      this.setState({ data: obj })
    }
  }

  renderCookiesModal() {
    return (
      this.state.showCookiesModal && (
        <CookiesModal show={this.state.showCookiesModal} onHide={() => this.setState({ showCookiesModal: false })} />
      )
    )
  }

  handleScriptChange(text, type) {
    let preScriptText = this.props?.endpointContent?.preScriptText || ''
    let postScriptText = this.props?.endpointContent?.postScriptText || ''
    if (type === 'Pre-Script') {
      preScriptText = text
    } else {
      postScriptText = text
    }
    this.setModifiedTabData()
    const dummyData = this.props.endpointContent
    dummyData.preScriptText = preScriptText
    dummyData.postScriptText = postScriptText
    this.props.setQueryUpdatedData(dummyData)
  }

  renderScriptError() {
    return (
      <>
        {this.state.postReqScriptError ? (
          <div className='script-error'>{`There was an error in evaluating the Post-request Script: ${this.state.postReqScriptError}`}</div>
        ) : null}
        {this.state.preReqScriptError ? (
          <div className='script-error'>{`There was an error in evaluating the Pre-request Script: ${this.state.preReqScriptError}`}</div>
        ) : null}
      </>
    )
  }

  switchView = (currentView) => {
    const data = this.props.endpointContent
    data.currentView = currentView
    this.props.setQueryUpdatedData(data)
  }

  renderDefaultViewConfirmationModal() {
    return (
      this.state.showViewConfirmationModal && (
        <ConfirmationModal
          show={this.state.showViewConfirmationModal}
          onHide={() => this.setState({ showViewConfirmationModal: false })}
          proceed_button_callback={this.setDefaultView.bind(this)}
          title={msgText.viewSwitch}
        />
      )
    )
  }

  setDefaultView() {
    const endpointView = { [getCurrentUser().identifier]: this.props?.endpointContent?.currentView }
    window.localStorage.setItem('endpointView', JSON.stringify(endpointView))
  }

  removePublicItem(item, index) {
    const showRemoveButton = !['body', 'host', 'params', 'pathVariables', 'headers', 'sampleResponse'].includes(item.type)
    const handleOnClick = () => {
      const docData = [...this.props?.endpointContent?.docViewData]
      docData.splice(index, 1)
      this.props.setQueryUpdatedData({ ...this.props.endpointContent, docViewData: docData })
    }
    return (
      showRemoveButton && (
        <div className='' onClick={handleOnClick.bind(this)}>
          <RiDeleteBinLine />
        </div>
      )
    )
  }

  renderDocView = () => {
    if (!this.props?.endpointContent?.docViewData) return
    if (isDashboardRoute(this.props)) {
      return (
        <SortableList
          lockAxis='y'
          useDragHandle
          onSortEnd={({ oldIndex, newIndex }) => {
            this.onSortEnd(oldIndex, newIndex)
          }}
        >
          <div>
            {this.props?.endpointContent?.docViewData.map((item, index) => (
              <SortableItem key={index} index={index}>
                <div className='doc-secs-container mb-3'>
                  <div className='doc-secs'>{this.renderPublicItem(item, index)}</div>
                  <div className='addons'>
                    {this.renderDragHandle(item)}
                    {this.removePublicItem(item, index)}
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )
    } else {
      return this.props?.endpointContent?.docViewData?.map((item, index) => <div key={index}>{this.renderPublicItem(item, index)}</div>)
    }
  }

  renderDragHandle(item) {
    if (item.type === 'pathVariables') {
      if (this.props?.endpointContent?.pathVariables && this.props?.endpointContent?.pathVariables.length) return <DragHandle />
      return
    }
    return <DragHandle />
  }

  onSortEnd = (oldIndex, newIndex) => {
    const docViewData = [...this.props?.endpointContent?.docViewData]
    if (newIndex !== oldIndex) {
      const newData = []
      docViewData.forEach((data, index) => {
        index !== oldIndex && newData.push(data)
      })
      newData.splice(newIndex, 0, docViewData[oldIndex])
      this.props.setQueryUpdatedData({ ...this.props.endpointContent, docViewData: newData }, () => this.setModifiedTabData())
    }
  }

  saveData = (index, data) => {
    const updatedDocViewData = [...this.props.endpointContent.docViewData]
    updatedDocViewData[index] = { ...updatedDocViewData[index], data: data }
    this.props.setQueryUpdatedData({
      ...this.props.endpointContent,
      docViewData: updatedDocViewData
    }, () => this.setModifiedTabData())
  }

  debouncedSave = _.debounce(this.saveData, 1000)

  renderTiptapEditor(item, index) {
    return (
      <Tiptap
        provider={false}
        ydoc={false}
        isInlineEditor
        disabled={!isDashboardRoute(this.props)}
        initial={item.data}
        onChange={(e) => this.debouncedSave(index, e)}
        isEndpoint={true}
        key={`${item.type}-${index}`}
      />
    )
  }
  renderPublicItem = (item, index) => {
    switch (item.type) {
      case 'textArea': {
        if (isDashboardRoute(this.props) || (!isDashboardRoute(this.props) && item.data)) {
          return <div>{this.renderTiptapEditor(item, index)}</div>
        }
        break
      }
      case 'textBlock': {
        if (isDashboardRoute(this.props) || (!isDashboardRoute(this.props) && item.data)) {
          return (
            <div className='pub-notes' style={{ borderLeftColor: this.state.theme }}>
              {this.renderTiptapEditor(item, index)}
            </div>
          )
        }
        break
      }
      case 'host': {
        if (!isDashboardRoute(this.props)) return this.renderPublicHost()
        else return <div className='endpoint-url-container'> {this.renderHost()} </div>
      }
      case 'body': {
        if (!isDashboardRoute(this.props)) return this.renderPublicBodyContainer()
        else return this.renderBodyContainer()
      }
      case 'headers': {
        if (!isDashboardRoute(this.props)) return this.renderPublicHeaders()
        else return <div className='mb-3'>{this.renderHeaders()}</div>
      }
      case 'params': {
        if (!isDashboardRoute(this.props) && this.checkProtocolType(1)) return this.renderPublicParams()
        else if (isDashboardRoute(this.props) && this.checkProtocolType(1)) return <div className='mb-3'>{this.renderParams()}</div>
        return null
      }
      case 'pathVariables': {
        if (!isDashboardRoute(this.props)) return this.renderPublicPathVariables()
        else return this.renderPathVariables()
      }
      case 'sampleResponse': {
        if (!isDashboardRoute(this.props)) return this.displayPublicSampleResponse()
        else return this.renderSampleResponse()
      }
    }
  }

  isNotDashboardOrDocView() {
    return !isDashboardRoute(this.props) || this.props?.endpointContent?.currentView === 'doc'
  }

  isDashboardAndTestingView() {
    return isDashboardRoute(this.props) && (this.props?.endpointContent?.currentView === 'testing' || !isSavedEndpoint(this.props))
  }

  // renderToggleView() {
  //   if (isSavedEndpoint(this.props)) {
  //     return (
  //       <ButtonGroup className='btn-group-custom' aria-label='Basic example'>
  //         <Button
  //           className={(this.props?.endpointContent?.currentView === 'testing' ? 'active text-black' : 'text-grey')}
  //           onClick={() => this.switchView('testing')}
  //         >
  //           Testing
  //         </Button>
  //         <Button className={this.props?.endpointContent?.currentView === 'doc' ? 'active text-black' : 'text-grey'} onClick={() => this.switchView('doc')}>
  //           Doc
  //         </Button>
  //       </ButtonGroup>
  //     )
  //   }
  // }

  renderDocViewOptions() {
    if (isDashboardRoute(this.props) && this.props?.endpointContent.currentView === 'doc') {
      return (
        <div>
          <Dropdown>
            <Dropdown.Toggle variant='' id='dropdown-basic' className='doc-plus'>
              <FaPlus className='mr-2 cursor-pointer text-gray' size={14} onClick={() => this.showDocOptions()} />
            </Dropdown.Toggle>
            <Dropdown.Menu id='bg-nested-dropdown' className='d-flex doc-plus-menu'>
              <Dropdown.Item onClick={() => this.addBlock('textArea')}>Text Area</Dropdown.Item>
              <Dropdown.Item onClick={() => this.addBlock('textBlock')}>Text Block</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )
    }
  }

  addBlock(blockType) {
    const updatedDocViewData = [...this.props.endpointContent.docViewData, { type: blockType, data: '' }]
    this.props.setQueryUpdatedData({ ...this.props.endpointContent, docViewData: updatedDocViewData })
  }

  renderBodyContainer() {
    return (
      <BodyContainer
        {...this.props}
        set_body={this.setBody.bind(this)}
        body={this.props.endpointContent?.data?.body || {}}
        endpoint_id={this.props.tab.id}
        set_body_description={this.setDescription.bind(this)}
        body_description={this.props?.endpointContent?.bodyDescription || ''}
        setQueryTabBody={this.setQueryTabBody.bind(this)}
      />
    )
  }

  renderPublicBodyContainer() {
    return (
      this.props?.endpointContent?.data?.body && (
        <PublicBodyContainer
          {...this.props}
          set_body={this.setBody.bind(this)}
          set_body_description={this.setDescription.bind(this)}
          body={this.props?.endpointContent?.data?.body}
          original_body={this.props?.endpointContent?.data?.body}
          public_body_flag={this.props?.endpointContent?.publicBodyFlag}
          set_public_body={this.setPublicBody.bind(this)}
          body_description={this.props?.endpointContent?.bodyDescription}
          publicCollectionTheme={this.props?.publicCollectionTheme}
          setQueryTabBody={this.setQueryTabBody.bind(this)}
        />
      )
    )
  }

  renderHeaders() {
    return (
      <GenericTable
        {...this.props}
        title='Headers'
        dataArray={this.props?.endpointContent?.originalHeaders || []}
        props_from_parent={this.propsFromChild.bind(this)}
        original_data={[this.props?.endpointContent?.originalHeaders || []]}
        currentView={this.props?.endpointContent?.currentView}
      />
    )
  }

  renderPublicHeaders() {
    return (
      this.props?.endpointContent?.originalHeaders?.length > 0 && (
        <GenericTable
          {...this.props}
          title='Headers'
          dataArray={this.props?.endpointContent?.originalHeaders}
          props_from_parent={this.propsFromChild.bind(this)}
          original_data={[...this.props?.endpointContent?.originalHeaders]}
          currentView={this.props?.endpointContent?.currentView}
        />
      )
    )
  }

  renderParams() {
    return (
      <GenericTable
        {...this.props}
        title='Params'
        dataArray={this.props?.endpointContent?.originalParams || []}
        props_from_parent={this.propsFromChild.bind(this)}
        original_data={this.props?.endpointContent?.originalParams || []}
        open_modal={this.props.open_modal}
        currentView={this.props?.endpointContent?.currentView}
      />
    )
  }

  renderPublicParams() {
    return (
      this.props?.endpointContent?.originalParams?.length > 0 && (
        <div>
          <GenericTable
            {...this.props}
            title='Params'
            dataArray={this.props?.endpointContent?.originalParams || []}
            props_from_parent={this.propsFromChild.bind(this)}
            original_data={this.props?.endpointContent?.originalParams}
            currentView={this.props?.endpointContent?.currentView}
          />
        </div>
      )
    )
  }

  renderPathVariables() {
    return (
      this.props.endpointContent?.pathVariables &&
      this.props.endpointContent?.pathVariables?.length !== 0 && (
        <GenericTable
          {...this.props}
          title='Path Variables'
          dataArray={this.props?.endpointContent?.pathVariables || []}
          props_from_parent={this.propsFromChild.bind(this)}
          original_data={this.props?.endpointContent?.pathVariables || []}
          currentView={this.props?.endpointContent?.currentView}
        />
      )
    )
  }

  renderPublicPathVariables() {
    return (
      this.props?.endpointContent?.pathVariables &&
      this.props?.endpointContent?.pathVariables?.length !== 0 && (
        <div>
          <GenericTable
            {...this.props}
            title='Path Variables'
            dataArray={this.props?.endpointContent?.pathVariables}
            props_from_parent={this.propsFromChild.bind(this)}
            original_data={this.props?.endpointContent?.pathVariables}
            currentView={this.props?.endpointContent?.currentView}
          />
        </div>
      )
    )
  }
  handleInputChange(key, event) {
    const newValue = event.target.value;
    this.props.update_public_env(key, newValue);
    setTimeout(() => {
      this.prepareHarObject();
    }, 500)
  }

  renderPublicEnvironments() {
    return (
      <div className='public-env-contanier mt-4'>
        <div className="accordion" id="accordionExample">
          <div className="card">
            <div className="card-header p-0" id="headingOne">
              <h2 className="mb-0 font-14 d-flex justify-content-between align-items-center" style={this.state.themes.backgroundStyles} data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <button className='btn fw-600 text-left w-100' type="button">
                  Variables
                </button>
                <IoIosArrowUp size={18} className='down-arrow mr-2 text-center' />
              </h2>
            </div>

            <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
              <div className="card-body p-0">
                <table className="table border rounded py-3 my-0 pl-5 pr-3 pb-4" style={this.state.themes.backgroundStyles}>
                  <thead>
                    <tr>
                      <th className='p-1 font-weight-normal font-12'>
                        KEY
                      </th>
                      <th className='p-1 font-weight-normal font-12'>VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.publicEnv && (
                      Object.keys(this.props.publicEnv).map((key, Index) => {
                        const env = this.props.publicEnv[key]
                        if (env && typeof env.Checked !== "undefined" && env.Checked) {

                          return (
                            <tr key={Index}>
                              <td width={200} className=' pl-0 py-1'>
                                <input
                                  type="text"
                                  value={key}
                                  disabled
                                  className="form-control public-input-key text-grey"
                                />
                              </td>
                              <td className='py-1 pl-0 pr-1'>
                                <input
                                  type="text"
                                  value={env.currentValue}
                                  disabled={!env.IsEditable}
                                  onChange={(event) => this.handleInputChange(key, event)}
                                  className={`form-control ${!env.IsEditable && 'public-input-key text-grey'}`}
                                />
                              </td>
                            </tr>

                          );
                        }
                        return null;
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderPublicHost() {
    return (
      <div>
        <div className='hm-endpoint-header mb-2'>
          <div className='d-flex'>
            {this.checkProtocolType(1) && (
              <div className='input-group-prepend'>
                <span className={`api-label api-label-lg input-group-text m-0 p-0 ${this.props?.endpointContent?.data?.method}`}>
                  {this.props?.endpointContent?.data?.method}
                </span>
              </div>
            )}
            <HostContainer
              {...this.props}
              environmentHost={
                this.props?.environment?.variables?.BASE_URL?.currentValue ||
                this.props?.environment?.variables?.BASE_URL?.initialValue ||
                ''
              }
              URL={this.props.endpointContent?.data?.URL}
              updatedUri={_.cloneDeep(this.props?.endpointContent?.data?.updatedUri)}
              set_base_url={this.setBaseUrl.bind(this)}
              // customHost={this.props?.endpointContent?.host.BASE_URL || ''}
              endpointId={this.props?.params?.endpointId}
              set_host_uri={this.setHostUri.bind(this)}
              props_from_parent={this.propsFromChild.bind(this)}
              setQueryUpdatedData={this.props.setQueryUpdatedData.bind(this)}
              untitledEndpointData={_.cloneDeep(this.props.untitledEndpointData)}
            />
          </div>
          {this.props?.highlights?.uri ? <i className='fas fa-circle' /> : null}
        </div>
        <input ref={this.uri} type='hidden' value={this.props?.endpointContent?.data?.updatedUri} name='updatedUri' />
        {(!isDashboardRoute(this.props)) && Object.keys(this.props.publicEnv).length !== 0 && this.renderPublicEnvironments()}
      </div>
    )
  }

  renderHost() {
    const methodClassMap = {
      GET: 'get-button',
      POST: 'post-button',
      PUT: 'put-button',
      PATCH: 'patch-button',
      DELETE: 'delete-button',
      EXAMPLE : <Example/>
    }
    return (
      <div className={`input-group-prepend ${this.props?.endpointContent?.currentView === 'doc' ? 'w-100' : ''}`}>
        {this.checkProtocolType(1) && (
          <div className='dropdown'>
            <button
              className={`api-label ${this.props?.endpointContent?.data?.method} dropdown-toggle`}
              type='button'
              id='dropdownMenuButton'
              data-toggle={'dropdown'}
              aria-haspopup={'true'}
              aria-expanded={'false'}
              disabled={isDashboardRoute(this.props) ? null : true}
            >
              {this.props?.endpointContent?.data?.method}
            </button>
            <div className='dropdown-menu dropdown-url' aria-labelledby='dropdownMenuButton'>
              {this.state.methodList.map((methodName) => (
                <button
                  className={`dropdown-item font-12 ${methodClassMap[methodName]}`}
                  onClick={() => this.setMethod(methodName)}
                  key={methodName}
                >
                  {methodName}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={`d-flex dashboard-url ${this.state.addUrlClass ? 'Url-invalid' : ''} ${this.checkProtocolType(2) ? 'w-100' : ''}`}>
          <HostContainer
            {...this.props}
            endpointId={this.state.endpoint.id}
            // customHost={this.props?.endpointContent?.host?.BASE_URL || ''}
            environmentHost={
              this.props.environment?.variables?.BASE_URL?.currentValue || this.props.environment?.variables?.BASE_URL?.initialValue || ''
            }
            updatedUri={this.props.endpointContent?.data?.updatedUri}
            URL={this.props.endpointContent?.data?.URL}
            set_host_uri={this.setHostUri.bind(this)}
            set_base_url={this.setBaseUrl.bind(this)}
            props_from_parent={this.propsFromChild.bind(this)}
          />
        </div>
      </div>
    )
  }

  renderInOverlay(method, endpointId) {
    const endpoints = { ...this.props.pages[endpointId] }
    return (
      // <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>Nothing to publish</Tooltip>}>
      <span className='d-inline-block'>{method(endpointId, endpoints)}</span>
      // </OverlayTrigger>
    )
  }

  handleRemovePublicEndpoint(endpointId) {
    this.setState({ openUnPublishConfirmationModal: true })
  }

  renderUnPublishEndpoint(endpointId, endpointss) {
    return (
      <UnPublishEntityButton
        entity={endpointss}
        entityId={endpointId}
        onUnpublish={() => this.handleRemovePublicEndpoint(endpointId)}
        entityName='Endpoint'
      />
    )
  }

  renderPublishEndpoint(endpointId, endpoints) {
    return (
      <PublishEntityButton
        entity={endpoints}
        entityId={endpointId}
        open_publish_confirmation_modal={() => this.setState({ openPublishConfirmationModal: true })}
        entityName='Endpoint'
      />
    )
  }

  handleToggle() {
    if (this.props?.endpointContent?.currentView === 'doc') {
      this.switchView('testing')
    } else {
      this.switchView('doc')
    }
  }

  renderSwitchBtn() {
    return (
      <div onClick={this.handleToggle} className='p-0 d-flex justify-content-between align-items-center cursor-pointer'>
        <button className='btn text-grey btn-sm font-12'>DOC</button>
        <Form>
          <Form.Check
            className='text-center pl-5'
            type="switch"
            checked={this.props?.endpointContent?.currentView === 'doc'}
            onChange={this.handleToggle}
          />
        </Form>
      </div>
    )
  }

  renderPublishConfirmationModal() {
    return (
      this.state.openPublishConfirmationModal && (
        <ConfirmationModal
          show={this.state.openPublishConfirmationModal}
          onHide={() => this.setState({ openPublishConfirmationModal: false })}
          proceed_button_callback={this.handleApproveEndpointRequest.bind(this)}
          title={msgText.publishEndpoint}
          submitButton='Publish'
          rejectButton='Discard'
        />
      )
    )
  }

  renderUnPublishConfirmationModal() {
    return (
      this.state.openUnPublishConfirmationModal && (
        <ConfirmationModal
          show={this.state.openUnPublishConfirmationModal}
          onHide={() => this.setState({ openUnPublishConfirmationModal: false })}
          proceed_button_callback={this.handleRejectEndpointRequest.bind(this)}
          title={msgText.unpublishEndpoint}
          submitButton='UnPublish'
          rejectButton='Discard'
        />
      )
    )
  }

  async handleApproveEndpointRequest() {
    const endpointId = this.endpointId
    this.setState({ loading: true })
    this.setState({ publishLoader: true })
    if (sensitiveInfoFound(this.props?.endpointContent)) {
      this.setState({ warningModal: true })
    } else {
      await this.props.approve_endpoint(endpointId)
      this.setState({ loading: false })
    }
  }

  async handleRejectEndpointRequest() {
    const endpoints = this.props.endpoints[this.endpointId]
    this.setState({ publishLoader: true })
    if (sensitiveInfoFound(this.props?.endpointContent)) {
      this.setState({ warningModal: true })
    } else {
      this.props.unPublish_endpoint(endpoints, () => {
        this.setState({ publishLoader: false })
      })
    }
  }
  async handlePublicEndpointState(endpoint) {
    if (isStateDraft(endpoint.id, this.props.endpoints) || isStateReject(endpoint.id, this.props.endpoints)) {
      this.props.pending_endpoint(endpoint)
    }
  }

  renderWarningModal() {
    return (
      <WarningModal
        show={this.state.warningModal}
        ignoreButtonCallback={() => this.props.approve_endpoint(this.props.endpoints[this.endpointId])}
        onHide={() => {
          this.setState({ warningModal: false, publishLoader: false })
        }}
        title='Sensitive Information Warning'
        message='This Entity contains some sensitive information. Please remove them before making it public.'
      />
    )
  }

  showDocOptions() {
    const { docOptions } = this.state
    this.setState({ docOptions: !docOptions })
  }

  renderSaveButton() {
    return (
      <div className='save-endpoint'>
        {(
          this.props?.tabs[this.props?.activeTabId]?.status !== 'NEW' ? (
            <Dropdown className='rounded' as={ButtonGroup}>
              <button
                id='api_save_btn'
                className='btn btn-sm d-flex align-items-center save-button-endpoint px-1'
                type='button'
                disabled={!this.props?.tabs[this.props?.activeTabId]?.isModified}
                onClick={() => this.handleSave()}
                title={!this.props?.tabs[this.props?.activeTabId]?.isModified ? 'No changes in this request' : 'Save request'}
              >
                <span className='save-color'>{this.props?.tabs[this.props?.activeTabId]?.isModified ? 'Save' : 'Saved'}</span>
              </button>
              {getCurrentUser() ? (
                <>
                  <Dropdown.Toggle className='save-button-endpoint px-0 bg-none border-0'>
                    <IconButton variant='sm'><MdExpandMore color='gray' size={17} /></IconButton>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className=''>
                    <Dropdown.Item
                      className='px-2'
                      onClick={() =>
                        this.handleSave(null,null,null,'example')
                      }
                    >
                      Save As Example Request
                    </Dropdown.Item>
                    <Dropdown.Item
                      className='px-2'
                      onClick={() =>
                        this.setState({ saveAsFlag: true }, () => {
                          this.openEndpointFormModal()
                        })
                      }
                    >
                      Save As
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </>
              ) : null}
            </Dropdown>
          ) : (
            <button
              className={
                this.state.saveLoader
                  ? 'btn btn-outline-secondary buttonLoader btn-sm font-12 d-flex align-items-center'
                  : 'btn save-button-endpoint save-button px-1 btn-sm gap-1 d-flex align-items-center'
              }
              type='button'
              id='save-endpoint-button'
              onClick={() => this.handleSave()}
            >
              <span>Save</span>
            </button>
          )
        )}
      </div>
    )
  }

  responseToggle() {
    return JSON.parse(window.localStorage.getItem('right'))
  }

  renderCodeTemplate() {
    const shouldShowCodeTemplate =
      (this.isDashboardAndTestingView(this.props, 'testing') && this.props.curlSlider && this.props.params.endpointId) ||
      isOnPublishedPage(this.props)
    const harObjectExists = !!this.props?.endpointContent?.harObject

    if (shouldShowCodeTemplate && harObjectExists) {
      const commonProps = {
        show: true,
        ...this.props,
        onHide: () => {
          this.setState({ showCodeTemplate: false })
        },
        editorToggle: () => {
          this.setState({ codeEditorVisibility: !this.state.codeEditorVisibility })
        },
        harObject: this.props?.endpointContent?.harObject,
        title: 'Generate Code Snippets',
        publicCollectionTheme: this.props?.publicCollectionTheme,
        updateCurlSlider: this.props.update_curl_slider
      }

      if (this.isDashboardAndTestingView(this.props, 'testing')) {
        return <CodeTemplate {...commonProps} showClosebtn={true} theme={'light'} />
      } else {
        return <CodeTemplate {...commonProps} />
      }
    }
  }

  renderEndpointUserData(isOnPublishedPage) {
    const { pages, currentEndpointId, users } = this.props
    const updatedById = pages?.[currentEndpointId]?.updatedBy
    const createdAt = pages?.[currentEndpointId]?.createdAt ? moment(pages[currentEndpointId].updatedAt).fromNow() : null
    const lastModified = pages?.[currentEndpointId]?.updatedAt ? moment(pages[currentEndpointId].updatedAt).fromNow() : null

    const user = users?.find((user) => user.id === updatedById)

    if (isOnPublishedPage) {
      return (
        <div>
          {lastModified && (
            <>
              Modified <span>{lastModified}</span>
            </>
          )}
        </div>
      )
    } else if (this.props?.tabs[this.props?.activeTabId]?.status !== 'NEW') {
      return (
        <div className='d-flex justify-content-center'>
          <OverlayTrigger placement='bottom' overlay={<Tooltip id='edited-by-tooltip'>
            {lastModified &&
              <div className="font-12 text-secondary">
                <div>
                  <span> Updated by </span>
                  <span className="font-weight-bold text-white">{user?.name}</span>
                  <span>&nbsp;{lastModified}</span>
                </div>
                <div>
                  <span>Created by </span>
                  <span className="font-weight-bold text-white">{user?.name}</span>
                  <span>&nbsp;{createdAt}</span>
                </div>
              </div>
            }
          </Tooltip>}>
            <button className='text-black-50 btn p-0 d-flex justify-content-center'> Edited  {lastModified}</button>
          </OverlayTrigger>
        </div>
      )
    }
  }

  render() {
    if (this.props?.endpointContentLoading) {
      return (
        <>
          <div>
            <div className='loading'>
              <div className='box bg'></div>
              <div className='d-flex align-items-center justify-content-between mt-3'>
                <div>
                  <div className='new bg rounded-1'></div>
                  <div className='live bg mt-1'></div>
                </div>
                <div className='new bg rounded-1'></div>
              </div>
              <div className='d-flex align-items-center gap-3 mt-2'>
                <div className='api-call bg rounded-1'></div>
                <div className='bg send rounded-1'></div>
              </div>
              <div className='boxes mt-4 bg rounded-1'></div>
              <div className='bulk-edit bg mt-2 rounded-1'></div>
              <div className='path-var mt-2 bg rounded-1'></div>
              <div className='bulk-edit bg mt-2 rounded-1'></div>
              <div className='d-flex align-items-center justify-content-between mt-4'>
                <div className='response bg rounded-1'></div>
                <div className='d-flex align-items-center gap-2'>
                  <div className='min-box bg rounded-1'></div>
                  <div className='min-box bg rounded-1'></div>
                </div>
              </div>
              <div className='hit-send bg mt-3 rounded-1'></div>
            </div>
          </div>
        </>
      )
    }
    this.endpointId = this.props.endpointId
      ? this.props.endpointId
      : isDashboardRoute(this.props)
        ? this.props.location.pathname.split('/')[5]
        : this.props.location.pathname.split('/')[4]

    if (this.props.save_endpoint_flag && this.props.tab.id === this.props.selected_tab_id) {
      this.props.handle_save_endpoint(false)
      this.handleSave()
    }

    const { theme, codeEditorVisibility } = this.state
    const { responseView } = this.props
    const endpointss = this.props.pages[this.endpointId]
    const endpointId = this.endpointId
    const approvedOrRejected = isStateApproved(endpointId, endpointss) || isStateReject(this.endpointId, endpointss)
    const isPublicEndpoint = endpointss?.isPublished
    return (isDashboardRoute(this.props) && this.props?.endpointContent?.currentView) ||
      !isDashboardRoute(this.props) ||
      !isSavedEndpoint(this.props) ? (
      <div
        className={
          !this.isNotDashboardOrDocView()
            ? ''
            : codeEditorVisibility
              ? 'mainContentWrapperPublic hideCodeEditor'
              : 'mainContentWrapperPublic '
        }
        style={this.state.theme.backgroundStyle}
      >
        <div className={this.isNotDashboardOrDocView() ? 'mainContentWrapper dashboardPage' : 'mainContentWrapper d-flex'}>
          <div className={`innerContainer w-100 ${'response-bottom'}`}>
            <div
              className={`hm-endpoint-container mid-part endpoint-container ${isOnPublishedPage() ? 'pt-3' : 'pt-0 px-3'} ${this.props?.endpointContent?.currentView === 'doc' ? 'doc-fix-width' : ''
                }`}
            >
              {this.renderCookiesModal()}
              {this.renderDefaultViewConfirmationModal()}
              {this.renderPublishConfirmationModal()}
              {this.renderUnPublishConfirmationModal()}
              {this.renderWarningModal()}
              {getCurrentUser() ? (
                <>
                  {isDashboardRoute(this.props) && (
                    <div className='hm-panel py-3 position-sticky bg-white'>
                      <div className='d-flex justify-content-between align-items-center'>
                        <EndpointBreadCrumb
                          setActiveTab={this.setActiveTab}
                          {...this.props}
                          isEndpoint
                          publishLoader={this.state.loading}
                        />
                        <div className='d-flex gap-1 align-items-center'>
                          {this.state.showEndpointFormModal && (
                            <SaveAsSidebar
                              {...this.props}
                              onHide={() => this.closeEndpointFormModal()}
                              name={this.props.endpointContent.data.name}
                              description={this.props.endpointContent.data.description}
                              save_endpoint={this.handleSave.bind(this)}
                              saveAsLoader={this.state.saveAsLoader}
                              endpointContent={this.props?.endpointContent}
                            />
                          )}
                          {this.renderEndpointUserData()}
                          {this.renderSaveButton()}
                          <Dropdown className='publish-unpublish-button'>
                            {this.props?.tabs[this.props?.activeTabId]?.status !== 'NEW' && (
                              <Dropdown.Toggle as='div' id='dropdown-basic'>
                                <IconButton variant="sm" className='mt-1'><BsThreeDots className='text-grey' size={25} /></IconButton>
                              </Dropdown.Toggle>
                            )}
                            <Dropdown.Menu>
                              {this.renderSwitchBtn()}
                              {isAdmin() && !isStatePending(endpointId, endpointss) && (
                                <Dropdown.Item className='p-0  d-flex justify-content-between align-items-center'>
                                  <span>
                                    {approvedOrRejected
                                      ? this.renderInOverlay(this.renderPublishEndpoint.bind(this), endpointId)
                                      : this.renderPublishEndpoint(endpointId, endpointss)}
                                  </span>
                                  <span className='text-black-50 mr-2'>{window.navigator.platform.toLowerCase().includes("mac") ? <><BsCommand size={12} className='cmd-icon d-inline-block' />+ <span className='d-inline-block font-12'>B</span></> : <span className='font-10'>Ctrl + B</span>}</span>
                                </Dropdown.Item>)}
                              {isAdmin() && isPublicEndpoint && (
                                <Dropdown.Item
                                  className='p-0  d-flex justify-content-between align-items-center unpublishBtn'
                                >
                                  <span>
                                    {isStateApproved(endpointId, endpointss)
                                      ? this.renderInOverlay(this.renderUnPublishEndpoint.bind(this), endpointId)
                                      : this.renderUnPublishEndpoint(endpointId, endpointss)}
                                  </span>
                                  <span className='text-black-50 mr-2'>{window.navigator.platform.toLowerCase().includes("mac") ? <><BsCommand size={12} className='cmd-icon d-inline-block' />+ <span className='d-inline-block font-12'>U</span></> : <span className='font-10'>Ctrl + U</span>}</span>
                                </Dropdown.Item>)}
                              {!isAdmin() && (<Dropdown.Item>
                                <button
                                  className={(isStateDraft(endpointId, endpointss) ? 'btn' : 'btn text-link')}
                                  type='button'
                                  onClick={() => (isStateDraft(endpointId, endpointss) ? this.handlePublicEndpointState(this.props.pages[endpointId]) : null)}
                                >
                                  {getEntityState(endpointId, endpointss)}
                                </button>
                              </Dropdown.Item>)}

                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
              {this.isDashboardAndTestingView() && (
                <DisplayDescription
                  {...this.props}
                  endpointId={this.props?.currentEndpointId}
                  endpoint={this.props.endpointContent}
                  data={this.state.data}
                  old_description={this.state.oldDescription}
                  props_from_parent={this.propsFromDescription.bind(this)}
                  alterEndpointName={(name) => this.alterEndpointName(name)}
                  setActiveTab={this.setActiveTab}
                />
              )}
              <div className={'clear-both ' + (this.props?.endpointContent?.currentView === 'doc' ? 'doc-view m-auto' : 'testing-view')}>
                <div className='endpoint-header'>
                  {this.isNotDashboardOrDocView() && (
                    <div className='d-flex endpoint-name-container justify-content-between mb-3 align-content-center'>
                      {this.isNotDashboardOrDocView() && (
                        <>
                          <h1 className='endpoint-title mb-0'>{this.props?.endpointContent?.data?.name || ''}</h1>
                          {!isDashboardRoute(this.props) && (
                            <div className='request-button'>
                              <button
                                className={
                                  this.state.loader
                                    ? 'btn custom-theme-btn btn-lg buttonLoader'
                                    : 'btn btn-lg custom-theme-btn px-md-4 px-3'
                                }
                                style={{
                                  backgroundColor: this.props.publicCollectionTheme,
                                  opacity: 0.9
                                }}
                                type='submit'
                                id='send-request-button'
                                onClick={() => this.handleSend()}
                              >
                                TRY
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className={this.isNotDashboardOrDocView() ? 'hm-panel' : 'hm-panel'}>
                  {this.isDashboardAndTestingView() && (
                    <div className='endpoint-url-container'>
                      {this.renderHost()}
                      <div className='uriContainerWrapper'>
                        <button
                          className={this.state.loader ? 'btn btn-primary buttonLoader' : 'btn bg-primary text-white'}
                          type='submit'
                          id='api-send-button'
                          onClick={() => this.handleSend()}
                          disabled={this.state.loader}
                        >
                          {this.isDashboardAndTestingView() ? 'Send' : 'Try'}
                        </button>
                      </div>
                    </div>
                  )}
                  {isElectron() && (
                    <div className='ssl-mode-toggle cursor-pointer' onClick={() => this.setSslMode()}>

                    </div>
                  )}
                  <div className={this.isDashboardAndTestingView() ? 'endpoint-headers-container d-flex' : 'hm-public-endpoint-headers'}>
                    <div className='main-table-wrapper'>
                      {this.isDashboardAndTestingView() ? (
                        <div className='d-flex justify-content-between align-items-center'>
                          <div className='headers-params-wrapper custom-tabs w-100'>
                            <ul className='nav nav-tabs border-0 border-bottom w-100 rounded-0 mb-2' id='pills-tab' role='tablist'>
                              {this.checkProtocolType(1) && (
                                <>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link bg-none ${this.state.activeTab === 'default' ? 'active text-black' : 'text-secondary'}`}
                                      id={`pills-params-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#params-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`params-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'default'}
                                      onClick={() => this.setState({ activeTab: 'default' })}
                                    >
                                      Params
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link bg-none ${this.state.activeTab === 'authorization' ? 'active text-black' : 'text-secondary'}`}
                                      id={`pills-authorization-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#authorization-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`authorization-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'authorization'}
                                      onClick={() => this.setState({ activeTab: 'authorization' })}
                                    >
                                      Authorization
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link bg-none ${this.state.activeTab === 'headers' ? 'active text-black' : 'text-secondary'}`}
                                      id={`pills-headers-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#headers-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`headers-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'headers'}
                                      onClick={() => this.setState({ activeTab: 'headers' })}
                                    >
                                      Headers
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link bg-none ${this.state.activeTab === 'body' ? 'active text-black' : 'text-secondary'}`}
                                      id={`pills-body-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#body-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`body-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'body'}
                                      onClick={() => this.setState({ activeTab: 'body' })}
                                    >
                                      Body
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link bg-none ${this.state.activeTab === 'script' ? 'active text-black' : 'text-secondary'}`}
                                      id={`pills-script-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#script-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`script-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'script'}
                                      onClick={() => this.setState({ activeTab: 'script' })}
                                    >
                                      Script
                                    </a>
                                  </li>
                                  {getCurrentUser() && (
                                    <li className='nav-item cookie-tab'>
                                      <a
                                        className={`nav-link bg-none ${this.state.activeTab === 'cookies' ? 'active text-black' : 'text-secondary'}`}
                                        onClick={() => this.setState({ showCookiesModal: true })}
                                      >
                                        Cookies
                                      </a>
                                    </li>
                                  )}
                                </>
                              )}
                              {this.checkProtocolType(2) && (
                                <>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link ${this.state.activeTab === 'default' ? 'active text-back' : 'text-grey'}`}
                                      id={`pills-query-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#query-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`query-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'default'}
                                      onClick={() => this.setState({ activeTab: 'default' })}
                                    >
                                      Query
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link ${this.state.activeTab === 'authorization' ? 'active text-black' : 'text-grey'}`}
                                      id={`pills-authorization-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#authorization-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`authorization-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'authorization'}
                                      onClick={() => this.setState({ activeTab: 'authorization' })}
                                    >
                                      Authorization
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link ${this.state.activeTab === 'headers' ? 'active text-black' : 'text-grey'}`}
                                      id={`pills-headers-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#headers-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`headers-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'headers'}
                                      onClick={() => this.setState({ activeTab: 'headers' })}
                                    >
                                      Headers
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className={`nav-link ${this.state.activeTab === 'g-script' ? 'active text-black' : 'text-grey'}`}
                                      id={`pillss-script-tab-${this.props.tab.id}`}
                                      data-toggle='pill'
                                      href={`#g-script-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`g-script-${this.props.tab.id}`}
                                      aria-selected={this.state.activeTab === 'g-script'}
                                      onClick={() => this.setState({ activeTab: 'g-script' })}
                                    >
                                      Script
                                    </a>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      ) : null}

                      {this.isDashboardAndTestingView() ? (
                        <div className='tab-content' id='pills-tabContent'>
                          {this.checkProtocolType(1) && (
                            <>
                              <div
                                className={`tab-pane fade ${this.state.activeTab === 'default' ? 'show active' : ''}`}
                                id={`params-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-params-tab-${this.props.tab.id}`}
                              >
                                {this.renderParams()}
                                <div>{this.renderPathVariables()}</div>
                              </div>
                              <div
                                className={`tab-pane fade border rounded ${this.state.activeTab === 'authorization' ? 'show active' : ''}`}
                                id={`authorization-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-authorization-tab-${this.props.tab.id}`}
                              >
                                <div>
                                  <Authorization
                                    {...this.props}
                                    set_authorization_headers={this.setHeaders.bind(this)}
                                    set_authoriztaion_params={this.setParams.bind(this)}
                                    set_authoriztaion_type={this.setAuthType.bind(this)}
                                    handleSaveEndpoint={this.handleSave.bind(this)}
                                    delete_headers={this.deleteHeader.bind(this)}
                                    delete_params={this.deleteParams.bind(this)}
                                  />
                                </div>
                              </div>
                              <div
                                className={`tab-pane fade ${this.state.activeTab === 'headers' ? 'show active' : ''}`}
                                id={`headers-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-headers-tab-${this.props.tab.id}`}
                              >
                                <div>{this.renderHeaders()}</div>
                              </div>
                              <div
                                className={`tab-pane fade rounded ${this.state.activeTab === 'body' ? 'show active' : ''}`}
                                id={`body-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-body-tab-${this.props.tab.id}`}
                              >
                                {this.renderBodyContainer()}
                              </div>
                              <div
                                className={`tab-pane fade Script-content ${this.state.activeTab === 'script' ? 'show active' : ''}`}
                                id={`script-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-script-tab-${this.props.tab.id}`}
                              >
                                <ul className='nav nav-tabs mt-0 border border-0 script-button-wrapper rounded mb-2' id='pills-sub-tab' role='tablist'>
                                  <li className='nav-item'>
                                    <a
                                      className='nav-link active px-2 mb-0 py-1 border border-0 Script-button rounded'
                                      id='pills-pre-script-tab'
                                      data-toggle='pill'
                                      href={`#pre-script-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`pre-script-${this.props.tab.id}`}
                                      aria-selected='true'
                                      title='Pre-Script are written in Javascript, and are run before the response is recieved.'
                                    >
                                      Pre-Script
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className='nav-link px-2 py-1 border border-0 Script-button mb-0 rounded'
                                      id='pills-post-script-tab'
                                      data-toggle='pill'
                                      href={`#post-script-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`post-script-${this.props.tab.id}`}
                                      aria-selected='false'
                                      title='Post-Script are written in Javascript, and are run after the response is recieved.'
                                    >
                                      Post-Script
                                    </a>
                                  </li>
                                </ul>
                                <div className='tab-content w-100' id='pills-sub-tabContent'>
                                  <div
                                    className='tab-pane fade show active'
                                    id={`pre-script-${this.props.tab.id}`}
                                    role='tabpanel'
                                    aria-labelledby={`pills-pre-script-tab-${this.props.tab.id}`}
                                  >
                                    <div>
                                      <Script
                                        type='Pre-Script'
                                        handleScriptChange={this.handleScriptChange.bind(this)}
                                        scriptText={this.props?.endpointContent?.preScriptText}
                                        endpointContent={this.props?.endpointContent}
                                        key={this.props.activeTabId}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className='tab-pane fade'
                                    id={`post-script-${this.props.tab.id}`}
                                    role='tabpanel'
                                    aria-labelledby='pills-post-script-tab'
                                  >
                                    <div>
                                      <Script
                                        type='Post-Script'
                                        handleScriptChange={this.handleScriptChange.bind(this)}
                                        scriptText={this.props?.endpointContent?.postScriptText}
                                        endpointContent={this.props?.endpointContent}
                                        key={this.props.activeTabId}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          {this.checkProtocolType(2) && (
                            <>
                              <div
                                className={`tab-pane fade ${this.state.activeTab === 'default' ? 'show active' : ''}`}
                                id={`query-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-query-tab-${this.props.tab.id}`}
                              >
                                <QueryTab
                                  replaceVariables={this.replaceVariables}
                                  endpointContent={this.props.endpointContent}
                                  setQueryTabBody={this.setQueryTabBody.bind(this)}
                                  endpointId={this.props.endpointId}
                                />
                              </div>
                              <div
                                className={`tab-pane fade ${this.state.activeTab === 'authorization' ? 'show active' : ''}`}
                                id={`authorization-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-authorization-tab-${this.props.tab.id}`}
                              >
                                <div>
                                  <Authorization
                                    {...this.props}
                                    set_authorization_headers={this.setHeaders.bind(this)}
                                    set_authoriztaion_params={this.setParams.bind(this)}
                                    set_authoriztaion_type={this.setAuthType.bind(this)}
                                    handleSaveEndpoint={this.handleSave.bind(this)}
                                    delete_headers={this.deleteHeader.bind(this)}
                                    delete_params={this.deleteParams.bind(this)}
                                  />
                                </div>
                              </div>
                              <div
                                className={`tab-pane fade ${this.state.activeTab === 'headers' ? 'show active' : ''}`}
                                id={`headers-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-headers-tab-${this.props.tab.id}`}
                              >
                                <div>{this.renderHeaders()}</div>
                              </div>
                              <div
                                className={`tab-pane fade Script-content ${this.state.activeTab === 'g-script' ? 'show active' : ''}`}
                                id={`g-script-${this.props.tab.id}`}
                                role='tabpanel'
                                aria-labelledby={`pills-script-tab-${this.props.tab.id}`}
                              >
                                <ul className='nav nav-tabs mt-0 script-button-wrapper rounded mb-2 border border-0' id='pills-sub-tab' role='tablist'>
                                  <li className='nav-item'>
                                    <a
                                      className='nav-link active px-2 py-1 mb-0 rounded border border-0 Script-button'
                                      id='pills-pre-script-tab'
                                      data-toggle='pill'
                                      href={`#pre-script-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`pre-script-${this.props.tab.id}`}
                                      aria-selected='true'
                                      title='Pre-Script are written in Javascript, and are run before the response is recieved.'
                                    >
                                      Pre-Script
                                    </a>
                                  </li>
                                  <li className='nav-item'>
                                    <a
                                      className='nav-link px-2 py-1 mb-0 border rounded border-0 Script-button'
                                      id='pills-post-script-tab'
                                      data-toggle='pill'
                                      href={`#post-script-${this.props.tab.id}`}
                                      role='tab'
                                      aria-controls={`post-script-${this.props.tab.id}`}
                                      aria-selected='false'
                                      title='Post-Script are written in Javascript, and are run after the response is recieved.'
                                    >
                                      Post-Script
                                    </a>
                                  </li>
                                </ul>
                                <div className='tab-content w-100' id='pills-sub-tabContent'>
                                  <div
                                    className='tab-pane fade show active'
                                    id={`pre-script-${this.props.tab.id}`}
                                    role='tabpanel'
                                    aria-labelledby={`pills-pre-script-tab-${this.props.tab.id}`}
                                  >
                                    <div>
                                      <Script
                                        type='Pre-Script'
                                        handleScriptChange={this.handleScriptChange.bind(this)}
                                        scriptText={this.props?.endpointContent?.preScriptText}
                                        endpointContent={this.props?.endpointContent}
                                        key={this.props.activeTabId}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className='tab-pane fade'
                                    id={`post-script-${this.props.tab.id}`}
                                    role='tabpanel'
                                    aria-labelledby='pills-post-script-tab'
                                  >
                                    <div>
                                      <Script
                                        type='Post-Script'
                                        handleScriptChange={this.handleScriptChange.bind(this)}
                                        scriptText={this.props?.endpointContent?.postScriptText}
                                        endpointContent={this.props?.endpointContent}
                                        key={this.props.activeTabId}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          <div
                            className={this.setAuthorizationTab ? 'tab-pane fade show active' : 'tab-pane fade '}
                            id={`authorization-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-authorization-tab'
                          >
                            <div>
                              <Authorization
                                {...this.props}
                                set_authorization_headers={this.setHeaders.bind(this)}
                                set_authoriztaion_params={this.setParams.bind(this)}
                                set_authoriztaion_type={this.setAuthType.bind(this)}
                                handleSaveEndpoint={this.handleSave.bind(this)}
                                delete_headers={this.deleteHeader.bind(this)}
                                delete_params={this.deleteParams.bind(this)}
                              />
                            </div>
                          </div>
                          <div
                            className='tab-pane fade'
                            id={`headers-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-headers-tab'
                          >
                            <div>{this.renderHeaders()}</div>
                          </div>
                          {this.checkProtocolType(1) && (
                            <div
                              className='tab-pane fade'
                              id={`body-${this.props.tab.id}`}
                              role='tabpanel'
                              aria-labelledby='pills-body-tab'
                            >
                              {this.renderBodyContainer()}
                            </div>
                          )}
                          <div
                            className='tab-pane fade'
                            id={`pre-script-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-pre-script-tab'
                          >
                            <div>
                              <Script
                                type='Pre-Script'
                                handleScriptChange={this.handleScriptChange.bind(this)}
                                scriptText={this.props?.endpointContent?.preScriptText}
                                endpointContent={this.props?.endpointContent}
                              />
                            </div>
                          </div>
                          <div
                            className='tab-pane fade'
                            id={`post-script-${this.props.tab.id}`}
                            role='tabpanel'
                            aria-labelledby='pills-post-script-tab'
                          >
                            <div>
                              <Script
                                type='Post-Script'
                                handleScriptChange={this.handleScriptChange.bind(this)}
                                scriptText={this.props?.endpointContent?.postScriptText}
                                endpointContent={this.props?.endpointContent}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        this.renderDocView()
                      )}
                    </div>
                    {this.isDashboardAndTestingView() && this.renderScriptError()}
                    {this.displayResponse()}
                  </div>
                </div>
                {!this.isDashboardAndTestingView() && isDashboardRoute(this.props) && (
                  <div className='doc-options d-flex align-items-center'>{this.renderDocViewOptions()}</div>
                )}
              </div>
              {isOnPublishedPage() && (
                <div className='w-100'>
                  <span className='footer-upper mt-5'>
                    <>
                      <div className='w-100 d-flex justify-content-center mb-4'>
                        <ApiDocReview {...this.props} />
                      </div>
                    </>
                  </span>
                </div>
              )}
            </div>

            {this.isDashboardAndTestingView() ? (
              <div className='response-container-main position-relative px-3'>
                {isSavedEndpoint(this.props) ? this.displayResponseAndSampleResponse() : this.displayPublicResponse()}
              </div>
            ) : null}
            {isOnPublishedPage() && (this.renderCodeTemplate())}
            {/* {isOnPublishedPage() && (
              <span className='Modified-at mt-2 lower-modified-at'>
                <DisplayUserAndModifiedData
                  isOnPublishedPage={isOnPublishedPage()}
                  pages={this.props.pages}
                  currentPage={this.props.currentEndpointId}
                  users={this.props.users}
                />
              </span>
            )} */}
          </div>
          {!isOnPublishedPage() && (this.renderCodeTemplate())}
        </div>
        {isOnPublishedPage() && (
          <div className='w-100'>
            <span className='footer-lower mt-5'>
              <>
                <div className='w-100 d-flex flex-column align-items-center mb-4'>
                  <ApiDocReview {...this.props} />
                </div>
              </>
            </span>
          </div>
        )}
      </div>
    ) : null
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withQuery(DisplayEndpoint)))
