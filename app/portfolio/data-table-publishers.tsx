"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
import { PublisherWithClients, Client } from "@/db/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MoreHorizontal } from "lucide-react"

interface DataTableProps {
  columns: ColumnDef<PublisherWithClients, any>[]
  data: PublisherWithClients[]
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

export function DataTablePublishers({
  columns,
  data,
}: DataTableProps) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<any>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    // @ts-ignore
    globalFilterFn: "fuzzy",
    getRowCanExpand: (row) => row.original.clients.length > 0,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    // onColumnFiltersChange: setColumnF\ilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      expanded,
    },
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
  })

  console.log('data', data)

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
              <>
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
                {row.getIsExpanded() && row.original.clients.map((client: Client) => (
                  <TableRow key={`${row.id}-client-${client.id}`} className="bg-gray-50/50 ">
                    <TableCell colSpan={3}>
                      <div className="flex items-center gap-6 pl-12">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <Badge variant="secondary" className="font-medium">
                            {client.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Badge variant="outline">{client.clientType}</Badge>
                        </div>
                        <div className="flex items-center gap-2 min-w-[200px]">
                          {client.agmaEntityId && (
                            <span className="text-sm font-mono text-gray-700">
                              {client.agmaEntityId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                          {client.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(client.url!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
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