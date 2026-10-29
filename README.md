# react-data-table

A production-ready, feature-rich, and lightweight React data table library with 5 distinct UI variants, column pinning, drag-and-drop column reordering, debounced search filtering (client & server-side), pagination, custom cell renderers (Text, Badge, Avatar, Date), and fully working PDF, Excel (`.xlsx`), CSV export, and printing.

[![npm version](https://img.shields.io/npm/v/react-data-table.svg)](https://www.npmjs.com/package/react-data-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🎨 **5 UI Variants**: `default`, `bordered`, `minimal`, `striped`, and `modern` (glassmorphism/elevated card) sharing the identical table logic.
- ⚙️ **Configurable Columns**:
  - `key` / `accessorKey`: Unique field key or nested path (`user.profile.name`).
  - `title` / `header`: Custom ReactNode or string label.
  - `value`: Custom value extractor function.
  - `description`: Secondary subtitle text displayed underneath the cell value.
  - `avatar`: URL string, JSX element, or avatar extractor with fallback initials.
  - `type`: Built-in automatic rendering for `'text' | 'badge' | 'avatar' | 'date' | 'number'`.
  - `badge`: Status colors (`success`, `warning`, `error`, `info`, `neutral`, `primary`), custom hex colors, and dot indicators.
  - `copy`: One-click copy-to-clipboard button with visual feedback.
  - `render` / `cell`: Custom render function.
- 🔢 **Built-in Columns**:
  - Continuous **Serial Number (`#`)** column pinned to the left by default.
  - Floating **Row Selection** checkbox column with indeterminate "Select All" support.
  - Configurable **Three-Dot Action & Context Menu**:
    - Pinned to the right by default with large comfortable click hit area.
    - **Right-Click Context Menu**: Right-clicking any row opens the menu at cursor position with Windows OS-style smart collision detection (opens down if space exists, flips upwards if bottom is constrained).
    - **Portal-Rendered**: Zero table scrollbars when opening menus, free from `overflow` clipping.
    - **No Text Wrapping**: Dropdown items stay cleanly on single lines (`white-space: nowrap`).
    - **Action Icons**: Built-in SVG icons (`icon: 'view' | 'edit' | 'delete' | 'copy' | 'download' | 'share' | 'print'`) or custom JSX icons.
  - Built-in columns remain fixed and separate from draggable data columns.
- 🔍 **Debounced Search**:
  - Client-side real-time filtering across all visible fields by default.
  - Server/API search via `onSearch` callback with automatic debounce and prevention of double-filtering.
- 📌 **Column Management**:
  - Drag-and-drop column reordering.
  - Column Pinning: `pinned: true` / `'left'` for initially pinned, `pinned: false` to disable pinning, omitted to allow user-controlled toggle.
  - Column visibility menu to show/hide columns.
- 📄 **Data Operations**:
  - Multi-type column sorting (numbers, dates, strings, nulls last).
  - Pagination with customizable page sizes (`5`, `10`, `20`, `50`, `100`).
  - Loading spinner, customizable empty states, and error retry views.
- 📥 **Real Export & Printing**:
  - Real Excel (`.xlsx`) generation via SheetJS.
  - Real PDF generation via `jsPDF` and `jspdf-autotable`.
  - CSV and JSON downloads.
  - Clean `@media print` layout hiding buttons/pagination for clean paper reports.
- 📱 **Responsive Layouts**:
  - Supports `layout="table"`, `"compact"`, `"card"`, and `"auto"` (responsive card view on mobile).

---

## 📦 Installation

```bash
npm install react-data-table
# or
yarn add react-data-table
# or
pnpm add react-data-table
```

### Peer Dependencies
Ensure you have React 18 or 19 installed:
```bash
npm install react react-dom
```

---

## 🚀 Quick Start

Import the component and stylesheet:

```tsx
import React from 'react';
import { DataTable, type ColumnDef } from 'react-data-table';
import 'react-data-table/styles.css';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt: string;
}

const columns: ColumnDef<User>[] = [
  {
    key: 'name',
    title: 'User',
    type: 'avatar',
    avatar: (row) => row.avatar,
    value: (row) => row.name,
    description: (row) => row.email,
    pinned: true, // Initially pinned
  },
  {
    key: 'role',
    title: 'Role',
    enableSorting: true,
  },
  {
    key: 'status',
    title: 'Status',
    type: 'badge',
    badge: (val) => ({
      variant: val === 'Active' ? 'success' : val === 'Pending' ? 'warning' : 'neutral',
      dot: true,
    }),
  },
  {
    key: 'createdAt',
    title: 'Joined Date',
    type: 'date',
    enableSorting: true,
  },
];

const users: User[] = [
  {
    id: 1,
    name: 'Sarah Connor',
    email: 'sarah@sky.net',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    role: 'Security Specialist',
    status: 'Active',
    createdAt: '2023-04-15',
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@sky.net',
    avatar: '',
    role: 'DevOps Engineer',
    status: 'Pending',
    createdAt: '2023-08-20',
  },
];

export default function App() {
  return (
    <DataTable
      data={users}
      columns={columns}
      variant="modern"
      searchable
      paginate
      pageSize={10}
      enableRowSelection
      enableColumnReorder
      enableColumnPinning
      enableExport
      enablePrint
      actions={[
        {
          label: 'View Profile',
          icon: 'view',
          onPress: (row) => console.log('Viewing', row.name),
        },
        {
          label: 'Edit User',
          icon: 'edit',
          onPress: (row) => console.log('Editing', row.name),
        },
        {
          label: 'Delete User',
          icon: 'delete',
          color: 'danger',
          onPress: (row) => console.log('Deleting', row.name),
        },
      ]}
    />
  );
}
```

---

## 🎨 Table Variants

Switch variants using the `variant` prop or dedicated component exports:

```tsx
// Via prop
<DataTable data={data} columns={columns} variant="modern" />

// Or via dedicated variant components:
import { ModernTable, BorderedTable, StripedTable, MinimalTable, DefaultTable } from 'react-data-table';

<ModernTable data={data} columns={columns} />
<BorderedTable data={data} columns={columns} />
<StripedTable data={data} columns={columns} />
<MinimalTable data={data} columns={columns} />
<DefaultTable data={data} columns={columns} />
```

| Variant | Description |
|---|---|
| `default` | Standard clean borders with soft background hover. |
| `bordered` | Full grid lines separating every row and column cell. |
| `minimal` | Clean whitespace design without outer card borders. |
| `striped` | Alternating zebra-striped rows for high data density readability. |
| `modern` | Elevated glassmorphism/card with subtle box shadow and rounded corners. |

---

## 🧩 Built-in Cell Types

Configure the `type` property in any `ColumnDef`:

- **Text (`type: 'text'`)**: Standard text with optional subtitle (`description`) and clipboard copy (`copy: true`).
- **Avatar (`type: 'avatar'`)**: Image URL with fallback initials, primary title, and secondary description.
- **Badge (`type: 'badge'`)**: Status pill badge with `variant` (`success`, `warning`, `error`, `info`, `neutral`, `primary`), custom `color`, and status `dot`.
- **Date (`type: 'date'`)**: Localized date formatting, `datetime`, `time`, or relative times ("2 days ago").
- **Number (`type: 'number'`)**: Locale-formatted numeric display with right-alignment.

---

## 🔍 Server-side Search & Pagination

Connect directly to your backend API:

```tsx
<DataTable
  data={serverRows}
  columns={columns}
  searchable
  onSearch={async (query) => {
    // Automatically debounced. Client-side filtering is bypassed.
    const res = await fetchUsers({ query });
    setServerRows(res.data);
  }}
  paginate
  pageIndex={page}
  totalRows={totalCount}
  onPageChange={(nextPage) => setPage(nextPage)}
  loading={isLoading}
/>
```

---

## 📥 Exporting & Printing

Export options are available in the table toolbar by default:
- **CSV (.csv)**: RFC 4180-compliant CSV containing the entire table dataset (all rows across all pages) with UTF-8 BOM (`\uFEFF`) for 100% compatibility in Microsoft Excel, Google Sheets, and LibreOffice.
- **Excel (.xlsx)**: Binary spreadsheet workbook.
- **PDF (.pdf)**: Landscape formatted document with header titles and timestamps.
- **Print**: Isolated print layout formatted with `@media print`.

### Export Customization

```tsx
// 1. Direct single-click CSV button in toolbar:
<DataTable data={data} columns={columns} exportFormats={['csv']} />

// 2. Custom filename & export callback:
<DataTable
  data={data}
  columns={columns}
  enableExport={true}
  exportFileName="all-users"
  onExportCSV={(rows) => console.log('Exported full table rows:', rows.length)}
/>

// 3. Programmatic export:
import { exportToCSV, exportToXLSX, exportToPDF, generateCSVContent, printTable } from 'react-data-table';

// Trigger download for entire table data
exportToCSV(data, columns, 'all-users.csv');
exportToXLSX(data, columns, 'all-users.xlsx');
exportToPDF(data, columns, 'all-users.pdf', 'Executive Report');
printTable('Company Directory');

// Or get the raw CSV string:
const csvText = generateCSVContent(data, columns);
```

---

## 🪝 Custom Hooks

Build your own customized table interface using the exported hooks:
- `useDataTable(props)`: The complete orchestrator managing all table features.
- `useTableSearch({ data, columns, onSearch })`: Debounced search filtering.
- `useTableSort({ data, columns, initialSort })`: Multi-type sorting.
- `useTablePagination({ data, initialPageSize })`: Pagination logic and page slicing.
- `useColumnPinning({ columns })`: Left/right pinning and offsets.
- `useColumnReorder({ columns })`: Drag-and-drop column ordering and visibility.

---

## 📄 License

MIT © [Kheraj Suthar](https://github.com/kheraj-suthar)
