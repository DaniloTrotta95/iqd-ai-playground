"use client"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ClientWithPublisher, Publisher, PublisherWithClients } from "@/db/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Copy, ExternalLink, LinkIcon, MoreHorizontal, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import { useState } from "react";
import EditClientDialog from "@/components/portfolio/edit-client-dialog"
import DeleteClientDialog from "@/components/portfolio/delete-client-dialog"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

interface ColumnsPublisherProps {
  onPublisherUpdated: () => void;
}

export const createColumnsPublisher = ({ onPublisherUpdated }: ColumnsPublisherProps): ColumnDef<PublisherWithClients>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={row.getToggleExpandedHandler()}
          className="h-8 w-8 p-0"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : null
    },
  },
  {
    accessorKey: "name",
    cell: ({ row }) => {
      const publisher = row.original
      return <Badge variant="secondary">{publisher.name}</Badge>
    },
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
      id: "actions",
      cell: ({ row }) => {
        const publisher = row.original
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
                  onClick={() => navigator.clipboard.writeText(publisher.name)}
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
              // <EditClientDialog 
              //   client={client} 
              //   onClientUpdated={() => {
              //     onPublisherUpdated();
              //     setShowEditDialog(false);
              //   }}
              //   open={showEditDialog}
              //   onOpenChange={setShowEditDialog}
              // />
              <></>
            )}
            {showDeleteDialog && (
              // <DeleteClientDialog 
              //   client={client} 
              //   onClientDeleted={() => {
              //     onPublisherUpdated();
              //     setShowDeleteDialog(false);
              //   }}
              //   open={showDeleteDialog}
              //   onOpenChange={setShowDeleteDialog}
              // />
              <></>
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