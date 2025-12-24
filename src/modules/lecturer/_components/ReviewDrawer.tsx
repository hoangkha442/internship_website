import { Button, Card, Drawer, Form, Input, InputNumber, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { reviewWorklog, type Worklog } from "../../../services/worklogApi";

const { Text } = Typography;

type Props = {
  open: boolean;
  worklog: Worklog | null;
  onClose: () => void;
  onSaved: (payload: { score: number | null; feedback: string | null }) => void;
};

const isReviewed = (w: Worklog) => (w.score != null) || (w.feedback && String(w.feedback).trim());

export default function ReviewDrawer({ open, worklog, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<{ score?: number | null; feedback?: string | null }>();

  useEffect(() => {
    if (!worklog) return;
    form.setFieldsValue({ score: worklog.score ?? null, feedback: worklog.feedback ?? null });
  }, [worklog]); // eslint-disable-line

  const save = async () => {
    if (!worklog) return;
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = { score: values.score ?? null, feedback: values.feedback ?? null };
      await reviewWorklog(worklog.id, payload);

      onSaved(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={780}
      title="Review báo cáo"
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          <Button type="primary" loading={saving} onClick={save}>
            Lưu
          </Button>
        </Space>
      }
    >
      {!worklog ? null : (
        <div className="flex flex-col gap-3">
          <Card size="small" className="border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-500">Ngày</div>
                <div className="text-sm font-semibold text-slate-900">
                  {dayjs(worklog.work_date).format("DD/MM/YYYY")}
                </div>
              </div>
              <div>{isReviewed(worklog) ? <Tag color="green">Đã phản hồi</Tag> : <Tag color="gold">Chờ phản hồi</Tag>}</div>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Nội dung</div>
              <div className="text-sm text-slate-800 whitespace-pre-wrap">{worklog.content || "—"}</div>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Tệp đính kèm</div>
              {!worklog.work_log_attachments || worklog.work_log_attachments.length === 0 ? (
                <Text type="secondary">Không có file.</Text>
              ) : (
                <div className="flex flex-col gap-1">
                  {worklog.work_log_attachments.map((a: any) => (
                    <a
                      key={String(a.id)}
                      href={a.file_path}
                      target="_blank"
                      rel="noreferrer"
                      style={{ maxWidth: 720, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {a.description ?? a.public_id?.split("/").pop() ?? "Xem file"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card size="small" className="border border-slate-200">
            <Form form={form} layout="vertical">
              <Form.Item label="Điểm (0 - 10)" name="score">
                <InputNumber min={0} max={10} step={0.5} className="w-full" placeholder="VD: 8.5" />
              </Form.Item>

              <Form.Item label="Feedback" name="feedback">
                <Input.TextArea rows={4} placeholder="Góp ý cho sinh viên..." />
              </Form.Item>

              <div className="text-xs text-slate-500">Có thể để trống score/feedback nếu muốn “xoá phản hồi”.</div>
            </Form>
          </Card>
        </div>
      )}
    </Drawer>
  );
}
