import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App, Card, Empty } from "antd";
import dayjs from "dayjs";

import { api } from "../../../../services/config";
import { getLecturerWorklogs, type Worklog } from "../../../../services/worklogApi";

import TopicList, { type StudentItem, type TopicGroup } from "../../_components/TopicList";
import StudentList from "../../_components/StudentList";
import WorklogPanel from "../../_components/WorklogPanel";
import ReviewDrawer from "../../_components/ReviewDrawer";

type SupervisedInternship = {
  id: string | number; // internship_id
  students?: {
    student_code?: string | null;
    users?: { full_name?: string | null; email?: string | null } | null;
    classes?: { class_name?: string | null; name?: string | null } | null;
  } | null;
  internship_topics?: { id?: string | number; title?: string | null } | null;
  internship_terms?: { id?: string | number; term_name?: string | null; start_date?: string; end_date?: string } | null;
};

type PaginationMeta = { total: number; page: number; limit: number };
type ListResponse<T> = { items: T[]; meta: PaginationMeta };

const normalizeList = <T,>(body: any, fallbackPage: number, fallbackLimit: number): ListResponse<T> => {
  const rawItems: any[] = body?.data ?? body?.items ?? [];
  const meta: PaginationMeta = {
    total: body?.meta?.total ?? body?.total ?? rawItems.length,
    page: body?.meta?.page ?? fallbackPage,
    limit: body?.meta?.limit ?? fallbackLimit,
  };
  return { items: rawItems as T[], meta };
};

async function getSupervisedInternships(params: { page?: number; limit?: number }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 200;
  const res = await api.get("/internships/lecturer/students", { params: { page, limit } });
  return normalizeList<SupervisedInternship>(res.data, page, limit);
}

const safe = (v?: string | null) => (v && v.trim() ? v.trim() : "—");

function makeTopicKey(it: SupervisedInternship) {
  const topicId = it.internship_topics?.id;
  const termId = it.internship_terms?.id;
  if (topicId != null && termId != null) return `topic:${String(topicId)}|term:${String(termId)}`;

  const title = (it.internship_topics?.title ?? "topic").trim();
  const term = (it.internship_terms?.term_name ?? "term").trim();
  return `topicTitle:${title}|termName:${term}`;
}

export default function LecturerWorklogReviewPage() {
  const { message } = App.useApp();

  // ===== left data =====
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [internships, setInternships] = useState<SupervisedInternship[]>([]);

  const [selectedTopicKey, setSelectedTopicKey] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // ===== worklogs ALL (for FE filter) =====
  const [loadingWl, setLoadingWl] = useState(false);
  const [allWorklogs, setAllWorklogs] = useState<Worklog[]>([]);

  // ===== review drawer =====
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeWorklog, setActiveWorklog] = useState<Worklog | null>(null);

  const loadLeft = useCallback(async () => {
    setLoadingLeft(true);
    try {
      const res = await getSupervisedInternships({ page: 1, limit: 200 });
      const items = res.items ?? [];
      setInternships(items);

      if (!selectedTopicKey && items[0]) {
        setSelectedTopicKey(makeTopicKey(items[0]));
      }
    } catch {
      message.error("Không tải được danh sách đề tài phụ trách");
    } finally {
      setLoadingLeft(false);
    }
  }, [message, selectedTopicKey]);

  useEffect(() => {
    loadLeft();
  }, [loadLeft]);

  // ===== group -> topics =====
  const topicGroups = useMemo<TopicGroup[]>(() => {
    const map = new Map<string, TopicGroup>();

    for (const it of internships) {
      const key = makeTopicKey(it);

      const title = safe(it.internship_topics?.title ?? "Đề tài");
      const termName = safe(it.internship_terms?.term_name ?? "Kỳ thực tập");
      const termRange =
        it.internship_terms?.start_date && it.internship_terms?.end_date
          ? `${dayjs(it.internship_terms.start_date).format("DD/MM/YYYY")} - ${dayjs(it.internship_terms.end_date).format("DD/MM/YYYY")}`
          : undefined;

      const student: StudentItem = {
        internshipId: it.id,
        fullName: safe(it.students?.users?.full_name),
        studentCode: safe(it.students?.student_code),
        email: it.students?.users?.email ?? undefined,
        className: safe(it.students?.classes?.class_name ?? it.students?.classes?.name),
      };

      if (!map.has(key)) {
        map.set(key, {
          key,
          title,
          termName,
          termRange,
          students: [],
        });
      }
      map.get(key)!.students.push(student);
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => a.title.localeCompare(b.title, "vi"));
    return arr;
  }, [internships]);

  const selectedTopic = useMemo(() => {
    if (!selectedTopicKey) return null;
    return topicGroups.find((t) => t.key === selectedTopicKey) ?? null;
  }, [topicGroups, selectedTopicKey]);

  // ===== fetch ALL worklogs (loop page) =====
  const fetchTokenRef = useRef(0);

  const loadAllWorklogs = useCallback(
    async (internshipId: string | number) => {
      const token = ++fetchTokenRef.current;

      setLoadingWl(true);
      try {
        const limit = 200;
        let page = 1;
        let acc: Worklog[] = [];

        while (true) {
          const res = await getLecturerWorklogs({ internship_id: internshipId, page, limit });
          const items = res.items ?? [];
          acc = acc.concat(items);

          const total = res.meta?.total ?? acc.length;

          if (acc.length >= total) break;
          if (items.length < limit) break;

          page += 1;
          if (page > 50) break; // safety
        }

        // ignore stale response if user switched student quickly
        if (fetchTokenRef.current !== token) return;

        setAllWorklogs(acc);
      } catch (err: any) {
        if (fetchTokenRef.current !== token) return;
        message.error(err?.response?.data?.message || "Không tải được worklogs");
        setAllWorklogs([]);
      } finally {
        if (fetchTokenRef.current === token) setLoadingWl(false);
      }
    },
    [message]
  );

  // when topic changes reset student + worklogs
  useEffect(() => {
    setSelectedStudent(null);
    setAllWorklogs([]);
  }, [selectedTopicKey]);

  // when student changes -> load ALL
  useEffect(() => {
    if (!selectedStudent?.internshipId) return;
    setAllWorklogs([]);
    loadAllWorklogs(selectedStudent.internshipId);
  }, [selectedStudent?.internshipId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openReview = (w: Worklog) => {
    setActiveWorklog(w);
    setReviewOpen(true);
  };

  const afterSaved = (payload: { score: number | null; feedback: string | null }) => {
    if (!activeWorklog) return;
    setAllWorklogs((prev) =>
      prev.map((x) => (String(x.id) === String(activeWorklog.id) ? { ...x, ...payload } : x))
    );
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <div className="text-xl font-semibold text-slate-900">Duyệt báo cáo (Worklog)</div>
            <div className="text-sm text-slate-500">Chọn đề tài → chọn sinh viên → filter & duyệt báo cáo.</div>
          </div>
        </div>
      </Card>

      {/* TOP: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <TopicList
            loading={loadingLeft}
            topics={topicGroups}
            selectedKey={selectedTopicKey}
            onSelect={(k) => setSelectedTopicKey(k)}
            onReload={loadLeft}
          />
        </div>

        <div className="lg:col-span-6">
          {!selectedTopic ? (
            <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
              <Empty description="Chọn một đề tài để xem sinh viên." />
            </Card>
          ) : (
            <StudentList
              topic={selectedTopic}
              selectedStudentId={selectedStudent?.internshipId ?? null}
              onSelect={(st) => setSelectedStudent(st)}
            />
          )}
        </div>
      </div>

      {/* BOTTOM: FULL WIDTH WORKLOGS */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
        {!selectedStudent ? (
          <Empty description="Chọn sinh viên để xem báo cáo." />
        ) : (
          <WorklogPanel
            student={selectedStudent}
            loading={loadingWl}
            allWorklogs={allWorklogs}
            onOpenReview={openReview}
          />
        )}
      </Card>

      <ReviewDrawer
        open={reviewOpen}
        worklog={activeWorklog}
        onClose={() => {
          setReviewOpen(false);
          setActiveWorklog(null);
        }}
        onSaved={afterSaved}
      />
    </div>
  );
}
