

import { useEffect, useMemo, useState } from 'react'
import { Tag, Progress, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNotification } from '../../../provider/Notification'
import type { InternshipWithRelations } from '../../shared/types/terms'
import InternshipDetailCard from './InternshipDetailCard'
import SmartTable, { type SmartTableParams } from '../../shared/components/SmartTable'
// import PageHeader from '../../shared/components/PageHeader'
import { getInternships } from '../../../services/adminApi'


const { Option } = Select

const STATUS_LABEL: Record<string, string> = {
  registered: 'Đã đăng ký',
  in_progress: 'Đang thực tập',
  completed: 'Hoàn thành',
  canceled: 'Hủy',
}

const STATUS_COLOR: Record<string, string> = {
  registered: 'default',
  in_progress: 'processing',
  completed: 'success',
  canceled: 'error',
}

const AdminInternshipsTab = () => {
  const { notify } = useNotification()

  const [rawData, setRawData] = useState<InternshipWithRelations[]>([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [termFilter, setTermFilter] = useState<string | undefined>()
  const [termOptions, setTermOptions] = useState<
    { value: string; label: string }[]
  >([])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = (await getInternships({
        page: 1,
        limit: 1000,
      } as any)) as any

      const items = res.items ?? []
      setRawData(items)

      const termMap = new Map<string, string>()
      items.forEach((item: any) => {
        const term = item.internship_terms
        if (term) termMap.set(term.id, term.term_name)
      })
      setTermOptions(
        Array.from(termMap.entries()).map(([value, label]) => ({
          value,
          label,
        }))
      )
    } catch (err) {
      console.log(err)
      notify('error', 'Không tải được danh sách thực tập')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // áp dụng search + filter client-side
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()

    return rawData.filter((item) => {
      const term = item.internship_terms
      const topic = item.internship_topics
      const student = item.students

      // search theo MSSV, đề tài, công ty, kỳ
      const matchSearch =
        !q ||
        [
          student?.student_code,
          topic?.title,
          topic?.company_name,
          topic?.company_address,
          term?.term_name,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))

      const matchStatus =
        !statusFilter || item.status === statusFilter

      const matchTerm =
        !termFilter ||
        item.term_id === termFilter ||
        item.internship_terms?.id === termFilter

      return matchSearch && matchStatus && matchTerm
    })
  }, [rawData, search, statusFilter, termFilter])

  const total = filteredData.length

  const columns: ColumnsType<InternshipWithRelations> = [
    {
      title: 'MSSV',
      dataIndex: ['students', 'student_code'],
      width: 110,
      render: (_, record) => record.students?.student_code || '—',
    },
    // {
    //   title: 'Sinh viên',
    //   dataIndex: 'student_name',
    //   render: (_, record) => record.students?.id || 'Sinh viên',
    // },
    {
      title: 'Kỳ thực tập',
      dataIndex: ['internship_terms', 'term_name'],
      render: (_, record) => {
        const term = record.internship_terms
        if (!term) return '—'
        return (
          <div className="text-sm text-slate-800 whitespace-normal wrap-break-words">
            <div className="font-medium">{term.term_name}</div>
            <div className="text-xs text-slate-500">
              {dayjs(term.start_date).format('DD/MM/YYYY')} -{' '}
              {dayjs(term.end_date).format('DD/MM/YYYY')}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Đề tài',
      dataIndex: ['internship_topics', 'title'],
      render: (_, record) => (
        <div className="whitespace-normal wrap-break-words max-w-[250px]">
          {record.internship_topics?.title || '—'}
        </div>
      ),
    },
    {
      title: 'Công ty',
      dataIndex: ['internship_topics', 'company_name'],
      render: (_, record) => {
        const topic = record.internship_topics
        if (!topic) return '—'
        return (
          <div className="text-sm text-slate-800 whitespace-normal wrap-break-words">
            <div className="font-medium">{topic.company_name}</div>
            <div className="text-xs text-slate-500">
              {topic.company_address}
            </div>
          </div>
        )
      },
    },
    // {
    //   title: 'GV hướng dẫn',
    //   dataIndex: ['lecturers', 'lecturer_code'],
    //   render: (_, record) =>
    //     record.lecturers?.lecturer_code || 'Chưa phân công',
    // },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      filters: Object.keys(STATUS_LABEL).map((k) => ({
        text: STATUS_LABEL[k],
        value: k,
      })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const color = STATUS_COLOR[record.status] || 'default'
        const label = STATUS_LABEL[record.status] || record.status
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress_percent',
      width: 160,
      sorter: (a, b) =>
        Number(a.progress_percent) - Number(b.progress_percent),
      render: (_, record) => (
        <Progress
          percent={Number(record.progress_percent) || 0}
          size="small"
        />
      ),
    },
    // {
    //   title: 'Thời gian',
    //   key: 'range',
    //   width: 180,
    //   sorter: (a, b) =>
    //     dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
    //   render: (_, record) => (
    //     <span className="text-xs text-slate-700">
    //       {dayjs(record.start_date).format('DD/MM/YYYY')} -{' '}
    //       {dayjs(record.end_date).format('DD/MM/YYYY')}
    //     </span>
    //   ),
    // },
  ]

  const handleTableParamsChange = (
    params: SmartTableParams<InternshipWithRelations>
  ) => {
    const {
      pagination: { page: newPage, pageSize: newPageSize },
      searchText,
    } = params

    setPage(newPage)
    setLimit(newPageSize)
    setSearch(searchText)
    // không gọi API nữa, vì filter/search đều ở client-side
  }

  const handleStatusChange = (value?: string) => {
    setStatusFilter(value || undefined)
    setPage(1)
  }

  const handleTermChange = (value?: string) => {
    setTermFilter(value || undefined)
    setPage(1)
  }

  return (
        <SmartTable<InternshipWithRelations>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          page={page}
          pageSize={limit}
          total={total}
          onParamsChange={handleTableParamsChange}
          searchPlaceholder="Tìm theo MSSV, đề tài, công ty..."
          scrollX="max-content"
          tableClassName="whitespace-normal"
          expandable={{
            expandedRowRender: (record) => (
              <InternshipDetailCard record={record} />
            ),
          }}
          extraFilters={
            <div className="flex flex-wrap gap-2">
              <Select
                allowClear
                placeholder="Lọc trạng thái"
                size="middle"
                style={{ minWidth: 160 }}
                value={statusFilter}
                onChange={handleStatusChange}
              >
                {Object.keys(STATUS_LABEL).map((key) => (
                  <Option key={key} value={key}>
                    {STATUS_LABEL[key]}
                  </Option>
                ))}
              </Select>

              <Select
                allowClear
                placeholder="Lọc theo kỳ thực tập"
                size="middle"
                style={{ minWidth: 200 }}
                value={termFilter}
                onChange={handleTermChange}
                options={termOptions}
              />
            </div>
          }
        />
  )
}

export default AdminInternshipsTab