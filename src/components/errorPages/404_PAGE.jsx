import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function ERROR_404_PAGE() {
  const navigate = useNavigate()
  const location = useLocation()
  const message = location.error?.response?.data
  return (
    <div className='text-center errorPage'>
      <h4>OOPS! 404</h4>
      {message ? <h3>{message}</h3> : null}
      <button onClick={() => navigate('/')} mat-button>
        Return to Dashboard
      </button>
    </div>
  )
}

export default ERROR_404_PAGE
