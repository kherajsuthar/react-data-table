import React from 'react';
import type { DataTableProps } from '../../types/table.types';
import { useDataTable } from '../../hooks/useDataTable';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { DataTablePagination } from './DataTablePagination';

export const DataTable = <TData extends Record<string, any>>(props: DataTableProps<TData>): React.ReactNode => {
  const {
    variant = 'default',
    size = 'md',
    layout = 'table',
    stickyHeader = false,
    maxHeight,
    className = '',
    style,
    // Header & Footer slots
    headerSlot,
    footerSlot,
    toolbarSlot,
    // Column options
    serialNumber = true,
    serialNumberTitle = '#',
    actions,
    actionColumnTitle = 'Actions',
    searchPlaceholder = 'Search records...',
    // Feedback
    loading = false,
    loadingMessage,
    error = null,
    errorMessage,
    onRetry,
    emptyMessage,
    // Row click & context menu
    onRowClick,
    onRowContextMenu,
    enableContextMenu,
    rowClassName,
  } = props;

  const table = useDataTable(props);

  // Calculate total columns count for colSpan
  const totalColumnsCount =
    table.dataColumns.length +
    (props.enableRowSelection ? 1 : 0) +
    (serialNumber ? 1 : 0) +
    (actions ? 1 : 0);

  const wrapperStyle: React.CSSProperties = {
    ...(maxHeight ? { maxHeight, overflowY: 'auto' } : {}),
  };

  const containerClasses = [
    'rdt-container',
    `rdt-variant-${variant}`,
    `rdt-size-${size}`,
    `rdt-layout-${layout}`,
    stickyHeader ? 'rdt-sticky-header' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={style}>
      {/* 1. Header Slot */}
      {headerSlot}

      {/* 2. Toolbar */}
      {(table.searchable || props.enableExport !== false || props.enableColumnVisibility !== false || props.enablePrint !== false || toolbarSlot) && (
        <DataTableToolbar
          searchable={table.searchable}
          searchQuery={table.searchQuery}
          onSearchChange={table.setSearchQuery}
          searchPlaceholder={searchPlaceholder}
          isSearching={table.isSearching}
          columns={table.allColumns}
          isColumnVisible={table.isColumnVisible}
          toggleColumnVisibility={table.toggleColumnVisibility}
          enableColumnVisibility={props.enableColumnVisibility}
          enableExport={props.enableExport}
          enablePrint={props.enablePrint}
          onExportCSV={table.exportToCSV}
          onExportXLSX={table.exportToXLSX}
          onExportPDF={table.exportToPDF}
          onPrint={table.print}
          toolbarSlot={toolbarSlot}
        />
      )}

      {/* 3. Table Container */}
      <div className="rdt-table-wrapper" style={wrapperStyle}>
        <table className="rdt-table">
          <DataTableHeader
            columns={table.dataColumns}
            enableSorting={table.enableSorting}
            getSortDirection={table.getSortDirection}
            toggleSort={table.toggleSort}
            enableRowSelection={table.enableRowSelection}
            isAllSelected={table.isAllSelected}
            isPartiallySelected={table.isPartiallySelected}
            onToggleSelectAll={table.toggleSelectAll}
            serialNumber={serialNumber}
            serialNumberTitle={serialNumberTitle}
            hasActions={!!actions}
            actionColumnTitle={actionColumnTitle}
            enableColumnReorder={table.enableColumnReorder}
            dragOverColumnId={table.dragOverColumnId}
            onDragStart={table.handleDragStart}
            onDragOver={table.handleDragOver}
            onDragLeave={table.handleDragLeave}
            onDrop={table.handleDrop}
            onDragEnd={table.handleDragEnd}
            enableColumnPinning={table.enableColumnPinning}
            getPinPosition={table.getPinPosition}
            canPinColumn={table.canPinColumn}
            pinColumn={table.pinColumn}
          />

          <DataTableBody
            rows={table.rows}
            columns={table.dataColumns}
            totalColumnsCount={totalColumnsCount}
            enableRowSelection={table.enableRowSelection}
            isRowSelected={table.isRowSelected}
            onToggleSelectRow={table.toggleRowSelection}
            serialNumber={serialNumber}
            pageIndex={table.pagination.pageIndex}
            pageSize={table.pagination.pageSize}
            actions={actions}
            onRowClick={onRowClick}
            onRowContextMenu={onRowContextMenu}
            enableContextMenu={enableContextMenu}
            rowClassName={rowClassName}
            getPinPosition={table.getPinPosition}
            loading={loading}
            loadingMessage={loadingMessage}
            error={error}
            errorMessage={errorMessage}
            onRetry={onRetry}
            emptyMessage={emptyMessage}
          />
        </table>
      </div>

      {/* 4. Pagination */}
      {table.paginate && (
        <DataTablePagination
          pageIndex={table.pagination.pageIndex}
          pageSize={table.pagination.pageSize}
          totalRows={table.totalCount}
          totalPages={table.pagination.totalPages}
          pageSizeOptions={table.pageSizeOptions}
          canPreviousPage={table.pagination.canPreviousPage}
          canNextPage={table.pagination.canNextPage}
          onPageChange={table.pagination.setPageIndex}
          onPageSizeChange={table.pagination.setPageSize}
          onPreviousPage={table.pagination.previousPage}
          onNextPage={table.pagination.nextPage}
        />
      )}

      {/* 5. Footer Slot */}
      {footerSlot}
    </div>
  );
};
