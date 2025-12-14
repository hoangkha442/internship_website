import { useEffect, useMemo, useState } from 'react'
import { Card, Tag, Button, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { useNotification } from '../../../../provider/Notification'
import { getInternship_topics, registerTopic } from '../../../../services/studentApi'
import type { InternshipTopic } from '../../../shared/types/internship'
import type { SmartTableParams } from '../../../shared/components/SmartTable'
import SmartTable from '../../../shared/components/SmartTable'


const StudentTopicsPage = () => {
  const { notify } = useNotification()

  const [topics, setTopics] = useState<InternshipTopic[]>([])
  const [loading, setLoading] = useState(false)
  const [registeringId, setRegisteringId] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  console.log('total: ', total);
  const [search, setSearch] = useState('')

  const loadTopics = async (pageParam = 1, limitParam = 10) => {
    setLoading(true)
    try {
      const res: any = await getInternship_topics({
        page: pageParam,
        limit: limitParam,
      })

      setTopics(res.items)
      setPage(res.meta.page)
      setLimit(res.meta.limit)
      setTotal(res.meta.total)
    } catch (err) {
      notify('error', 'Không tải được danh sách đề tài')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTopics(page, limit)
  }, [])

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return topics
    return topics.filter((t) =>
      [t.title, t.company_name, t.company_address]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [topics, search])

  const totalFiltered = filteredTopics.length

  const handleTableParamsChange = (params: SmartTableParams<InternshipTopic>) => {
    const {
      pagination: { page: newPage, pageSize: newPageSize },
      searchText,
    } = params

    setPage(newPage)
    setLimit(newPageSize)
    setSearch(searchText)
  }

  const handleRegisterTopic = (topic: InternshipTopic) => {
    const isFull =
      topic.current_students >= topic.max_students ||
      topic.status !== 'available'

    if (isFull) return

    Modal.confirm({
      title: 'Xác nhận đăng ký đề tài',
      content: (
        <div className="text-sm">
          <p className="font-medium mb-1">{topic.title}</p>
          <p>Công ty: {topic.company_name}</p>

          <p className="mt-2 text-xs text-slate-500">
            Sau khi đăng ký, bạn sẽ chờ giảng viên duyệt đề tài.
          </p>
        </div>
      ),
      okText: 'Đăng ký',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setRegisteringId(topic.id)

          await registerTopic({
            topic_id: String(topic.id),
          })

          notify('success', 'Đăng ký thành công, vui lòng chờ giảng viên duyệt!')
          loadTopics(page, limit)
        } catch (err: any) {
          notify(
            'error',
            err?.response?.data?.message || 'Đăng ký đề tài thất bại'
          )
        } finally {
          setRegisteringId(null)
        }
      },
    })
  }

  const columns: ColumnsType<InternshipTopic> = [
    {
      title: 'Đề tài',
      dataIndex: 'title',
      render: (v: string, record) => (
        <div>
          <div className="font-medium">{v}</div>
          {record.description && (
            <div className="text-xs text-slate-500 mt-1">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Công ty',
      dataIndex: 'company_name',
      width: 220,
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium">{record.company_name}</div>
          <div className="text-xs text-slate-500">{record.company_address}</div>
        </div>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: ['lecturers', 'lecturer_code'],
      width: 160,
      render: (_, record) => {
        const gv = record.lecturers
        if (!gv) return '—'
        return (
          <div className="text-sm">
            <div className="font-medium">{gv.lecturer_code}</div>
            <div className="text-xs text-slate-500">{gv.department}</div>
          </div>
        )
      },
    },
    {
      title: 'Số lượng',
      key: 'slots',
      width: 120,
      render: (_, record) => (
        <span>{record.current_students}/{record.max_students}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (_, record) => {
        const isFull =
          record.current_students >= record.max_students

        if (record.status !== 'available') return <Tag>Đóng</Tag>
        if (isFull) return <Tag color="red">Đã đủ</Tag>
        return <Tag color="green">Còn trống</Tag>
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) => {
        const isFull =
          record.current_students >= record.max_students ||
          record.status !== 'available'

        const isLoading = registeringId === record.id

        return (
          <Button
            type="primary"
            size="small"
            disabled={isFull || isLoading}
            loading={isLoading}
            onClick={() => handleRegisterTopic(record)}
          >
            {isFull ? 'Không thể đăng ký' : 'Đăng ký'}
          </Button>
        )
      },
    },
  ]

  return (
    <div className="p-6 flex flex-col gap-4">
      <Card>
        <SmartTable<InternshipTopic>
          columns={columns}
          dataSource={filteredTopics}
          rowKey="id"
          loading={loading}
          page={page}
          pageSize={limit}
          total={totalFiltered}
          onParamsChange={handleTableParamsChange}
          searchPlaceholder="Tìm theo tên đề tài, công ty..."
          scrollX="max-content"
        />
      </Card>
    </div>
  )
}

export default StudentTopicsPage
