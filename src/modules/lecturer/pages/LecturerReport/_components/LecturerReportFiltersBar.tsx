import { Button, DatePicker, Input, Select, Tag } from "antd";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import type { ReportStatus } from "../../../../../services/reportApi";

const { RangePicker } = DatePicker;

export type StatusFilter = "all" | ReportStatus;
export type PassFilter = "all" | "pending" | "pass" | "fail";
export type FileFilter = "all" | "has" | "none";
export type SortFilter = "submitted_desc" | "submitted_asc" | "week_desc" | "week_asc";

export default function LecturerReportFiltersBar(props: {
  q: string;
  setQ: (v: string) => void;

  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (v: [Dayjs | null, Dayjs | null] | null) => void;

  status: StatusFilter;
  setStatus: (v: StatusFilter) => void;

  pass: PassFilter;
  setPass: (v: PassFilter) => void;

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

  const passOptions = useMemo(
    () => [
      { value: "all", label: "Pass: Tất cả" },
      { value: "pending", label: "Chờ kết luận" },
      { value: "pass", label: "Pass" },
      { value: "fail", label: "Fail" },
    ],
    []
  );

  const fileOptions = useMemo(
    () => [
      { value: "all", label: "File: Tất cả" },
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
        value={props.pass}
        onChange={props.setPass as any}
        options={passOptions}
        style={{ width: 160 }}
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
        style={{ width: 170 }}
      />

      <Button onClick={props.onReset}>Reset</Button>

      <div className="ml-auto flex items-center gap-2">
        <Tag>Hiển thị: {props.visibleCount}</Tag>
        <Tag>Tổng: {props.total}</Tag>
      </div>
    </div>
  );
}
