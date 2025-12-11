import { useEffect, useState, useMemo } from 'react';
import {  Modal, Tag, DatePicker, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { EditOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNotification } from '../../../provider/Notification';
import type { CreateTermPayload, InternshipTermListResponse, InternshipTermWithStats } from '../../shared/types/internship';
import { createTerm, getInternshipTerms } from '../../../services/adminApi';
import type { SmartTableParams } from '../../shared/components/SmartTable';
import SmartTable from '../../shared/components/SmartTable';

const { RangePicker } = DatePicker;

const getTermStatus = (term: InternshipTermWithStats) => {
  const today = dayjs();
  const start = dayjs(term.start_date);
  const end = dayjs(term.end_date);

  if (today.isBefore(start, 'day')) return 'upcoming';
  if (today.isAfter(end, 'day')) return 'ended';
  return 'active';
};

const AdminInternshipTermsTab = () => {
  const { notify } = useNotification();

  const [terms, setTerms] = useState<InternshipTermWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [termName, setTermName] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const loadTerms = async (pageParam = 1, limitParam = 10) => {
    setLoading(true);
    try {
      const res: InternshipTermListResponse = await getInternshipTerms({
        page: pageParam,
        limit: limitParam,
      });

      setTerms(res.items);
      setPage(res.meta.page);
      setLimit(res.meta.limit);
      setTotal(res.meta.total);
    } catch (err) {
      console.error(err);
      notify('error', 'Không tải được danh sách kỳ thực tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setTermName('');
    setDateRange([null, null]);
  };

  const openModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const onChangeDateRange = (values: null | [Dayjs | null, Dayjs | null]) => {
    if (!values) {
      setDateRange([null, null]);
      return;
    }
    const [start, end] = values;
    setDateRange([start, end]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termName.trim()) {
      notify('error', 'Vui lòng nhập tên kỳ thực tập');
      return;
    }
    const [start, end] = dateRange;
    if (!start || !end) {
      notify('error', 'Vui lòng chọn khoảng thời gian thực tập');
      return;
    }
    if (start.isAfter(end)) {
      notify('error', 'Ngày bắt đầu không được lớn hơn ngày kết thúc');
      return;
    }

    const payload: CreateTermPayload = {
      term_name: termName.trim(),
      start_date: start.format('YYYY-MM-DD'),
      end_date: end.format('YYYY-MM-DD'),
    };

    try {
      setSaving(true);
      await createTerm(payload);
      notify('success', 'Tạo kỳ thực tập thành công');
      closeModal();
      loadTerms(page, limit);
    } catch (err: any) {
      notify('error', err?.message || 'Không thể tạo kỳ thực tập');
    } finally {
      setSaving(false);
    }
  };

  // search FE
  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) =>
      [t.term_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [terms, search]);

  const columns: ColumnsType<InternshipTermWithStats> = [
    {
      title: 'Tên kỳ thực tập',
      dataIndex: 'term_name',
      render: (v: string) => (
        <span className="whitespace-normal wrap-break-words font-medium">
          {v}
        </span>
      ),
    },
    {
      title: 'Thời gian',
      key: 'range',
      render: (_, record) => (
        <span className="text-sm text-slate-700">
          {dayjs(record.start_date).format('DD/MM/YYYY')} -{' '}
          {dayjs(record.end_date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Số sinh viên',
      dataIndex: 'students_count',
      width: 120,
      render: (v?: number) => v ?? 0,
    },
    {
      title: 'Số giảng viên',
      dataIndex: 'lecturers_count',
      width: 130,
      render: (v?: number) => v ?? 0,
    },
    {
      title: 'Số đề tài',
      dataIndex: 'topics_count',
      width: 120,
      render: (v?: number) => v ?? 0,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const status = getTermStatus(record);
        if (status === 'upcoming') {
          return <Tag color="blue">Sắp diễn ra</Tag>;
        }
        if (status === 'active') {
          return <Tag color="green">Đang diễn ra</Tag>;
        }
        return <Tag color="default">Đã kết thúc</Tag>;
      },
    },
  ];

  const handleTableParamsChange = (
    params: SmartTableParams<InternshipTermWithStats>,
  ) => {
    const {
      pagination: { page: newPage, pageSize: newPageSize },
      searchText,
    } = params;

    setPage(newPage);
    setLimit(newPageSize);
    setSearch(searchText);
    // pagination dùng server, nhưng search hiện đang FE
    loadTerms(newPage, newPageSize);
  };

  return (
    <div className="flex flex-col">
      <SmartTable<InternshipTermWithStats>
        columns={columns}
        dataSource={filteredTerms}
        rowKey="id"
        loading={loading}
        page={page}
        pageSize={limit}
        total={total}
        onParamsChange={handleTableParamsChange}
        searchPlaceholder="Tìm theo tên kỳ thực tập..."
        scrollX="max-content"
        tableClassName="whitespace-normal"
        onAddClick={openModal}
      addLabel="Thêm kỳ thực tập"
      />

      {/* Modal tạo kỳ mới */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        title={
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">
              event
            </span>
            <span className="text-base font-semibold">
              Tạo kỳ thực tập mới
            </span>
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 pt-2"
        >
          <label className="flex flex-col w-full">
            <p className="text-gray-900 text-sm font-medium pb-2">
              Tên kỳ thực tập
            </p>

            <div className="relative flex items-center">
              <EditOutlined className="absolute left-4 text-gray-400 text-lg" />
              <Input
                name="term_name"
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
                placeholder="VD: Kỳ thực tập hè 2025"
                className="w-full rounded-lg h-11 pl-11 pr-4 border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
          </label>

          <label className="flex flex-col w-full">
            <p className="text-gray-900 text-sm font-medium pb-2">
              Thời gian thực tập
            </p>

            <div className="relative flex items-center">
              <CalendarOutlined className="absolute left-4 text-gray-400 text-lg z-10" />
              <RangePicker
                className="w-full rounded-lg h-11 pl-10 pr-2 border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none"
                format="DD/MM/YYYY"
                onChange={onChangeDateRange}
                value={dateRange}
                allowClear
              />
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center h-9 px-4 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-all"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center h-9 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {saving ? 'Đang tạo...' : 'Tạo kỳ thực tập'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInternshipTermsTab;
