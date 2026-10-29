import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef, ColumnPinPosition } from '../types/column.types';
import type { ColumnPinningState } from '../types/table.types';
import { getColumnId } from '../utils/getCellValue';

export function parseColumnWidth(
  width: string | number | undefined,
  minWidth: string | number | undefined,
  fallback = 140
): number {
  if (typeof width === 'number') return width;
  if (typeof width === 'string') {
    const parsed = parseInt(width, 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (typeof minWidth === 'number') return minWidth;
  if (typeof minWidth === 'string') {
    const parsed = parseInt(minWidth, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

export interface UseColumnPinningOptions<TData = any> {
  columns: ColumnDef<TData>[];
  initialPinning?: { left?: string[]; right?: string[] };
  enableRowSelection?: boolean;
  serialNumber?: boolean;
  hasActions?: boolean;
  pinActions?: boolean;
}

export interface UseColumnPinningReturn<TData = any> {
  pinning: ColumnPinningState;
  setPinning: React.Dispatch<React.SetStateAction<ColumnPinningState>>;
  pinColumn: (columnId: string, position: ColumnPinPosition) => void;
  canPinColumn: (column: ColumnDef<TData>) => boolean;
  getPinPosition: (columnId: string) => ColumnPinPosition;
  orderedColumns: ColumnDef<TData>[];
  getStickyOffset: (columnId: string) => number | undefined;
  isLastPinnedLeft: (columnId: string) => boolean;
  isFirstPinnedRight: (columnId: string) => boolean;
}

export function useColumnPinning<TData = any>({
  columns,
  initialPinning,
  enableRowSelection = false,
  serialNumber = false,
  hasActions = false,
  pinActions = false,
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

  // Compute exact pixel offsets for sticky positioning
  const offsets = useMemo(() => {
    let currentLeft = 0;
    if (enableRowSelection) currentLeft += 44;
    if (serialNumber) currentLeft += 56;

    const leftMap: Record<string, number> = {};
    const rightMap: Record<string, number> = {};

    let lastLeftId: string | null = null;
    let firstRightId: string | null = null;

    orderedColumns.forEach((col, idx) => {
      const colId = getColumnId(col, idx);
      if (pinning.left.includes(colId)) {
        leftMap[colId] = currentLeft;
        const w = parseColumnWidth(col.width, col.minWidth, 140);
        currentLeft += w;
        lastLeftId = colId;
      }
    });

    let currentRight = pinActions && hasActions ? 64 : 0;
    for (let i = orderedColumns.length - 1; i >= 0; i--) {
      const col = orderedColumns[i];
      const colId = getColumnId(col, i);
      if (pinning.right.includes(colId)) {
        rightMap[colId] = currentRight;
        const w = parseColumnWidth(col.width, col.minWidth, 140);
        currentRight += w;
        firstRightId = colId;
      }
    }

    return {
      leftMap,
      rightMap,
      lastLeftId,
      firstRightId,
    };
  }, [orderedColumns, pinning, enableRowSelection, serialNumber, hasActions, pinActions]);

  const getStickyOffset = useCallback(
    (columnId: string): number | undefined => {
      if (offsets.leftMap[columnId] !== undefined) return offsets.leftMap[columnId];
      if (offsets.rightMap[columnId] !== undefined) return offsets.rightMap[columnId];
      return undefined;
    },
    [offsets]
  );

  const isLastPinnedLeft = useCallback(
    (columnId: string): boolean => {
      if (offsets.lastLeftId) return offsets.lastLeftId === columnId;
      if (serialNumber) return columnId === '__rdt_serial';
      if (enableRowSelection) return columnId === '__rdt_selection';
      return false;
    },
    [offsets, serialNumber, enableRowSelection]
  );

  const isFirstPinnedRight = useCallback(
    (columnId: string): boolean => {
      if (offsets.firstRightId) return offsets.firstRightId === columnId;
      if (pinActions && hasActions) return columnId === '__rdt_actions';
      return false;
    },
    [offsets, hasActions, pinActions]
  );

  return {
    pinning,
    setPinning,
    pinColumn,
    canPinColumn,
    getPinPosition,
    orderedColumns,
    getStickyOffset,
    isLastPinnedLeft,
    isFirstPinnedRight,
  };
}
