import { useEffect, useMemo, useState } from "react"
import { App, Button, Card } from "antd"
import dayjs from "dayjs"

import TermSidebar from "../../_components/TermSidebar"
import TopicGrid from "../../_components/TopicGrid"
import CreateTopicDrawer from "../../_components/CreateTopicDrawer"
import TopicApprovalDrawer from "../../_components/TopicApprovalDrawer"
import {
  createTopicForTerm,
  getInternshipTermsLecturer,
  getLecturerTopicsByTerm,
  getPendingRegistrationsByTopic,
  approveTopicRegistration,
  rejectTopicRegistration,
  // updateInternshipStatus,
  type CreateTopicPayload,
  type InternshipTermWithStats,
  type InternshipTopic,
  type TopicRegistration,
} from "../../../../services/lecturerApi"

const isActiveTerm = (t: InternshipTermWithStats) => {
  const now = dayjs()
  const start = dayjs(t.start_date)
  const end = dayjs(t.end_date)
  return !now.isBefore(start, "day") && !now.isAfter(end, "day")
}

export default function LecturerTopicsPage() {
  const { message } = App.useApp()

  // TERMS
  const [terms, setTerms] = useState<InternshipTermWithStats[]>([])
  const [loadingTerms, setLoadingTerms] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<InternshipTermWithStats | null>(null)

  // TOPICS
  const [topics, setTopics] = useState<InternshipTopic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [topicPage, setTopicPage] = useState(1)
  const [topicLimit, setTopicLimit] = useState(12)
  const [topicTotal, setTopicTotal] = useState(0)
  const [q, setQ] = useState("")

  // CREATE TOPIC
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  // APPROVALS
  const [selectedTopic, setSelectedTopic] = useState<InternshipTopic | null>(null)
  const [openApprovals, setOpenApprovals] = useState(false)
  const [loadingRegs, setLoadingRegs] = useState(false)
  const [regs, setRegs] = useState<TopicRegistration[]>([])

  const loadTerms = async () => {
    setLoadingTerms(true)
    try {
      const res = await getInternshipTermsLecturer({ page: 1, limit: 50 })
      setTerms(res.items)
      const active = res.items.find(isActiveTerm)
      setSelectedTerm(active ?? res.items[0] ?? null)
    } catch {
      message.error("Không tải được danh sách kỳ thực tập")
    } finally {
      setLoadingTerms(false)
    }
  }

  const loadTopics = async (termId: string, page = 1, limit = topicLimit) => {
    setLoadingTopics(true)
    try {
      const res = await getLecturerTopicsByTerm(termId, { page, limit })

      const search = q.trim().toLowerCase()
      const filtered = search
        ? res.items.filter((t) =>
            [t.title, t.company_name, t.company_address]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(search))
          )
        : res.items

      setTopics(filtered)
      setTopicPage(res.meta.page)
      setTopicLimit(res.meta.limit)
      setTopicTotal(search ? filtered.length : res.meta.total)
    } catch {
      message.error("Không tải được danh sách đề tài")
    } finally {
      setLoadingTopics(false)
    }
  }

  const loadPendingRegs = async (topicId: string | number) => {
    setLoadingRegs(true)
    try {
      const res = await getPendingRegistrationsByTopic(topicId)
      setRegs(res.items ?? [])
    } catch {
      message.error("Không tải được danh sách đăng ký")
      setRegs([])
    } finally {
      setLoadingRegs(false)
    }
  }

  useEffect(() => {
    loadTerms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedTerm) return
    setTopicPage(1)
    loadTopics(String(selectedTerm.id), 1, topicLimit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTerm?.id])

  // search debounce (FE)
  useEffect(() => {
    if (!selectedTerm) return
    const t = setTimeout(() => {
      loadTopics(String(selectedTerm.id), 1, topicLimit)
      setTopicPage(1)
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const selectedTermLabel = useMemo(() => {
    if (!selectedTerm) return "—"
    return `${selectedTerm.term_name} (${dayjs(selectedTerm.start_date).format("DD/MM/YYYY")} - ${dayjs(selectedTerm.end_date).format("DD/MM/YYYY")})`
  }, [selectedTerm])

  const handleCreateTopic = async (payload: CreateTopicPayload) => {
    try {
      setCreating(true)
      await createTopicForTerm(payload)
      message.success("Tạo đề tài thành công")
      setOpenCreate(false)

      if (selectedTerm) await loadTopics(String(selectedTerm.id), 1, topicLimit)
      await loadTerms()
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể tạo đề tài")
    } finally {
      setCreating(false)
    }
  }

  const handleOpenApprovals = async (t: InternshipTopic) => {
    setSelectedTopic(t)
    setOpenApprovals(true)
    await loadPendingRegs(t.id)
  }

  // const handleApprove = async (registrationId: string | number, note?: string) => {
  //   try {
  //     await approveTopicRegistration(registrationId, note)
  //     message.success("Đã duyệt đăng ký")

  //     // refresh: pending regs + topics(slot) + terms(stats)
  //     if (selectedTopic) await loadPendingRegs(selectedTopic.id)
  //     if (selectedTerm) await loadTopics(String(selectedTerm.id), topicPage, topicLimit)
  //     await loadTerms()
  //   } catch (err: any) {
  //     message.error(err?.response?.data?.message || "Không thể duyệt")
  //   }
  // }

//   const handleApprove = async (registrationId: string | number, note?: string) => {
//   if (!selectedTopic) return
//   try {
//     const res = await approveTopicRegistration(registrationId, note)

//     // approve tạo internship => update status ngay (nếu bạn muốn)
//     const internshipId = res?.internship?.id
//     if (internshipId) {
//       await updateInternshipStatus(internshipId, "registered") 
//     }

//     // UI remove pending + reload
//     setRegs((prev) => prev.filter((r) => String(r.id) !== String(registrationId)))
//     await loadPendingRegs(selectedTopic.id)

//     // refresh topic slot/count
//     if (selectedTerm) await loadTopics(String(selectedTerm.id), 1, topicLimit)
//     await loadTerms()
//   } catch (err: any) {
//     message.error(err?.response?.data?.message || "Không thể duyệt")
//   }
// }

const handleApprove = async (registrationId: string | number, note?: string) => {
  if (!selectedTopic) return
  try {
    const res = await approveTopicRegistration(registrationId, note)
    console.log('res: ', res);
    message.success("Đã duyệt đăng ký")

    setRegs((prev) => prev.filter((r) => String(r.id) !== String(registrationId)))

    await loadPendingRegs(selectedTopic.id)

    if (selectedTerm) await loadTopics(String(selectedTerm.id), topicPage, topicLimit)

    await loadTerms()
  } catch (err: any) {
    message.error(err?.response?.data?.message || "Không thể duyệt")
  }
}

  // const handleReject = async (registrationId: string | number, reason: string) => {
  //   try {
  //     await rejectTopicRegistration(registrationId, reason)
  //     message.success("Đã từ chối đăng ký")
  //     await updateInternshipStatus(registrationId, "rejected")
  //     if (selectedTopic) await loadPendingRegs(selectedTopic.id)
  //   } catch (err: any) {
  //     message.error(err?.response?.data?.message || "Không thể từ chối")
  //   }
  // }

  const handleReject = async (registrationId: string | number, reason: string) => {
  if (!selectedTopic) return
  try {
    await rejectTopicRegistration(registrationId, reason)
    message.success("Đã từ chối đăng ký")

    setRegs((prev) => prev.filter((r) => String(r.id) !== String(registrationId)))

    await loadPendingRegs(selectedTopic.id)
  } catch (err: any) {
    message.error(err?.response?.data?.message || "Không thể từ chối")
  }
}

  return (
    <div className="p-6">
      <div className="mb-5">
        <div className="text-xl font-semibold text-slate-900">Quản lý đề tài thực tập</div>
        <div className="text-sm text-slate-500">
          Chọn kỳ → xem đề tài → bấm “Duyệt SV” để xét sinh viên đăng ký theo thứ tự thời gian.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-4">
          <TermSidebar
            loading={loadingTerms}
            terms={terms}
            selectedTermId={selectedTerm?.id ?? null}
            onSelect={setSelectedTerm}
            onReload={loadTerms}
          />
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm">
                <div className="text-slate-500">Kỳ đang chọn</div>
                <div className="font-semibold text-slate-900">{selectedTermLabel}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  disabled={!selectedTopic}
                  onClick={() => selectedTopic && handleOpenApprovals(selectedTopic)}
                >
                  Duyệt SV
                </Button>
                <Button type="primary" disabled={!selectedTerm} onClick={() => setOpenCreate(true)}>
                  + Tạo đề tài
                </Button>
              </div>
            </div>
          </Card>

          <TopicGrid
            loading={loadingTopics}
            topics={topics}
            page={topicPage}
            limit={topicLimit}
            total={topicTotal}
            q={q}
            onSearch={setQ}
            onPageChange={(p, ps) => {
              setTopicPage(p)
              setTopicLimit(ps)
              if (selectedTerm) loadTopics(String(selectedTerm.id), p, ps)
            }}
            selectedTopicId={selectedTopic?.id ?? null}
            onSelectTopic={(t) => setSelectedTopic(t)}
            onOpenApprovals={handleOpenApprovals}
          />
        </div>
      </div>

      <CreateTopicDrawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        loading={creating}
        termId={selectedTerm ? String(selectedTerm.id) : null}
        termName={selectedTerm?.term_name}
        onSubmit={handleCreateTopic}
      />

      <TopicApprovalDrawer
        open={openApprovals}
        onClose={() => setOpenApprovals(false)}
        topic={selectedTopic}
        loading={loadingRegs}
        items={regs}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
