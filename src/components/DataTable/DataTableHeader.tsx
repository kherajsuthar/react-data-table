import React, { useRef } from 'react';
import type { ColumnDef, ColumnPinPosition, SortDirection } from '../../types/column.types';
import { getColumnId } from '../../utils/getCellValue';
import { parseColumnWidth } from '../../hooks/useColumnPinning';

export interface DataTableHeaderProps<TData = any> {
  columns: ColumnDef<TData>[];
  enableSorting?: boolean;
  getSortDirection?: (columnId: string) => SortDirection;
  toggleSort?: (columnId: string) => void;
  // Selection
  enableRowSelection?: boolean;
  isAllSelected?: boolean;
  isPartiallySelected?: boolean;
  onToggleSelectAll?: () => void;
  // Serial number
  serialNumber?: boolean;
  serialNumberTitle?: React.ReactNode;
  // Actions
  hasActions?: boolean;
  pinActions?: boolean;
  actionColumnTitle?: React.ReactNode;
  // Drag & Reorder
  enableColumnReorder?: boolean;
  dragOverColumnId?: string | null;
  onDragStart?: (e: React.DragEvent, columnId: string) => void;
  onDragOver?: (e: React.DragEvent, columnId: string) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, columnId: string) => void;
  onDragEnd?: () => void;
  // Pinning
  enableColumnPinning?: boolean;
  getPinPosition?: (columnId: string) => ColumnPinPosition;
  canPinColumn?: (column: ColumnDef<TData>) => boolean;
  pinColumn?: (columnId: string, position: ColumnPinPosition) => void;
  getStickyOffset?: (columnId: string) => number | undefined;
  isLastPinnedLeft?: (columnId: string) => boolean;
  isFirstPinnedRight?: (columnId: string) => boolean;
}

export const DataTableHeader = <TData extends Record<string, any>>({
  columns,
  enableSorting = true,
  getSortDirection,
  toggleSort,
  enableRowSelection = false,
  isAllSelected = false,
  isPartiallySelected = false,
  onToggleSelectAll,
  serialNumber = false,
  serialNumberTitle = '#',
  hasActions = false,
  pinActions = false,
  actionColumnTitle = 'Actions',
  enableColumnReorder = true,
  dragOverColumnId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  enableColumnPinning = true,
  getPinPosition,
  canPinColumn,
  pinColumn,
  getStickyOffset,
  isLastPinnedLeft,
  isFirstPinnedRight,
}: DataTableHeaderProps<TData>): React.ReactNode => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  return (
    <thead className="rdt-thead">
      <tr className="rdt-tr rdt-header-row">
        {/* 1. Select All Checkbox */}
        {enableRowSelection && (
          <th
            className={`rdt-th rdt-th-selection rdt-pinned-left rdt-no-print ${
              isLastPinnedLeft?.('__rdt_selection') ? 'rdt-pinned-last-left' : ''
            }`}
            style={{ left: 0, width: 44, minWidth: 44 }}
          >
            <input
              ref={checkboxRef}
              type="checkbox"
              className="rdt-checkbox"
              checked={isAllSelected}
              onChange={onToggleSelectAll}
              aria-label="Select all rows"
            />
          </th>
        )}

        {/* 2. Serial Number Header */}
        {serialNumber && (
          <th
            className={`rdt-th rdt-th-serial rdt-pinned-left ${
              isLastPinnedLeft?.('__rdt_serial') ? 'rdt-pinned-last-left' : ''
            }`}
            style={{
              left: enableRowSelection ? 44 : 0,
              width: 56,
              minWidth: 56,
              textAlign: 'center',
            }}
          >
            {serialNumberTitle}
          </th>
        )}

        {/* 3. Data Columns Headers */}
        {columns.map((column, colIdx) => {
          const colId = getColumnId(column, colIdx);
          const isSortable = enableSorting && column.enableSorting !== false;
          const sortDir = getSortDirection ? getSortDirection(colId) : null;
          const pin = getPinPosition ? getPinPosition(colId) : false;
          const isPinAllowed = enableColumnPinning && (!canPinColumn || canPinColumn(column));
          const isDragOver = dragOverColumnId === colId;
          const stickyOffset = getStickyOffset ? getStickyOffset(colId) : undefined;
          const isLastLeft = isLastPinnedLeft ? isLastPinnedLeft(colId) : false;
          const isFirstRight = isFirstPinnedRight ? isFirstPinnedRight(colId) : false;

          const alignClass = column.align ? `rdt-align-${column.align}` : 'rdt-align-left';
          const pinClass =
            pin === 'left'
              ? `rdt-pinned-left ${isLastLeft ? 'rdt-pinned-last-left' : ''}`
              : pin === 'right'
              ? `rdt-pinned-right ${isFirstRight ? 'rdt-pinned-first-right' : ''}`
              : '';

          const colWidth = pin ? parseColumnWidth(column.width, column.minWidth, 140) : column.width;

          const style: React.CSSProperties = {
            width: colWidth,
            minWidth: pin ? colWidth : column.minWidth,
            maxWidth: column.maxWidth,
            ...(pin === 'left' && stickyOffset !== undefined ? { left: stickyOffset } : {}),
            ...(pin === 'right' && stickyOffset !== undefined ? { right: stickyOffset } : {}),
          };

          const handleHeaderClick = () => {
            if (isSortable && toggleSort) {
              toggleSort(colId);
            }
          };

          const handlePinToggle = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!pinColumn) return;
            if (pin === 'left') {
              pinColumn(colId, false);
            } else {
              pinColumn(colId, 'left');
            }
          };

          return (
            <th
              key={colId}
              className={`rdt-th ${alignClass} ${pinClass} ${isSortable ? 'rdt-th-sortable' : ''} ${isDragOver ? 'rdt-th-dragover' : ''} ${column.className || ''}`}
              style={style}
              draggable={enableColumnReorder}
              onDragStart={(e) => onDragStart?.(e, colId)}
              onDragOver={(e) => onDragOver?.(e, colId)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop?.(e, colId)}
              onDragEnd={onDragEnd}
              onClick={handleHeaderClick}
            >
              <div className="rdt-th-content">
                {enableColumnReorder && (
                  <span className="rdt-drag-handle" title="Drag to reorder column">
                    <svg width="10" height="14" viewBox="0 0 10 16" fill="currentColor">
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="8" cy="2" r="1.5" />
                      <circle cx="2" cy="8" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="2" cy="14" r="1.5" />
                      <circle cx="8" cy="14" r="1.5" />
                    </svg>
                  </span>
                )}

                <span className="rdt-th-title">
                  {typeof column.title === 'function'
                    ? (column.title as any)({ column, sortDirection: sortDir, toggleSort: () => toggleSort?.(colId) })
                    : column.title ?? column.header ?? colId}
                </span>

                {/* Sort indicator */}
                {isSortable && (
                  <span className={`rdt-sort-icon ${sortDir ? 'rdt-sort-active' : ''}`}>
                    {sortDir === 'asc' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    ) : sortDir === 'desc' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                        <path d="m7 15 5 5 5-5" />
                        <path d="m7 9 5-5 5 5" />
                      </svg>
                    )}
                  </span>
                )}

                {/* Pin toggle button */}
                {isPinAllowed && (
                  <button
                    type="button"
                    className={`rdt-pin-btn ${pin ? 'rdt-pin-active' : ''}`}
                    onClick={handlePinToggle}
                    title={pin ? 'Unpin column' : 'Pin column to left'}
                    aria-label="Pin column"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={pin ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="17" x2="12" y2="22" />
                      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                    </svg>
                  </button>
                )}
              </div>
            </th>
          );
        })}

        {/* 4. Actions Header */}
        {hasActions && (
          <th
            className={`rdt-th rdt-th-actions rdt-no-print ${
              pinActions ? `rdt-pinned-right ${isFirstPinnedRight?.('__rdt_actions') ? 'rdt-pinned-first-right' : ''}` : ''
            }`}
            style={{
              width: 64,
              minWidth: 64,
              textAlign: 'center',
              ...(pinActions ? { right: 0 } : {}),
            }}
          >
            {actionColumnTitle}
          </th>
        )}
      </tr>
    </thead>
  );
};
