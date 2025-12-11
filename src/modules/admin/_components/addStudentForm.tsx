import { Form, Input, Switch } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
  BookOutlined,
  LockOutlined,
} from '@ant-design/icons'

type Props = {
  isEditing: boolean
}

const AdminStudentForm = ({ isEditing }: Props) => {
  return (
    <>
      <Form.Item
        label="Họ và tên"
        name="full_name"
        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
      >
        <Input
          size="large"
          placeholder="Nguyễn Văn A"
          prefix={<UserOutlined className='text-slate-500! mr-2'/>}
        />
      </Form.Item>

      {/* EMAIL */}
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' },
        ]}
      >
        <Input
          size="large"
          placeholder="student@example.com"
          prefix={<MailOutlined className='text-slate-500! mr-2'/>}
        />
      </Form.Item>

      {/* STUDENT CODE */}
      <Form.Item label="Mã sinh viên" name="student_code">
        <Input
          size="large"
          placeholder="VD: 22IT123"
          prefix={<IdcardOutlined className='text-slate-500! mr-2'/>}
        />
      </Form.Item>

      {/* PHONE */}
      <Form.Item label="Số điện thoại" name="phone">
        <Input
          size="large"
          placeholder="VD: 0901 234 567"
          prefix={<PhoneOutlined className='text-slate-500! mr-2'/>}
        />
      </Form.Item>

      {/* CLASS */}
      <Form.Item label="Lớp" name="class_id">
        <Input
          size="large"
          placeholder="VD: D22CQCN01"
          prefix={<BookOutlined className='text-slate-500! mr-2'/>}
        />
      </Form.Item>

      {/* PASSWORD – chỉ khi tạo mới */}
      {!isEditing && (
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password
            size="large"
            placeholder="Nhập mật khẩu mặc định"
            prefix={<LockOutlined className='text-slate-500! mr-2'/>}
          />
        </Form.Item>
      )}

      {/* STATUS – chỉ khi sửa */}
      {isEditing && (
        <Form.Item
          label="Trạng thái"
          name="is_active"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Hoạt động"
            unCheckedChildren="Khóa"
          />
        </Form.Item>
      )}
    </>
  )
}

export default AdminStudentForm
