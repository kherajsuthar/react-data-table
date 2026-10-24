import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef, ColumnPinPosition } from '../types/column.types';
import type { ColumnPinningState } from '../types/table.types';
import { getColumnId } from '../utils/getCellValue';

export interface UseColumnPinningOptions<TData = any> {
  columns: ColumnDef<TData>[];
  initialPinning?: { left?: string[]; right?: string[] };
}

export interface UseColumnPinningReturn<TData = any> {
  pinning: ColumnPinningState;
  setPinning: React.Dispatch<React.SetStateAction<ColumnPinningState>>;
  pinColumn: (columnId: string, position: ColumnPinPosition) => void;
  canPinColumn: (column: ColumnDef<TData>) => boolean;
  getPinPosition: (columnId: string) => ColumnPinPosition;
  orderedColumns: ColumnDef<TData>[];
}

export function useColumnPinning<TData = any>({
  columns,
  initialPinning,
}: UseColumnPinningOptions<TData>): UseColumnPinningReturn<TData> {
  const defaultPinning = useMemo<ColumnPinningState>(() => {
    const left: string[] = initialPinning?.left ? [...initialPinning.left] : [];
    const right: string[] = initialPinning?.right ? [...initialPinning.right] : [];

    columns.forEach((col, idx) => {
      const id = getColumnId(col, idx);
      if ((col.pinned === true || col.pinned === 'left') && !left.includes(id)) {
        left.push(id);
      } else if (col.pinned === 'right' && !right.includes(id)) {
        right.push(id);
      }
    });

    return { left, right };
  }, [columns, initialPinning]);

  const [pinning, setPinning] = useState<ColumnPinningState>(defaultPinning);

  const canPinColumn = useCallback(
    (column: ColumnDef<TData>): boolean => {
      if (column.pinned === false) return false;
      if (column.enablePinning === false) return false;
      return true;
    },
    []
  );

  const pinColumn = useCallback(
    (columnId: string, position: ColumnPinPosition) => {
      setPinning((prev) => {
        const nextLeft = prev.left.filter((id) => id !== columnId);
        const nextRight = prev.right.filter((id) => id !== columnId);

        if (position === 'left') {
          nextLeft.push(columnId);
        } else if (position === 'right') {
          nextRight.push(columnId);
        }

        return { left: nextLeft, right: nextRight };
      });
    },
    []
  );

  const getPinPosition = useCallback(
    (columnId: string): ColumnPinPosition => {
      if (pinning.left.includes(columnId)) return 'left';
      if (pinning.right.includes(columnId)) return 'right';
      return false;
    },
    [pinning]
  );

  const orderedColumns = useMemo(() => {
    const leftCols: ColumnDef<TData>[] = [];
    const centerCols: ColumnDef<TData>[] = [];
    const rightCols: ColumnDef<TData>[] = [];

    columns.forEach((col, idx) => {
      const id = getColumnId(col, idx);
      if (pinning.left.includes(id)) {
        leftCols.push(col);
      } else if (pinning.right.includes(id)) {
        rightCols.push(col);
      } else {
        centerCols.push(col);
      }
    });

    return [...leftCols, ...centerCols, ...rightCols];
  }, [columns, pinning]);

  return {
    pinning,
    setPinning,
    pinColumn,
    canPinColumn,
    getPinPosition,
    orderedColumns,
  };
}
