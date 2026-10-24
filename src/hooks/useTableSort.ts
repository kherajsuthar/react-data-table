import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef, SortDirection } from '../types/column.types';
import type { SortConfig } from '../types/table.types';
import { sortRows } from '../utils/sortRows';

export interface UseTableSortOptions<TData = any> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialSort?: SortConfig[];
  onSortChange?: (sorting: SortConfig[]) => void;
  multiSort?: boolean;
  enabled?: boolean;
}

export interface UseTableSortReturn<TData = any> {
  sorting: SortConfig[];
  setSorting: React.Dispatch<React.SetStateAction<SortConfig[]>>;
  toggleSort: (columnId: string) => void;
  getSortDirection: (columnId: string) => SortDirection;
  sortedData: TData[];
}

export function useTableSort<TData = any>({
  data,
  columns,
  initialSort = [],
  onSortChange,
  multiSort = false,
  enabled = true,
}: UseTableSortOptions<TData>): UseTableSortReturn<TData> {
  const [sorting, setSorting] = useState<SortConfig[]>(initialSort);

  const toggleSort = useCallback(
    (columnId: string) => {
      if (!enabled) return;

      setSorting((prevSorting) => {
        const existingIndex = prevSorting.findIndex((s) => s.columnId === columnId);
        let nextSorting: SortConfig[];

        if (existingIndex > -1) {
          const currentDirection = prevSorting[existingIndex].direction;
          if (currentDirection === 'asc') {
            nextSorting = multiSort
              ? prevSorting.map((s, idx) => (idx === existingIndex ? { ...s, direction: 'desc' as const } : s))
              : [{ columnId, direction: 'desc' }];
          } else {
            // Remove sort (reset)
            nextSorting = multiSort
              ? prevSorting.filter((_, idx) => idx !== existingIndex)
              : [];
          }
        } else {
          // Add ascending
          nextSorting = multiSort
            ? [...prevSorting, { columnId, direction: 'asc' }]
            : [{ columnId, direction: 'asc' }];
        }

        onSortChange?.(nextSorting);
        return nextSorting;
      });
    },
    [enabled, multiSort, onSortChange]
  );

  const getSortDirection = useCallback(
    (columnId: string): SortDirection => {
      const found = sorting.find((s) => s.columnId === columnId);
      return found ? found.direction : null;
    },
    [sorting]
  );

  const sortedData = useMemo(() => {
    if (!enabled) return data;
    return sortRows(data, columns, sorting);
  }, [data, columns, sorting, enabled]);

  return {
    sorting,
    setSorting,
    toggleSort,
    getSortDirection,
    sortedData,
  };
}
