import { App, Button, Drawer, Form, InputNumber, Select } from "antd";
import type { ProgressReport, ReviewReportPayload } from "../../../../../services/reportApi";
import RichTextEditor from "../../../../shared/components/RichTextEditor";
import { useEffect } from "react";

export default function LecturerReportReviewDrawer(props: {
  open: boolean;
  onClose: () => void;
  loading: boolean;

  initial: ProgressReport | null;

  onSubmit: (payload: ReviewReportPayload) => Promise<void>;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!props.open) return;

    if (props.initial) {
      form.setFieldsValue({
        status: props.initial.status ?? "submitted",
        score: props.initial.score ?? null,
        is_pass: props.initial.is_pass ?? null,
        feedback: props.initial.feedback ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [props.open, props.initial, form]);

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
      width={640}
      extra={
        <Button type="primary" loading={props.loading} onClick={() => form.submit()}>
          Lưu duyệt
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="status"
          label="Kết quả duyệt"
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
          <Form.Item name="score" label="Điểm" tooltip="Có thể để trống">
            <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="is_pass"
            label="Pass/Fail"
            tooltip="NULL = chưa kết luận (pending)"
          >
            <Select
              allowClear
              placeholder="Chọn kết luận"
              options={[
                { value: true as any, label: "Pass" },
                { value: false as any, label: "Fail" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="feedback"
          label="Feedback"
          valuePropName="value"
          getValueFromEvent={(v) => v}
        >
          <RichTextEditor placeholder="Viết nhận xét như email..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
