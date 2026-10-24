import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef } from '../types/column.types';
import { getColumnId } from '../utils/getCellValue';

export interface UseColumnReorderOptions<TData = any> {
  columns: ColumnDef<TData>[];
  enabled?: boolean;
}

export interface UseColumnReorderReturn<TData = any> {
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  reorderColumn: (sourceId: string, targetId: string) => void;
  hiddenColumns: string[];
  toggleColumnVisibility: (columnId: string) => void;
  isColumnVisible: (columnId: string) => boolean;
  draggedColumnId: string | null;
  dragOverColumnId: string | null;
  handleDragStart: (e: React.DragEvent, columnId: string) => void;
  handleDragOver: (e: React.DragEvent, columnId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  handleDragEnd: () => void;
  reorderedColumns: ColumnDef<TData>[];
}

export function useColumnReorder<TData = any>({
  columns,
  enabled = true,
}: UseColumnReorderOptions<TData>): UseColumnReorderReturn<TData> {
  const initialOrder = useMemo(() => {
    return columns.map((col, idx) => getColumnId(col, idx));
  }, [columns]);

  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Hidden columns state
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() => {
    return columns.filter((col) => col.hidden).map((col, idx) => getColumnId(col, idx));
  });

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setHiddenColumns((prev) => {
      if (prev.includes(columnId)) {
        return prev.filter((id) => id !== columnId);
      }
      return [...prev, columnId];
    });
  }, []);

  const isColumnVisible = useCallback(
    (columnId: string) => !hiddenColumns.includes(columnId),
    [hiddenColumns]
  );

  const reorderColumn = useCallback(
    (sourceId: string, targetId: string) => {
      if (!enabled || sourceId === targetId) return;

      setColumnOrder((prevOrder) => {
        const order = prevOrder.length ? [...prevOrder] : columns.map((col, idx) => getColumnId(col, idx));
        const sourceIndex = order.indexOf(sourceId);
        const targetIndex = order.indexOf(targetId);

        if (sourceIndex === -1 || targetIndex === -1) return prevOrder;

        order.splice(sourceIndex, 1);
        order.splice(targetIndex, 0, sourceId);

        return order;
      });
    },
    [enabled, columns]
  );

  // Drag event handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, columnId: string) => {
      if (!enabled) return;
      e.dataTransfer.setData('text/plain', columnId);
      e.dataTransfer.effectAllowed = 'move';
      setDraggedColumnId(columnId);
    },
    [enabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string) => {
      if (!enabled || !draggedColumnId || draggedColumnId === columnId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumnId(columnId);
    },
    [enabled, draggedColumnId]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverColumnId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!enabled) return;
      const sourceId = e.dataTransfer.getData('text/plain') || draggedColumnId;
      if (sourceId && sourceId !== targetId) {
        reorderColumn(sourceId, targetId);
      }
      setDraggedColumnId(null);
      setDragOverColumnId(null);
    },
    [enabled, draggedColumnId, reorderColumn]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  }, []);

  // Ordered and filtered columns according to columnOrder
  const reorderedColumns = useMemo(() => {
    const columnMap = new Map<string, ColumnDef<TData>>();
    columns.forEach((col, idx) => {
      columnMap.set(getColumnId(col, idx), col);
    });

    const ordered: ColumnDef<TData>[] = [];
    const seen = new Set<string>();

    for (const id of columnOrder) {
      const col = columnMap.get(id);
      if (col && !seen.has(id)) {
        ordered.push(col);
        seen.add(id);
      }
    }

    for (const [id, col] of columnMap.entries()) {
      if (!seen.has(id)) {
        ordered.push(col);
        seen.add(id);
      }
    }

    return ordered;
  }, [columns, columnOrder]);

  return {
    columnOrder,
    setColumnOrder,
    reorderColumn,
    hiddenColumns,
    toggleColumnVisibility,
    isColumnVisible,
    draggedColumnId,
    dragOverColumnId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    reorderedColumns,
  };
}
