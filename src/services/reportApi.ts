import { api } from "./config";

export type PaginationMeta = { total: number; page: number; limit: number };
export type ListResponse<T> = { items: T[]; meta: PaginationMeta };

export type ReportStatus = "submitted" | "reviewed" | "needs_revision";
export type ReportFileFilter = "all" | "has" | "none";
export type ReportSort = "submitted_desc" | "submitted_asc" | "week_desc" | "week_asc";



export type LecturerSupervisedItem = {
  internship_id: string | number;

  student_id?: string | number;
  student_code?: string | null;
  student_name?: string | null;

  topic_title?: string | null;
  term_name?: string | null;

  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
};



export type ReportAttachment = {
  id: string | number;
  report_id: string | number;
  file_path: string;
  public_id?: string | null;
  description?: string | null;
  uploaded_at?: string | null;
};

export type ProgressReport = {
  id: string | number;
  internship_id: string | number;

  report_no?: number | null;
  week_no?: number | null;

  title: string;
  content: string; // HTML

  status?: ReportStatus | null;
  submitted_at?: string | null;

  // lecturer review
  score?: number | null;
  feedback?: string | null; // HTML
  is_pass?: boolean | null; // NULL = pending
  reviewed_at?: string | null;
  reviewed_by_lecturer_id?: string | number | null;

  report_attachments?: ReportAttachment[];
};

const normalizeList = <T,>(body: any, fallbackPage: number, fallbackLimit: number): ListResponse<T> => {
  const rawItems: any[] = body?.data ?? body?.items ?? [];
  return {
    items: rawItems as T[],
    meta: {
      total: body?.meta?.total ?? body?.total ?? rawItems.length,
      page: body?.meta?.page ?? fallbackPage,
      limit: body?.meta?.limit ?? fallbackLimit,
    },
  };
};

const BASE = "/progress-reports";

// =======================
// Filters (Student/Lecturer)
// =======================
export type GetReportsParams = {
  page?: number;
  limit?: number;

  q?: string;
  from?: string; // ISO
  to?: string;   // ISO
  status?: "all" | ReportStatus;
  hasFile?: ReportFileFilter;
  sort?: ReportSort;
};

// ===== Student =====
export const getStudentReports = async (internshipId: string | number, params: GetReportsParams = {}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const res = await api.get(`${BASE}/student`, {
    params: {
      internship_id: internshipId,
      page,
      limit,

      // optional filters (backend có thể ignore, FE vẫn lọc fallback)
      q: params.q,
      from: params.from,
      to: params.to,
      status: params.status,
      hasFile: params.hasFile,
      sort: params.sort,
    },
  });

  return normalizeList<ProgressReport>(res.data, page, limit);
};

export type CreateReportPayload = {
  internship_id: string | number;
  report_no?: number | null;
  week_no?: number | null;
  title: string;
  content: string; // HTML
};

export const createStudentReport = async (payload: CreateReportPayload, files: File[] = []) => {
  const fd = new FormData();
  fd.append("internship_id", String(payload.internship_id));
  if (payload.report_no != null) fd.append("report_no", String(payload.report_no));
  if (payload.week_no != null) fd.append("week_no", String(payload.week_no));
  fd.append("title", payload.title);
  fd.append("content", payload.content);

  for (const f of files) fd.append("attachments", f);

  const res = await api.post(`${BASE}/student`, fd);
  return res.data as { message: string; report: ProgressReport };
};

export type UpdateReportPayload = Partial<Pick<CreateReportPayload, "report_no" | "week_no" | "title" | "content">>;

export type UpdateReportOptions = {
  /**
   * true: nếu có file mới -> replace attachments
   * false/undefined: không replace (mặc định)
   */
  replaceAttachments?: boolean;
};

export const updateStudentReport = async (
  reportId: string | number,
  payload: UpdateReportPayload,
  files?: File[] | null,
  opts?: UpdateReportOptions
) => {
  const fd = new FormData();

  if (payload.report_no != null) fd.append("report_no", String(payload.report_no));
  if (payload.week_no != null) fd.append("week_no", String(payload.week_no));
  if (payload.title != null) fd.append("title", payload.title);
  if (payload.content != null) fd.append("content", payload.content);

  //  CHỈ ĐỤNG TỚI ATTACHMENTS KHI THỰC SỰ CÓ FILE MỚI
  const hasNewFiles = Array.isArray(files) && files.length > 0;

  if (hasNewFiles) {
    for (const f of files!) fd.append("attachments", f);
    if (opts?.replaceAttachments) fd.append("_replace_attachments", "1");
  }

  const res = await api.patch(`${BASE}/student/${reportId}`, fd);
  return res.data as { message: string; report: ProgressReport };
};

export const deleteStudentReport = async (reportId: string | number) => {
  const res = await api.delete(`${BASE}/student/${reportId}`);
  return res.data as { message: string };
};

// ===== Lecturer =====
export const getLecturerReports = async (internshipId: string | number, params: GetReportsParams = {}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const res = await api.get(`${BASE}/lecturer`, {
    params: {
      internship_id: internshipId,
      page,
      limit,

      q: params.q,
      from: params.from,
      to: params.to,
      status: params.status,
      hasFile: params.hasFile,
      sort: params.sort,
    },
  });

  return normalizeList<ProgressReport>(res.data, page, limit);
};
// export const getLecturerReports = async (
//   internshipId: string | number,
//   params: { page?: number; limit?: number } = {}
// ) => {
//   const page = params.page ?? 1;
//   const limit = params.limit ?? 10;

//   const res = await api.get(`${BASE}/lecturer`, {
//     params: { internship_id: internshipId, page, limit },
//   });

//   return normalizeList<ProgressReport>(res.data, page, limit);
// };


export type ReviewReportPayload = {
  status?: "reviewed" | "needs_revision";
  score?: number | null;
  feedback?: string | null;
  is_pass?: boolean | null; 
};

export const reviewReport = async (reportId: string | number, payload: ReviewReportPayload) => {
  const res = await api.patch(`${BASE}/lecturer/${reportId}/review`, payload);
  return res.data as { message: string; report: ProgressReport };
};



export const getLecturerSupervisedStudents = async (): Promise<LecturerSupervisedItem[]> => {
  const res = await api.get("/internships/lecturer/students");

  const raw = (res.data?.data ?? res.data ?? []) as any[];

  return raw.map((x) => ({
    internship_id: x.internship_id ?? x.id,

    student_id: x.student_id ?? x.students?.id,
    student_code: x.student_code ?? x.students?.student_code ?? null,

    student_name:
      x.student_name ??
      x.students?.users?.full_name ??
      x.students?.full_name ??
      null,

    topic_title: x.topic_title ?? x.internship_topics?.title ?? null,
    term_name: x.term_name ?? x.internship_terms?.term_name ?? null,

    start_date: x.start_date ?? null,
    end_date: x.end_date ?? null,
    status: x.status ?? null,
  }));
};