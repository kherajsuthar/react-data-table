import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { ColumnDef } from '../types/column.types';
import { getCellValue } from './getCellValue';

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
 * Converts table data to CSV format and triggers browser download
 */
export function exportToCSV<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  filename = 'table-export.csv'
): void {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const headers = visibleColumns.map((col) => `"${getColumnHeaderLabel(col).replace(/"/g, '""')}"`);

  const rows = data.map((row, rowIndex) => {
    return visibleColumns
      .map((col) => {
        const value = getCellValue(row, col, rowIndex);
        const formatted = formatValueForExport(value);
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Exports table data to Excel (.xlsx) file
 */
export function exportToXLSX<TData = any>(
  data: TData[],
  columns: ColumnDef<TData>[],
  filename = 'table-export.xlsx'
): void {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const headers = visibleColumns.map((col) => getColumnHeaderLabel(col));

  const rows = data.map((row, rowIndex) => {
    return visibleColumns.map((col) => {
      const value = getCellValue(row, col, rowIndex);
      return formatValueForExport(value);
    });
  });

  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
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
  const visibleColumns = columns.filter((col) => !col.hidden);
  const headers = visibleColumns.map((col) => getColumnHeaderLabel(col));

  const rows = data.map((row, rowIndex) => {
    return visibleColumns.map((col) => {
      const value = getCellValue(row, col, rowIndex);
      return formatValueForExport(value);
    });
  });

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

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Triggers clean print view for the table
 */
export function printTable(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rdt-close-all-actions', { detail: { id: null } }));
    window.print();
  }
}

/**
 * Exports table data to JSON format
 */
export function exportToJSON<TData = any>(
  data: TData[],
  filename = 'table-export.json'
): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
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
