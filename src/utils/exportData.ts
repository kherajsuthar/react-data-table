import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { ColumnDef } from '../types/column.types';
import { getCellValue, getColumnId } from './getCellValue';

/**
 * Gets a clean text label for the column header
 */
export function getColumnHeaderLabel<TData = any>(column: ColumnDef<TData>): string {
  if (typeof column.title === 'string') return column.title;
  if (typeof column.header === 'string') return column.header;
  if (column.key) return String(column.key);
  if (column.accessorKey) return String(column.accessorKey);
  return 'Column';
}

/**
 * Filter columns suitable for export (excludes hidden, non-exportable, actions, and selection columns)
 */
export function getExportableColumns<TData = any>(columns: ColumnDef<TData>[]): ColumnDef<TData>[] {
  return columns.filter((col, idx) => {
    if (col.hidden) return false;
    if (col.exportable === false) return false;
    const colId = getColumnId(col, idx);
    if (
      colId === '__rdt_actions' ||
      colId === '__rdt_selection' ||
      colId === 'actions' ||
      colId === 'selection'
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Converts any cell value to a clean string suitable for CSV/Excel/PDF export
 */
export function formatValueForExport(value: any): string {
  if (value == null) return '';
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'object') {
    if ('label' in value && typeof value.label === 'string') return value.label;
    if ('name' in value && typeof value.name === 'string') return value.name;
    if ('title' in value && typeof value.title === 'string') return value.title;
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Resolves cell value specifically for export, honoring exportValue and exportFormatter
 */
export function getExportCellValue<TData = any>(
  row: TData,
  col: ColumnDef<TData>,
  rowIndex: number
): string {
  if (col.exportValue) {
    const val = col.exportValue(row, rowIndex);
    if (col.exportFormatter) {
      return col.exportFormatter(val, row, rowIndex);
    }
    return formatValueForExport(val);
  }

  const rawValue = getCellValue(row, col, rowIndex);
  if (col.exportFormatter) {
    return col.exportFormatter(rawValue, row, rowIndex);
  }
  return formatValueForExport(rawValue);
}

export interface ExportCSVOptions {
  filename?: string;
  delimiter?: string;
  includeBOM?: boolean;
}

/**
 * Generates an RFC 4180-compliant CSV string from table data and column definitions
 */
export function generateCSVContent<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  options?: { delimiter?: string; includeBOM?: boolean }
): string {
  const delimiter = options?.delimiter || ',';
  const includeBOM = options?.includeBOM !== false;
  const exportColumns = getExportableColumns(columns);

  const headers = exportColumns.map((col) => {
    const label = getColumnHeaderLabel(col);
    return `"${label.replace(/"/g, '""')}"`;
  });

  const rows = data.map((row, rowIndex) => {
    return exportColumns
      .map((col) => {
        const formatted = getExportCellValue(row, col, rowIndex);
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(delimiter);
  });

  const csvBody = [headers.join(delimiter), ...rows].join('\r\n');
  return includeBOM ? `\uFEFF${csvBody}` : csvBody;
}

/**
 * Normalizes export file name by stripping conflicting extensions and applying target extension
 */
function normalizeFileName(filename: string, ext: string): string {
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
  const base = filename.replace(/\.(csv|xlsx|xls|pdf|json)$/i, '');
  return `${base || 'table-export'}${cleanExt}`;
}

/**
 * Converts table data to CSV format with UTF-8 BOM and triggers browser download
 */
export function exportToCSV<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  filenameOrOptions: string | ExportCSVOptions = 'table-export.csv'
): void {
  const filename =
    typeof filenameOrOptions === 'string'
      ? filenameOrOptions
      : filenameOrOptions?.filename || 'table-export.csv';

  const delimiter = typeof filenameOrOptions === 'object' ? filenameOrOptions.delimiter : ',';
  const includeBOM = typeof filenameOrOptions === 'object' ? filenameOrOptions.includeBOM : true;

  const finalFilename = normalizeFileName(filename, '.csv');
  const csvContent = generateCSVContent(data, columns, { delimiter, includeBOM });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, finalFilename);
}

/**
 * Exports table data to Excel (.xlsx) file
 */
export function exportToXLSX<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  filename = 'table-export.xlsx'
): void {
  const exportColumns = getExportableColumns(columns);
  const headers = exportColumns.map((col) => getColumnHeaderLabel(col));

  const rows = data.map((row, rowIndex) => {
    return exportColumns.map((col) => getExportCellValue(row, col, rowIndex));
  });

  const finalFilename = normalizeFileName(filename, '.xlsx');
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Exports table data to PDF file using jsPDF and jspdf-autotable
 */
export function exportToPDF<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  filename = 'table-export.pdf',
  documentTitle = 'Table Report'
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const exportColumns = getExportableColumns(columns);
  const headers = exportColumns.map((col) => getColumnHeaderLabel(col));

  const rows = data.map((row, rowIndex) => {
    return exportColumns.map((col) => getExportCellValue(row, col, rowIndex));
  });

  const finalFilename = normalizeFileName(filename, '.pdf');

  // Header Title
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(documentTitle, 40, 36);

  // Subtitle / Date
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 40, 52);

  // AutoTable
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 65,
    margin: { left: 40, right: 40 },
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(finalFilename);
}

export interface PrintTableOptions {
  title?: string;
  element?: HTMLElement | null;
}

/**
 * Triggers clean isolated print view for the table
 */
export function printTable(
  optionsOrTitle?: string | PrintTableOptions,
  targetElement?: HTMLElement | null
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Close any open action menus
  window.dispatchEvent(new CustomEvent('rdt-close-all-actions', { detail: { id: null } }));

  let title = 'React Data Table';
  let element: HTMLElement | null = null;

  if (typeof optionsOrTitle === 'string') {
    title = optionsOrTitle || 'React Data Table';
    element = targetElement || null;
  } else if (optionsOrTitle && typeof optionsOrTitle === 'object') {
    title = optionsOrTitle.title || 'React Data Table';
    element = optionsOrTitle.element || targetElement || null;
  } else {
    element = targetElement || null;
  }

  // Auto-find container if not provided
  if (!element) {
    element =
      document.querySelector<HTMLElement>('.rdt-container') ||
      document.querySelector<HTMLElement>('.rdt-table');
  }

  // If still no element, fallback to native window.print()
  if (!element) {
    window.print();
    return;
  }

  // Create an offscreen iframe with real layout geometry for reliable isolated printing
  const iframe = document.createElement('iframe');
  iframe.setAttribute(
    'style',
    'position:fixed;left:-9999px;top:0;width:1024px;height:768px;border:none;opacity:0;pointer-events:none;'
  );
  iframe.setAttribute('title', title);
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  // Gather stylesheets from host page
  let styleTags = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    styleTags += node.outerHTML;
  });

  // Clone table or container
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove all non-printable and interactive elements from the clone
  const nonPrintableSelectors = [
    '.rdt-th-selection',
    '.rdt-td-selection',
    '.rdt-th-actions',
    '.rdt-td-actions',
    '.rdt-actions-container',
    '.rdt-actions-trigger',
    '.rdt-actions-menu',
    '.rdt-toolbar',
    '.rdt-pagination',
    '.rdt-copy-btn',
    '.rdt-drag-handle',
    '.rdt-pin-btn',
    '.rdt-sort-icon',
    '.rdt-no-print',
    '.rdt-print-only',
    '.rdt-print-header',
    'button',
    '[class*="variant-selector"]',
    '[class*="variant-picker"]',
    '[class*="choose-variant"]',
    '[class*="variant-tabs"]',
    '[class*="variant-switch"]',
  ].join(',');

  clone.querySelectorAll(nonPrintableSelectors).forEach((el) => el.remove());

  // Also remove any residual element mentioning "choose variant" or "variant" switchers
  clone.querySelectorAll('*').forEach((el) => {
    const text = el.textContent?.trim().toLowerCase() || '';
    if (text.includes('choose variant') || text.includes('chose variant')) {
      el.remove();
    }
  });

  // Ensure table and wrapper in clone expand to 100% full width
  clone.style.width = '100%';
  clone.style.minWidth = '100%';
  clone.style.maxWidth = '100%';
  clone.style.margin = '0';
  clone.style.padding = '0';

  const wrapper = clone.classList.contains('rdt-table-wrapper')
    ? clone
    : clone.querySelector<HTMLElement>('.rdt-table-wrapper');
  if (wrapper) {
    wrapper.style.removeProperty('max-height');
    wrapper.style.removeProperty('overflow');
    wrapper.style.removeProperty('overflow-x');
    wrapper.style.removeProperty('overflow-y');
    wrapper.style.overflow = 'visible';
    wrapper.style.height = 'auto';
    wrapper.style.maxHeight = 'none';
    wrapper.style.width = '100%';
    wrapper.style.minWidth = '100%';
    wrapper.style.maxWidth = '100%';
  }

  const table = clone.classList.contains('rdt-table')
    ? clone
    : clone.querySelector<HTMLElement>('.rdt-table');
  if (table) {
    table.style.width = '100%';
    table.style.minWidth = '100%';
    table.style.maxWidth = '100%';
    table.style.tableLayout = 'auto';
  }

  // Neutralize inline positioning and widths on clone cells so it fills 100% width
  clone.querySelectorAll('.rdt-th, .rdt-td').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.removeProperty('left');
    htmlEl.style.removeProperty('right');
    htmlEl.style.removeProperty('position');
    if (!htmlEl.classList.contains('rdt-th-serial') && !htmlEl.classList.contains('rdt-td-serial')) {
      htmlEl.style.removeProperty('width');
      htmlEl.style.removeProperty('min-width');
      htmlEl.style.removeProperty('max-width');
      htmlEl.style.width = 'auto';
    }
  });

  // Print-specific stylesheet for the isolated iframe
  const printStyles = `
    @page {
      margin: 10mm;
      size: auto;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #111827 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
      font-size: 8pt !important;
      line-height: 1.3 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .rdt-print-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #e5e7eb;
      width: 100% !important;
    }
    .rdt-print-title {
      font-size: 11pt !important;
      font-weight: 700 !important;
      color: #111827 !important;
      margin: 0;
      padding: 0;
    }
    .rdt-print-date {
      font-size: 7.5pt !important;
      color: #6b7280;
    }
    .rdt-container, .rdt-table-wrapper {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      overflow: visible !important;
      background: transparent !important;
    }
    .rdt-table {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      margin: 0 !important;
      table-layout: auto !important;
      background: #ffffff !important;
    }
    .rdt-thead {
      display: table-header-group !important;
    }
    .rdt-tbody {
      display: table-row-group !important;
    }
    .rdt-tr {
      display: table-row !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .rdt-th, .rdt-td {
      display: table-cell !important;
      padding: 4px 6px !important;
      border: 1px solid #d1d5db !important;
      color: #111827 !important;
      font-size: 7.5pt !important;
      line-height: 1.25 !important;
      vertical-align: middle !important;
      background-color: #ffffff !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
    }
    .rdt-th {
      background-color: #f3f4f6 !important;
      font-weight: 600 !important;
      font-size: 7.5pt !important;
      text-transform: uppercase !important;
      letter-spacing: 0.02em !important;
      color: #374151 !important;
      border-bottom: 1.5px solid #9ca3af !important;
    }
    .rdt-td {
      font-size: 8pt !important;
    }
    .rdt-th-serial, .rdt-td-serial {
      width: 32px !important;
      min-width: 32px !important;
      max-width: 40px !important;
      text-align: center !important;
      padding: 4px !important;
      color: #4b5563 !important;
    }
    .rdt-avatar-img, .rdt-avatar-fallback {
      width: 20px !important;
      height: 20px !important;
      font-size: 7.5pt !important;
    }
    .rdt-avatar-cell {
      gap: 5px !important;
    }
    .rdt-badge, .rdt-badge-cell .rdt-badge {
      background: none !important;
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      font-size: 7.5pt !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .rdt-badge-dot {
      width: 5px !important;
      height: 5px !important;
      border-radius: 50% !important;
      background-color: currentColor !important;
      display: inline-block !important;
    }
    .rdt-badge-success { color: #16a34a !important; background: transparent !important; border: none !important; }
    .rdt-badge-warning { color: #d97706 !important; background: transparent !important; border: none !important; }
    .rdt-badge-error { color: #dc2626 !important; background: transparent !important; border: none !important; }
    .rdt-badge-info { color: #0284c7 !important; background: transparent !important; border: none !important; }
    .rdt-badge-neutral { color: #4b5563 !important; background: transparent !important; border: none !important; }
    .rdt-badge-primary { color: #2563eb !important; background: transparent !important; border: none !important; }
  `;

  const dateString = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${styleTags}
        <style>${printStyles}</style>
      </head>
      <body>
        <div class="rdt-print-header">
          <h1 class="rdt-print-title">${title}</h1>
          <div class="rdt-print-date">${dateString}</div>
        </div>
        ${clone.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Wait for iframe styles to settle, then print
  const runPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2000);
    }
  };

  setTimeout(runPrint, 150);
}

/**
 * Exports table data to JSON format
 */
export function exportToJSON<TData = any>(
  data: TData[],
  filename = 'table-export.json'
): void {
  const finalFilename = normalizeFileName(filename, '.json');
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, finalFilename);
}

function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
