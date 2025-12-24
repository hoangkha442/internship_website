import { Button, Card, Empty, Input, Pagination, Skeleton, Tag } from "antd"
import type { InternshipTopic } from "../../../services/lecturerApi"

type Props = {
  loading: boolean
  topics: InternshipTopic[]
  page: number
  limit: number
  total: number
  q: string
  onSearch: (v: string) => void
  onPageChange: (page: number, pageSize: number) => void

  // NEW
  selectedTopicId?: string | number | null
  onSelectTopic?: (t: InternshipTopic) => void
  onOpenApprovals?: (t: InternshipTopic) => void
}

const statusTag = (t: InternshipTopic) => {
  if (t.status === "closed") return <Tag color="default">Đóng</Tag>
  if (t.status === "full") return <Tag color="red">Đã đủ</Tag>
  return <Tag color="green">Còn trống</Tag>
}

export default function TopicGrid({
  loading,
  topics,
  page,
  limit,
  total,
  q,
  onSearch,
  onPageChange,
  selectedTopicId = null,
  onSelectTopic,
  onOpenApprovals,
}: Props) {
  return (
    <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="text-sm font-semibold text-slate-900">Đề tài của tôi</div>
        <Input.Search
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm theo tên đề tài, công ty, địa chỉ..."
          allowClear
          style={{ maxWidth: 420 }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ) : topics.length === 0 ? (
        <Empty description="Chưa có đề tài nào." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topics.map((t) => {
              const selected = String(t.id) === String(selectedTopicId)

              return (
                <button
                  key={String(t.id)}
                  onClick={() => onSelectTopic?.(t)}
                  className={[
                    "text-left rounded-2xl border p-3 transition",
                    selected
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                      {t.description ? (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</div>
                      ) : (
                        <div className="text-xs text-slate-400 mt-1">Không có mô tả</div>
                      )}
                    </div>
                    {statusTag(t)}
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-500">Công ty:</span>{" "}
                      <b>{t.company_name ?? "—"}</b>
                    </div>
                    <div className="text-slate-500 mt-1">{t.company_address ?? "—"}</div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span>
                        Slot: <b>{t.current_students}/{t.max_students}</b>
                      </span>

                      <div className="flex items-center gap-2">
                        
                        <Button
                          size="small"
                          type="primary"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onOpenApprovals?.(t)
                          }}
                        >
                          Danh sách sinh viên đăng ký
                        </Button>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex justify-end mt-4">
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              pageSizeOptions={[6, 12, 24, 48]}
              onChange={(p, ps) => onPageChange(p, ps)}
            />
          </div>
        </>
      )}
    </Card>
  )
}
