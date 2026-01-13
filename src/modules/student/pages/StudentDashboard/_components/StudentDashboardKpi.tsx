import { Card, Progress, Statistic, Tag } from "antd";
import { useMemo } from "react";
import type { StudentDashboardPayload } from "../../../../../services/studentDashboardApi";

export default function StudentDashboardKpi(props: {
  data: StudentDashboardPayload;
}) {
  const { internship, summary } = props.data;

  const statusTag = useMemo(() => {
    const s = internship?.status;
    if (!s) return <Tag>—</Tag>;
    if (s === "in_progress" || s === "registered") return <Tag color="blue">Đang thực tập</Tag>;
    if (s === "completed") return <Tag color="green">Hoàn thành</Tag>;
    if (s === "dropped") return <Tag color="red">Dừng</Tag>;
    return <Tag>{s}</Tag>;
  }, [internship?.status]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 16 } }}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">Internship</div>
          {statusTag}
        </div>

        <div className="mt-2 text-lg font-semibold text-slate-900">
          {internship?.topic?.title ?? "Chưa có internship"}
        </div>

        <div className="text-sm text-slate-500 mt-1">
          {internship?.term?.term_name ?? "—"}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-500">Tiến độ</div>
            <div className="text-slate-700 font-medium">{Number(summary.progress_percent ?? 0)}%</div>
          </div>
          <Progress percent={Number(summary.progress_percent ?? 0)} />
        </div>
      </Card>

      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 16 } }}>
        <div className="text-sm text-slate-500">Báo cáo</div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Statistic title="Tổng" value={summary.reports_total} />
          <Statistic title="Chờ duyệt" value={summary.reports_pending_review} />
          <Statistic title="Cần sửa" value={summary.reports_needs_revision} />
          <Statistic title="Đã duyệt" value={summary.reports_reviewed} />
        </div>
      </Card>

      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 16 } }}>
        <div className="text-sm text-slate-500">Nhật ký & Điểm danh</div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Statistic title="Worklog (tổng)" value={summary.worklogs_total} />
          <Statistic title="Worklog (chờ)" value={summary.worklogs_pending_review} />
          <Statistic title="Điểm danh (tổng)" value={summary.attendance_total} />
          <Statistic title="Điểm danh (chờ duyệt)" value={summary.attendance_pending_approval} />
        </div>
      </Card>
    </div>
  );
}
