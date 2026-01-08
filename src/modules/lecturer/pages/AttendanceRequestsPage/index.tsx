import { useEffect, useState } from "react";
import { App, Button, Card, Input, Modal, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { api } from "../../../../services/config";

type Row = any;

export default function AttendanceRequestsPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [rejecting, setRejecting] = useState<Row | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/lecturer/pending-requests", {
        params: { page, limit },
      });
      setItems(res.data.items ?? []);
      setTotal(res.data.meta?.total ?? 0);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được danh sách xin nghỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit]);

  const approve = async (row: Row) => {
    try {
      await api.patch(`/attendance/lecturer/${row.id}/approve`, { note: null });
      message.success("Duyệt thành công");
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Duyệt thất bại");
    }
  };

  const reject = async () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) {
      message.error("Nhập lý do từ chối");
      return;
    }
    try {
      await api.patch(`/attendance/lecturer/${rejecting.id}/reject`, {
        rejection_reason: rejectReason,
      });
      message.success("Từ chối thành công");
      setRejecting(null);
      setRejectReason("");
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Từ chối thất bại");
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="text-lg font-semibold text-slate-900">Duyệt xin nghỉ</div>

        <Table
          className="mt-4"
          rowKey={(r) => String(r.id)}
          loading={loading}
          dataSource={items}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
          columns={[
            {
              title: "Ngày",
              dataIndex: "attendance_date",
              render: (v) => dayjs(v).format("DD/MM/YYYY"),
            },
            {
              title: "SV",
              render: (_, r) => (
                <div>
                  <div className="font-semibold">{r.student?.full_name}</div>
                  <div className="text-xs text-slate-500">
                    {r.student?.student_code} · {r.student?.class_code ?? "—"}
                  </div>
                </div>
              ),
            },
            {
              title: "Loại",
              dataIndex: "status",
              render: (v) =>
                v === "excused" ? <Tag color="blue">Có phép</Tag> : <Tag color="red">Vắng</Tag>,
            },
            { title: "Lý do", dataIndex: "reason", render: (v) => v ?? "—" },
            {
              title: "Hành động",
              render: (_, r) => (
                <Space>
                  <Button type="primary" onClick={() => approve(r)}>
                    Duyệt
                  </Button>
                  <Button danger onClick={() => setRejecting(r)}>
                    Từ chối
                  </Button>
                </Space>
              ),
            },
          ]}
        />

        <Modal
          open={!!rejecting}
          title="Từ chối xin nghỉ"
          onCancel={() => {
            setRejecting(null);
            setRejectReason("");
          }}
          onOk={reject}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Input.TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Nhập lý do từ chối..."
          />
        </Modal>
      </Card>
    </div>
  );
}
