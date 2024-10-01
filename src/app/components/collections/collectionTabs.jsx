import React from 'react';
import PublishDocForm from '../publishDocs/publishDocsForm';
import CollectionRuns from './showRuns/collectionRuns';
import PublishDocsReview from '../publishDocs/publishDocsReview';
import { useNavigate } from 'react-router-dom'
import { getOrgId, isOrgDocType } from '../common/utility'
import { useDispatch, useSelector } from 'react-redux'
import { setPageType } from '../tabs/redux/tabsActions'
import { getCurrentOrg } from '../auth/authServiceV2';


const CollectionTabs = ({ collectionId, onHide }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const orgType = getCurrentOrg()?.meta?.type 
  const metaType = getCurrentOrg()?.meta
  const { activeTabId, pageType } = useSelector((state) => {
    const activeTabId = state?.tabs?.activeTabId
    return {
      activeTabId,
      pageType: state.tabs.tabs?.[activeTabId]?.state?.pageType
    }
  })

  const renderTabContent = () => {
    switch (pageType) {
      case 'SETTINGS':
        return <PublishDocForm selected_collection_id={collectionId} show onHide={onHide} />
      case 'FEEDBACK':
        return <PublishDocsReview selected_collection_id={collectionId} />
      case 'RUNS':
        return <CollectionRuns collection_id={collectionId} />
      default:
        return null
    }
  }

  const handleTabChange = (newPageType) => {
    dispatch(setPageType(activeTabId, newPageType))
  }

  return (
    <div className='custom-tabs w-100'>
      <ul className='nav nav-tabs border-0 border-bottom w-100 rounded-0 mb-2'>
        <li className='nav-item cursor-pointer'>
          <a
            className={`nav-link bg-none ${pageType === 'SETTINGS' ? 'active text-black' : 'text-secondary'}`}
            onClick={() => {
              navigate(`/orgs/${getOrgId()}/dashboard/collection/${collectionId}/settings`)
              handleTabChange('SETTINGS')
            }}
          >
            Settings
          </a>
        </li>
        <li className='nav-item cursor-pointer'>
          <a
            className={`nav-link bg-none ${pageType === 'FEEDBACK' ? 'active text-black' : 'text-secondary'}`}
            onClick={() => {
              navigate(`/orgs/${getOrgId()}/dashboard/collection/${collectionId}/feedback`)
              handleTabChange('FEEDBACK')
            }}
          >
            Feedback
          </a>
        </li>
        {
          (orgType === 1 || metaType === null) && (
            <li className='nav-item cursor-pointer'>
              <a
                className={`nav-link bg-none ${pageType === 'RUNS' ? 'active text-black' : 'text-secondary'}`}
                onClick={() => {
                  navigate(`/orgs/${getOrgId()}/dashboard/collection/${collectionId}/runs`)
                  handleTabChange('RUNS')
                }}
              >
                Runs
              </a>
            </li>
          )
        }
      </ul>
      <div className='tab-content'>{renderTabContent()}</div>
    </div>
  )
}

export default CollectionTabs
