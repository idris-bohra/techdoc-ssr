import React, { useState, forwardRef } from 'react'
import { Button, Dropdown, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import Avatar from 'react-avatar'
import { useSelector, useDispatch } from 'react-redux'
import { getCurrentOrg, getCurrentUser } from '../auth/authServiceV2'
import { switchOrg, fetchOrganizations, leaveOrganization } from '../../services/orgApiService'
import { toast } from 'react-toastify'
import { closeAllTabs } from '../tabs/redux/tabsActions'
import { onHistoryRemoved } from '../history/redux/historyAction'
import { IoIosArrowDown } from 'react-icons/io'
import CollectionForm from '../collections/collectionForm'
import { FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import ImportCollectionModal from '../collections/importCollection/importColectionModel'
import CustomModal from '../customModal/customModal'
import { isOrgDocType } from '../common/utility'
import { FaCheck } from "react-icons/fa6";
import { IoExit } from 'react-icons/io5'
import './userProfile.scss'

const UserProfile = () => {
  const historySnapshot = useSelector((state) => state.history)
  const tabs = useSelector((state) => state.tabs)
  const organizationList = useSelector((state) => state.organizations.orgList)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [modalForTabs, setModalForTabs] = useState(false)
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [currentOrg, setCurrentOrg] = useState('')

  const removeFromLocalStorage = (tabIds) => {
    tabIds.forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  const toggleModal = async () => {
    setShowModal(!showModal)
    if (!showModal) await fetchOrganizations()
  }

  const getUserDetails = () => {
    return { email: getCurrentUser().email || '', name: getCurrentUser().name }
  }

  const handleAddNewClick = () => {
    setShowNewCollectionModal((prev) => !prev)
  }

  const handleImportClick = () => {
    setShowImportModal((prev) => !prev)
  }

  const renderAvatarWithOrg = (onClick, ref1) => {
    const firstLetterCapital = getCurrentOrg()?.name?.[0].toUpperCase();
    return (
      <div className='menu-trigger-box d-flex align-items-center justify-content-between w-100 rounded gap-1 px-1 py-1'>
        <div
          ref={ref1}
          className='org-button pl-1 d-flex position-relative align-items-center cursor-pointer flex-grow-1 gap-1'
          onClick={(e) => {
            e.preventDefault()
            onClick(e)
          }}
        >
          <div className="mr-2 avatar-org px-2 rounded" size={15}>{firstLetterCapital}</div>
          <div className='org-name text-secondary'>{getCurrentOrg()?.name || null}</div>
          <IoIosArrowDown size={16} className='text-secondary' />
        </div>
        <div className='add-button d-flex align-items-center'>
          {isOrgDocType() && <button className='border-0 btn btn-light px-1 text-secondary shadow' onClick={handleImportClick}>
            Import
          </button>}
          <ImportCollectionModal
            show={showImportModal}
            onClose={() => {
              handleImportClick()
            }}
          />
          <CustomModal size='sm' modalShow={showNewCollectionModal} hideModal={handleAddNewClick}>
            <CollectionForm title='Add new Collection' onHide={handleAddNewClick} />
          </CustomModal>
        </div>
      </div>
    )
  }

  const handleCreateOrganizationClick = () => navigate('/onBoarding')

  const renderUserDetails = () => {
    const { email } = getUserDetails()
    return (
      <div className='profile-details border-bottom plr-3 pb-1 d-flex align-items-center justify-content-between py-1'>
        <div className='d-flex align-items-center'>
          <div className='user-icon mr-2'>
            <FiUser size={12} />
          </div>
          <div className='profile-details-user-name'>
            <span className='profile-details-label-light font-12'>{email}</span>
          </div>
        </div>
      </div>
    )
  }

  const openAccountAndSettings = () => {
    const orgId = getCurrentOrg()?.id
    navigate(`/orgs/${orgId}/invite`)
  }

  const renderInviteTeam = () => {
    return (
      <div className='invite-user cursor-pointer mt-1' onClick={openAccountAndSettings}>
        <span className='members'>Members</span>
      </div>
    )
  }

  const renderAddWorkspace = () => {
    return (
      <div className='invite-user cursor-pointer mb-2' onClick={handleCreateOrganizationClick}>
        <span className='members'>Add Workspace</span>
      </div>
    )
  }

  const handleOrgClick = (org, selectedOrg) => {
    toggleModal()
    const tabIdsToClose = tabs.tabsOrder
    setCurrentOrg(org)
    if (org.id === selectedOrg.id) {
      setModalForTabs(false)
      toast.error('This organization is already selected')
    } else if (org.id !== selectedOrg.id && (tabIdsToClose.length === 1 || tabIdsToClose.length === 0)) {
      setModalForTabs(false)
      switchOrg(org.id, true)
      removeFromLocalStorage(tabIdsToClose)
      dispatch(closeAllTabs(tabIdsToClose))
      dispatch(onHistoryRemoved(historySnapshot))
    } else {
      setModalForTabs(true)
    }
  }

  const showTooltips = () => {
    return <Tooltip className="font-12 text-secondary"><span >Leave</span></Tooltip>
  }

  const renderOrgListDropdown = () => {
    const organizations = organizationList || []
    const selectedOrg = getCurrentOrg()
    return (
      <div className='org-listing-container'>
        <div className='org-listing-column d-flex flex-column gap-1 w-100'>
          {organizations.map((org, key) => (
            <div key={key} className='d-flex name-list cursor-pointer'>
              <div className='org-collection-name d-flex'>
                <Avatar className='mr-2 avatar-org' name={org.name} size={32} />
                <span
                  className={`org-listing-button mr-1 ${org.id === selectedOrg?.id ? 'selected-org' : ''}`}
                  onClick={() => handleOrgClick(org, selectedOrg)}
                >
                  {org.name}
                </span>
              </div>
              {org?.id !== selectedOrg?.id && (
                <OverlayTrigger placement="bottom" overlay={showTooltips()} >
                  <span className='leave-icon' onClick={() => leaveOrganization(org.id)}><IoExit size={20} /></span>
                </OverlayTrigger>
              )}
              {org.id === selectedOrg?.id && <span className='check' ><FaCheck /></span>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleTrashClick = () => {
    const currentOrgId = getCurrentOrg().id
    navigate(`/orgs/${currentOrgId}/trash`)
  }

  const renderTrash = () => {
    return (
      <div className='profile-details cursor-pointer' onClick={handleTrashClick}>
        <span className='trash mr-2'>Trash</span>
      </div>
    )
  }

  const handleLogout = () => {
    navigate('/logout')
  }

  const renderLogout = () => {
    return (
      <div className='profile-details cursor-pointer' onClick={() => handleLogout()}>
        <span className='logout mr-2'> Logout</span>
      </div>
    )
  }

  const renderAddCollection = () => {
    return (
      <div className='collection cursor-pointer' onClick={handleAddNewClick}>
        <span className='add-collection mr-2'>Add collection</span>
      </div>
    )
  }

  const handleClose = () => {
    setModalForTabs(false)
    setShowModal(false)
  }

  const handleTabsandHistory = async (value) => {
    const tabIdsToClose = tabs.tabsOrder
    const history = historySnapshot

    if (value === 'yes') {
      dispatch(closeAllTabs(tabIdsToClose))
      removeFromLocalStorage(tabIdsToClose)
      dispatch(onHistoryRemoved(history))
      switchOrg(currentOrg.id, true)
    } else if (value === 'no') {
      setModalForTabs(false)
      setShowModal(false)
    }
  }

  const showModalForTabs = () => {
    if (!modalForTabs) {
      return null
    }
    return (
      <Modal show={modalForTabs} onHide={handleClose} className='mt-4'>
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>Save Tabs!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontWeight: '500' }}>If you switch organization all the tabs and history will be deleted!</Modal.Body>
        <Modal.Footer>
          <Button className='btn btn-danger btn-lg mr-2' onClick={() => handleTabsandHistory('yes')}>
            Yes
          </Button>
          <Button className='btn btn-secondary outline btn-lg' variant='secondary' onClick={() => handleTabsandHistory('no')}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <>
      <div className='profile-menu pt-1 px-2'>
        <Dropdown className='d-flex align-items-center'>
          <Dropdown.Toggle
            as={forwardRef(({ onClick }, ref) => {
              const handleClick = async (e) => {
                await fetchOrganizations();
                onClick(e);
              };
              return renderAvatarWithOrg(handleClick, ref);
            })}
            id='dropdown-custom-components'
          />
          <Dropdown.Menu className='p-0'>
            {renderUserDetails()}
            <div className='profile-listing-container'>
              <div className='py-6 border-bottom'>
                <div className='pt-2 pb-2'>{renderOrgListDropdown()}</div>
              </div>
              <div className=' py-2'>
                <div>{renderAddWorkspace()}</div>
                <hr className='p-0 m-0' />
                <div>{renderInviteTeam()}</div>
                <div>{renderTrash()}</div>
                <div>{renderAddCollection()}</div>
                <div>{renderLogout()}</div>
              </div>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {modalForTabs ? showModalForTabs() : ''}
    </>
  )
}

export default UserProfile
