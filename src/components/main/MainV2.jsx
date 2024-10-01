import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SplitPane from '../splitPane/splitPane'

import { fetchAllCookies } from '../cookies/redux/cookiesActions'
import { addCollectionAndPages } from '../redux/generalActions'
import { addUserData } from '../auth/redux/usersRedux/userAction'

import ContentPanel from './contentPanel'
import SideBarV2 from './sideBarV2'
import OnlineStatus from '../onlineStatus/onlineStatus'
import DesktopAppDownloadModal from './desktopAppPrompt'
import UpdateStatus from './updateStatus'
import { getCurrentUser, getUserData, getCurrentOrg, getOrgList, getProxyToken } from '../auth/authServiceV2'
import { ReactComponent as NoCollectionIcon } from '../../assets/icons/collection.svg'
import 'react-toastify/dist/ReactToastify.css'
import './main.scss'
import { useNavigate } from 'react-router-dom'
import CollectionForm from '../collections/collectionForm'
import CustomModal from '../customModal/customModal'
import ShortcutModal from '../shortcutModal/shortcutModal'

const MainV2 = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const collections = useSelector((state) => state.collections)

  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddCollectionPage, setShowAddCollectionPage] = useState(true)
  const [showShortcutModal, setShowShortcutModal] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      const token = getProxyToken()
      if (!token) {
        setLoading(false)
        return
      }

      let users = await getUserData(token)
      if (users) dispatch(addUserData(users))

      if (getCurrentUser() && getOrgList() && getCurrentOrg()) {
        let orgId = params.orgId
        if (!orgId) {
          orgId = getOrgList()[0]?.id
          navigate(`/orgs/${orgId}/dashboard`)
        } else {
          await fetchAll()
          dispatch(addCollectionAndPages(orgId))
        }
      } else {
        navigate('/login')
      }
      setLoading(false)
    }
    initialize()
    window.addEventListener('keydown', addShortCutForShortcutModal);

    return () => {
      window.removeEventListener('keydown', addShortCutForShortcutModal);
    }
  }, [])

  const fetchAll = async () => {
    dispatch(fetchAllCookies())
  }

  const setVisitedOrgs = () => {
    const orgId = params.orgId
    const org = {}
    org[orgId] = true
    window.localStorage.setItem('visitedOrgs', JSON.stringify(org))
  }

  const showCollectionDashboard = () => {
    if (!getCurrentUser()) {
      return false
    }
    const collectionLength = Object.keys(collections).length
    const orgId = params.orgId
    const temp = JSON.parse(window.localStorage.getItem('visitedOrgs'))
    return !(temp && temp[orgId]) && collectionLength === 0 && showAddCollectionPage
  }

  const renderLandingDashboard = () => (
    <>
      <div className='no-collection h-100 d-flex flex-d-col justify-content-center align-items-center flex-wrap'>
        <img src={NoCollectionIcon} alt='' />
        <p className='mb-4'>Add your first collection for API testing and Public API Doc</p>
        <button onClick={() => setShowAddCollectionModal(true)} className='btn btn-primary'>
          + Add collection
        </button>
        <p className='mt-3'>Or</p>
        <div
          className='text-link'
          onClick={() => {
            setVisitedOrgs()
            setShowAddCollectionPage(false)
          }}
        >
          Try Out Without a Collection
        </div>
      </div>
    </>
  )

  const addShortCutForShortcutModal = async () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if ((isMac && event.metaKey && event.key === "/") || (!isMac && event.ctrlKey && event.key === "/")) {
      event.preventDefault();
      handleShortcutModal();
    }
  }

  const handleAddNewClick = () => {
    setShowAddCollectionModal(prev => !prev)
  }

  const handleShortcutModal = () => {
    setShowShortcutModal(prev => !prev)
  }

  return (
    <>
      {loading ? (
        <div className='custom-loading-container'>
          <div className='loading-content'>
            <button className='spinner-border' />
            <p className='mt-3'>Loading</p>
          </div>
        </div>
      ) : (
        <div>
          <div className='custom-main-container'>
            <DesktopAppDownloadModal />
            <OnlineStatus />
            <div className='main-panel-wrapper'>
              <SplitPane split='vertical' className='split-sidebar'>
                <SideBarV2 />
                {showCollectionDashboard() ? renderLandingDashboard() : <ContentPanel />}
              </SplitPane>
            </div>
            <UpdateStatus />
          </div>
        </div>
      )}
      <CustomModal size='sm' modalShow={showAddCollectionModal} hideModal={handleAddNewClick}>
        <CollectionForm title='Add new Collection' onHide={handleAddNewClick} />
      </CustomModal>
      <CustomModal size='sm' modalShow={showShortcutModal} onHide={handleShortcutModal}>
        <ShortcutModal hideModal={handleShortcutModal} />
      </CustomModal>
    </>
  )
}

export default MainV2
