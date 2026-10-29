import React from 'react';
import type { ColumnDef, RowAction } from '../../types/column.types';
import type { CardHelpers, GridColumnsResponsive } from '../../types/table.types';
import { DataTableCard } from './DataTableCard';

export interface DataTableGridProps<TData = any> {
  rows: TData[];
  columns: ColumnDef<TData>[];
  renderCard?: (row: TData, index: number, helpers: CardHelpers<TData>) => React.ReactNode;
  gridColumns?: number | GridColumnsResponsive;
  cardMinWidth?: number | string;
  gridGap?: number | string;
  cardClassName?: string | ((row: TData, index: number) => string);
  cardStyle?: React.CSSProperties | ((row: TData, index: number) => React.CSSProperties);
  // Selection
  enableRowSelection?: boolean;
  isRowSelected?: (row: TData, index: number) => boolean;
  onToggleSelectRow?: (row: TData, index: number) => void;
  // Serial number
  serialNumber?: boolean;
  pageIndex?: number;
  pageSize?: number;
  // Actions & interaction
  actions?: RowAction<TData>[] | ((row: TData, index: number) => RowAction<TData>[]);
  onRowClick?: (row: TData, index: number) => void;
  onRowContextMenu?: (row: TData, index: number, event: React.MouseEvent) => void;
  enableContextMenu?: boolean;
  // Feedback states
  loading?: boolean;
  loadingMessage?: React.ReactNode;
  error?: Error | string | null;
  errorMessage?: React.ReactNode;
  onRetry?: () => void;
  emptyMessage?: React.ReactNode;
}

export const DataTableGrid = <TData extends Record<string, any>>({
  rows,
  columns,
  renderCard,
  gridColumns,
  cardMinWidth = '280px',
  gridGap = '16px',
  cardClassName,
  cardStyle,
  enableRowSelection = false,
  isRowSelected,
  onToggleSelectRow,
  serialNumber = false,
  pageIndex = 0,
  pageSize = 10,
  actions,
  onRowClick,
  onRowContextMenu,
  enableContextMenu = true,
  loading = false,
  loadingMessage = 'Loading data...',
  error = null,
  errorMessage,
  onRetry,
  emptyMessage = 'No data available',
}: DataTableGridProps<TData>): React.ReactNode => {
  // 1. Error state
  if (error) {
    const errorText = errorMessage ?? (typeof error === 'string' ? error : error.message);
    return (
      <div className="rdt-grid-state rdt-error-state">
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
      </div>
    );
  }

  // 2. Loading state
  if (loading) {
    return (
      <div className="rdt-grid-state rdt-loading-state">
        <div className="rdt-spinner" />
        <div className="rdt-loading-text">{loadingMessage}</div>
      </div>
    );
  }

  // 3. Empty state
  if (!rows.length) {
    return (
      <div className="rdt-grid-state rdt-empty-state">
        <div className="rdt-empty-content">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="M6 8h.01" />
            <path d="M10 8h.01" />
            <path d="M14 8h.01" />
          </svg>
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }

  // Build grid layout styles
  const isFixedColCount = typeof gridColumns === 'number';
  const minWidthVal = typeof cardMinWidth === 'number' ? `${cardMinWidth}px` : cardMinWidth;
  const gapVal = typeof gridGap === 'number' ? `${gridGap}px` : gridGap;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: gapVal,
    gridTemplateColumns: isFixedColCount
      ? `repeat(${gridColumns}, minmax(0, 1fr))`
      : `repeat(auto-fill, minmax(${minWidthVal}, 1fr))`,
    ...(typeof gridColumns === 'object' && gridColumns !== null
      ? ({
          '--rdt-grid-cols-sm': gridColumns.sm,
          '--rdt-grid-cols-md': gridColumns.md,
          '--rdt-grid-cols-lg': gridColumns.lg,
          '--rdt-grid-cols-xl': gridColumns.xl,
        } as React.CSSProperties)
      : {}),
  };

  return (
    <div className="rdt-cards-grid" style={gridStyle}>
      {rows.map((row, rowIndex) => {
        const isSelected = isRowSelected ? isRowSelected(row, rowIndex) : false;
        const serialIndex = pageIndex * pageSize + rowIndex + 1;
        const rowActions = typeof actions === 'function' ? actions(row, rowIndex) : actions;

        const customClassName =
          typeof cardClassName === 'function'
            ? cardClassName(row, rowIndex)
            : cardClassName || '';

        const customStyle =
          typeof cardStyle === 'function' ? cardStyle(row, rowIndex) : cardStyle;

        // Custom renderCard prop takes precedence
        if (renderCard) {
          const helpers: CardHelpers<TData> = {
            isSelected,
            toggleSelect: () => onToggleSelectRow?.(row, rowIndex),
            actions: rowActions,
            serialNumber: serialIndex,
            columns,
            rowIndex,
          };

          return (
            <div
              key={rowIndex}
              className={`rdt-custom-card-wrapper ${customClassName}`}
              style={customStyle}
            >
              {renderCard(row, rowIndex, helpers)}
            </div>
          );
        }

        // Default built-in card
        return (
          <DataTableCard
            key={rowIndex}
            row={row}
            rowIndex={rowIndex}
            columns={columns}
            enableRowSelection={enableRowSelection}
            isSelected={isSelected}
            onToggleSelect={() => onToggleSelectRow?.(row, rowIndex)}
            serialNumber={serialNumber}
            serialIndex={serialIndex}
            actions={actions}
            onRowClick={onRowClick}
            onRowContextMenu={onRowContextMenu}
            enableContextMenu={enableContextMenu}
            className={customClassName}
            style={customStyle}
          />
        );
      })}
    </div>
  );
};
