import type { UserProfile } from "../modules/shared/types/user"
import { api } from "./config"

export const userApi = {
  async me(): Promise<UserProfile> {
    const res = await api.get<UserProfile>('/user/me')
    return res.data
  },
}
