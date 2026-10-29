import React, { useRef } from 'react';
import type { ColumnDef, ColumnPinPosition, RowAction } from '../../types/column.types';
import { DataTableCell } from './DataTableCell';
import { DataTableActions, type DataTableActionsHandle } from './DataTableActions';
import { getColumnId } from '../../utils/getCellValue';

export interface DataTableRowProps<TData = any> {
  row: TData;
  rowIndex: number;
  columns: ColumnDef<TData>[];
  enableRowSelection?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  serialNumber?: boolean;
  serialIndex?: number;
  actions?: RowAction<TData>[] | ((row: TData, index: number) => RowAction<TData>[]);
  pinActions?: boolean;
  onRowClick?: (row: TData, index: number) => void;
  onRowContextMenu?: (row: TData, index: number, event: React.MouseEvent) => void;
  enableContextMenu?: boolean;
  rowClassName?: string | ((row: TData, index: number) => string);
  getPinPosition?: (columnId: string) => ColumnPinPosition;
  getStickyOffset?: (columnId: string) => number | undefined;
  isLastPinnedLeft?: (columnId: string) => boolean;
  isFirstPinnedRight?: (columnId: string) => boolean;
}

export const DataTableRow = <TData extends Record<string, any>>({
  row,
  rowIndex,
  columns,
  enableRowSelection = false,
  isSelected = false,
  onToggleSelect,
  serialNumber = false,
  serialIndex,
  actions,
  pinActions = false,
  onRowClick,
  onRowContextMenu,
  enableContextMenu = true,
  rowClassName,
  getPinPosition,
  getStickyOffset,
  isLastPinnedLeft,
  isFirstPinnedRight,
}: DataTableRowProps<TData>): React.ReactNode => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const actionsRef = useRef<DataTableActionsHandle>(null);

  const customRowClass =
    typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName || '';

  const isClickable = !!onRowClick;

  const handleRowClick = (e: React.MouseEvent) => {
    // Avoid triggering row click when clicking on inputs, buttons, links, etc.
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('.rdt-actions-container') ||
      target.closest('.rdt-copy-btn')
    ) {
      return;
    }
    onRowClick?.(row, rowIndex);
  };

  const handleRowContextMenu = (e: React.MouseEvent) => {
    onRowContextMenu?.(row, rowIndex, e);

    if (actions && enableContextMenu !== false) {
      const target = e.target as HTMLElement;
      // Do not hijack context menu on editable text fields
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      actionsRef.current?.openAtCoords(e.clientX, e.clientY);
    }
  };

  return (
    <tr
      ref={rowRef}
      className={`rdt-tr ${isSelected ? 'rdt-tr-selected' : ''} ${isClickable ? 'rdt-tr-clickable' : ''} ${customRowClass}`}
      onClick={handleRowClick}
      onContextMenu={handleRowContextMenu}
    >
      {/* 1. Row Selection Checkbox */}
      {enableRowSelection && (
        <td
          className={`rdt-td rdt-td-selection rdt-pinned-left rdt-no-print ${
            isLastPinnedLeft?.('__rdt_selection') ? 'rdt-pinned-last-left' : ''
          }`}
          style={{ left: 0, width: 44, minWidth: 44 }}
        >
          <input
            type="checkbox"
            className="rdt-checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            aria-label={`Select row ${rowIndex + 1}`}
          />
        </td>
      )}

      {/* 2. Serial Number Column */}
      {serialNumber && (
        <td
          className={`rdt-td rdt-td-serial rdt-pinned-left ${
            isLastPinnedLeft?.('__rdt_serial') ? 'rdt-pinned-last-left' : ''
          }`}
          style={{
            left: enableRowSelection ? 44 : 0,
            width: 56,
            minWidth: 56,
            textAlign: 'center',
            color: 'var(--rdt-text-muted)',
            fontWeight: 500,
          }}
        >
          {serialIndex !== undefined ? serialIndex : rowIndex + 1}
        </td>
      )}

      {/* 3. Data Columns */}
      {columns.map((column, colIdx) => {
        const colId = getColumnId(column, colIdx);
        const pin = getPinPosition ? getPinPosition(colId) : false;
        const stickyOffset = getStickyOffset ? getStickyOffset(colId) : undefined;
        const isLastLeft = isLastPinnedLeft ? isLastPinnedLeft(colId) : false;
        const isFirstRight = isFirstPinnedRight ? isFirstPinnedRight(colId) : false;

        return (
          <DataTableCell
            key={colId}
            column={column}
            row={row}
            rowIndex={rowIndex}
            pinPosition={pin}
            stickyOffset={stickyOffset}
            isLastPinnedLeft={isLastLeft}
            isFirstPinnedRight={isFirstRight}
          />
        );
      })}

      {/* 4. Actions Column */}
      {actions && (
        <td
          className={`rdt-td rdt-td-actions rdt-no-print ${
            pinActions ? `rdt-pinned-right ${isFirstPinnedRight?.('__rdt_actions') ? 'rdt-pinned-first-right' : ''}` : ''
          }`}
          style={{
            width: 64,
            minWidth: 64,
            textAlign: 'center',
            padding: '6px 8px',
            ...(pinActions ? { right: 0 } : {}),
          }}
        >
          <DataTableActions
            ref={actionsRef}
            actions={actions}
            row={row}
            rowIndex={rowIndex}
            rowRef={rowRef}
          />
        </td>
      )}
    </tr>
  );
};
