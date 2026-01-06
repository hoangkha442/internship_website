import  { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Segmented,
  Progress,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type {
  InternshipTermWithStats,
  InternshipWithRelations,
} from "../../../../modules/shared/types/internship";

import {
  getAllInternshipTerms,
  getInternships,
  getTopicsByTermForAdmin,
  type InternshipTopic,
} from "../../../../services/adminApi";

const { Text } = Typography;

type HasStudentFilter = "all" | "has" | "none";

type StudentVM = {
  id: string;
  student_code?: string;
  full_name?: string;
  email?: string;
  status?: string;
  progress_percent?: number; // number
};

type LecturerVM = {
  id: string;
  lecturer_code?: string;
  full_name?: string;
  email?: string;
  department?: string;
};

type TopicVM = {
  key: string;

  termId: string;
  termName: string;
  termStart?: string | null;
  termEnd?: string | null;

  topicId: string;
  topicTitle: string;
  description?: string | null;
  companyName?: string | null;
  companyAddress?: string | null;

  maxStudents?: number;
  currentStudents?: number;
  topicStatus?: InternshipTopic["status"];

  lecturer?: LecturerVM; 
  students: StudentVM[];

  studentCount: number;
  avgProgress: number;
};

const safe = (v?: string | null) => (v && String(v).trim() ? String(v).trim() : "—");
const lower = (v?: string | null) => (v ? String(v).trim().toLowerCase() : "");

const avgProgress = (students: StudentVM[]) => {
  const nums = students
    .map((s) => Number(s.progress_percent ?? 0))
    .filter((n) => !Number.isNaN(n));
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
};

async function fetchAllInternshipsClientSide(): Promise<InternshipWithRelations[]> {
  // vì BE chưa có filter theo term/topic sẵn → ta kéo nhiều trang rồi lọc FE
  const limit = 500;
  let page = 1;
  let acc: InternshipWithRelations[] = [];

  while (true) {
    const res = await getInternships({ page, limit });
    const items = res.items ?? [];
    acc = acc.concat(items);

    const total = res.meta?.total ?? acc.length;

    if (acc.length >= total) break;
    if (items.length < limit) break;

    page += 1;
    if (page > 50) break; // safety
  }

  return acc;
}

export default function AdminTermTopicsPage() {
  const { message } = App.useApp();

  // terms
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [terms, setTerms] = useState<InternshipTermWithStats[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  // topics
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topics, setTopics] = useState<InternshipTopic[]>([]);

  // internships (cache)
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [allInternships, setAllInternships] = useState<InternshipWithRelations[]>([]);

  // UI filters
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [hasStudent, setHasStudent] = useState<HasStudentFilter>("all");
  const [lecturerId, setLecturerId] = useState<string>("all");

  // ---------- load terms ----------
  const loadTerms = useCallback(async () => {
    setLoadingTerms(true);
    try {
      const res = await getAllInternshipTerms({ page: 1, limit: 200 });
      console.log('res: ', res);
      const items = res?.data ?? [];
      setTerms(items);

      // auto select first term if none
      if (!selectedTermId && items[0]?.id != null) {
        setSelectedTermId(String(items[0].id));
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được danh sách kỳ thực tập");
    } finally {
      setLoadingTerms(false);
    }
  }, [message, selectedTermId]);

  // ---------- load internships once (cache) ----------
  const loadInternshipsCache = useCallback(async () => {
    setLoadingInternships(true);
    try {
      const items = await fetchAllInternshipsClientSide();
      setAllInternships(items ?? []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được internships");
      setAllInternships([]);
    } finally {
      setLoadingInternships(false);
    }
  }, [message]);

  // ---------- load topics of selected term ----------
  const loadTopicsOfTerm = useCallback(
    async (termId: string) => {
      setLoadingTopics(true);
      try {
        const res = await getTopicsByTermForAdmin(termId, { page: 1, limit: 1000 });
        console.log('res: ', res);
        setTopics(res?.items ?? []);
      } catch (e: any) {
        message.error(e?.response?.data?.message || "Không tải được topics theo kỳ");
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    },
    [message]
  );

  useEffect(() => {
    loadTerms();
    loadInternshipsCache();
  }, [loadTerms, loadInternshipsCache]);

  useEffect(() => {
    if (!selectedTermId) return;
    loadTopicsOfTerm(selectedTermId);
    setLecturerId("all");
    setHasStudent("all");
    setQ("");
  }, [selectedTermId, loadTopicsOfTerm]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const selectedTerm = useMemo(() => {
    if (!selectedTermId) return null;
    return terms.find((t) => String(t.id) === String(selectedTermId)) ?? null;
  }, [terms, selectedTermId]);

  // ---------- merge topics + internships (by term & topic) ----------
  const topicVMs = useMemo<TopicVM[]>(() => {
    const termId = selectedTermId;
    if (!termId) return [];

    // filter internships by term
    const internOfTerm = allInternships.filter((x) => String(x.term_id) === String(termId));

    // map topicId -> data from internships (students + lecturer)
    const map = new Map<
      string,
      {
        lecturer?: LecturerVM;
        students: StudentVM[];
      }
    >();

    for (const it of internOfTerm) {
      const topicId = String(it.topic_id);

      if (!map.has(topicId)) {
        map.set(topicId, { lecturer: undefined, students: [] });
      }
      const entry = map.get(topicId)!;

      // lecturer (ưu tiên từ internships vì có users.full_name/email)
      const gv = it.lecturers;
      if (gv && !entry.lecturer) {
        entry.lecturer = {
          id: String(gv.id),
          lecturer_code: gv.lecturer_code,
          department: gv.department,
          full_name: gv.users?.full_name ?? undefined,
          email: gv.users?.email ?? undefined,
        };
      }

      // student
      const st = it.students;
      if (st) {
        entry.students.push({
          id: String(st.id),
          student_code: st.student_code,
          full_name: st.users?.full_name ?? undefined,
          email: st.users?.email ?? undefined,
          status: it.status,
          progress_percent: Number(it.progress_percent ?? 0) || 0,
        });
      }
    }

    // build TopicVM from topics API (ensures topic with 0 students still shows)
    const termName = selectedTerm?.term_name ?? "—";
    const termStart = selectedTerm?.start_date ?? null;
    const termEnd = selectedTerm?.end_date ?? null;

    const rows: TopicVM[] = (topics ?? []).map((tp) => {
      const topicId = String(tp.id);
      const fromIntern = map.get(topicId);

      // fallback lecturer from topic.lecturers (không có full_name/email trong type bạn đưa)
      const fallbackLecturer: LecturerVM | undefined = tp.lecturers
        ? {
            id: String(tp.lecturers.id),
            lecturer_code: tp.lecturers.lecturer_code,
            department: tp.lecturers.department,
          }
        : undefined;

      const lecturer = fromIntern?.lecturer ?? fallbackLecturer;

      const students = fromIntern?.students ?? [];
      const studentCount = students.length;

      return {
        key: `${topicId}|${termId}`,

        termId: String(termId),
        termName,
        termStart,
        termEnd,

        topicId,
        topicTitle: safe(tp.title),
        description: tp.description ?? null,
        companyName: tp.company_name ?? null,
        companyAddress: tp.company_address ?? null,

        maxStudents: tp.max_students,
        currentStudents: tp.current_students,
        topicStatus: tp.status,

        lecturer,
        students,

        studentCount,
        avgProgress: avgProgress(students),
      };
    });

    // sort: students desc then title
    rows.sort((a, b) => {
      if (a.studentCount !== b.studentCount) return b.studentCount - a.studentCount;
      return a.topicTitle.localeCompare(b.topicTitle, "vi");
    });

    return rows;
  }, [allInternships, topics, selectedTermId, selectedTerm]);

  // lecturer options from topicVMs
  const lecturerOptions = useMemo(() => {
    const m = new Map<string, { id: string; label: string; countStudents: number }>();

    for (const r of topicVMs) {
      const gv = r.lecturer;
      if (!gv?.id) continue;

      if (!m.has(gv.id)) {
        const label = `${gv.lecturer_code ? gv.lecturer_code + " · " : ""}${gv.full_name ?? "—"}`;
        m.set(gv.id, { id: gv.id, label, countStudents: 0 });
      }
      const x = m.get(gv.id)!;
      x.countStudents += r.studentCount;
    }

    const arr = Array.from(m.values()).sort((a, b) => a.label.localeCompare(b.label, "vi"));
    return [
      { value: "all", label: "Tất cả giảng viên" },
      ...arr.map((x) => ({
        value: x.id,
        label: `${x.label} (${x.countStudents} SV)`,
      })),
    ];
  }, [topicVMs]);

  const filtered = useMemo(() => {
    const s = qDebounced.toLowerCase();

    return topicVMs.filter((r) => {
      if (lecturerId !== "all") {
        if (!r.lecturer?.id || String(r.lecturer.id) !== String(lecturerId)) return false;
      }

      if (hasStudent === "has" && r.studentCount === 0) return false;
      if (hasStudent === "none" && r.studentCount > 0) return false;

      if (s) {
        const hay = [
          lower(r.topicTitle),
          lower(r.lecturer?.full_name),
          r.students.map((st) => lower(st.full_name)).join(" "),
        ].join(" ");
        if (!hay.includes(s)) return false;
      }

      return true;
    });
  }, [topicVMs, qDebounced, lecturerId, hasStudent]);

  // table columns (no width)
  const columns: ColumnsType<TopicVM> = [
    {
      title: "Đề tài",
      dataIndex: "topicTitle",
      ellipsis: true,
      render: (_, r) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 truncate">{r.topicTitle}</div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {r.companyName ? r.companyName : "—"}
            {r.companyAddress ? ` · ${r.companyAddress}` : ""}
          </div>
          {r.description ? (
            <div className="text-xs text-slate-500 mt-1" style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {r.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "lecturer",
      ellipsis: true,
      render: (_, r) => {
        const gv = r.lecturer;
        if (!gv) return <Text type="secondary">—</Text>;
        return (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {gv.lecturer_code ? gv.lecturer_code : "—"}
            </div>
            <div className="text-xs text-slate-600 truncate">{gv.full_name ?? "—"}</div>
            {gv.department ? <div className="text-xs text-slate-500 truncate">{gv.department}</div> : null}
          </div>
        );
      },
      responsive: ["md"],
    },
    {
      title: "Slot",
      render: (_, r) => {
        const max = r.maxStudents ?? 0;
        const cur = r.studentCount; // dùng số sinh viên thật từ internships
        return (
          <Space wrap>
            <Tag color={cur > 0 ? "blue" : "default"}>{cur} SV</Tag>
            {max ? <Tag color={cur >= max ? "red" : "green"}>{cur}/{max}</Tag> : null}
          </Space>
        );
      },
    },
    {
      title: "Tiến độ TB",
      render: (_, r) => (r.studentCount ? <Tag color="purple">{r.avgProgress}%</Tag> : <Text type="secondary">—</Text>),
      responsive: ["lg"],
    },
    {
      title: "Trạng thái",
      render: (_, r) => {
        const st = r.topicStatus;
        if (!st) return <Text type="secondary">—</Text>;
        const color = st === "available" ? "green" : st === "full" ? "orange" : "default";
        const label = st === "available" ? "Có thể đăng ký" : st === "full" ? "Đã đủ" : "Đóng";
        return <Tag color={color}>{label}</Tag>;
      },
      responsive: ["lg"],
    },
  ];

  const studentColumns: ColumnsType<StudentVM> = [
    {
      title: "Sinh viên",
      dataIndex: "full_name",
      ellipsis: true,
      render: (_, s) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 truncate">
            {s.student_code ? `${s.student_code} · ` : ""}
            {s.full_name ?? "—"}
          </div>
          {s.email ? <div className="text-xs text-slate-500 truncate">{s.email}</div> : null}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) => {
        const map: Record<string, { label: string; color: string }> = {
          registered: { label: "Đã đăng ký", color: "default" },
          in_progress: { label: "Đang thực tập", color: "processing" },
          completed: { label: "Hoàn thành", color: "success" },
          canceled: { label: "Hủy", color: "error" },
        };
        const x = v ? map[v] : null;
        return <Tag color={x?.color || "default"}>{x?.label || v || "—"}</Tag>;
      },
      responsive: ["md"],
    },
    {
      title: "Tiến độ",
      dataIndex: "progress_percent",
      render: (v) => <Progress percent={Number(v) || 0} size="small" />,
      responsive: ["md"],
    },
  ];

  const loading = loadingTerms || loadingTopics || loadingInternships;

  const resetFilters = () => {
    setQ("");
    setHasStudent("all");
    setLecturerId("all");
    message.success("Đã reset bộ lọc");
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Header */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xl font-semibold text-slate-900">Quản lý Topic theo Kỳ</div>
            </div>

            <Space wrap>
              <Button onClick={resetFilters}>Reset</Button>
              <Button onClick={loadTerms} loading={loadingTerms}>Reload kỳ</Button>
              <Button onClick={loadInternshipsCache} loading={loadingInternships}>Reload internships</Button>
            </Space>
          </div>

          {/* Term Picker */}
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Select
              value={selectedTermId ?? undefined}
              onChange={(v) => setSelectedTermId(String(v))}
              loading={loadingTerms}
              placeholder="Chọn kỳ thực tập"
              className="md:w-[360px]"
              options={(terms ?? []).map((t) => ({
                value: String(t.id),
                label: `${t.term_name} (${dayjs(t.start_date).format("DD/MM/YYYY")} - ${dayjs(t.end_date).format("DD/MM/YYYY")})`,
              }))}
              showSearch
              optionFilterProp="label"
              allowClear={false}
            />

            <div className="text-xs text-slate-500">
              {selectedTerm ? (
                <>
                  Đang xem: <b className="text-slate-700">{selectedTerm.term_name}</b> · Topics:{" "}
                  <b className="text-slate-700">{topics.length}</b>
                </>
              ) : (
                "—"
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search: tên đề tài / tên GV / tên SV…"
                allowClear
              />

              <Select
                value={lecturerId}
                onChange={setLecturerId}
                options={lecturerOptions}
                placeholder="Lọc theo giảng viên"
                className="md:w-[320px]"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <Segmented
                value={hasStudent}
                onChange={(v) => setHasStudent(v as HasStudentFilter)}
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Có SV", value: "has" },
                  { label: "Chưa có SV", value: "none" },
                ]}
              />

              <div className="text-xs text-slate-500">
                Kết quả: <b className="text-slate-700">{filtered.length}</b>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
        {!selectedTermId ? (
          <Empty description="Chọn kỳ thực tập để xem danh sách topic." />
        ) : filtered.length === 0 && !loading ? (
          <Empty description="Không có topic phù hợp bộ lọc." />
        ) : (
          <Table<TopicVM>
            rowKey={(r) => r.key}
            loading={loading}
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [5, 10, 20, 50] }}
            tableLayout="auto"
            expandable={{
              expandedRowRender: (r) => {
                if (!r.students.length) {
                  return <div className="text-xs text-slate-500">Chưa có sinh viên nào trong topic này.</div>;
                }

                const students = [...r.students].sort((a, b) =>
                  (a.full_name ?? "").localeCompare(b.full_name ?? "", "vi")
                );

                return (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="text-sm font-semibold text-slate-900">
                        Sinh viên ({students.length})
                      </div>
                      <Tag color="purple">Tiến độ TB: {avgProgress(students)}%</Tag>
                    </div>

                    <Table<StudentVM>
                      rowKey={(s) => String(s.id)}
                      size="small"
                      columns={studentColumns}
                      dataSource={students}
                      pagination={false}
                      tableLayout="auto"
                    />
                  </div>
                );
              },
              rowExpandable: () => true,
            }}
          />
        )}
      </Card>
    </div>
  );
}
