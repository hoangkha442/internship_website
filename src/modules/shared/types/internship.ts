export interface InternshipTopic {
  id: string
  title: string
  description: string | null
  company_name: string | null
  company_address: string | null
  created_by_lecturer_id: string
  created_at: string

  max_students: number
  current_students: number
  status: 'available' | 'full' | 'closed'

  lecturers?: {
    id: string
    user_id: string
    lecturer_code: string
    department: string
    phone: string
    created_at: string
  }
}

export type InternshipTerm = {
  id: number | string
  term_name: string
  start_date: string 
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

export interface RegisterInternshipPayload {
  term_id: string;     
  topic_id: string;     
  lecturer_id: string;  
  start_date: string;   
  end_date: string;     
}


export interface RegisterInternshipResponse {
  message: string;
  internship: any;
}

export type InternshipTopicListResponse = {
  items: InternshipTopic[]
  meta: InternshipListMeta
}

export type CreateTopicPayload = {
  title: string
  description?: string | null
  company_name?: string | null
  company_address?: string | null
}

