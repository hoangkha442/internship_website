import { App, Button, Card, Empty, Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getLecturerReports,
  reviewReport,
  type ProgressReport,
  type ReviewReportPayload,
} from "../../../../services/reportApi";

import LecturerReportFiltersBar, {
  type FileFilter,
  type PassFilter,
  type SortFilter,
  type StatusFilter,
} from "./_components/LecturerReportFiltersBar";

import LecturerReportViewModal from "./_components/LecturerReportViewModal";
import LecturerReportReviewDrawer from "./_components/LecturerReportReviewDrawer";

/**
 * ⚠️ API hiện tại: getLecturerReports(internshipId, page, limit)
 * => nếu bạn muốn "toàn bộ sinh viên phụ trách" thì backend nên có endpoint list internships của lecturer.
 * Tạm thời page này dùng internshipId hard-code/nhập tay theo nhu cầu.
 */
export default function LecturerProgressReportsPage() {
  const { message } = App.useApp();

  // ===== chọn internship =====
  // 👉 Nếu bạn có API lấy danh sách internship của giảng viên, thay cái này bằng dropdown
  const [internshipId, setInternshipId] = useState<string | number | null>(null);

  // ===== filters =====
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pass, setPass] = useState<PassFilter>("all");
  const [hasFile, setHasFile] = useState<FileFilter>("all");
  const [sort, setSort] = useState<SortFilter>("submitted_desc");

  // ===== list =====
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProgressReport[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // ===== view modal =====
  const [openView, setOpenView] = useState(false);
  const [viewItem, setViewItem] = useState<ProgressReport | null>(null);

  // ===== review drawer =====
  const [openReview, setOpenReview] = useState(false);
  const [reviewItem, setReviewItem] = useState<ProgressReport | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const resetFilters = () => {
    setQ("");
    setDateRange(null);
    setStatus("all");
    setPass("all");
    setHasFile("all");
    setSort("submitted_desc");
  };

  const loadReports = useCallback(
    async (internId: string | number, p: number, l: number) => {
      setLoading(true);
      try {
        const res = await getLecturerReports(internId, { page: p, limit: l });
        setItems(res.items ?? []);
        setTotal(res.meta?.total ?? 0);
        setPage(p);
        setLimit(l);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Không tải được báo cáo");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  // 👉 DEMO: set internshipId bằng 1 giá trị có thật (bạn thay theo thực tế)
  useEffect(() => {
    // ví dụ: bạn có thể set từ query param, hoặc từ page trước (approvals)
    // setInternshipId(123);
  }, []);

  useEffect(() => {
    if (!internshipId) return;
    loadReports(internshipId, 1, limit);
  }, [internshipId, limit, loadReports]);

  const openViewModal = (r: ProgressReport) => {
    setViewItem(r);
    setOpenView(true);
  };

  const openReviewDrawer = (r: ProgressReport) => {
    setReviewItem(r);
    setOpenReview(true);
  };

  const closeReviewDrawer = () => {
    setOpenReview(false);
    setReviewItem(null);
  };

  const statusTag = (s?: string | null) => {
    if (s === "reviewed") return <Tag color="green">Đã duyệt</Tag>;
    if (s === "needs_revision") return <Tag color="red">Cần chỉnh sửa</Tag>;
    return <Tag color="gold">Đã nộp</Tag>;
  };

  const passTag = (r: ProgressReport) => {
    if (r.status !== "reviewed" || !r.reviewed_at) return <Tag color="gold">Chờ duyệt</Tag>;
    if (r.is_pass == null) return <Tag>Chưa kết luận</Tag>;
    return r.is_pass ? <Tag color="green">Pass</Tag> : <Tag color="red">Fail</Tag>;
  };

  // ===== apply filters client-side =====
  const filteredItems = useMemo(() => {
    let arr = [...items];

    // search in title + content + feedback (HTML)
    if (qDebounced) {
      const key = qDebounced.toLowerCase();
      arr = arr.filter((r) => {
        const t = (r.title || "").toLowerCase();
        const c = (r.content || "").toLowerCase();
        const f = (r.feedback || "").toLowerCase();
        return t.includes(key) || c.includes(key) || f.includes(key);
      });
    }

    // date range theo submitted_at
    if (dateRange?.[0] && dateRange?.[1]) {
      const from = dayjs(dateRange[0]).startOf("day");
      const to = dayjs(dateRange[1]).endOf("day");
      arr = arr.filter((r) => {
        const d = r.submitted_at ? dayjs(r.submitted_at) : null;
        if (!d) return false;
        return !d.isBefore(from) && !d.isAfter(to); // ✅ không cần isBetween plugin
      });
    }

    // status
    if (status !== "all") {
      arr = arr.filter((r) => (r.status ?? "submitted") === status);
    }

    // pass
    if (pass !== "all") {
      arr = arr.filter((r) => {
        const isPending = r.status !== "reviewed" || !r.reviewed_at || r.is_pass == null;
        if (pass === "pending") return isPending;
        if (pass === "pass") return r.status === "reviewed" && r.is_pass === true;
        return r.status === "reviewed" && r.is_pass === false;
      });
    }

    // hasFile
    if (hasFile !== "all") {
      arr = arr.filter((r) => {
        const n = r.report_attachments?.length ?? 0;
        return hasFile === "has" ? n > 0 : n === 0;
      });
    }

    // sort
    arr.sort((a, b) => {
      const aSub = dayjs(a.submitted_at || 0).valueOf();
      const bSub = dayjs(b.submitted_at || 0).valueOf();
      const aWeek = Number(a.week_no ?? 0);
      const bWeek = Number(b.week_no ?? 0);

      switch (sort) {
        case "submitted_asc":
          return aSub - bSub;
        case "submitted_desc":
          return bSub - aSub;
        case "week_asc":
          return aWeek - bWeek;
        case "week_desc":
        default:
          return bWeek - aWeek;
      }
    });

    return arr;
  }, [items, qDebounced, dateRange, status, pass, hasFile, sort]);

  const handleReviewSubmit = async (payload: ReviewReportPayload) => {
    if (!reviewItem || !internshipId) return;

    try {
      setActionLoading(true);

      const res = await reviewReport(reviewItem.id, payload);

      // ✅ update local list ngay
      setItems((prev) =>
        prev.map((x) => (String(x.id) === String(reviewItem.id) ? res.report : x))
      );

      message.success("Đã duyệt báo cáo");
      closeReviewDrawer();

      // ✅ sync lại từ server cho chắc
      await loadReports(internshipId, page, limit);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<ProgressReport> = [
    {
      title: "Report",
      render: (_, r) => <Tag>#{r.report_no ?? "-"}</Tag>,
      width: 90,
    },
    {
      title: "Week",
      render: (_, r) => <Tag>{r.week_no ?? "-"}</Tag>,
      width: 90,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      render: (_, r) => statusTag(r.status),
      width: 130,
    },
    {
      title: "Pass",
      render: (_, r) => passTag(r),
      width: 120,
    },
    {
      title: "Nộp lúc",
      render: (_, r) => (r.submitted_at ? dayjs(r.submitted_at).format("DD/MM/YYYY HH:mm") : "-"),
      width: 170,
    },
    {
      title: "File",
      render: (_, r) => <Tag>{r.report_attachments?.length ?? 0}</Tag>,
      width: 80,
    },
    {
      title: "",
      width: 210,
      render: (_, r) => (
        <div className="flex justify-end gap-2">
          <Button size="small" onClick={() => openViewModal(r)}>
            Xem
          </Button>
          <Button size="small" type="primary" onClick={() => openReviewDrawer(r)}>
            Duyệt
          </Button>
        </div>
      ),
    },
  ];

  // ===== UI chọn internship =====
  // Nếu bạn chưa có dropdown internship, tạm thời nhập tay:
  if (!internshipId) {
    return (
      <div className="p-6">
        <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 16 } }}>
          <div className="text-xl font-semibold text-slate-900">Đánh giá báo cáo</div>
          <div className="text-slate-500 mt-1">
            Chưa chọn internship_id. (Bạn set từ page “Sinh viên phụ trách” hoặc query param).
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => setInternshipId(1)}>Dùng internship_id=1 (demo)</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xl font-semibold text-slate-900">Đánh giá báo cáo</div>
            <div className="text-sm text-slate-500">
              Duyệt đề cương / báo cáo / final, chấm điểm và phản hồi.
            </div>
          </div>
          <Button onClick={() => loadReports(internshipId, page, limit)} loading={loading}>
            Reload
          </Button>
        </div>

        <LecturerReportFiltersBar
          q={q}
          setQ={setQ}
          dateRange={dateRange}
          setDateRange={setDateRange}
          status={status}
          setStatus={setStatus}
          pass={pass}
          setPass={setPass}
          hasFile={hasFile}
          setHasFile={setHasFile}
          sort={sort}
          setSort={setSort}
          onReset={resetFilters}
          visibleCount={filteredItems.length}
          total={total}
        />

        {!loading && items.length === 0 ? (
          <Empty description="Chưa có báo cáo nào." />
        ) : (
          <>
            <Table
              rowKey={(r) => String(r.id)}
              loading={loading}
              columns={columns}
              dataSource={filteredItems}
              pagination={false}
              tableLayout="fixed"
            />

            <div className="flex justify-end mt-4">
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger
                pageSizeOptions={[5, 10, 20, 50]}
                onChange={(p, ps) => loadReports(internshipId, p, ps)}
              />
            </div>
          </>
        )}
      </Card>

      <LecturerReportViewModal open={openView} item={viewItem} onClose={() => setOpenView(false)} />

      <LecturerReportReviewDrawer
        open={openReview}
        onClose={closeReviewDrawer}
        loading={actionLoading}
        initial={reviewItem}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
