import { App, Card, Col, Empty, Row, Skeleton, Statistic, Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import LecturerDashboardFiltersBar from "./_components/LecturerDashboardFiltersBar";
import LecturerDashboardCharts from "./_components/LecturerDashboardCharts";

import {
  getLecturerDashboard,
  type DashboardRange,
  type LecturerDashboardPayload,
} from "../../../../services/lecturerDashboardApi";

import { getLecturerSupervisedStudents, type LecturerSupervisedItem } from "../../../../services/reportApi";

export default function LecturerDashboard() {
  const { message } = App.useApp();

  const [internships, setInternships] = useState<LecturerSupervisedItem[]>([]);
  const [loadingInternships, setLoadingInternships] = useState(false);

  // null = ALL
  const [internshipId, setInternshipId] = useState<string | number | null>(null);

  const [range, setRange] = useState<DashboardRange>("14d");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LecturerDashboardPayload | null>(null);

  const heroSubtitle = useMemo(() => {
    const from = dateRange?.[0] ? dayjs(dateRange[0]).format("DD/MM/YYYY") : null;
    const to = dateRange?.[1] ? dayjs(dateRange[1]).format("DD/MM/YYYY") : null;
    if (from || to) return `Khoảng: ${from ?? "-"} → ${to ?? "-"}`;
    return `Range: ${range === "7d" ? "7 ngày" : range === "14d" ? "14 ngày" : "30 ngày"}`;
  }, [dateRange, range]);

  const loadInternships = useCallback(async () => {
    setLoadingInternships(true);
    try {
      const items = await getLecturerSupervisedStudents();
      setInternships(items ?? []);
      // mặc định ALL để có cái nhìn tổng quan
      if (!items?.length) setInternshipId(null);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không tải được danh sách internship");
      setInternships([]);
    } finally {
      setLoadingInternships(false);
    }
  }, [message]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const from = dateRange?.[0] ? dayjs(dateRange[0]).startOf("day").toISOString() : undefined;
      const to = dateRange?.[1] ? dayjs(dateRange[1]).endOf("day").toISOString() : undefined;

      const payload = await getLecturerDashboard({
        internship_id: internshipId ?? undefined,
        ...(from || to ? { from, to } : { range }),
      });

      setData(payload);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không tải được dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [message, internshipId, range, dateRange]);

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  useEffect(() => {
    if (loadingInternships) return;
    loadDashboard();
  }, [loadingInternships, loadDashboard]);

  const s = data?.summary;

  return (
    <div className="p-6 space-y-4">
      {/* HERO */}
      <div className="rounded-2xl border border-slate-100 bg-linear-to-r from-slate-50 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">Lecturer Dashboard</div>
            <div className="text-sm text-slate-600 mt-1">
              Theo dõi tình trạng báo cáo, điểm danh, worklog của sinh viên phụ trách.
            </div>
            <div className="text-xs text-slate-500 mt-1">{heroSubtitle}</div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Tag color={internshipId ? "blue" : "default"}>
              {internshipId ? `Internship #${internshipId}` : "Tất cả internship"}
            </Tag>
            <Tag>{internships.length} internship</Tag>
          </div>
        </div>

        <div className="mt-4">
          <LecturerDashboardFiltersBar
            internships={internships}
            internshipId={internshipId}
            setInternshipId={setInternshipId}
            range={range}
            setRange={setRange}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>
      </div>

      {/* LOADING / EMPTY */}
      {loading || loadingInternships ? (
        <Card className="shadow-sm border border-slate-100">
          <Skeleton active />
        </Card>
      ) : internships.length === 0 ? (
        <Card className="shadow-sm border border-slate-100">
          <Empty description="Bạn chưa có internship nào để theo dõi." />
        </Card>
      ) : !data || !s ? (
        <Card className="shadow-sm border border-slate-100">
          <Empty description="Không có dữ liệu dashboard." />
        </Card>
      ) : (
        <>
          {/* KPI CARDS */}
          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-slate-900">Tổng quan</div>
                  <Tag>Scope</Tag>
                </div>
                <Row gutter={[12, 12]} className="mt-2">
                  <Col span={12}>
                    <Statistic title="Internships" value={s.internships_total} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Sinh viên" value={s.students_total} />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-slate-900">Progress Reports</div>
                  <Tag color="gold">Review</Tag>
                </div>
                <Row gutter={[12, 12]} className="mt-2">
                  <Col span={8}>
                    <Statistic title="Chờ duyệt" value={s.reports_submitted_pending} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Cần sửa" value={s.reports_needs_revision} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Đã duyệt" value={s.reports_reviewed} />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-slate-900">Attendance & Worklogs</div>
                  <Tag color="blue">Daily</Tag>
                </div>
                <Row gutter={[12, 12]} className="mt-2">
                  <Col span={12}>
                    <Statistic title="Điểm danh chờ duyệt" value={s.attendance_pending_approval} />
                    <div className="text-xs text-slate-500 mt-1">Tổng records: {s.attendance_total}</div>
                  </Col>
                  <Col span={12}>
                    <Statistic title="Worklog chờ review" value={s.worklogs_pending_review} />
                    <div className="text-xs text-slate-500 mt-1">
                      Reviewed: {s.worklogs_reviewed} / Total: {s.worklogs_total}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* CHARTS */}
          <LecturerDashboardCharts
            reportTrends={data.reportTrends ?? []}
            attendanceTrends={data.attendanceTrends ?? []}
            worklogTrends={data.worklogTrends ?? []}
          />
        </>
      )}
    </div>
  );
}
