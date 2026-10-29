import React, { useRef } from 'react';
import type { ColumnDef, RowAction } from '../../types/column.types';
import { getColumnHeaderLabel } from '../../utils/exportData';
import { getColumnId } from '../../utils/getCellValue';
import { renderCellContent } from './DataTableCell';
import { DataTableActions, type DataTableActionsHandle } from './DataTableActions';

export interface DataTableCardProps<TData = any> {
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
  onRowContextMenu?: (row: TData, index: number, event: React.MouseEvent) => void;
  enableContextMenu?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const DataTableCard = <TData extends Record<string, any>>({
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
  onRowContextMenu,
  enableContextMenu = true,
  className = '',
  style,
}: DataTableCardProps<TData>): React.ReactNode => {
  const cardRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<DataTableActionsHandle>(null);

  const isClickable = !!onRowClick;

  const handleCardClick = (e: React.MouseEvent) => {
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

  const handleCardContextMenu = (e: React.MouseEvent) => {
    onRowContextMenu?.(row, rowIndex, e);

    if (actions && enableContextMenu !== false) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      actionsRef.current?.openAtCoords(e.clientX, e.clientY);
    }
  };

  // Find primary column (first column or avatar/title column) for header display
  const primaryCol = columns[0];
  const otherCols = columns.slice(1);

  return (
    <div
      ref={cardRef}
      className={`rdt-card ${isSelected ? 'rdt-card-selected' : ''} ${isClickable ? 'rdt-card-clickable' : ''} ${className}`}
      style={style}
      onClick={handleCardClick}
      onContextMenu={handleCardContextMenu}
    >
      {/* 1. Card Top Header */}
      <div className="rdt-card-header">
        <div className="rdt-card-header-left">
          {enableRowSelection && (
            <input
              type="checkbox"
              className="rdt-checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              aria-label={`Select item ${rowIndex + 1}`}
            />
          )}

          {serialNumber && (
            <span className="rdt-card-serial">
              #{serialIndex !== undefined ? serialIndex : rowIndex + 1}
            </span>
          )}

          {primaryCol && (
            <div className="rdt-card-primary-title">
              {renderCellContent(primaryCol, row, rowIndex)}
            </div>
          )}
        </div>

        <div className="rdt-card-header-right">
          {actions && (
            <div className="rdt-card-actions">
              <DataTableActions
                ref={actionsRef}
                actions={actions}
                row={row}
                rowIndex={rowIndex}
                rowRef={cardRef}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Card Body: Remaining column fields */}
      <div className="rdt-card-body">
        {otherCols.map((col, colIdx) => {
          const colId = getColumnId(col, colIdx + 1);
          const label = getColumnHeaderLabel(col);

          return (
            <div key={colId} className="rdt-card-field">
              <span className="rdt-card-label">{label}</span>
              <span className="rdt-card-value">
                {renderCellContent(col, row, rowIndex)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
