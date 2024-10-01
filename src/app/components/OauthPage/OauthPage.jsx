import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function OauthPage() {
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const code = queryParams.get('code') || ''
  const state = queryParams.get('state') || ''

  const fragment = location.hash.substring(1)

  const fragmentParams = fragment.split('&').reduce((params, param) => {
    const [key, value] = param.split('=')
    params[key] = value
    return params
  }, {})

  useEffect(() => {
    if (fragmentParams.access_token) {
      window.opener.postMessage({ techdocAuthenticationDetails: { implicitDetails: fragmentParams } }, window.location.origin)
    } else if (code) {
      window.opener.postMessage({ techdocAuthenticationDetails: { code, state } }, window.location.origin)
    }

    const closeWindowTimeout = setTimeout(() => {
      window.close()
    })

    return () => clearTimeout(closeWindowTimeout)
  }, [])

  return (
    <div className='d-flex justify-content-center align-items-center h-100'>
      <div className='spinner-border' role='status'>
        <span className='sr-only'>Loading...</span>
      </div>
    </div>
  )
}
