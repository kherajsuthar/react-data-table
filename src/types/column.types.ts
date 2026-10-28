import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export type ColumnAlign = 'left' | 'center' | 'right';

export type ColumnPinPosition = 'left' | 'right' | false;

export type ColumnType = 'text' | 'badge' | 'avatar' | 'date' | 'number';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

export interface BadgeConfig {
  variant?: BadgeVariant;
  color?: string;
  dot?: boolean;
  label?: string;
}

export type ActionIconType =
  | 'view'
  | 'eye'
  | 'show'
  | 'details'
  | 'edit'
  | 'pencil'
  | 'modify'
  | 'delete'
  | 'trash'
  | 'remove'
  | 'copy'
  | 'clone'
  | 'duplicate'
  | 'download'
  | 'export'
  | 'print'
  | 'share'
  | 'info'
  | 'check'
  | 'close'
  | 'link'
  | 'refresh';

export interface RowAction<TData = any> {
  key?: string;
  label: string;
  icon?: ReactNode | ActionIconType | (string & {});
  onPress?: (row: TData, index: number) => void;
  onClick?: (row: TData, index: number) => void;
  color?: 'primary' | 'danger' | 'warning' | 'default' | string;
  disabled?: boolean | ((row: TData) => boolean);
  hidden?: boolean | ((row: TData) => boolean);
}

export interface CellRenderProps<TData = any, TValue = any> {
  value: TValue;
  row: TData;
  rowIndex: number;
  column: ColumnDef<TData, TValue>;
}

export interface HeaderRenderProps<TData = any, TValue = any> {
  column: ColumnDef<TData, TValue>;
  sortDirection: SortDirection;
  toggleSort: () => void;
}

export interface ColumnDef<TData = any, TValue = any> {
  /** Unique key or accessor path */
  key?: string;
  /** Header title */
  title?: ReactNode | ((props: HeaderRenderProps<TData, TValue>) => ReactNode);
  /** Custom value accessor */
  value?: (row: TData, index: number) => TValue;
  /** Secondary subtitle or description */
  description?: string | ((row: TData) => ReactNode);
  /** Avatar image URL or avatar icon/element */
  avatar?: string | ((row: TData) => string | ReactNode);
  /** Predefined cell rendering type */
  type?: ColumnType;
  /** Badge options if type='badge' */
  badge?: BadgeConfig | ((value: TValue, row: TData) => BadgeConfig);
  /** Enable copy-to-clipboard button */
  copy?: boolean;
  /** Explicit column width */
  width?: number | string;
  /** Minimum column width */
  minWidth?: number | string;
  /** Maximum column width */
  maxWidth?: number | string;
  /** Content alignment */
  align?: ColumnAlign;
  /** Whether column is hidden */
  hidden?: boolean;
  /** Pinning configuration: true/left/right to pin, false to forbid pinning, omitted for user toggleable */
  pinned?: boolean | 'left' | 'right';
  /** Custom cell render function */
  render?: (value: TValue, row: TData, index: number) => ReactNode;

  /* Compatibility Aliases */
  accessorKey?: keyof TData | string;
  accessorFn?: (row: TData, index: number) => TValue;
  header?: ReactNode | ((props: HeaderRenderProps<TData, TValue>) => ReactNode);
  cell?: (props: CellRenderProps<TData, TValue>) => ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePinning?: boolean;
  enableHiding?: boolean;
  className?: string;
}
