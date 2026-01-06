export type UserRole = "student" | "lecturer" | "admin"

export type UserProfile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at?: string
  updated_at?: string
  avatar_url?: string | null;
  
  lecturers?: {
    id: string
    lecturer_code?: string
    department?: string | null
    phone?: string | null
  } | null

  students?: Array<{
    id: string
    student_code?: string
    phone?: string | null
    class_id?: string | null
    classes?: {
      id: string
      class_code: string
      class_name: string
    } | null
  }>
}
