# React Data Table

A modern, highly customizable, and lightweight React data table library with built-in sorting, search filtering, pagination, column pinning, reordering, custom cell renderers, and elegant table variants.

## Features

- ⚡ **Lightweight & Fast**: Built with modern React and TypeScript.
- 🎨 **Multiple Variants**: Out of the box `default`, `bordered`, `minimal`, `striped`, and `modern` (glassmorphism/card) styles.
- 🔍 **Global & Column Search**: Instant search filtering across data fields.
- ↕️ **Multi-Direction Sorting**: Ascending, descending, and reset column sorting.
- 📄 **Pagination**: Flexible pagination with custom page sizes and page jump controls.
- 📌 **Column Pinning**: Pin crucial columns to the left or right during horizontal scroll.
- 🔀 **Column Reordering**: Easily reorder column positions dynamically.
- 🧩 **Custom Cells**: Built-in cells for `TextCell`, `BadgeCell`, `AvatarCell`, and `DateCell`, plus custom renderers.
- 📥 **Export to CSV / JSON**: Built-in utility to export table rows.
- ♿ **Accessible & Responsive**: Keyboard friendly and mobile responsive horizontal scrolling.

## Installation

```bash
npm install react-data-table
# or
yarn add react-data-table
# or
pnpm add react-data-table
```

## Quick Start

```tsx
import React from 'react';
import { DataTable, ColumnDef, BadgeCell } from 'react-data-table';
import 'react-data-table/dist/styles.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    width: 80,
    enableSorting: true,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ value }) => (
      <BadgeCell
        value={value}
        variant={value === 'active' ? 'success' : value === 'pending' ? 'warning' : 'neutral'}
      />
    ),
  },
];

const data: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'pending' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', status: 'inactive' },
];

export default function App() {
  return (
    <DataTable
      data={data}
      columns={columns}
      variant="modern"
      searchable
      paginate
      pageSize={10}
      enableExport
    />
  );
}
```

## Variants

Select a variant that fits your UI aesthetics:
- `default`: Clean, understated borders with standard padding.
- `bordered`: Grid borders for clear cell separation.
- `minimal`: Borderless, modern clean whitespace.
- `striped`: Alternating row background for large tables.
- `modern`: Elevated card styling with soft shadows and rounded corners.

```tsx
<DataTable data={data} columns={columns} variant="striped" />
```

## Built-in Cells

- `<TextCell />`: Text display with truncation, prefix, suffix, and subtitle.
- `<BadgeCell />`: Status badges with variants (`success`, `warning`, `error`, `info`, `neutral`).
- `<AvatarCell />`: User avatars with initials fallback and subtitle description.
- `<DateCell />`: Formatted date/time with locale and format options.

## Hooks

Customize your own table UI with internal hooks:
- `useDataTable`: Master hook managing all table features.
- `useTableSearch`: Real-time filtering.
- `useTableSort`: Column sorting logic.
- `useTablePagination`: Pagination state and slicing.
- `useColumnPinning`: Column pinning left/right.
- `useColumnReorder`: Reorder column order.

## License

MIT © Kheraj Suthar
