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
import { Topic } from "@/db/types"



interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  topics: Topic[]
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

export function DataTable<TData, TValue>({
  columns,
  data,
  topics,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<any>(
    []
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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
      columnFilters
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
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
      <div className="flex gap-2 flex-1 w-full">

      <div className="flex justify-center gap-2 py-4 flex-col w-full">
      <Label>Medium</Label>

      <MultipleSelector
        className="w-full bg-white"
        defaultOptions={[
          { label: 'Display', value: 'display' },
          { label: 'Newsletter', value: 'newsletter' },
          { label: 'Podcast', value: 'podcast' }]}
        placeholder="Medium auswählen..."
        hideClearAllButton={true}
        onChange={(event) => {
            table.setColumnFilters([ ...columnFilters, {
              id: 'clientType',
              value: event.map((item: any) => item.value)
            }])
          }}
          
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            Keine Medien gefunden.
          </p>
        }
      />
    </div>
      <div className="flex justify-center gap-2 py-4 flex-col w-full">
      <Label>Thema</Label>

      <MultipleSelector
        className="w-full bg-white"
        defaultOptions={topics.map(topic => ({ label: topic.label, value: topic.name }))}
        placeholder="Thema auswählen..."
        hideClearAllButton={true}
        onChange={(event) => {
          table.setColumnFilters([ ...columnFilters, {
            id: 'topic',
            value: event.map((item: any) => item.value)
          }])
        }}
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            Keine Themen gefunden.
          </p>
        }
      />
    </div>
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