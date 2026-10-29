import React, { useState } from 'react';
import { DataTable, ColumnDef } from '../../src';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  apiKey: string;
  joinedAt: string;
  salary: number;
}

const mockTeam: TeamMember[] = [
  {
    id: 'MEM-01',
    name: 'Sarah Connor',
    email: 'sarah.connor@sky.net',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: 'Principal Security Engineer',
    department: 'Cybersecurity',
    status: 'Active',
    apiKey: 'sk_live_9f8302bf784a',
    joinedAt: '2023-04-15',
    salary: 165000,
  },
  {
    id: 'MEM-02',
    name: 'John Doe',
    email: 'john.doe@sky.net',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    role: 'Staff DevOps Architect',
    department: 'Infrastructure',
    status: 'Active',
    apiKey: 'sk_live_12ab45cd89ef',
    joinedAt: '2022-11-01',
    salary: 180000,
  },
  {
    id: 'MEM-03',
    name: 'Elena Rostova',
    email: 'elena.rostova@sky.net',
    avatar: '',
    role: 'Lead AI Researcher',
    department: 'Machine Learning',
    status: 'On Leave',
    apiKey: 'sk_live_33ee44ff55aa',
    joinedAt: '2024-01-10',
    salary: 195000,
  },
  {
    id: 'MEM-04',
    name: 'Marcus Aurelius',
    email: 'marcus@sky.net',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    role: 'Product Operations Director',
    department: 'Product',
    status: 'Active',
    apiKey: 'sk_live_77bb88cc99dd',
    joinedAt: '2021-08-20',
    salary: 172000,
  },
  {
    id: 'MEM-05',
    name: 'Aiko Sato',
    email: 'aiko.sato@sky.net',
    avatar: '',
    role: 'Senior UI/UX Designer',
    department: 'Design',
    status: 'Terminated',
    apiKey: 'sk_live_66ee77ff88aa',
    joinedAt: '2022-03-12',
    salary: 135000,
  },
];

export const CustomCellsExample: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const columns: ColumnDef<TeamMember>[] = [
    {
      key: 'name',
      title: 'Team Member',
      type: 'avatar',
      avatar: (row) => row.avatar,
      value: (row) => row.name,
      description: (row) => row.email,
      pinned: true, // Initially pinned to left
      minWidth: 240,
    },
    {
      key: 'role',
      title: 'Designation & Dept',
      description: (row) => row.department,
      minWidth: 200,
    },
    {
      key: 'status',
      title: 'Work Status',
      type: 'badge',
      badge: (val) => ({
        variant: val === 'Active' ? 'success' : val === 'On Leave' ? 'warning' : 'error',
        dot: true,
      }),
      width: 140,
    },
    {
      key: 'apiKey',
      title: 'Live API Key',
      copy: true, // Copy button
      width: 180,
    },
    {
      key: 'joinedAt',
      title: 'Join Date',
      type: 'date',
      width: 140,
      enableSorting: true,
    },
    {
      key: 'salary',
      title: 'Annual Compensation',
      type: 'number',
      align: 'right',
      render: (val) => `$${Number(val).toLocaleString()}`,
      enableSorting: true,
      width: 180,
    },
  ];

  return (
    <div style={{ padding: '16px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h2>Custom Cells, Column Pinning, and Selection</h2>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        Featuring AvatarCell with fallback initials, BadgeCell with indicators, DateCell formatting, copy-to-clipboard, sticky column pinning, and row selection.
      </p>

      {selectedIds.length > 0 && (
        <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: 6, marginBottom: 16, color: '#1d4ed8', fontSize: 14 }}>
          {selectedIds.length} team member(s) selected
        </div>
      )}

      <DataTable
        data={mockTeam}
        columns={columns}
        variant="modern"
        enableRowSelection
        selectedRowKeys={selectedIds}
        onSelectionChange={(keys) => setSelectedIds(keys)}
        enableColumnPinning
        enableColumnReorder
        enableExport
        enablePrint
        exportFileName="sky-net-team"
        actions={[
          {
            label: 'Copy Profile Link',
            onPress: (row) => navigator.clipboard?.writeText(`https://sky.net/team/${row.id}`),
          },
          {
            label: 'Revoke API Key',
            color: 'warning',
            onPress: (row) => alert(`Revoking API key for ${row.name}`),
          },
          {
            label: 'Remove Member',
            color: 'danger',
            onPress: (row) => alert(`Removing ${row.name}`),
          },
        ]}
      />
    </div>
  );
};

export default CustomCellsExample;
