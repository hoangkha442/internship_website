import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Table,
  Tag,
  Popconfirm,
  Select,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNotification } from '../../../provider/Notification'
import type {
  CreateStudentPayload,
  Student,
  StudentListResponse,
  UpdateStudentPayload,
} from '../../shared/types/student'
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from '../../../services/studentApi'
import PageHeader from '../../shared/components/PageHeader'
import AdminStudentForm from '../_components/addStudentForm'

const { Option } = Select

const AdminStudentsPage = () => {
  const { notify } = useNotification()

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  // filter state
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'inactive'>('all')

  const loadStudents = async (pageParam = 1, limitParam = 10) => {
    setLoading(true)
    try {
      const res: StudentListResponse = await getStudents({
        page: pageParam,
        limit: limitParam,
      })

      setStudents(res.items)
      setPage(res.meta.page)
      setLimit(res.meta.limit)
      setTotal(res.meta.total)
    } catch {
      notify('error', 'Không tải được danh sách sinh viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents(page, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTableChange = (pagination: any) => {
    const newPage = pagination.current
    const newLimit = pagination.pageSize
    setPage(newPage)
    setLimit(newLimit)
    loadStudents(newPage, newLimit)
  }

  const openCreateModal = () => {
    setEditingStudent(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEditModal = (student: Student) => {
    setEditingStudent(student)
    form.setFieldsValue({
      full_name: student.full_name,
      email: student.email,
      is_active: student.is_active ?? true,
      student_code: student.student_code,
      phone: student.phone,
      class_id: student.class_id,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number | string) => {
    try {
      await deleteStudent(id)
      notify('success', 'Xóa tài khoản sinh viên thành công')
      loadStudents(page, limit)
    } catch {
      notify('error', 'Không thể xóa tài khoản sinh viên')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      if (editingStudent) {
        const payload: UpdateStudentPayload = {
          full_name: values.full_name,
          email: values.email,
          is_active: values.is_active ?? true,
          student_code: values.student_code,
          phone: values.phone,
          class_id: values.class_id,
        }
        await updateStudent(editingStudent.id, payload)
        notify('success', 'Cập nhật sinh viên thành công')
      } else {
        const payload: CreateStudentPayload = {
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          student_code: values.student_code,
          phone: values.phone,
          class_id: values.class_id,
        }
        await createStudent(payload)
        notify('success', 'Tạo sinh viên mới thành công')
      }

      setIsModalOpen(false)
      loadStudents(page, limit)
    } catch (err: any) {
      if (!err?.errorFields) {
        notify('error', err?.message || 'Đã xảy ra lỗi')
      }
    } finally {
      setSaving(false)
    }
  }

  // lọc trên data hiện tại của page
  const filteredStudents = students.filter((s) => {
    const keyword = searchText.trim().toLowerCase()
    const matchSearch =
      !keyword ||
      s.full_name?.toLowerCase().includes(keyword) ||
      s.email?.toLowerCase().includes(keyword)

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? s.is_active === true
          : s.is_active === false

    return matchSearch && matchStatus
  })

  const columns: ColumnsType<Student> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: 'Mã SV',
      dataIndex: 'student_code',
      width: 110,
      ellipsis: true,
      render: (value: string | undefined) =>
        value ? (
          value
        ) : (
          <span className="text-xs text-slate-400">Chưa có</span>
        ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: 'Lớp',
      dataIndex: 'class_name',
      ellipsis: true,
      render: (value: string | undefined) =>
        value || <span className="text-xs text-slate-400">Chưa gán lớp</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 120,
      render: (value?: boolean) =>
        value ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Tạm khóa</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 190,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sinh viên"
            description="Bạn có chắc chắn muốn xóa tài khoản này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quản lý sinh viên"
          subtitle="Danh sách tài khoản sinh viên trong hệ thống"
        />

        <button
          type="button"
          onClick={openCreateModal}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add New Student</span>
        </button>
      </div>

      <Card className="shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <Input
            allowClear
            size="large"
            placeholder="Tìm theo tên hoặc email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="sm:w-64"
          />

          <Select
            size="large"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ minWidth: 180 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="active">Đang hoạt động</Option>
            <Option value="inactive">Tạm khóa</Option>
          </Select>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredStudents}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (t) => `${t} sinh viên`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        open={isModalOpen}
        title={editingStudent ? 'Cập nhật sinh viên' : 'Thêm sinh viên'}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editingStudent ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <AdminStudentForm isEditing={!!editingStudent} />
        </Form>
      </Modal>
    </div>
  )
}

export default AdminStudentsPage
