import { useState, useEffect, useMemo, useRef } from 'react';
import type { ColumnDef } from '../types/column.types';
import { filterRows } from '../utils/filterRows';

export interface UseTableSearchOptions<TData = any> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialQuery?: string;
  debounceMs?: number;
  onSearch?: (query: string) => void | Promise<void>;
  onSearchChange?: (query: string) => void;
  onResetPagination?: () => void;
}

export interface UseTableSearchReturn<TData = any> {
  query: string;
  debouncedQuery: string;
  setQuery: (newQuery: string) => void;
  filteredData: TData[];
  isSearching: boolean;
}

export function useTableSearch<TData = any>({
  data,
  columns,
  initialQuery = '',
  debounceMs = 300,
  onSearch,
  onSearchChange,
  onResetPagination,
}: UseTableSearchOptions<TData>): UseTableSearchReturn<TData> {
  const [query, setQuery] = useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const isFirstRender = useRef(true);

  // Sync initial query if controlled
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  // Trigger search actions on debouncedQuery update
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    onSearchChange?.(debouncedQuery);
    onResetPagination?.();

    if (onSearch) {
      const result = onSearch(debouncedQuery);
      if (result && typeof (result as Promise<void>).then === 'function') {
        setIsSearching(true);
        (result as Promise<void>).finally(() => {
          setIsSearching(false);
        });
      }
    }
  }, [debouncedQuery, onSearch, onSearchChange, onResetPagination]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
  };

  const filteredData = useMemo(() => {
    // If onSearch is provided, do NOT double-filter server results
    if (onSearch) {
      return data;
    }
    return filterRows(data, columns, debouncedQuery);
  }, [data, columns, debouncedQuery, onSearch]);

  return {
    query,
    debouncedQuery,
    setQuery: handleQueryChange,
    filteredData,
    isSearching,
  };
}
