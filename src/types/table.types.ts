import type { CSSProperties, ReactNode } from 'react';
import type { ColumnDef, RowAction } from './column.types';
import type { TableLayout, TableSize, TableVariant } from './variant.types';

export interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface ColumnPinningState {
  left: string[];
  right: string[];
}

export type RowSelectionState = Record<string | number, boolean>;

export interface TableState {
  searchQuery: string;
  sorting: SortConfig[];
  pagination: PaginationState;
  columnPinning: ColumnPinningState;
  columnOrder: string[];
  hiddenColumns: string[];
  rowSelection: RowSelectionState;
}

export interface DataTableProps<TData = any> {
  /** Array of data items */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData>[];
  /** Visual theme variant */
  variant?: TableVariant;
  /** Sizing mode */
  size?: TableSize;
  /** Layout mode: table, compact, card, or auto */
  layout?: TableLayout;
  /** Enable sticky table header */
  stickyHeader?: boolean;
  /** Maximum height for scrollable table container */
  maxHeight?: number | string;
  /** Custom wrapper CSS class */
  className?: string;
  /** Custom wrapper styles */
  style?: CSSProperties;

  // Search & Filtering
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  /** Server-side search callback. When provided, client-side filtering is bypassed. */
  onSearch?: (query: string) => void | Promise<void>;
  onSearchChange?: (query: string) => void;
  searchDebounceMs?: number;

  // Sorting
  enableSorting?: boolean;
  initialSort?: SortConfig[];
  onSortChange?: (sorting: SortConfig[]) => void;
  multiSort?: boolean;

  // Pagination
  paginate?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  initialPageIndex?: number;
  pageIndex?: number;
  totalRows?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Built-in Columns
  serialNumber?: boolean;
  serialNumberTitle?: ReactNode;
  actions?: RowAction<TData>[] | ((row: TData, index: number) => RowAction<TData>[]);
  actionColumnTitle?: ReactNode;
  onRowAction?: (actionKey: string, row: TData, index: number) => void;

  // Column Management
  enableColumnReorder?: boolean;
  enableColumnPinning?: boolean;
  enableColumnVisibility?: boolean;
  initialPinnedColumns?: { left?: string[]; right?: string[] };

  // Row Selection
  enableRowSelection?: boolean;
  selectedRowKeys?: (string | number)[];
  onSelectionChange?: (selectedKeys: (string | number)[], selectedRows: TData[]) => void;
  getRowId?: (row: TData, index: number) => string | number;
  isRowSelectable?: (row: TData, index: number) => boolean;

  // Export & Print
  enableExport?: boolean;
  exportFileName?: string;
  enablePrint?: boolean;
  onExport?: (type: 'csv' | 'xlsx' | 'pdf', data: TData[]) => void;

  // Feedback States
  loading?: boolean;
  loadingMessage?: ReactNode;
  error?: Error | string | null;
  errorMessage?: ReactNode;
  onRetry?: () => void;
  emptyMessage?: ReactNode;

  // Custom Slots & Styling
  toolbarSlot?: ReactNode;
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  onRowClick?: (row: TData, index: number) => void;
  /** Right-click context menu callback */
  onRowContextMenu?: (row: TData, index: number, event: React.MouseEvent) => void;
  /** Enable right-click context menu to trigger row actions (default: true when actions are provided) */
  enableContextMenu?: boolean;
  rowClassName?: string | ((row: TData, index: number) => string);
}
