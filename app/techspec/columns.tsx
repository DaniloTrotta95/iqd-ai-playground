"use client"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductWithSpecs } from "@/db/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Copy, ExternalLink, LinkIcon, MoreHorizontal, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import { useState } from "react";
import EditTechSpecDialog from "@/components/techspecs/edit-techspec-dialog";
import DeleteTechSpecDialog from "@/components/techspecs/delete-techspec-dialog";

interface ColumnsProps {
  onTechSpecUpdated: () => void;
}


const getGattungColor = (gattung: string) => {
  switch (gattung.toLowerCase()) {
    case 'mobile':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'desktop':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'tablet':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getKategorieColor = (kategorie: string) => {
  switch (kategorie.toLowerCase()) {
    case 'banner':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'video':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'display':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const createColumnsTechSpec = ({ onTechSpecUpdated }: ColumnsProps): ColumnDef<ProductWithSpecs>[] => [
  {
    accessorKey: "name",
    header: ({ column}) => {
      return <Button className="w-36" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
    cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>
  },
  {
    accessorKey: "usageContexts",
    header: "Gattung",
    cell: ({ row }) => {          
      return <div className="flex flex-wrap gap-1">
        {row.original.usageContexts?.map((context) => (
          <Badge key={context.id} variant="default" className={`capitalize text-xs ${getGattungColor(context.usageContext)}`}>
            {context.usageContext}
          </Badge>
        ))}
      </div>
    },
  },
  {
    accessorKey: "productCategory",
    header: ({ column}) => {
      return <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Kategorie
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
      const category = row.original.productCategory
      return <Badge variant="secondary" className={`capitalize ${getKategorieColor(category)}`}>{category}</Badge>
    },
  },
  {
    accessorKey: "formats",
    header: "Formate",
    cell: ({ row }) => {          
      return <div className="flex flex-wrap gap-1">
        {row.original.formats?.map((format, index) => (
           <span 
           key={index}
           className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
         >
           {format.format}
         </span>
        ))}
      </div>
    },
  },
  {
    accessorKey: "dimensions",
    header: "Dimensionen",
    cell: ({ row }) => {
      const width = row.original.width
      const height = row.original.height
      if (!width || !height) {
        return <span className="text-muted-foreground  text-sm">-</span>
      }
      return <span className="text-sm font-mono">{width} × {height} px</span>
    },
  },
  {
    accessorKey: "weightKb",
    header: ({ column}) => {
      return <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Gewicht (KB)
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
      const weight = row.original.weightKb
      return <span className="text-sm font-mono">{weight.toFixed(2)} KB</span>
    },
  },
  {
    accessorKey: "ecoAdWeightKb",
    header: ({ column}) => {
      return <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        EcoAdGewicht (KB)
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
      const weight = row.original.ecoAdWeightKb
      if (!weight) {
        return <span className="text-muted-foreground text-sm">-</span>
      }
      return <span className="text-sm font-mono">{weight.toFixed(2)} KB</span>
    },
  },

  // {
  //   accessorKey: "techSpecs",
  //   header: "Tech Specs",
  //   cell: ({ row }) => {
  //     const specs = row.original.techSpecs
  //     if (!specs || specs.length === 0) {
  //       return <span className="text-muted-foreground text-sm">-</span>
  //     }
      
  //     return (
  //       <div className="space-y-1">
  //         {specs.slice(0, 2).map((spec) => (
  //           <div key={spec.id} className="text-xs">
  //             <span className="font-medium">{spec.specName}</span>
  //             <span className="mx-1">=</span>
  //             <span>{spec.specValue}</span>
  //             {spec.specType && (
  //               <span className="ml-1 text-gray-500">({spec.specType})</span>
  //             )}
  //           </div>
  //         ))}
  //         {specs.length > 2 && (
  //           <div className="text-xs text-muted-foreground">
  //             +{specs.length - 2} more
  //           </div>
  //         )}
  //       </div>
  //     )
  //   },
  // // },
  // {
  //   accessorKey: "description",
  //   header: "Beschreibung",
  //   cell: ({ row }) => {
  //     const description = row.original.description
  //     if (!description) {
  //       return <span className="text-muted-foreground text-sm">-</span>
  //     }
  //     return (
  //       <div className="max-w-[200px]">
  //         <span className="text-sm text-muted-foreground line-clamp-2">
  //           {description}
  //         </span>
  //       </div>
  //     )
  //   },
  // },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const url = row.original.url
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Link
        </a>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original
      const [showEditDialog, setShowEditDialog] = useState(false);
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-1" align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="justify-between"
                onClick={() => navigator.clipboard.writeText(product.name)}
              >
                 Copy Name
                <Copy className="w-4 h-4 ml-2" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-between"
                onClick={() => setShowEditDialog(true)}
              >
                Edit
                <Pencil className="w-4 h-4 ml-2" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 group bg-red-100 font-semibold justify-between"
                onClick={() => setShowDeleteDialog(true)}
              >
                <span className="group-hover:text-red-500">
                Delete
                </span>
                <Trash className="w-4 h-4 ml-2 text-red-500 hover:text-red-500" />  
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditTechSpecDialog
            product={product}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onProductUpdated={() => {
              onTechSpecUpdated();
              setShowEditDialog(false);
            }}
          />
          <DeleteTechSpecDialog
            product={product}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onProductDeleted={() => {
              onTechSpecUpdated();
              setShowDeleteDialog(false);
            }}
          />
        </>
      )
    },
  },
]