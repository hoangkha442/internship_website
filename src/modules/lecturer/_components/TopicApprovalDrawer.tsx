import { Button, Drawer, Empty, Input, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import type {
  InternshipTopic,
  TopicRegistration,
} from "../../../services/lecturerApi";

type Props = {
  open: boolean;
  onClose: () => void;

  topic: InternshipTopic | null;
  loading: boolean;
  items: TopicRegistration[];

  onApprove: (registrationId: string | number, note?: string) => Promise<void>;
  onReject: (registrationId: string | number, reason: string) => Promise<void>;
};

export default function TopicApprovalDrawer({
  open,
  onClose,
  topic,
  loading,
  items,
  onApprove,
  onReject,
}: Props) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = a.registered_at ? new Date(a.registered_at).getTime() : 0;
      const tb = b.registered_at ? new Date(b.registered_at).getTime() : 0;
      return ta - tb;
    });
  }, [items]);

  const columns: ColumnsType<TopicRegistration> = useMemo(() => {
    return [
      { title: "#", width: 60, render: (_v, _r, idx) => idx + 1 },
      {
        title: "Sinh viên",
        render: (_, r) => {
          const st = r.students;
          const name = st?.users?.full_name ?? "—";
          const code = st?.student_code ?? "—";
          const cls = st?.classes?.class_name ?? st?.classes?.name ?? "—";
          const email = st?.users?.email ?? "—";
          return (
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">{name}</div>
              <div className="text-xs text-slate-500">
                Mã: <b>{code}</b> · Lớp: <b>{cls}</b> · {email}
              </div>
            </div>
          );
        },
      },
      {
        title: "Đăng ký lúc",
        width: 170,
        render: (_, r) => (
          <span className="text-sm text-slate-700">
            {r.registered_at
              ? dayjs(r.registered_at).format("DD/MM/YYYY HH:mm")
              : "—"}
          </span>
        ),
      },
      {
        title: "Trạng thái",
        width: 120,
        // render: (_, r) => <Tag color="gold">Pending</Tag>,
        // render: (_) => <Tag color="gold">Pending</Tag>,
        render: (_, r) => {
          const s = r.status;
          if (s === "approved") return <Tag color="green">Approved</Tag>;
          if (s === "rejected") return <Tag color="red">Rejected</Tag>;
          return <Tag color="gold">Pending</Tag>;
        },
      },
      {
        title: "",
        width: 190,
        render: (_, r: any) => (
          <div className="flex justify-end gap-2">
            <Button
              size="small"
              onClick={() => {
                setActiveId(r.id);
                setReason("");
                setRejectOpen(true);
              }}
            >
              Từ chối
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setActiveId(r.id);
                setNote("");
                setApproveOpen(true);
              }}
            >
              Duyệt
            </Button>
          </div>
        ),
      },
    ];
  }, []);

  const handleApprove = async () => {
    if (activeId == null) return;
    try {
      setActionLoading(true);
      await onApprove(activeId, note.trim() || undefined);
      setApproveOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (activeId == null) return;
    if (!reason.trim()) return;
    try {
      setActionLoading(true);
      await onReject(activeId, reason.trim());
      setRejectOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        size="large"
        title={<div className="font-semibold">Duyệt sinh viên đăng ký</div>}
        styles={{ body: { padding: 16 } }}
        destroyOnHidden
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
          <div className="text-sm text-slate-500">Đề tài</div>
          <div className="text-base font-semibold text-slate-900 mt-1">
            {topic?.title ?? "—"}
          </div>

          <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-4">
            <span>
              Slot:{" "}
              <b>
                {topic?.current_students ?? 0}/{topic?.max_students ?? 0}
              </b>
            </span>
            <span>
              Trạng thái:{" "}
              {topic?.status === "full" ? (
                <Tag color="red">Đã đủ</Tag>
              ) : topic?.status === "closed" ? (
                <Tag>Đóng</Tag>
              ) : (
                <Tag color="green">Còn trống</Tag>
              )}
            </span>
          </div>
        </div>

        {!loading && sortedItems.length === 0 ? (
          <Empty description="Chưa có sinh viên đăng ký (pending) cho đề tài này." />
        ) : (
          <Table
            rowKey={(r) => String(r.id)}
            loading={loading}
            columns={columns}
            dataSource={sortedItems}
            pagination={false}
          />
        )}
      </Drawer>

      <Modal
        open={approveOpen}
        onCancel={() => setApproveOpen(false)}
        onOk={handleApprove}
        okText="Duyệt"
        cancelText="Hủy"
        confirmLoading={actionLoading}
        title="Duyệt đăng ký"
      >
        <div className="text-sm text-slate-600 mb-2">
          Ghi chú cho sinh viên (không bắt buộc)
        </div>
        <Input.TextArea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Em liên hệ GV để nhận yêu cầu chi tiết..."
        />
      </Modal>

      <Modal
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={handleReject}
        okText="Từ chối"
        cancelText="Hủy"
        confirmLoading={actionLoading}
        okButtonProps={{ danger: true, disabled: !reason.trim() }}
        title="Từ chối đăng ký"
      >
        <div className="text-sm text-slate-600 mb-2">
          Lý do từ chối (bắt buộc)
        </div>
        <Input.TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="VD: Đề tài đã đủ slot / chưa phù hợp..."
        />
      </Modal>
    </>
  );
}
