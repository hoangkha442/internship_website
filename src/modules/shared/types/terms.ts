// Dữ liệu thực tập đầy đủ quan hệ: term, topic, student, lecturer...
export interface InternshipWithRelations {
  id: string
  term_id: string
  topic_id: string
  student_id: string
  lecturer_id: string
  status: 'registered' | 'in_progress' | 'completed' | 'canceled'
  start_date: string
  end_date: string
  progress_percent: string
  created_at: string
  updated_at: string

  internship_terms?: {
    id: string
    term_name: string
    start_date: string
    end_date: string
    total_weeks: number
    min_attendance_days_per_week: number
    min_reports: number
    created_at: string
  }

  internship_topics?: {
    id: string
    title: string
    description: string
    company_name: string
    company_address: string
    created_at: string
    created_by_lecturer_id: string
  }

  students?: {
    id: string
    student_code: string
    phone: string
    class_id: string | null
    created_at: string
    user_id: string
  }

  lecturers?: {
    id: string
    lecturer_code: string
    phone: string
    department: string
    created_at: string
    user_id: string
  }
}

export interface InternshipWithRelationsListResponse {
  items: InternshipWithRelations[]
  meta: {
    page: number
    limit: number
    total: number
  }
}
