"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MultipleSelector from "@/components/ui/multi-select"
import { ProductWithSpecs } from "@/db/types"
import { updateProduct } from "@/actions/product.actions"

interface EditTechSpecDialogProps {
  product: ProductWithSpecs
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdated?: () => void
}

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

export default function EditTechSpecDialog({ product, open, onOpenChange, onProductUpdated }: EditTechSpecDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false)

  const [name, setName] = React.useState(product.name)
  const [category, setCategory] = React.useState(product.productCategory)
  const [width, setWidth] = React.useState(product.width ? String(product.width) : "")
  const [height, setHeight] = React.useState(product.height ? String(product.height) : "")
  const [weightKb, setWeightKb] = React.useState(String(product.weightKb))
  const [ecoAdWeightKb, setEcoAdWeightKb] = React.useState(product.ecoAdWeightKb != null ? String(product.ecoAdWeightKb) : "")
  const [url, setUrl] = React.useState(product.url || "")
  const [selectedGattung, setSelectedGattung] = React.useState<Array<{ value: string; label: string }>>(
    product.usageContexts.map(uc => ({ value: uc.usageContext, label: uc.usageContext.charAt(0).toUpperCase() + uc.usageContext.slice(1) }))
  )
  const [selectedFormate, setSelectedFormate] = React.useState<Array<{ value: string; label: string }>>(
    product.formats.map(f => ({ value: f.format, label: f.format.toUpperCase() }))
  )

  React.useEffect(() => {
    if (!open) return
    setName(product.name)
    setCategory(product.productCategory)
    setWidth(product.width ? String(product.width) : "")
    setHeight(product.height ? String(product.height) : "")
    setWeightKb(String(product.weightKb))
    setEcoAdWeightKb(product.ecoAdWeightKb != null ? String(product.ecoAdWeightKb) : "")
    setUrl(product.url || "")
    setSelectedGattung(product.usageContexts.map(uc => ({ value: uc.usageContext, label: uc.usageContext.charAt(0).toUpperCase() + uc.usageContext.slice(1) })))
    setSelectedFormate(product.formats.map(f => ({ value: f.format, label: f.format.toUpperCase() })))
  }, [open, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !weightKb.trim() || selectedFormate.length === 0) {
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
        weightKb: parseFloat(weightKb),
        ecoAdWeightKb: ecoAdWeightKb ? parseFloat(ecoAdWeightKb) : null,
        formats: selectedFormate.map(f => f.value as any),
        description: product.description ?? null,
        usageContexts: selectedGattung.map(g => g.value as any),
        url: url || null,
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
                <Label className="text-sm font-medium text-gray-700">EcoAd Gewicht (KB)</Label>
                <Input type="number" step="0.01" value={ecoAdWeightKb} onChange={(e) => setEcoAdWeightKb(e.target.value)} className="h-11" disabled={isSaving} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">URL</Label>
              <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="h-11" disabled={isSaving} />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-11" disabled={isSaving}>Abbrechen</Button>
            <Button type="submit" className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSaving || !name.trim() || !weightKb.trim() || selectedFormate.length === 0}>
              {isSaving ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 