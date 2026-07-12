'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export type SortDirection = 'asc' | 'desc';

export type DataTableSort = {
  columnId: string;
  direction: SortDirection;
};

export type DataTableColumn<TRow> = {
  id: string;
  header: string;
  cell: (row: TRow) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
};

export type DataTableProps<TRow> = {
  columns: Array<DataTableColumn<TRow>>;
  rows: Array<TRow>;
  getRowId: (row: TRow) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort | undefined) => void;
  filters?: Record<string, string>;
  onFilterChange?: (columnId: string, value: string) => void;
  onRowClick?: (row: TRow) => void;
};

function toggleSortDirection(current?: DataTableSort, columnId?: string) {
  if (!columnId) {
    return undefined;
  }
  if (current?.columnId !== columnId) {
    return { columnId, direction: 'asc' as const };
  }
  if (current.direction === 'asc') {
    return { columnId, direction: 'desc' as const };
  }
  return undefined;
}

function SortIcon({ direction }: { direction?: SortDirection }) {
  if (direction === 'asc') {
    return <ArrowUp className="size-3.5" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className="size-3.5" />;
  }
  return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
}

function DataTableSortButton<TRow>({
  column,
  sort,
  onSortChange,
}: {
  column: DataTableColumn<TRow>;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort | undefined) => void;
}) {
  const activeDirection =
    sort?.columnId === column.id ? sort.direction : undefined;
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1 font-medium hover:text-foreground"
      onClick={() => onSortChange?.(toggleSortDirection(sort, column.id))}
    >
      {column.header}
      <SortIcon direction={activeDirection} />
    </button>
  );
}

function DataTableFilterRow<TRow>({
  columns,
  filters,
  onFilterChange,
}: {
  columns: Array<DataTableColumn<TRow>>;
  filters?: Record<string, string>;
  onFilterChange?: (columnId: string, value: string) => void;
}) {
  if (!onFilterChange || !columns.some((column) => column.filterable)) {
    return null;
  }
  return (
    <TableRow className="hover:bg-transparent">
      {columns.map((column) => (
        <TableHead key={column.id} className="py-1.5">
          {column.filterable && (
            <Input
              value={filters?.[column.id] ?? ''}
              placeholder={
                column.filterPlaceholder ?? `Filter ${column.header}`
              }
              onChange={(event) =>
                onFilterChange(column.id, event.target.value)
              }
              className="h-7"
            />
          )}
        </TableHead>
      ))}
    </TableRow>
  );
}

function DataTableSkeletonRows<TRow>({
  columns,
  rowCount = 5,
}: {
  columns: Array<DataTableColumn<TRow>>;
  rowCount?: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((column) => (
            <TableCell key={column.id}>
              <Skeleton className="h-4 w-full max-w-32" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function DataTableEmptyState({
  colSpan,
  title,
  description,
}: {
  colSpan: number;
  title: string;
  description?: string;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="p-0">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{title}</EmptyTitle>
            {description && <EmptyDescription>{description}</EmptyDescription>}
          </EmptyHeader>
        </Empty>
      </TableCell>
    </TableRow>
  );
}

export function DataTable<TRow>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  emptyTitle = 'No results',
  emptyDescription = 'There is nothing to show yet.',
  page,
  pageSize,
  total,
  onPageChange,
  sort,
  onSortChange,
  filters,
  onFilterChange,
  onRowClick,
}: DataTableProps<TRow>) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const hasRows = rows.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable ? (
                    <DataTableSortButton
                      column={column}
                      sort={sort}
                      onSortChange={onSortChange}
                    />
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
            <DataTableFilterRow
              columns={columns}
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeletonRows columns={columns} />
            ) : hasRows ? (
              rows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>{column.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <DataTableEmptyState
                colSpan={columns.length}
                title={emptyTitle}
                description={emptyDescription}
              />
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && hasRows && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </p>
          <Pagination className={cn('mx-0 w-auto justify-end')}>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(event) => {
                    event.preventDefault();
                    if (page > 1) {
                      onPageChange(page - 1);
                    }
                  }}
                  aria-disabled={page <= 1}
                  className={cn(page <= 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={(event) => {
                    event.preventDefault();
                    if (page < pageCount) {
                      onPageChange(page + 1);
                    }
                  }}
                  aria-disabled={page >= pageCount}
                  className={cn(
                    page >= pageCount && 'pointer-events-none opacity-50',
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
