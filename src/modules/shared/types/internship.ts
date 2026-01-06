// export interface InternshipTopic {
//   id: string
//   title: string
//   description: string | null
//   company_name: string | null
//   company_address: string | null
//   created_by_lecturer_id: string
//   created_at: string

import type { UserRole } from "../../../services/authApi";

//   max_students: number
//   current_students: number
//   status: 'available' | 'full' | 'closed'

//   lecturers?: {
//     id: string
//     user_id: string
//     lecturer_code: string
//     department: string
//     phone: string
//     created_at: string
//   }
// }

// export type InternshipTerm = {
//   id: number | string
//   term_name: string
//   start_date: string 
//   end_date: string
//   total_weeks: number
//   min_attendance_days_per_week: number
//   min_reports: number
//   created_at?: string
// }

// export type InternshipListMeta = {
//   total: number
//   page: number
//   limit: number
// }

// export type InternshipListResponse = {
//   items: InternshipTerm[]
//   meta: InternshipListMeta
// }

// export type GetInternshipParams = {
//   page?: number
//   limit?: number
// }

// export type CreateTermPayload = {
//   term_name: string
//   start_date: string
//   end_date: string
//   // total_weeks: number
//   // min_attendance_days_per_week: number
//   // min_reports: number
// }

// export interface InternshipTermWithStats extends InternshipTerm {
//   students_count?: number;
//   lecturers_count?: number;
//   topics_count?: number;
// }

// export interface InternshipTermListResponse {
//   items: InternshipTermWithStats[];
//   meta: {
//     page: number;
//     limit: number;
//     total: number;
//   };
// }

// export interface RegisterInternshipPayload {
//   term_id: string;     
//   topic_id: string;     
//   lecturer_id: string;  
//   start_date: string;   
//   end_date: string;     
// }


// export interface RegisterInternshipResponse {
//   message: string;
//   internship: any;
// }

// export type InternshipTopicListResponse = {
//   items: InternshipTopic[]
//   meta: InternshipListMeta
// }

// export type CreateTopicPayload = {
//   title: string
//   description?: string | null
//   company_name?: string | null
//   company_address?: string | null
// }


export interface InternshipTopic {
  id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  company_address: string | null;
  created_by_lecturer_id: string;
  created_at: string;

  max_students: number;
  current_students: number;
  status: "available" | "full" | "closed";

  lecturers?: {
    id: string;
    user_id: string;
    lecturer_code: string;
    department: string;
    phone: string;
    created_at: string;
  };
}

export type InternshipTerm = {
  id: number | string;
  term_name: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
  min_attendance_days_per_week: number;
  min_reports: number;
  created_at?: string;
};

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // backend có trả nhưng FE thường không dùng
  password_hash?: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_code: string;
  class_id: string | null;
  phone: string | null;
  created_at: string;

  users?: User | null;
  classes?: {
    id?: string;
    class_name?: string | null;
    name?: string | null;
  } | null;
}

export interface Lecturer {
  id: string;
  user_id: string;
  lecturer_code: string;
  department: string;
  phone: string | null;
  created_at: string;

  users?: User | null;
}


export type InternshipListMeta = {
  total: number;
  page: number;
  limit: number;
};

export type InternshipListResponse = {
  items: InternshipTerm[];
  meta: InternshipListMeta;
};

export type GetInternshipParams = {
  page?: number;
  limit?: number;
};

export type CreateTermPayload = {
  term_name: string;
  start_date: string;
  end_date: string;
};

export interface InternshipTermWithStats extends InternshipTerm {
  students_count?: number;
  lecturers_count?: number;
  topics_count?: number;
}

export interface InternshipTermListResponse {
  data: InternshipTermWithStats[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
export interface InternshipTermListResponse2 {
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
  items: InternshipTopic[];
  meta: InternshipListMeta;
};

export type CreateTopicPayload = {
  title: string;
  description?: string | null;
  company_name?: string | null;
  company_address?: string | null;
};


export interface InternshipWithRelations {
  id: string;

  student_id: string;
  lecturer_id: string;
  term_id: string;
  topic_id: string;

  status: "registered" | "in_progress" | "completed" | "canceled";
  start_date: string | null;
  end_date: string | null;

  // backend đang trả string "0"
  progress_percent: string;

  created_at: string;
  updated_at: string;

  // relations (đúng theo JSON bạn show)
  students?: Student | null;
  lecturers?: Lecturer | null;
  internship_terms?: InternshipTerm | null;
  internship_topics?: InternshipTopic | null;
}