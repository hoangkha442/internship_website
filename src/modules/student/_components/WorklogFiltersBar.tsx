import { Button, DatePicker, Input, Select, Space, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export type ReviewFilter = "all" | "reviewed" | "pending";
export type FileFilter = "all" | "has" | "none";
export type SortFilter = "work_date_desc" | "work_date_asc" | "created_desc" | "created_asc";

type Props = {
  q: string;
  setQ: (v: string) => void;

  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (v: [Dayjs | null, Dayjs | null] | null) => void;

  review: ReviewFilter;
  setReview: (v: ReviewFilter) => void;

  hasFile: FileFilter;
  setHasFile: (v: FileFilter) => void;

  sort: SortFilter;
  setSort: (v: SortFilter) => void;

  onReset: () => void;

  visibleCount: number;
  total: number;
};

export default function WorklogFiltersBar({
  q,
  setQ,
  dateRange,
  setDateRange,
  review,
  setReview,
  hasFile,
  setHasFile,
  sort,
  setSort,
  onReset,
  visibleCount,
  total,
}: Props) {
  return (
    <div className="flex flex-col gap-3 mb-3">
      {/* Row 1 */}
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm trong nội dung/feedback..."
          allowClear
          className="md:w-[340px]"
        />

        <RangePicker
          value={dateRange as any}
          onChange={(v) => setDateRange(v as any)}
          className="md:w-[320px]"
          format="DD/MM/YYYY"
          allowClear
        />

        <Select
          value={review}
          onChange={(v) => setReview(v)}
          className="md:w-[180px]"
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "pending", label: "Chờ phản hồi" },
            { value: "reviewed", label: "Đã phản hồi" },
          ]}
        />

        <Select
          value={hasFile}
          onChange={(v) => setHasFile(v)}
          className="md:w-[170px]"
          options={[
            { value: "all", label: "Tất cả file" },
            { value: "has", label: "Có file" },
            { value: "none", label: "Không file" },
          ]}
        />
      </div>

      {/* Row 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <Space wrap>
          <Select
            value={sort}
            onChange={(v) => setSort(v)}
            className="md:w-60"
            options={[
              { value: "created_desc", label: "Sắp xếp: Ngày tạo (mới → cũ)" },
              { value: "created_asc", label: "Sắp xếp: Ngày tạo (cũ → mới)" },
            ]}
          />

          <Button
            onClick={() =>
              setDateRange([dayjs().startOf("day"), dayjs().endOf("day")])
            }
          >
            Hôm nay
          </Button>
          <Button
            onClick={() =>
              setDateRange([dayjs().startOf("week"), dayjs().endOf("week")])
            }
          >
            Tuần này
          </Button>
          <Button
            onClick={() =>
              setDateRange([dayjs().startOf("month"), dayjs().endOf("month")])
            }
          >
            Tháng này
          </Button>

          <Tooltip title="Reset toàn bộ bộ lọc">
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
          </Tooltip>
        </Space>

        <div className="text-xs text-slate-500">
          Đang hiển thị:{" "}
          <span className="font-medium text-slate-700">{visibleCount}</span> /{" "}
          {total}
        </div>
      </div>
    </div>
  );
}
