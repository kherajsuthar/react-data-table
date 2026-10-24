import type { ColumnDef } from '../types/column.types';
import type { SortConfig } from '../types/table.types';
import { getCellValue, getColumnId } from './getCellValue';

/**
 * Sorts rows based on sort configurations
 */
export function sortRows<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  sorting: SortConfig[]
): TData[] {
  if (!sorting.length) {
    return data;
  }

  const columnMap = new Map<string, ColumnDef<TData>>();
  columns.forEach((col, idx) => {
    columnMap.set(getColumnId(col, idx), col);
  });

  return [...data].sort((a, b) => {
    for (const sort of sorting) {
      const column = columnMap.get(sort.columnId);
      if (!column) continue;

      const valA = getCellValue(a, column, 0);
      const valB = getCellValue(b, column, 0);

      if (valA === valB) continue;

      // Nulls / undefined placed at end
      if (valA == null) return 1;
      if (valB == null) return -1;

      // Numbers
      if (typeof valA === 'number' && typeof valB === 'number') {
        const diff = valA - valB;
        return sort.direction === 'asc' ? diff : -diff;
      }

      // Dates
      if (valA instanceof Date && valB instanceof Date) {
        const diff = valA.getTime() - valB.getTime();
        return sort.direction === 'asc' ? diff : -diff;
      }

      // Strings & other primitives
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });

      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}
