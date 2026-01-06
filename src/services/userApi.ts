import type { UserProfile } from "../modules/shared/types/user";
import { api } from "./config";

export type UpdateMePayload = {
  full_name?: string;
  phone?: string;
  department?: string;
  class_id?: string;
};

export type UpdatePasswordPayload = {
  old_password: string;
  new_password: string;
};

export const userApi = {
  async me(): Promise<UserProfile> {
    const res = await api.get<UserProfile>("/user/me");
    return res.data;
  },

  async updateMe(payload: UpdateMePayload) {
    const res = await api.patch("/user/me", payload);
    return res.data;
  },

  async updatePassword(payload: UpdatePasswordPayload) {
    const res = await api.patch("/user/me/password", payload);
    return res.data;
  },

  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append("file", file);

    const res = await api.post("/user/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async removeAvatar() {
    const res = await api.delete("/user/me/avatar");
    return res.data;
  },
};
