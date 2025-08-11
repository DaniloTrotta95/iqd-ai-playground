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
import { Switch } from "@/components/ui/switch"

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
  const [impressionPixel, setImpressionPixel] = React.useState(false)
  const [isEcoAd, setIsEcoAd] = React.useState(false)
  const [isSkippable, setIsSkippable] = React.useState(false)
  const [maxDuration, setMaxDuration] = React.useState("")
  const [maxHeaderSize, setMaxHeaderSize] = React.useState("")
  const [maxTextSize, setMaxTextSize] = React.useState("")
  const [maxCTASize, setMaxCTASize] = React.useState("")

  const gattungOptions = [
    { value: 'display', label: 'Display' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'app', label: 'App' },
    { value: 'native', label: 'Native' },
  ]

  const formatOptions = [
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'gif', label: 'GIF' },
    { value: 'html5', label: 'HTML5' },
    { value: 'mp4 (H.264)', label: 'MP4 (H.264)' },
    { value: '3rd-Party-Redirect', label: '3rd-Party-Redirect' },
    { value: 'mp3', label: 'MP3' },
  ]

  const hasVideo = React.useMemo(() => selectedGattung.some((v) => v.value === 'video'), [selectedGattung])
  const hasDisplay = React.useMemo(() => selectedGattung.some((v) => v.value === 'display'), [selectedGattung])

  React.useEffect(() => {
    if (!isEcoAd) {
      setEcoadGewicht("")
    }
  }, [isEcoAd])

  React.useEffect(() => {
    if (!hasVideo) {
      setIsSkippable(false)
      setMaxDuration("")
    }
  }, [hasVideo])

  React.useEffect(() => {
    if (!hasDisplay) {
      setMaxHeaderSize("")
      setMaxTextSize("")
      setMaxCTASize("")
    }
  }, [hasDisplay])

  const handleCreateProduct = async () => {
    if (!productName.trim() || selectedFormate.length === 0) {
      alert("Bitte geben Sie einen Produktnamen, Gewicht und mindestens ein Format ein")
      return
    }

    setIsCreatingProduct(true)
    try {
      if (!kategorie) {
        alert("Bitte wählen Sie eine Kategorie aus")
        return
      }
      const result = await createProduct({
        name: productName.trim(),
        productCategory: (kategorie as any),
        width: breite ? parseInt(breite) : undefined,
        height: laenge ? parseInt(laenge) : undefined,
        weightKb: gewicht ? parseFloat(gewicht) : undefined,
        ecoAdWeightKb: isEcoAd && ecoadGewicht ? parseFloat(ecoadGewicht) : undefined,
        formats: selectedFormate.map(fmt => fmt.value as any),
        description: undefined,
        usageContexts: selectedGattung.map(ctx => ctx.value as any),
        techSpecs: [],
        url: url || undefined,
        impressionPixel,
        isEcoAd,
        isSkippable: hasVideo ? isSkippable : false,
        maxDuration: hasVideo && maxDuration ? parseInt(maxDuration) : undefined,
        maxHeaderSize: hasDisplay && maxHeaderSize ? parseInt(maxHeaderSize) : undefined,
        maxTextSize: hasDisplay && maxTextSize ? parseInt(maxTextSize) : undefined,
        maxCTASize: hasDisplay && maxCTASize ? parseInt(maxCTASize) : undefined,
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
        setImpressionPixel(false)
        setIsEcoAd(false)
        setIsSkippable(false)
        setMaxDuration("")
        setMaxHeaderSize("")
        setMaxTextSize("")
        setMaxCTASize("")
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
      setImpressionPixel(false)
      setIsEcoAd(false)
      setIsSkippable(false)
      setMaxDuration("")
      setMaxHeaderSize("")
      setMaxTextSize("")
      setMaxCTASize("")
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
                    <SelectItem value="standardwerbeform">Standardwerbeform</SelectItem>
                    <SelectItem value="sonderwerbeform">Sonderwerbeform</SelectItem>
                    <SelectItem value="kombinationswerbeform">Kombinationswerbeform</SelectItem>
                    <SelectItem value="instream">InStream</SelectItem>
                    <SelectItem value="inpage">InPage</SelectItem>
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
                  <Label className="text-sm font-medium text-gray-700">EcoAd</Label>
                  <div className="h-11 flex items-center gap-3 border border-gray-200 rounded-md px-3">
                    <Switch checked={isEcoAd} onCheckedChange={setIsEcoAd} disabled={isCreatingProduct} />
                  </div>
                  {isEcoAd && (
                    <div className="space-y-2 pt-2">
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
                  )}
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

          {/* Weitere Optionen */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weitere Optionen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Impression Pixel</Label>
                  <div className="h-11 flex items-center gap-3 border border-gray-200 rounded-md px-3">
                    <Switch checked={impressionPixel} onCheckedChange={setImpressionPixel} disabled={isCreatingProduct} />
                  </div>
                </div>
                {hasVideo && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Skippable</Label>
                      <div className="h-11 flex items-center gap-3 border border-gray-200 rounded-md px-3">
                        <Switch checked={isSkippable} onCheckedChange={setIsSkippable} disabled={isCreatingProduct} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Max. Dauer (Sek.)</Label>
                      <Input type="number" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" disabled={isCreatingProduct} />
                    </div>
                  </>
                )}
                {hasDisplay && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Max. Header Größe (Zeichen)</Label>
                      <Input type="number" value={maxHeaderSize} onChange={(e) => setMaxHeaderSize(e.target.value)} className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" disabled={isCreatingProduct} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Max. Text Größe (Zeichen)</Label>
                      <Input type="number" value={maxTextSize} onChange={(e) => setMaxTextSize(e.target.value)} className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" disabled={isCreatingProduct} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Max. CTA Größe (Zeichen)</Label>
                      <Input type="number" value={maxCTASize} onChange={(e) => setMaxCTASize(e.target.value)} className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" disabled={isCreatingProduct} />
                    </div>
                  </>
                )}
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
              disabled={isCreatingProduct || !productName.trim() || selectedFormate.length === 0}
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