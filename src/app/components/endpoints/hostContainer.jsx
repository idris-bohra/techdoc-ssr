import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import tabStatusTypes from '../tabs/tabStatusTypes'
import tabService from '../tabs/tabService'
import './endpoints.scss'
import { connect } from 'react-redux'
import AutoSuggest from 'env-autosuggest'
import _, { cloneDeep, debounce } from 'lodash'
import { getParseCurlData } from '../common/apiUtility'
import URI from 'urijs'
import { toast } from 'react-toastify'
import { contentTypesEnums } from '../common/bodyTypeEnums'
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { convertTextToHTML } from '../../utilities/htmlConverter'

const mapStateToProps = (state) => {
  return {
    modals: state.modals,
    tabs: state?.tabs,
    currentEnvironment: state?.environment?.environments[state?.environment?.currentEnvironmentId]?.variables || {},
    publicEnv: state?.publicEnv || {},
    activeTabId: state?.tabs?.activeTabId
  }
}
class HostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datalistHost: this.props?.endpointContent?.host?.BASE_URL,
      datalistUri: '',
      showIcon: true,
    };
    this.wrapperRef = React.createRef();
    this.hostcontainerRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleInputHostChange = this.handleInputHostChange.bind(this);
    this.observer = null;
    this.initalUrlValue = null;
    this.debouncedHandleInputHostChange = debounce(this.handleInputHostChange, 300);
  }

  componentDidMount() {
    this.setHosts();
    this.setState({ initalUrlValue: this.props?.endpointContent?.data?.URL })
    

    if (this.hostcontainerRef.current) {
      this.observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
          if (mutation.type === 'characterData' || mutation.type === 'childList') {
            this.debouncedHandleInputHostChange();
          }
        }
      });

      // Configure the observer to watch for changes in the content
      this.observer.observe(this.hostcontainerRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeTabId !== this.props?.activeTabId) {
      this.setState({ initalUrlValue: this.props?.URL })
    }
    if (!_.isEqual(prevProps.updatedUri, this.props?.updatedUri)) {
      this.setState({ datalistUri: this.props?.updatedUri });
    }
    if (!_.isEqual(prevProps.URL, this.props?.URL)) {
      if (document.activeElement !== this.hostcontainerRef?.current) this.setState({ initalUrlValue: this.props?.URL })
    }
    if (!_.isEqual(prevProps?.endpointContent?.host?.BASE_URL, this.props?.endpointContent?.host?.BASE_URL)) {
      this.setState({ datalistHost: this.props?.endpointContent?.host?.BASE_URL });
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  handleClickOutside(event) {
    if ((this.state.showDatalist || this.state.showInputHost) && this.wrapperRef && !this.wrapperRef.current?.contains(event.target)) {
      document.removeEventListener('mousedown', this.handleClickOutside)
      this.setState({ showDatalist: false, showInputHost: false })
    }
  }

  setHostAndUri() {
    const endpointUri = this.props?.updatedUri || ''
    const host = this.props?.endpointContent?.host?.BASE_URL || this.state?.datalistHost || ''
    this.setState({ datalistUri: endpointUri, datalistHost: host }, () => this.setParentHostAndUri())
  }

  setParentHostAndUri() {
    this.props.set_host_uri(this.hostcontainerRef?.current?.innerHTML)
  }

  fetchPublicEndpointHost() {
    this.props.set_base_url(this.state.datalistHost)
    return null
  }

  getDataFromParsedData(untitledEndpointData, parsedData) {
    let e = {}
    e['url'] = parsedData.raw_url
    parsedData = cloneDeep(parsedData)
    untitledEndpointData = cloneDeep(untitledEndpointData)
    untitledEndpointData.data.name = this.props.endpointContent?.data?.name || 'Untitled'
    untitledEndpointData.currentView = this.props.endpointContent?.currentView || 'testing'
    let data = this.splitUrlHelper(e)
    // setting method, url and host
    untitledEndpointData.data.method = parsedData?.method.toUpperCase()
    untitledEndpointData.data.uri = data?.datalistUri
    untitledEndpointData.data.URL = convertTextToHTML(parsedData.raw_url)
    untitledEndpointData.data.updatedUri = data?.datalistUri
    untitledEndpointData.host = {
      BASE_URL: data?.datalistHost
    }

    if (parsedData.auth_type == 'basic') {
      untitledEndpointData.authorizationData.authorizationTypeSelected = `${parsedData.auth_type}Auth`
    } else {
      untitledEndpointData.authorizationData.authorizationTypeSelected = parsedData.auth_type
    }
    untitledEndpointData.authorizationData.authorization.basicAuth = { username: parsedData?.auth?.user || "", password: parsedData?.auth?.password || "" }

    // setting path variables
    let path = new URI(parsedData.raw_url)
    let queryParams = path.query(true)
    path = path.pathname()
    const pathVariableKeys = path
      .split('/')
      .filter((part) => part.startsWith(':'))
      .map((key) => key.slice(1))
    for (let i = 0; i < pathVariableKeys.length; i++) {
      let eachData = {
        checked: 'true',
        value: '',
        description: '',
        key: convertTextToHTML(pathVariableKeys[i])
      }
      untitledEndpointData.pathVariables.push(eachData)
    }

    if (parsedData?.data) {
      // if content-type is json then value is added json stringified and body description is specially handled
      // parsedData.data is in the format of json string then convert it to object format
      try {
        parsedData.data = JSON.parse(parsedData.data)
      } catch (e) { }
      const contentType = (parsedData.headers?.['Content-Type'] || parsedData.headers?.['content-type'])?.toLowerCase()
      if (contentType.includes('application/json')) {
        /* contentType = 'application/json' */
        untitledEndpointData.data.body.type = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.rawType = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.value = typeof parsedData.data === 'object' ? JSON.stringify(parsedData.data) : parsedData.data
        // setting body description
        untitledEndpointData.bodyDescription = {
          payload: {
            value: {},
            type: 'object',
            description: ''
          }
        }

        for (let key in parsedData.data) {
          untitledEndpointData.bodyDescription.payload.value[key] = {
            value: parsedData.data[key],
            type: 'string',
            description: ''
          }
        }
      }
      // setting data for all the rawTypes defined except JSON
      else if (contentType && contentTypesEnums[contentType]) {
        untitledEndpointData.data.body.type = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.rawType = contentTypesEnums[contentType]
        untitledEndpointData.data.body.raw.value = typeof parsedData.data === 'object' ? JSON.stringify(parsedData.data) : parsedData.data
      } else {
        // setting data for 'multipart/form-data' or url-encodeded
        if (!parsedData.headers) {
          parsedData.headers = {}
        }
        parsedData.headers['Content-Type'] = !parsedData.headers?.['Content-Type']
          ? parsedData.headers?.['content-type']
          : parsedData.headers?.['Content-Type']
        let bodyType = (untitledEndpointData.data.body.type = !parsedData.headers?.['Content-Type']
          ? 'multipart/form-data'
          : parsedData.headers?.['Content-Type'] || 'application/x-www-form-urlencoded')
        if (typeof parsedData.data === 'string') {
          let keyValuePairs = parsedData.data.split('&');
          keyValuePairs.forEach((pair) => {
            let [key, value] = pair.split('=');
            untitledEndpointData.data.body[bodyType].push({
              checked: 'true',
              key: convertTextToHTML(key),
              value: convertTextToHTML(decodeURIComponent(value)),
              description: '',
              type: 'text'
            });
          });
        } else if (typeof parsedData.data === 'object') {
          Object.keys(parsedData.data).forEach(key => {
            untitledEndpointData.data.body[bodyType].push({
              checked: 'true',
              key: convertTextToHTML(key),
              value: convertTextToHTML(parsedData.data[key]),
              description: '',
              type: 'text'
            });
          });
        }
        untitledEndpointData.data.body[bodyType].push(...untitledEndpointData.data.body[bodyType].splice(0, 1))
      }
    }

    // setting headers
    for (let key in parsedData?.headers) {
      let eachDataOriginal = {
        checked: 'true',
        value: convertTextToHTML(parsedData.headers[key]),
        description: '',
        key: convertTextToHTML(key)
      }
      untitledEndpointData.originalHeaders.push(eachDataOriginal)
    }
    untitledEndpointData.originalHeaders.push(...untitledEndpointData.originalHeaders.splice(0, 1))

    // setting query params
    for (let key in queryParams) {
      let eachDataOriginal = {
        checked: 'true',
        value: convertTextToHTML(queryParams[key]),
        description: '',
        key: convertTextToHTML(key)
      }
      untitledEndpointData.originalParams.push(eachDataOriginal)
    }
    untitledEndpointData.originalParams.push(...untitledEndpointData.originalParams.splice(0, 1))

    this.props.setQueryUpdatedData(untitledEndpointData)
    tabService.markTabAsModified(this.props.tabs.activeTabId)
  }

  normalizeCurlString(curlString) {
    return curlString.replace(/\\\n/g, '').replace(/\s{2,}/g, ' ').trim();
  }

  async handleInputHostChange() {
    if (!this.hostcontainerRef || !this.hostcontainerRef.current) {
      console.error('hostcontainerRef is not set or does not have a current value');
      return;
    }

    let inputValue = this.hostcontainerRef.current.innerText;
    inputValue = this.normalizeCurlString(inputValue)
    if (inputValue.trim().startsWith('curl')) {
      try {
        let modifiedCurlCommand = inputValue;
        if (modifiedCurlCommand.includes('--url')) {
          modifiedCurlCommand = modifiedCurlCommand.replace('--url', ' ');
        }
        let parsedData = await getParseCurlData(modifiedCurlCommand);
        parsedData = JSON.parse(parsedData.data);
        // Remove any occurrence of 'http://' followed by a space
        parsedData.url = parsedData.url.replace(/^http:\/\/\s/, '');
        // Check if 'http://' or 'https://' appears twice and correct it
        parsedData.url = parsedData.url.replace(/^(http:\/\/https?:\/\/)/, '$2');
        parsedData.raw_url = parsedData.raw_url.replace(/^http:\/\/\s/, '');
        parsedData.raw_url = parsedData.raw_url.replace(/^(http:\/\/https?:\/\/)/, '$2');
        this.getDataFromParsedData(this.props.untitledEndpointData, parsedData);
        this.hostcontainerRef.current.innerHTML = convertTextToHTML(parsedData.raw_url);
        return;
      } catch (e) {
        toast.error('could not parse the curl');
      }
    }

    const data = this.splitUrlHelper({ target: { value: inputValue } });
    this.setState(
      {
        ...data,
        showDatalist: inputValue === ''
      },
      () => {
        this.setParentHostAndUri();
      }
    );
  }


  handleClickHostOptions(host, type) {
    this.setState(
      {
        datalistHost: host || this.props?.endpointContent?.host?.BASE_URL,
        showDatalist: false,
        Flag: true
      },
      () => this.setParentHostAndUri()
    )
  }

  checkExistingHosts(value) {
    const regex = /^((http[s]?|ftp):\/\/[\w.\-@:]*)/i
    const variableRegex = /^{{[\w|-]+}}/i
    const { environmentHost } = this.state
    if (value?.match(variableRegex)) {
      return value.match(variableRegex)[0]
    }
    if (environmentHost && value?.match(new RegExp('^' + environmentHost) + '/')) {
      return environmentHost
    }
    if (value?.match(regex)) {
      return value.match(regex)[0]
    }
    return null
  }

  splitUrlHelper(e) {
    const value = e?.target?.value || e?.url || ''
    const hostName = this.checkExistingHosts(value)
    let uri = ''
    const data = {
      datalistHost: '',
      datalistUri: '',
      Flag: true
    }
    if (hostName) {
      data.datalistHost = hostName
      uri = value.replace(hostName, '')
    } else {
      uri = value
    }
    data.datalistUri = uri
    return data
  }

  setHosts() {
    const { environmentHost } = this.props
    this.setState({ environmentHost }, () => {
      this.setHostAndUri()
    })
  }

  handleValueChange() {
    this.setParentHostAndUri()
    this.props.props_from_parent('HostAndUri');
  }

  renderHostDatalist() {
    const endpointId = this.props.endpointId
    const { showIcon } = this.state;
    return (
      <div className='url-container' key={`${endpointId}_hosts`} ref={this.wrapperRef}>
        <AutoSuggest
          handleValueChange={this.handleValueChange}
          contentEditableDivRef={this.hostcontainerRef}
          suggestions={this.props?.currentEnvironment}
          initial={this.state.initalUrlValue ?? ''}
          placeholder={'Enter URL or paste curl'}
        />
        {showIcon && <div className='position-relative url-icons'> <HiOutlineExclamationCircle size={20} className='invalid-icon' />
          <span className='position-absolute'>URL cannot be empty</span>
        </div>}
      </div>
    )
  }

  renderPublicHost() {
    return (
      <div className='flex-grow-1 autosuggest-hostcontainer'>
        <AutoSuggest
          disable={true}
          handleValueChange={this.handleValueChange}
          contentEditableDivRef={this.hostcontainerRef}
          suggestions={this.props?.publicEnv}
          initial={this.props?.URL ?? ''}
        />
      </div>
    )
  }

  render() {
    if (isDashboardRoute(this.props) && this.state.groupId && this.props.tab.status === tabStatusTypes.DELETED) {
      this.setState({ groupId: null })
    }
    if (isDashboardRoute(this.props)) {
      return this.renderHostDatalist()
    } else {
      return this.renderPublicHost()
    }
  }
}

export default connect(mapStateToProps)(HostContainer)