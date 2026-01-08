import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { attendanceApi, getLaptopLocation } from "../../../../services/attendanceApi";
import { api } from "../../../../services/config";

dayjs.extend(utc);

const { Text } = Typography;
const { RangePicker } = DatePicker;

const fmtDate = (v?: any) => (v ? dayjs(v).utc().format("DD/MM/YYYY") : "—");
const fmtTime = (v?: any) => (v ? dayjs(v).utc().format("HH:mm:ss") : "—");

const statusTag = (st?: string | null) => {
  if (!st) return <Tag>—</Tag>;
  const map: Record<string, { label: string; color: string }> = {
    present: { label: "Có mặt", color: "green" },
    late: { label: "Đi muộn", color: "orange" },
    absent: { label: "Vắng", color: "red" },
    excused: { label: "Có phép", color: "blue" },
  };
  const x = map[st] ?? { label: st, color: "default" };
  return <Tag color={x.color}>{x.label}</Tag>;
};

const approvalTag = (r: any) => {
  const isLeave = r?.status === "absent" || r?.status === "excused";
  if (!isLeave) return <Tag>—</Tag>;

  if (r.approved_at) return <Tag color="green">Đã duyệt</Tag>;
  if (r.rejection_reason) return <Tag color="red">Bị từ chối</Tag>;
  return <Tag color="gold">Chờ duyệt</Tag>;
};

export default function AttendancePage() {
  const { message } = App.useApp();

  const isDev = import.meta.env.DEV;
  const [devIp, setDevIp] = useState<string>(() => localStorage.getItem("dev_ip") || "203.0.113.10");

  const [loadingToday, setLoadingToday] = useState(false);
  const [recordToday, setRecordToday] = useState<any>(null);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // loading riêng cho action checkin/checkout
  const [actionLoading, setActionLoading] = useState<null | "checkin" | "checkout">(null);

  // ===== Xin nghỉ modal =====
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm] = Form.useForm();

  const checkedIn = !!recordToday?.check_in_time;
  const checkedOut = !!recordToday?.check_out_time;

  // Nếu đã xin nghỉ (excused) và chưa bị reject -> không cho checkin/checkout nữa
  const hasLeaveRequestActive =
    recordToday?.status === "excused" && !recordToday?.rejection_reason && !recordToday?.check_in_time && !recordToday?.check_out_time;

  const applyDevIpHeader = () => {
    if (!isDev) return;
    const ip = String(devIp || "").trim();
    if (!ip) return;
    api.defaults.headers.common["x-dev-ip"] = ip;
    localStorage.setItem("dev_ip", ip);
  };

  const loadToday = async () => {
    setLoadingToday(true);
    try {
      const res = await attendanceApi.today();
      setRecordToday(res.record);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được trạng thái hôm nay");
      setRecordToday(null);
    } finally {
      setLoadingToday(false);
    }
  };

  const loadHistory = async (p = page, l = limit) => {
    setLoadingHistory(true);
    try {
      const from = range[0] ? range[0].format("YYYY-MM-DD") : undefined;
      const to = range[1] ? range[1].format("YYYY-MM-DD") : undefined;

      const res = await attendanceApi.history({ page: p, limit: l, from, to });
      setItems(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
      setPage(res.meta?.page ?? p);
      setLimit(res.meta?.limit ?? l);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được lịch sử điểm danh");
      setItems([]);
      setTotal(0);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    applyDevIpHeader();
    loadToday();
    loadHistory(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmAction = async (type: "checkin" | "checkout") => {
    if (actionLoading) return; // tránh spam
    applyDevIpHeader();

    setActionLoading(type);

    let pos: { lat: number; lng: number; accuracy_m: number } | null = null;
    try {
      pos = await getLaptopLocation();
    } catch (err: any) {
      Modal.error({
        title: "Không lấy được vị trí",
        content:
          err?.code === 3
            ? "Lấy vị trí bị Timeout. Hãy bật Location của máy/Chrome và thử lại."
            : err?.message || "Hãy bật quyền Location cho trình duyệt.",
      });
      setActionLoading(null);
      return;
    } finally {
      setActionLoading(null);
    }

    const title = type === "checkin" ? "Xác nhận Check-in" : "Xác nhận Check-out";

    const modal = Modal.confirm({
      title,
      content: (
        <div className="text-sm">
          <div>
            Vị trí: <b>{pos.lat.toFixed(6)}</b>, <b>{pos.lng.toFixed(6)}</b>
          </div>
          <div>
            Sai số: <b>{pos.accuracy_m}m</b>
          </div>
          <div className="mt-2 text-slate-500">
            Hệ thống sẽ kiểm tra bạn đang ở WiFi trường (IP) hoặc trong khu vực trường (GPS).
          </div>
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Huỷ",
      onOk: async () => {
        setActionLoading(type);
        modal.update({ okButtonProps: { loading: true } });

        try {
          if (type === "checkin") {
            await attendanceApi.checkIn(pos!);
            message.success("Check-in thành công");
          } else {
            await attendanceApi.checkOut(pos!);
            message.success("Check-out thành công");
          }

          await Promise.all([loadToday(), loadHistory(1, limit)]);
        } catch (e: any) {
          message.error(e?.response?.data?.message || e?.message || "Thao tác thất bại");
        } finally {
          setActionLoading(null);
          modal.update({ okButtonProps: { loading: false } });
        }
      },
    });
  };

  // ====== Xin nghỉ (Student) ======
  const openLeaveModal = () => {
    leaveForm.setFieldsValue({
      date: dayjs(), // mặc định hôm nay
      reason: "",
    });
    setLeaveOpen(true);
  };

  const submitLeave = async () => {
    try {
      const values = await leaveForm.validateFields();
      const date = values.date.format("YYYY-MM-DD");
      const reason = String(values.reason || "").trim();

      setLeaveSubmitting(true);

      // ✅ mặc định có phép (excused) + lý do bắt buộc
      await attendanceApi.requestLeave({
        date,
        status: "excused",
        reason,
      });

      message.success("Gửi xin nghỉ (có phép) thành công");
      setLeaveOpen(false);

      await Promise.all([loadToday(), loadHistory(1, limit)]);
    } catch (e: any) {
      // validateFields sẽ throw object (không phải axios) -> ignore
      if (e?.errorFields) return;

      message.error(e?.response?.data?.message || e?.message || "Gửi xin nghỉ thất bại");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      {
        title: "Ngày",
        dataIndex: "attendance_date",
        render: (v) => <span className="font-medium">{fmtDate(v)}</span>,
      },
      {
        title: "Check-in",
        dataIndex: "check_in_time",
        render: (v) => fmtTime(v),
      },
      {
        title: "Check-out",
        dataIndex: "check_out_time",
        render: (v) => fmtTime(v),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        render: (v) => statusTag(v),
      },
      {
        title: "Lý do",
        dataIndex: "reason",
        render: (v, r) => {
          const isLeave = r?.status === "absent" || r?.status === "excused";
          return isLeave ? <span>{v || "—"}</span> : <span>—</span>;
        },
        responsive: ["md"],
      },
      {
        title: "Duyệt",
        render: (_, r) => approvalTag(r),
        responsive: ["lg"],
      },
    ],
    []
  );

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* TODAY */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-semibold text-slate-900">Điểm danh hôm nay</div>
            <div className="text-sm text-slate-600 mt-1">
              Ngày: <b>{fmtDate(recordToday?.attendance_date || new Date())}</b>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Tag color={checkedIn ? "green" : "default"}>
                Check-in: {checkedIn ? fmtTime(recordToday.check_in_time) : "Chưa"}
              </Tag>
              <Tag color={checkedOut ? "blue" : "default"}>
                Check-out: {checkedOut ? fmtTime(recordToday.check_out_time) : "Chưa"}
              </Tag>

              {statusTag(recordToday?.status)}
              {(recordToday?.status === "absent" || recordToday?.status === "excused") ? approvalTag(recordToday) : null}
            </div>

            {/* show rejection reason if any */}
            {recordToday?.rejection_reason ? (
              <div className="mt-2 text-sm">
                <Tag color="red">Lý do từ chối</Tag>{" "}
                <span className="text-slate-700">{recordToday.rejection_reason}</span>
              </div>
            ) : null}
          </div>

          <Space wrap>
            <Button
              type="primary"
              onClick={() => confirmAction("checkin")}
              disabled={checkedIn || loadingToday || loadingHistory || !!actionLoading || hasLeaveRequestActive}
              loading={actionLoading === "checkin"}
            >
              Check-in
            </Button>

            <Button
              onClick={() => confirmAction("checkout")}
              disabled={!checkedIn || checkedOut || loadingToday || loadingHistory || !!actionLoading || hasLeaveRequestActive}
              loading={actionLoading === "checkout"}
            >
              Check-out
            </Button>

            <Button
              onClick={openLeaveModal}
              disabled={loadingToday || loadingHistory || !!actionLoading || checkedIn || checkedOut || hasLeaveRequestActive}
            >
              Xin nghỉ
            </Button>
          </Space>
        </div>

        {isDev ? (
          <div className="mt-4 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 mb-2">
              DEV: giả lập “WiFi trường” bằng header <b>x-dev-ip</b> (backend sẽ đọc nếu NODE_ENV != production)
            </div>
            <Space wrap>
              <Input
                value={devIp}
                onChange={(e) => setDevIp(e.target.value)}
                placeholder="VD: 203.0.113.10"
                style={{ width: 220 }}
              />
              <Button onClick={applyDevIpHeader} disabled={loadingToday || loadingHistory || !!actionLoading}>
                Áp dụng
              </Button>
              <Text type="secondary">
                Hiện tại: {String(api.defaults.headers.common["x-dev-ip"] || "chưa set")}
              </Text>
            </Space>
          </div>
        ) : null}
      </Card>

      {/* HISTORY */}
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-lg font-semibold text-slate-900">Lịch sử điểm danh</div>

          <Space wrap>
            <RangePicker
              value={range}
              onChange={(v) => setRange((v as any) ?? [null, null])}
              format="DD/MM/YYYY"
              allowClear
            />

            <Button onClick={() => loadHistory(1, limit)} loading={loadingHistory} disabled={loadingToday || !!actionLoading}>
              Lọc
            </Button>

            <Button
              disabled={loadingHistory || loadingToday || !!actionLoading}
              onClick={() => {
                setRange([null, null]);
                setTimeout(() => loadHistory(1, limit), 0);
              }}
            >
              Reset
            </Button>
          </Space>
        </div>

        <div className="mt-3">
          <Table
            rowKey={(r) => String(r.id)}
            loading={loadingHistory}
            columns={columns}
            dataSource={items}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              onChange: (p, ps) => loadHistory(p, ps),
            }}
          />
        </div>
      </Card>

      {/* LEAVE MODAL */}
      <Modal
        open={leaveOpen}
        title="Gửi xin nghỉ (có phép)"
        okText="Gửi"
        cancelText="Huỷ"
        onCancel={() => setLeaveOpen(false)}
        onOk={submitLeave}
        okButtonProps={{ loading: leaveSubmitting }}
        destroyOnClose
      >
        <Form form={leaveForm} layout="vertical">
          <Form.Item
            label="Ngày xin nghỉ"
            name="date"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Lý do (bắt buộc)"
            name="reason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do xin nghỉ" },
              { min: 5, message: "Lý do quá ngắn" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do xin nghỉ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
