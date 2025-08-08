"use client"

import * as React from "react"
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProduct } from "@/actions/product.actions"
import { cn } from "@/lib/utils"
import MultipleSelector from "@/components/ui/multi-select"

interface AddTechSpecDialogProps {
  onProductAdded?: () => void;
  className?: string;
}

export default function AddTechSpecDialog({ onProductAdded, className }: AddTechSpecDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = React.useState(false)
  
  // Form state
  const [productName, setProductName] = React.useState("")
  const [selectedGattung, setSelectedGattung] = React.useState<Array<{value: string, label: string}>>([])
  const [kategorie, setKategorie] = React.useState("")
  const [selectedFormate, setSelectedFormate] = React.useState<Array<{value: string, label: string}>>([])
  const [breite, setBreite] = React.useState("")
  const [laenge, setLaenge] = React.useState("")
  const [gewicht, setGewicht] = React.useState("")
  const [ecoadGewicht, setEcoadGewicht] = React.useState("")
  const [url, setUrl] = React.useState("")

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

  const formatOptions = [
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'gif', label: 'GIF' },
    { value: 'webp', label: 'WebP' },
    { value: 'svg', label: 'SVG' },
    { value: 'mp4', label: 'MP4' },
    { value: 'webm', label: 'WebM' },
    { value: 'html5_zip', label: 'HTML5 ZIP' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'js', label: 'JS' },
  ]

  const handleCreateProduct = async () => {
    if (!productName.trim() || !gewicht.trim() || selectedFormate.length === 0) {
      alert("Bitte geben Sie einen Produktnamen, Gewicht und mindestens ein Format ein")
      return
    }

    setIsCreatingProduct(true)
    try {
      const result = await createProduct({
        name: productName.trim(),
        productCategory: kategorie as any || 'banner',
        width: breite ? parseInt(breite) : undefined,
        height: laenge ? parseInt(laenge) : undefined,
        weightKb: parseFloat(gewicht),
        ecoAdWeightKb: ecoadGewicht ? parseFloat(ecoadGewicht) : undefined,
        formats: selectedFormate.map(fmt => fmt.value as any),
        description: undefined,
        usageContexts: selectedGattung.map(ctx => ctx.value as any),
        techSpecs: [],
        url: url || undefined,
      })
      
      if (result.success) {
        alert("Produkt erfolgreich erstellt!")
        // Clear the form
        setProductName("")
        setSelectedGattung([])
        setKategorie("")
        setSelectedFormate([])
        setBreite("")
        setLaenge("")
        setGewicht("")
        setEcoadGewicht("")
        setUrl("")
        setOpen(false)
        // Notify parent component to refresh data
        if (onProductAdded) {
          onProductAdded()
        }
      } else {
        alert(`Fehler beim Erstellen des Produkts: ${result.error}`)
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Ein Fehler ist beim Erstellen des Produkts aufgetreten")
    } finally {
      setIsCreatingProduct(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      // Reset form when dialog closes
      setProductName("")
      setSelectedGattung([])
      setKategorie("")
      setSelectedFormate([])
      setBreite("")
      setLaenge("")
      setGewicht("")
      setEcoadGewicht("")
      setUrl("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={cn("bg-emerald-600 hover:bg-emerald-700 text-white", className)}>
          <Plus className="w-4 h-4 mr-2" />
          Produkt hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Neues Produkt hinzufügen
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Erstellen Sie ein neues Produkt mit den technischen Spezifikationen.
          </DialogDescription>
        </DialogHeader>
        
        <form className="space-y-6 mt-6" onSubmit={(e) => { e.preventDefault(); handleCreateProduct(); }}>
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Produktname eingeben..."
                  className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isCreatingProduct}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kategorie" className="text-sm font-medium text-gray-700">
                  Kategorie *
                </Label>
                <Select value={kategorie} onValueChange={setKategorie} disabled={isCreatingProduct}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Kategorie auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="display">Display</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gattung" className="text-sm font-medium text-gray-700">
                  Gattung *
                </Label>
                <div className="min-h-[44px] border border-gray-200 rounded-md focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                  <MultipleSelector
                    value={selectedGattung}
                    onChange={setSelectedGattung}
                    options={gattungOptions}
                    placeholder="Gattung auswählen..."
                    disabled={isCreatingProduct}
                    className="border-0 focus-within:ring-0 focus-within:border-0 min-h-[44px]"
                    badgeClassName="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formate" className="text-sm font-medium text-gray-700">
                  Formate *
                </Label>
                <div className="min-h-[44px] border border-gray-200 rounded-md focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                  <MultipleSelector
                    value={selectedFormate}
                    onChange={setSelectedFormate}
                    options={formatOptions}
                    placeholder="Format auswählen..."
                    disabled={isCreatingProduct}
                    className="border-0 focus-within:ring-0 focus-within:border-0 min-h-[44px]"
                    badgeClassName="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions Section */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dimensionen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breite" className="text-sm font-medium text-gray-700">
                    Breite (px)
                  </Label>
                  <Input
                    id="breite"
                    type="number"
                    value={breite}
                    onChange={(e) => setBreite(e.target.value)}
                    placeholder="z.B. 300"
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isCreatingProduct}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="laenge" className="text-sm font-medium text-gray-700">
                    Länge (px)
                  </Label>
                  <Input
                    id="laenge"
                    type="number"
                    value={laenge}
                    onChange={(e) => setLaenge(e.target.value)}
                    placeholder="z.B. 250"
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isCreatingProduct}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weight Section */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gewicht</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gewicht" className="text-sm font-medium text-gray-700">
                    Gewicht (KB) *
                  </Label>
                  <Input
                    id="gewicht"
                    type="number"
                    step="0.01"
                    value={gewicht}
                    onChange={(e) => setGewicht(e.target.value)}
                    placeholder="z.B. 150"
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isCreatingProduct}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ecoad-gewicht" className="text-sm font-medium text-gray-700">
                    EcoAd Gewicht (KB)
                  </Label>
                  <Input
                    id="ecoad-gewicht"
                    type="number"
                    step="0.01"
                    value={ecoadGewicht}
                    onChange={(e) => setEcoadGewicht(e.target.value)}
                    placeholder="z.B. 120"
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isCreatingProduct}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* URL Section */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium text-gray-700">
                  URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isCreatingProduct}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-6 h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
              disabled={isCreatingProduct}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isCreatingProduct || !productName.trim() || !gewicht.trim() || selectedFormate.length === 0}
              className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isCreatingProduct ? "Produkt wird erstellt..." : "Produkt erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 