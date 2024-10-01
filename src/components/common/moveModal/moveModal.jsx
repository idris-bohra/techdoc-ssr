import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { FiUsers } from 'react-icons/fi'
import generalApiService from '../../../services/generalApiService'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { deleteCollectionRequest } from '../../collections/redux/collectionsActions'
import './moveModal.scss'
import { deleteAllPagesAndTabsAndReactQueryData, operationsAfterDeletion } from '../utility'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'

const MoveModal = (props) => {
  const { orgs, currentOrgType  } = useSelector((state) => {
    return { 
      orgs: state.organizations.orgList,
      currentOrgType: state.organizations.currentOrg.meta?.type
     }
  })
  let orgsList = orgs.filter((org) => (org.meta?.type == currentOrgType))
  const dispatch = useDispatch()

  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [loader, setLoader] = useState(false)

  const handleSelectOrg = (orgId) => {
    setSelectedOrganization(orgId)
  }

  async function handleMoveCollection() {
    setLoader(true)
    generalApiService
      .moveCollectionsAndPages(selectedOrganization, props.moveCollection)
      .then((response) => {
        const rootParentPageId = props.moveCollection.rootParentId
        deleteAllPagesAndTabsAndReactQueryData(rootParentPageId, response.data.id).then((data) => {
          dispatch(deleteCollectionRequest(response.data))
          dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES, data: data?.pages })
          dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_TABS, data: data.tabs })
          operationsAfterDeletion(data)
        })
        setLoader(false)
        toast.success('Collection Moved Succesfully')
        props.onHide()
      })
      .catch((error) => {
        setLoader(false)
        toast.error("Couldn't Move Collection")
        console.error(error)
      })
  }

  return (
    <Modal animation={false} aria-labelledby='contained-modal-title-vcenter' centered onHide={props.onHide} show={props.show}>
      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>Move Collection to Organization</Modal.Title>
      </Modal.Header>

      <Modal.Body id='custom-delete-modal-body'>
        <div className='d-flex flex-column align-items-center'>
          {orgsList.map((org, index) => (
            <div
              className={`organization-box w-100 m-1 p-2 cursor-pointer d-flex justify-content-start align-items-center ${
                selectedOrganization === org.id && 'selectedOrg'
              } ${props?.moveCollection?.orgId == org.id && 'disabled-org'}`}
              key={index}
              onClick={() => handleSelectOrg(org.id)}
            >
              <FiUsers size={14} />
              <span className='ml-2'>{org.name}</span>
            </div>
          ))}
        </div>
        <div className='text-right mt-3'>
          <Button className='btn btn-primary fs-sm mr-1' onClick={handleMoveCollection}>
            {loader ? (
              <div class='spinner-border spinner-border-sm' role='status'>
                <span class='sr-only'>Loading...</span>
              </div>
            ) : (
              'Move'
            )}
          </Button>
          <Button className='btn btn-secondary outline fs-sm' onClick={props.onHide}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default MoveModal
