import { Button, DatePicker, Input, Select, Tag } from "antd";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import type { ReportFileFilter, ReportSort, ReportStatus } from "../../../../../services/reportApi";

const { RangePicker } = DatePicker;

export type StatusFilter = "all" | ReportStatus;
export type FileFilter = ReportFileFilter;
export type SortFilter = ReportSort;

export default function LecturerReportFiltersBar(props: {
  q: string;
  setQ: (v: string) => void;

  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (v: [Dayjs | null, Dayjs | null] | null) => void;

  status: StatusFilter;
  setStatus: (v: StatusFilter) => void;

  hasFile: FileFilter;
  setHasFile: (v: FileFilter) => void;

  sort: SortFilter;
  setSort: (v: SortFilter) => void;

  onReset: () => void;

  visibleCount: number;
  total: number;
}) {
  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      { value: "submitted", label: "Đã nộp" },
      { value: "needs_revision", label: "Cần chỉnh sửa" },
      { value: "reviewed", label: "Đã duyệt" },
    ],
    []
  );

  const fileOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      { value: "has", label: "Có file" },
      { value: "none", label: "Không file" },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "submitted_desc", label: "Nộp mới nhất" },
      { value: "submitted_asc", label: "Nộp cũ nhất" },
      { value: "week_desc", label: "Tuần giảm dần" },
      { value: "week_asc", label: "Tuần tăng dần" },
    ],
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <Input
        value={props.q}
        onChange={(e) => props.setQ(e.target.value)}
        placeholder="Tìm trong title/content/feedback..."
        style={{ width: 260 }}
        allowClear
      />

      <RangePicker
        value={props.dateRange as any}
        onChange={(v) => props.setDateRange(v as any)}
        allowEmpty={[true, true]}
      />

      <Select
        value={props.status}
        onChange={props.setStatus as any}
        options={statusOptions}
        style={{ width: 150 }}
      />

      <Select
        value={props.hasFile}
        onChange={props.setHasFile as any}
        options={fileOptions}
        style={{ width: 140 }}
      />

      <Select
        value={props.sort}
        onChange={props.setSort as any}
        options={sortOptions}
        style={{ width: 160 }}
      />

      <Button onClick={props.onReset}>Reset</Button>

      <div className="ml-auto flex items-center gap-2">
        <Tag>Hiển thị: {props.visibleCount}</Tag>
        <Tag>Tổng: {props.total}</Tag>
      </div>
    </div>
  );
}
