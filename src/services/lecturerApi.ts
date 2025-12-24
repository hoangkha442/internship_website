import { api } from "./config"

// =========================
// Types
// =========================
export type PaginationMeta = { total: number; page: number; limit: number }
export type ListResponse<T> = { items: T[]; meta: PaginationMeta }

export type InternshipStatus = "registered" | "in_progress" | "completed" | "dropped"

export type InternshipTermWithStats = {
  id: string | number
  term_name: string
  start_date: string
  end_date: string
  students_count?: number
  lecturers_count?: number
  topics_count?: number
}

export type InternshipTopic = {
  id: string
  title: string
  description: string | null
  company_name: string | null
  company_address: string | null
  created_by_lecturer_id: string | null
  term_id?: string | null
  created_at: string
  max_students: number
  current_students: number
  status: "available" | "full" | "closed"
  lecturers?: {
    id: string
    lecturer_code?: string | null
    department?: string | null
  } | null
}

export type CreateTopicPayload = {
  term_id: string
  title: string
  description?: string | null
  company_name?: string | null
  company_address?: string | null
  max_students?: number
}

export type LecturerUser = {
  id: string | number
  full_name?: string | null
  email?: string | null
  phone?: string | null
}

export type LecturerClass = {
  id: string | number
  class_name?: string | null
  name?: string | null
}

export type LecturerStudent = {
  id: string | number
  student_code?: string | null
  users?: LecturerUser | null
  classes?: LecturerClass | null
}

export type TopicRegistrationStatus = "pending" | "approved" | "rejected"

export type TopicRegistration = {
  id: string | number
  topic_id: string | number
  student_id: string | number
  status: TopicRegistrationStatus
  registered_at?: string | null
  students?: LecturerStudent | null
}

export type Internship = {
  id: string | number
  status?: InternshipStatus
  created_at?: string
  updated_at?: string
}

// Internships row for "SV phụ trách"
export type SupervisedInternshipRow = Internship & {
  progress_percent?: string | number | null
  students?: LecturerStudent | null
  internship_topics?: InternshipTopic | null
  internship_terms?: InternshipTermWithStats | null
}

// =========================
// Helpers
// =========================
const normalizeList = <T>(
  body: any,
  fallbackPage: number,
  fallbackLimit: number
): ListResponse<T> => {
  const rawItems: any[] = body?.data ?? body?.items ?? []
  const items: T[] = rawItems

  const meta: PaginationMeta = {
    total: body?.meta?.total ?? body?.total ?? rawItems.length,
    page: body?.meta?.page ?? fallbackPage,
    limit: body?.meta?.limit ?? fallbackLimit,
  }

  return { items, meta }
}

const normalizeItems = <T>(body: any): T[] => {
  const raw: any[] = body?.items ?? body?.data ?? body ?? []
  return raw as T[]
}

// =========================
// API (LECTURER)
// =========================
export const getInternshipTermsLecturer = async (
  params: { page?: number; limit?: number } = {}
) => {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const res = await api.get("/internships/terms", { params: { page, limit } })
  return normalizeList<InternshipTermWithStats>(res.data, page, limit)
}

export const getLecturerTopicsByTerm = async (
  termId: string,
  params: { page?: number; limit?: number } = {}
) => {
  const page = params.page ?? 1
  const limit = params.limit ?? 12
  const res = await api.get(`/internships/lecturer/terms/${termId}/topics`, {
    params: { page, limit },
  })
  return normalizeList<InternshipTopic>(res.data, page, limit)
}

export const createTopicForTerm = async (payload: CreateTopicPayload) => {
  const res = await api.post("/internships/topics", payload)
  return res.data
}

// registrations (pending list for a topic)
export const getPendingRegistrationsByTopic = async (topicId: string | number) => {
  const res = await api.get("/internships/lecturer/topic-registrations", {
    params: { topic_id: topicId },
  })
  return { items: normalizeItems<TopicRegistration>(res.data) }
}

// approve/reject
export type ApproveTopicRegistrationResponse = {
  message?: string
  note?: string
  registration?: TopicRegistration
  internship?: Internship
}

export const approveTopicRegistration = async (
  registrationId: string | number,
  note?: string
): Promise<ApproveTopicRegistrationResponse> => {
  const res = await api.patch(
    `/internships/lecturer/topic-registrations/approve/${registrationId}`,
    { note }
  )
  return res.data
}

export type RejectTopicRegistrationResponse = {
  message?: string
  reason?: string
  registration?: TopicRegistration
}

export const rejectTopicRegistration = async (
  registrationId: string | number,
  reason: string
): Promise<RejectTopicRegistrationResponse> => {
  const res = await api.patch(
    `/internships/lecturer/topic-registrations/reject/${registrationId}`,
    { reason }
  )
  return res.data
}

// update internship status (SV phụ trách)
export const updateInternshipStatus = async (
  internshipId: string | number,
  status: InternshipStatus
) => {
  const res = await api.patch(`/internships/status/${internshipId}`, { status })
  return res.data
}

// supervised students (internships list)
export const getSupervisedStudents = async (params: {
  page?: number
  limit?: number
  term_id?: string | number
  status?: InternshipStatus
  q?: string
} = {}) => {
  const page = params.page ?? 1
  const limit = params.limit ?? 10

  const res = await api.get("/internships/lecturer/students", {
    params: {
      page,
      limit,
      term_id: params.term_id,
      status: params.status,
      q: params.q,
    },
  })

  return normalizeList<SupervisedInternshipRow>(res.data, page, limit)
}
