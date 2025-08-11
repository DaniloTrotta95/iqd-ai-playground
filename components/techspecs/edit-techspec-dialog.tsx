"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MultipleSelector from "@/components/ui/multi-select"
import { Switch } from "@/components/ui/switch"
import { ProductWithSpecs } from "@/db/types"
import { updateProduct } from "@/actions/product.actions"

interface EditTechSpecDialogProps {
  product: ProductWithSpecs
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdated?: () => void
}

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

export default function EditTechSpecDialog({ product, open, onOpenChange, onProductUpdated }: EditTechSpecDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false)

  const [name, setName] = React.useState(product.name)
  const [category, setCategory] = React.useState(product.productCategory)
  const [width, setWidth] = React.useState(product.width ? String(product.width) : "")
  const [height, setHeight] = React.useState(product.height ? String(product.height) : "")
  const [weightKb, setWeightKb] = React.useState(String(product.weightKb))
  const [ecoAdWeightKb, setEcoAdWeightKb] = React.useState(product.ecoAdWeightKb != null ? String(product.ecoAdWeightKb) : "")
  const [url, setUrl] = React.useState(product.url || "")
  const [impressionPixel, setImpressionPixel] = React.useState(Boolean(product.impressionPixel))
  const [isEcoAd, setIsEcoAd] = React.useState(Boolean(product.isEcoAd))
  const [isSkippable, setIsSkippable] = React.useState(Boolean(product.isSkippable))
  const [maxDuration, setMaxDuration] = React.useState(product.maxDuration != null ? String(product.maxDuration) : "")
  const [maxHeaderSize, setMaxHeaderSize] = React.useState(product.maxHeaderSize != null ? String(product.maxHeaderSize) : "")
  const [maxTextSize, setMaxTextSize] = React.useState(product.maxTextSize != null ? String(product.maxTextSize) : "")
  const [maxCTASize, setMaxCTASize] = React.useState(product.maxCTASize != null ? String(product.maxCTASize) : "")
  const [selectedGattung, setSelectedGattung] = React.useState<Array<{ value: string; label: string }>>(
    product.usageContexts.map(uc => ({ value: uc.usageContext, label: uc.usageContext.charAt(0).toUpperCase() + uc.usageContext.slice(1) }))
  )
  const [selectedFormate, setSelectedFormate] = React.useState<Array<{ value: string; label: string }>>(
    product.formats.map(f => ({ value: f.format, label: f.format.toUpperCase() }))
  )

  const hasVideo = React.useMemo(() => selectedGattung.some((v) => v.value === 'video'), [selectedGattung])
  const hasDisplay = React.useMemo(() => selectedGattung.some((v) => v.value === 'display'), [selectedGattung])

  React.useEffect(() => {
    if (!open) return
    setName(product.name)
    setCategory(product.productCategory)
    setWidth(product.width ? String(product.width) : "")
    setHeight(product.height ? String(product.height) : "")
    setWeightKb(String(product.weightKb))
    setEcoAdWeightKb(product.ecoAdWeightKb != null ? String(product.ecoAdWeightKb) : "")
    setUrl(product.url || "")
    setImpressionPixel(Boolean(product.impressionPixel))
    setIsEcoAd(Boolean(product.isEcoAd))
    setIsSkippable(Boolean(product.isSkippable))
    setMaxDuration(product.maxDuration != null ? String(product.maxDuration) : "")
    setMaxHeaderSize(product.maxHeaderSize != null ? String(product.maxHeaderSize) : "")
    setMaxTextSize(product.maxTextSize != null ? String(product.maxTextSize) : "")
    setMaxCTASize(product.maxCTASize != null ? String(product.maxCTASize) : "")
    setSelectedGattung(product.usageContexts.map(uc => ({ value: uc.usageContext, label: uc.usageContext.charAt(0).toUpperCase() + uc.usageContext.slice(1) })))
    setSelectedFormate(product.formats.map(f => ({ value: f.format, label: f.format.toUpperCase() })))
  }, [open, product])

  React.useEffect(() => {
    if (!isEcoAd) {
      setEcoAdWeightKb("")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedFormate.length === 0) {
      alert("Bitte geben Sie einen Namen, Gewicht und mindestens ein Format ein")
      return
    }

    setIsSaving(true)
    try {
      const result = await updateProduct({
        id: product.id,
        name: name.trim(),
        productCategory: category,
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
        weightKb: weightKb ? parseFloat(weightKb) : null,
        ecoAdWeightKb: ecoAdWeightKb ? parseFloat(ecoAdWeightKb) : null,
        formats: selectedFormate.map(f => f.value as any),
        description: product.description ?? null,
        usageContexts: selectedGattung.map(g => g.value as any),
        url: url || null,
        impressionPixel,
        isEcoAd,
        isSkippable,
        maxDuration: maxDuration ? parseInt(maxDuration) : null,
        maxHeaderSize: maxHeaderSize ? parseInt(maxHeaderSize) : null,
        maxTextSize: maxTextSize ? parseInt(maxTextSize) : null,
        maxCTASize: maxCTASize ? parseInt(maxCTASize) : null,
      })

      if (result.success) {
        onOpenChange(false)
        onProductUpdated && onProductUpdated()
      } else {
        alert(`Fehler beim Aktualisieren: ${result.error}`)
      }
    } catch (err) {
      console.error(err)
      alert("Ein Fehler ist beim Aktualisieren aufgetreten")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold text-gray-900">Produkt bearbeiten</DialogTitle>
          <DialogDescription className="text-gray-600">Bearbeiten Sie die Produktdetails.</DialogDescription>
        </DialogHeader>

        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Kategorie *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as any)} disabled={isSaving}>
                  <SelectTrigger className="h-11">
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
                <Label className="text-sm font-medium text-gray-700">Gattung *</Label>
                <div className="min-h-[44px] border border-gray-200 rounded-md">
                  <MultipleSelector
                    value={selectedGattung}
                    onChange={setSelectedGattung}
                    options={gattungOptions}
                    placeholder="Gattung auswählen..."
                    disabled={isSaving}
                    className="border-0 min-h-[44px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Formate *</Label>
                <div className="min-h-[44px] border border-gray-200 rounded-md">
                  <MultipleSelector
                    value={selectedFormate}
                    onChange={setSelectedFormate}
                    options={formatOptions}
                    placeholder="Format auswählen..."
                    disabled={isSaving}
                    className="border-0 min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Breite (px)</Label>
                <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="h-11" disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Länge (px)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-11" disabled={isSaving} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Gewicht (KB) *</Label>
                <Input type="number" step="0.01" value={weightKb} onChange={(e) => setWeightKb(e.target.value)} className="h-11" disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">EcoAd</Label>
                <div className="h-11 flex items-center gap-3 border border-gray-200 rounded-md px-3">
                  <Switch checked={isEcoAd} onCheckedChange={setIsEcoAd} disabled={isSaving} />
                </div>
                {isEcoAd && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm font-medium text-gray-700">EcoAd Gewicht (KB)</Label>
                    <Input type="number" step="0.01" value={ecoAdWeightKb} onChange={(e) => setEcoAdWeightKb(e.target.value)} className="h-11" disabled={isSaving} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">URL</Label>
              <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="h-11" disabled={isSaving} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Impression Pixel</Label>
                <div className="h-11 flex items-center gap-3 border border-gray-200 rounded-md px-3">
                  <Switch checked={impressionPixel} onCheckedChange={setImpressionPixel} disabled={isSaving} />
                </div>
              </div>
              {hasVideo && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Skippable</Label>
                    <div className="h-11 flex items-center gap-3 border border-gray-200 rounded-md px-3">
                      <Switch checked={isSkippable} onCheckedChange={setIsSkippable} disabled={isSaving} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Max. Dauer (Sek.)</Label>
                    <Input type="number" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} className="h-11" disabled={isSaving} />
                  </div>
                </>
              )}
              {hasDisplay && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Max. Header Größe (Zeichen)</Label>
                    <Input type="number" value={maxHeaderSize} onChange={(e) => setMaxHeaderSize(e.target.value)} className="h-11" disabled={isSaving} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Max. Text Größe (Zeichen)</Label>
                    <Input type="number" value={maxTextSize} onChange={(e) => setMaxTextSize(e.target.value)} className="h-11" disabled={isSaving} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Max. CTA Größe (Zeichen)</Label>
                    <Input type="number" value={maxCTASize} onChange={(e) => setMaxCTASize(e.target.value)} className="h-11" disabled={isSaving} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-11" disabled={isSaving}>Abbrechen</Button>
            <Button type="submit" className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSaving || !name.trim() || selectedFormate.length === 0}>
              {isSaving ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 