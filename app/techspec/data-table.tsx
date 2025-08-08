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
import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { rankItem } from '@tanstack/match-sorter-utils';
import MultipleSelector from "@/components/ui/multi-select"
import { Topic } from "@/db/types"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select"
import { ChevronDown, ChevronUp, Filter, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getTechSpecsFiltered } from "@/actions/techspec.actions"
import { useRouter, useSearchParams } from "next/navigation"

interface FilterState {
  name: string
  gattung: string[]
  kategorie: string[]
  format: string[]
  widthMin: string
  widthMax: string
  heightMin: string
  heightMax: string
  weightMin: string
  weightMax: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  topics?: Topic[]
  onTechSpecUpdated?: () => void;
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

export function DataTable<TData, TValue>({
  columns,
  data,
  topics = [],
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rows, setRows] = useState<any[]>(data)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const table = useReactTable({
    data: rows,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, columnFilters },
    onColumnFiltersChange: setColumnFilters,
  })

  const [filters, setFilters] = useState<FilterState>({
    name: '',
    gattung: [],
    kategorie: [],
    format: [],
    widthMin: '',
    widthMax: '',
    heightMin: '',
    heightMax: '',
    weightMin: '',
    weightMax: ''
  })

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      name: '',
      gattung: [],
      kategorie: [],
      format: [],
      widthMin: '',
      widthMax: '',
      heightMin: '',
      heightMax: '',
      weightMin: '',
      weightMax: ''
    })
  }

  const removeFilter = (key: keyof FilterState) => {
    if (key === 'gattung' || key === 'kategorie' || key === 'format') {
      updateFilter(key, [])
    } else if (key.includes('Min') || key.includes('Max')) {
      const baseKey = key.replace('Min', '').replace('Max', '')
      updateFilter(`${baseKey}Min` as keyof FilterState, '')
      updateFilter(`${baseKey}Max` as keyof FilterState, '')
    } else {
      updateFilter(key, '')
    }
  }

  // Initialize filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString())
    const parseArray = (v: string | null) => v ? v.split(',').filter(Boolean) : []
    setFilters(prev => ({
      ...prev,
      name: params.get('name') ?? '',
      gattung: parseArray(params.get('gattung')),
      kategorie: parseArray(params.get('kategorie')),
      format: parseArray(params.get('format')),
      widthMin: params.get('widthMin') ?? '',
      widthMax: params.get('widthMax') ?? '',
      heightMin: params.get('heightMin') ?? '',
      heightMax: params.get('heightMax') ?? '',
      weightMin: params.get('weightMin') ?? '',
      weightMax: params.get('weightMax') ?? '',
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync URL with filters and fetch server-side
  const fetchWithFilters = async (current: FilterState) => {
    const payload = {
      name: current.name || undefined,
      gattung: current.gattung.length ? current.gattung as any : undefined,
      kategorie: current.kategorie.length ? current.kategorie as any : undefined,
      format: current.format.length ? current.format as any : undefined,
      widthMin: current.widthMin ? Number(current.widthMin) : undefined,
      widthMax: current.widthMax ? Number(current.widthMax) : undefined,
      heightMin: current.heightMin ? Number(current.heightMin) : undefined,
      heightMax: current.heightMax ? Number(current.heightMax) : undefined,
      weightMin: current.weightMin ? Number(current.weightMin) : undefined,
      weightMax: current.weightMax ? Number(current.weightMax) : undefined,
    }
    const result = await getTechSpecsFiltered(payload as any)
    if (result.success && result.data) setRows(result.data as any[])
    else setRows([])
  }

  // Debounce for name filter to reduce server calls
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Update URL
    const params = new URLSearchParams()
    if (filters.name) params.set('name', filters.name)
    if (filters.gattung.length) params.set('gattung', filters.gattung.join(','))
    if (filters.kategorie.length) params.set('kategorie', filters.kategorie.join(','))
    if (filters.format.length) params.set('format', filters.format.join(','))
    if (filters.widthMin) params.set('widthMin', filters.widthMin)
    if (filters.widthMax) params.set('widthMax', filters.widthMax)
    if (filters.heightMin) params.set('heightMin', filters.heightMin)
    if (filters.heightMax) params.set('heightMax', filters.heightMax)
    if (filters.weightMin) params.set('weightMin', filters.weightMin)
    if (filters.weightMax) params.set('weightMax', filters.weightMax)
    const query = params.toString()
    router.replace(query ? `?${query}` : '?')

    // Fetch filtered data (debounce when typing name)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const delay = filters.name ? 300 : 0
    debounceRef.current = setTimeout(() => fetchWithFilters(filters), delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => { fetchWithFilters(filters) }, [data])

  const activeFilters = useMemo(() => {
    const active: { key: keyof FilterState, label: string }[] = []
    if (filters.name) active.push({ key: 'name', label: `Name: "${filters.name}"` })
    if (filters.gattung.length) active.push({ key: 'gattung', label: `Gattung: ${filters.gattung.join(', ')}` })
    if (filters.kategorie.length) active.push({ key: 'kategorie', label: `Kategorie: ${filters.kategorie.join(', ')}` })
    if (filters.format.length) active.push({ key: 'format', label: `Format: ${filters.format.join(', ')}` })
    if (filters.widthMin || filters.widthMax) active.push({ key: 'widthMin', label: `Breite: ${filters.widthMin || '0'}-${filters.widthMax || '∞'} px` })
    if (filters.heightMin || filters.heightMax) active.push({ key: 'heightMin', label: `Länge: ${filters.heightMin || '0'}-${filters.heightMax || '∞'} px` })
    if (filters.weightMin || filters.weightMax) active.push({ key: 'weightMin', label: `Gewicht: ${filters.weightMin || '0'}-${filters.weightMax || '∞'} KB` })
    return active
  }, [filters])

  const gattungOptions = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'stationary', label: 'Stationary' },
    { value: 'video', label: 'Video' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'audio', label: 'Audio' },
    { value: 'web', label: 'Web' },
    { value: 'app', label: 'App' },
  ]

  const kategorieOptions = [
    { value: 'banner', label: 'Banner' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'interactive', label: 'Interactive' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'social', label: 'Social' },
    { value: 'display', label: 'Display' },
    { value: 'native', label: 'Native' },
  ]

  const formatOptions = [
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'gif', label: 'GIF' },
    { value: 'webp', label: 'WebP' },
    { value: 'svg', label: 'SVG' },
    { value: 'mp4', label: 'MP4' },
    { value: 'webm', label: 'WebM' },
    { value: 'html5', label: 'HTML5' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'js', label: 'JS' },
  ]

  return (
    <>
      <div className="flex items-end gap-4">
        <div className="py-2 px-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">Filter</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className="gap-1">
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Name Search */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Produktname suchen..."
                    value={filters.name}
                    onChange={(event) => updateFilter('name', event.target.value)}
                    className="pl-10 h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Gattung Multi-Select */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Gattung</label>
                <div className="min-h-[36px] border border-gray-200 rounded-md">
                  <MultipleSelector
                    value={filters.gattung.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
                    onChange={(vals) => updateFilter('gattung', vals.map(v => v.value))}
                    options={gattungOptions}
                    placeholder="Gattung auswählen..."
                    className="border-0 min-h-[36px]"
                    badgeClassName="bg-emerald-100 text-emerald-800 border-emerald-200"
                  />
                </div>
              </div>

              {/* Kategorie Multi-Select */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Kategorie</label>
                <div className="min-h-[36px] border border-gray-200 rounded-md">
                  <MultipleSelector
                    value={filters.kategorie.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
                    onChange={(vals) => updateFilter('kategorie', vals.map(v => v.value))}
                    options={kategorieOptions}
                    placeholder="Kategorie auswählen..."
                    className="border-0 min-h-[36px]"
                    badgeClassName="bg-emerald-100 text-emerald-800 border-emerald-200"
                  />
                </div>
              </div>

              {/* Format Multi-Select */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Format</label>
                <div className="min-h-[36px] border border-gray-200 rounded-md">
                  <MultipleSelector
                    value={filters.format.map(v => ({ value: v, label: v.toUpperCase() }))}
                    onChange={(vals) => updateFilter('format', vals.map(v => v.value))}
                    options={formatOptions}
                    placeholder="Formate auswählen..."
                    className="border-0 min-h-[36px]"
                    badgeClassName="bg-emerald-100 text-emerald-800 border-emerald-200"
                  />
                </div>
              </div>

              {/* Width Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Breite (px)</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" value={filters.widthMin} onChange={(e) => updateFilter('widthMin', e.target.value)} className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
                  <Input type="number" placeholder="Max" value={filters.widthMax} onChange={(e) => updateFilter('widthMax', e.target.value)} className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Height Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Länge (px)</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" value={filters.heightMin} onChange={(e) => updateFilter('heightMin', e.target.value)} className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
                  <Input type="number" placeholder="Max" value={filters.heightMax} onChange={(e) => updateFilter('heightMax', e.target.value)} className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Weight Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Gewicht (KB)</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" value={filters.weightMin} onChange={(e) => updateFilter('weightMin', e.target.value)} className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
                  <Input type="number" placeholder="Max" value={filters.weightMax} onChange={(e) => updateFilter('weightMax', e.target.value)} className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide opacity-0">Actions</label>
                <Button variant="outline" size="sm" onClick={clearFilters} className="h-9 w-full text-sm border-gray-200 text-gray-600 hover:bg-gray-50">
                  <X className="w-4 h-4 mr-2" />
                  Filter zurücksetzen
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display (always full width beneath header) */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer hover:bg-emerald-200" onClick={() => removeFilter(filter.key)}>
                  {filter.label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup , index) => (
              <TableRow key={headerGroup.id} className={index === 0 ? "bg-gray-50" : ""}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="bg-white">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}