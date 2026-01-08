import { useEffect, useState } from "react";
import { App, Button, Card, Input, Modal, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { api } from "../../../../services/config";

export default function AttendanceAdminPage() {
  const { message } = App.useApp();

  // attendance list
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // networks
  const [netLoading, setNetLoading] = useState(false);
  const [nets, setNets] = useState<any[]>([]);
  const [netModal, setNetModal] = useState(false);
  const [netName, setNetName] = useState("");
  const [netCidr, setNetCidr] = useState("");

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/admin/list", { params: { page, limit } });
      setItems(res.data.items ?? []);
      setTotal(res.data.meta?.total ?? 0);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được điểm danh");
    } finally {
      setLoading(false);
    }
  };

  const loadNetworks = async () => {
    setNetLoading(true);
    try {
      const res = await api.get("/attendance/admin/networks", { params: { page: 1, limit: 50 } });
      setNets(res.data.items ?? []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không tải được allowlist");
    } finally {
      setNetLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [page, limit]);

  useEffect(() => {
    loadNetworks();
  }, []);

  const createNetwork = async () => {
    if (!netName.trim() || !netCidr.trim()) return message.error("Nhập name và cidr");
    try {
      await api.post("/attendance/admin/networks", { name: netName, cidr: netCidr });
      message.success("Tạo network thành công");
      setNetModal(false);
      setNetName("");
      setNetCidr("");
      loadNetworks();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Tạo network thất bại");
    }
  };

  const toggleNetwork = async (n: any) => {
    try {
      await api.patch(`/attendance/admin/networks/${n.id}`, { is_active: !n.is_active });
      loadNetworks();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const deleteNetwork = async (n: any) => {
    try {
      await api.delete(`/attendance/admin/networks/${n.id}`);
      loadNetworks();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Admin - Điểm danh</div>
        </div>

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
            { title: "Ngày", dataIndex: "attendance_date", render: (v) => dayjs(v).format("DD/MM/YYYY") },
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
              title: "GV",
              render: (_, r) => (
                <div>
                  <div className="font-semibold">{r.lecturer?.full_name ?? "—"}</div>
                  <div className="text-xs text-slate-500">{r.lecturer?.lecturer_code ?? "—"}</div>
                </div>
              ),
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (v) => <Tag>{v ?? "—"}</Tag>,
            },
            { title: "Check-in", dataIndex: "check_in_hhmm", render: (v) => v ?? "—" },
            { title: "Check-out", dataIndex: "check_out_hhmm", render: (v) => v ?? "—" },
            { title: "Verify", dataIndex: "verified_method", render: (v) => v ?? "—" },
          ]}
        />
      </Card>

      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 14 } }}>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Allowlist IP trường</div>
          <Button type="primary" onClick={() => setNetModal(true)}>
            Thêm network
          </Button>
        </div>

        <Table
          className="mt-4"
          rowKey={(r) => String(r.id)}
          loading={netLoading}
          dataSource={nets}
          pagination={false}
          columns={[
            { title: "Name", dataIndex: "name" },
            { title: "CIDR", dataIndex: "cidr" },
            {
              title: "Active",
              render: (_, r) => (
                <Tag color={r.is_active ? "green" : "default"}>{r.is_active ? "ON" : "OFF"}</Tag>
              ),
            },
            {
              title: "Action",
              render: (_, r) => (
                <Space>
                  <Button onClick={() => toggleNetwork(r)}>{r.is_active ? "Tắt" : "Bật"}</Button>
                  <Button danger onClick={() => deleteNetwork(r)}>Xoá</Button>
                </Space>
              ),
            },
          ]}
        />

        <Modal
          open={netModal}
          title="Thêm allowlist"
          okText="Tạo"
          cancelText="Hủy"
          onOk={createNetwork}
          onCancel={() => setNetModal(false)}
        >
          <Space direction="vertical" className="w-full">
            <Input value={netName} onChange={(e) => setNetName(e.target.value)} placeholder="Tên" />
            <Input value={netCidr} onChange={(e) => setNetCidr(e.target.value)} placeholder="CIDR (vd 203.0.113.10/32)" />
          </Space>
        </Modal>
      </Card>
    </div>
  );
}
