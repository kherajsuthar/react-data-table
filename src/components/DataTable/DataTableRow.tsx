import React from 'react';
import type { ColumnDef, ColumnPinPosition, RowAction } from '../../types/column.types';
import { DataTableCell } from './DataTableCell';
import { DataTableActions } from './DataTableActions';
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
  onRowClick?: (row: TData, index: number) => void;
  rowClassName?: string | ((row: TData, index: number) => string);
  getPinPosition?: (columnId: string) => ColumnPinPosition;
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
  onRowClick,
  rowClassName,
  getPinPosition,
}: DataTableRowProps<TData>): React.ReactNode => {
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

  return (
    <tr
      className={`rdt-tr ${isSelected ? 'rdt-tr-selected' : ''} ${isClickable ? 'rdt-tr-clickable' : ''} ${customRowClass}`}
      onClick={handleRowClick}
    >
      {/* 1. Row Selection Checkbox */}
      {enableRowSelection && (
        <td className="rdt-td rdt-td-selection rdt-pinned-left" style={{ left: 0, width: 44 }}>
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
          className="rdt-td rdt-td-serial rdt-pinned-left"
          style={{
            left: enableRowSelection ? 44 : 0,
            width: 56,
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

        return (
          <DataTableCell
            key={colId}
            column={column}
            row={row}
            rowIndex={rowIndex}
            pinPosition={pin}
          />
        );
      })}

      {/* 4. Actions Column */}
      {actions && (
        <td
          className="rdt-td rdt-td-actions rdt-pinned-right"
          style={{ right: 0, width: 60, textAlign: 'center' }}
        >
          <DataTableActions actions={actions} row={row} rowIndex={rowIndex} />
        </td>
      )}
    </tr>
  );
};
