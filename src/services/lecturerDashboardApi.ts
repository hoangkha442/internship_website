import { api } from "./config";

export type DashboardRange = "7d" | "14d" | "30d";

export type LecturerDashboardQuery = {
  term_id?: string | number;
  internship_id?: string | number;
  from?: string; // ISO
  to?: string;   // ISO
  range?: DashboardRange;
};

export type LecturerDashboardSummary = {
  internships_total: number;
  students_total: number;

  reports_submitted_pending: number;
  reports_needs_revision: number;
  reports_reviewed: number;

  attendance_pending_approval: number;
  attendance_total: number;

  worklogs_pending_review: number;
  worklogs_reviewed: number;
  worklogs_total: number;
};

export type ReportTrendRow = {
  day: string; // YYYY-MM-DD
  submitted: number;
  reviewed: number;
  needs_revision: number;
};

export type AttendanceTrendRow = {
  day: string; // YYYY-MM-DD
  present: number;
  absent: number;
  late: number;
  excused: number;
  pending_approval: number;
};

export type WorklogTrendRow = {
  day: string; // YYYY-MM-DD
  total: number;
  pending: number;
  reviewed: number;
};

export type LecturerDashboardPayload = {
  summary: LecturerDashboardSummary;
  reportTrends: ReportTrendRow[];
  attendanceTrends: AttendanceTrendRow[];
  worklogTrends: WorklogTrendRow[];
};

export const getLecturerDashboard = async (params: LecturerDashboardQuery = {}) => {
  const res = await api.get("/lecturer-dashboard", { params });
  // backend trả { data }
  return res.data?.data as LecturerDashboardPayload;
};
