import React from 'react';
import type { ColumnDef, ColumnPinPosition } from '../../types/column.types';
import { getCellValue } from '../../utils/getCellValue';
import { TextCell } from '../cells/TextCell';
import { BadgeCell } from '../cells/BadgeCell';
import { AvatarCell } from '../cells/AvatarCell';
import { DateCell } from '../cells/DateCell';

export interface DataTableCellProps<TData = any> {
  column: ColumnDef<TData>;
  row: TData;
  rowIndex: number;
  pinPosition?: ColumnPinPosition;
  stickyOffset?: number;
}

export const DataTableCell = <TData extends Record<string, any>>({
  column,
  row,
  rowIndex,
  pinPosition = false,
  stickyOffset,
}: DataTableCellProps<TData>): React.ReactNode => {
  const value = getCellValue(row, column, rowIndex);

  // Secondary description
  const description =
    typeof column.description === 'function'
      ? column.description(row)
      : column.description;

  // Render cell content based on rules
  const renderCellContent = () => {
    // 1. Custom render function
    if (column.render) {
      return column.render(value, row, rowIndex);
    }

    // 2. Custom cell component/prop
    if (column.cell) {
      return column.cell({ value, row, rowIndex, column });
    }

    // 3. Avatar cell
    if (column.type === 'avatar' || column.avatar) {
      const avatarSrc =
        typeof column.avatar === 'function' ? column.avatar(row) : column.avatar;
      return (
        <AvatarCell
          avatar={avatarSrc}
          value={value}
          description={description}
        />
      );
    }

    // 4. Badge cell
    if (column.type === 'badge' || column.badge) {
      const badgeConfig =
        typeof column.badge === 'function'
          ? column.badge(value, row)
          : column.badge || {};
      return (
        <BadgeCell
          value={value}
          variant={badgeConfig.variant}
          color={badgeConfig.color}
          dot={badgeConfig.dot}
          label={badgeConfig.label}
          description={description}
        />
      );
    }

    // 5. Date cell
    if (column.type === 'date') {
      return <DateCell value={value} description={description} />;
    }

    // 6. Number cell
    if (column.type === 'number') {
      const displayVal =
        typeof value === 'number' ? value.toLocaleString() : value;
      return (
        <TextCell
          value={displayVal}
          description={description}
          copy={column.copy}
        />
      );
    }

    // 7. Standard text cell (with copy support)
    return (
      <TextCell
        value={value}
        description={description}
        copy={column.copy}
      />
    );
  };

  const alignClass = column.align ? `rdt-align-${column.align}` : 'rdt-align-left';
  const pinClass =
    pinPosition === 'left'
      ? 'rdt-pinned-left'
      : pinPosition === 'right'
      ? 'rdt-pinned-right'
      : '';

  const style: React.CSSProperties = {
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
    ...(pinPosition === 'left' && stickyOffset !== undefined ? { left: stickyOffset } : {}),
    ...(pinPosition === 'right' && stickyOffset !== undefined ? { right: stickyOffset } : {}),
  };

  return (
    <td
      className={`rdt-td ${alignClass} ${pinClass} ${column.className || ''}`}
      style={style}
    >
      {renderCellContent()}
    </td>
  );
};
