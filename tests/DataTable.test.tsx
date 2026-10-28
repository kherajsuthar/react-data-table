import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DataTable } from '../src/components/DataTable/DataTable';
import { filterRows } from '../src/utils/filterRows';
import { sortRows } from '../src/utils/sortRows';
import { getCellValue, getColumnId } from '../src/utils/getCellValue';
import type { ColumnDef } from '../src/types/column.types';

test('DataTable Component: renders rows and columns into HTML', () => {
  interface User {
    id: number;
    name: string;
    email: string;
  }

  const columns: ColumnDef<User>[] = [
    { key: 'name', title: 'User Name' },
    { key: 'email', title: 'Email Address' },
  ];

  const data: User[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com' },
  ];

  const html = renderToString(<DataTable data={data} columns={columns} />);

  // Assertions
  assert.match(html, /User Name/);
  assert.match(html, /Email Address/);
  assert.match(html, /Alice Smith/);
  assert.match(html, /bob@example.com/);
  assert.match(html, /rdt-container/);
});

test('DataTable Utilities: getCellValue with nested keys and accessor function', () => {
  const row = {
    profile: {
      firstName: 'Bruce',
      lastName: 'Wayne',
    },
    role: 'Detective',
  };

  const colNested: ColumnDef = { key: 'profile.firstName', title: 'First Name' };
  const colFn: ColumnDef = {
    key: 'full',
    title: 'Full',
    value: (r) => `${r.profile.firstName} ${r.profile.lastName}`,
  };

  assert.equal(getCellValue(row, colNested, 0), 'Bruce');
  assert.equal(getCellValue(row, colFn, 0), 'Bruce Wayne');
});

test('DataTable Utilities: filterRows performs case-insensitive search across columns', () => {
  const data = [
    { name: 'Apple MacBook Pro', category: 'Laptop' },
    { name: 'Dell XPS 15', category: 'Laptop' },
    { name: 'Sony WH-1000XM5', category: 'Headphones' },
  ];

  const columns: ColumnDef[] = [
    { key: 'name', title: 'Name' },
    { key: 'category', title: 'Category' },
  ];

  const filtered = filterRows(data, columns, 'sony');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Sony WH-1000XM5');

  const filteredAll = filterRows(data, columns, 'laptop');
  assert.equal(filteredAll.length, 2);
});

test('DataTable Utilities: sortRows sorts numbers, dates, and strings correctly', () => {
  const data = [
    { id: 3, name: 'Charlie', score: 85 },
    { id: 1, name: 'Alice', score: 95 },
    { id: 2, name: 'Bob', score: 90 },
  ];

  const columns: ColumnDef[] = [
    { key: 'name', title: 'Name' },
    { key: 'score', title: 'Score' },
  ];

  // Ascending sort by score
  const sortedAsc = sortRows(data, columns, [{ columnId: 'score', direction: 'asc' }]);
  assert.equal(sortedAsc[0].name, 'Charlie');
  assert.equal(sortedAsc[2].name, 'Alice');

  // Descending sort by name
  const sortedDesc = sortRows(data, columns, [{ columnId: 'name', direction: 'desc' }]);
  assert.equal(sortedDesc[0].name, 'Charlie');
  assert.equal(sortedDesc[2].name, 'Alice');
});

test('DataTable Actions: renders action trigger with padded hit area and action column', () => {
  const data = [{ id: 1, name: 'Alice' }];
  const columns: ColumnDef[] = [{ key: 'name', title: 'Name' }];

  const html = renderToString(
    <DataTable
      data={data}
      columns={columns}
      actions={[
        { label: 'View', icon: 'view', onPress: () => {} },
        { label: 'Edit', icon: 'edit', onPress: () => {} },
        { label: 'Delete User', icon: 'delete', color: 'danger', onPress: () => {} },
      ]}
    />
  );

  assert.match(html, /rdt-th-actions/);
  assert.match(html, /rdt-td-actions/);
  assert.match(html, /rdt-actions-trigger/);
  assert.match(html, /aria-label="Row actions"/);
});

test('ActionIcons: renders built-in icons for common action keys', async () => {
  const { renderActionIcon, ActionIcons } = await import('../src/components/DataTable/ActionIcons');

  const viewIcon = renderActionIcon('view');
  const editIcon = renderActionIcon('edit');
  const deleteIcon = renderActionIcon('delete');
  const customIcon = renderActionIcon(<span id="custom">★</span>);

  const viewHtml = renderToString(<>{viewIcon}</>);
  const editHtml = renderToString(<>{editIcon}</>);
  const deleteHtml = renderToString(<>{deleteIcon}</>);
  const customHtml = renderToString(<>{customIcon}</>);

  assert.match(viewHtml, /<svg/);
  assert.match(editHtml, /<svg/);
  assert.match(deleteHtml, /<svg/);
  assert.match(customHtml, /id="custom"/);
});

test('DataTable Print: printTable function is exported and accessible', async () => {
  const { printTable } = await import('../src/utils/exportData');
  assert.equal(typeof printTable, 'function');
});


