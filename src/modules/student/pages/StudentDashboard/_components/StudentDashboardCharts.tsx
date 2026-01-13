// src/modules/student/pages/_components/StudentDashboardCharts.tsx
import { Card, Segmented } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";
import type { StudentDashboardPayload } from "../../../../../services/studentDashboardApi";

const fmtDay = (d: string) => dayjs(d).format("DD/MM");

export default function StudentDashboardCharts(props: { data: StudentDashboardPayload }) {
  const [tab, setTab] = useState<"reports" | "attendance" | "worklogs">("reports");

  const reportData = useMemo(
    () =>
      props.data.reportTrends.map((x) => ({
        day: fmtDay(x.day),
        submitted: x.submitted,
        reviewed: x.reviewed,
        needs_revision: x.needs_revision,
      })),
    [props.data.reportTrends]
  );

  const attendanceData = useMemo(
    () =>
      props.data.attendanceTrends.map((x) => ({
        day: fmtDay(x.day),
        total: x.total,
        approved: x.approved,
        pending: x.pending,
      })),
    [props.data.attendanceTrends]
  );

  const worklogData = useMemo(
    () =>
      props.data.worklogTrends.map((x) => ({
        day: fmtDay(x.day),
        total: x.total,
        reviewed: x.reviewed,
        pending: x.pending,
      })),
    [props.data.worklogTrends]
  );

  return (
    <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <div className="text-lg font-semibold text-slate-900">Thống kê theo ngày</div>
          <div className="text-sm text-slate-500">
            Xu hướng nộp báo cáo / điểm danh / nhật ký theo thời gian
          </div>
        </div>

        <Segmented
          value={tab}
          onChange={(v) => setTab(v as any)}
          options={[
            { label: "Báo cáo", value: "reports" },
            { label: "Điểm danh", value: "attendance" },
            { label: "Worklog", value: "worklogs" },
          ]}
        />
      </div>

      <div style={{ width: "100%", height: 320 }}>
        {tab === "reports" && (
          <ResponsiveContainer>
            <AreaChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="submitted" />
              <Area type="monotone" dataKey="reviewed" />
              <Area type="monotone" dataKey="needs_revision" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {tab === "attendance" && (
          <ResponsiveContainer>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" />
              <Line type="monotone" dataKey="approved" />
              <Line type="monotone" dataKey="pending" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {tab === "worklogs" && (
          <ResponsiveContainer>
            <LineChart data={worklogData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" />
              <Line type="monotone" dataKey="reviewed" />
              <Line type="monotone" dataKey="pending" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
