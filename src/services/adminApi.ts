import type { CreateTermPayload, CreateTopicPayload, GetInternshipParams, InternshipListMeta, InternshipListResponse, InternshipTerm, InternshipTermListResponse, InternshipTopicListResponse } from "../modules/shared/types/internship"
import { api } from "./config"

export const getInternships = async (
  params: GetInternshipParams = {}
): Promise<InternshipListResponse> => {
  const { page = 1, limit = 10 } = params

  const res = await api.get('/internships', {
    params: { page, limit },
  })
  const body = res.data as any

  const rawItems: any[] = body.data ?? body.items ?? body ?? []

  const items: InternshipTerm[] = rawItems

  const meta: InternshipListMeta = {
    total: body.meta?.total ?? body.total ?? items.length,
    page: body.meta?.page ?? page,
    limit: body.meta?.limit ?? limit,
  }

  return { items, meta }
}
export const getInternshipTerms = async (
  params: GetInternshipParams = {}
): Promise<InternshipListResponse> => {
  const { page = 1, limit = 10 } = params

  const res = await api.get('/internships/terms', {
    params: { page, limit },
  })
  const body = res.data as any

  const rawItems: any[] = body.data ?? body.items ?? body ?? []

  const items: InternshipTerm[] = rawItems

  const meta: InternshipListMeta = {
    total: body.meta?.total ?? body.total ?? items.length,
    page: body.meta?.page ?? page,
    limit: body.meta?.limit ?? limit,
  }

  return { items, meta }
}




export const createTerm = async (payload: CreateTermPayload) => {
  const res = await api.post('/internships/terms', payload)
  return res.data
} 

export const getAllInternshipTerms = (params: GetInternshipParams) =>
  api
    .get<InternshipTermListResponse>('/internships/terms', { params })
    .then((res) => res.data)

export const getInternshipTopicsAdmin = (params: GetInternshipParams) =>
  api
    .get<InternshipTopicListResponse>('/internships/student/internship-topics', {
      params,
    })
    .then((res) => res.data)


export const createTopic = (payload: CreateTopicPayload) =>
  api.post('/internships/topics', payload).then((res) => res.data)
