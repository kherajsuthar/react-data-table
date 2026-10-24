import React from 'react';

export interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  pageSizeOptions?: number[];
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  pageIndex,
  pageSize,
  totalRows,
  totalPages,
  pageSizeOptions = [5, 10, 20, 50, 100],
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
}) => {
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      let start = Math.max(1, pageIndex - 1);
      let end = Math.min(totalPages - 2, pageIndex + 1);

      if (pageIndex <= 2) {
        end = 3;
      } else if (pageIndex >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) pages.push('dots-1');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push('dots-2');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="rdt-pagination">
      {/* Left: Rows info & Page size selector */}
      <div className="rdt-pagination-info">
        <span>Rows per page:</span>
        <select
          className="rdt-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Select rows per page"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>
          Showing <strong>{startRow}</strong> - <strong>{endRow}</strong> of <strong>{totalRows}</strong>
        </span>
      </div>

      {/* Right: Page navigation buttons */}
      <div className="rdt-pagination-controls">
        {/* First Page */}
        <button
          type="button"
          className="rdt-btn rdt-pagination-btn"
          onClick={() => onPageChange(0)}
          disabled={!canPreviousPage}
          title="First page"
          aria-label="First page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </button>

        {/* Previous Page */}
        <button
          type="button"
          className="rdt-btn rdt-pagination-btn"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
          title="Previous page"
          aria-label="Previous page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <span key={`dots-${idx}`} className="rdt-pagination-dots">
                ...
              </span>
            );
          }

          const isActive = p === pageIndex;
          return (
            <button
              key={p}
              type="button"
              className={`rdt-btn rdt-pagination-btn ${isActive ? 'rdt-btn-primary' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={isActive ? 'page' : undefined}
            >
              {p + 1}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          className="rdt-btn rdt-pagination-btn"
          onClick={onNextPage}
          disabled={!canNextPage}
          title="Next page"
          aria-label="Next page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Last Page */}
        <button
          type="button"
          className="rdt-btn rdt-pagination-btn"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canNextPage}
          title="Last page"
          aria-label="Last page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
