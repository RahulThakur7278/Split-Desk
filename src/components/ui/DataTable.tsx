import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

type SortDirection = 'asc' | 'desc';

/**
 * Reusable DataTable with sorting, responsive overflow, and row click support.
 * Accessible table markup with proper scope and headers.
 */
function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null || bVal == null) return 0;
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className={clsx('overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700', className)}>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={clsx(
                  'px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap',
                  col.sortable && 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white',
                  col.className
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                      />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={clsx(
                  'bg-white dark:bg-slate-800 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50'
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3 text-slate-700 dark:text-slate-300', col.className)}>
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
