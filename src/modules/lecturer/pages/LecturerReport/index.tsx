import { App, Button, Card, Empty, Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getLecturerReports,
  getLecturerSupervisedStudents,
  reviewReport,
  type GetReportsParams,
  type LecturerSupervisedItem,
  type ProgressReport,
} from "../../../../services/reportApi";

import LecturerReportFiltersBar, {
  type FileFilter,
  type SortFilter,
  type StatusFilter,
} from "./_components/LecturerReportFiltersBar";

import LecturerReportViewModal from "./_components/LecturerReportViewModal";
import LecturerReportReviewDrawer from "./_components/LecturerReportReviewDrawer";
import InternshipPicker from "./_components/InternshipPicker";

const statusTag = (s?: string | null) => {
  if (s === "reviewed") return <Tag color="green">Đã duyệt</Tag>;
  if (s === "needs_revision") return <Tag color="red">Cần chỉnh sửa</Tag>;
  return <Tag color="gold">Đã nộp</Tag>;
};

const passTag = (r: ProgressReport) => {
  if (r.status !== "reviewed" || !r.reviewed_at)
    return <Tag color="gold">Chờ duyệt</Tag>;
  if (r.is_pass == null) return <Tag>Chưa kết luận</Tag>;
  return r.is_pass ? (
    <Tag color="green">Pass</Tag>
  ) : (
    <Tag color="red">Fail</Tag>
  );
};

export default function LecturerProgressReportsPage() {
  const { message } = App.useApp();

  // ===== internships supervised (REAL) =====
  const [internships, setInternships] = useState<LecturerSupervisedItem[]>([]);
  console.log("internships: ", internships);
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [internshipId, setInternshipId] = useState<string | number | null>(
    null
  );

  // ===== filters =====
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [hasFile, setHasFile] = useState<FileFilter>("all");
  const [sort, setSort] = useState<SortFilter>("submitted_desc");

  // ===== list state =====
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProgressReport[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // ===== view/review =====
  const [openView, setOpenView] = useState(false);
  const [viewItem, setViewItem] = useState<ProgressReport | null>(null);

  const [openReview, setOpenReview] = useState(false);
  const [reviewItem, setReviewItem] = useState<ProgressReport | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const resetFilters = () => {
    setQ("");
    setDateRange(null);
    setStatus("all");
    setHasFile("all");
    setSort("submitted_desc");
  };

  const loadInternships = useCallback(async () => {
    setLoadingInternships(true);
    try {
      const data = await getLecturerSupervisedStudents();
      setInternships(data ?? []);

      if (!internshipId && data?.length) {
        setInternshipId(data[0].internship_id); 
      }
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Không lấy được internship phụ trách"
      );
      setInternships([]);
      setInternshipId(null);
    } finally {
      setLoadingInternships(false);
    }
  }, [message, internshipId]);

  const loadReports = useCallback(
    async (internId: string | number, p: number, l: number) => {
      setLoading(true);
      try {
        const from = dateRange?.[0]
          ? dayjs(dateRange[0]).startOf("day").toISOString()
          : undefined;
        const to = dateRange?.[1]
          ? dayjs(dateRange[1]).endOf("day").toISOString()
          : undefined;

        const params: GetReportsParams = {
          page: p,
          limit: l,
          q: qDebounced || undefined,
          from,
          to,
          status,
          hasFile,
          sort,
        };

        // ✅ signature đúng: (internshipId, params)
        const res = await getLecturerReports(internId, params);

        setItems(res.items ?? []);
        setTotal(res.meta?.total ?? 0);
        setPage(p);
        setLimit(l);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Không tải được báo cáo");
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [message, dateRange, qDebounced, status, hasFile, sort]
  );

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  useEffect(() => {
    if (!internshipId) return;
    loadReports(internshipId, 1, limit);
  }, [internshipId, limit, loadReports]);

  const filteredItems = useMemo(() => {
    // ✅ Nếu backend đã filter thì có thể return items luôn.
    // Mình vẫn giữ fallback lọc nhẹ để an toàn.
    let arr = [...items];

    if (qDebounced) {
      const key = qDebounced.toLowerCase();
      arr = arr.filter((r) => {
        const t = (r.title || "").toLowerCase();
        const c = (r.content || "").toLowerCase();
        const f = (r.feedback || "").toLowerCase();
        return t.includes(key) || c.includes(key) || f.includes(key);
      });
    }

    if (dateRange?.[0] && dateRange?.[1]) {
      const from = dayjs(dateRange[0]).startOf("day").valueOf();
      const to = dayjs(dateRange[1]).endOf("day").valueOf();
      arr = arr.filter((r) => {
        const v = r.submitted_at ? dayjs(r.submitted_at).valueOf() : 0;
        return v >= from && v <= to;
      });
    }

    if (status !== "all") arr = arr.filter((r) => r.status === status);

    if (hasFile !== "all") {
      arr = arr.filter((r) => {
        const n = r.report_attachments?.length ?? 0;
        return hasFile === "has" ? n > 0 : n === 0;
      });
    }

    arr.sort((a, b) => {
      const aSub = dayjs(a.submitted_at || 0).valueOf();
      const bSub = dayjs(b.submitted_at || 0).valueOf();
      const aWeek = a.week_no ?? -1;
      const bWeek = b.week_no ?? -1;

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
  }, [items, qDebounced, dateRange, status, hasFile, sort]);

  const columns: ColumnsType<ProgressReport> = [
    {
      title: "Report",
      width: 90,
      render: (_, r) => <Tag>#{r.report_no ?? "-"}</Tag>,
    },
    {
      title: "Week",
      width: 90,
      render: (_, r) => <Tag>{r.week_no ?? "-"}</Tag>,
    },
    { title: "Tiêu đề", dataIndex: "title", ellipsis: true },
    { title: "Trạng thái", width: 130, render: (_, r) => statusTag(r.status) },
    { title: "Kết luận", width: 120, render: (_, r) => passTag(r) },
    {
      title: "Nộp lúc",
      width: 170,
      render: (_, r) =>
        r.submitted_at ? dayjs(r.submitted_at).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "File",
      width: 80,
      render: (_, r) => <Tag>{r.report_attachments?.length ?? 0}</Tag>,
    },
    {
      title: "",
      width: 220,
      render: (_, r) => (
        <div className="flex justify-end gap-2">
          <Button
            size="small"
            onClick={() => {
              setViewItem(r);
              setOpenView(true);
            }}
          >
            Xem
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setReviewItem(r);
              setOpenReview(true);
            }}
          >
            Duyệt
          </Button>
        </div>
      ),
    },
  ];

  const handleReviewSubmit = async (payload: any) => {
    if (!reviewItem || !internshipId) return;
    try {
      setActionLoading(true);
      await reviewReport(reviewItem.id, payload);
      message.success("Đã duyệt báo cáo");
      setOpenReview(false);
      setReviewItem(null);
      await loadReports(internshipId, page, limit);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card
        className="shadow-sm border border-slate-100"
        styles={{ body: { padding: 12 } }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xl font-semibold text-slate-900">
              Đánh giá báo cáo
            </div>
            <div className="text-sm text-slate-500">
              Chọn internship thật (sinh viên phụ trách) để xem & duyệt.
            </div>
          </div>

          <InternshipPicker
            loading={loadingInternships}
            items={internships}
            value={internshipId}
            onReload={loadInternships}
            onChange={(v) => {
              setInternshipId(v);
              setPage(1);
              if (v != null) loadReports(v, 1, limit); // ✅ load ngay internship đã chọn
            }}
          />
        </div>

        <LecturerReportFiltersBar
          q={q}
          setQ={setQ}
          dateRange={dateRange}
          setDateRange={setDateRange}
          status={status}
          setStatus={setStatus}
          hasFile={hasFile}
          setHasFile={setHasFile}
          sort={sort}
          setSort={setSort}
          onReset={resetFilters}
          visibleCount={filteredItems.length}
          total={total}
        />

        {!loading && filteredItems.length === 0 ? (
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
                onChange={(p, ps) =>
                  internshipId && loadReports(internshipId, p, ps)
                }
              />
            </div>
          </>
        )}
      </Card>

      <LecturerReportViewModal
        open={openView}
        item={viewItem}
        onClose={() => {
          setOpenView(false);
          setViewItem(null);
        }}
      />

      <LecturerReportReviewDrawer
        open={openReview}
        report={reviewItem}
        loading={actionLoading}
        onClose={() => {
          setOpenReview(false);
          setReviewItem(null);
        }}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
