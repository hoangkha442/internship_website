
// import { App, Button, Card, Empty, Modal, Pagination, Table, Tag } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import dayjs from "dayjs";
// import { useCallback, useEffect, useState } from "react";

// import { getMyInternship } from "../../../../services/studentApi";
// import {
//   createStudentReport,
//   deleteStudentReport,
//   getStudentReports,
//   updateStudentReport,
//   type ProgressReport,
// } from "../../../../services/reportApi";
// import ReportViewModal from "./_components/ReportViewModal";
// import ReportUpsertDrawer from "./_components/ReportUpsertDrawer";

// export default function StudentProgressReportsPage() {
//   const { message } = App.useApp();

//   const [internshipId, setInternshipId] = useState<string | number | null>(null);
//   const [loadingInternship, setLoadingInternship] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState<ProgressReport[]>([]);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [total, setTotal] = useState(0);

//   // view modal
//   const [openView, setOpenView] = useState(false);
//   const [viewItem, setViewItem] = useState<ProgressReport | null>(null);

//   // drawer
//   const [openDrawer, setOpenDrawer] = useState(false);
//   const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
//   const [active, setActive] = useState<ProgressReport | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   const loadInternship = useCallback(async () => {
//     setLoadingInternship(true);
//     try {
//       const data = await getMyInternship();
//       setInternshipId(data?.id ?? null);
//     } catch (err: any) {
//       setInternshipId(null);
//       message.error(err?.response?.data?.message || "Không lấy được internship");
//     } finally {
//       setLoadingInternship(false);
//     }
//   }, [message]);

//   const loadReports = useCallback(
//     async (internId: string | number, p: number, l: number) => {
//       setLoading(true);
//       try {
//         const res = await getStudentReports(internId, p, l);
//         setItems(res.items ?? []);
//         setTotal(res.meta?.total ?? 0);
//         setPage(p);
//         setLimit(l);
//       } catch (err: any) {
//         message.error(err?.response?.data?.message || "Không tải được báo cáo");
//         setItems([]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [message],
//   );

//   useEffect(() => {
//     loadInternship();
//   }, [loadInternship]);

//   useEffect(() => {
//     if (!internshipId) return;
//     loadReports(internshipId, 1, limit);
//   }, [internshipId, limit, loadReports]);

//   const openCreate = () => {
//     setDrawerMode("create");
//     setActive(null);
//     setOpenDrawer(true);
//   };

//   const openEdit = (r: ProgressReport) => {
//     setDrawerMode("edit");
//     setActive(r);
//     setOpenDrawer(true);
//   };

//   const openViewModal = (r: ProgressReport) => {
//     setViewItem(r);
//     setOpenView(true);
//   };

//   const closeViewModal = () => {
//     setOpenView(false);
//     setViewItem(null);
//   };

//   const handleSubmit = async (args: {
//     report_no?: number | null;
//     week_no?: number | null;
//     title: string;
//     content: string;
//     files: File[];
//   }) => {
//     if (!internshipId) return;

//     try {
//       setActionLoading(true);

//       if (drawerMode === "create") {
//         await createStudentReport(
//           {
//             internship_id: internshipId,
//             report_no: args.report_no ?? null,
//             week_no: args.week_no ?? null,
//             title: args.title,
//             content: args.content,
//           },
//           args.files,
//         );

//         message.success("Nộp báo cáo thành công");
//         await loadReports(internshipId, 1, limit);
//       } else {
//         if (!active) return;

//         await updateStudentReport(
//           active.id,
//           {
//             report_no: args.report_no ?? null,
//             week_no: args.week_no ?? null,
//             title: args.title,
//             content: args.content,
//           },
//           args.files,
//           { replaceAttachments: true }, // nếu có file mới -> replace; nếu không có file -> không đụng file cũ (do reportApi đã fix)
//         );

//         message.success("Cập nhật báo cáo thành công");
//         await loadReports(internshipId, page, limit);
//       }

//       setOpenDrawer(false);
//     } catch (err: any) {
//       message.error(err?.response?.data?.message || "Thao tác thất bại");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleDelete = (r: ProgressReport) => {
//     Modal.confirm({
//       title: "Xoá báo cáo?",
//       content: "Báo cáo đã xoá sẽ không thể khôi phục.",
//       okText: "Xoá",
//       okButtonProps: { danger: true },
//       cancelText: "Hủy",
//       onOk: async () => {
//         if (!internshipId) return;

//         try {
//           setActionLoading(true);

//           await deleteStudentReport(r.id);

//           // ✅ optimistic update: rerender ngay
//           setItems((prev) => prev.filter((x) => String(x.id) !== String(r.id)));
//           setTotal((prev) => Math.max(prev - 1, 0));

//           // ✅ nếu xoá item cuối trang -> lùi 1 trang
//           const willBeEmptyPage = items.length === 1 && page > 1;
//           const nextPage = willBeEmptyPage ? page - 1 : page;
//           setPage(nextPage);

//           message.success("Đã xoá báo cáo");

//           // ✅ sync lại từ server
//           await loadReports(internshipId, nextPage, limit);
//         } catch (err: any) {
//           message.error(err?.response?.data?.message || "Không thể xoá");
//         } finally {
//           setActionLoading(false);
//         }
//       },
//     });
//   };

//   const statusTag = (s?: string | null) => {
//     if (s === "reviewed") return <Tag color="green">Đã duyệt</Tag>;
//     if (s === "needs_revision") return <Tag color="red">Cần chỉnh sửa</Tag>;
//     return <Tag color="gold">Đã nộp</Tag>;
//   };

//   // ✅ BỎ useMemo để tránh stale closure
//   const columns: ColumnsType<ProgressReport> = [
//     {
//       title: "Report",
//       render: (_, r) => <Tag>#{r.report_no ?? "-"}</Tag>,
//       width: 90,
//     },
//     {
//       title: "Week",
//       render: (_, r) => <Tag>{r.week_no ?? "-"}</Tag>,
//       width: 90,
//     },
//     {
//       title: "Tiêu đề",
//       dataIndex: "title",
//       ellipsis: true,
//     },
//     {
//       title: "Trạng thái",
//       render: (_, r) => statusTag(r.status),
//       width: 130,
//     },
//     {
//       title: "Nộp lúc",
//       render: (_, r) =>
//         r.submitted_at ? dayjs(r.submitted_at).format("DD/MM/YYYY HH:mm") : "-",
//       width: 170,
//     },
//     {
//       title: "File",
//       render: (_, r) => <Tag>{r.report_attachments?.length ?? 0}</Tag>,
//       width: 80,
//     },
//     {
//       title: "",
//       width: 190,
//       render: (_, r) => (
//         <div className="flex justify-end gap-2">
//           <Button size="small" onClick={() => openViewModal(r)}>
//             Xem
//           </Button>
//           <Button size="small" onClick={() => openEdit(r)}>
//             Sửa
//           </Button>
//           <Button
//             size="small"
//             danger
//             loading={actionLoading}
//             onClick={() => handleDelete(r)}
//           >
//             Xoá
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   if (loadingInternship) {
//     return (
//       <div className="p-6">
//         <Card loading className="shadow-sm border border-slate-100" />
//       </div>
//     );
//   }

//   if (!internshipId) {
//     return (
//       <div className="p-6">
//         <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 16 } }}>
//           <div className="text-lg font-semibold text-slate-900">Báo cáo tiến độ</div>
//           <div className="text-slate-500 mt-1">Bạn chưa có internship hoặc chưa được duyệt.</div>
//           <div className="mt-4">
//             <Button onClick={loadInternship}>Tải lại</Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
//         <div className="flex items-center justify-between gap-3 mb-3">
//           <div>
//             <div className="text-xl font-semibold text-slate-900">Báo cáo tiến độ</div>
//             <div className="text-sm text-slate-500">
//               Nộp đề cương / báo cáo / final và đính kèm file.
//             </div>
//           </div>
//           <Button type="primary" onClick={openCreate}>
//             + Nộp báo cáo
//           </Button>
//         </div>

//         {!loading && items.length === 0 ? (
//           <Empty description="Chưa có báo cáo nào." />
//         ) : (
//           <>
//             <Table
//               rowKey={(r) => String(r.id)}
//               loading={loading}
//               columns={columns}
//               dataSource={items}
//               pagination={false}
//               tableLayout="fixed"
//             />

//             <div className="flex justify-end mt-4">
//               <Pagination
//                 current={page}
//                 pageSize={limit}
//                 total={total}
//                 showSizeChanger
//                 pageSizeOptions={[5, 10, 20, 50]}
//                 onChange={(p, ps) => internshipId && loadReports(internshipId, p, ps)}
//               />
//             </div>
//           </>
//         )}
//       </Card>

//       <ReportViewModal open={openView} item={viewItem} onClose={closeViewModal} />

//       <ReportUpsertDrawer
//         open={openDrawer}
//         onClose={() => setOpenDrawer(false)}
//         loading={actionLoading}
//         mode={drawerMode}
//         internshipId={internshipId}
//         initial={active}
//         onSubmit={handleSubmit}
//       />
//     </div>
//   );
// }

import { App, Button, Card, Empty, Modal, Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getMyInternship } from "../../../../services/studentApi";
import {
  createStudentReport,
  deleteStudentReport,
  getStudentReports,
  updateStudentReport,
  type ProgressReport,
} from "../../../../services/reportApi";

import ReportViewModal from "./_components/ReportViewModal";
import ReportUpsertDrawer from "./_components/ReportUpsertDrawer";
import ReportFiltersBar, {
  type StatusFilter,
  type FileFilter,
  type SortFilter,
} from "./_components/ReportFiltersBar";

const stripHtml = (html: string) =>
  String(html || "")
    .replace(/<(.|\n)*?>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export default function StudentProgressReportsPage() {
  const { message } = App.useApp();

  // ===== filters =====
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [hasFile, setHasFile] = useState<FileFilter>("all");
  const [sort, setSort] = useState<SortFilter>("submitted_desc");

  // debounce search
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

  // ===== base states =====
  const [internshipId, setInternshipId] = useState<string | number | null>(null);
  const [loadingInternship, setLoadingInternship] = useState(false);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProgressReport[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // refs tránh stale closure trong Modal.confirm
  const itemsRef = useRef(items);
  const pageRef = useRef(page);
  const limitRef = useRef(limit);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { limitRef.current = limit; }, [limit]);

  // ===== view modal =====
  const [openView, setOpenView] = useState(false);
  const [viewItem, setViewItem] = useState<ProgressReport | null>(null);

  // ===== drawer upsert =====
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<ProgressReport | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const loadReports = useCallback(
    async (internId: string | number, p: number, l: number) => {
      setLoading(true);
      try {
        const from = dateRange?.[0] ? dayjs(dateRange[0]).startOf("day").toISOString() : undefined;
        const to = dateRange?.[1] ? dayjs(dateRange[1]).endOf("day").toISOString() : undefined;

        const res = await getStudentReports(internId, {
          page: p,
          limit: l,
          q: qDebounced || undefined,
          from,
          to,
          status,
          hasFile,
          sort,
        });

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
    [message, qDebounced, dateRange, status, hasFile, sort],
  );

  useEffect(() => {
    loadInternship();
  }, [loadInternship]);

  // reload khi internship hoặc filter/limit đổi
  useEffect(() => {
    if (!internshipId) return;
    loadReports(internshipId, 1, limit);
  }, [internshipId, limit, qDebounced, dateRange, status, hasFile, sort, loadReports]);

  // ===== client-side filter fallback (phòng khi backend chưa support) =====
  const filteredItems = useMemo(() => {
    let arr = [...items];

    // q in title + content + feedback
    if (qDebounced) {
      const key = qDebounced.toLowerCase();
      arr = arr.filter((r) => {
        const t = (r.title || "").toLowerCase();
        const c = stripHtml(r.content || "");
        const f = stripHtml(r.feedback || "");
        return t.includes(key) || c.includes(key) || f.includes(key);
      });
    }

    // date range by submitted_at
    if (dateRange?.[0] && dateRange?.[1]) {
      const from = dayjs(dateRange[0]).startOf("day");
      const to = dayjs(dateRange[1]).endOf("day");
      arr = arr.filter((r) => {
        if (!r.submitted_at) return false;
        const d = dayjs(r.submitted_at);
        return d.isBetween(from, to, null, "[]");
      });
    }

    // status filter
    if (status !== "all") {
      arr = arr.filter((r) => (r.status ?? "submitted") === status);
    }

    // hasFile filter
    if (hasFile !== "all") {
      arr = arr.filter((r) => {
        const n = r.report_attachments?.length ?? 0;
        return hasFile === "has" ? n > 0 : n === 0;
      });
    }

    // sort
    arr.sort((a, b) => {
      const aSubmitted = dayjs(a.submitted_at || 0).valueOf();
      const bSubmitted = dayjs(b.submitted_at || 0).valueOf();
      const aWeek = a.week_no ?? -999999;
      const bWeek = b.week_no ?? -999999;

      switch (sort) {
        case "submitted_asc":
          return aSubmitted - bSubmitted;
        case "submitted_desc":
          return bSubmitted - aSubmitted;
        case "week_asc":
          return aWeek - bWeek;
        case "week_desc":
        default:
          return bWeek - aWeek;
      }
    });

    return arr;
  }, [items, qDebounced, dateRange, status, hasFile, sort]);

  const openCreate = () => {
    setDrawerMode("create");
    setActive(null);
    setOpenDrawer(true);
  };

  const openEdit = (r: ProgressReport) => {
    setDrawerMode("edit");
    setActive(r);
    setOpenDrawer(true);
  };

  const openViewModal = (r: ProgressReport) => {
    setViewItem(r);
    setOpenView(true);
  };

  const closeViewModal = () => {
    setOpenView(false);
    setViewItem(null);
  };

  const handleSubmit = async (args: {
    report_no?: number | null;
    week_no?: number | null;
    title: string;
    content: string;
    files: File[];
  }) => {
    if (!internshipId) return;

    try {
      setActionLoading(true);

      if (drawerMode === "create") {
        await createStudentReport(
          {
            internship_id: internshipId,
            report_no: args.report_no ?? null,
            week_no: args.week_no ?? null,
            title: args.title,
            content: args.content,
          },
          args.files,
        );

        message.success("Nộp báo cáo thành công");
        await loadReports(internshipId, 1, limit);
      } else {
        if (!active) return;

        await updateStudentReport(
          active.id,
          {
            report_no: args.report_no ?? null,
            week_no: args.week_no ?? null,
            title: args.title,
            content: args.content,
          },
          args.files,
          { replaceAttachments: true } // chỉ replace nếu có file mới (reportApi sẽ tự check length)
        );

        message.success("Cập nhật báo cáo thành công");
        await loadReports(internshipId, page, limit);
      }

      setOpenDrawer(false);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (r: ProgressReport) => {
    Modal.confirm({
      title: "Xoá báo cáo?",
      content: "Báo cáo đã xoá sẽ không thể khôi phục.",
      okText: "Xoá",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        const internId = internshipId;
        if (!internId) return;

        try {
          setActionLoading(true);

          await deleteStudentReport(r.id);

          // ✅ optimistic
          setItems((prev) => prev.filter((x) => String(x.id) !== String(r.id)));
          setTotal((prev) => Math.max(prev - 1, 0));

          message.success("Đã xoá báo cáo");

          // ✅ nếu xoá item cuối trang => lùi 1 trang
          const currentLen = itemsRef.current.length;
          const currentPage = pageRef.current;
          const currentLimit = limitRef.current;

          const willBeEmptyPage = currentLen === 1 && currentPage > 1;
          const nextPage = willBeEmptyPage ? currentPage - 1 : currentPage;

          setPage(nextPage);

          // ✅ sync lại
          await loadReports(internId, nextPage, currentLimit);
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Không thể xoá");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const statusTag = (s?: string | null) => {
    if (s === "reviewed") return <Tag color="green">Đã duyệt</Tag>;
    if (s === "needs_revision") return <Tag color="red">Cần chỉnh sửa</Tag>;
    return <Tag color="gold">Đã nộp</Tag>;
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
      title: "Nộp lúc",
      render: (_, r) =>
        r.submitted_at ? dayjs(r.submitted_at).format("DD/MM/YYYY HH:mm") : "-",
      width: 170,
    },
    {
      title: "File",
      render: (_, r) => <Tag>{r.report_attachments?.length ?? 0}</Tag>,
      width: 80,
    },
    {
      title: "",
      width: 190,
      render: (_, r) => (
        <div className="flex justify-end gap-2">
          <Button size="small" onClick={() => openViewModal(r)}>
            Xem
          </Button>
          <Button size="small" onClick={() => openEdit(r)}>
            Sửa
          </Button>
          <Button size="small" danger loading={actionLoading} onClick={() => handleDelete(r)}>
            Xoá
          </Button>
        </div>
      ),
    },
  ];

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
          <div className="text-lg font-semibold text-slate-900">Báo cáo tiến độ</div>
          <div className="text-slate-500 mt-1">Bạn chưa có internship hoặc chưa được duyệt.</div>
          <div className="mt-4">
            <Button onClick={loadInternship}>Tải lại</Button>
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
            <div className="text-xl font-semibold text-slate-900">Báo cáo tiến độ</div>
            <div className="text-sm text-slate-500">Nộp đề cương / báo cáo / final và đính kèm file.</div>
          </div>
          <Button type="primary" onClick={openCreate}>
            + Nộp báo cáo
          </Button>
        </div>

        <ReportFiltersBar
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
                onChange={(p, ps) => internshipId && loadReports(internshipId, p, ps)}
              />
            </div>
          </>
        )}
      </Card>

      <ReportViewModal open={openView} item={viewItem} onClose={closeViewModal} />

      <ReportUpsertDrawer
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
