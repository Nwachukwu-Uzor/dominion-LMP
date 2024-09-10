import { useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  //   getPaginationRowModel,
  getSortedRowModel,
  FilterFn,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";

import { DebouncedInput } from "./debounced-input";

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
  isSearchable?: boolean;
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

export function NonPaginatedTable<T>({
  data,
  columns,
  isSearchable = true,
}: Props<T>): JSX.Element {
  const [globalFilter, setGlobalFilter] = useState("");
  const { getHeaderGroups, getRowModel } = useReactTable({
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
    // getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <div className="grid grid-cols-1 py-3">
      {isSearchable ? (
        <div className="mb-2.5 px-2">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search..."
          />
        </div>
      ) : null}
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
                      className="px-2 py-3 text-left text-sm first:pl-3 last:pr-3 last:text-right"
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
                            header.getContext(),
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
                        className={`px-2 py-3 text-left text-sm first:pl-3 last:pr-3 last:text-right`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
    </div>
  );
}
