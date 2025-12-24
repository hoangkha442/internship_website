import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import type { StudentItem } from "./TopicList";
import type { Worklog } from "../../../services/worklogApi";

const { RangePicker } = DatePicker;

type ReviewFilter = "all" | "pending" | "reviewed" | "has_feedback" | "has_score";
type FileFilter = "all" | "has" | "none";
type FileTypeFilter = "all" | "image" | "pdf" | "other";
type ScoreFilter = "all" | "has" | "none";

type SortFilter =
  | "work_date_desc"
  | "work_date_asc"
  | "created_desc"
  | "created_asc"
  | "score_desc"
  | "score_asc"
  | "files_desc"
  | "files_asc";

type Props = {
  student: StudentItem;
  loading: boolean;
  allWorklogs: Worklog[];
  onOpenReview: (w: Worklog) => void;
};

const isReviewed = (w: Worklog) => (w.score != null) || (w.feedback && String(w.feedback).trim());
const hasFeedback = (w: Worklog) => !!(w.feedback && String(w.feedback).trim());
const hasScore = (w: Worklog) => w.score != null;

const attachmentCount = (w: Worklog) => w.work_log_attachments?.length ?? 0;

const guessFileType = (url: string) => {
  const u = url.toLowerCase();
  if (/\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(u)) return "image";
  if (/\.(pdf)(\?|$)/i.test(u)) return "pdf";
  return "other";
};

export default function WorklogPanel({ student, loading, allWorklogs, onOpenReview }: Props) {
  // client pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // filters
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [review, setReview] = useState<ReviewFilter>("all");

  const [hasFile, setHasFile] = useState<FileFilter>("all");
  const [fileType, setFileType] = useState<FileTypeFilter>("all");
  const [minFiles, setMinFiles] = useState<number | null>(null);

  const [scoreState, setScoreState] = useState<ScoreFilter>("all");
  const [minScore, setMinScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);

  const [sort, setSort] = useState<SortFilter>("work_date_desc");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  // reset when student changes
  useEffect(() => {
    setPage(1);
    setPageSize(10);

    setQ("");
    setQDebounced("");
    setDateRange(null);

    setReview("all");
    setHasFile("all");
    setFileType("all");
    setMinFiles(null);

    setScoreState("all");
    setMinScore(null);
    setMaxScore(null);

    setSort("work_date_desc");
  }, [student.internshipId]);

  const resetFilters = () => {
    setPage(1);
    setQ("");
    setQDebounced("");
    setDateRange(null);

    setReview("all");
    setHasFile("all");
    setFileType("all");
    setMinFiles(null);

    setScoreState("all");
    setMinScore(null);
    setMaxScore(null);

    setSort("work_date_desc");
  };

  const filtered = useMemo(() => {
    let arr = [...allWorklogs];

    // search in content + feedback + attachment description/public_id
    if (qDebounced) {
      const key = qDebounced.toLowerCase();
      arr = arr.filter((w) => {
        const c = (w.content || "").toLowerCase();
        const f = (w.feedback || "").toLowerCase();
        const att = (w.work_log_attachments ?? [])
          .map((a: any) => `${a.description ?? ""} ${a.public_id ?? ""} ${a.file_path ?? ""}`.toLowerCase())
          .join(" ");
        return c.includes(key) || f.includes(key) || att.includes(key);
      });
    }

    // date range (inclusive) by work_date
    if (dateRange?.[0] && dateRange?.[1]) {
      const from = dayjs(dateRange[0]).startOf("day");
      const to = dayjs(dateRange[1]).endOf("day");
      arr = arr.filter((w) => {
        const d = dayjs(w.work_date);
        return d.isSame(from) || d.isSame(to) || (d.isAfter(from) && d.isBefore(to));
      });
    }

    // review status
    if (review !== "all") {
      arr = arr.filter((w) => {
        if (review === "pending") return !isReviewed(w);
        if (review === "reviewed") return isReviewed(w);
        if (review === "has_feedback") return hasFeedback(w);
        if (review === "has_score") return hasScore(w);
        return true;
      });
    }

    // has file
    if (hasFile !== "all") {
      arr = arr.filter((w) => {
        const n = attachmentCount(w);
        return hasFile === "has" ? n > 0 : n === 0;
      });
    }

    // min files
    if (minFiles != null) {
      arr = arr.filter((w) => attachmentCount(w) >= minFiles);
    }

    // file type filter (if has attachments)
    if (fileType !== "all") {
      arr = arr.filter((w) => {
        const atts = w.work_log_attachments ?? [];
        if (atts.length === 0) return false;
        return atts.some((a: any) => {
          const url = String(a.file_path || "");
          return guessFileType(url) === fileType;
        });
      });
    }

    // score exists
    if (scoreState !== "all") {
      arr = arr.filter((w) => (scoreState === "has" ? w.score != null : w.score == null));
    }

    // score range (only apply to items that have score; items without score => excluded)
    if (minScore != null) arr = arr.filter((w) => w.score != null && w.score >= minScore);
    if (maxScore != null) arr = arr.filter((w) => w.score != null && w.score <= maxScore);

    // sort
    arr.sort((a, b) => {
      const aWork = dayjs(a.work_date).valueOf();
      const bWork = dayjs(b.work_date).valueOf();
      const aCreated = dayjs(a.created_at || a.work_date).valueOf();
      const bCreated = dayjs(b.created_at || b.work_date).valueOf();
      const aScore = a.score ?? -1;
      const bScore = b.score ?? -1;
      const aFiles = attachmentCount(a);
      const bFiles = attachmentCount(b);

      switch (sort) {
        case "work_date_asc":
          return aWork - bWork;
        case "work_date_desc":
          return bWork - aWork;
        case "created_asc":
          return aCreated - bCreated;
        case "created_desc":
          return bCreated - aCreated;
        case "score_asc":
          return aScore - bScore;
        case "score_desc":
          return bScore - aScore;
        case "files_asc":
          return aFiles - bFiles;
        case "files_desc":
          return bFiles - aFiles;
        default:
          return bWork - aWork;
      }
    });

    return arr;
  }, [
    allWorklogs,
    qDebounced,
    dateRange,
    review,
    hasFile,
    fileType,
    minFiles,
    scoreState,
    minScore,
    maxScore,
    sort,
  ]);

  const total = filtered.length;

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // keep page valid
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) setPage(1);
  }, [total, pageSize]); // eslint-disable-line

  const reviewedCount = useMemo(() => filtered.filter(isReviewed).length, [filtered]);
  const pendingCount = total - reviewedCount;

  const columns: ColumnsType<Worklog> = useMemo(() => {
    return [
      {
        title: "Ngày",
        dataIndex: "work_date",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Nội dung",
        dataIndex: "content",
        ellipsis: true,
      },
      {
        title: "File",
        render: (_, r) => <Tag>{attachmentCount(r)}</Tag>,
      },
      {
        title: "Trạng thái",
        render: (_, r) => (isReviewed(r) ? <Tag color="green">Đã phản hồi</Tag> : <Tag color="gold">Chờ phản hồi</Tag>),
      },
      {
        title: "Điểm",
        dataIndex: "score",
        render: (v) => (v == null ? "—" : v),
      },
      {
        title: "Feedback",
        dataIndex: "feedback",
        ellipsis: true,
        render: (v) => (v && String(v).trim() ? String(v) : "—"),
      },
      {
        title: "",
        fixed: "right",
        render: (_, r) => (
          <div className="flex">
            <Button size="small" type="primary" onClick={() => onOpenReview(r)}>
              Review
            </Button>
          </div>
        ),
      },
    ];
  }, [onOpenReview]);

  return (
    <div className="flex flex-col gap-3">
      {/* header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm text-slate-500">Sinh viên</div>
            <div className="text-base font-semibold text-slate-900 truncate">
              {student.fullName} — <span className="text-slate-600">{student.studentCode}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Lớp: {student.className}</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Tag color="blue">Tổng: {allWorklogs.length}</Tag>
            <Tag color="purple">Sau lọc: {total}</Tag>
            <Tag color="green">Đã phản hồi: {reviewedCount}</Tag>
            <Tag color="gold">Chờ phản hồi: {pendingCount}</Tag>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          {/* row 1 */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-2">
            <Input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Tìm (nội dung / feedback / tên file)..."
              allowClear
              className="xl:w-[360px]"
            />

            <RangePicker
              value={dateRange as any}
              onChange={(v) => {
                setPage(1);
                setDateRange(v as any);
              }}
              format="DD/MM/YYYY"
              className="xl:w-[340px]"
              allowClear
            />

            <Select
              value={review}
              onChange={(v) => {
                setPage(1);
                setReview(v);
              }}
              className="xl:w-[220px]"
              options={[
                { value: "all", label: "Trạng thái: Tất cả" },
                { value: "pending", label: "Trạng thái: Chờ phản hồi" },
                { value: "reviewed", label: "Trạng thái: Đã phản hồi" },
                { value: "has_feedback", label: "Trạng thái: Có feedback" },
                { value: "has_score", label: "Trạng thái: Có điểm" },
              ]}
            />

            <Select
              value={hasFile}
              onChange={(v) => {
                setPage(1);
                setHasFile(v);
              }}
              className="xl:w-[180px]"
              options={[
                { value: "all", label: "File: Tất cả" },
                { value: "has", label: "File: Có file" },
                { value: "none", label: "File: Không file" },
              ]}
            />
          </div>

          {/* row 2 */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
            <Space wrap>
              <Select
                value={fileType}
                onChange={(v) => {
                  setPage(1);
                  setFileType(v);
                }}
                className="w-[200px]"
                options={[
                  { value: "all", label: "Loại file: Tất cả" },
                  { value: "image", label: "Loại file: Ảnh" },
                  { value: "pdf", label: "Loại file: PDF" },
                  { value: "other", label: "Loại file: Khác" },
                ]}
              />

              <InputNumber
                value={minFiles}
                onChange={(v) => {
                  setPage(1);
                  setMinFiles(v == null ? null : Number(v));
                }}
                min={0}
                step={1}
                placeholder="Min số file"
              />

              <Select
                value={scoreState}
                onChange={(v) => {
                  setPage(1);
                  setScoreState(v);
                }}
                className="w-[170px]"
                options={[
                  { value: "all", label: "Điểm: Tất cả" },
                  { value: "has", label: "Điểm: Có điểm" },
                  { value: "none", label: "Điểm: Chưa chấm" },
                ]}
              />

              <InputNumber
                value={minScore}
                onChange={(v) => {
                  setPage(1);
                  setMinScore(v == null ? null : Number(v));
                }}
                min={0}
                max={10}
                step={0.5}
                placeholder="Min điểm"
              />

              <InputNumber
                value={maxScore}
                onChange={(v) => {
                  setPage(1);
                  setMaxScore(v == null ? null : Number(v));
                }}
                min={0}
                max={10}
                step={0.5}
                placeholder="Max điểm"
              />

              <Select
                value={sort}
                onChange={(v) => setSort(v)}
                className="w-[260px]"
                options={[
                  { value: "work_date_desc", label: "Sort: Ngày làm (mới → cũ)" },
                  { value: "work_date_asc", label: "Sort: Ngày làm (cũ → mới)" },
                  { value: "created_desc", label: "Sort: Ngày tạo (mới → cũ)" },
                  { value: "created_asc", label: "Sort: Ngày tạo (cũ → mới)" },
                  { value: "score_desc", label: "Sort: Điểm (cao → thấp)" },
                  { value: "score_asc", label: "Sort: Điểm (thấp → cao)" },
                  { value: "files_desc", label: "Sort: Số file (nhiều → ít)" },
                  { value: "files_asc", label: "Sort: Số file (ít → nhiều)" },
                ]}
              />

              <Button
                onClick={() => {
                  setPage(1);
                  setReview("pending");
                }}
              >
                Chỉ chờ phản hồi
              </Button>

              <Button
                onClick={() => {
                  setPage(1);
                  setHasFile("has");
                }}
              >
                Chỉ có file
              </Button>

              <Tooltip title="Reset tất cả bộ lọc">
                <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                  Reset
                </Button>
              </Tooltip>
            </Space>

            <div className="text-xs text-slate-500">
              Hiển thị: <b>{paged.length}</b> / {total}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table<Worklog>
        rowKey={(r) => String(r.id)}
        loading={loading}
        columns={columns}
        dataSource={paged}
        pagination={false}
        tableLayout="fixed"
        scroll={{ x: 1200 }}
      />

      {/* CLIENT PAGINATION */}
      <div className="flex justify-end mt-2">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50, 100]}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
        />
      </div>
    </div>
  );
}
