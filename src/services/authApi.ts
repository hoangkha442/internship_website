import type { AuthResponse, LoginPayload, RefreshResponse } from '../modules/shared/types/auth'
import { api } from './config'

export type UserRole = 'student' | 'lecturer' | 'admin'

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', payload)
    return res.data
  },

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const res = await api.post<RefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return res.data
  },
}
