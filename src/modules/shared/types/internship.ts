export type InternshipTerm = {
  id: number | string
  term_name: string
  start_date: string // ISO string
  end_date: string
  total_weeks: number
  min_attendance_days_per_week: number
  min_reports: number
  created_at?: string
}

export type InternshipListMeta = {
  total: number
  page: number
  limit: number
}

export type InternshipListResponse = {
  items: InternshipTerm[]
  meta: InternshipListMeta
}

export type GetInternshipParams = {
  page?: number
  limit?: number
}

export type CreateTermPayload = {
  term_name: string
  start_date: string
  end_date: string
  // total_weeks: number
  // min_attendance_days_per_week: number
  // min_reports: number
}

export interface InternshipTermWithStats extends InternshipTerm {
  students_count?: number;
  lecturers_count?: number;
  topics_count?: number;
}

export interface InternshipTermListResponse {
  items: InternshipTermWithStats[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

