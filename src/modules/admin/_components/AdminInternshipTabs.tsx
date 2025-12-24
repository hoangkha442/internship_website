

// import { useEffect, useMemo, useState } from 'react'
// import { Tag, Progress, Select } from 'antd'
// import type { ColumnsType } from 'antd/es/table'
// import dayjs from 'dayjs'
// import { useNotification } from '../../../provider/Notification'
// import type { InternshipWithRelations } from '../../shared/types/terms'
// import InternshipDetailCard from './InternshipDetailCard'
// import SmartTable, { type SmartTableParams } from '../../shared/components/SmartTable'
// // import PageHeader from '../../shared/components/PageHeader'
// import { getInternships } from '../../../services/adminApi'


// const { Option } = Select

// const STATUS_LABEL: Record<string, string> = {
//   registered: 'Đã đăng ký',
//   in_progress: 'Đang thực tập',
//   completed: 'Hoàn thành',
//   canceled: 'Hủy',
// }

// const STATUS_COLOR: Record<string, string> = {
//   registered: 'default',
//   in_progress: 'processing',
//   completed: 'success',
//   canceled: 'error',
// }

// const AdminInternshipsTab = () => {
//   const { notify } = useNotification()

//   const [rawData, setRawData] = useState<InternshipWithRelations[]>([])
//   console.log('rawData: ', rawData);
//   const [loading, setLoading] = useState(false)

//   const [page, setPage] = useState(1)
//   const [limit, setLimit] = useState(10)
//   const [search, setSearch] = useState('')
//   const [statusFilter, setStatusFilter] = useState<string | undefined>()
//   const [termFilter, setTermFilter] = useState<string | undefined>()
//   const [termOptions, setTermOptions] = useState<
//     { value: string; label: string }[]
//   >([])

//   const loadData = async () => {
//     setLoading(true)
//     try {
//       const res = (await getInternships({
//         page: 1,
//         limit: 1000,
//       } as any)) as any

//       const items = res.items ?? []
//       setRawData(items)

//       const termMap = new Map<string, string>()
//       items.forEach((item: any) => {
//         const term = item.internship_terms
//         if (term) termMap.set(term.id, term.term_name)
//       })
//       setTermOptions(
//         Array.from(termMap.entries()).map(([value, label]) => ({
//           value,
//           label,
//         }))
//       )
//     } catch (err) {
//       console.log(err)
//       notify('error', 'Không tải được danh sách thực tập')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadData()
//   }, [])

//   // áp dụng search + filter client-side
//   const filteredData = useMemo(() => {
//     const q = search.trim().toLowerCase()

//     return rawData.filter((item) => {
//       const term = item.internship_terms
//       const topic = item.internship_topics
//       const student = item.students

//       // search theo MSSV, đề tài, công ty, kỳ
//       const matchSearch =
//         !q ||
//         [
//           student?.student_code,
//           topic?.title,
//           topic?.company_name,
//           topic?.company_address,
//           term?.term_name,
//         ]
//           .filter(Boolean)
//           .some((v) => String(v).toLowerCase().includes(q))

//       const matchStatus =
//         !statusFilter || item.status === statusFilter

//       const matchTerm =
//         !termFilter ||
//         item.term_id === termFilter ||
//         item.internship_terms?.id === termFilter

//       return matchSearch && matchStatus && matchTerm
//     })
//   }, [rawData, search, statusFilter, termFilter])

//   const total = filteredData.length

//   const columns: ColumnsType<InternshipWithRelations> = [
//     {
//       title: 'MSSV',
//       dataIndex: ['students', 'student_code'],
//       width: 110,
//       render: (_, record) => record.students?.student_code || '—',
//     },
//     // {
//     //   title: 'Sinh viên',
//     //   dataIndex: 'student_name',
//     //   render: (_, record) => record.students?.id || 'Sinh viên',
//     // },
//     {
//       title: 'Kỳ thực tập',
//       dataIndex: ['internship_terms', 'term_name'],
//       render: (_, record) => {
//         const term = record.internship_terms
//         if (!term) return '—'
//         return (
//           <div className="text-sm text-slate-800 whitespace-normal wrap-wrap-break-words">
//             <div className="font-medium">{term.term_name}</div>
//             <div className="text-xs text-slate-500">
//               {dayjs(term.start_date).format('DD/MM/YYYY')} -{' '}
//               {dayjs(term.end_date).format('DD/MM/YYYY')}
//             </div>
//           </div>
//         )
//       },
//     },
//     {
//       title: 'Đề tài',
//       dataIndex: ['internship_topics', 'title'],
//       render: (_, record) => (
//         <div className="whitespace-normal wrap-wrap-break-words max-w-[250px]">
//           {record.internship_topics?.title || '—'}
//         </div>
//       ),
//     },
//     {
//       title: 'Công ty',
//       dataIndex: ['internship_topics', 'company_name'],
//       render: (_, record) => {
//         const topic = record.internship_topics
//         if (!topic) return '—'
//         return (
//           <div className="text-sm text-slate-800 whitespace-normal wrap-wrap-break-words">
//             <div className="font-medium">{topic.company_name}</div>
//             <div className="text-xs text-slate-500">
//               {topic.company_address}
//             </div>
//           </div>
//         )
//       },
//     },
//     // {
//     //   title: 'GV hướng dẫn',
//     //   dataIndex: ['lecturers', 'lecturer_code'],
//     //   render: (_, record) =>
//     //     record.lecturers?.lecturer_code || 'Chưa phân công',
//     // },
//     {
//       title: 'Trạng thái',
//       dataIndex: 'status',
//       width: 130,
//       filters: Object.keys(STATUS_LABEL).map((k) => ({
//         text: STATUS_LABEL[k],
//         value: k,
//       })),
//       onFilter: (value, record) => record.status === value,
//       render: (_, record) => {
//         const color = STATUS_COLOR[record.status] || 'default'
//         const label = STATUS_LABEL[record.status] || record.status
//         return <Tag color={color}>{label}</Tag>
//       },
//     },
//     {
//       title: 'Tiến độ',
//       dataIndex: 'progress_percent',
//       width: 160,
//       sorter: (a, b) =>
//         Number(a.progress_percent) - Number(b.progress_percent),
//       render: (_, record) => (
//         <Progress
//           percent={Number(record.progress_percent) || 0}
//           size="small"
//         />
//       ),
//     },
//     // {
//     //   title: 'Thời gian',
//     //   key: 'range',
//     //   width: 180,
//     //   sorter: (a, b) =>
//     //     dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
//     //   render: (_, record) => (
//     //     <span className="text-xs text-slate-700">
//     //       {dayjs(record.start_date).format('DD/MM/YYYY')} -{' '}
//     //       {dayjs(record.end_date).format('DD/MM/YYYY')}
//     //     </span>
//     //   ),
//     // },
//   ]

//   const handleTableParamsChange = (
//     params: SmartTableParams<InternshipWithRelations>
//   ) => {
//     const {
//       pagination: { page: newPage, pageSize: newPageSize },
//       searchText,
//     } = params

//     setPage(newPage)
//     setLimit(newPageSize)
//     setSearch(searchText)
//     // không gọi API nữa, vì filter/search đều ở client-side
//   }

//   const handleStatusChange = (value?: string) => {
//     setStatusFilter(value || undefined)
//     setPage(1)
//   }

//   const handleTermChange = (value?: string) => {
//     setTermFilter(value || undefined)
//     setPage(1)
//   }

//   return (
//         <SmartTable<InternshipWithRelations>
//           columns={columns}
//           dataSource={filteredData}
//           rowKey="id"
//           loading={loading}
//           page={page}
//           pageSize={limit}
//           total={total}
//           onParamsChange={handleTableParamsChange}
//           searchPlaceholder="Tìm theo MSSV, đề tài, công ty..."
//           scrollX="max-content"
//           tableClassName="whitespace-normal"
//           expandable={{
//             expandedRowRender: (record) => (
//               <InternshipDetailCard record={record} />
//             ),
//           }}
//           extraFilters={
//             <div className="flex flex-wrap gap-2">
//               <Select
//                 allowClear
//                 placeholder="Lọc trạng thái"
//                 size="middle"
//                 style={{ minWidth: 160 }}
//                 value={statusFilter}
//                 onChange={handleStatusChange}
//               >
//                 {Object.keys(STATUS_LABEL).map((key) => (
//                   <Option key={key} value={key}>
//                     {STATUS_LABEL[key]}
//                   </Option>
//                 ))}
//               </Select>

//               <Select
//                 allowClear
//                 placeholder="Lọc theo kỳ thực tập"
//                 size="middle"
//                 style={{ minWidth: 200 }}
//                 value={termFilter}
//                 onChange={handleTermChange}
//                 options={termOptions}
//               />
//             </div>
//           }
//         />
//   )
// }

// export default AdminInternshipsTab

import { useEffect, useMemo, useState } from 'react'
import { Tag, Progress, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

import { useNotification } from '../../../provider/Notification'
import type { InternshipWithRelations } from '../../shared/types/terms'
import SmartTable, {
  type SmartTableParams,
} from '../../shared/components/SmartTable'
import { getInternships } from '../../../services/adminApi'

const { Option } = Select

// Trạng thái internship (cho từng sinh viên, reuse luôn)
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

// ======= TYPES AGGREGATE CHO UI =======

type StudentSummary = {
  id: string
  student_code: string
  full_name?: string
  email?: string
  status: string
  progress_percent: number
}

type LecturerSummary = {
  id: string
  lecturer_code: string
  full_name?: string
  email?: string
  department?: string
  phone?: string | null
}

type TopicSummary = {
  id: string
  title: string
  company_name: string | null
  company_address: string | null
  lecturer?: LecturerSummary
  students: StudentSummary[]
}

type TermRow = {
  id: string
  term_name: string
  start_date: string
  end_date: string
  total_students: number
  total_topics: number
  total_lecturers: number
  topics: TopicSummary[]
}

type StatusFilter = 'all' | 'upcoming' | 'active' | 'ended'

const getTermStatus = (term: TermRow): StatusFilter => {
  const today = dayjs()
  const start = dayjs(term.start_date)
  const end = dayjs(term.end_date)

  if (today.isBefore(start, 'day')) return 'upcoming'
  if (today.isAfter(end, 'day')) return 'ended'
  return 'active'
}

const TERM_STATUS_LABEL: Record<StatusFilter, string> = {
  all: 'Tất cả',
  upcoming: 'Sắp diễn ra',
  active: 'Đang diễn ra',
  ended: 'Đã kết thúc',
}

const TERM_STATUS_COLOR: Record<Exclude<StatusFilter, 'all'>, string> = {
  upcoming: 'blue',
  active: 'green',
  ended: 'default',
}

const AdminInternshipsTab = () => {
  const { notify } = useNotification()

  const [rawData, setRawData] = useState<InternshipWithRelations[]>([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // ================== LOAD DATA GỐC (INTERNSHIP) ==================
  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await getInternships({
        page: 1,
        limit: 1000,
      } as any)

      const items = res.items ?? []
      setRawData(items)
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

  // ================== AGGREGATE: rawData -> TermRow[] ==================
  const termRows: TermRow[] = useMemo(() => {
    type TermAgg = {
      id: string
      term_name: string
      start_date: string
      end_date: string
      topicsMap: Map<string, TopicSummary>
      lecturerIds: Set<string>
      studentIds: Set<string>
    }

    const termMap = new Map<string, TermAgg>()

    rawData.forEach((item) => {
      const term = item.internship_terms
      const topic = item.internship_topics
      const lecturer = item.lecturers
      const student = item.students

      if (!term) return

      const termId = String(term.id)

      if (!termMap.has(termId)) {
        termMap.set(termId, {
          id: termId,
          term_name: term.term_name,
          start_date: term.start_date,
          end_date: term.end_date,
          topicsMap: new Map<string, TopicSummary>(),
          lecturerIds: new Set<string>(),
          studentIds: new Set<string>(),
        })
      }

      const termEntry = termMap.get(termId)!
      const topicId = topic ? String(topic.id) : undefined

      // Topic
      if (topic && topicId) {
        if (!termEntry.topicsMap.has(topicId)) {
          termEntry.topicsMap.set(topicId, {
            id: topicId,
            title: topic.title,
            company_name: topic.company_name,
            company_address: topic.company_address,
            lecturer: undefined,
            students: [],
          })
        }

        const topicSummary = termEntry.topicsMap.get(topicId)!

        // Lecturer (gắn cho topic)
        if (lecturer && !topicSummary.lecturer) {
          topicSummary.lecturer = {
            id: String(lecturer.id),
            lecturer_code: lecturer.lecturer_code,
            full_name: lecturer.users?.full_name,
            email: lecturer.users?.email,
            department: lecturer.department,
            phone: lecturer.phone,
          }
        }

        if (lecturer) {
          termEntry.lecturerIds.add(String(lecturer.id))
        }

        // Student
        if (student) {
          const studentId = String(student.id)
          termEntry.studentIds.add(studentId)

          topicSummary.students.push({
            id: studentId,
            student_code: student.student_code,
            full_name: student.users?.full_name,
            email: student.users?.email,
            status: item.status,
            progress_percent: Number(item.progress_percent) || 0,
          })
        }
      }
    })

    // Convert map -> array TermRow
    return Array.from(termMap.values()).map((t) => ({
      id: t.id,
      term_name: t.term_name,
      start_date: t.start_date,
      end_date: t.end_date,
      total_students: t.studentIds.size,
      total_topics: t.topicsMap.size,
      total_lecturers: t.lecturerIds.size,
      topics: Array.from(t.topicsMap.values()),
    }))
  }, [rawData])

  // ================== FILTER (THEO SEARCH + TRẠNG THÁI KỲ) ==================
  const filteredTerms = useMemo(() => {
    let data = [...termRows]

    if (statusFilter !== 'all') {
      data = data.filter((term) => getTermStatus(term) === statusFilter)
    }

    const q = search.trim().toLowerCase()
    if (!q) return data

    return data.filter((term) =>
      term.term_name.toLowerCase().includes(q)
    )
  }, [termRows, statusFilter, search])

  const total = filteredTerms.length

  // ================== TABLE COLUMNS (TERM LEVEL) ==================
  const columns: ColumnsType<TermRow> = [
    {
      title: 'Kỳ thực tập',
      dataIndex: 'term_name',
      render: (v: string, record) => (
        <div className="text-sm text-slate-800 whitespace-normal wrap-break-words">
          <div className="font-semibold">{v}</div>
          <div className="text-xs text-slate-500">
            {dayjs(record.start_date).format('DD/MM/YYYY')} -{' '}
            {dayjs(record.end_date).format('DD/MM/YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Số đề tài',
      dataIndex: 'total_topics',
      width: 100,
    },
    {
      title: 'Số sinh viên',
      dataIndex: 'total_students',
      width: 120,
    },
    {
      title: 'Số giảng viên',
      dataIndex: 'total_lecturers',
      width: 120,
    },
    {
      title: 'Trạng thái kỳ',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const status = getTermStatus(record)
        if (status === 'all') return null
        return (
          <Tag color={TERM_STATUS_COLOR[status]}>
            {TERM_STATUS_LABEL[status]}
          </Tag>
        )
      },
    },
  ]

  // ================== HANDLE TABLE PARAMS ==================
  const handleTableParamsChange = (params: SmartTableParams<TermRow>) => {
    const {
      pagination: { page: newPage, pageSize: newPageSize },
      searchText,
    } = params

    setPage(newPage)
    setLimit(newPageSize)
    setSearch(searchText)
    // Không gọi API vì filter/search đều client-side
  }

  // ================== EXPANDED ROW: HIỂN THỊ ĐỀ TÀI & SINH VIÊN ==================
  const renderExpandedTerm = (record: TermRow) => {
    if (!record.topics.length) {
      return (
        <div className="text-xs text-slate-500">
          Kỳ thực tập này chưa có đề tài nào.
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {record.topics.map((topic) => (
          <div
            key={topic.id}
            className="border border-slate-200 rounded-lg p-3 bg-slate-50/60"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 wrap-break-words">
                  {topic.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {topic.company_name || '—'}
                  {topic.company_address
                    ? ` · ${topic.company_address}`
                    : ''}
                </p>
              </div>

              <div className="text-xs text-slate-700">
                <p className="font-semibold mb-1">Giảng viên phụ trách</p>
                {topic.lecturer ? (
                  <>
                    <p>
                      {topic.lecturer.lecturer_code}
                      {topic.lecturer.department
                        ? ` · ${topic.lecturer.department}`
                        : ''}
                    </p>
                    {topic.lecturer.full_name && (
                      <p>{topic.lecturer.full_name}</p>
                    )}
                    {topic.lecturer.email && (
                      <p className="text-slate-500">
                        {topic.lecturer.email}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500">Chưa có giảng viên</p>
                )}
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Sinh viên tham gia
              </p>

              {topic.students.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Chưa có sinh viên nào tham gia đề tài này.
                </p>
              ) : (
                <div className="space-y-2">
                  {topic.students.map((sv) => (
                    <div
                      key={sv.id}
                      className="flex flex-wrap items-center justify-between gap-2 border border-slate-200 rounded-md px-2 py-1.5 bg-white"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 wrap-break-words">
                          {sv.student_code}{' '}
                          {sv.full_name ? ` - ${sv.full_name}` : ''}
                        </p>
                        {sv.email && (
                          <p className="text-[11px] text-slate-500">
                            {sv.email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag
                          color={STATUS_COLOR[sv.status] || 'default'}
                          className="text-[11px]"
                        >
                          {STATUS_LABEL[sv.status] || sv.status}
                        </Tag>
                        <Progress
                          percent={sv.progress_percent}
                          size="small"
                          style={{ width: 120 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleStatusFilterChange = (value?: string) => {
    setStatusFilter((value as StatusFilter) || 'all')
    setPage(1)
  }

  return (
    <SmartTable<TermRow>
      columns={columns}
      dataSource={filteredTerms}
      rowKey="id"
      loading={loading}
      page={page}
      pageSize={limit}
      total={total}
      onParamsChange={handleTableParamsChange}
      searchPlaceholder="Tìm theo tên kỳ thực tập..."
      scrollX="max-content"
      tableClassName="whitespace-normal"
      expandable={{
        expandedRowRender: renderExpandedTerm,
      }}
      extraFilters={
        <Select
          allowClear
          placeholder="Lọc trạng thái kỳ"
          size="middle"
          style={{ minWidth: 180 }}
          value={statusFilter === 'all' ? undefined : statusFilter}
          onChange={handleStatusFilterChange}
        >
          <Option value="upcoming">{TERM_STATUS_LABEL.upcoming}</Option>
          <Option value="active">{TERM_STATUS_LABEL.active}</Option>
          <Option value="ended">{TERM_STATUS_LABEL.ended}</Option>
        </Select>
      }
    />
  )
}

export default AdminInternshipsTab
