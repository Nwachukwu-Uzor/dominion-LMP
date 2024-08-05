import { useState } from "react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectGroup,
} from "../../ui/select";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  FilterFn,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";

import { DebouncedInput } from "./debounced-input";
import { Pagination } from "../pagination";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface Props<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
}

/* eslint-disable */
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};
/* eslint-enable */

export function DataTable<T>({ data, columns }: Props<T>): JSX.Element {
  const [globalFilter, setGlobalFilter] = useState("");
  const {
    getHeaderGroups,
    getRowModel,
    setPageIndex,
    getCanNextPage,
    getCanPreviousPage,
    previousPage,
    nextPage,
    getState,
    getPageCount,
    setPageSize,
  } = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeValue = (() => {
        const value = row.getValue(columnId);
        return typeof value === "number" ? String(value) : value;
      })() as string;

      return safeValue?.toLowerCase().includes(filterValue.toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <div className="py-3 grid grid-cols-1">
      <div className="px-2 mb-2.5">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search..."
        />
      </div>
      <div className="overflow-auto">
        <table className="table w-full whitespace-nowrap">
          <thead className="bg-[#6D6C6C] text-white">
            {getHeaderGroups().map((headerGroup, idx) => (
              <tr key={headerGroup.id + idx}>
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <th
                      key={header.id + idx}
                      colSpan={header.colSpan}
                      className="text-left last:text-right px-2 py-3 first:pl-3 last:pr-3"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none font-medium"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {getRowModel().rows.map((row, idx) => {
              return (
                <tr key={row.id + idx} className="even:bg-[#F2F2F2]">
                  {row.getVisibleCells().map((cell, idx) => {
                    return (
                      <td
                        key={cell.id + idx}
                        className={`text-left last:text-right px-2 py-3 first:pl-3 last:pr-3`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-4 px-2">
        <div className="flex justify-between md:justify-start gap-1 w-full">
          <button
            className="border rounded p-1"
            onClick={() => previousPage()}
            disabled={!getCanPreviousPage()}
          >
            {"<"}
          </button>
          <Pagination
            totalPages={getPageCount()}
            currentPage={getState().pagination.pageIndex + 1}
            handlePageClick={(page: number) => setPageIndex(page - 1)}
          />
          <button
            className="border rounded p-1"
            onClick={() => nextPage()}
            disabled={!getCanNextPage()}
          >
            {">"}
          </button>
        </div>
        <div className="max-w-[100px] w-full">
          <Select
            value={getState().pagination.pageSize.toString()}
            onValueChange={async (value) => {
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Account</SelectLabel>
                {[5, 10, 20, 30, 40, 50].map((num) => (
                  <SelectItem value={num.toString()} key={num}>
                    {num}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export { NonPaginatedTable } from "./non-paginated-table";
