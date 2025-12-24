import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import TermSidebar from "../../_components/TermSidebar";
import {
  getInternshipTermsLecturer,
  updateInternshipStatus,
  getSupervisedStudents,
  type InternshipTermWithStats,
} from "../../../../services/lecturerApi";
// import LecturerTermChartsPanel from "../../_components/LecturerTermOverviewPanel";

type SupervisedInternshipRow = {
  id: string | number;
  status?: "registered" | "in_progress" | "completed" | "dropped";
  progress_percent?: number | string | null;
  created_at?: string | null;

  students?: {
    student_code?: string | null;
    users?: {
      full_name?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
    classes?: { class_name?: string | null; name?: string | null } | null;
  } | null;

  internship_topics?: {
    id: string | number;
    title: string;
    company_name?: string | null;
    company_address?: string | null;
    max_students?: number | null;
    current_students?: number | null;
    status?: "available" | "full" | "closed";
  } | null;

  internship_terms?: {
    id: string | number;
    term_name?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  } | null;
};

type PaginationMeta = { total: number; page: number; limit: number };
type ListResponse<T> = { items: T[]; meta: PaginationMeta };

const topicStatusTag = (s?: "available" | "full" | "closed") => {
  if (s === "closed") return <Tag>Đóng</Tag>;
  if (s === "full") return <Tag color="red">Đã đủ</Tag>;
  return <Tag color="green">Còn trống</Tag>;
};

const internshipStatusTag = (s?: SupervisedInternshipRow["status"]) => {
  if (s === "completed") return <Tag color="green">Completed</Tag>;
  if (s === "in_progress") return <Tag color="blue">In progress</Tag>;
  if (s === "dropped") return <Tag color="red">Dropped</Tag>;
  return <Tag color="gold">Registered</Tag>;
};

function SlotPills(props: {
  max: number;
  internships: SupervisedInternshipRow[];
}) {
  const { max, internships } = props;

  const sorted = useMemo(() => {
    return [...internships].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return ta - tb;
    });
  }, [internships]);

  const slots = Array.from({ length: max }).map(
    (_, idx) => sorted[idx] ?? null
  );

  return (
    <div className="flex flex-col gap-1">
      {slots.map((it, idx) => {
        const name = it?.students?.users?.full_name ?? "Trống";
        const code = it?.students?.student_code ?? "";
        const short = it ? `${code || "SV"} · ${name}` : "Trống";

        return (
          <div
            key={idx}
            className={[
              "w-full px-2 py-1 rounded-lg text-xs border",
              it
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-500",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="shrink-0 font-medium">Slot {idx + 1}</span>
              <span className="truncate text-right">{short}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type TopicGroup = {
  key: string;
  topicId: string;
  topicTitle: string;
  companyName?: string | null;
  companyAddress?: string | null;
  termName?: string | null;
  termRange?: string;
  maxStudents: number;
  currentCount: number;
  topicStatus?: "available" | "full" | "closed";
  internships: SupervisedInternshipRow[];
};

function buildTopicGroups(
  rows: SupervisedInternshipRow[],
  q: string,
  selectedTermId: string | number | null
) {
  const search = q.trim().toLowerCase();

  // filter term (FE)
  const termFiltered = rows.filter((r) => {
    if (!selectedTermId) return true;
    const termId = r.internship_terms?.id;
    return termId != null && String(termId) === String(selectedTermId);
  });

  const map = new Map<string, TopicGroup>();

  for (const r of termFiltered) {
    const topic = r.internship_topics;
    if (!topic?.id) continue;

    const key = String(topic.id);
    const term = r.internship_terms;

    if (!map.has(key)) {
      const start = term?.start_date
        ? dayjs(term.start_date).format("DD/MM/YYYY")
        : "—";
      const end = term?.end_date
        ? dayjs(term.end_date).format("DD/MM/YYYY")
        : "—";

      map.set(key, {
        key,
        topicId: key,
        topicTitle: topic.title,
        companyName: topic.company_name ?? null,
        companyAddress: topic.company_address ?? null,
        termName: term?.term_name ?? null,
        termRange: `${start} - ${end}`,
        maxStudents: Number(topic.max_students ?? 3),
        currentCount: 0,
        topicStatus: topic.status,
        internships: [],
      });
    }

    map.get(key)!.internships.push(r);
  }

  let groups = Array.from(map.values()).map((g) => {
    const sorted = [...g.internships].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return ta - tb;
    });
    return { ...g, internships: sorted, currentCount: sorted.length };
  });

  // search theo topic + theo SV bên trong
  if (search) {
    groups = groups.filter((g) => {
      const topicText = [
        g.topicTitle,
        g.companyName,
        g.companyAddress,
        g.termName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (topicText.includes(search)) return true;

      return g.internships.some((r) => {
        const name = r.students?.users?.full_name ?? "";
        const code = r.students?.student_code ?? "";
        const email = r.students?.users?.email ?? "";
        const cls =
          r.students?.classes?.class_name ?? r.students?.classes?.name ?? "";
        return [name, code, email, cls]
          .join(" ")
          .toLowerCase()
          .includes(search);
      });
    });
  }

  // sort: đề tài còn trống lên trước, rồi đề tài nhiều SV hơn
  groups.sort((a, b) => {
    const aFull = a.currentCount >= a.maxStudents ? 1 : 0;
    const bFull = b.currentCount >= b.maxStudents ? 1 : 0;
    if (aFull !== bFull) return aFull - bFull;
    return b.currentCount - a.currentCount;
  });

  return groups;
}

function TopicsGroupedTable(props: {
  groups: TopicGroup[];
  loading: boolean;
  onUpdateStatus: (internship: SupervisedInternshipRow) => void;
}) {
  const { groups, loading, onUpdateStatus } = props;

  const columns: ColumnsType<TopicGroup> = useMemo(() => {
    return [
      {
        title: "Đề tài",
        width: "34%",
        ellipsis: true,
        render: (_, g) => (
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {g.topicTitle}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {g.companyName ?? "—"} · {g.companyAddress ?? "—"}
            </div>
          </div>
        ),
      },
      {
        title: "Kỳ",
        width: "22%",
        ellipsis: true,
        render: (_, g) => (
          <div className="min-w-0">
            <div className="font-medium text-slate-800 truncate">
              {g.termName ?? "—"}
            </div>
            <div className="text-xs text-slate-500 truncate">{g.termRange}</div>
          </div>
        ),
      },
      {
        title: "Slot",
        width: "30%",
        render: (_, g) => (
          <div className="flex flex-col gap-1">
            <SlotPills
              max={Math.min(g.maxStudents, 3)}
              internships={g.internships}
            />
          </div>
        ),
      },
      {
        title: "Tình trạng",
        width: "14%",
        render: (_, g) => (
          <div className="flex flex-col items-start gap-1">
            {topicStatusTag(g.topicStatus)}
            <span className="text-xs text-slate-600">
              <b>{g.currentCount}</b>/<b>{g.maxStudents}</b>
            </span>
          </div>
        ),
      },
    ];
  }, []);

  const expandedRowRender = (g: TopicGroup) => {
    const subCols: ColumnsType<SupervisedInternshipRow> = [
      { title: "#", width: 56, render: (_v, _r, idx) => idx + 1 },
      {
        title: "Sinh viên",
        width: "52%",
        ellipsis: true,
        render: (_, r) => {
          const st = r.students;
          const name = st?.users?.full_name ?? "—";
          const code = st?.student_code ?? "—";
          const cls = st?.classes?.class_name ?? st?.classes?.name ?? "—";
          const email = st?.users?.email ?? "—";
          return (
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">{name}</div>
              <div className="text-xs text-slate-500 truncate">
                Mã: <b>{code}</b> · Lớp: <b>{cls}</b> · {email}
              </div>
            </div>
          );
        },
      },
      {
        title: "Trạng thái",
        width: "18%",
        render: (_, r) => internshipStatusTag(r.status),
      },
      {
        title: "Tiến độ",
        width: "12%",
        render: (_, r) => (
          <span className="text-slate-700">
            {r.progress_percent != null
              ? `${Number(r.progress_percent)}%`
              : "—"}
          </span>
        ),
      },
      {
        title: "",
        width: "18%",
        render: (_, r) => (
          <div className="flex justify-end">
            <Button
              size="small"
              type="primary"
              onClick={() => onUpdateStatus(r)}
            >
              Cập nhật
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="bg-slate-50 rounded-xl p-3">
        <Table
          rowKey={(r) => String(r.id)}
          columns={subCols}
          dataSource={g.internships}
          pagination={false}
          size="small"
          tableLayout="fixed"
        />
      </div>
    );
  };

  return (
    <Table
      rowKey={(g) => g.key}
      loading={loading}
      columns={columns}
      dataSource={groups}
      pagination={false}
      size="middle"
      tableLayout="fixed"
      expandable={{ expandedRowRender }}
      locale={{
        emptyText: (
          <Empty description="Chưa có sinh viên phụ trách cho các đề tài." />
        ),
      }}
    />
  );
}

// ============================
// Page
// ============================
const isActiveTerm = (t: InternshipTermWithStats) => {
  const now = dayjs();
  const start = dayjs(t.start_date);
  const end = dayjs(t.end_date);
  return !now.isBefore(start, "day") && !now.isAfter(end, "day");
};

export function LecturerSupervisedStudentsPage() {
  const { message } = App.useApp();
  // TERMS
  const [terms, setTerms] = useState<InternshipTermWithStats[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [selectedTerm, setSelectedTerm] =
    useState<InternshipTermWithStats | null>(null);

  // DATA (internships list from lecturer)
  const [rows, setRows] = useState<SupervisedInternshipRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // FILTER
  const [q, setQ] = useState("");

  // STATUS MODAL
  const [openStatus, setOpenStatus] = useState(false);
  const [activeRow, setActiveRow] = useState<SupervisedInternshipRow | null>(
    null
  );
  const [nextStatus, setNextStatus] =
    useState<SupervisedInternshipRow["status"]>("registered");
  const [updating, setUpdating] = useState(false);

  const loadTerms = async () => {
    setLoadingTerms(true);
    try {
      const res = await getInternshipTermsLecturer({ page: 1, limit: 50 });
      setTerms(res.items);
      const active = res.items.find(isActiveTerm);
      setSelectedTerm(active ?? res.items[0] ?? null);
    } catch {
      message.error("Không tải được danh sách kỳ thực tập");
    } finally {
      setLoadingTerms(false);
    }
  };

  const loadStudents = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res: ListResponse<SupervisedInternshipRow> =
        await getSupervisedStudents({ page: p, limit: l });
      setRows(res.items ?? []);
      setPage(res.meta?.page ?? p);
      setLimit(res.meta?.limit ?? l);
      setTotal(res.meta?.total ?? 0);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
          "Không tải được danh sách sinh viên phụ trách"
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
    loadStudents(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search (FE)
  useEffect(() => {
    const t = setTimeout(() => {
      // vì backend chưa có q/term filter => mình chỉ filter FE,
      // không cần call lại API (tránh spam)
    }, 250);
    return () => clearTimeout(t);
  }, [q, selectedTerm?.id]);

  const selectedTermLabel = useMemo(() => {
    if (!selectedTerm) return "—";
    return `${selectedTerm.term_name} (${dayjs(selectedTerm.start_date).format(
      "DD/MM/YYYY"
    )} - ${dayjs(selectedTerm.end_date).format("DD/MM/YYYY")})`;
  }, [selectedTerm]);

  const groups = useMemo(() => {
    return buildTopicGroups(rows, q, selectedTerm?.id ?? null);
  }, [rows, q, selectedTerm?.id]);

  const openUpdateModal = (r: SupervisedInternshipRow) => {
    setActiveRow(r);
    setNextStatus((r.status ?? "registered") as any);
    setOpenStatus(true);
  };

  const handleUpdateStatus = async () => {
    if (!activeRow) return;
    try {
      setUpdating(true);
      await updateInternshipStatus(activeRow.id, nextStatus!);
      message.success("Cập nhật trạng thái thành công");

      // update local rows
      setRows((prev) =>
        prev.map((x) =>
          String(x.id) === String(activeRow.id)
            ? { ...x, status: nextStatus }
            : x
        )
      );
      setOpenStatus(false);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <div className="text-xl font-semibold text-slate-900">
          Sinh viên phụ trách
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-4">
          <TermSidebar
            loading={loadingTerms}
            terms={terms}
            selectedTermId={selectedTerm?.id ?? null}
            onSelect={setSelectedTerm}
            onReload={loadTerms}
          />
        </div>
        {/* <div className="lg:col-span-8 flex flex-col gap-4">
          <LecturerTermChartsPanel
            terms={terms}
            selectedTermId={selectedTerm?.id ?? null}
            onReload={loadTerms}
          />
        </div> */}

        {/* RIGHT */}
        <div className="lg:col-span-12 flex flex-col gap-4">
          {/* Filters */}
          <Card
            className="shadow-sm border border-slate-100"
            styles={{ body: { padding: 12 } }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm">
                <div className="text-slate-500">Kỳ đang chọn</div>
                <div className="font-semibold text-slate-900">
                  {selectedTermLabel}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo đề tài / công ty / SV / mã SV / email..."
                  allowClear
                  style={{ width: 360, maxWidth: "100%" }}
                />
                <Button onClick={() => loadStudents(page, limit)}>
                  Reload
                </Button>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card
            className="shadow-sm border border-slate-100"
            styles={{ body: { padding: 12 } }}
          >
            <TopicsGroupedTable
              groups={groups}
              loading={loading}
              onUpdateStatus={openUpdateModal}
            />

            {/* Pagination - theo backend internships */}
            <div className="flex justify-end mt-4">
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger
                pageSizeOptions={[5, 10, 20, 50]}
                onChange={(p, ps) => {
                  setPage(p);
                  setLimit(ps);
                  loadStudents(p, ps);
                }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Update status modal */}
      <Modal
        open={openStatus}
        onCancel={() => setOpenStatus(false)}
        onOk={handleUpdateStatus}
        confirmLoading={updating}
        okText="Lưu"
        cancelText="Hủy"
        title="Cập nhật trạng thái internship"
        destroyOnHidden
      >
        <div className="text-sm text-slate-600 mb-2">
          Sinh viên:{" "}
          <b className="text-slate-900">
            {activeRow?.students?.users?.full_name ?? "—"}
          </b>{" "}
          · Mã SV: <b>{activeRow?.students?.student_code ?? "—"}</b>
        </div>

        <div className="text-sm text-slate-600 mb-2">
          Đề tài:{" "}
          <b className="text-slate-900">
            {activeRow?.internship_topics?.title ?? "—"}
          </b>
        </div>

        <div className="mt-3">
          <div className="text-sm text-slate-600 mb-1">Trạng thái</div>
          <Select
            value={nextStatus}
            onChange={(v) => setNextStatus(v as any)}
            className="w-full"
            options={[
              { value: "registered", label: "Registered" },
              { value: "in_progress", label: "In progress" },
              { value: "completed", label: "Completed" },
              { value: "dropped", label: "Dropped" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
