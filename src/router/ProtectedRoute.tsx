import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../modules/shared/hooks/useAuth'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
