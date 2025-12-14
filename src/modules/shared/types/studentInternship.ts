export interface StudentInternship {
  id: string
  status: 'registered' | 'in_progress' | 'completed' | 'canceled'
  start_date: string | null
  end_date: string | null
  created_at: string

  internship_terms?: {
    id: string
    term_name: string
    start_date: string
    end_date: string
  }

  internship_topics?: {
    id: string
    title: string
    description: string | null
    company_name: string | null
    company_address: string | null
  }

  lecturers?: {
    id: string
    lecturer_code: string
    department: string | null
    phone: string | null
    users?: {
      full_name?: string
      email?: string
    }
  }
}

export interface MyInternshipResponse extends StudentInternship {}

export interface MyTopicRegistration {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  registered_at: string
  topic_id: string
  student_id: string

  internship_topics?: {
    id: string
    title: string
    description: string | null
    company_name: string | null
    company_address: string | null
    lecturers?: {
      id: string
      lecturer_code: string
      department: string | null
      phone: string | null
    }
  }
}

export interface MyTopicRegistrationResponse {
  registration: MyTopicRegistration | null
}
