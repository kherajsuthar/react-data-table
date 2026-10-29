import React from 'react';
import type { ColumnDef, ColumnPinPosition, RowAction } from '../../types/column.types';
import { DataTableRow } from './DataTableRow';

export interface DataTableBodyProps<TData = any> {
  rows: TData[];
  columns: ColumnDef<TData>[];
  totalColumnsCount: number;
  // Selection
  enableRowSelection?: boolean;
  isRowSelected?: (row: TData, index: number) => boolean;
  onToggleSelectRow?: (row: TData, index: number) => void;
  // Serial numbers
  serialNumber?: boolean;
  pageIndex?: number;
  pageSize?: number;
  // Actions
  actions?: RowAction<TData>[] | ((row: TData, index: number) => RowAction<TData>[]);
  pinActions?: boolean;
  // Row interaction
  onRowClick?: (row: TData, index: number) => void;
  onRowContextMenu?: (row: TData, index: number, event: React.MouseEvent) => void;
  enableContextMenu?: boolean;
  rowClassName?: string | ((row: TData, index: number) => string);
  getPinPosition?: (columnId: string) => ColumnPinPosition;
  getStickyOffset?: (columnId: string) => number | undefined;
  isLastPinnedLeft?: (columnId: string) => boolean;
  isFirstPinnedRight?: (columnId: string) => boolean;
  // Feedback states
  loading?: boolean;
  loadingMessage?: React.ReactNode;
  error?: Error | string | null;
  errorMessage?: React.ReactNode;
  onRetry?: () => void;
  emptyMessage?: React.ReactNode;
}

export const DataTableBody = <TData extends Record<string, any>>({
  rows,
  columns,
  totalColumnsCount,
  enableRowSelection = false,
  isRowSelected,
  onToggleSelectRow,
  serialNumber = false,
  pageIndex = 0,
  pageSize = 10,
  actions,
  pinActions = false,
  onRowClick,
  onRowContextMenu,
  enableContextMenu,
  rowClassName,
  getPinPosition,
  getStickyOffset,
  isLastPinnedLeft,
  isFirstPinnedRight,
  loading = false,
  loadingMessage = 'Loading data...',
  error = null,
  errorMessage,
  onRetry,
  emptyMessage = 'No data available',
}: DataTableBodyProps<TData>): React.ReactNode => {
  // 1. Error state
  if (error) {
    const errorText = errorMessage ?? (typeof error === 'string' ? error : error.message);
    return (
      <tbody className="rdt-tbody">
        <tr>
          <td colSpan={totalColumnsCount} className="rdt-error-state">
            <div className="rdt-error-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="rdt-error-text">{errorText}</span>
              {onRetry && (
                <button type="button" className="rdt-btn rdt-btn-primary" onClick={onRetry}>
                  Retry
                </button>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  // 2. Loading state
  if (loading) {
    return (
      <tbody className="rdt-tbody">
        <tr>
          <td colSpan={totalColumnsCount} className="rdt-loading-state">
            <div className="rdt-spinner" />
            <div className="rdt-loading-text">{loadingMessage}</div>
          </td>
        </tr>
      </tbody>
    );
  }

  // 3. Empty state
  if (!rows.length) {
    return (
      <tbody className="rdt-tbody">
        <tr>
          <td colSpan={totalColumnsCount} className="rdt-empty-state">
            <div className="rdt-empty-content">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
                <path d="M6 14h6" />
              </svg>
              <div className="rdt-empty-message">{emptyMessage}</div>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  // 4. Rows
  return (
    <tbody className="rdt-tbody">
      {rows.map((row, index) => {
        const isSelected = isRowSelected ? isRowSelected(row, index) : false;
        const serialIndex = pageIndex * pageSize + index + 1;

        return (
          <DataTableRow
            key={index}
            row={row}
            rowIndex={index}
            columns={columns}
            enableRowSelection={enableRowSelection}
            isSelected={isSelected}
            onToggleSelect={() => onToggleSelectRow?.(row, index)}
            serialNumber={serialNumber}
            serialIndex={serialIndex}
            actions={actions}
            pinActions={pinActions}
            onRowClick={onRowClick}
            onRowContextMenu={onRowContextMenu}
            enableContextMenu={enableContextMenu}
            rowClassName={rowClassName}
            getPinPosition={getPinPosition}
            getStickyOffset={getStickyOffset}
            isLastPinnedLeft={isLastPinnedLeft}
            isFirstPinnedRight={isFirstPinnedRight}
          />
        );
      })}
    </tbody>
  );
};
