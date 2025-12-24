
import { App, Button, Card, Empty, Pagination, Table, Tag, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createStudentWorklog,
  deleteStudentWorklog,
  getStudentWorklogs,
  updateStudentWorklog,
  type Worklog,
} from "../../../../services/worklogApi";
import { getMyInternship } from "../../../../services/studentApi";
import WorklogUpsertDrawer from "../../_components/WorklogUpsertDrawer";

import WorklogFiltersBar, {
  type ReviewFilter,
  type FileFilter,
  type SortFilter,
} from "../../_components/WorklogFiltersBar";
import WorklogViewModal from "../../_components/WorklogViewModal";

export default function StudentWorklogsPage() {
  const { message } = App.useApp();

  // ===== filters =====
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [review, setReview] = useState<ReviewFilter>("all");
  const [hasFile, setHasFile] = useState<FileFilter>("all");
  const [sort, setSort] = useState<SortFilter>("work_date_desc");

  // ===== base states =====
  const [internshipId, setInternshipId] = useState<string | number | null>(null);
  const [loadingInternship, setLoadingInternship] = useState(false);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Worklog[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // ===== modal view =====
  const [openView, setOpenView] = useState(false);
  const [viewItem, setViewItem] = useState<Worklog | null>(null);

  const openViewModal = (w: Worklog) => {
    setViewItem(w);
    setOpenView(true);
  };
  const closeViewModal = () => {
    setOpenView(false);
    setViewItem(null);
  };

  // ===== drawer upsert =====
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<Worklog | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const openCreate = () => {
    setDrawerMode("create");
    setActive(null);
    setOpenDrawer(true);
  };

  const openEdit = (w: Worklog) => {
    setDrawerMode("edit");
    setActive(w);
    setOpenDrawer(true);
  };

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  

  const resetFilters = () => {
    setQ("");
    setDateRange(null);
    setReview("all");
    setHasFile("all");
    setSort("work_date_desc");
  };

  const filteredItems = useMemo(() => {
  let arr = [...items];

  // search trong content + feedback
  if (qDebounced) {
    const key = qDebounced.toLowerCase();
    arr = arr.filter((w) => {
      const c = (w.content || "").toLowerCase();
      const f = (w.feedback || "").toLowerCase();
      return c.includes(key) || f.includes(key);
    });
  }

  // filter date range theo work_date
  if (dateRange?.[0] && dateRange?.[1]) {
    const from = dayjs(dateRange[0]).startOf("day");
    const to = dayjs(dateRange[1]).endOf("day");
    arr = arr.filter((w) => {
      const d = dayjs(w.work_date);
      return d.isAfter(from) && d.isBefore(to) || d.isSame(from) || d.isSame(to);
    });
  }

  // review filter dựa trên feedback (bạn đang ưu tiên feedback)
  if (review !== "all") {
    arr = arr.filter((w) => {
      const reviewed = !!(w.feedback && String(w.feedback).trim());
      return review === "reviewed" ? reviewed : !reviewed;
    });
  }

  // hasFile filter
  if (hasFile !== "all") {
    arr = arr.filter((w) => {
      const n = w.work_log_attachments?.length ?? 0;
      return hasFile === "has" ? n > 0 : n === 0;
    });
  }

  // sort
  arr.sort((a, b) => {
    const aWork = dayjs(a.work_date).valueOf();
    const bWork = dayjs(b.work_date).valueOf();
    const aCreated = dayjs(a.created_at || a.work_date).valueOf();
    const bCreated = dayjs(b.created_at || b.work_date).valueOf();

    switch (sort) {
      case "work_date_asc":
        return aWork - bWork;
      case "work_date_desc":
        return bWork - aWork;
      case "created_asc":
        return aCreated - bCreated;
      case "created_desc":
      default:
        return bCreated - aCreated;
    }
  });

  return arr;
}, [items, qDebounced, dateRange, review, hasFile, sort]);

  const loadInternship = useCallback(async () => {
    setLoadingInternship(true);
    try {
      const data = await getMyInternship();
      setInternshipId(data?.id ?? null);
    } catch (err: any) {
      setInternshipId(null);
      message.error(err?.response?.data?.message || "Không lấy được internship");
    } finally {
      setLoadingInternship(false);
    }
  }, [message]);

  const loadWorklogs = useCallback(
    async (internId: string | number, p: number, l: number) => {
      setLoading(true);
      try {
        const from = dateRange?.[0]
          ? dayjs(dateRange[0]).startOf("day").toISOString()
          : undefined;
        const to = dateRange?.[1]
          ? dayjs(dateRange[1]).endOf("day").toISOString()
          : undefined;

        const res = await getStudentWorklogs(internId, {
          page: p,
          limit: l,
          q: qDebounced || undefined,
          from,
          to,
          review,
          hasFile,
          sort,
        });

        setItems(res.items ?? []);
        setTotal(res.meta?.total ?? 0);
        setPage(p);
        setLimit(l);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Không tải được worklog");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [message, qDebounced, dateRange, review, hasFile, sort]
  );

  useEffect(() => {
    loadInternship();
  }, [loadInternship]);

  useEffect(() => {
    if (!internshipId) return;
    loadWorklogs(internshipId, 1, limit);
  }, [internshipId, limit, loadWorklogs]);

  const handleSubmit = async (args: { work_date: string; content: string; files: File[] }) => {
    if (!internshipId) return;
    try {
      setActionLoading(true);

      if (drawerMode === "create") {
        await createStudentWorklog(
          { internship_id: internshipId, work_date: args.work_date, content: args.content },
          args.files
        );
        message.success("Tạo worklog thành công");
        await loadWorklogs(internshipId, 1, limit);
      } else {
        if (!active) return;
        await updateStudentWorklog(
          active.id,
          { work_date: args.work_date, content: args.content },
          args.files
        );
        message.success("Cập nhật worklog thành công");
        await loadWorklogs(internshipId, page, limit);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (w: Worklog) => {
    Modal.confirm({
      title: "Xoá worklog?",
      content: "Worklog đã xoá sẽ không thể khôi phục.",
      okText: "Xoá",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setActionLoading(true);
          await deleteStudentWorklog(w.id);
          message.success("Đã xoá worklog");
          if (internshipId) await loadWorklogs(internshipId, 1, limit);
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Không thể xoá");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // ===== table columns (ẩn điểm, ưu tiên feedback + modal) =====
  const columns: ColumnsType<Worklog> = useMemo(() => {
    return [
      {
        title: "Ngày",
        dataIndex: "work_date",
        render: (v) => dayjs(v).format("DD/MM/YYYY"),
      },
      {
        title: "Nội dung",
        dataIndex: "content",
        ellipsis: true,
      },
      {
        title: "File",
        render: (_, r) => <Tag>{r.work_log_attachments?.length ?? 0}</Tag>,
      },
      {
        title: "Feedback",
        width: 130,
        render: (_, r) => {
          const reviewed = r.feedback && String(r.feedback).trim();
          return reviewed ? (
            <Tag color="green">Đã phản hồi</Tag>
          ) : (
            <Tag color="gold">Chờ phản hồi</Tag>
          );
        },
      },
      {
        title: "",
        render: (_, r) => (
          <div className="flex justify-end gap-2">
            <Button size="small" onClick={() => openViewModal(r)}>
              Xem
            </Button>
            <Button size="small" onClick={() => openEdit(r)}>
              Sửa
            </Button>
            <Button
              size="small"
              danger
              onClick={() => handleDelete(r)}
              loading={actionLoading}
            >
              Xoá
            </Button>
          </div>
        ),
      },
    ];
  }, [actionLoading]);

  if (loadingInternship) {
    return (
      <div className="p-6">
        <Card loading className="shadow-sm border border-slate-100" />
      </div>
    );
  }

  if (!internshipId) {
    return (
      <div className="p-6">
        <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 16 } }}>
          <div className="text-lg font-semibold text-slate-900">Worklog</div>
          <div className="text-slate-500 mt-1">Bạn chưa có internship hoặc chưa được duyệt.</div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => loadInternship()}>Tải lại</Button>
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
            <div className="text-xl font-semibold text-slate-900">Worklog</div>
            <div className="text-sm text-slate-500">Ghi lại công việc mỗi ngày và đính kèm file.</div>
          </div>
          <Button type="primary" onClick={openCreate}>
            + Tạo worklog
          </Button>
        </div>

        <WorklogFiltersBar
          q={q}
          setQ={setQ}
          dateRange={dateRange}
          setDateRange={setDateRange}
          review={review}
          setReview={setReview}
          hasFile={hasFile}
          setHasFile={setHasFile}
          sort={sort}
          setSort={setSort}
          onReset={resetFilters}
          visibleCount={items.length}
          total={total}
        />

        {!loading && items.length === 0 ? (
          <Empty description="Chưa có worklog nào." />
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
                onChange={(p, ps) => internshipId && loadWorklogs(internshipId, p, ps)}
              />
            </div>
          </>
        )}
      </Card>

      <WorklogViewModal open={openView} item={viewItem} onClose={closeViewModal} />

      <WorklogUpsertDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        loading={actionLoading}
        mode={drawerMode}
        internshipId={internshipId}
        initial={active}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
