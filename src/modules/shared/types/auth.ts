import type { UserRole } from "../../../services/authApi"

export type LoginFormValues = {
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  role: UserRole
}

export type AuthResponse = {
  user: AuthUser
  access_token: string
  refresh_token: string
}

export type RefreshResponse = {
  access_token: string
  refresh_token: string
}

