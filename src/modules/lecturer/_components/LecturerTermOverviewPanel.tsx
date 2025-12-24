import { Button, Card, Empty, Tag } from "antd"
import dayjs from "dayjs"
import { useMemo } from "react"
import type { InternshipTermWithStats } from "../../../services/lecturerApi"
import { Column, Pie } from "@ant-design/plots"
type Props = {
  terms: InternshipTermWithStats[]
  selectedTermId: string | number | null
  onReload?: () => void
}

const getStatusKey = (t: InternshipTermWithStats) => {
  const now = dayjs()
  const start = dayjs(t.start_date)
  const end = dayjs(t.end_date)

  if (now.isBefore(start, "day")) return "upcoming"
  if (now.isAfter(end, "day")) return "ended"
  return "active"
}

const statusMeta: Record<
  string,
  { label: string; color: "blue" | "green" | "default" }
> = {
  upcoming: { label: "Sắp diễn ra", color: "blue" },
  active: { label: "Đang diễn ra", color: "green" },
  ended: { label: "Đã kết thúc", color: "default" },
}

export default function LecturerTermChartsPanel({
  terms,
  selectedTermId,
  onReload,
}: Props) {
  const selected = useMemo(() => {
    return terms.find((t) => String(t.id) === String(selectedTermId)) ?? null
  }, [terms, selectedTermId])

  const columnData = useMemo(() => {
    const sorted = [...terms].sort(
      (a, b) =>
        dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf()
    )

    const toLabel = (t: InternshipTermWithStats) => {
      const name = t.term_name ?? `Kỳ ${t.id}`
      return name.length > 16 ? `${name.slice(0, 16)}…` : name
    }

    return sorted.flatMap((t) => {
      const termLabel = toLabel(t)
      return [
        { term: termLabel, type: "SV", value: Number(t.students_count ?? 0), id: String(t.id) },
        { term: termLabel, type: "GV", value: Number(t.lecturers_count ?? 0), id: String(t.id) },
        { term: termLabel, type: "Đề tài", value: Number(t.topics_count ?? 0), id: String(t.id) },
      ]
    })
  }, [terms])

  const pieData = useMemo(() => {
    const counts = { upcoming: 0, active: 0, ended: 0 }
    for (const t of terms) counts[getStatusKey(t)] += 1
    return [
      { type: "Sắp diễn ra", value: counts.upcoming },
      { type: "Đang diễn ra", value: counts.active },
      { type: "Đã kết thúc", value: counts.ended },
    ].filter((x) => x.value > 0)
  }, [terms])

  if (!terms.length) {
    return (
      <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-900">Dashboard kỳ thực tập</div>
          <Button size="small" onClick={onReload}>Reload</Button>
        </div>
        <Empty description="Chưa có dữ liệu kỳ thực tập" />
      </Card>
    )
  }

  const st = selected ? statusMeta[getStatusKey(selected)] : null

  return (
    <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Dashboard kỳ thực tập</div>
          <div className="text-xs text-slate-500 mt-1">
            {selected ? (
              <>
                Kỳ đang chọn: <b className="text-slate-700">{selected.term_name}</b>{" "}
                ({dayjs(selected.start_date).format("DD/MM/YYYY")} -{" "}
                {dayjs(selected.end_date).format("DD/MM/YYYY")})
              </>
            ) : (
              "Chọn một kỳ ở sidebar để xem chi tiết"
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {st ? <Tag color={st.color} style={{ marginInlineEnd: 0 }}>{st.label}</Tag> : null}
          <Button size="small" onClick={onReload}>Reload</Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-semibold text-slate-900 mb-2">
            So sánh số lượng theo kỳ
          </div>

          <Column
            data={columnData}
            xField="term"
            yField="value"
            seriesField="type"
            isGroup
            height={260}
            legend={{ position: "top" }}
            tooltip={{ shared: true }}
            xAxis={{
              label: { autoHide: true, autoRotate: false },
            }}
            yAxis={{
              nice: true,
              min: 0,
            }}
          />
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-semibold text-slate-900 mb-2">
            Trạng thái các kỳ
          </div>

          <Pie
            data={pieData}
            angleField="value"
            colorField="type"
            radius={0.9}
            innerRadius={0.6}
            height={260}
            legend={{ position: "bottom" }}
            statistic={{
              title: false,
              content: {
                style: { fontSize: 14 },
                content: `${terms.length} kỳ`,
              },
            }}
            label={{
              type: "spider",
              content: "{name}: {value}",
            }}
          />
        </div>
      </div>

      {/* Selected term quick stats */}
      {selected ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">SV phụ trách</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{selected.students_count ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">GV tham gia</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{selected.lecturers_count ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Đề tài</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{selected.topics_count ?? 0}</div>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
