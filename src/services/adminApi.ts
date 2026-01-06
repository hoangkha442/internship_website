// services/adminApi.ts (hoặc services/internshipAdminApi.ts)
import type {
  CreateTermPayload,
  CreateTopicPayload,
  GetInternshipParams,
  InternshipListMeta,
  InternshipTerm,
  InternshipTermListResponse,
  InternshipWithRelations,
} from "../modules/shared/types/internship";
import { api } from "./config";

export interface InternshipTopic {
  id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  company_address: string | null;

  created_by_lecturer_id: string | null;

  created_at: string;

  max_students: number;
  current_students: number;
  status: "available" | "full" | "closed";

  term_id?: string | null;

  lecturers?: {
    id: string;
    user_id: string;
    lecturer_code: string;
    department: string;
    phone: string | null;
    created_at: string;
  };
}



export type ListMeta = InternshipListMeta;
export type ListResponse<T> = { items: T[]; meta: ListMeta };

// ===== helpers =====
const normalizeList = <T,>(
  body: any,
  fallbackPage: number,
  fallbackLimit: number
): ListResponse<T> => {
  const rawItems: any[] = body?.data ?? body?.items ?? [];
  const items = rawItems as T[];

  const meta: ListMeta = {
    total: body?.meta?.total ?? body?.total ?? items.length,
    page: body?.meta?.page ?? fallbackPage,
    limit: body?.meta?.limit ?? fallbackLimit,
  };

  return { items, meta };
};

// ======================== INTERNSHIPS ========================
export const getInternships = async (
  params: GetInternshipParams = {}
): Promise<ListResponse<InternshipWithRelations>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const res = await api.get("/internships", { params: { page, limit } });
  return normalizeList<InternshipWithRelations>(res.data, page, limit);
};

// ======================== TERMS ========================
export const getInternshipTerms = async (
  params: GetInternshipParams = {}
): Promise<ListResponse<InternshipTerm>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const res = await api.get("/internships/terms", { params: { page, limit } });
  return normalizeList<InternshipTerm>(res.data, page, limit);
};

export const getAllInternshipTerms = (params: GetInternshipParams) =>
  api
    .get<InternshipTermListResponse>("/internships/terms", { params })
    .then((res) => res.data);

export const createTerm = async (payload: CreateTermPayload) => {
  const res = await api.post("/internships/terms", payload);
  return res.data;
};

export const getTopicsByTermForAdmin = async (
  termId: string | number,
  params: GetInternshipParams = {}
): Promise<ListResponse<InternshipTopic>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const res = await api.get(`/internships/terms/${encodeURIComponent(String(termId))}/topics`, {
    params: { page, limit },
  });

  return normalizeList<InternshipTopic>(res.data, page, limit);
};

export const createTopic = (payload: CreateTopicPayload) =>
  api.post("/internships/topics", payload).then((res) => res.data);
