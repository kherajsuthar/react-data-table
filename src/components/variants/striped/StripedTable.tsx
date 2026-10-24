import type { ReactNode } from 'react';
import { DataTable } from '../../DataTable/DataTable';
import type { DataTableProps } from '../../../types/table.types';
import './styles.css';

export const StripedTable = <TData extends Record<string, any>>(
  props: Omit<DataTableProps<TData>, 'variant'>
): ReactNode => {
  return <DataTable {...props} variant="striped" />;
};
