import React, { useState } from 'react';
import { DataTable, ColumnDef } from '../../src';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const mockProducts: Product[] = [
  { id: 1, name: 'Wireless Noise-Canceling Headphones', category: 'Audio', price: 199.99, stock: 45, status: 'In Stock' },
  { id: 2, name: 'Ultra-Slim Mechanical Keyboard', category: 'Accessories', price: 129.5, stock: 8, status: 'Low Stock' },
  { id: 3, name: '4K IPS Gaming Monitor 27"', category: 'Displays', price: 349.0, stock: 0, status: 'Out of Stock' },
  { id: 4, name: 'Ergonomic Vertical Mouse', category: 'Accessories', price: 59.99, stock: 32, status: 'In Stock' },
  { id: 5, name: 'Smart Fitness Tracker Watch', category: 'Wearables', price: 89.95, stock: 12, status: 'In Stock' },
  { id: 6, name: 'USB-C Multiport Hub Adapter', category: 'Accessories', price: 39.99, stock: 4, status: 'Low Stock' },
  { id: 7, name: 'High-Fidelity Bluetooth Speaker', category: 'Audio', price: 119.0, stock: 20, status: 'In Stock' },
];

export const BasicExample: React.FC = () => {
  const [products] = useState<Product[]>(mockProducts);

  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      title: 'Product Name',
      enableSorting: true,
      copy: true,
    },
    {
      key: 'category',
      title: 'Category',
      enableSorting: true,
    },
    {
      key: 'price',
      title: 'Price',
      type: 'number',
      enableSorting: true,
      render: (val) => `$${Number(val).toFixed(2)}`,
    },
    {
      key: 'stock',
      title: 'Stock Units',
      type: 'number',
      align: 'right',
      enableSorting: true,
    },
    {
      key: 'status',
      title: 'Inventory Status',
      type: 'badge',
      badge: (val) => ({
        variant: val === 'In Stock' ? 'success' : val === 'Low Stock' ? 'warning' : 'error',
        dot: true,
      }),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>Basic DataTable Example</h2>
      <p style={{ color: '#64748b', marginBottom: 16 }}>
        Demonstrates basic usage with search filtering, multi-column sorting, pagination, and copyable cells.
      </p>

      <DataTable
        data={products}
        columns={columns}
        variant="default"
        searchable
        paginate
        pageSize={5}
        enableExport
        enablePrint
        actions={[
          {
            label: 'View Details',
            icon: 'view',
            onPress: (row) => alert(`Viewing ${row.name}`),
          },
          {
            label: 'Edit Product',
            icon: 'edit',
            onPress: (row) => alert(`Editing ${row.name}`),
          },
          {
            label: 'Copy Name',
            icon: 'copy',
            onPress: (row) => alert(`Copied ${row.name}`),
          },
          {
            label: 'Delete Product',
            icon: 'delete',
            color: 'danger',
            onPress: (row) => alert(`Deleting ${row.name}`),
          },
        ]}
      />
    </div>
  );
};

export default BasicExample;
