"use client"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductWithSpecs } from "@/db/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, CheckCircle, Copy, ExternalLink, LinkIcon, MoreHorizontal, Pencil, Trash, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react";
import EditTechSpecDialog from "@/components/techspecs/edit-techspec-dialog";
import DeleteTechSpecDialog from "@/components/techspecs/delete-techspec-dialog";
import { useSession } from "@/lib/auth-client";

interface ColumnsProps {
  onTechSpecUpdated: () => void;
}

interface ActionsCellProps {
  product: ProductWithSpecs;
  onTechSpecUpdated: () => void;
}

function ActionsCell({ product, onTechSpecUpdated }: ActionsCellProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  // Always call hooks in the same order, regardless of role
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!isAdmin) return null;

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
  );
}


const getGattungColor = (gattung: string) => {
  switch (gattung.toLowerCase()) {
    case 'display':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 rounded-sm'
    case 'newsletter':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 rounded-sm'
    case 'audio':
      return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 rounded-sm'
    case 'video':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 rounded-sm'
    case 'app':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 rounded-sm'
    case 'native':
      return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 rounded-sm'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 rounded-sm'
  }
}

const getKategorieColor = (kategorie: string) => {
  switch (kategorie.toLowerCase()) {
    case 'standardwerbeform':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 rounded-sm'
    case 'sonderwerbeform':
      return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-200 rounded-sm'
    case 'kombinationswerbeform':
      return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 rounded-sm'
    case 'instream':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 rounded-sm'
    case 'inpage':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 rounded-sm'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 rounded-sm'
  }
}



export const createColumnsTechSpec = ({ onTechSpecUpdated }: ColumnsProps): ColumnDef<ProductWithSpecs>[] => [
  {
    accessorKey: "name",
    header: ({ column}) => {
      return <Button className="w-36 justify-start" variant="ghost" size="no-padding"  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
      return <Button variant="ghost" size="no-padding" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
      return <span  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{width} × {height} px</span>
    },
  },
  {
    accessorKey: "weightKb",
    header: ({ column}) => {
      return <Button variant="ghost" size="no-padding" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{weight.toFixed(2)} KB</span>
    },
  },
  {
    accessorKey: "ecoAdWeightKb",
    header: ({ column}) => {
      return <Button variant="ghost" size="no-padding" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
      return <span className="inline-flex items-center px-2 py-0.5 rounded  font-medium bg-gray-100 text-gray-800 border border-gray-200 text-xs">{weight.toFixed(2)} KB</span>
    },
  },
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
          className="flex items-center bg-gray-100 rounded-md p-1 text-gray-800 border border-gray-200 text-sm font-medium aspect-square w-8 h-8 justify-center"
        >
          <ExternalLink className="w-4 h-4" />
          
        </a>
      ) : (
        <span className="text-gray-400">—</span>
      )}
  },
  {
    accessorKey: "isEcoAd",
    header: "EcoAd",
    cell: ({ row }) => {
      const v = row.original.isEcoAd
      return v ? (
        <span className="flex items-center justify-center bg-emerald-100 rounded-md p-1 text-emerald-600 aspect-square w-8 h-8"><CheckCircle className="w-5 h-5" /> </span>
      ) : (
        <span className="flex items-center justify-center bg-red-100 rounded-md p-1 text-red-600 aspect-square w-8 h-8"><XCircle className="w-5 h-5" /> </span>
      )
    }
  },
  {
    accessorKey: "impressionPixel",
    header: "Impr. Pixel",
    cell: ({ row }) => {
      const v = row.original.impressionPixel
      return v ? (
        <span className="flex items-center justify-center bg-emerald-100 rounded-md p-1 text-emerald-600 aspect-square w-8 h-8"><CheckCircle className="w-5 h-5" /> </span>
      ) : (
        <span className="flex items-center justify-center bg-red-100 rounded-md p-1 text-red-600 aspect-square w-8 h-8"><XCircle className="w-5 h-5" /> </span>
      )
    }
  },
  {
    accessorKey: "isSkippable",
    header: "Skippable",
    cell: ({ row }) => {
      const v = row.original.isSkippable
      return v ? (
        <span className="flex items-center justify-center bg-emerald-100 rounded-md p-1 text-emerald-600 aspect-square w-8 h-8"><CheckCircle className="w-5 h-5" /> </span>
      ) : (
        <span className="flex items-center justify-center bg-red-100 rounded-md p-1 text-red-600 aspect-square w-8 h-8"><XCircle className="w-5 h-5" /> </span>
      )
    }
  },
  {
    accessorKey: "maxDuration",
    header: "Max Dauer (s)",
    cell: ({ row }) => {
      const v = row.original.maxDuration
      return v != null ? <span className="text-sm font-mono">{v}</span> : <span className="text-gray-400">—</span>
    }
  },
  {
    accessorKey: "maxHeaderSize",
    header: "Max Header (Zeichen)",
    cell: ({ row }) => {
      const v = row.original.maxHeaderSize
      return v != null ? <span className="text-sm font-mono">{v}</span> : <span className="text-gray-400">—</span>
    }
  },
  {
    accessorKey: "maxTextSize",
    header: "Max Text (Zeichen)",
    cell: ({ row }) => {
      const v = row.original.maxTextSize
      return v != null ? <span className="text-sm font-mono">{v}</span> : <span className="text-gray-400">—</span>
    }
  },
  {
    accessorKey: "maxCTASize",
    header: "Max CTA (Zeichen)",
    cell: ({ row }) => {
      const v = row.original.maxCTASize
      return v != null ? <span className="text-sm font-mono">{v}</span> : <span className="text-gray-400">—</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return <ActionsCell product={product} onTechSpecUpdated={onTechSpecUpdated} />
    },
  },
]