import React, { useState, useRef, useEffect } from 'react';
import type { ColumnDef } from '../../types/column.types';
import { getColumnHeaderLabel } from '../../utils/exportData';
import { getColumnId } from '../../utils/getCellValue';

export interface DataTableToolbarProps<TData = any> {
  // Search
  searchable?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  isSearching?: boolean;
  // Columns Visibility
  columns: ColumnDef<TData>[];
  isColumnVisible: (columnId: string) => boolean;
  toggleColumnVisibility: (columnId: string) => void;
  enableColumnVisibility?: boolean;
  // Export & Print
  enableExport?: boolean;
  enablePrint?: boolean;
  onExportCSV?: () => void;
  onExportXLSX?: () => void;
  onExportPDF?: () => void;
  onPrint?: () => void;
  // Custom slot
  toolbarSlot?: React.ReactNode;
}

export const DataTableToolbar = <TData extends Record<string, any>>({
  searchable = true,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  isSearching = false,
  columns,
  isColumnVisible,
  toggleColumnVisibility,
  enableColumnVisibility = true,
  enableExport = true,
  enablePrint = true,
  onExportCSV,
  onExportXLSX,
  onExportPDF,
  onPrint,
  toolbarSlot,
}: DataTableToolbarProps<TData>): React.ReactNode => {
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(e.target as Node)) {
        setShowColumnsMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="rdt-toolbar">
      {/* Left section: Search input & custom slot */}
      <div className="rdt-toolbar-left">
        {searchable && (
          <div className="rdt-search-wrapper">
            <span className="rdt-search-icon">
              {isSearching ? (
                <span className="rdt-spinner" style={{ width: 14, height: 14, borderWidth: 2, margin: 0 }} />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              )}
            </span>
            <input
              type="text"
              className="rdt-search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search records"
            />
            {searchQuery && (
              <button
                type="button"
                className="rdt-search-clear"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {toolbarSlot}
      </div>

      {/* Right section: Column Visibility, Export, Print */}
      <div className="rdt-toolbar-right">
        {/* Columns visibility toggle */}
        {enableColumnVisibility && (
          <div className="rdt-menu-wrapper" ref={columnsMenuRef}>
            <button
              type="button"
              className="rdt-btn"
              onClick={() => setShowColumnsMenu((prev) => !prev)}
              aria-expanded={showColumnsMenu}
              aria-label="Toggle column visibility"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Columns</span>
            </button>

            {showColumnsMenu && (
              <div className="rdt-dropdown-menu rdt-columns-menu">
                <div className="rdt-menu-header">Toggle Columns</div>
                <div className="rdt-menu-list">
                  {columns.map((col, idx) => {
                    const colId = getColumnId(col, idx);
                    const label = getColumnHeaderLabel(col);
                    const isVisible = isColumnVisible(colId);

                    return (
                      <label key={colId} className="rdt-menu-item-checkbox">
                        <input
                          type="checkbox"
                          className="rdt-checkbox"
                          checked={isVisible}
                          onChange={() => toggleColumnVisibility(colId)}
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export dropdown */}
        {enableExport && (
          <div className="rdt-menu-wrapper" ref={exportMenuRef}>
            <button
              type="button"
              className="rdt-btn"
              onClick={() => setShowExportMenu((prev) => !prev)}
              aria-expanded={showExportMenu}
              aria-label="Export data options"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="rdt-dropdown-menu">
                <button
                  type="button"
                  className="rdt-dropdown-item"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportXLSX?.();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 3v18" />
                    <path d="m14 9 4 6" />
                    <path d="m18 9-4 6" />
                  </svg>
                  <span>Export Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  className="rdt-dropdown-item"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportPDF?.();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span>Export PDF</span>
                </button>
                <button
                  type="button"
                  className="rdt-dropdown-item"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportCSV?.();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M8 13h2" />
                    <path d="M8 17h4" />
                  </svg>
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Print button */}
        {enablePrint && (
          <button
            type="button"
            className="rdt-btn"
            onClick={onPrint}
            title="Print table"
            aria-label="Print table"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            <span>Print</span>
          </button>
        )}
      </div>
    </div>
  );
};
