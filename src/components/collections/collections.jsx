import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { isDashboardRoute, openExternalLink, isOnPublishedPage, isOrgDocType } from '../common/utility'
import collectionsService from './collectionsService'
import TagManagerModal from './tagModal'
import { ReactComponent as EmptyCollections } from '../../assets/icons/emptyCollections.svg'
import CombinedCollections from '../combinedCollections/combinedCollections'
import DefaultViewModal from './defaultViewModal/defaultViewModal'
import MoveModal from '../common/moveModal/moveModal'
import ExportButton from './exportCollection/exportButton'
import IconButtons from '../common/iconButton'
import { addIsExpandedAction } from '../../store/clientData/clientDataActions'
import { FiEdit2, FiPlus } from 'react-icons/fi'
import { BsThreeDots } from 'react-icons/bs'
import { RiDeleteBin6Line, RiShareForward2Line } from 'react-icons/ri'
import { TbDirections, TbSettingsAutomation } from 'react-icons/tb'
import { BiExport } from 'react-icons/bi'
import CustomModal from '../customModal/customModal'
import CollectionForm from './collectionForm'
import { Card } from 'react-bootstrap'
import 'react-toastify/dist/ReactToastify.css'
import './collections.scss'
import { addPage } from '../pages/redux/pagesActions'
import { openInNewTab } from '../tabs/redux/tabsActions'
import { IoIosSettings } from "react-icons/io";
import { IoDocumentTextOutline, IoPricetagOutline } from 'react-icons/io5'

const Collections = (props) => {
  const collections = useSelector((state) => state.collections)
  const clientData = useSelector((state) => state.clientData)
  const organizations = useSelector((state) => state.organizations)
  const dispatch = useDispatch()

  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()

  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState({})
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false)
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [automationSelectedCollectionId, setAutomationSelectedCollectionId] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const closeCollectionForm = () => {
    setShowCollectionForm(false)
  }

  const handleOrgModalOpen = (collection) => {
    setShowOrgModal(true)
    setSelectedCollection(collection)
  }

  const handleOrgModalClose = () => {
    setShowOrgModal(false)
  }

  const handleGoToDocs = (collection) => {
    const publicDocsUrl = `${import.meta.env.VITE_PUBLIC_UI_URL}/p?collectionId=${collection.id}`
    openExternalLink(publicDocsUrl)
  }

  const openEditCollectionForm = (collectionId) => {
    setShowCollectionForm(true)
    setSelectedCollection({
      ...collections[collectionId]
    })
  }

  const openDeleteCollectionModal = (collectionId) => {
    setShowDeleteModal(true)
    setSelectedCollection({
      ...collections[collectionId]
    })
  }

  const closeDeleteCollectionModal = () => {
    setShowDeleteModal(false)
    setShowRemoveModal(false)
  }

  const openSelectedCollection = (collectionId) => {
    props.empty_filter()
    props.collection_selected(collectionId)
  }

  const TagManagerModalOpen = (collectionId) => {
    setGtmId(collectionId)
    setAutomationSelectedCollectionId(true)
  }

  const openTagManagerModal = () => {
    return (
      automationSelectedCollectionId && (
        <TagManagerModal
          {...props}
          show
          onHide={() => setAutomationSelectedCollectionId(false)}
          title='Google Tag Manager'
          collection_id={gtmId}
        />
      )
    )
  }

  const removeImporedPublicCollection = (collectionId) => {
    setShowRemoveModal(true)
    setSelectedCollection({
      ...collections[collectionId]
    })
  }

  const toggleSelectedCollectionIds = (id) => {
    const isExpanded = clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    dispatch(
      addIsExpandedAction({
        value: !isExpanded,
        id
      })
    )
  }

  const openPublishSettings = (collectionId) => {
    if (collectionId) {
      navigate(`/orgs/${params.orgId}/dashboard/collection/${collectionId}/settings`)
    }
  }

  const openAddPageEndpointModal = (collectionId) => {
    const newPage = { name: 'untitled', pageType: 1 };
    if (!isOrgDocType()) {
      dispatch(addPage(collections[collectionId].rootParentId, newPage))
    } else {
      setShowAddCollectionModal(true)
      setSelectedCollection({
        ...collections[collectionId]
      })
    }
  }

  const showAddPageEndpointModal = () => {
    return (
      showAddCollectionModal && (
        <DefaultViewModal
          {...props}
          title='Add Parent Page'
          show={showAddCollectionModal}
          onCancel={() => setShowAddCollectionModal(false)}
          onHide={() => setShowAddCollectionModal(false)}
          selectedCollection={selectedCollection}
          pageType={1}
        />
      )
    )
  }

  const openRedirectionsPage = (collection) => {
    navigate(`/orgs/${params.orgId}/dashboard/collection/${collection.id}/redirections`)
  }

  const handleApiAutomation = (collectionId) => {
    navigate(`/orgs/${params.orgId}/dashboard/collection/${collectionId}/runner`)
  }

  const renderBody = (collectionId, collectionState) => {
    const expanded = clientData?.[collectionId]?.isExpanded ?? isOnPublishedPage()
    const isOnDashboardPage = isDashboardRoute({ location })

    return (
      <React.Fragment key={collectionId}>
        <div key={collectionId} id='parent-accordion' className={`sidebar-accordion px-2 ${expanded ? 'expanded mb-3' : ''}`}>
          <button tabIndex={-1} variant='default' className={`sidebar-hower pr-2 rounded ${expanded ? 'expanded' : ''}`}>
            <div
              className='inner-container'
              onClick={() => toggleSelectedCollectionIds(collectionId)}
            >
              <div className='d-flex justify-content-between'>
                <div className='w-100 d-flex'>
                  {collectionState === 'singleCollection' ? (
                    <div className='sidebar-accordion-item' onClick={() => openSelectedCollection(collectionId)}>
                      <div className='text-truncate'>{collections[collectionId].name}</div>
                    </div>
                  ) : (
                    <span className='truncate collect-length collection-box'> {collections[collectionId].name} </span>
                  )}
                </div>
              </div>
            </div>
            {
              //  [info] options not to show on publihsed page
              isOnDashboardPage && (
                <div className='d-flex align-items-center justify-content-end' >
                  <div className='sidebar-item-action d-flex align-items-center justify-content-end pr-0'>
                    <div className='d-flex align-items-center' onClick={() => openPublishSettings(collectionId)}>
                      <IconButtons>
                        <IoIosSettings color='grey' />
                      </IconButtons>
                    </div>
                    <div className='d-flex align-items-center' onClick={() => openAddPageEndpointModal(collectionId)}>
                      <IconButtons>
                        <FiPlus color='grey' />
                      </IconButtons>
                    </div>
                    <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                      <IconButtons>
                        <BsThreeDots color='grey' />
                      </IconButtons>
                    </div>
                    <div className='dropdown-menu dropdown-menu-right'>
                      {!collections[collectionId]?.importedFromMarketPlace && (
                        <>
                          <div className='dropdown-item d-flex align-items-center' onClick={() => openEditCollectionForm(collectionId)}>
                            <FiEdit2 color='gray' /> Rename
                          </div>
                          {collections[collectionId].isPublic && (
                            <div className='dropdown-item d-flex align-items-center' onClick={() => handleGoToDocs(collections[collectionId])}>
                              <IoDocumentTextOutline color='gray' /> Go to API Documentation
                            </div>
                          )}
                          <div
                            className='dropdown-item d-flex align-items-center'
                            onClick={() => {
                              TagManagerModalOpen(collectionId)
                            }}
                          >
                            <IoPricetagOutline color='gray' /> Add Google Tag Manager
                          </div>
                          <div className='dropdown-item' onClick={() => handleOrgModalOpen(collections[collectionId])}>
                            <RiShareForward2Line size={16} color='grey' /> Move
                          </div>
                          <div className='dropdown-item d-flex' onClick={() => openRedirectionsPage(collections[collectionId])}>
                            <TbDirections size={16} color='grey' /> Redirections
                          </div>
                          {isOrgDocType() && <div className='dropdown-item' onClick={() => handleApiAutomation(collectionId)}>
                            <TbSettingsAutomation size={16} color='grey' />
                            API Automation
                          </div>}
                          {isOrgDocType() && <div className='dropdown-item d-flex align-items-center h-auto'>
                            <BiExport className='mb-1' size={18} color='grey' />
                            <ExportButton
                              orgId={params.orgId}
                              collectionId={collectionId}
                              collectionName={collections[collectionId].name}
                            />
                          </div>}
                          <div
                            className='text-danger dropdown-item delete-button-sb d-flex align-items-center delete-collection-btn'
                            onClick={() => openDeleteCollectionModal(collectionId)}
                          >
                            <RiDeleteBin6Line size={12} /> Delete
                          </div>
                        </>
                      )}
                      {collections[collectionId]?.importedFromMarketPlace && (
                        <div
                          className='dropdown-item d-flex align-items-center justify-content-between'
                          onClick={() => {
                            removeImporedPublicCollection(collectionId)
                          }}
                        >
                          <div className='marketplace-icon mr-2'> M </div>
                          <div> Remove Public Collection </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='theme-color d-flex transition counts ml-1 f-12'>
                    {collections[collectionId]?.importedFromMarketPlace ? <div className='marketplace-icon mr-1'> M </div> : null}
                    <span className={collections[collectionId].isPublic ? 'published' : ''}></span>
                  </div>
                </div>
              )
            }
          </button>
          {expanded ? (
            <div id='collection-collapse'>
              <Card.Body>
                <CombinedCollections
                  {...props}
                  handleOnDragOver={props.handleOnDragOver}
                  onDragEnter={props.onDragEnter}
                  onDragEnd={props.onDragEnd}
                  onDragStart={props.onDragStart}
                  onDrop={props.onDrop}
                  draggingOverId={props.draggingOverId}
                  collection_id={collectionId}
                  selectedCollection
                  rootParentId={collections[collectionId].rootParentId}
                  level={-1}
                />
              </Card.Body>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    )
  }

  const renderEmptyCollections = () => {
    return (
      <div className='empty-collections text-center mt-4'>
        <div>
          <EmptyCollections/>
          {/* <img src={emptyCollections} alt='' /> */}
        </div>
        <div className='content'>
          <h5>Your collection is Empty.</h5>
        </div>
      </div>
    )
  }

  const showDeleteCollectionModal = () => {
    const title = showRemoveModal ? 'Remove Collection' : 'Delete Collection'
    const message = showRemoveModal
      ? 'Are you sure you wish to remove this public collection?'
      : 'Are you sure you wish to delete this collection? All your pages, versions and endpoints present in this collection will be deleted.'
    return (
      (showDeleteModal || showRemoveModal) &&
      collectionsService.showDeleteCollectionModal({ ...props }, closeDeleteCollectionModal, title, message, selectedCollection)
    )
  }

  if (isDashboardRoute({ location }, true)) {
    return (
      <div>
        <div className='App-Nav'>
          <div className='tabs'>
            {showAddCollectionModal && showAddPageEndpointModal()}
            {showCollectionForm && (
              <CustomModal size='sm' modalShow={showCollectionForm} hideModal={closeCollectionForm}>
                <CollectionForm title='Edit Collection' isEdit={true} collectionId={selectedCollection?.id} onHide={closeCollectionForm} />
              </CustomModal>
            )}
            {openTagManagerModal()}
            {showDeleteCollectionModal()}
            {showOrgModal && <MoveModal moveCollection={selectedCollection} onHide={handleOrgModalClose} show={showOrgModal} />}
          </div>
        </div>
        {props.collectionsToRender.length > 0 ? (
          <div className='App-Side mt-1'>{props.collectionsToRender.map((collectionId) => renderBody(collectionId, 'allCollections'))}</div>
        ) : props.filter === '' ? (
          renderEmptyCollections()
        ) : (
          <div className='px-2'>No Collections Found!</div>
        )}
      </div>
    )
  } else {
    return (
      <>
        <div className='App-Side'>{props.collectionsToRender.map((collectionId) => renderBody(collectionId, 'allCollections'))}</div>
      </>
    )
  }
}

export default Collections
