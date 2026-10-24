import type { ColumnDef } from '../types/column.types';
import { getCellValue } from './getCellValue';

/**
 * Filters rows based on a global search query across all searchable columns
 */
export function filterRows<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  query: string
): TData[] {
  if (!query || !query.trim()) {
    return data;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return data.filter((row, rowIndex) => {
    return columns.some((column) => {
      if (column.enableFiltering === false || column.hidden) {
        return false;
      }

      const value = getCellValue(row, column, rowIndex);
      if (value == null) return false;

      if (typeof value === 'object') {
        if (value instanceof Date) {
          return value.toLocaleDateString().toLowerCase().includes(normalizedQuery);
        }
        return JSON.stringify(value).toLowerCase().includes(normalizedQuery);
      }

      return String(value).toLowerCase().includes(normalizedQuery);
    });
  });
}
