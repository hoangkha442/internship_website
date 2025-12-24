import { Card, Empty, Input } from "antd";
import { useMemo, useState } from "react";
import type { TopicGroup, StudentItem } from "./TopicList";

type Props = {
  topic: TopicGroup;
  selectedStudentId: string | number | null;
  onSelect: (st: StudentItem) => void;
};

export default function StudentList({ topic, selectedStudentId, onSelect }: Props) {
  const [q, setQ] = useState("");

  const students = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return topic.students;
    return topic.students.filter((st) => {
      const hay = `${st.fullName} ${st.studentCode} ${st.className} ${st.email ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [topic.students, q]);

  return (
    <Card className="shadow-sm border border-slate-100" styles={{ body: { padding: 12 } }} title="Sinh viên (0–3)">
      <div className="mb-2">
        <div className="text-sm text-slate-500">Đề tài đang chọn</div>
        <div className="text-base font-semibold text-slate-900 truncate">{topic.title}</div>
        <div className="text-xs text-slate-500 mt-1">
          {topic.termName} {topic.termRange ? `· ${topic.termRange}` : ""}
        </div>
      </div>

      <Input.Search
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm sinh viên..."
        allowClear
        style={{ marginBottom: 10 }}
      />

      {students.length === 0 ? (
        <Empty description="Đề tài này chưa có sinh viên." />
      ) : (
        <div className="flex flex-col gap-2">
          {students.map((st) => {
            const selected = String(st.internshipId) === String(selectedStudentId);
            return (
              <button
                key={String(st.internshipId)}
                onClick={() => onSelect(st)}
                className={[
                  "text-left rounded-2xl border p-3 transition w-full",
                  selected ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="font-semibold text-slate-900 truncate">{st.fullName}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Mã: <b>{st.studentCode}</b> · Lớp: <b>{st.className}</b>
                </div>
                {st.email ? <div className="text-xs text-slate-500 mt-1 truncate">{st.email}</div> : null}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
