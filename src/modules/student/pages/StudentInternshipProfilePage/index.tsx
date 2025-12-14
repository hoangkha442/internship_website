import { useEffect, useState } from "react";
import { Card, Tag, Spin, Alert } from "antd";
import dayjs from "dayjs";

import PageHeader from "../../../shared/components/PageHeader";
import { useNotification } from "../../../../provider/Notification";
import {
  getMyInternship,
  getMyTopicRegistration,
} from "../../../../services/studentApi";
import type {
  MyInternshipResponse,
  MyTopicRegistrationResponse,
} from "../../../shared/types/studentInternship";

const STATUS_LABEL: Record<string, string> = {
  registered: "Đã đăng ký",
  in_progress: "Đang thực tập",
  completed: "Hoàn thành",
  canceled: "Đã hủy",
};

const STATUS_COLOR: Record<string, string> = {
  registered: "processing",
  in_progress: "blue",
  completed: "green",
  canceled: "red",
};

const REG_STATUS_LABEL: Record<string, string> = {
  pending: "Đang chờ duyệt",
  approved: "Đã được duyệt",
  rejected: "Bị từ chối",
};

const REG_STATUS_COLOR: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const StudentInternshipProfilePage = () => {
  const { notify } = useNotification();

  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<MyInternshipResponse | null>(
    null
  );
  const [registration, setRegistration] = useState<
    MyTopicRegistrationResponse["registration"] | null
  >(null);

  console.log("registration: ", registration);
  const loadData = async () => {
    setLoading(true);
    try {
      const [internshipRes, regRes] = await Promise.all([
        getMyInternship().catch(() => null),
        getMyTopicRegistration().catch(() => ({ registration: null })),
      ]);

      setInternship(internshipRes || null);
      setRegistration(regRes?.registration || null);
    } catch (err) {
      console.error(err);
      notify("error", "Không tải được hồ sơ thực tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPendingRegistration = () => {
    if (!registration) return null;
    if (registration.status !== "pending") return null;

    const topic = registration.internship_topics;
    const gv = topic?.lecturers;

    return (
      <Card
        className="border border-amber-200 bg-amber-50/70 shadow-sm"
        title={
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-amber-800">
              Đang chờ giảng viên duyệt đề tài
            </span>
            <Tag color={REG_STATUS_COLOR[registration.status]}>
              {REG_STATUS_LABEL[registration.status]}
            </Tag>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Đề tài:
              <span className="font-medium text-black text-base ml-2">
                {topic?.title || "—"}
              </span>
              {topic?.description && (
                <p className="text-xs text-slate-500 mt-1 italic">
                  {topic.description}
                </p>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  Công ty:{" "}
                  <span className="font-normal">
                    {topic?.company_name || "—"}
                  </span>
                </p>
              </div>
              <div>
                <span className="font-medium">Địa chỉ: </span>
                {topic?.company_address || "—"}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Giảng viên phụ trách
              </p>
              {gv ? (
                <>
                  <p className="font-medium">
                    {gv.lecturer_code}
                    {gv.department ? ` · ${gv.department}` : ""}
                  </p>
                  {gv.phone && (
                    <p className="text-xs text-slate-500">SĐT: {gv.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500">—</p>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Ngày đăng ký:{" "}
            {dayjs(registration.registered_at).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
      </Card>
    );
  };

  const renderInternshipDetail = () => {
    if (!internship) return null;

    const term = internship.internship_terms;
    const topic = internship.internship_topics;
    const gv = internship.lecturers;

    const status = internship.status;
    const statusLabel = STATUS_LABEL[status] || status;
    const statusColor = STATUS_COLOR[status] || "default";

    return (
      <Card className="border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Trạng thái thực tập
            </p>
            <Tag color={statusColor}>{statusLabel}</Tag>
          </div>
          <div className="text-xs text-slate-500">
            Tạo lúc: {dayjs(internship.created_at).format("DD/MM/YYYY HH:mm")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Kỳ thực tập */}
          <Card
            size="small"
            className="border border-blue-100 bg-blue-50/60"
            title="Kỳ thực tập"
          >
            {term ? (
              <div className="space-y-1 text-xs text-slate-700">
                <div className="font-semibold">{term.term_name}</div>
                <div>
                  Thời gian: {dayjs(term.start_date).format("DD/MM/YYYY")} -{" "}
                  {dayjs(term.end_date).format("DD/MM/YYYY")}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                Không có thông tin kỳ thực tập
              </span>
            )}
          </Card>

          {/* Giảng viên */}
          <Card
            size="small"
            className="border border-slate-200"
            title="Giảng viên hướng dẫn"
          >
            {gv ? (
              <div className="space-y-1 text-xs text-slate-700">
                <div className="font-semibold">
                  {gv.lecturer_code} {gv.department ? `· ${gv.department}` : ""}
                </div>
                {gv.phone && <div>SĐT: {gv.phone}</div>}
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                Chưa có giảng viên hướng dẫn
              </span>
            )}
          </Card>
        </div>

        {/* Đề tài */}
        <Card
          size="small"
          className="border border-emerald-100 bg-emerald-50/60 mb-4"
          title="Đề tài & công ty"
        >
          {topic ? (
            <div className="space-y-1 text-xs text-slate-700">
              <div className="font-semibold">{topic.title}</div>
              {topic.description && (
                <div className="text-slate-600">{topic.description}</div>
              )}
              <div className="pt-1">
                <span className="font-medium">Công ty: </span>
                {topic.company_name || "—"}
              </div>
              <div>
                <span className="font-medium">Địa chỉ: </span>
                {topic.company_address || "—"}
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Không có thông tin đề tài
            </span>
          )}
        </Card>

        {/* Thời gian thực tập chi tiết */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Thời gian thực tập
            </p>
            <p>
              {internship.start_date
                ? dayjs(internship.start_date).format("DD/MM/YYYY")
                : "—"}{" "}
              -{" "}
              {internship.end_date
                ? dayjs(internship.end_date).format("DD/MM/YYYY")
                : "—"}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // ============ RENDER ============

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Hồ sơ thực tập"
          subtitle="Thông tin tổng quan về kỳ thực tập, đề tài và giảng viên hướng dẫn."
        />
        <div className="mt-4 flex justify-center">
          <Spin />
        </div>
      </div>
    );
  }

  const hasInternship = !!internship;
  const isPending =
    !hasInternship && registration && registration.status === "pending";

  const isRejected =
    !hasInternship && registration && registration.status === "rejected";

  const nothing =
    !hasInternship && (!registration || registration.status === "rejected");

  return (
    <div className="p-6 flex flex-col gap-4">
      <PageHeader
        title="Hồ sơ thực tập"
        subtitle="Theo dõi trạng thái duyệt đề tài và thông tin kỳ thực tập của bạn."
      />

      {/* Nếu có internship → luôn ưu tiên hiển thị */}
      {hasInternship && renderInternshipDetail()}

      {/* Nếu chưa có internship nhưng đang pending */}
      {!hasInternship && isPending && renderPendingRegistration()}

      {/* Nếu bị từ chối */}
      {!hasInternship && isRejected && (
        <Alert
          type="error"
          showIcon
          message="Đề tài thực tập của bạn đã bị từ chối"
          description="Vui lòng liên hệ giảng viên phụ trách hoặc đăng ký một đề tài khác."
        />
      )}

      {/* Nếu chưa đăng ký gì */}
      {nothing && (
        <Card className="border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-700">
            Bạn chưa có hồ sơ thực tập nào. Hãy vào mục{" "}
            <span className="font-semibold">Danh sách đề tài</span> để đăng ký
            một đề tài thực tập.
          </p>
        </Card>
      )}
    </div>
  );
};

export default StudentInternshipProfilePage;
