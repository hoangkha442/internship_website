import { api } from "./config";

export type DashboardRange = "7d" | "14d" | "30d";

export type StudentDashboardParams = {
  range?: DashboardRange;
  from?: string; // ISO
  to?: string;   // ISO
  internship_id?: string | number;
};

export type StudentDashboardPayload = {
  window: { from: string; to: string };

  internship: null | {
    id: string;
    status: string | null;
    progress_percent: number;

    term: null | {
      id: string;
      term_name: string;
      start_date: string | null;
      end_date: string | null;
      total_weeks: number | null;
    };

    topic: null | {
      id: string;
      title: string;
      description: string | null;
      company_name: string | null;
      company_address: string | null;
    };

    lecturer: null | {
      id: string;
      lecturer_code: string | null;
      department: string | null;
      phone: string | null;
    };
  };

  summary: {
    reports_total: number;
    reports_submitted: number;
    reports_needs_revision: number;
    reports_reviewed: number;
    reports_pending_review: number;

    attendance_total: number;
    attendance_pending_approval: number;
    attendance_approved: number;

    worklogs_total: number;
    worklogs_pending_review: number;
    worklogs_reviewed: number;

    progress_percent: number;
  };

  reportTrends: Array<{ day: string; submitted: number; reviewed: number; needs_revision: number }>;
  attendanceTrends: Array<{ day: string; pending: number; approved: number; total: number }>;
  worklogTrends: Array<{ day: string; total: number; pending: number; reviewed: number }>;
};

export const getStudentDashboard = async (params: StudentDashboardParams = {}) => {
  const res = await api.get("/student-dashboard", { params });
  return res.data as StudentDashboardPayload;   
};
