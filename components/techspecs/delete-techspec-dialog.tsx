"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductWithSpecs } from "@/db/types"
import { deleteProduct } from "@/actions/product.actions"

interface DeleteTechSpecDialogProps {
  product: ProductWithSpecs
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductDeleted?: () => void
}

export default function DeleteTechSpecDialog({ product, open, onOpenChange, onProductDeleted }: DeleteTechSpecDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!product) return
    setIsDeleting(true)
    try {
      const result = await deleteProduct(product.id)
      if (result.success) {
        onOpenChange(false)
        onProductDeleted && onProductDeleted()
      } else {
        alert(`Fehler beim Löschen: ${result.error}`)
      }
    } catch (err) {
      console.error(err)
      alert("Ein Fehler ist beim Löschen aufgetreten")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold text-gray-900">Produkt löschen</DialogTitle>
          <DialogDescription className="text-gray-600">
            Sind Sie sicher, dass Sie das Produkt "{product.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-11" disabled={isDeleting}>
            Abbrechen
          </Button>
          <Button type="button" onClick={handleDelete} className="px-6 h-11 bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
            {isDeleting ? "Löschen..." : "Löschen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 