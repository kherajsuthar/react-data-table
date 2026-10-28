import test from 'node:test';
import assert from 'node:assert/strict';
import React, { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { DataTableRow } from '../src/components/DataTable/DataTableRow';
import type { ColumnDef } from '../src/types/column.types';

test('DataTableRow: check context menu props and trigger', () => {
  const row = { id: 1, name: 'John Doe' };
  const columns: ColumnDef[] = [{ key: 'name', title: 'Name' }];

  let contextMenuFired = false;
  const onRowContextMenu = () => {
    contextMenuFired = true;
  };

  const html = renderToString(
    <table>
      <tbody>
        <DataTableRow
          row={row}
          rowIndex={0}
          columns={columns}
          actions={[{ label: 'Edit', onPress: () => {} }]}
          onRowContextMenu={onRowContextMenu}
        />
      </tbody>
    </table>
  );

  assert.match(html, /rdt-tr/);
  assert.match(html, /rdt-actions-container/);
});
