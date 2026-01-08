import { api } from "./config";

export type LecturerAttendanceListQuery = {
  date?: string;
  from?: string; 
  to?: string; 
  page?: number;
  limit?: number;
};

export type LecturerAttendancePendingQuery = {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export const attendanceLecturerApi = {
  list: async (params: LecturerAttendanceListQuery) =>
    (await api.get("/attendance/lecturer/list", { params })).data,

  pending: async (params: LecturerAttendancePendingQuery) =>
    (await api.get("/attendance/lecturer/pending-requests", { params })).data,

  approve: async (id: string, body?: { note?: string }) =>
    (await api.patch(`/attendance/lecturer/${id}/approve`, body || {})).data,

  reject: async (id: string, body: { rejection_reason: string; note?: string }) =>
    (await api.patch(`/attendance/lecturer/${id}/reject`, body)).data,
};
