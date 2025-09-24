'use client'

import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Button } from './Button'
import { Input } from './Input'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  title?: string
  description?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Sök...",
  title,
  description,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <Card>
      {(title || description || searchKey) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {searchKey && (
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : (
                          <button
                            className={`flex items-center space-x-2 ${
                              header.column.getCanSort()
                                ? 'cursor-pointer hover:text-foreground'
                                : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                            disabled={!header.column.getCanSort()}
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                <ChevronUp
                                  className={`h-3 w-3 ${
                                    header.column.getIsSorted() === 'asc'
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                                <ChevronDown
                                  className={`h-3 w-3 -mt-1 ${
                                    header.column.getIsSorted() === 'desc'
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </div>
                            )}
                          </button>
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Inga resultat hittades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Visar {table.getFilteredRowModel().rows.length} av {data.length} rader
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Föregående
            </Button>
            <div className="flex items-center space-x-1">
              <span className="text-sm">
                Sida {table.getState().pagination.pageIndex + 1} av {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Nästa
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
