import { useState, useMemo, useCallback, useEffect } from "react";
import { DataTableColumn, SortState } from "./types";
import { useDebounce } from "@/hooks/useDebounce";

export interface UseDataTableStateProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  mode?: "client" | "server";
  pageSizeDefault?: number;
  searchKeys?: (keyof T)[];
  initialSort?: SortState | null;
  onSortChangeExternal?: (sort: SortState | null) => void;
  onPageChangeExternal?: (page: number) => void;
  onPageSizeChangeExternal?: (pageSize: number) => void;
  onSearchChangeExternal?: (query: string) => void;
  onFilterChangeExternal?: (key: string, value: string) => void;
  onResetFiltersExternal?: () => void;
  initialSearchQuery?: string;
  initialFilterValues?: Record<string, string>;
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

const EMPTY_RECORD: Record<string, string> = {};

export function useDataTableState<T>({
  data,
  columns,
  mode = "client",
  pageSizeDefault = 10,
  searchKeys,
  initialSort = null,
  onSortChangeExternal,
  onPageChangeExternal,
  onPageSizeChangeExternal,
  onSearchChangeExternal,
  onFilterChangeExternal,
  onResetFiltersExternal,
  initialSearchQuery,
  initialFilterValues,
}: UseDataTableStateProps<T>) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    initialFilterValues || EMPTY_RECORD
  );

  const filterValuesJson = initialFilterValues ? JSON.stringify(initialFilterValues) : "";
  useEffect(() => {
    if (initialFilterValues) {
      setFilterValues((prev) => {
        if (JSON.stringify(prev) === filterValuesJson) return prev;
        return initialFilterValues;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValuesJson]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery((prev) => (prev === initialSearchQuery ? prev : initialSearchQuery));
    }
  }, [initialSearchQuery]);
  const [sortState, setSortState] = useState<SortState | null>(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeDefault);

  const handleSort = useCallback(
    (key: string) => {
      let nextSort: SortState | null = null;
      if (!sortState || sortState.key !== key) {
        nextSort = { key, direction: "asc" };
      } else if (sortState.direction === "asc") {
        nextSort = { key, direction: "desc" };
      } else {
        nextSort = null;
      }

      setSortState(nextSort);
      onSortChangeExternal?.(nextSort);
    },
    [sortState, onSortChangeExternal]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPage(1);
      onSearchChangeExternal?.(query);
    },
    [onSearchChangeExternal]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => {
        const next = { ...prev };
        if (value === "") {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
      setPage(1);
      onFilterChangeExternal?.(key, value);
    },
    [onFilterChangeExternal]
  );

  const resetFilters = useCallback(() => {
    Object.keys(filterValues).forEach((key) => {
      onFilterChangeExternal?.(key, "");
    });
    setSearchQuery("");
    setFilterValues({});
    setPage(1);
    onSearchChangeExternal?.("");
    onResetFiltersExternal?.();
  }, [filterValues, onFilterChangeExternal, onSearchChangeExternal, onResetFiltersExternal]);

  const isFiltered = useMemo(() => {
    return searchQuery.trim().length > 0 || Object.keys(filterValues).length > 0;
  }, [searchQuery, filterValues]);

  const processedData = useMemo(() => {
    if (mode === "server") {
      return data;
    }

    let result = [...data];

    const activeFilterEntries = Object.entries(filterValues);
    if (activeFilterEntries.length > 0) {
      result = result.filter((row) =>
        activeFilterEntries.every(([key, filterVal]) => {
          const val = (row as Record<string, unknown>)[key];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase() === filterVal.toLowerCase();
        })
      );
    }

    if (debouncedSearch.trim()) {
      const normalizedQuery = removeVietnameseTones(debouncedSearch.trim());
      result = result.filter((row) => {
        if (searchKeys && searchKeys.length > 0) {
          return searchKeys.some((k) => {
            const val = row[k];
            if (val === null || val === undefined) return false;
            return removeVietnameseTones(String(val)).includes(normalizedQuery);
          });
        }
        return columns.some((col) => {
          if (!col.accessor) return false;
          const val =
            typeof col.accessor === "function"
              ? col.accessor(row)
              : row[col.accessor];
          if (val === null || val === undefined) return false;
          return removeVietnameseTones(String(val)).includes(normalizedQuery);
        });
      });
    }

    if (sortState) {
      const activeCol = columns.find((c) => c.key === sortState.key);
      result.sort((a, b) => {
        if (activeCol?.sortFn) {
          const res = activeCol.sortFn(a, b);
          return sortState.direction === "asc" ? res : -res;
        }

        const aVal = activeCol?.accessor
          ? typeof activeCol.accessor === "function"
            ? activeCol.accessor(a)
            : a[activeCol.accessor]
          : (a as Record<string, unknown>)[sortState.key];

        const bVal = activeCol?.accessor
          ? typeof activeCol.accessor === "function"
            ? activeCol.accessor(b)
            : b[activeCol.accessor]
          : (b as Record<string, unknown>)[sortState.key];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortState.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        const strA = String(aVal);
        const strB = String(bVal);
        const comp = strA.localeCompare(strB, "vi", { numeric: true, sensitivity: "base" });
        return sortState.direction === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [data, columns, mode, filterValues, debouncedSearch, searchKeys, sortState]);

  const totalItems = mode === "client" ? processedData.length : data.length;
  const pageCount = Math.ceil(totalItems / pageSize) || 1;

  const paginatedData = useMemo(() => {
    if (mode === "server") return processedData;
    const startIndex = (page - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, mode, page, pageSize]);

  const handlePageChange = useCallback(
    (p: number) => {
      setPage(p);
      onPageChangeExternal?.(p);
    },
    [onPageChangeExternal]
  );

  const handlePageSizeChange = useCallback(
    (ps: number) => {
      setPageSize(ps);
      setPage(1);
      onPageSizeChangeExternal?.(ps);
    },
    [onPageSizeChangeExternal]
  );

  return {
    searchQuery,
    filterValues,
    sortState,
    page,
    pageSize,
    pageCount,
    totalItems,
    paginatedData,
    isFiltered,
    handleSort,
    handleSearchChange,
    handleFilterChange,
    resetFilters,
    handlePageChange,
    handlePageSizeChange,
  };
}
