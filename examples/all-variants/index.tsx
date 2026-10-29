import React, { useState } from 'react';
import {
  DataTable,
  DefaultTable,
  BorderedTable,
  MinimalTable,
  StripedTable,
  ModernTable,
  ColumnDef,
  TableVariant,
} from '../../src';

interface Customer {
  id: string;
  name: string;
  company: string;
  country: string;
  plan: 'Enterprise' | 'Pro' | 'Starter';
  spent: number;
}

const mockCustomers: Customer[] = [
  { id: 'CUST-101', name: 'Sophia Taylor', company: 'Apex Solutions', country: 'United States', plan: 'Enterprise', spent: 14200 },
  { id: 'CUST-102', name: 'Liam Davies', company: 'Nova Labs', country: 'United Kingdom', plan: 'Pro', spent: 6800 },
  { id: 'CUST-103', name: 'Emma Wilson', company: 'Global Logistics', country: 'Canada', plan: 'Enterprise', spent: 22400 },
  { id: 'CUST-104', name: 'Noah Müller', company: 'Bavaria Tech', country: 'Germany', plan: 'Starter', spent: 1200 },
  { id: 'CUST-105', name: 'Mia Tanaka', company: 'Sunrise Digital', country: 'Japan', plan: 'Pro', spent: 5400 },
];

export const AllVariantsExample: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<TableVariant>('modern');

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      title: 'Customer Name',
      enableSorting: true,
    },
    {
      key: 'company',
      title: 'Organization',
      enableSorting: true,
    },
    {
      key: 'country',
      title: 'Country',
    },
    {
      key: 'plan',
      title: 'Subscription Plan',
      type: 'badge',
      badge: (val) => ({
        variant: val === 'Enterprise' ? 'primary' : val === 'Pro' ? 'info' : 'neutral',
        dot: true,
      }),
    },
    {
      key: 'spent',
      title: 'Total Spent',
      align: 'right',
      enableSorting: true,
      render: (val) => `$${Number(val).toLocaleString()}`,
    },
  ];

  const variants: TableVariant[] = ['default', 'bordered', 'minimal', 'striped', 'modern'];

  return (
    <div style={{ padding: '16px', maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h2>All 5 Table Variants</h2>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        The exact same functionality, props, and operations exist across all 5 visual variants.
      </p>

      {/* Variant Selector Tabs */}
      <div className="variant-tabs choose-variant" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {variants.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setSelectedVariant(v)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: selectedVariant === v ? '#2563eb' : '#ffffff',
              color: selectedVariant === v ? '#ffffff' : '#334155',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Render Table with Selected Variant */}
      <DataTable
        title="Customer Directory"
        data={mockCustomers}
        columns={columns}
        variant={selectedVariant}
        searchable
        paginate
        pageSize={5}
        enableExport
        enablePrint
        actions={[
          {
            label: 'Generate Invoice',
            onPress: (row) => alert(`Generating invoice for ${row.name}`),
          },
          {
            label: 'View Analytics',
            onPress: (row) => alert(`Viewing analytics for ${row.company}`),
          },
        ]}
      />

      {/* Demonstrating direct component exports */}
      <div style={{ marginTop: 40 }}>
        <h3>Direct Variant Components</h3>
        <p style={{ color: '#64748b' }}>
          You can also import <code>DefaultTable</code>, <code>BorderedTable</code>, <code>MinimalTable</code>, <code>StripedTable</code>, or <code>ModernTable</code> directly.
        </p>

        <h4 style={{ marginTop: 20 }}>1. ModernTable</h4>
        <ModernTable data={mockCustomers.slice(0, 3)} columns={columns} />

        <h4 style={{ marginTop: 20 }}>2. BorderedTable</h4>
        <BorderedTable data={mockCustomers.slice(0, 3)} columns={columns} />

        <h4 style={{ marginTop: 20 }}>3. StripedTable</h4>
        <StripedTable data={mockCustomers.slice(0, 3)} columns={columns} />

        <h4 style={{ marginTop: 20 }}>4. MinimalTable</h4>
        <MinimalTable data={mockCustomers.slice(0, 3)} columns={columns} />

        <h4 style={{ marginTop: 20 }}>5. DefaultTable</h4>
        <DefaultTable data={mockCustomers.slice(0, 3)} columns={columns} />
      </div>
    </div>
  );
};

export default AllVariantsExample;
