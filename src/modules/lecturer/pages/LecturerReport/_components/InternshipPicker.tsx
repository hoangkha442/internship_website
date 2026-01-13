// InternshipPicker.tsx
import { Button, Select, Tag } from "antd";
import type { LecturerSupervisedItem } from "../../../../../services/reportApi";

const statusColor = (s?: string | null) => {
  if (s === "completed") return "green";
  if (s === "in_progress") return "blue";
  if (s === "registered") return "gold";
  if (s === "dropped") return "red";
  return "default";
};

export default function InternshipPicker(props: {
  loading: boolean;
  items: LecturerSupervisedItem[];
  value: string | number | null;
  onChange: (v: string | number) => void;
  onReload: () => void;
}) {
  const options = props.items.map((x) => {
    const searchText = `${x.internship_id} ${x.student_code ?? ""} ${x.student_name ?? ""} ${x.topic_title ?? ""} ${x.term_name ?? ""}`;

    return {
      value: x.internship_id, //  giờ chắc chắn có
      searchText,
      label: (
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Tag color="blue">Internship #{String(x.internship_id)}</Tag>
            {x.student_code ? <Tag>{x.student_code}</Tag> : null}
            {x.student_name ? <span className="font-medium">{x.student_name}</span> : null}
            {x.status ? <Tag color={statusColor(x.status)}>{x.status}</Tag> : null}
          </div>

          <div className="text-xs text-slate-500 mt-1">
            {x.topic_title ? <span>Topic: {x.topic_title}</span> : null}
            {x.term_name ? <span className="ml-2">• Term: {x.term_name}</span> : null}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        style={{ width: 520 }}
        placeholder="Chọn internship (sinh viên phụ trách)"
        value={props.value ?? undefined}
        loading={props.loading}
        options={options as any}
        showSearch
        filterOption={(input, option: any) =>
          String(option?.searchText || "").toLowerCase().includes(input.toLowerCase())
        }
        onChange={props.onChange as any}
      />

      <Button onClick={props.onReload} loading={props.loading}>
        Tải lại
      </Button>
    </div>
  );
}
