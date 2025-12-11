import type { UserRole } from "../../../services/authApi"

export type Student = {
  id: number | string
  full_name: string
  email: string
  role: UserRole
  is_active?: boolean
  student_code?: string | null
  phone?: string | null
  class_id?: number | string | null
  class_name?: string | null
  created_at?: string
}

export type PaginationMeta = {
  total: number
  page: number
  limit: number
}

export type StudentListResponse = {
  items: Student[]
  meta: PaginationMeta
}

export type GetStudentParams = {
  page?: number
  limit?: number
}

export type CreateStudentPayload = {
  full_name: string
  email: string
  password: string
  student_code?: string
  phone?: string
  class_id?: number | string
}

export type UpdateStudentPayload = {
  full_name?: string
  email?: string
  is_active?: boolean
  student_code?: string
  phone?: string
  class_id?: number | string | null
}