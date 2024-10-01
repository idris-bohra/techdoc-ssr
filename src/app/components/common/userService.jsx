import React from 'react'
import moment from 'moment'
import { isOnPublishedPage, SESSION_STORAGE_KEY } from './utility'
import { useSelector } from 'react-redux'

const DisplayUserAndModifiedData = () => {
  let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)

  const { usersList, pages } = useSelector((state) => {
    return {
      users: state.users.usersList,
      pages: state.pages,
    }
  })

  const updatedById = pages?.[currentIdToShow]?.updatedBy
  const lastModified = pages?.[currentIdToShow]?.updatedAt ? moment(pages[currentIdToShow].updatedAt).fromNow() : null
  const user = usersList?.find((user) => user.id === updatedById)

  if (isOnPublishedPage()) return (lastModified && <span>Modified {lastModified}</span>)

  return (
    <div className='page-user-data'>
      {lastModified && (
        <div>
          <span>Updated by  {user?.name || 'Unknown'}</span>
          <br />
          <span>Modified {lastModified}</span>
        </div>
      )}
    </div>
  )
}

export default DisplayUserAndModifiedData
