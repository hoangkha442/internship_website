// src/modules/student/pages/StudentDashboardPage.tsx
import { App, Card, Empty, Select, Spin } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import StudentDashboardKpi from "./_components/StudentDashboardKpi";
import StudentDashboardCharts from "./_components/StudentDashboardCharts";
import { getStudentDashboard, type DashboardRange, type StudentDashboardPayload } from "../../../../services/studentDashboardApi";

import { getMyInternship } from "../../../../services/studentApi";

type InternshipOption = {
  value: string;
  label: string;
};

export default function StudentDashboardPage() {
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<DashboardRange>("14d");

  const [internshipId, setInternshipId] = useState<string | null>(null);
  const [internshipOptions, setInternshipOptions] = useState<InternshipOption[]>([]);

  const [data, setData] = useState<StudentDashboardPayload | null>(null);

  const loadInternships = useCallback(async () => {
    try {
      const one = await getMyInternship();
      if (!one?.id) {
        setInternshipId(null);
        setInternshipOptions([]);
        return;
      }

      const label = one?.internship_topics?.title
        ? `${one.internship_topics.title} · ${one.internship_terms?.term_name ?? ""}`
        : `Internship #${one.id}`;

      setInternshipId(String(one.id));
      setInternshipOptions([{ value: String(one.id), label }]);

      // Nếu bạn có list internships:
      // const list = await getMyInternships()
      // const opts = list.map(x => ({
      //   value: String(x.id),
      //   label: `${x.internship_topics?.title ?? "Internship"} · ${x.internship_terms?.term_name ?? ""}`
      // }))
      // setInternshipOptions(opts)
      // setInternshipId(opts[0]?.value ?? null)

    } catch (err: any) {
      setInternshipId(null);
      setInternshipOptions([]);
      message.error(err?.response?.data?.message || "Không lấy được internship");
    }
  }, [message]);

  const loadDashboard = useCallback(
    async (internId: string, r: DashboardRange) => {
      setLoading(true);
      try {
        const res = await getStudentDashboard({
          internship_id: internId,
          range: r,
        });
        setData(res);
      } catch (err: any) {
        setData(null);
        message.error(err?.response?.data?.message || "Không tải được dashboard");
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  useEffect(() => {
    if (!internshipId) return;
    loadDashboard(internshipId, range);
  }, [internshipId, range, loadDashboard]);

  const windowText = useMemo(() => {
    if (!data?.window) return "";
    const f = dayjs(data.window.from).format("DD/MM/YYYY");
    const t = dayjs(data.window.to).format("DD/MM/YYYY");
    return `${f} → ${t}`;
  }, [data?.window]);

  return (
    <div className="p-6 space-y-3">
      <Card className="shadow-sm border border-slate-100 mb-2!" styles={{ body: { padding: 12 } }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-slate-900">Dashboard</div>
            <div className="text-sm text-slate-500">
              Tổng quan báo cáo, worklog, điểm danh {windowText ? `(${windowText})` : ""}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              style={{ width: 360 }}
              placeholder="Chọn internship"
              value={internshipId ?? undefined}
              options={internshipOptions}
              onChange={(v) => setInternshipId(String(v))}
              allowClear={false}
            />

            <Select
              style={{ width: 140 }}
              value={range}
              options={[
                { value: "7d", label: "7 ngày" },
                { value: "14d", label: "14 ngày" },
                { value: "30d", label: "30 ngày" },
              ]}
              onChange={(v) => setRange(v as DashboardRange)}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 24 } }}>
          <div className="flex items-center justify-center">
            <Spin />
          </div>
        </Card>
      ) : !data || !data.internship ? (
        <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 24 } }}>
          <Empty description="Chưa có internship hoặc chưa đủ dữ liệu dashboard." />
        </Card>
      ) : (
        <>
          <StudentDashboardKpi data={data} />
          <StudentDashboardCharts data={data} />
        </>
      )}
    </div>
  );
}
