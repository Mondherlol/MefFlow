import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import Loader from './Loader'


export default function ProtectedRoute({ children, roles = [], redirectTo = '/login' }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!user) {
    // not logged in
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // logged in but not allowed
    return <Navigate to="/" replace />
  }

  return children
}