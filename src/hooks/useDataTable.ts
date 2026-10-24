import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { ColumnDef, ColumnPinPosition, SortDirection } from '../types/column.types';
import type { ColumnPinningState, DataTableProps, SortConfig } from '../types/table.types';
import { useTableSearch } from './useTableSearch';
import { useTableSort } from './useTableSort';
import { useTablePagination, type UseTablePaginationReturn } from './useTablePagination';
import { useColumnPinning } from './useColumnPinning';
import { useColumnReorder } from './useColumnReorder';
import { exportToCSV, exportToXLSX, exportToPDF, exportToJSON, printTable } from '../utils/exportData';
import { getColumnId } from '../utils/getCellValue';

export interface UseDataTableReturn<TData = any> {
  rows: TData[];
  allRows: TData[];
  totalCount: number;
  allColumns: ColumnDef<TData>[];
  dataColumns: ColumnDef<TData>[];
  rawOrderedColumns: ColumnDef<TData>[];
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  reorderColumn: (sourceId: string, targetId: string) => void;
  hiddenColumns: string[];
  toggleColumnVisibility: (columnId: string) => void;
  isColumnVisible: (columnId: string) => boolean;
  enableColumnReorder: boolean;
  draggedColumnId: string | null;
  dragOverColumnId: string | null;
  handleDragStart: (e: React.DragEvent, columnId: string) => void;
  handleDragOver: (e: React.DragEvent, columnId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  handleDragEnd: () => void;
  enableColumnPinning: boolean;
  pinning: ColumnPinningState;
  setPinning: React.Dispatch<React.SetStateAction<ColumnPinningState>>;
  pinColumn: (columnId: string, position: ColumnPinPosition) => void;
  canPinColumn: (column: ColumnDef<TData>) => boolean;
  getPinPosition: (columnId: string) => ColumnPinPosition;
  searchable: boolean;
  searchQuery: string;
  debouncedQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  enableSorting: boolean;
  sorting: SortConfig[];
  setSorting: React.Dispatch<React.SetStateAction<SortConfig[]>>;
  toggleSort: (columnId: string) => void;
  getSortDirection: (columnId: string) => SortDirection;
  paginate: boolean;
  pagination: UseTablePaginationReturn<TData>;
  pageSizeOptions: number[];
  enableRowSelection: boolean;
  selectedKeys: (string | number)[];
  isRowSelected: (row: TData, index: number) => boolean;
  toggleRowSelection: (row: TData, index: number) => void;
  toggleSelectAll: () => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  exportToCSV: () => void;
  exportToXLSX: () => void;
  exportToPDF: () => void;
  exportToJSON: () => void;
  print: () => void;
}

export function useDataTable<TData = any>(props: DataTableProps<TData>): UseDataTableReturn<TData> {
  const {
    data,
    columns: userColumns,
    searchable = true,
    searchQuery: controlledSearchQuery,
    onSearch,
    onSearchChange,
    searchDebounceMs = 300,
    enableSorting = true,
    initialSort = [],
    onSortChange,
    multiSort = false,
    paginate = true,
    pageSize = 10,
    pageSizeOptions = [5, 10, 20, 50, 100],
    initialPageIndex = 0,
    pageIndex: controlledPageIndex,
    totalRows: serverTotalRows,
    onPageChange,
    onPageSizeChange,
    enableColumnReorder = true,
    enableColumnPinning = true,
    initialPinnedColumns,
    enableRowSelection = false,
    selectedRowKeys: controlledSelectedRowKeys,
    onSelectionChange,
    getRowId = (row: any, idx: number) => row?.id ?? row?._id ?? idx,
    isRowSelectable = () => true,
    exportFileName = 'table-export',
    onExport,
  } = props;

  // 1. Column reordering & visibility on user data columns
  const {
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
    reorderedColumns: reorderedUserDataColumns,
  } = useColumnReorder<TData>({
    columns: userColumns,
    enabled: enableColumnReorder,
  });

  // Ref to hold pagination reset callback avoiding circular hook inference
  const resetPaginationRef = useRef<() => void>(() => {});

  // 2. Search & filtering
  const {
    query: searchQuery,
    debouncedQuery,
    setQuery: setSearchQuery,
    filteredData,
    isSearching,
  } = useTableSearch<TData>({
    data,
    columns: userColumns,
    initialQuery: controlledSearchQuery,
    debounceMs: searchDebounceMs,
    onSearch,
    onSearchChange,
    onResetPagination: () => resetPaginationRef.current(),
  });

  // 3. Sorting
  const {
    sorting,
    setSorting,
    toggleSort,
    getSortDirection,
    sortedData,
  } = useTableSort<TData>({
    data: filteredData,
    columns: userColumns,
    initialSort,
    onSortChange,
    multiSort,
    enabled: enableSorting,
  });

  // 4. Pagination
  const pagination = useTablePagination<TData>({
    data: sortedData,
    initialPageIndex,
    initialPageSize: pageSize,
    pageIndex: controlledPageIndex,
    pageSize,
    totalRows: serverTotalRows,
    onPageChange,
    onPageSizeChange,
    enabled: paginate,
  });

  // Keep resetPaginationRef current
  resetPaginationRef.current = () => pagination.setPageIndex(0);

  // 5. Row Selection
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>([]);
  const selectedKeys = controlledSelectedRowKeys ?? internalSelectedKeys;

  const isRowSelected = useCallback(
    (row: TData, index: number) => {
      const id = getRowId(row, index);
      return selectedKeys.includes(id);
    },
    [selectedKeys, getRowId]
  );

  const toggleRowSelection = useCallback(
    (row: TData, index: number) => {
      if (!isRowSelectable(row, index)) return;
      const id = getRowId(row, index);
      const isSelected = selectedKeys.includes(id);
      const nextKeys = isSelected ? selectedKeys.filter((k: string | number) => k !== id) : [...selectedKeys, id];

      if (controlledSelectedRowKeys === undefined) {
        setInternalSelectedKeys(nextKeys);
      }

      if (onSelectionChange) {
        const selectedRows = data.filter((item: TData, idx: number) => nextKeys.includes(getRowId(item, idx)));
        onSelectionChange(nextKeys, selectedRows);
      }
    },
    [isRowSelectable, getRowId, selectedKeys, controlledSelectedRowKeys, onSelectionChange, data]
  );

  const toggleSelectAll = useCallback(() => {
    const selectableRows = pagination.paginatedData.filter((row: TData, idx: number) => isRowSelectable(row, idx));
    const allSelected = selectableRows.every((row: TData, idx: number) => isRowSelected(row, idx));

    let nextKeys: (string | number)[];
    if (allSelected) {
      const selectableIds = new Set(selectableRows.map((row: TData, idx: number) => getRowId(row, idx)));
      nextKeys = selectedKeys.filter((k: string | number) => !selectableIds.has(k));
    } else {
      const newIds = selectableRows.map((row: TData, idx: number) => getRowId(row, idx));
      nextKeys = Array.from(new Set([...selectedKeys, ...newIds]));
    }

    if (controlledSelectedRowKeys === undefined) {
      setInternalSelectedKeys(nextKeys);
    }

    if (onSelectionChange) {
      const selectedRows = data.filter((item: TData, idx: number) => nextKeys.includes(getRowId(item, idx)));
      onSelectionChange(nextKeys, selectedRows);
    }
  }, [pagination.paginatedData, isRowSelectable, isRowSelected, selectedKeys, getRowId, controlledSelectedRowKeys, onSelectionChange, data]);

  const isAllSelected = useMemo(() => {
    const selectableRows = pagination.paginatedData.filter((row: TData, idx: number) => isRowSelectable(row, idx));
    if (!selectableRows.length) return false;
    return selectableRows.every((row: TData, idx) => isRowSelected(row, idx));
  }, [pagination.paginatedData, isRowSelectable, isRowSelected]);

  const isPartiallySelected = useMemo(() => {
    const selectableRows = pagination.paginatedData.filter((row: TData, idx: number) => isRowSelectable(row, idx));
    if (!selectableRows.length) return false;
    const count = selectableRows.filter((row: TData, idx) => isRowSelected(row, idx)).length;
    return count > 0 && count < selectableRows.length;
  }, [pagination.paginatedData, isRowSelectable, isRowSelected]);

  // 6. Active data columns (filtered by visibility)
  const activeDataColumns = useMemo(() => {
    return reorderedUserDataColumns.filter((col, idx) => isColumnVisible(getColumnId(col, idx)));
  }, [reorderedUserDataColumns, isColumnVisible]);

  // 7. Column Pinning (applies to active data columns)
  const {
    pinning,
    setPinning,
    pinColumn,
    canPinColumn,
    getPinPosition,
    orderedColumns: pinnedDataColumns,
  } = useColumnPinning<TData>({
    columns: activeDataColumns,
    initialPinning: initialPinnedColumns,
  });

  // 8. Export functions
  const handleExportCSV = useCallback(() => {
    onExport?.('csv', sortedData);
    exportToCSV(sortedData, activeDataColumns, exportFileName);
  }, [sortedData, activeDataColumns, exportFileName, onExport]);

  const handleExportXLSX = useCallback(() => {
    onExport?.('xlsx', sortedData);
    exportToXLSX(sortedData, activeDataColumns, exportFileName);
  }, [sortedData, activeDataColumns, exportFileName, onExport]);

  const handleExportPDF = useCallback(() => {
    onExport?.('pdf', sortedData);
    exportToPDF(sortedData, activeDataColumns, exportFileName);
  }, [sortedData, activeDataColumns, exportFileName, onExport]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(sortedData, exportFileName);
  }, [sortedData, exportFileName]);

  const handlePrint = useCallback(() => {
    printTable();
  }, []);

  return {
    // Data
    rows: pagination.paginatedData,
    allRows: sortedData,
    totalCount: pagination.totalRows,
    // Columns
    allColumns: userColumns,
    dataColumns: pinnedDataColumns,
    rawOrderedColumns: reorderedUserDataColumns,
    columnOrder,
    setColumnOrder,
    reorderColumn,
    hiddenColumns,
    toggleColumnVisibility,
    isColumnVisible,
    // Drag & Reorder
    enableColumnReorder,
    draggedColumnId,
    dragOverColumnId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    // Pinning
    enableColumnPinning,
    pinning,
    setPinning,
    pinColumn,
    canPinColumn,
    getPinPosition,
    // Search
    searchable,
    searchQuery,
    debouncedQuery,
    setSearchQuery,
    isSearching,
    // Sorting
    enableSorting,
    sorting,
    setSorting,
    toggleSort,
    getSortDirection,
    // Pagination
    paginate,
    pagination,
    pageSizeOptions,
    // Selection
    enableRowSelection,
    selectedKeys,
    isRowSelected,
    toggleRowSelection,
    toggleSelectAll,
    isAllSelected,
    isPartiallySelected,
    // Export & Print
    exportToCSV: handleExportCSV,
    exportToXLSX: handleExportXLSX,
    exportToPDF: handleExportPDF,
    exportToJSON: handleExportJSON,
    print: handlePrint,
  };
}
