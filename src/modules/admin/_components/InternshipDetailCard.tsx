import { Card } from 'antd'
import dayjs from 'dayjs'
import type { InternshipWithRelations } from '../../shared/types/terms'

type Props = {
  record: InternshipWithRelations
}

const InternshipDetailCard: React.FC<Props> = ({ record }) => {
  const term = record.internship_terms
  const topic = record.internship_topics
  const student = record.students
  const lecturer = record.lecturers

  return (
    <div className="bg-slate-50/60 rounded-lg p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kỳ thực tập */}
        <Card
          size="small"
          className="border border-blue-100 shadow-sm"
          title={
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-blue-600">
                event
              </span>
              <span className="text-sm font-semibold">Kỳ thực tập</span>
            </div>
          }
        >
          {term ? (
            <div className="space-y-1 text-xs text-slate-700">
              <div>
                <span className="font-semibold">{term.term_name}</span>
              </div>
              <div>
                Thời gian:{' '}
                {dayjs(term.start_date).format('DD/MM/YYYY')} -{' '}
                {dayjs(term.end_date).format('DD/MM/YYYY')}
              </div>
              <div>Tổng tuần: {term.total_weeks} tuần</div>
              <div>
                Điểm danh tối thiểu:{' '}
                {term.min_attendance_days_per_week} ngày/tuần
              </div>
              <div>Tối thiểu báo cáo: {term.min_reports} báo cáo</div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Không có thông tin kỳ thực tập
            </span>
          )}
        </Card>

        {/* Đề tài & công ty */}
        <Card
          size="small"
          className="border border-emerald-100 shadow-sm"
          title={
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-emerald-600">
                work
              </span>
              <span className="text-sm font-semibold">Đề tài & công ty</span>
            </div>
          }
        >
          {topic ? (
            <div className="space-y-1 text-xs text-slate-700">
              <div className="font-semibold">{topic.title}</div>
              <div>
                Công ty:{' '}
                <span className="font-medium">{topic.company_name}</span>
              </div>
              <div>Địa chỉ: {topic.company_address}</div>
              <div className="pt-1 text-slate-600">
                Mô tả: {topic.description}
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Không có thông tin đề tài
            </span>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sinh viên */}
        <Card
          size="small"
          className="border border-slate-200 shadow-sm"
          title={
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-slate-700">
                person
              </span>
              <span className="text-sm font-semibold">Sinh viên</span>
            </div>
          }
        >
          {student ? (
            <div className="space-y-1 text-xs text-slate-700">
              <div>MSSV: {student.student_code}</div>
              <div>SĐT: {student.phone}</div>
              <div>Lớp: {student.class_id || '—'}</div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Không có thông tin sinh viên
            </span>
          )}
        </Card>

        {/* Giảng viên */}
        <Card
          size="small"
          className="border border-slate-200 shadow-sm"
          title={
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-slate-700">
                school
              </span>
              <span className="text-sm font-semibold">
                Giảng viên hướng dẫn
              </span>
            </div>
          }
        >
          {lecturer ? (
            <div className="space-y-1 text-xs text-slate-700">
              <div>Mã GV: {lecturer.lecturer_code}</div>
              <div>Khoa/Bộ môn: {lecturer.department}</div>
              <div>SĐT: {lecturer.phone}</div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Chưa có giảng viên hướng dẫn
            </span>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-500">
        <span>
          Tạo lúc: {dayjs(record.created_at).format('DD/MM/YYYY HH:mm')}
        </span>
        <span>
          Cập nhật lần cuối:{' '}
          {dayjs(record.updated_at).format('DD/MM/YYYY HH:mm')}
        </span>
      </div>
    </div>
  )
}

export default InternshipDetailCard
