import { Button, Card, Empty, Input, Tag } from "antd";
import { useMemo, useState } from "react";

export type StudentItem = {
  internshipId: string | number;
  fullName: string;
  studentCode: string;
  email?: string;
  className: string;
};

export type TopicGroup = {
  key: string;
  title: string;
  termName: string;
  termRange?: string;
  students: StudentItem[];
};

type Props = {
  loading: boolean;
  topics: TopicGroup[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onReload: () => void;
};

export default function TopicList({ loading, topics, selectedKey, onSelect, onReload }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return topics;
    return topics.filter((t) => `${t.title} ${t.termName}`.toLowerCase().includes(s));
  }, [topics, q]);

  return (
    <Card
      className="shadow-sm border border-slate-100"
      styles={{ body: { padding: 12 } }}
      title={
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Đề tài</span>
          <Button size="small" onClick={onReload} loading={loading}>
            Reload
          </Button>
        </div>
      }
    >
      <Input.Search
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm đề tài / kỳ..."
        allowClear
        style={{ marginBottom: 10 }}
      />

      {loading ? (
        <div className="text-sm text-slate-500">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <Empty description="Chưa có đề tài." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((t) => {
            const selected = t.key === selectedKey;
            const count = t.students.length;

            return (
              <button
                key={t.key}
                onClick={() => onSelect(t.key)}
                className={[
                  "text-left rounded-2xl border p-3 transition w-full",
                  selected ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Kỳ: <b>{t.termName}</b>
                    </div>
                    {t.termRange ? <div className="text-xs text-slate-500 mt-1">{t.termRange}</div> : null}
                  </div>

                  <Tag color={count === 0 ? "default" : count >= 3 ? "red" : "blue"}>
                    {count}/3 SV
                  </Tag>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
