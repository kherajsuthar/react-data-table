import React, { useRef, useEffect, useState } from 'react';
import type { DataTableProps, ViewMode } from '../../types/table.types';
import { useDataTable } from '../../hooks/useDataTable';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { DataTablePagination } from './DataTablePagination';
import { DataTableGrid } from './DataTableGrid';

export const DataTable = <TData extends Record<string, any>>(props: DataTableProps<TData>): React.ReactNode => {
  const {
    title = 'React Data Table',
    variant = 'default',
    size = 'md',
    layout = 'table',
    stickyHeader = false,
    responsive = true,
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
    pinActions = false,
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
    // View Modes & Grid Layout
    viewMode: controlledViewMode,
    defaultViewMode = 'table',
    onViewModeChange,
    enableViewModeToggle = true,
    renderCard,
    gridColumns,
    cardMinWidth = '280px',
    gridGap = '16px',
    cardClassName,
    cardStyle,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const table = useDataTable(props, containerRef);

  // Sync document.title during native window printing (Ctrl+P / window.print())
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let originalDocTitle = '';

    const handleBeforePrint = () => {
      originalDocTitle = document.title;
      if (title) {
        document.title = title;
      }
    };

    const handleAfterPrint = () => {
      if (originalDocTitle) {
        document.title = originalDocTitle;
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [title]);

  // View mode normalization ('grid' / 'card' / 'column' vs 'table' / 'list' / 'row')
  const normalizeMode = (mode?: ViewMode): 'table' | 'grid' => {
    if (mode === 'grid' || mode === 'card' || mode === 'column') {
      return 'grid';
    }
    return 'table';
  };

  const [internalViewMode, setInternalViewMode] = useState<'table' | 'grid'>(
    normalizeMode(controlledViewMode || defaultViewMode)
  );

  const currentViewMode = controlledViewMode
    ? normalizeMode(controlledViewMode)
    : internalViewMode;

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    if (!controlledViewMode) {
      setInternalViewMode(mode);
    }
    onViewModeChange?.(mode);
  };

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
    `rdt-view-${currentViewMode}`,
    stickyHeader ? 'rdt-sticky-header' : '',
    responsive ? 'rdt-responsive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={{ maxWidth: '100%', width: '100%', minWidth: 0, boxSizing: 'border-box', ...style }}
    >
      {/* Print Only Header (Visible exclusively during print) */}
      <div className="rdt-print-header rdt-print-only" aria-hidden="true">
        <h1 className="rdt-print-title">{title}</h1>
        <div className="rdt-print-date">
          {new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* 1. Header Slot */}
      {headerSlot && <div className="rdt-header-slot">{headerSlot}</div>}

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
          exportFormats={props.exportFormats}
          enablePrint={props.enablePrint}
          onExportCSV={table.exportToCSV}
          onExportXLSX={table.exportToXLSX}
          onExportPDF={table.exportToPDF}
          onExportJSON={table.exportToJSON}
          onPrint={table.print}
          viewMode={currentViewMode}
          onViewModeChange={handleViewModeChange}
          enableViewModeToggle={enableViewModeToggle}
          toolbarSlot={toolbarSlot}
        />
      )}

      {/* 3. Table or Grid Content */}
      {currentViewMode === 'grid' ? (
        <DataTableGrid
          rows={table.rows}
          columns={table.dataColumns}
          renderCard={renderCard}
          gridColumns={gridColumns}
          cardMinWidth={cardMinWidth}
          gridGap={gridGap}
          cardClassName={cardClassName}
          cardStyle={cardStyle}
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
          loading={loading}
          loadingMessage={loadingMessage}
          error={error}
          errorMessage={errorMessage}
          onRetry={onRetry}
          emptyMessage={emptyMessage}
        />
      ) : (
        <div
          className="rdt-table-wrapper"
          style={{ maxWidth: '100%', width: '100%', minWidth: 0, boxSizing: 'border-box', ...wrapperStyle }}
        >
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
              pinActions={pinActions}
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
              getStickyOffset={table.getStickyOffset}
              isLastPinnedLeft={table.isLastPinnedLeft}
              isFirstPinnedRight={table.isFirstPinnedRight}
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
              pinActions={pinActions}
              onRowClick={onRowClick}
              onRowContextMenu={onRowContextMenu}
              enableContextMenu={enableContextMenu}
              rowClassName={rowClassName}
              getPinPosition={table.getPinPosition}
              getStickyOffset={table.getStickyOffset}
              isLastPinnedLeft={table.isLastPinnedLeft}
              isFirstPinnedRight={table.isFirstPinnedRight}
              loading={loading}
              loadingMessage={loadingMessage}
              error={error}
              errorMessage={errorMessage}
              onRetry={onRetry}
              emptyMessage={emptyMessage}
            />
          </table>
        </div>
      )}

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
      {footerSlot && <div className="rdt-footer-slot">{footerSlot}</div>}
    </div>
  );
};
