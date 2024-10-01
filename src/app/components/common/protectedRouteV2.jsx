import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser, getCurrentOrg, getOrgList, getProxyToken } from '../auth/authServiceV2'

const ProtectedRouteV2 = ({ path, component: Component, render, ...rest }) => {
  const location = useLocation()
  const match = location.pathname.split('/')
  const isOrgInPath = match.includes('orgs') ? true : false
  const currentUser = getCurrentUser()
  const currentOrg = getCurrentOrg()
  const orgList = getOrgList()
  const proxyToken = getProxyToken()

  if (!proxyToken) {
    return <Navigate to={`/logout?redirect_uri=${location.pathname}`} />
  }

  if (currentUser && orgList && currentOrg) {
    const currentOrgId = currentOrg.id
    if (currentOrgId && isOrgInPath && match[2] !== currentOrgId.toString()) {
      const newUrl = location.pathname.replace(/\/orgs\/[^\/]+/, `/orgs/${currentOrgId}`)
      return <Navigate to={newUrl} />
    }
    return <Outlet />
  }

  return <Navigate to={`/login?redirect_uri=${location.pathname}`} />
}

export default ProtectedRouteV2
