import { api } from "./config";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
};

export type ListResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type WorklogReviewFilter = "all" | "reviewed" | "pending";
export type WorklogFileFilter = "all" | "has" | "none";
export type WorklogSort =
  | "work_date_desc"
  | "work_date_asc"
  | "created_desc"
  | "created_asc";

export type WorklogAttachment = {
  id: string | number;
  work_log_id: string | number;
  file_path: string;
  public_id?: string | null;
  description?: string | null;
  uploaded_at?: string | null;
};

export type Worklog = {
  id: string | number;
  internship_id: string | number;
  work_date: string;
  content: string;
  score?: number | null;
  feedback?: string | null;
  created_at?: string | null;
  work_log_attachments?: WorklogAttachment[];
};


export type ReviewWorklogPayload = {
  score?: number | null
  feedback?: string | null
}

export type GetWorklogsParams = {
  page?: number;
  limit?: number;

  q?: string;
  from?: string;
  to?: string;
  review?: WorklogReviewFilter;
  hasFile?: WorklogFileFilter;
  sort?: WorklogSort;
};

const normalizeList = <T,>(
  body: any,
  fallbackPage: number,
  fallbackLimit: number
): ListResponse<T> => {
  const rawItems: any[] = body?.data ?? body?.items ?? [];
  const items = rawItems as T[];

  const meta: PaginationMeta = {
    total: body?.meta?.total ?? body?.total ?? rawItems.length,
    page: body?.meta?.page ?? fallbackPage,
    limit: body?.meta?.limit ?? fallbackLimit,
  };

  return { items, meta };
};

const WORKLOG_BASE = "/worklogs";


export const getStudentWorklogs = async (
  internshipId: string | number,
  params: GetWorklogsParams = {}
) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const res = await api.get(`${WORKLOG_BASE}/student`, {
    params: {
      internship_id: internshipId,
      page,
      limit,

      // filters (optional)
      q: params.q,
      from: params.from,
      to: params.to,
      review: params.review,
      hasFile: params.hasFile,
      sort: params.sort,
    },
  });

  return normalizeList<Worklog>(res.data, page, limit);
};

export type CreateWorklogPayload = {
  internship_id: string | number;
  work_date: string;
  content: string;
};

export const createStudentWorklog = async (
  payload: CreateWorklogPayload,
  files: File[] = []
) => {
  const fd = new FormData();
  fd.append("internship_id", String(payload.internship_id));
  fd.append("work_date", payload.work_date);
  fd.append("content", payload.content);

  for (const f of files) fd.append("attachments", f);

  const res = await api.post(`${WORKLOG_BASE}/student`, fd);
  return res.data as { message: string; worklog: Worklog };
};

export type UpdateWorklogPayload = Partial<
  Pick<CreateWorklogPayload, "work_date" | "content">
>;

export const updateStudentWorklog = async (
  worklogId: string | number,
  payload: UpdateWorklogPayload,
  files?: File[] | null
) => {
  const fd = new FormData();

  if (payload.work_date != null) fd.append("work_date", payload.work_date);
  if (payload.content != null) fd.append("content", payload.content);

  // If files is provided: replace attachments (per backend contract)
  if (files) {
    for (const f of files) fd.append("attachments", f);
    fd.append("_replace_attachments", "1");
  }

  const res = await api.patch(`${WORKLOG_BASE}/student/${worklogId}`, fd);
  return res.data as { message: string; worklog: Worklog };
};

export const deleteStudentWorklog = async (worklogId: string | number) => {
  const res = await api.delete(`${WORKLOG_BASE}/student/${worklogId}`);
  return res.data as { message: string };
};


export const getLecturerWorklogs = async (params: { internship_id: string | number; page?: number; limit?: number }) => {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const res = await api.get("/worklogs/lecturer", { params: { internship_id: params.internship_id, page, limit } })
  return normalizeList<Worklog>(res.data, page, limit)
}

export const reviewWorklog = async (worklogId: string | number, payload: ReviewWorklogPayload) => {
  const res = await api.patch(`/worklogs/lecturer/${worklogId}/review`, payload)
  return res.data
}