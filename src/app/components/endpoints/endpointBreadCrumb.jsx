import React, { Component } from 'react'
import { connect } from 'react-redux'
import './endpointBreadCrumb.scss'
import { getOrgId, isElectron, trimString } from '../common/utility'
import { updateNameOfPages } from '../pages/redux/pagesActions'
import { MdHttp } from 'react-icons/md'
import { GrGraphQl } from 'react-icons/gr'
import { updateTab } from '../tabs/redux/tabsActions'
import withRouter from '../common/withRouter'
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GoDotFill } from 'react-icons/go'
import { RxSlash } from "react-icons/rx";


const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.pages,
    tabState: state.tabs.tabs,
    activeTabId: state.tabs.activeTabId,
    history: state.history
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    update_name: (id, name) => dispatch(updateNameOfPages(id, name)),
    update_tab: (id, data) => dispatch(updateTab(id, data))
  }
}

class EndpointBreadCrumb extends Component {
  constructor(props) {
    super(props)
    this.nameInputRef = React.createRef()
    this.handleKeyDownEvent = this.handleKeyDownEvent.bind(this);

    this.state = {
      nameEditable: false,
      endpointTitle: 'Untitled',
      previousTitle: '',
      groupName: null,
      versionName: null,
      collectionName: null,
      isPagePublished: false,
      protocols: [
        { type: 'HTTP', icon: <MdHttp color='green' className='d-block' size={18} /> },
        { type: 'GraphQL', icon: <GrGraphQl color='rgb(170, 51, 106)' size={12} /> }
      ]
    }
  }

  componentDidMount() {
    if (this.props.isEndpoint) {
      const endpointId = this.props?.params.endpointId
      if (this.props?.pages?.[endpointId]) {
        this.setState({
          endpointTitle: this.props.pages[endpointId]?.name || '',
          isPagePublished: this.props.pages[endpointId]?.isPublished || false,
          previousTitle: this.props.pages[endpointId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    } else {
      const pageId = this.props?.params.pageId
      if (this.props?.pages?.[pageId]) {
        this.setState({
          endpointTitle: this.props.pages[pageId]?.name || '',
          isPagePublished: this.props.pages[pageId]?.isPublished || false,
          previousTitle: this.props.pages[pageId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    }

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      // ipcRenderer.on('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.isEndpoint) {
      if (prevProps.params.endpointId === this.props?.params.endpointId) return
      const endpointId = this.props?.params.endpointId
      if (this.props?.pages?.[endpointId]) {
        this.setState({
          endpointTitle: this.props.pages[endpointId]?.name || '',
          isPagePublished: this.props.pages[endpointId]?.isPublished || false,
          previousTitle: this.props.pages[endpointId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    } else {
      if (prevProps?.params.pageId === this.props?.params.pageId) return
      const pageId = this.props?.params.pageId
      if (this.props?.pages?.[pageId]) {
        this.setState({
          endpointTitle: this.props.pages[pageId]?.name || '',
          isPagePublished: this.props.pages[pageId]?.isPublished || false,
          previousTitle: this.props.pages[pageId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    }
  }

  // handleShortcuts = (e, actionType) => {
  //   if (actionType === 'RENAME_ENDPOINT') {
  //     this.setState({ nameEditable: true }, () => {
  //       this.nameInputRef.current.focus()
  //     })
  //   }
  // }

  changeEndpointName() {
    const endpoint = this.props.endpoint
    if (endpoint && !endpoint.id && this.props.data.name === '') {
      this.props.alterEndpointName('Untitled')
      this.setState({ endpointTitle: 'Untitled', previousTitle: 'Untitled' })
    }
  }
  handleInputChange(e) {
    const newName = e.currentTarget.textContent;
      this.setState({ changesMade: true, endpointTitle: newName });
      if (this.props?.isEndpoint) {
        const tempData = this.props?.endpointContent || {};
        tempData.data.name = newName;
        this.props.setQueryUpdatedData(tempData);
        this.props.update_name(this.props?.params?.endpointId, newName);
      }
  }

  handleInputBlur(event) {
    const newName = event.currentTarget.textContent;

    if (newName !== this.state.previousTitle && this.props.tabState[this.props.activeTabId].status !== 'NEW') {
      if (trimString(event.currentTarget.textContent).length === 0) {
        const tempData = this.props?.endpointContent || {}
        tempData.data.name = 'Untitled'
        this.props.setQueryUpdatedData(tempData)
        this.props.update_name(this.props?.params?.endpointId, 'Untitled')
      }
      // else if (this.props.tabState[this.props.activeTabId].status === 'NEW' && trimString(event.currentTarget.textContent).length === 0) {
      //   const tempData = this.props?.endpointContent || {}
      //   tempData.data.name = 'Untitled'
      //   this.props.setQueryUpdatedData(tempData)
      //   this.props.update_name(this.props.activeTabId, 'Untitled')
      // }
      // else if (this.props.tabState[this.props.activeTabId].status === 'NEW') {
      //   const tempData = this.props?.endpointContent || {}
      //   tempData.data.name = event.currentTarget.textContent
      //   this.props.setQueryUpdatedData(tempData)
      //   this.props.update_name(this.props.activeTabId, event.currentTarget.textContent)
      // }
      else {
        const tempData = this.props?.endpointContent || {}
        tempData.data.name = event.currentTarget.textContent
        this.props.setQueryUpdatedData(tempData)
        this.props.update_name(this.props?.params?.endpointId, event.currentTarget.textContent)
      }
    }
  }

  setEndpointData() {
    this.endpointId = this.props?.params.endpointId
    this.collectionId = this.props.pages[this.endpointId]?.collectionId
    this.collectionName = this.collectionId ? this.props.collections[this.collectionId]?.name : null
  }

  setPageData() {
    this.pageId = this.props?.params.pageId
    this.collectionId = this.props.pages[this.pageId]?.collectionId
    this.collectionName = this.collectionId ? this.props.collections[this.collectionId]?.name : null
  }

  renderLeftAngle(title) {
    return title && <span className='ml-1 mr-1'>/</span>
  }

  handleProtocolTypeClick(index) {
    this.props.setQueryUpdatedData({ ...this.props.endpointContent, protocolType: index + 1 })
    this.props.update_tab(this.props?.params.endpointId === 'new' && this.props.activeTabId, { isModified: true })
    this.props.setActiveTab()
  }

  switchProtocolTypeDropdown() {
    return (
      <div className='dropdown d-flex justify-content-center align-items-center'>
        <button className='protocol-selected-type d-flex justify-content-center align-items-center' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
          {this.state.protocols[this.props?.endpointContent?.protocolType - 1]?.icon}
        </button>
        <div className='dropdown-menu protocol-dropdown' aria-labelledby='dropdownMenuButton'>
          {this.state.protocols.map((protocolDetails, index) => (
            <button className='dropdown-item' key={index} onClick={() => this.handleProtocolTypeClick(index)}>
              {protocolDetails.icon}
              <span className='protocol-type-text'>{protocolDetails.type}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }


  getPath(id, sidebar) {
    const orgId = getOrgId()
    let path = []
    while (sidebar?.[id]?.type > 0) {
      const itemName = sidebar[id].name
      path.push({ name: itemName, path: `orgs/${orgId}/dashboard/page/${id}`, id: id })
      id = sidebar?.[id]?.parentId
    }
    return path.reverse()
  }

  handleOnPathVarClick(isLastItem, item) {
    if (isLastItem) {
      this.setState({ nameEditable: true })
    } else {
      this.props.navigate(`/${item.path}`, { replace: true });
    }
  }

  renderPathLinks() {
    this.props.isEndpoint ? this.setEndpointData() : this.setPageData();
    const pathWithUrls = this.getPath(this.props?.params?.pageId || this.props?.params?.endpointId, this.props.pages);

    return pathWithUrls.map((item, index) => {
      if (this.props.pages?.[item.id]?.type === 2) return null;
      const isLastItem = index === pathWithUrls.length - 1;
      return (
        <div className='d-flex align-items-center' onClick={() => this.handleOnPathVarClick(isLastItem, item)}>
          {isLastItem ? (
            <strong
              contentEditable
              className='cursor-text fw-500 px-1 py-0'
              onBlur={(e) => this.handleInputBlur(e)}
              onKeyDown={(e) => this.handleKeyDownEvent(e)}
              key={index}
            >
              {this.props?.isEndpoint
                ? this.props?.pages?.[this.props?.params?.endpointId]?.name ||
                this.props?.history?.[this.props?.params?.historyId]?.endpoint?.name ||
                this.props?.endpointContent?.data?.name
                : this.props?.pages?.[this.props?.params?.pageId]?.name}
            </strong>

          ) : (
            <strong className='cursor-pointer fw-400 cursor-pointer px-1 py-0 text-secondary fw-400'>{item.name}</strong>
          )}
          {index < pathWithUrls.length - 1 && <p className='p-0 m-0 text-secondary fw-400'>/</p>}
        </div>
      );
    });
  }

  handleKeyDownEvent(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
        event.target.blur();
        this.setState({ nameEditable: false });
        this.handleInputBlur(event);
    }
  }

  render() {
    const orgId = getOrgId();
    const path = `orgs/${orgId}/dashboard/collection/${this.collectionId}/settings`;

    return (
      <div className='endpoint-header d-flex align-items-center'>
        <div className='panel-endpoint-name-container d-flex align-items-center'>

          <div className='page-title-name d-flex align-items-center'>
            {this.props?.tabState[this.props?.activeTabId]?.status === 'NEW' && this.switchProtocolTypeDropdown()}
          </div>

          {this.props.tabState[this.props.activeTabId].status !== 'NEW' ? (
            <div className='d-flex bread-crumb-wrapper align-items-center text-nowrap'>

              <div className='text-nowrap-heading breadcrumb-main d-flex align-items-center flex-wrap'>
                {this.collectionName && (
                  <strong className='text-secondary fw-400 px-1 py-0 text-nowrap-heading cursor-pointer' onClick={() => this.props.navigate(`/${path}`, { replace: true })}>{this.collectionName}</strong>
                )}
                <p className='p-0 m-0 text-secondary fw-400'>/</p>
                {this.renderPathLinks()}
              </div>
              {
                this.props.publishLoader && (
                  <div>
                    <div class="spinner-border spinner-border-sm ml-2" role="status" style={{ color: '#6c757d ', width: '1rem', height: '1rem' }}>
                      <span class="sr-only ">Publishing...</span>
                    </div>
                    <span className="ml-1" style={{ color: '#6c757d ', fontSize: '0.8rem' }}>Publishing...</span>
                  </div>
                )
              }
              {this.props?.endpoints[this.props.currentEndpointId]?.isPublished && (
                <OverlayTrigger placement="right" overlay={<Tooltip className="font-12 text-secondary live-tooltip" id="tooltip-right">Live</Tooltip>} trigger={['hover', 'focus']}>
                  <GoDotFill size={14} color="green" />
                </OverlayTrigger>
              )}
            </div>
          ) : (
            <strong
              ref={this.nameInputRef}
              contentEditable={true}
              className='cursor-text fw-500 px-1 py-0 ml-1'
              onBlur={(e) => this.handleInputBlur(e)}
              onKeyDown={(e) => this.handleKeyDownEvent(e)}
              key={this.props.params.endpointId}
            >
              {this.props?.pages?.[this.props?.params?.endpointId]?.name ||
                this.props?.history?.[this.props?.params?.historyId]?.endpoint?.name ||
                this.props?.endpointContent?.data?.name
                && this.props?.pages?.[this.props?.params?.pageId]?.name || "Untitled"}
            </strong>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EndpointBreadCrumb))
