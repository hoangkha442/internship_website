import type { RegisterInternshipPayload, RegisterInternshipResponse } from "../modules/shared/types/internship"
import type { CreateStudentPayload, GetStudentParams, PaginationMeta, Student, StudentListResponse, UpdateStudentPayload } from "../modules/shared/types/student"
import type { MyInternshipResponse, MyTopicRegistrationResponse } from "../modules/shared/types/studentInternship"
import { api } from "./config"

// ADMIN CONTROL
export const getStudents = async (  
  params: GetStudentParams = {}
): Promise<StudentListResponse> => {
  const { page = 1, limit = 10 } = params

  const res = await api.get('/user', {
    params: { page, limit },
  })

  const body = res.data as any


  const rawItems: any[] = body.data ?? body.items ?? body ?? []

  const items: Student[] = rawItems.filter((u) => u.role === 'student')

  const meta: PaginationMeta = {
    total: body.meta?.total ?? body.total ?? items.length,
    page: body.meta?.page ?? page,
    limit: body.meta?.limit ?? limit,
  }

  return { items, meta }
}

export const createStudent = async (payload: CreateStudentPayload) => {
  const res = await api.post('/user', {
    full_name: payload.full_name,
    email: payload.email,
    password: payload.password,
    role: 'student',
    student_code: payload.student_code,
    phone: payload.phone,
    class_id: payload.class_id,
  })

  return res.data
}

export const updateStudent = async (
  id: number | string,
  payload: UpdateStudentPayload
) => {
  const res = await api.patch(`/user/${id}`, {
    ...payload,
    role: 'student', 
  })

  return res.data
}

export const deleteStudent = async (id: number | string) => {
  const res = await api.delete(`/user/${id}`)
  return res.data
}


//  STUDENT

export const getInternship_topics = async(
  params: GetStudentParams = {}
): Promise<StudentListResponse> => {
  const { page = 1, limit = 10 } = params

  const res = await api.get('/internships/student/internship-topics', {
    params: { page, limit },
  })

  const body = res.data as any


  const rawItems: any[] = body.data ?? body.items ?? body ?? []

  const items: Student[] = rawItems

  const meta: PaginationMeta = {
    total: body.meta?.total ?? body.total ?? items.length,
    page: body.meta?.page ?? page,
    limit: body.meta?.limit ?? limit,
  }
  return { items, meta }
}


export const registerTopic = async (payload: {
  topic_id: string;
}) => {
  const res = await api.post("internships/topic-registrations", payload);
  return res.data;
};

export const registerInternship = async (
  payload: RegisterInternshipPayload
) => {
  const res = await api.post<RegisterInternshipResponse>(
    '/internships/register',
    payload
  )

  return res.data
}

export const getInternshipTopics = (params: { page?: number; limit?: number }) =>
  api
    .get('/internships/student/internship-topics', { params })
    .then((res) => res.data)

export const createTopicRegistration = (payload: { topic_id: string }) =>
  api
    .post('/internships/topic-registrations', payload)
    .then((res) => res.data)

export const getMyInternship = () =>
  api.get<MyInternshipResponse | null>('/internships/my').then((res) => res.data)

export const getMyTopicRegistration = () =>
  api
    .get<MyTopicRegistrationResponse>('/internships/student/my-topic-registration')
    .then((res) => res.data)