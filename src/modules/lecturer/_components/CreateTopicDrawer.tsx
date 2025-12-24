import { Drawer, Form, Input, Button, InputNumber, Typography } from 'antd'
import type { CreateTopicPayload } from '../../../services/lecturerApi'

const { Text } = Typography
const { TextArea } = Input

export default function CreateTopicDrawer(props: {
  open: boolean
  onClose: () => void
  termName?: string
  termId?: string | number | null
  loading?: boolean
  onSubmit: (payload: CreateTopicPayload) => Promise<void>
}) {
  const { open, onClose, termName, termId, loading, onSubmit } = props
  const [form] = Form.useForm<Omit<CreateTopicPayload, 'term_id'>>()

  const handleFinish = async (values: any) => {
    if (!termId) return
    await onSubmit({
      term_id: String(termId),
      title: values.title,
      description: values.description ?? null,
      company_name: values.company_name ?? null,
      company_address: values.company_address ?? null,
      max_students: values.max_students ?? 3,
    })
    form.resetFields()
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size='large'
      title="Tạo đề tài"
      styles={{ body: { padding: 16 } }}
    >
      <div className="mb-3">
        <Text type="secondary">
          Kỳ đang chọn: <span className="text-slate-900 font-medium">{termName || '—'}</span>
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Tên đề tài"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }]}
        >
          <Input placeholder="VD: Xây dựng hệ thống quản lý thực tập" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <TextArea rows={4} placeholder="Mô tả phạm vi, yêu cầu, output..." />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Form.Item label="Tên công ty" name="company_name">
            <Input placeholder="VD: ABC Software" />
          </Form.Item>
          <Form.Item label="Số lượng tối đa" name="max_students" initialValue={3}>
            <InputNumber min={1} max={50} className="w-full" />
          </Form.Item>
        </div>

        <Form.Item label="Địa chỉ công ty" name="company_address">
          <Input placeholder="VD: Quận 1, TP.HCM" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading} disabled={!termId}>
            Tạo đề tài
          </Button>
        </div>
      </Form>
    </Drawer>
  )
}
