import { Card, Progress, Tag } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageHeader from "../../shared/components/PageHeader";

const PRIMARY = "#0694f9";
const GREEN = "#10b981";
const ORANGE = "#f97316";
const RED = "#ef4444";
const SLATE = "#64748b";

const AdminDashboard = () => {
  // KPIs tổng quan (fake data)
  const overview = {
    totalStudents: 320,
    activeStudents: 285,
    totalLecturers: 28,
    activeInternships: 12,
    onTimeReportsRate: 78, // %
    lateReports: 14,
  };

  // Điểm danh theo tuần
  const attendanceTrend = [
    { week: "Tuần 1", present: 210, absent: 18 },
    { week: "Tuần 2", present: 230, absent: 15 },
    { week: "Tuần 3", present: 245, absent: 12 },
    { week: "Tuần 4", present: 255, absent: 10 },
  ];

  // Báo cáo theo tháng: đúng hạn / trễ
  const reportTrend = [
    { month: "01", onTime: 30, late: 5 },
    { month: "02", onTime: 40, late: 7 },
    { month: "03", onTime: 55, late: 8 },
    { month: "04", onTime: 70, late: 9 },
    { month: "05", onTime: 65, late: 6 },
    { month: "06", onTime: 80, late: 4 },
  ];

  // Phân bố tiến độ sinh viên
  const progressDistribution = [
    { name: "Đúng tiến độ", value: 210, color: GREEN },
    { name: "Có nguy cơ trễ", value: 60, color: ORANGE },
    { name: "Đang trễ nhiều", value: 50, color: RED },
  ];

  // Tải giảng viên (số sinh viên phụ trách)
  const lecturerLoad = [
    { name: "GV A", students: 18 },
    { name: "GV B", students: 22 },
    { name: "GV C", students: 15 },
    { name: "GV D", students: 20 },
    { name: "GV E", students: 25 },
  ];

  const totalProgress = progressDistribution.reduce(
    (sum, p) => sum + p.value,
    0
  );

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* HEADER */}
      <PageHeader
        title="Bảng điều khiển Quản trị viên"
        subtitle="Tổng quan tình hình thực tập: sinh viên, giảng viên, điểm danh và báo cáo"
      />
      <div className="grid grid-cols-4 gap-6">
        <Card className="shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Tổng sinh viên
          </p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {overview.totalStudents}
            </span>
            <Tag color="blue">Đang tham gia</Tag>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {overview.activeStudents} sinh viên đang hoạt động
          </p>
        </Card>

        <Card className="shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Tổng giảng viên
          </p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {overview.totalLecturers}
            </span>
            <Tag color="purple">Hướng dẫn</Tag>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Trung bình ~
            {Math.round(overview.activeStudents / overview.totalLecturers)} sinh
            viên / giảng viên
          </p>
        </Card>

        <Card className="shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Kỳ thực tập đang mở
          </p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {overview.activeInternships}
            </span>
            <Tag color="geekblue">12 tuần</Tag>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Quy trình chuẩn Xưởng thực tập Khoa CNTT
          </p>
        </Card>

        <Card className="shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Báo cáo đúng hạn
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-3xl font-bold text-primary">
              {overview.onTimeReportsRate}%
            </span>
          </div>
          <Progress
            percent={overview.onTimeReportsRate}
            strokeColor={PRIMARY}
            size="small"
            className="mt-3"
          />
          <p className="text-xs text-slate-500 mt-2">
            {overview.lateReports} báo cáo đang trễ cần xử lý
          </p>
        </Card>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Attendance trend */}
          <Card
            title="Điểm danh theo tuần"
            className="shadow-sm border border-slate-100"
            extra={
              <span className="text-xs text-slate-400">
                Đơn vị: lượt điểm danh / tuần
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={attendanceTrend}>
                <defs>
                  <linearGradient
                    id="attendancePrimary"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke={SLATE} />
                <YAxis stroke={SLATE} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  name="Có mặt"
                  stroke={PRIMARY}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  name="Vắng"
                  stroke={RED}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Lecturer workload */}
          <Card
            title="Số lượng sinh viên theo giảng viên"
            className="shadow-sm border border-slate-100"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lecturerLoad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke={SLATE} />
                <YAxis stroke={SLATE} />
                <Tooltip />
                <Bar
                  dataKey="students"
                  name="Số sinh viên"
                  fill={PRIMARY}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card
            title="Báo cáo đúng hạn / trễ theo tháng"
            className="shadow-sm border border-slate-100"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reportTrend} stackOffset="none">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke={SLATE} />
                <YAxis stroke={SLATE} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="onTime"
                  name="Đúng hạn"
                  stackId="a"
                  fill={PRIMARY}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="late"
                  name="Trễ hạn"
                  stackId="a"
                  fill={ORANGE}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Phân bố tiến độ sinh viên"
            className="shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={progressDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {progressDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col gap-2 mt-2 w-full">
                {progressDistribution.map((item) => {
                  const percent = Math.round(
                    (item.value / totalProgress) * 100
                  );
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs text-slate-600"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Giúp bạn nhanh chóng nhận diện nhóm sinh viên đang trễ tiến độ để
              ưu tiên xử lý.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
