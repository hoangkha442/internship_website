

import { App, Button, Drawer, Form, Input, InputNumber, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import type { ProgressReport } from "../../../../../services/reportApi";
import RichTextEditor from "../../../../shared/components/RichTextEditor";

export default function ReportUpsertDrawer(props: {
  open: boolean;
  onClose: () => void;
  loading: boolean;

  mode: "create" | "edit";
  internshipId: string | number;

  initial: ProgressReport | null;
  onSubmit: (args: {
    report_no?: number | null;
    week_no?: number | null;
    title: string;
    content: string; // HTML
    files: File[];
  }) => Promise<void>;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const titleText = props.mode === "create" ? "Nộp báo cáo" : "Cập nhật báo cáo";

  useEffect(() => {
    if (!props.open) return;

    if (props.mode === "edit" && props.initial) {
      form.setFieldsValue({
        report_no: props.initial.report_no ?? undefined,
        week_no: props.initial.week_no ?? undefined,
        title: props.initial.title,
        content: props.initial.content,
      });

      const previews =
        props.initial.report_attachments?.map((a: any) => ({
          uid: String(a.id),
          name: a.description || a.file_path.split("/").pop() || "file",
          status: "done" as const,
          url: a.file_path,
        })) ?? [];

      setFileList(previews);
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [props.open, props.mode, props.initial, form]);

  const beforeUpload = () => false;

  const handleFinish = async (values: any) => {
    try {
      const files: File[] = [];
      for (const f of fileList) {
        if ((f as any).originFileObj) files.push((f as any).originFileObj as File);
      }

      await props.onSubmit({
        report_no: values.report_no ?? null,
        week_no: values.week_no ?? null,
        title: values.title,
        content: values.content,
        files,
      });
    } catch (e: any) {
      message.error(e?.message || "Không thể submit");
    }
  };

  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={titleText}
      size={560}
      extra={
        <Button type="primary" loading={props.loading} onClick={() => form.submit()}>
          Lưu
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="report_no" label="Report No" tooltip="VD: 1,2,3...">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="week_no" label="Week No" tooltip="VD: 1..12">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Nhập tiêu đề" }]}
        >
          <Input placeholder="Nộp đề cương / Báo cáo tuần..." />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung"
          rules={[
            {
              validator: async (_, value) => {
                const stripped = String(value || "")
                  .replace(/<(.|\n)*?>/g, "")
                  .replace(/&nbsp;/g, " ")
                  .trim();
                if (!stripped) throw new Error("Nhập nội dung");
              },
            },
          ]}
          valuePropName="value"
          getValueFromEvent={(v) => v}
        >
          <RichTextEditor placeholder="Đã làm được gì? chưa làm được gì? ,.." />
        </Form.Item>

        <Form.Item label="File đính kèm">
          <Upload
            multiple
            beforeUpload={beforeUpload}
            fileList={fileList}
            onChange={(info) => setFileList(info.fileList)}
          >
            <Button>Chọn file</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
