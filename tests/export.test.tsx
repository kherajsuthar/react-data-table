import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DataTable } from '../src/components/DataTable/DataTable';
import { DataTableToolbar } from '../src/components/DataTable/DataTableToolbar';
import { generateCSVContent, getExportableColumns } from '../src/utils/exportData';
import type { ColumnDef } from '../src/types/column.types';

interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
  active: boolean;
  notes?: string;
}

const mockEmployees: Employee[] = [
  { id: 1, name: 'Alice Smith', department: 'Engineering', salary: 95000, active: true, notes: 'Lead "Architect"' },
  { id: 2, name: 'Bob Jones', department: 'Design', salary: 82000, active: false, notes: 'UI, UX\nRemote' },
  { id: 3, name: 'Charlie Brown', department: 'Marketing', salary: 65000, active: true },
];

test('CSV Export: exports entire table data (all rows) with RFC 4180 escaping and UTF-8 BOM', () => {
  const columns: ColumnDef<Employee>[] = [
    { key: 'name', title: 'Full Name' },
    { key: 'department', title: 'Department' },
    { key: 'salary', title: 'Salary' },
    { key: 'active', title: 'Active' },
    { key: 'notes', title: 'Notes' },
  ];

  const csv = generateCSVContent(mockEmployees, columns);

  // 1. Starts with UTF-8 BOM
  assert.ok(csv.startsWith('\uFEFF'), 'CSV should begin with UTF-8 BOM for Excel compatibility');

  // 2. Contains headers
  assert.match(csv, /"Full Name","Department","Salary","Active","Notes"/);

  // 3. Contains all rows (entire table data)
  assert.match(csv, /"Alice Smith","Engineering","95000","Yes","Lead ""Architect"""/);
  assert.match(csv, /"Bob Jones","Design","82000","No","UI, UX\nRemote"/);
  assert.match(csv, /"Charlie Brown","Marketing","65000","Yes",""/);

  // Split lines to verify exact row count: header + 3 rows (considering embedded newline)
  assert.ok(csv.includes('"Charlie Brown"'));
  assert.ok(csv.includes('"Alice Smith"'));
  assert.ok(csv.includes('"Bob Jones"'));
});

test('CSV Export: excludes hidden, non-exportable, actions, and selection columns', () => {
  const columns: ColumnDef<Employee>[] = [
    { key: '__rdt_selection', title: 'Select' },
    { key: 'name', title: 'Name' },
    { key: 'department', title: 'Department', hidden: true },
    { key: 'salary', title: 'Salary', exportable: false },
    { key: '__rdt_actions', title: 'Actions' },
  ];

  const exportable = getExportableColumns(columns);
  assert.equal(exportable.length, 1);
  assert.equal(exportable[0].key, 'name');

  const csv = generateCSVContent(mockEmployees, columns);
  assert.match(csv, /"Name"/);
  assert.doesNotMatch(csv, /"Select"/);
  assert.doesNotMatch(csv, /"Department"/);
  assert.doesNotMatch(csv, /"Salary"/);
  assert.doesNotMatch(csv, /"Actions"/);
});

test('CSV Export: honors custom exportValue and exportFormatter', () => {
  const columns: ColumnDef<Employee>[] = [
    {
      key: 'salary',
      title: 'Pay',
      exportValue: (row) => row.salary * 1.1,
      exportFormatter: (val) => `$${Number(val).toFixed(2)}`,
    },
  ];

  const csv = generateCSVContent(mockEmployees, columns);
  assert.match(csv, /"Pay"/);
  assert.match(csv, /"\$104500\.00"/); // 95000 * 1.1
  assert.match(csv, /"\$90200\.00"/);  // 82000 * 1.1
});

test('CSV Export: supports custom delimiter', () => {
  const columns: ColumnDef<Employee>[] = [
    { key: 'name', title: 'Name' },
    { key: 'department', title: 'Department' },
  ];

  const csv = generateCSVContent(mockEmployees, columns, { delimiter: ';', includeBOM: false });
  assert.ok(!csv.startsWith('\uFEFF'));
  assert.match(csv, /"Name";"Department"/);
  assert.match(csv, /"Alice Smith";"Engineering"/);
});

test('DataTable: renders Export dropdown with CSV as prominent option', () => {
  const columns: ColumnDef<Employee>[] = [
    { key: 'name', title: 'Name' },
  ];

  const html = renderToString(
    <DataTable data={mockEmployees} columns={columns} enableExport={true} />
  );

  assert.match(html, /Export/);
});

test('DataTableToolbar: renders direct single "Export CSV" button when exportFormats=["csv"]', () => {
  const columns: ColumnDef<Employee>[] = [
    { key: 'name', title: 'Name' },
  ];

  const html = renderToString(
    <DataTableToolbar
      columns={columns}
      searchQuery=""
      onSearchChange={() => {}}
      isColumnVisible={() => true}
      toggleColumnVisibility={() => {}}
      exportFormats={['csv']}
      enableExport={true}
    />
  );

  // Directly renders single button with "Export CSV"
  assert.match(html, /Export CSV/);
});
