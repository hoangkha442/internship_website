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
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { attendanceLecturerApi } from "../../../../services/attendanceLecturerApi";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const fmtDate = (v?: any) => (v ? dayjs(v).format("DD/MM/YYYY") : "—");
const fmtTime = (v?: any) => (v ? dayjs(v).format("HH:mm:ss") : "—");

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

export default function AttendanceLecturerPage() {
  const { message } = App.useApp();

  // ===== LIST TAB =====
  const [loadingList, setLoadingList] = useState(false);
  const [listItems, setListItems] = useState<any[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listLimit, setListLimit] = useState(10);
  const [listTotal, setListTotal] = useState(0);

  const [mode, setMode] = useState<"date" | "range">("range");
  const [oneDate, setOneDate] = useState<dayjs.Dayjs | null>(null);
  const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    null,
    null,
  ]);

  // loading action approve/reject
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadList = async (p = listPage, l = listLimit) => {
    setLoadingList(true);
    try {
      const params: any = { page: p, limit: l };

      if (mode === "date" && oneDate) {
        params.date = oneDate.format("YYYY-MM-DD");
      } else {
        params.from = range[0] ? range[0]!.format("YYYY-MM-DD") : undefined;
        params.to = range[1] ? range[1]!.format("YYYY-MM-DD") : undefined;
      }

      const res = await attendanceLecturerApi.list(params);

      // ✅ BE trả { total,page,limit,totalPages,data }
      setListItems(res.data ?? []);
      setListTotal(res.total ?? 0);
      setListPage(res.page ?? p);
      setListLimit(res.limit ?? l);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được danh sách điểm danh");
      setListItems([]);
      setListTotal(0);
    } finally {
      setLoadingList(false);
    }
  };

  // ===== PENDING TAB =====
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);
  const [pendingTotal, setPendingTotal] = useState(0);

  const [pendingRange, setPendingRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    null,
    null,
  ]);

  const loadPending = async (p = pendingPage, l = pendingLimit) => {
    setLoadingPending(true);
    try {
      const from = pendingRange[0] ? pendingRange[0]!.format("YYYY-MM-DD") : undefined;
      const to = pendingRange[1] ? pendingRange[1]!.format("YYYY-MM-DD") : undefined;

      const res = await attendanceLecturerApi.pending({ page: p, limit: l, from, to });

      // ✅ BE trả { total,page,limit,totalPages,data }
      setPendingItems(res.data ?? []);
      setPendingTotal(res.total ?? 0);
      setPendingPage(res.page ?? p);
      setPendingLimit(res.limit ?? l);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được đơn xin nghỉ");
      setPendingItems([]);
      setPendingTotal(0);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    loadList(1, listLimit);
    loadPending(1, pendingLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openApprove = (row: any) => {
    let note = "";

    Modal.confirm({
      title: "Duyệt điểm danh / đơn xin nghỉ",
      okText: "Duyệt",
      cancelText: "Huỷ",
      content: (
        <div className="text-sm">
          <div>
            Sinh viên: <b>{row.student?.full_name || "—"}</b> ({row.student?.student_code || "—"})
          </div>
          <div>
            Ngày: <b>{fmtDate(row.attendance_date)}</b> — Trạng thái: {statusTag(row.status)}
          </div>

          <div className="mt-3">
            <Input placeholder="Ghi chú (tuỳ chọn)" onChange={(e) => (note = e.target.value)} />
          </div>
        </div>
      ),
      onOk: async () => {
        try {
          setActionLoadingId(String(row.id));
          await attendanceLecturerApi.approve(String(row.id), { note: note.trim() || undefined });
          message.success("Duyệt thành công");
          await Promise.all([loadPending(1, pendingLimit), loadList(1, listLimit)]);
        } catch (e: any) {
          message.error(e?.response?.data?.message || "Duyệt thất bại");
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const openReject = (row: any) => {
    const [f] = Form.useForm();

    Modal.confirm({
      title: "Từ chối",
      okText: "Từ chối",
      okButtonProps: { danger: true },
      cancelText: "Huỷ",
      content: (
        <Form form={f} layout="vertical">
          <Form.Item
            label="Lý do từ chối"
            name="rejection_reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do..." />
          </Form.Item>

          <Form.Item label="Ghi chú (tuỳ chọn)" name="note">
            <Input placeholder="Ghi chú..." />
          </Form.Item>

          <Text type="secondary">
            SV: {row.student?.full_name || "—"} ({row.student?.student_code || "—"}) — {fmtDate(row.attendance_date)}
          </Text>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await f.validateFields();
          setActionLoadingId(String(row.id));
          await attendanceLecturerApi.reject(String(row.id), {
            rejection_reason: String(values.rejection_reason || "").trim(),
            note: String(values.note || "").trim() || undefined,
          });
          message.success("Đã từ chối");
          await Promise.all([loadPending(1, pendingLimit), loadList(1, listLimit)]);
        } catch (e: any) {
          // validateFields ném lỗi -> không cần toast
          if (e?.errorFields) return;
          message.error(e?.response?.data?.message || "Từ chối thất bại");
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const canAct = (r: any) => !r.approved_at && !r.rejection_reason;

  const listColumns: ColumnsType<any> = useMemo(
    () => [
      {
        title: "Ngày",
        dataIndex: "attendance_date",
        render: (v) => <span className="font-medium">{fmtDate(v)}</span>,
      },
      {
        title: "Sinh viên",
        render: (_, r) => (
          <div>
            <div className="font-medium">{r.student?.full_name || "—"}</div>
            <div className="text-xs text-slate-500">
              {r.student?.student_code || "—"} • {r.student?.class_code || "—"}
            </div>
          </div>
        ),
      },
      {
        title: "Check-in",
        render: (_, r) => r.check_in_hhmm || fmtTime(r.check_in_time) || "—",
      },
      {
        title: "Check-out",
        render: (_, r) => r.check_out_hhmm || fmtTime(r.check_out_time) || "—",
      },
      { title: "Trạng thái", dataIndex: "status", render: (v) => statusTag(v) },
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
          return <Tag color="gold">Chờ duyệt</Tag>;
        },
        responsive: ["lg"],
      },
      {
        title: "Hành động",
        render: (_, r) => {
          if (!canAct(r)) return "—";
          return (
            <Space>
              <Button
                type="primary"
                onClick={() => openApprove(r)}
                loading={actionLoadingId === String(r.id)}
              >
                Duyệt
              </Button>
              <Button
                danger
                onClick={() => openReject(r)}
                loading={actionLoadingId === String(r.id)}
              >
                Từ chối
              </Button>
            </Space>
          );
        },
      },
    ],
    [actionLoadingId]
  );

  const pendingColumns: ColumnsType<any> = useMemo(
    () => [
      {
        title: "Ngày",
        dataIndex: "attendance_date",
        render: (v) => <span className="font-medium">{fmtDate(v)}</span>,
      },
      {
        title: "Sinh viên",
        render: (_, r) => (
          <div>
            <div className="font-medium">{r.student?.full_name || "—"}</div>
            <div className="text-xs text-slate-500">
              {r.student?.student_code || "—"} • {r.student?.class_code || "—"}
            </div>
          </div>
        ),
      },
      { title: "Trạng thái", dataIndex: "status", render: (v) => statusTag(v) },
      {
        title: "Lý do xin nghỉ",
        dataIndex: "reason",
        render: (v) => <span>{v || "—"}</span>,
      },
      {
        title: "Hành động",
        render: (_, r) => {
          if (!canAct(r)) return "—";
          return (
            <Space>
              <Button
                type="primary"
                onClick={() => openApprove(r)}
                loading={actionLoadingId === String(r.id)}
              >
                Duyệt
              </Button>
              <Button
                danger
                onClick={() => openReject(r)}
                loading={actionLoadingId === String(r.id)}
              >
                Từ chối
              </Button>
            </Space>
          );
        },
      },
    ],
    [actionLoadingId]
  );

  return (
    <div className="p-6">
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="text-lg font-semibold text-slate-900">Giảng viên • Quản lý điểm danh</div>

        <Tabs
          className="mt-3"
          items={[
            {
              key: "list",
              label: "Danh sách điểm danh",
              children: (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <Space wrap>
                      <Button type={mode === "range" ? "primary" : "default"} onClick={() => setMode("range")}>
                        Theo khoảng
                      </Button>
                      <Button type={mode === "date" ? "primary" : "default"} onClick={() => setMode("date")}>
                        Theo 1 ngày
                      </Button>

                      {mode === "date" ? (
                        <DatePicker value={oneDate} onChange={(v) => setOneDate(v)} format="DD/MM/YYYY" allowClear />
                      ) : (
                        <RangePicker
                          value={range}
                          onChange={(v) => setRange((v as any) ?? [null, null])}
                          format="DD/MM/YYYY"
                          allowClear
                        />
                      )}

                      <Button onClick={() => loadList(1, listLimit)} loading={loadingList}>
                        Lọc
                      </Button>
                    </Space>

                    <Text type="secondary">Tổng: {listTotal}</Text>
                  </div>

                  <Table
                    rowKey={(r) => String(r.id)}
                    loading={loadingList}
                    columns={listColumns}
                    dataSource={listItems}
                    pagination={{
                      current: listPage,
                      pageSize: listLimit,
                      total: listTotal,
                      showSizeChanger: true,
                      pageSizeOptions: [5, 10, 20, 50],
                      onChange: (p, ps) => loadList(p, ps),
                    }}
                  />
                </>
              ),
            },
            {
              key: "pending",
              label: "Đơn xin nghỉ chờ duyệt",
              children: (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <Space wrap>
                      <RangePicker
                        value={pendingRange}
                        onChange={(v) => setPendingRange((v as any) ?? [null, null])}
                        format="DD/MM/YYYY"
                        allowClear
                      />
                      <Button onClick={() => loadPending(1, pendingLimit)} loading={loadingPending}>
                        Lọc
                      </Button>
                      <Button
                        onClick={() => {
                          setPendingRange([null, null]);
                          setTimeout(() => loadPending(1, pendingLimit), 0);
                        }}
                      >
                        Reset
                      </Button>
                    </Space>

                    <Text type="secondary">Tổng: {pendingTotal}</Text>
                  </div>

                  <Table
                    rowKey={(r) => String(r.id)}
                    loading={loadingPending}
                    columns={pendingColumns}
                    dataSource={pendingItems}
                    pagination={{
                      current: pendingPage,
                      pageSize: pendingLimit,
                      total: pendingTotal,
                      showSizeChanger: true,
                      pageSizeOptions: [5, 10, 20, 50],
                      onChange: (p, ps) => loadPending(p, ps),
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
