import React, { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

function ProtectedRoute() {
  const location = useLocation()
  const { loading, isAuthenticated } = useContext(AuthContext)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute


