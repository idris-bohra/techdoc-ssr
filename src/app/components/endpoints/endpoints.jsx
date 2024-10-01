import React, { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import { addExampleRequest, deleteEndpoint, duplicateEndpoint } from './redux/endpointsActions'
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage, hexToRgb } from '../common/utility'
import tabService from '../tabs/tabService'
import tabStatusTypes from '../tabs/tabStatusTypes'
import SubPageForm from '../subPages/subPageForm'
import endpointService from './endpointService'
import IconButtons from '../common/iconButton'
import { BsThreeDots } from 'react-icons/bs'
import { GrGraphQl } from 'react-icons/gr'
import { background } from '../backgroundColor.js'
import '../../../src/components/styles.scss'
import './endpoints.scss'
import { FiEdit2 } from 'react-icons/fi'
import { MdOutlineContentCopy } from 'react-icons/md'
import { RiDeleteBin6Line } from 'react-icons/ri'
import CombinedCollections from '../combinedCollections/combinedCollections.jsx'
import { ReactComponent as Example } from '../../assets/icons/example.svg';

const Endpoints = (props) => {
  const [showEndpointForm, setShowEndpointForm] = useState({ addPage: false, edit: false, share: false, delete: false })
  const [isHovered, setIsHovered] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)

  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { endpoints, tabs, pages, collections } = useSelector((state) => ({
    endpoints: state.pages,
    tabs: state.tabs,
    clientData: state.clientData,
    pages: state.pages,
    collections: state.collections
  }))

  const handleDelete = (endpoint) => {
    dispatch(deleteEndpoint(endpoint))
    tabService.removeTab(tabs.activeTabId, { navigate, params, location })
  }

  const handleModalActionType = (actionType, endpointId) => {
    setShowEndpointForm((prev) => ({ ...prev, [actionType]: true }))
    setSelectedEndpoint(endpoints[endpointId])
  }

  const handleDuplicate = (endpointId) => dispatch(duplicateEndpoint(endpoints[endpointId]))
  const handleAddExampleRequest = (endpointId) => dispatch(addExampleRequest(navigate, endpointId))

  const closeDeleteEndpointModal = () => {
    setShowEndpointForm((prev) => ({ ...prev, delete: false }))
  }

  const handleDisplay = (endpoint, groupId, collectionId, previewMode) => {
    window.scroll(0, 0)
    if (isDashboardRoute({ location, navigate }, true)) {
      if (!tabs.tabs[endpoint.id]) {
        const previewTabId = Object.keys(tabs.tabs).filter((tabId) => tabs.tabs[tabId].previewMode === true)[0]
        if (previewTabId) dispatch(closeTab(previewTabId))
        dispatch(openInNewTab({ id: endpoint.id, type: 'endpoint', status: tabStatusTypes.SAVED, previewMode, isModified: false, state: {} }))
      } else if (tabs.tabs[endpoint.id].previewMode === true && previewMode === false) {
        tabService.disablePreviewMode(endpoint.id)
      }
      navigate(`/orgs/${params.orgId}/dashboard/endpoint/${endpoint.id}`, {
        state: {
          title: 'update endpoint',
          endpoint,
          groupId,
          collectionId,
        }
      })
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, endpoint?.id)
      let pathName = getUrlPathById(endpoint?.id, pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      navigate(pathName)
    }
  }

  const displayEndpointName = (endpointId) => {
    const isSelected = isOnPublishedPage() && sessionStorage.getItem('currentPublishIdToShow') === endpointId ? 'selected' : isDashboardRoute({ location, navigate }) && params.endpointId === endpointId ? 'selected' : ''
    return (
      <div className={`sidebar-accordion-item gap-2 ${isSelected ? ' selected text-dark' : ''} ${isOnPublishedPage() ? 'text-dark w-100' : 'text-secondary'}`} style={{ paddingLeft: `${props?.level * 8}px` }}>
        {endpoints[endpointId]?.type === 5 ? (
          <Example />
        ) : (
          <>
            {endpoints[endpointId]?.protocolType === 1 && (
              <div className={`api-label ${endpoints[endpointId].requestType} request-type-bgcolor ${!isOnPublishedPage() ? 'in-api-label' : ''}`}>
                {endpoints[endpointId].requestType}
              </div>
            )}
            {endpoints[endpointId]?.protocolType === 2 && (
              <div className={`api-label graphql request-type-bgcolor ${!isOnPublishedPage() ? 'in-api-label' : ''}`}>
                <GrGraphQl className='ml-1 graphql-icon' size={16} />
              </div>
            )}
          </>
        )}
        <div className={`end-point-name truncate ${isOnPublishedPage() ? '' : 'fw-500'}`}>{endpoints[endpointId].name}</div>
      </div>
    )
  }

  const displayEndpointOptions = (endpointId) => (
    <div className='sidebar-item-action d-block'>
      <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
        <IconButtons>
          <BsThreeDots />
        </IconButtons>
      </div>
      <div className='dropdown-menu dropdown-menu-right'>
        <div className='dropdown-item d-flex font-14 align-items-center' onClick={() => handleModalActionType('edit', endpointId)}> <FiEdit2 className='text-grey' size={15} /> Rename </div>
          <div className='dropdown-item d-flex font-14 align-items-center' onClick={() => handleAddExampleRequest(endpointId)}> <Example className='text-grey' size={15} /> Add example </div>
        <div className='dropdown-item d-flex font-14 align-items-center' onClick={() => handleDuplicate(endpointId)}> <MdOutlineContentCopy className='text-grey' size={15} /> Duplicate </div>
        <div
          className='dropdown-item d-flex font-14 align-items-center text-danger delete-endpoint-btn'
          onClick={() => handleModalActionType('delete', endpointId)}
        >
          <RiDeleteBin6Line size={15} /> Delete </div>
      </div>
    </div>
  )

  const displaySingleEndpoint = (endpointId) => {
    let isUserOnPublishedPage = isOnPublishedPage()
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === endpointId ? 'selected' : isDashboardRoute({ location, navigate }) && params.endpointId === endpointId ? 'selected' : ''
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    let collectionId = pages?.[idToRender]?.collectionId ?? null
    var collectionTheme = collections[collectionId]?.theme
    const dynamicColor = hexToRgb(collectionTheme, 0.15)
    const staticColor = background['background_hover']

    const backgroundStyle = {
      backgroundImage: isHovered || isSelected ? `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}), linear-gradient(to right, ${staticColor}, ${staticColor})` : ''
    }

    return (
      <>
        <div
          key={endpointId}
          draggable={!isUserOnPublishedPage}
          onDragOver={(e) => e.preventDefault()}
          onDragStart={() => props.onDragStart(endpointId)}
          onDrop={(e) => props.onDrop(e, endpointId)}
          onDragEnter={(e) => props.onDragEnter(e, endpointId)}
          onDragEnd={(e) => props.onDragEnd(e)}
          style={props.draggingOverId === endpointId ? { borderTop: '3px solid red' } : null}
        >
          <div className='sidebar-toggle d-flex justify-content-between'>
            <button className='pl-0'>
              <div className={`side-bar align-items-center d-flex rounded ${isSelected ? 'Selected text-black' : 'text-secondary'}`} style={backgroundStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <button className={`d-flex align-items-center ${isOnPublishedPage() ? '' : 'endpoint-name-td'}`} tabIndex={-1} onClick={() => handleDisplay(endpoints[endpointId], params.endpointId, collectionId, true)} onDoubleClick={() => handleDisplay(endpoints[endpointId], params.endpointId, collectionId, false)}>
                  {displayEndpointName(endpointId)}
                </button>
                <div className='endpoint-icons align-items-center'>
                  {isDashboardRoute({ navigate, location }, true) && displayEndpointOptions(endpointId)}
                </div>
              </div>
            </button>
          </div>
        </div>
        <div>
          <CombinedCollections level={props.level} collectionId={props?.collectionId} rootParentId={props?.endpointId} />
        </div>
      </>
    )
  }

  return (
    <React.Fragment>
      {showEndpointForm.edit && (
        <SubPageForm
          {...props}
          title='Rename'
          show={showEndpointForm.edit}
          onCancel={() => setShowEndpointForm((prev) => ({ ...prev, edit: false }))}
          onHide={() => setShowEndpointForm((prev) => ({ ...prev, edit: false }))}
          selectedEndpoint={selectedEndpoint}
          pageType={4 || 5}
          isEndpoint={true}
          selectedPage={selectedEndpoint?.id}
        />
      )}
      {showEndpointForm.delete && endpointService.showDeleteEndpointModal({ tabs, dispatch }, handleDelete, closeDeleteEndpointModal, 'Delete Endpoint', `Are you sure you want to delete this endpoint?`, selectedEndpoint)}
      {displaySingleEndpoint(props.endpointId)}
    </React.Fragment>
  )
}
export default Endpoints