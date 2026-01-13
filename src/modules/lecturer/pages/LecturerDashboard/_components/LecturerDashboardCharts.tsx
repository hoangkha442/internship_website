import { Card, Table, Tabs, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

import type {
  AttendanceTrendRow,
  ReportTrendRow,
  WorklogTrendRow,
} from "../../../../../services/lecturerDashboardApi";

const fmtDay = (d: string) => dayjs(d).format("DD/MM");

const ChartWrap = (props: { title: string; subtitle?: string; children: any }) => {
  return (
    <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-base font-semibold text-slate-900">{props.title}</div>
          {props.subtitle ? (
            <Typography.Text type="secondary" className="text-xs">
              {props.subtitle}
            </Typography.Text>
          ) : null}
        </div>
        <Tag>Trend</Tag>
      </div>
      <div className="h-[280px]">{props.children}</div>
    </Card>
  );
};

export default function LecturerDashboardCharts(props: {
  reportTrends: ReportTrendRow[];
  attendanceTrends: AttendanceTrendRow[];
  worklogTrends: WorklogTrendRow[];
}) {
  const reportCols: ColumnsType<ReportTrendRow> = [
    { title: "Ngày", dataIndex: "day", render: (v) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Submitted", dataIndex: "submitted" },
    { title: "Reviewed", dataIndex: "reviewed" },
    { title: "Needs revision", dataIndex: "needs_revision" },
  ];

  const attendanceCols: ColumnsType<AttendanceTrendRow> = [
    { title: "Ngày", dataIndex: "day", render: (v) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Present", dataIndex: "present" },
    { title: "Late", dataIndex: "late" },
    { title: "Absent", dataIndex: "absent" },
    { title: "Excused", dataIndex: "excused" },
    { title: "Pending", dataIndex: "pending_approval" },
  ];

  const worklogCols: ColumnsType<WorklogTrendRow> = [
    { title: "Ngày", dataIndex: "day", render: (v) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Total", dataIndex: "total" },
    { title: "Pending", dataIndex: "pending" },
    { title: "Reviewed", dataIndex: "reviewed" },
  ];

  const reportData = (props.reportTrends ?? []).map((x) => ({ ...x, dayLabel: fmtDay(x.day) }));
  const attendanceData = (props.attendanceTrends ?? []).map((x) => ({ ...x, dayLabel: fmtDay(x.day) }));
  const worklogData = (props.worklogTrends ?? []).map((x) => ({ ...x, dayLabel: fmtDay(x.day) }));

  return (
    <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
      <Tabs
        items={[
          {
            key: "reports",
            label: "Reports",
            children: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ChartWrap title="Reports theo ngày" subtitle="Submitted / Reviewed / Needs revision">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayLabel" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="submitted" name="Submitted" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="reviewed" name="Reviewed" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="needs_revision" name="Needs revision" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartWrap>

                <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
                  <div className="text-base font-semibold text-slate-900 mb-2">Chi tiết</div>
                  <Table
                    size="small"
                    rowKey={(r) => r.day}
                    columns={reportCols}
                    dataSource={props.reportTrends ?? []}
                    pagination={{ pageSize: 8 }}
                  />
                </Card>
              </div>
            ),
          },

          {
            key: "attendance",
            label: "Attendance",
            children: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ChartWrap title="Attendance theo ngày" subtitle="Stack theo trạng thái">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayLabel" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" stackId="a" name="Present" />
                      <Bar dataKey="late" stackId="a" name="Late" />
                      <Bar dataKey="absent" stackId="a" name="Absent" />
                      <Bar dataKey="excused" stackId="a" name="Excused" />
                      <Bar dataKey="pending_approval" stackId="a" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrap>

                <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
                  <div className="text-base font-semibold text-slate-900 mb-2">Chi tiết</div>
                  <Table
                    size="small"
                    rowKey={(r) => r.day}
                    columns={attendanceCols}
                    dataSource={props.attendanceTrends ?? []}
                    pagination={{ pageSize: 8 }}
                  />
                </Card>
              </div>
            ),
          },

          {
            key: "worklogs",
            label: "Worklogs",
            children: (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ChartWrap title="Worklogs theo ngày" subtitle="Total / Pending / Reviewed">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={worklogData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayLabel" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total" />
                      <Line type="monotone" dataKey="pending" name="Pending" />
                      <Line type="monotone" dataKey="reviewed" name="Reviewed" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartWrap>

                <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
                  <div className="text-base font-semibold text-slate-900 mb-2">Chi tiết</div>
                  <Table
                    size="small"
                    rowKey={(r) => r.day}
                    columns={worklogCols}
                    dataSource={props.worklogTrends ?? []}
                    pagination={{ pageSize: 8 }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
}
