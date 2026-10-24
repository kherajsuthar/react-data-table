import { useState, useMemo, useCallback, useEffect } from 'react';

export interface UseTablePaginationOptions<TData = any> {
  data: TData[];
  initialPageIndex?: number;
  initialPageSize?: number;
  pageIndex?: number;
  pageSize?: number;
  totalRows?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  enabled?: boolean;
}

export interface UseTablePaginationReturn<TData = any> {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canNextPage: boolean;
  canPreviousPage: boolean;
  paginatedData: TData[];
}

export function useTablePagination<TData = any>({
  data,
  initialPageIndex = 0,
  initialPageSize = 10,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  totalRows: serverTotalRows,
  onPageChange,
  onPageSizeChange,
  enabled = true,
}: UseTablePaginationOptions<TData>): UseTablePaginationReturn<TData> {
  const [internalPageIndex, setInternalPageIndex] = useState<number>(initialPageIndex);
  const [internalPageSize, setInternalPageSize] = useState<number>(initialPageSize);

  const isControlledPage = controlledPageIndex !== undefined;
  const isControlledPageSize = controlledPageSize !== undefined;

  const currentPageIndex = isControlledPage ? controlledPageIndex : internalPageIndex;
  const currentPageSize = isControlledPageSize ? controlledPageSize : internalPageSize;

  const totalRowCount = serverTotalRows !== undefined ? serverTotalRows : data.length;
  const totalPages = enabled ? Math.max(1, Math.ceil(totalRowCount / currentPageSize)) : 1;

  // Safe page index clamped within bounds
  const safePageIndex = Math.max(0, Math.min(currentPageIndex, totalPages - 1));

  // Sync if clamped
  useEffect(() => {
    if (!isControlledPage && currentPageIndex !== safePageIndex) {
      setInternalPageIndex(safePageIndex);
    }
  }, [safePageIndex, currentPageIndex, isControlledPage]);

  const setPageIndex = useCallback(
    (index: number) => {
      const nextIndex = Math.max(0, Math.min(index, totalPages - 1));
      if (!isControlledPage) {
        setInternalPageIndex(nextIndex);
      }
      onPageChange?.(nextIndex);
    },
    [totalPages, isControlledPage, onPageChange]
  );

  const setPageSize = useCallback(
    (size: number) => {
      if (!isControlledPageSize) {
        setInternalPageSize(size);
      }
      if (!isControlledPage) {
        setInternalPageIndex(0);
      }
      onPageSizeChange?.(size);
      onPageChange?.(0);
    },
    [isControlledPageSize, isControlledPage, onPageSizeChange, onPageChange]
  );

  const nextPage = useCallback(() => {
    if (safePageIndex < totalPages - 1) {
      setPageIndex(safePageIndex + 1);
    }
  }, [safePageIndex, totalPages, setPageIndex]);

  const previousPage = useCallback(() => {
    if (safePageIndex > 0) {
      setPageIndex(safePageIndex - 1);
    }
  }, [safePageIndex, setPageIndex]);

  const canNextPage = safePageIndex < totalPages - 1;
  const canPreviousPage = safePageIndex > 0;

  const paginatedData = useMemo(() => {
    if (!enabled) return data;
    // If serverTotalRows is defined, data is assumed to be already sliced by server
    if (serverTotalRows !== undefined) {
      return data;
    }
    const start = safePageIndex * currentPageSize;
    return data.slice(start, start + currentPageSize);
  }, [data, enabled, serverTotalRows, safePageIndex, currentPageSize]);

  return {
    pageIndex: safePageIndex,
    pageSize: currentPageSize,
    totalPages,
    totalRows: totalRowCount,
    setPageIndex,
    setPageSize,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    paginatedData,
  };
}
