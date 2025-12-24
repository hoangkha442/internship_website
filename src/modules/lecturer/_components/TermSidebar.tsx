import { Button, Card, Skeleton, Tag } from "antd"
import dayjs from "dayjs"
import type { InternshipTermWithStats } from "../../../services/lecturerApi"

type Props = {
  loading: boolean
  terms: InternshipTermWithStats[]
  selectedTermId: string | number | null
  onSelect: (term: InternshipTermWithStats) => void
  onReload?: () => void
}

const getStatus = (t: InternshipTermWithStats) => {
  const now = dayjs()
  const start = dayjs(t.start_date)
  const end = dayjs(t.end_date)

  if (now.isBefore(start, "day")) return { key: "upcoming", label: "Sắp diễn ra", color: "blue" as const }
  if (now.isAfter(end, "day")) return { key: "ended", label: "Đã kết thúc", color: "default" as const }
  return { key: "active", label: "Đang diễn ra", color: "green" as const }
}

export default function TermSidebar({ loading, terms, selectedTermId, onSelect, onReload }: Props) {
  return (
    <Card
      className="shadow-sm border border-slate-100"
      styles={{ body: { padding: 12 } }}
      title={
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Các kỳ thực tập</span>
          <Button size="small" onClick={onReload}>Reload</Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      ) : terms.length === 0 ? (
        <div className="text-sm text-slate-500">Chưa có kỳ thực tập.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {terms.map((t) => {
            const selected = String(t.id) === String(selectedTermId)
            const st = getStatus(t)

            return (
              <button
                key={String(t.id)}
                onClick={() => onSelect(t)}
                className={[
                  "text-left rounded-xl border p-3 transition",
                  selected ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{t.term_name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {dayjs(t.start_date).format("DD/MM/YYYY")} - {dayjs(t.end_date).format("DD/MM/YYYY")}
                    </div>
                  </div>
                  <Tag color={st.color} style={{ marginInlineEnd: 0 }}>{st.label}</Tag>
                </div>

                <div className="mt-2 text-xs text-slate-600 flex gap-3">
                  <span>SV: <b>{t.students_count ?? 0}</b></span>
                  <span>GV: <b>{t.lecturers_count ?? 0}</b></span>
                  <span>Đề tài: <b>{t.topics_count ?? 0}</b></span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </Card>
  )
}
