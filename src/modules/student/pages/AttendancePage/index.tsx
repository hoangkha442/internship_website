import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  DatePicker,
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

export default function AttendancePage() {
  const { message } = App.useApp();

  const isDev = import.meta.env.DEV;
  const [devIp, setDevIp] = useState<string>(
    () => localStorage.getItem("dev_ip") || "203.0.113.10"
  );

  const [loadingToday, setLoadingToday] = useState(false);
  const [recordToday, setRecordToday] = useState<any>(null);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    null,
    null,
  ]);

  // loading riêng cho action checkin/checkout
  const [actionLoading, setActionLoading] = useState<null | "checkin" | "checkout">(null);

  const checkedIn = !!recordToday?.check_in_time;
  const checkedOut = !!recordToday?.check_out_time;

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

  }, []);

  const confirmAction = async (type: "checkin" | "checkout") => {
    if (actionLoading) return; // tránh spam
    applyDevIpHeader();

    // loading nhẹ lúc lấy location
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
      // tắt loading "đang lấy location"
      setActionLoading(null);
    }

    const title = type === "checkin" ? "Xác nhận Check-in" : "Xác nhận Check-out";

    // tạo modal instance để update loading ok button
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
      okButtonProps: { disabled: !!actionLoading || loadingToday || loadingHistory },
      onOk: async () => {
        // bật loading cho OK
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
        title: "Xác thực",
        dataIndex: "verified_method",
        render: (v) => <Tag>{v || "—"}</Tag>,
        responsive: ["md"],
      },
      {
        title: "Duyệt",
        render: (_, r) => {
          if (r.approved_at) return <Tag color="green">Đã duyệt</Tag>;
          if (r.rejection_reason) return <Tag color="red">Bị từ chối</Tag>;
          return <Tag>Chưa duyệt</Tag>;
        },
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
              {recordToday?.verified_method ? <Tag>{recordToday.verified_method}</Tag> : null}
            </div>
          </div>

          <Space wrap>
            <Button
              type="primary"
              onClick={() => confirmAction("checkin")}
              disabled={checkedIn || loadingToday || loadingHistory || !!actionLoading}
              loading={actionLoading === "checkin"}
            >
              Check-in
            </Button>

            <Button
              onClick={() => confirmAction("checkout")}
              disabled={!checkedIn || checkedOut || loadingToday || loadingHistory || !!actionLoading}
              loading={actionLoading === "checkout"}
            >
              Check-out
            </Button>
          </Space>
        </div>

        {isDev ? (
          <div className="mt-4 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 mb-2">
              DEV: giả lập “WiFi trường” bằng header <b>x-dev-ip</b> (backend sẽ đọc nếu NODE_ENV !=
              production)
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

            <Button
              onClick={() => loadHistory(1, limit)}
              loading={loadingHistory}
              disabled={loadingToday || !!actionLoading}
            >
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
    </div>
  );
}
