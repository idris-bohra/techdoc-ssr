import React, { useEffect, useState } from 'react'
import './onlineStatus.scss'

export default function OnlineSatus() {
  const [online, isOnline] = useState(navigator.onLine)
  const [needToUpdate, changeStatus] = useState(false)
  const [showStatus, changeShowStatus] = useState(false)

  const setOnline = async () => {
    isOnline(true)
  }
  const setOffline = () => {
    changeShowStatus(true)
    changeStatus(false)
    isOnline(false)
  }

  const fetchDataFromBackend = () => {
    changeShowStatus(false)
    changeStatus(false)
  }

  useEffect(() => {
    window.addEventListener('offline', setOffline)
    window.addEventListener('online', setOnline)

    return () => {
      window.removeEventListener('offline', setOffline)
      window.removeEventListener('online', setOnline)
    }
  }, [])

  return (
    <div className={['online-status', showStatus ? 'show' : 'hide'].join(' ')}>
      <div>
        <span className={`online-status-${online}`}>{online ? 'You are online now.' : 'You are offline.'}</span>
        <br />
        {needToUpdate && (
          <small className='text-muted'>
            {' '}
            While you were gone, there was change in the databse. <br />
            please sync to see changes.
          </small>
        )}
      </div>
      {needToUpdate && (
        <button className='btn btn-primary' onClick={() => fetchDataFromBackend()}>
          sync now
        </button>
      )}
    </div>
  )
}
