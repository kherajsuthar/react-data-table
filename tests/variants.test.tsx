import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  DataTable,
  DefaultTable,
  BorderedTable,
  MinimalTable,
  StripedTable,
  ModernTable,
} from '../src';
import type { ColumnDef } from '../src/types/column.types';

const testColumns: ColumnDef[] = [
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' },
];

const testData = [
  { name: 'Diana Prince', role: 'Ambassador' },
  { name: 'Clark Kent', role: 'Reporter' },
];

test('Variant: DefaultTable renders with rdt-variant-default class', () => {
  const html = renderToString(<DefaultTable data={testData} columns={testColumns} />);
  assert.match(html, /rdt-variant-default/);
  assert.match(html, /Diana Prince/);
});

test('Variant: BorderedTable renders with rdt-variant-bordered class', () => {
  const html = renderToString(<BorderedTable data={testData} columns={testColumns} />);
  assert.match(html, /rdt-variant-bordered/);
  assert.match(html, /Clark Kent/);
});

test('Variant: MinimalTable renders with rdt-variant-minimal class', () => {
  const html = renderToString(<MinimalTable data={testData} columns={testColumns} />);
  assert.match(html, /rdt-variant-minimal/);
});

test('Variant: StripedTable renders with rdt-variant-striped class', () => {
  const html = renderToString(<StripedTable data={testData} columns={testColumns} />);
  assert.match(html, /rdt-variant-striped/);
});

test('Variant: ModernTable renders with rdt-variant-modern class', () => {
  const html = renderToString(<ModernTable data={testData} columns={testColumns} />);
  assert.match(html, /rdt-variant-modern/);
});

test('Variant: DataTable prop variant overrides default', () => {
  const html = renderToString(<DataTable data={testData} columns={testColumns} variant="modern" />);
  assert.match(html, /rdt-variant-modern/);
});
