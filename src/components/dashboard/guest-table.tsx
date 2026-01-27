import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Column,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { data } from "@/lib/data"
import type { Guest, GuestStatus } from "@/lib/types"
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, X } from "lucide-react"

const statusVariant: Record<GuestStatus, "success" | "warning" | "info" | "secondary" | "destructive" | "outline"> = {
  "Accepted": "success",
  "Accepted (Tentative)": "warning",
  "Invited": "info",
  "Planned": "secondary",
  "Proposed": "outline",
  "Declined": "destructive",
  "No Response": "destructive",
}

const allStatuses: GuestStatus[] = [
  "Accepted",
  "Accepted (Tentative)",
  "Invited",
  "Planned",
  "Proposed",
  "Declined",
  "No Response",
]

// Get unique tags from all guests
const allTags = Array.from(
  new Set(
    data.guests
      .flatMap((g) => g.tags?.split(",").map((t) => t.trim()) || [])
      .filter(Boolean)
  )
).sort()

function SortableHeader({ column, children }: { column: Column<Guest, unknown>; children: React.ReactNode }) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="ml-1 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-1 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
      )}
    </Button>
  )
}

function ColumnFilter({ column, placeholder }: { column: Column<Guest, unknown>; placeholder: string }) {
  const value = (column.getFilterValue() as string) ?? ""
  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="h-8 text-xs"
      />
      {value && (
        <button
          onClick={() => column.setFilterValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function StatusFilter({ column }: { column: Column<Guest, unknown> }) {
  const filterValue = (column.getFilterValue() as string[]) ?? []

  const toggleStatus = (status: string) => {
    const newValue = filterValue.includes(status)
      ? filterValue.filter((s) => s !== status)
      : [...filterValue, status]
    column.setFilterValue(newValue.length ? newValue : undefined)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-between">
          {filterValue.length ? `${filterValue.length} selected` : "All"}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {allStatuses.map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={filterValue.includes(status)}
            onCheckedChange={() => toggleStatus(status)}
          >
            {status}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TagsFilter({ column }: { column: Column<Guest, unknown> }) {
  const filterValue = (column.getFilterValue() as string[]) ?? []

  const toggleTag = (tag: string) => {
    const newValue = filterValue.includes(tag)
      ? filterValue.filter((t) => t !== tag)
      : [...filterValue, tag]
    column.setFilterValue(newValue.length ? newValue : undefined)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-between">
          {filterValue.length ? `${filterValue.length} selected` : "All"}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
        {allTags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag}
            checked={filterValue.includes(tag)}
            onCheckedChange={() => toggleTag(tag)}
          >
            {tag}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function GuestTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<Guest>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "affiliation",
      header: ({ column }) => <SortableHeader column={column}>Affiliation</SortableHeader>,
      cell: ({ row }) => row.getValue("affiliation") || "-",
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
      cell: ({ row }) => {
        const status = row.getValue("status") as GuestStatus
        return <Badge variant={statusVariant[status]}>{status}</Badge>
      },
      filterFn: (row, id, filterValue: string[]) => {
        if (!filterValue || filterValue.length === 0) return true
        return filterValue.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string | null
        if (!tags) return "-"
        return (
          <div className="flex flex-wrap gap-1">
            {tags.split(",").map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )
      },
      filterFn: (row, id, filterValue: string[]) => {
        if (!filterValue || filterValue.length === 0) return true
        const tags = row.getValue(id) as string | null
        if (!tags) return false
        const rowTags = tags.split(",").map((t) => t.trim())
        return filterValue.some((f) => rowTags.includes(f))
      },
    },
    {
      accessorKey: "stipend",
      header: ({ column }) => <SortableHeader column={column}>Stipend</SortableHeader>,
      cell: ({ row }) => {
        const amount = row.getValue("stipend") as number
        return amount ? `$${amount.toLocaleString()}` : "-"
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string | null
        return email ? (
          <a href={`mailto:${email}`} className="text-blue-500 hover:underline">
            {email}
          </a>
        ) : (
          "-"
        )
      },
      filterFn: "includesString",
    },
  ]

  const table = useReactTable({
    data: data.guests,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const hasFilters = columnFilters.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Guest List</CardTitle>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setColumnFilters([])}
              className="text-muted-foreground"
            >
              Clear all filters
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {/* Header row */}
              <TableRow>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <TableHead key={header.id} className="align-bottom">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
              {/* Filter row */}
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="py-2">
                  <ColumnFilter
                    column={table.getColumn("name")!}
                    placeholder="Filter name..."
                  />
                </TableHead>
                <TableHead className="py-2">
                  <ColumnFilter
                    column={table.getColumn("affiliation")!}
                    placeholder="Filter affiliation..."
                  />
                </TableHead>
                <TableHead className="py-2">
                  <StatusFilter column={table.getColumn("status")!} />
                </TableHead>
                <TableHead className="py-2">
                  <TagsFilter column={table.getColumn("tags")!} />
                </TableHead>
                <TableHead className="py-2">
                  {/* No filter for stipend */}
                </TableHead>
                <TableHead className="py-2">
                  <ColumnFilter
                    column={table.getColumn("email")!}
                    placeholder="Filter email..."
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
        <div className="py-3 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.guests.length} guests
        </div>
      </CardContent>
    </Card>
  )
}
