import { Navigate } from 'react-router'
import useAuthStore from '../store/useAuthStore'

export default function ProtectedRoute({ children, roles }) {
  const user = useAuthStore((s) => s.user)
  const authChecked = useAuthStore((s) => s.authChecked)

  if (!authChecked) return null

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
