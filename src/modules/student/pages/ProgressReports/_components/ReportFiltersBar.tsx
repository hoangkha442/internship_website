

// import { App, Button, Drawer, Form, Input, InputNumber, Upload } from "antd";
// import type { UploadFile } from "antd/es/upload/interface";
// import { useEffect, useState } from "react";
// import type { ProgressReport } from "../../../../../services/reportApi";
// import RichTextEditor from "../../../../shared/components/RichTextEditor";

// export default function ReportUpsertDrawer(props: {
//   open: boolean;
//   onClose: () => void;
//   loading: boolean;

//   mode: "create" | "edit";
//   internshipId: string | number;

//   initial: ProgressReport | null;
//   onSubmit: (args: {
//     report_no?: number | null;
//     week_no?: number | null;
//     title: string;
//     content: string;
//     files: File[];
//   }) => Promise<void>;
// }) {
//   const { message } = App.useApp();
//   const [form] = Form.useForm();

//   const [fileList, setFileList] = useState<UploadFile[]>([]);

//   const titleText = props.mode === "create" ? "Nộp báo cáo" : "Cập nhật báo cáo";

//   useEffect(() => {
//     if (!props.open) return;

//     if (props.mode === "edit" && props.initial) {
//       form.setFieldsValue({
//         report_no: props.initial.report_no ?? undefined,
//         week_no: props.initial.week_no ?? undefined,
//         title: props.initial.title,
//         content: props.initial.content,
//       });

//       const previews =
//         props.initial.report_attachments?.map((a) => ({
//           uid: String(a.id),
//           name: a.description || a.file_path.split("/").pop() || "file",
//           status: "done" as const,
//           url: a.file_path,
//         })) ?? [];

//       setFileList(previews);
//     } else {
//       form.resetFields();
//       setFileList([]);
//     }
//   }, [props.open, props.mode, props.initial, form]);

//   const beforeUpload = () => false; // không upload tự động

//   const handleFinish = async (values: any) => {
//     try {
//       const files: File[] = [];
//       for (const f of fileList) {
//         if ((f as any).originFileObj) files.push((f as any).originFileObj as File);
//       }

//       await props.onSubmit({
//         report_no: values.report_no ?? null,
//         week_no: values.week_no ?? null,
//         title: values.title,
//         content: values.content,
//         files,
//       });
//     } catch (e: any) {
//       message.error(e?.message || "Không thể submit");
//     }
//   };

//   return (
//     <Drawer
//       open={props.open}
//       onClose={props.onClose}
//       title={titleText}
//       width={560}
//       extra={
//         <Button type="primary" loading={props.loading} onClick={() => form.submit()}>
//           Lưu
//         </Button>
//       }
//     >
//       <Form form={form} layout="vertical" onFinish={handleFinish}>
//         <div className="grid grid-cols-2 gap-3">
//           <Form.Item name="report_no" label="Report No" tooltip="VD: 1,2,3...">
//             <InputNumber min={1} style={{ width: "100%" }} />
//           </Form.Item>

//           <Form.Item name="week_no" label="Week No" tooltip="VD: 1..12">
//             <InputNumber min={1} style={{ width: "100%" }} />
//           </Form.Item>
//         </div>

//         <Form.Item
//           name="title"
//           label="Tiêu đề"
//           rules={[{ required: true, message: "Nhập tiêu đề" }]}
//         >
//           <Input placeholder="Nộp đề cương / báo cáo / final..." />
//         </Form.Item>

//         <Form.Item
//           name="content"
//           label="Nội dung"
//           rules={[
//             {
//               validator: async (_, value) => {
//                 const stripped = String(value || "")
//                   .replace(/<(.|\n)*?>/g, "")
//                   .replace(/&nbsp;/g, " ")
//                   .trim();
//                 if (!stripped) throw new Error("Nhập nội dung");
//               },
//             },
//           ]}
//         >
//           <RichTextEditor placeholder="Soạn như viết email..." />
//         </Form.Item>

//         <Form.Item label="File đính kèm">
//           <Upload
//             multiple
//             beforeUpload={beforeUpload}
//             fileList={fileList}
//             onChange={(info) => setFileList(info.fileList)}
//           >
//             <Button>Chọn file</Button>
//           </Upload>

//           <div className="text-xs text-slate-500 mt-2">
//             Nếu đang sửa báo cáo: file cũ chỉ để xem. Muốn đổi file thì chọn file mới.
//           </div>
//         </Form.Item>
//       </Form>
//     </Drawer>
//   );
// }

import { Button, DatePicker, Input, Select, Tag } from "antd";
import { Dayjs } from "dayjs";
import { useMemo } from "react";
import type { ReportFileFilter, ReportSort, ReportStatus } from "../../../../../services/reportApi";

const { RangePicker } = DatePicker;

export type StatusFilter = "all" | ReportStatus;
export type FileFilter = ReportFileFilter;
export type SortFilter = ReportSort;

export default function ReportFiltersBar(props: {
  q: string;
  setQ: (v: string) => void;

  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (v: [Dayjs | null, Dayjs | null] | null) => void;

  status: StatusFilter;
  setStatus: (v: StatusFilter) => void;

  hasFile: FileFilter;
  setHasFile: (v: FileFilter) => void;

  sort: SortFilter;
  setSort: (v: SortFilter) => void;

  onReset: () => void;

  visibleCount: number;
  total: number;
}) {
  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      { value: "submitted", label: "Đã nộp" },
      { value: "needs_revision", label: "Cần chỉnh sửa" },
      { value: "reviewed", label: "Đã duyệt" },
    ],
    []
  );

  const fileOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      { value: "has", label: "Có file" },
      { value: "none", label: "Không file" },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "submitted_desc", label: "Nộp mới nhất" },
      { value: "submitted_asc", label: "Nộp cũ nhất" },
      { value: "week_desc", label: "Tuần giảm dần" },
      { value: "week_asc", label: "Tuần tăng dần" },
    ],
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <Input
        value={props.q}
        onChange={(e) => props.setQ(e.target.value)}
        placeholder="Tìm trong title/content/feedback..."
        style={{ width: 260 }}
        allowClear
      />

      <RangePicker
        value={props.dateRange as any}
        onChange={(v) => props.setDateRange(v as any)}
        allowEmpty={[true, true]}
      />

      <Select
        value={props.status}
        onChange={props.setStatus as any}
        options={statusOptions}
        style={{ width: 150 }}
      />

      <Select
        value={props.hasFile}
        onChange={props.setHasFile as any}
        options={fileOptions}
        style={{ width: 140 }}
      />

      <Select
        value={props.sort}
        onChange={props.setSort as any}
        options={sortOptions}
        style={{ width: 160 }}
      />

      <Button onClick={props.onReset}>Reset</Button>

      <div className="ml-auto flex items-center gap-2">
        <Tag>Hiển thị: {props.visibleCount}</Tag>
        <Tag>Tổng: {props.total}</Tag>
      </div>
    </div>
  );
}
