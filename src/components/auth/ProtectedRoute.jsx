import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingSpinner fullscreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading, profile } = useAuth()
  if (loading) return <LoadingSpinner fullscreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  // profil hali yuklanayotgan bo'lishi mumkin — profile mavjud bo'lguncha kutamiz
  if (!profile) return <LoadingSpinner fullscreen />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
