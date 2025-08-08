'use client'

import { DataTable } from '@/app/techspec/data-table'
import { ProductWithSpecs } from '@/db/types'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTechSpecs } from '@/actions/techspec.actions'
import { createColumnsTechSpec } from '@/app/techspec/columns'
import AddTechSpecDialog from './add-techspec-dialog'

interface TechSpecTableWithDialogProps {
  initialData: ProductWithSpecs[]
}

export default function TechSpecTableWithDialog({
  initialData,
}: TechSpecTableWithDialogProps) {
  const [data, setData] = useState<ProductWithSpecs[]>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  console.log(data)
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const result = await getTechSpecs()

      if (result.success && result.data) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleTechSpecAdded = () => {
    refreshData()
  }

  return (
    <div className="w-full mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="techspecs" className="w-full">
          <TabsList className="flex gap-4">
            <TabsTrigger value="techspecs">TechSpecs</TabsTrigger>
          
          </TabsList>
          <TabsContent value="techspecs">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-end w-full">
                <AddTechSpecDialog onProductAdded={handleTechSpecAdded} className="w-fit" />
              </div>
              <DataTable
                columns={createColumnsTechSpec({ onTechSpecUpdated: handleTechSpecAdded })}
                data={data}
                onTechSpecUpdated={handleTechSpecAdded}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
