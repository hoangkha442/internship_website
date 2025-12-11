import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuthResponse, LoginPayload } from '../modules/shared/types/auth'
import type { UserProfile } from '../modules/shared/types/user'
import { authApi } from '../services/authApi'
import { userApi } from '../services/userApi'

type AuthState = {
  user: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const storedUser = localStorage.getItem('auth_user')

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  status: 'idle',
  error: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res: AuthResponse = await authApi.login(payload)

      localStorage.setItem('access_token', res.access_token)
      localStorage.setItem('refresh_token', res.refresh_token)

      return res
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin'
      return rejectWithValue(msg)
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await userApi.me()
      localStorage.setItem('auth_user', JSON.stringify(profile))
      return profile
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Không lấy được thông tin người dùng'
      return rejectWithValue(msg)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.status = 'idle'
      state.error = null

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
