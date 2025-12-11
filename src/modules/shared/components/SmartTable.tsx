

// import React, { useState } from 'react'
// import { Table, Input, Space } from 'antd'
// import type { ColumnsType, TableProps } from 'antd/es/table'
// import type {
//   TablePaginationConfig,
//   FilterValue,
//   SorterResult,
// } from 'antd/es/table/interface'

// const { Search } = Input

// export type SmartTableParams<T> = {
//   pagination: {
//     page: number
//     pageSize: number
//   }
//   filters: Record<string, FilterValue | null>
//   sorter: SorterResult<T> | SorterResult<T>[]
//   searchText: string
// }

// export interface SmartTableProps<T> {
//   columns: ColumnsType<T>
//   dataSource: T[]
//   rowKey: string | ((record: T) => string)
//   loading?: boolean

//   page: number
//   pageSize: number
//   total: number

//   onParamsChange?: (params: SmartTableParams<T>) => void

//   searchPlaceholder?: string
//   initialSearchText?: string
//   extraActions?: React.ReactNode
//   extraFilters?: React.ReactNode

//   expandable?: TableProps<T>['expandable']

//   // tuỳ chọn, nếu muốn override
//   scrollX?: number | string
//   tableClassName?: string
// }

// function SmartTable<T extends object>({
//   columns,
//   dataSource,
//   rowKey,
//   loading,
//   page,
//   pageSize,
//   total,
//   onParamsChange,
//   searchPlaceholder = 'Tìm kiếm...',
//   initialSearchText = '',
//   extraActions,
//   extraFilters,
//   expandable,
//   scrollX,
//   tableClassName,
// }: SmartTableProps<T>) {
//   const [searchText, setSearchText] = useState(initialSearchText)

//   const handleSearch = (value: string) => {
//     setSearchText(value)
//     onParamsChange?.({
//       pagination: {
//         page: 1,
//         pageSize,
//       },
//       filters: {},
//       sorter: {} as SorterResult<T>,
//       searchText: value,
//     })
//   }

//   const handleTableChange = (
//     pagination: TablePaginationConfig,
//     filters: Record<string, FilterValue | null>,
//     sorter: SorterResult<T> | SorterResult<T>[]
//   ) => {
//     onParamsChange?.({
//       pagination: {
//         page: pagination.current || 1,
//         pageSize: pagination.pageSize || pageSize,
//       },
//       filters,
//       sorter,
//       searchText,
//     })
//   }

//   return (
//     <div className="flex flex-col gap-3">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <Space className="flex flex-wrap" size="middle">
//           <Search
//             allowClear
//             value={searchText}
//             placeholder={searchPlaceholder}
//             onChange={(e) => setSearchText(e.target.value)}
//             onSearch={handleSearch}
//             className="min-w-[220px]"
//           />
//           {extraFilters}
//         </Space>

//         <div>{extraActions}</div>
//       </div>

//       <Table<T>
//         rowKey={rowKey}
//         loading={loading}
//         columns={columns}
//         dataSource={dataSource}
//         className={tableClassName}
//         pagination={{
//           current: page,
//           pageSize,
//           total,
//           showSizeChanger: true,
//           showTotal: (t) => `${t} bản ghi`,
//         }}
//         onChange={handleTableChange}
//         expandable={expandable}
//         // không cắt chữ, cho scroll ngang nếu nhiều cột
//         scroll={{ x: scrollX ?? 'max-content' }}
//       />
//     </div>
//   )
// }

// export default SmartTable

import React, { useState } from 'react'
import { Table, Input, Space, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType, TableProps } from 'antd/es/table'
import type {
  TablePaginationConfig,
  FilterValue,
  SorterResult,
} from 'antd/es/table/interface'

const { Search } = Input

export type SmartTableParams<T> = {
  pagination: {
    page: number
    pageSize: number
  }
  filters: Record<string, FilterValue | null>
  sorter: SorterResult<T> | SorterResult<T>[]
  searchText: string
}

export interface SmartTableProps<T> {
  columns: ColumnsType<T>
  dataSource: T[]
  rowKey: string | ((record: T) => string)
  loading?: boolean

  page: number
  pageSize: number
  total: number

  onParamsChange?: (params: SmartTableParams<T>) => void

  searchPlaceholder?: string
  initialSearchText?: string
  extraActions?: React.ReactNode
  extraFilters?: React.ReactNode

  expandable?: TableProps<T>['expandable']

  scrollX?: number | string
  tableClassName?: string

  onAddClick?: () => void
  addLabel?: string
}

function SmartTable<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading,
  page,
  pageSize,
  total,
  onParamsChange,
  searchPlaceholder = 'Tìm kiếm...',
  initialSearchText = '',
  extraActions,
  extraFilters,
  expandable,
  scrollX,
  tableClassName,
  onAddClick,
  addLabel = 'Thêm',
}: SmartTableProps<T>) {
  const [searchText, setSearchText] = useState(initialSearchText)

  const handleSearch = (value: string) => {
    setSearchText(value)
    onParamsChange?.({
      pagination: {
        page: 1,
        pageSize,
      },
      filters: {},
      sorter: {} as SorterResult<T>,
      searchText: value,
    })
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    onParamsChange?.({
      pagination: {
        page: pagination.current || 1,
        pageSize: pagination.pageSize || pageSize,
      },
      filters,
      sorter,
      searchText,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Space className="flex flex-wrap" size="middle">
          <Search
            allowClear
            value={searchText}
            placeholder={searchPlaceholder}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            className="min-w-[220px]"
          />
          {extraFilters}
        </Space>

        <Space size="middle">
          {extraActions}
          {onAddClick && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAddClick}
            >
              {addLabel}
            </Button>
          )}
        </Space>
      </div>

      {/* Table */}
      <Table<T>
        rowKey={rowKey}
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        className={tableClassName}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `${t} bản ghi`,
        }}
        onChange={handleTableChange}
        expandable={expandable}
        scroll={{ x: scrollX ?? 'max-content' }}
      />
    </div>
  )
}

export default SmartTable
