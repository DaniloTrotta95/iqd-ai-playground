"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { rankItem } from '@tanstack/match-sorter-utils';
import MultipleSelector from "@/components/ui/multi-select"



interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onClientUpdated?: () => void;
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({ itemRank })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

export function DataTablePublishers<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<any>(
    []
  )
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    // @ts-ignore
    globalFilterFn: "fuzzy",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    // onColumnFiltersChange: setColumnF\ilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })



  return (
    <>
    <div className="flex items-end gap-4">

    <div className="flex justify-center gap-2 py-4 flex-col">
      <Label>Filter</Label>
        <Input
          placeholder="Suchen..."
          value={globalFilter ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="max-w-sm bg-white"
        />
      </div>
    </div>


    <div className="rounded-md border p-4 bg-white w-full">
      <Table >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </>
  )
}