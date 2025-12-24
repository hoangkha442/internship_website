import { Drawer, Form, Input, Button, DatePicker, Upload, Typography, message } from "antd"
import type { UploadFile } from "antd/es/upload/interface"
import dayjs from "dayjs"
import { useMemo, useState } from "react"

const { Text } = Typography
const { TextArea } = Input

type Props = {
  open: boolean
  onClose: () => void
  internshipId: string | number | null
  loading?: boolean
  onSubmit: (fd: FormData) => Promise<void>
  initial?: {
    id?: string | number
    work_date?: string
    content?: string
    attachments?: { name: string; url: string }[]
  } | null
  mode?: "create" | "edit"
}

export function CreateWorklogDrawer({
  open,
  onClose,
  internshipId,
  loading,
  onSubmit,
  initial,
  mode = "create",
}: Props) {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const title = useMemo(() => (mode === "edit" ? "Sửa worklog" : "Tạo worklog"), [mode])

  const resetAll = () => {
    form.resetFields()
    setFileList([])
  }

  const beforeUpload = (file: File) => {
    const maxMB = 20
    const ok = file.size / 1024 / 1024 <= maxMB
    if (!ok) message.error(`File quá lớn (>${maxMB}MB)`)
    return ok ? false : Upload.LIST_IGNORE // chặn auto upload, mình submit bằng FormData
  }

  const handleFinish = async (values: any) => {
    if (!internshipId) return

    const fd = new FormData()
    fd.append("internship_id", String(internshipId))
    fd.append("work_date", dayjs(values.work_date).format("YYYY-MM-DD"))
    fd.append("content", values.content)

    // field name: attachments
    fileList.forEach((f) => {
      if (f.originFileObj) fd.append("attachments", f.originFileObj)
    })

    await onSubmit(fd)
    resetAll()
    onClose()
  }

  // mở drawer edit thì set sẵn data (nếu bạn muốn edit)
  // ở đây mình chỉ set form value; attachment cũ hiển thị ở list bên ngoài để đơn giản
  // (edit attachments: dùng fileList mới để replace)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncInitial = () => {
    if (!open) return
    if (!initial) {
      form.setFieldsValue({ work_date: dayjs(), content: "" })
      setFileList([])
      return
    }
    form.setFieldsValue({
      work_date: initial.work_date ? dayjs(initial.work_date) : dayjs(),
      content: initial.content ?? "",
    })
    setFileList([])
  }

  // sync when open changes
  if (open) syncInitial()

  return (
    <Drawer
      open={open}
      onClose={() => {
        resetAll()
        onClose()
      }}
      size="large"
      title={<div className="font-semibold">{title}</div>}
      styles={{ body: { padding: 16 } }}
      destroyOnHidden
    >
      <div className="mb-3">
        <Text type="secondary">
          Internship ID: <span className="text-slate-900 font-medium">{internshipId ?? "—"}</span>
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ work_date: dayjs() }}>
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
          <TextArea rows={5} placeholder="VD: Hôm nay em làm module upload cloudinary..." />
        </Form.Item>

        <Form.Item label="Đính kèm (pdf, ảnh, doc...)">
          <Upload.Dragger
            multiple
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={(info) => setFileList(info.fileList)}
            onRemove={(file) => {
              setFileList((prev) => prev.filter((x) => x.uid !== file.uid))
              return true
            }}
          >
            <div className="py-5">
              <div className="font-medium">Kéo thả file vào đây</div>
              <div className="text-xs text-slate-500 mt-1">File sẽ upload khi bấm “Lưu worklog”.</div>
            </div>
          </Upload.Dragger>
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={() => { resetAll(); onClose() }}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading} disabled={!internshipId}>
            {mode === "edit" ? "Cập nhật" : "Lưu worklog"}
          </Button>
        </div>
      </Form>
    </Drawer>
  )
}
