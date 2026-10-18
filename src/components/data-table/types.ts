import { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  accessor?: keyof T | ((row: T) => unknown);
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

export interface DataTableFilterOption {
  value: string;
  label: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  options: DataTableFilterOption[];
}

export interface DataTableEmptyConfig {
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string | number;
  mode?: "client" | "server";
  isLoading?: boolean;
  skeletonRows?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: DataTableFilter[];
  sort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (query: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onRowClick?: (row: T) => void;
  emptyState?: DataTableEmptyConfig;
  toolbar?: ReactNode;
  className?: string;
}
