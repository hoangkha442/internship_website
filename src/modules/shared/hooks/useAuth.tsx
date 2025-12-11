import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  loginThunk,
  fetchCurrentUser,
  logout as logoutAction,
} from '../../../store/authSlice'
import type { LoginPayload } from '../types/auth'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch()
  const { user, status, error, accessToken } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (accessToken && !user?.full_name) {
      dispatch(fetchCurrentUser())
    }
  }, [accessToken, user?.full_name, dispatch])

  useEffect(() => {
    if (!accessToken || !user?.role) return

    const path = location.pathname

    // Chỉ auto-redirect nếu đang ở các đường dẫn "gốc"
    const isRootPath =
      path === '/' ||
      path === '' ||
      path === '/auth' ||
      path === '/auth/login'

    if (!isRootPath) return

    if (user.role === 'admin') navigate('/admin', { replace: true })
    if (user.role === 'lecturer') navigate('/lecturer', { replace: true })
    if (user.role === 'student') navigate('/student', { replace: true })
  }, [accessToken, user?.role, location.pathname, navigate])

  // ---------------- LOGIN ----------------
  const login = async (payload: LoginPayload) => {
    await dispatch(loginThunk(payload)).unwrap()
    await dispatch(fetchCurrentUser()).unwrap()
    // Không navigate ở đây nữa, để useEffect phía trên xử lý
    // hoặc nếu muốn navigate ngay sau login thì có thể return user.role rồi điều hướng ở LoginForm
  }

  // ---------------- LOGOUT ----------------
  const logout = () => {
    dispatch(logoutAction())
    // có thể điều hướng luôn ra trang login nếu muốn:
    // navigate('/auth/login', { replace: true })
  }

  // ---------------- ME (fetch lại user) ----------------
  const me = async () => {
    if (!accessToken) return null
    return await dispatch(fetchCurrentUser()).unwrap()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        login,
        logout,
        me,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
