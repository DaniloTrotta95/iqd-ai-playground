"use client"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ClientWithPublisher } from "@/db/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Copy, ExternalLink, LinkIcon, MoreHorizontal, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import { useState } from "react";
import EditClientDialog from "@/components/portfolio/edit-client-dialog"
import DeleteClientDialog from "@/components/portfolio/delete-client-dialog"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

interface ColumnsProps {
  onClientUpdated: () => void;
}

export const createColumns = ({ onClientUpdated }: ColumnsProps): ColumnDef<ClientWithPublisher>[] => [
  {
    accessorKey: "name",
    header: ({ column}) => {
      return <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        {
          column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    },
  },
  {
    accessorKey: "clientType",
    header: "Medium",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      const clientType = row.original.clientType
      return <Badge variant="secondary">{clientType}</Badge>
    },
  },
  {
      accessorKey: "publisherName",
      header: ({ column}) => {
        return <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Publisher
          {
            column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
        </Button>
      },
    },
    {
      accessorKey: "topic",
      filterFn: (row, columnId, filterValue: string[]) => {
        // check if the strings in filterValue are in the topics labels
        if (filterValue.length === 0) {
          return true
        }
        return row.original.topics?.some(topic => filterValue.some(value => topic.label.toLowerCase().includes(value.toLowerCase())))
      },
      header: ({ column}) => {
        return <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Thema
          {
            column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      },
      cell: ({ row }) => {          
          return <div className="flex flex-wrap gap-2">
            {row.original.topics?.map((topic) => (
              <Badge key={topic.id} variant="default" className="capitalize">{topic.label}</Badge>
            ))}
          </div>
        },
    },
    {
      accessorKey: "agmaEntityId",
      header: "AGMA Entity ID",
      cell: ({ row }) => {
        return <span className="text-muted-foreground text-sm">{row.original.agmaEntityId || "-"}</span>
      },
    },
    {
      accessorKey: "url",
      header: "Link",
      cell: ({ row }) => {
        const url = row.original.url
        if (!url) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        
        // Extract domain from URL for cleaner display
        const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
        
        return (
          <Link 
            className={buttonVariants({ variant: "outline", size: "icon" })}
            href={url} 
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* <span className="truncate max-w-[200px]">{domain}</span> */}
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
          </Link>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original
        const [showEditDialog, setShowEditDialog] = useState(false);
        const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menü öffnen</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="space-y-1" align="end">
                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                <DropdownMenuItem
                  className="justify-between"
                  onClick={() => navigator.clipboard.writeText(client.name)}
                >
                   Name kopieren
                   <Copy className="w-4 h-4 ml-2" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-between"
                  onClick={() => setShowEditDialog(true)}
                >
                  Bearbeiten
                  <Pencil className="w-4 h-4 ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 group bg-red-100 font-semibold group-hover:bg-red-50 justify-between"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <span className="group-hover:text-red-500">
                  Löschen
                  </span>
                  <Trash className="w-4 h-4 ml-2 text-red-500 hover:text-red-500" />  
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {showEditDialog && (
              <EditClientDialog 
                client={client} 
                onClientUpdated={() => {
                  onClientUpdated();
                  setShowEditDialog(false);
                }}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
              />
            )}
            {showDeleteDialog && (
              <DeleteClientDialog 
                client={client} 
                onClientDeleted={() => {
                  onClientUpdated();
                  setShowDeleteDialog(false);
                }}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              />
            )}
          </>
        )
      },
    },
//   {
//     accessorKey: "createdAt",
//     header: "Created At",
//   },
]