import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DataTable } from '../src/components/DataTable/DataTable';
import type { ColumnDef } from '../src/types/column.types';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  status: string;
}

const mockColumns: ColumnDef<Product>[] = [
  { key: 'name', title: 'Product Name' },
  { key: 'category', title: 'Category' },
  { key: 'price', title: 'Price', type: 'number' },
  {
    key: 'status',
    title: 'Status',
    type: 'badge',
    badge: (val) => ({
      variant: val === 'In Stock' ? 'success' : 'error',
      dot: true,
    }),
  },
];

const mockData: Product[] = [
  { id: 1, name: 'MacBook Pro', category: 'Laptops', price: 1999, status: 'In Stock' },
  { id: 2, name: 'iPad Air', category: 'Tablets', price: 599, status: 'Low Stock' },
];

test('View Mode: renders in table view mode by default', () => {
  const html = renderToString(<DataTable data={mockData} columns={mockColumns} />);

  // Should have table view classes
  assert.match(html, /rdt-view-table/);
  assert.match(html, /<table class="rdt-table">/);
  assert.match(html, /Product Name/);
  assert.match(html, /MacBook Pro/);
  // View mode switcher buttons should exist
  assert.match(html, /class="rdt-view-mode-toggle"/);
  assert.match(html, /aria-label="Table View"/);
  assert.match(html, /aria-label="Grid View"/);
});

test('View Mode: renders in grid/card view mode when viewMode="grid"', () => {
  const html = renderToString(
    <DataTable data={mockData} columns={mockColumns} viewMode="grid" />
  );

  // Should have grid view classes
  assert.match(html, /rdt-view-grid/);
  assert.match(html, /class="rdt-cards-grid"/);
  assert.match(html, /class="rdt-card/);
  assert.match(html, /MacBook Pro/);
  assert.match(html, /Category/);
  assert.match(html, /Laptops/);
});

test('View Mode: supports aliases "card" and "column" for grid view', () => {
  const htmlCard = renderToString(
    <DataTable data={mockData} columns={mockColumns} viewMode="card" />
  );
  assert.match(htmlCard, /rdt-view-grid/);
  assert.match(htmlCard, /class="rdt-cards-grid"/);

  const htmlColumn = renderToString(
    <DataTable data={mockData} columns={mockColumns} viewMode="column" />
  );
  assert.match(htmlColumn, /rdt-view-grid/);
  assert.match(htmlColumn, /class="rdt-cards-grid"/);
});

test('View Mode: supports custom renderCard prop', () => {
  const html = renderToString(
    <DataTable
      data={mockData}
      columns={mockColumns}
      viewMode="grid"
      renderCard={(row, idx, { serialNumber }) => (
        <div className="my-custom-product-card" id={`card-${row.id}`}>
          <h3>#{serialNumber}: {row.name}</h3>
          <p>Price: ${row.price}</p>
        </div>
      )}
    />
  );

  assert.match(html, /my-custom-product-card/);
  assert.match(html, /MacBook Pro/);
  assert.match(html, /Price/);
  assert.match(html, /1999/);
  assert.match(html, /iPad Air/);
});

test('View Mode: applies custom gridColumns and cardMinWidth', () => {
  const htmlFixed = renderToString(
    <DataTable
      data={mockData}
      columns={mockColumns}
      viewMode="grid"
      gridColumns={3}
      gridGap={20}
    />
  );
  assert.match(htmlFixed, /grid-template-columns:repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(htmlFixed, /gap:20px/);

  const htmlAuto = renderToString(
    <DataTable
      data={mockData}
      columns={mockColumns}
      viewMode="grid"
      cardMinWidth="320px"
    />
  );
  assert.match(htmlAuto, /grid-template-columns:repeat\(auto-fill, minmax\(320px, 1fr\)\)/);
});

test('View Mode: renders card actions and selection in default card', () => {
  const html = renderToString(
    <DataTable
      data={mockData}
      columns={mockColumns}
      viewMode="grid"
      enableRowSelection
      actions={[
        { label: 'View Details', icon: 'view', onPress: () => {} },
      ]}
    />
  );

  assert.match(html, /aria-label="Select item 1"/);
  assert.match(html, /rdt-card-serial/);
  assert.match(html, /rdt-card-actions/);
  assert.match(html, /rdt-actions-trigger/);
});
