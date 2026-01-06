// import { Drawer, Form, Input, Button, DatePicker, Upload, Typography, message } from "antd"
// import type { UploadFile } from "antd/es/upload/interface"
// import dayjs from "dayjs"
// import { useMemo, useState } from "react"

// const { Text } = Typography
// const { TextArea } = Input

// type Props = {
//   open: boolean
//   onClose: () => void
//   internshipId: string | number | null
//   loading?: boolean
//   onSubmit: (fd: FormData) => Promise<void>
//   initial?: {
//     id?: string | number
//     work_date?: string
//     content?: string
//     attachments?: { name: string; url: string }[]
//   } | null
//   mode?: "create" | "edit"
// }

// export function CreateWorklogDrawer({
//   open,
//   onClose,
//   internshipId,
//   loading,
//   onSubmit,
//   initial,
//   mode = "create",
// }: Props) {
//   const [form] = Form.useForm()
//   const [fileList, setFileList] = useState<UploadFile[]>([])

//   const title = useMemo(() => (mode === "edit" ? "Sửa worklog" : "Tạo worklog"), [mode])

//   const resetAll = () => {
//     form.resetFields()
//     setFileList([])
//   }

//   const beforeUpload = (file: File) => {
//     const maxMB = 20
//     const ok = file.size / 1024 / 1024 <= maxMB
//     if (!ok) message.error(`File quá lớn (>${maxMB}MB)`)
//     return ok ? false : Upload.LIST_IGNORE // chặn auto upload, mình submit bằng FormData
//   }

//   const handleFinish = async (values: any) => {
//     if (!internshipId) return

//     const fd = new FormData()
//     fd.append("internship_id", String(internshipId))
//     fd.append("work_date", dayjs(values.work_date).format("YYYY-MM-DD"))
//     fd.append("content", values.content)

//     // field name: attachments
//     fileList.forEach((f) => {
//       if (f.originFileObj) fd.append("attachments", f.originFileObj)
//     })

//     await onSubmit(fd)
//     resetAll()
//     onClose()
//   }

//   // mở drawer edit thì set sẵn data (nếu bạn muốn edit)
//   // ở đây mình chỉ set form value; attachment cũ hiển thị ở list bên ngoài để đơn giản
//   // (edit attachments: dùng fileList mới để replace)
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const syncInitial = () => {
//     if (!open) return
//     if (!initial) {
//       form.setFieldsValue({ work_date: dayjs(), content: "" })
//       setFileList([])
//       return
//     }
//     form.setFieldsValue({
//       work_date: initial.work_date ? dayjs(initial.work_date) : dayjs(),
//       content: initial.content ?? "",
//     })
//     setFileList([])
//   }

//   // sync when open changes
//   if (open) syncInitial()

//   return (
//     <Drawer
//       open={open}
//       onClose={() => {
//         resetAll()
//         onClose()
//       }}
//       size="large"
//       title={<div className="font-semibold">{title}</div>}
//       styles={{ body: { padding: 16 } }}
//       destroyOnHidden
//     >
//       <div className="mb-3">
//         <Text type="secondary">
//           Internship ID: <span className="text-slate-900 font-medium">{internshipId ?? "—"}</span>
//         </Text>
//       </div>

//       <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ work_date: dayjs() }}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <Form.Item
//             label="Ngày làm việc"
//             name="work_date"
//             rules={[{ required: true, message: "Chọn ngày" }]}
//           >
//             <DatePicker className="w-full" format="DD/MM/YYYY" />
//           </Form.Item>
//         </div>

//         <Form.Item
//           label="Nội dung công việc"
//           name="content"
//           rules={[{ required: true, message: "Nhập nội dung worklog" }]}
//         >
//           <TextArea rows={5} placeholder="VD: Hôm nay em làm module upload cloudinary..." />
//         </Form.Item>

//         <Form.Item label="Đính kèm (pdf, ảnh, doc...)">
//           <Upload.Dragger
//             multiple
//             fileList={fileList}
//             beforeUpload={beforeUpload}
//             onChange={(info) => setFileList(info.fileList)}
//             onRemove={(file) => {
//               setFileList((prev) => prev.filter((x) => x.uid !== file.uid))
//               return true
//             }}
//           >
//             <div className="py-5">
//               <div className="font-medium">Kéo thả file vào đây</div>
//               <div className="text-xs text-slate-500 mt-1">File sẽ upload khi bấm “Lưu worklog”.</div>
//             </div>
//           </Upload.Dragger>
//         </Form.Item>

//         <div className="flex justify-end gap-2 pt-2">
//           <Button onClick={() => { resetAll(); onClose() }}>Hủy</Button>
//           <Button type="primary" htmlType="submit" loading={loading} disabled={!internshipId}>
//             {mode === "edit" ? "Cập nhật" : "Lưu worklog"}
//           </Button>
//         </div>
//       </Form>
//     </Drawer>
//   )
// }

import {
  Drawer,
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  Typography,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
  open: boolean;
  onClose: () => void;
  internshipId: string | number | null;
  loading?: boolean;
  onSubmit: (fd: FormData) => Promise<void>;
  initial?: {
    id?: string | number;
    work_date?: string;
    content?: string;
    attachments?: { name: string; url: string }[];
  } | null;
  mode?: "create" | "edit";
};

export function CreateWorklogDrawer({
  open,
  onClose,
  internshipId,
  loading,
  onSubmit,
  initial,
  mode = "create",
}: Props) {
  const [form] = Form.useForm();

  // ===== files state (nguồn dữ liệu thật) =====
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxMB = 20;

  const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

  const addFiles = (picked: File[]) => {
    const okFiles = picked.filter((f) => {
      const ok = f.size / 1024 / 1024 <= maxMB;
      if (!ok) message.error(`File "${f.name}" quá lớn (>${maxMB}MB)`);
      return ok;
    });

    setFiles((prev) => {
      const existed = new Set(prev.map(fileKey));
      const next = [...prev];
      okFiles.forEach((f) => {
        const k = fileKey(f);
        if (!existed.has(k)) next.push(f);
      });
      return next;
    });
  };

  const removeByUid = (uid: string) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== uid));
  };

  const openFilePickerPreferDownloads = async () => {
    try {
      const w = window as any;

      if (w.showOpenFilePicker) {
        const handles = await w.showOpenFilePicker({
          multiple: true,
          startIn: "downloads",
        });

        const picked: File[] = await Promise.all(
          handles.map((h: any) => h.getFile())
        );
        addFiles(picked);
        return;
      }
    } catch {}

    inputRef.current?.click();
  };

  const uploadFileList: UploadFile[] = useMemo(() => {
    return files.map((f) => ({
      uid: fileKey(f),
      name: f.name,
      status: "done",
      originFileObj: f as any,
    }));
  }, [files]);

  const title = useMemo(
    () => (mode === "edit" ? "Sửa worklog" : "Tạo worklog"),
    [mode]
  );

  const resetAll = () => {
    form.resetFields();
    setFiles([]);
  };

  // ===== sync initial khi mở drawer =====
  useEffect(() => {
    if (!open) return;

    if (!initial) {
      form.setFieldsValue({ work_date: dayjs(), content: "" });
      setFiles([]);
      return;
    }

    form.setFieldsValue({
      work_date: initial.work_date ? dayjs(initial.work_date) : dayjs(),
      content: initial.content ?? "",
    });

    // Edit: để đơn giản, không auto load lại attachment cũ vào list upload
    setFiles([]);
  }, [open, initial, form]);

  const handleFinish = async (values: any) => {
    if (!internshipId) return;

    const fd = new FormData();
    fd.append("internship_id", String(internshipId));
    fd.append("work_date", dayjs(values.work_date).format("YYYY-MM-DD"));
    fd.append("content", values.content);

    // field name: attachments
    files.forEach((f) => fd.append("attachments", f));

    await onSubmit(fd);
    resetAll();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={() => {
        resetAll();
        onClose();
      }}
      size="large"
      title={<div className="font-semibold">{title}</div>}
      styles={{ body: { padding: 16 } }}
      destroyOnHidden
    >
      <div className="mb-3">
        <Text type="secondary">
          Internship ID:{" "}
          <span className="text-slate-900 font-medium">
            {internshipId ?? "—"}
          </span>
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ work_date: dayjs() }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Form.Item
            label="Ngày làm việc"
            name="work_date"
            rules={[{ required: true, message: "Chọn ngày" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        <Form.Item
          label="Nội dung công việc"
          name="content"
          rules={[{ required: true, message: "Nhập nội dung worklog" }]}
        >
          <TextArea
            rows={5}
            placeholder="VD: Hôm nay em làm module upload..."
          />
        </Form.Item>

        {/* input hidden fallback */}
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files || []);
            addFiles(picked);
            e.currentTarget.value = ""; // chọn lại cùng file vẫn trigger
          }}
        />

        <Form.Item label="Đính kèm (pdf, ảnh, doc...)">
          <Upload.Dragger
            multiple
            openFileDialogOnClick={false}
            fileList={uploadFileList}
            onDrop={(e) => {
              const dropped = Array.from(e.dataTransfer.files || []);
              addFiles(dropped);
            }}
            beforeUpload={() => Upload.LIST_IGNORE}
            onRemove={(file) => {
              removeByUid(file.uid);
              return true;
            }}
            className="worklog-dragger" // để CSS target dễ hơn
          >
            <div className="relative py-5">
              {/* Overlay hiện khi drag hover */}
              <div className="drop-hint pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl px-4 py-2 bg-white shadow">
                  <div className="font-semibold">Thả file để thêm</div>
                  <div className="text-xs text-slate-500">
                    Hỗ trợ kéo thả nhiều file
                  </div>
                </div>
              </div>

              {/* Nội dung bình thường (sẽ mờ đi khi hover) */}
              <div className="drag-content">
                <div className="font-medium">Kéo thả file vào đây</div>
                <div className="text-xs text-slate-500 mt-1">
                  File sẽ upload khi bấm “Lưu worklog”.
                </div>

                <div className="mt-3">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openFilePickerPreferDownloads();
                    }}
                  >
                    Chọn file (ưu tiên Downloads)
                  </Button>
                </div>

                <div className="text-xs text-slate-500 mt-2">
                  Giới hạn: ≤ {maxMB}MB / file.
                </div>
              </div>
            </div>
          </Upload.Dragger>
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            onClick={() => {
              resetAll();
              onClose();
            }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!internshipId}
          >
            {mode === "edit" ? "Cập nhật" : "Lưu worklog"}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
