import type { ColumnDef } from '../types/column.types';

/**
 * Gets a unique identifier for a column
 */
export function getColumnId<TData = any>(column: ColumnDef<TData>, index = 0): string {
  if (column.key) return String(column.key);
  if (column.accessorKey) return String(column.accessorKey);
  if (typeof column.title === 'string') return column.title;
  if (typeof column.header === 'string') return column.header;
  return `col_${index}`;
}

/**
 * Retrieves the cell value from a row using value function, accessorFn, key, or accessorKey
 */
export function getCellValue<TData = any, TValue = any>(
  row: TData,
  column: ColumnDef<TData, TValue>,
  rowIndex: number
): TValue {
  if (column.value) {
    return column.value(row, rowIndex);
  }

  if (column.accessorFn) {
    return column.accessorFn(row, rowIndex);
  }

  const key = column.key || column.accessorKey;
  if (key) {
    const keyStr = String(key);
    if (!keyStr.includes('.')) {
      return (row as Record<string, any>)[keyStr] as TValue;
    }

    const segments = keyStr.split('.');
    let current: any = row;
    for (const segment of segments) {
      if (current == null) return undefined as unknown as TValue;
      current = current[segment];
    }
    return current as TValue;
  }

  return undefined as unknown as TValue;
}
