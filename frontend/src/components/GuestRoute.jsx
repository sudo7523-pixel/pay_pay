import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants'
import { PageLoader } from './Loader/Loader'

export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />

  return <Outlet />
}
