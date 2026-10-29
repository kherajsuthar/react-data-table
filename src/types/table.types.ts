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

export type ViewMode = 'table' | 'grid' | 'list' | 'card' | 'row' | 'column';

export interface GridColumnsResponsive {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface CardHelpers<TData = any> {
  isSelected: boolean;
  toggleSelect: () => void;
  actions?: RowAction<TData>[];
  serialNumber?: number;
  columns: ColumnDef<TData>[];
  rowIndex: number;
}

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
  /** Whether the table should automatically adapt typography (12px on mobile) and cell padding for small screens @default true */
  responsive?: boolean;
  /** Maximum height for scrollable table container */
  maxHeight?: number | string;
  /** Custom wrapper CSS class */
  className?: string;
  /** Custom wrapper styles */
  style?: CSSProperties;
  /** Table title displayed in header and used for print export (default: "React Data Table") */
  title?: string;

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
  /** Whether the action column should be pinned to the right @default false (scrolls horizontally with table) */
  pinActions?: boolean;
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
  onExport?: (type: 'csv' | 'xlsx' | 'pdf' | 'json', data: TData[]) => void;
  /** Specific callback fired when CSV export is triggered */
  onExportCSV?: (data: TData[]) => void;
  /** Specific callback fired when XLSX export is triggered */
  onExportXLSX?: (data: TData[]) => void;
  /** Specific callback fired when PDF export is triggered */
  onExportPDF?: (data: TData[]) => void;
  /** Specific callback fired when JSON export is triggered */
  onExportJSON?: (data: TData[]) => void;
  /**
   * Export formats to show in toolbar (e.g. ['csv', 'xlsx', 'pdf', 'json']).
   * If a single format is provided (e.g. ['csv']), a direct 1-click export button is rendered.
   * @default ['csv', 'xlsx', 'pdf']
   */
  exportFormats?: ('csv' | 'xlsx' | 'pdf' | 'json')[];
  /** Custom CSV export options */
  exportCSVOptions?: { delimiter?: string; includeBOM?: boolean };

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

  // View Modes (Table vs Card/Grid)
  /**
   * View mode: 'table' (or 'list', 'row') for standard table rows,
   * or 'grid' (or 'card', 'column') for card grid view.
   * @default 'table'
   */
  viewMode?: ViewMode;
  /** Initial view mode when uncontrolled @default 'table' */
  defaultViewMode?: ViewMode;
  /** Callback fired when view mode changes */
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  /** Enable toggle button in toolbar to switch between table and card/grid view @default true */
  enableViewModeToggle?: boolean;
  /** Custom card renderer for grid/card view mode */
  renderCard?: (row: TData, index: number, helpers: CardHelpers<TData>) => ReactNode;
  /** Minimum width for cards in grid mode (e.g. 280 or '280px') @default '280px' */
  cardMinWidth?: number | string;
  /** Gap between cards in grid mode (e.g. 16 or '16px') @default '16px' */
  gridGap?: number | string;
  /** Fixed number of columns or responsive column configuration (e.g. 3 or { sm: 1, md: 2, lg: 3 }) */
  gridColumns?: number | GridColumnsResponsive;
  /** Custom class name for card elements */
  cardClassName?: string | ((row: TData, index: number) => string);
  /** Custom style for card elements */
  cardStyle?: CSSProperties | ((row: TData, index: number) => CSSProperties);
}
