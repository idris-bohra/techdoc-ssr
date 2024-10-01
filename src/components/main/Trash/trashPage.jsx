import React, { useEffect, useState } from 'react'
import { Container, Table, Button, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BiArrowBack } from 'react-icons/bi'
import { MdSettingsBackupRestore } from 'react-icons/md'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { toast } from 'react-toastify'
import trashImage from '../../../assets/icons/trash.webp'
import { getCurrentOrg } from '../../auth/authServiceV2'
import { getAllDeletedCollections, restoreCollection } from '../../collections/collectionsApiService'
import './trash.scss'

const TrashPage = () => {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editableRow, setEditableRow] = useState({ id: null, name: '' })
  const navigate = useNavigate()
  const orgId = getCurrentOrg()?.id
  const users = useSelector((state) => state.users.usersList)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await getAllDeletedCollections(orgId)
        setCollections(response?.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [orgId])

  const handleBack = () => {
    navigate(`/orgs/${orgId}/dashboard`)
  }

  const handleRestore = async (collectionId, collectionName) => {
    try {
      const data = { name: collectionName }
      const response = await restoreCollection(orgId, data, collectionId)
      if (response.status === 200) {
        setCollections((prevCollections) => prevCollections.filter((c) => c.id !== collectionId))
        toast.success('Collection restored successfully')
      }
    } catch (error) {
      if (error?.response?.data === 'Collection Name Must be Unique') setEditableRow({ id: collectionId, name: collectionName })
      toast.error(error?.response?.data)
    }
  }

  const handleChangeName = (event) => {
    setEditableRow((prev) => ({ ...prev, name: event.target.value }))
  }

  const handleSaveEdit = async (collectionId) => {
    try {
      const data = { name: editableRow.name }
      const response = await restoreCollection(orgId, data, collectionId)
      if (response.status === 200) {
        setCollections((prevCollections) => prevCollections.filter((c) => c.id !== collectionId))
        toast.success('Collection restored successfully')
        setEditableRow({ id: null, name: '' })
      } else {
        throw new Error('Restoration with new name failed')
      }
    } catch (error) {
      Alert('Failed')
      toast.error('Failed to restore collection with new name')
    }
  }

  const findUserNameById = (id) => {
    const user = users.find((user) => user.id === id)
    return user ? user.name : 'Unknown'
  }

  if (isLoading) {
    return (
      <div className='custom-loading-container'>
        <div className='loading-content'>
          <button className='spinner-border' />
          <p className='mt-3'>Loading</p>
        </div>
      </div>
    )
  }

  return (
    <Container>
      <div className='back-to-workspace mb-4 d-flex align-items-center' onClick={handleBack} style={{ cursor: 'pointer' }}>
        <BiArrowBack className='mr-2' />
        <span>Back to workspace</span>
      </div>
      <h3>Trash</h3>
      {collections?.length > 0 ? (
        <>
          <p>Collections you delete will show up here. You can restore them.</p>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Deleted</th>
                <th>Deleted By</th>
                <th>Restore</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.id}>
                  <td>
                    {editableRow.id === collection.id ? (
                      <Form.Control type='text' value={editableRow.name} onChange={handleChangeName} />
                    ) : (
                      collection.name
                    )}
                  </td>
                  <td>{moment(collection?.deletedAt).fromNow()}</td>
                  <td>{findUserNameById(collection?.updatedBy)}</td>
                  <td className='restore-action'>
                    {editableRow.id === collection.id ? (
                      <Button onClick={() => handleSaveEdit(collection.id)}>Save</Button>
                    ) : (
                      <MdSettingsBackupRestore className='react-icon' onClick={() => handleRestore(collection.id, collection.name)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <div className='text-center mt-5'>
          <img src={trashImage} alt='Trash' width={180} className='mb-2' />
          <p>Your trash is empty.</p>
        </div>
      )}
    </Container>
  )
}

export default TrashPage
