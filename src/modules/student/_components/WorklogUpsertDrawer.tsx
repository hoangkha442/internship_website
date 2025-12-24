import {
  Drawer,
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  Typography,
  Modal,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { Worklog } from "../../../services/worklogApi";
import { EyeOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  mode: "create" | "edit";
  internshipId: string | number;
  initial?: Worklog | null;
  onSubmit: (args: {
    work_date: string;
    content: string;
    files: File[];
    replaceAttachments?: boolean;
  }) => Promise<void>;
};

type FormValues = {
  work_date: any;
  content: string;
};

export default function WorklogUpsertDrawer({
  open,
  onClose,
  loading,
  mode,
  internshipId,
  initial,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");

  const getExt = (nameOrUrl: string) => {
    const s = (nameOrUrl || "").toLowerCase();
    const clean = s.split("?")[0];
    return clean.includes(".") ? clean.split(".").pop() || "" : "";
  };

  const isImage = (s: string) =>
    ["png", "jpg", "jpeg", "webp", "gif"].includes(getExt(s));
  const isPdf = (s: string) => getExt(s) === "pdf";
  const title = mode === "create" ? "Tạo worklog" : "Sửa worklog";

  const initialDate = useMemo(() => {
    if (!initial?.work_date) return dayjs();
    return dayjs(initial.work_date);
  }, [initial?.work_date]);

  useEffect(() => {
    if (!open) return;

    // set form
    form.setFieldsValue({
      work_date: initial ? initialDate : dayjs(),
      content: initial?.content ?? "",
    });

    const existing = (initial?.work_log_attachments ?? []).map((a: any) => ({
      uid: `server-${a.id}`,
      name: a.public_id
        ? String(a.public_id).split("/").pop() ?? "file"
        : "file",
      status: "done" as const,
      url: a.file_path,
    }));
    setFileList(existing);
  }, [open, form, initial, initialDate]);

  const handleFinish = async (values: FormValues) => {
    const files = fileList
      .map((f) => (f.originFileObj ? (f.originFileObj as File) : null))
      .filter(Boolean) as File[];

    await onSubmit({
      work_date: dayjs(values.work_date).format("YYYY-MM-DD"),
      content: values.content?.trim() ?? "",
      files,
      replaceAttachments: mode === "edit",
    });

    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="large"
      title={<div className="font-semibold">{title}</div>}
      styles={{ body: { padding: 16 } }}
      destroyOnHidden
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
        <div className="text-sm text-slate-500">Internship ID</div>
        <div className="text-base font-semibold text-slate-900 mt-1">
          {String(internshipId)}
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Ngày làm việc"
          name="work_date"
          rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
        >
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          label="Nội dung"
          name="content"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung" },
            { min: 10, message: "Nội dung phải nhiều hơn 10 ký tự" },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="VD: Hôm nay em làm module upload cloudinary..."
          />
        </Form.Item>

        <div className="mb-2">
          <Text type="secondary">Tệp đính kèm (pdf, hình ảnh...)</Text>
        </div>

        <Upload
          multiple
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: fl }) => setFileList(fl)}
          onPreview={(file) => {
            const url = (file.url as string) || (file.thumbUrl as string) || "";
            if (!url) return;
            setPreviewUrl(url);
            setPreviewName(file.name || "File");
            setPreviewOpen(true);
          }}
        >
          <Button>+ Chọn tệp</Button>
        </Upload>

        <Modal
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          footer={null}
          width={900}
          title={<div className="font-semibold">Preview: {previewName}</div>}
          destroyOnHidden
        >
          {!previewUrl ? (
            <div className="text-slate-500">Không có URL để preview.</div>
          ) : isImage(previewUrl) ? (
            <img
              src={previewUrl}
              alt={previewName}
              style={{ width: "100%", borderRadius: 12 }}
            />
          ) : isPdf(previewUrl) ? (
            <iframe
              src={previewUrl}
              title={previewName}
              style={{
                width: "100%",
                height: 650,
                border: "none",
                borderRadius: 12,
              }}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="text-slate-600">
                Không hỗ trợ preview định dạng này. Bạn có thể mở file bằng
                link.
              </div>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => window.open(previewUrl, "_blank")}
              >
                Mở file
              </Button>
            </div>
          )}
        </Modal>

        <div className="flex justify-end gap-2 pt-6">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === "create" ? "Tạo worklog" : "Lưu thay đổi"}
          </Button>
        </div>

      </Form>
    </Drawer>
  );
}
