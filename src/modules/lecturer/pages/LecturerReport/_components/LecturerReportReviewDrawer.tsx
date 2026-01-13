import { App, Button, Drawer, Form, InputNumber, Select } from "antd";
import { useEffect } from "react";
import type { ProgressReport, ReviewReportPayload } from "../../../../../services/reportApi";
import RichTextEditor from "../../../../shared/components/RichTextEditor";

export default function LecturerReportReviewDrawer(props: {
  open: boolean;
  onClose: () => void;
  loading: boolean;

  report: ProgressReport | null;

  onSubmit: (payload: ReviewReportPayload) => Promise<void>;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!props.open) return;

    if (props.report) {
      form.setFieldsValue({
        status: props.report.status ?? "submitted",
        score: props.report.score ?? null,
        is_pass: props.report.is_pass ?? null,
        feedback: props.report.feedback ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [props.open, props.report, form]);

  const handleFinish = async (values: any) => {
    try {
      await props.onSubmit({
        status: values.status,
        score: values.score ?? null,
        is_pass: values.is_pass ?? null,
        feedback: values.feedback ?? null,
      });
    } catch (e: any) {
      message.error(e?.message || "Không thể duyệt");
    }
  };

  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title="Duyệt báo cáo"
      width={620}
      extra={
        <Button type="primary" loading={props.loading} onClick={() => form.submit()}>
          Lưu duyệt
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Chọn trạng thái" }]}
        >
          <Select
            options={[
              { value: "reviewed", label: "Đã duyệt" },
              { value: "needs_revision", label: "Cần chỉnh sửa" },
            ]}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="score" label="Điểm">
            <InputNumber min={0} max={10} step={0.25} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="is_pass" label="Kết luận Pass/Fail">
            <Select
              allowClear
              placeholder="Chưa có kết luận"
              options={[
                { value: true, label: "Pass" },
                { value: false, label: "Fail" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="feedback"
          label="Nhận xét"
          valuePropName="value"
          getValueFromEvent={(v) => v}
        >
          <RichTextEditor placeholder="Góp ý, yêu cầu chỉnh sửa..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
