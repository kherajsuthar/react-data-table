import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DataTable } from '../src/components/DataTable/DataTable';
import { parseColumnWidth } from '../src/hooks/useColumnPinning';
import type { ColumnDef } from '../src/types/column.types';

interface Item {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const mockData: Item[] = [
  { id: 1, code: 'A1', name: 'Widget Pro', category: 'Hardware', price: 99, stock: 10 },
  { id: 2, code: 'B2', name: 'Gadget Max', category: 'Devices', price: 199, stock: 5 },
];

test('parseColumnWidth: correctly parses numbers, px strings, minWidth, and fallback', () => {
  assert.equal(parseColumnWidth(150, undefined), 150);
  assert.equal(parseColumnWidth('180px', undefined), 180);
  assert.equal(parseColumnWidth(undefined, '200px'), 200);
  assert.equal(parseColumnWidth(undefined, 220), 220);
  assert.equal(parseColumnWidth(undefined, undefined, 140), 140);
});

test('Column Pinning: applies sticky left and right offsets and classes to th and td', () => {
  const columns: ColumnDef<Item>[] = [
    { key: 'code', title: 'Code', width: 100, pinned: 'left' },
    { key: 'name', title: 'Product Name', width: 180, pinned: 'left' },
    { key: 'category', title: 'Category' },
    { key: 'price', title: 'Price', width: 90, pinned: 'right' },
  ];

  const html = renderToString(
    <DataTable
      data={mockData}
      columns={columns}
      serialNumber={true}
      enableRowSelection={true}
      actions={[
        { label: 'Edit', onPress: () => {} },
      ]}
    />
  );

  // 1. Selection column: left: 0
  assert.match(html, /rdt-th-selection[^"]*rdt-pinned-left/);
  assert.match(html, /left:0/);

  // 2. Serial column: left: 44 (offset by selection)
  assert.match(html, /rdt-th-serial[^"]*rdt-pinned-left/);
  assert.match(html, /left:44px/);

  // 3. First pinned data column (code): left: 44 + 56 = 100px
  assert.match(html, /left:100px/);

  // 4. Second pinned data column (name): left: 100 + 100 = 200px
  assert.match(html, /left:200px/);

  // 5. Actions column: unpinned by default (scrolls horizontally with table)
  assert.doesNotMatch(html, /rdt-th-actions[^"]*rdt-pinned-right/);
  assert.doesNotMatch(html, /rdt-td-actions[^"]*rdt-pinned-right/);

  // 6. Right pinned data column (price): right:0 (since actions is not pinned)
  assert.match(html, /right:0/);

  // 7. Edge divider classes applied
  assert.match(html, /rdt-pinned-last-left/);
  assert.match(html, /rdt-pinned-first-right/);

  // 8. Body td cells also receive pinned classes for pinned data columns
  assert.match(html, /rdt-td[^"]*rdt-pinned-left/);
  assert.match(html, /rdt-td[^"]*rdt-pinned-right/);
});

test('Column Pinning: pinActions={true} pins the action column to right:0 and offsets right-pinned columns', () => {
  const columns: ColumnDef<Item>[] = [
    { key: 'code', title: 'Code', width: 100 },
    { key: 'price', title: 'Price', width: 90, pinned: 'right' },
  ];

  const html = renderToString(
    <DataTable
      data={mockData}
      columns={columns}
      pinActions={true}
      actions={[
        { label: 'Edit', onPress: () => {} },
      ]}
    />
  );

  // Actions column pinned to right: 0
  assert.match(html, /rdt-th-actions[^"]*rdt-pinned-right/);
  assert.match(html, /rdt-td-actions[^"]*rdt-pinned-right/);

  // Price column offset by 64px (width of action column)
  assert.match(html, /right:64px/);
});

test('Parent with padding: container and wrapper contain width properly', () => {
  const columns: ColumnDef<Item>[] = [
    { key: 'name', title: 'Name' },
    { key: 'category', title: 'Category' },
  ];

  const html = renderToString(
    <div style={{ padding: '24px' }}>
      <DataTable data={mockData} columns={columns} />
    </div>
  );

  // Verify container & wrapper have defensive box-sizing & width containment
  assert.match(html, /max-width:100%/);
  assert.match(html, /min-width:0/);
  assert.match(html, /box-sizing:border-box/);
  assert.match(html, /rdt-table-wrapper/);
});
