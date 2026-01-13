import { DatePicker, Select, Segmented } from "antd";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import type { DashboardRange } from "../../../../../services/lecturerDashboardApi";
import type { LecturerSupervisedItem } from "../../../../../services/reportApi";

const { RangePicker } = DatePicker;

export default function LecturerDashboardFiltersBar(props: {
  internships: LecturerSupervisedItem[];

  internshipId: string | number | null; // null = ALL
  setInternshipId: (v: string | number | null) => void;

  range: DashboardRange;
  setRange: (v: DashboardRange) => void;

  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (v: [Dayjs | null, Dayjs | null] | null) => void;
}) {
  const internshipOptions = useMemo(() => {
    const items = props.internships ?? [];
    const opts = items.map((x) => {
      const id = x.internship_id;
      const label = [
        `#${id}`,
        x.student_name ? `• ${x.student_name}` : "",
        x.student_code ? `(${x.student_code})` : "",
        x.topic_title ? `• ${x.topic_title}` : "",
        x.term_name ? `• ${x.term_name}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      return { value: String(id), label };
    });

    //  thêm "Tất cả"
    return [{ value: "all", label: "Tất cả internship" }, ...opts];
  }, [props.internships]);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">Chọn internship</div>
          <Select
            style={{ width: 520, maxWidth: "100%" }}
            value={props.internshipId == null ? "all" : String(props.internshipId)}
            options={internshipOptions}
            onChange={(v) => props.setInternshipId(v === "all" ? null : v)}
            showSearch
            optionFilterProp="label"
          />
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Range nhanh</div>
          <Segmented
            value={props.range}
            onChange={(v) => props.setRange(v as DashboardRange)}
            options={[
              { label: "7 ngày", value: "7d" },
              { label: "14 ngày", value: "14d" },
              { label: "30 ngày", value: "30d" },
            ]}
          />
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Khoảng thời gian</div>
          <RangePicker
            value={props.dateRange as any}
            onChange={(v) => props.setDateRange(v as any)}
            allowEmpty={[true, true]}
          />
        </div>
      </div>
    </div>
  );
}
