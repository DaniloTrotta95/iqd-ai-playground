'use client'

import { DataTable } from '@/app/portfolio/data-table'
import { createColumns } from '@/app/portfolio/columns'
import { Topic, ClientWithPublisher, Publisher } from '@/db/types'
import AddClientDialog from './add-client-dialog'
import { useState, useEffect } from 'react'
import { getAllClients } from '@/actions/client.actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTablePublishers } from '@/app/portfolio/data-table-publishers'
import { createColumnsPublisher } from '@/app/portfolio/columns-publisher'
import { getPublishers } from '@/actions/publisher.actions'
import { getTopics } from '@/actions/topic.actions'
import { DataTableTopics } from '@/app/portfolio/data-table-topics'
import { createColumnsTopics } from '@/app/portfolio/columns-topics'
import AddClientTopic from './add-client-topic'

interface PortfolioTableWithDialogProps {
  initialData: ClientWithPublisher[]
  initialPublishers: Publisher[]
  initialTopics: Topic[]
}

export default function PortfolioTableWithDialog({
  initialData,
  initialPublishers,
  initialTopics,
}: PortfolioTableWithDialogProps) {
  const [data, setData] = useState<ClientWithPublisher[]>(initialData)
  const [publishers, setPublishers] = useState<Publisher[]>(initialPublishers)
  const [topics, setTopics] = useState<Topic[]>(initialTopics)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const result = await getAllClients()
      const resultPublishers = await getPublishers()
      const resultTopics = await getTopics()
      if (result.success && result.data) {
        setData(result.data)
      }
      if (resultPublishers.success && resultPublishers.data) {
        setPublishers(resultPublishers.data)
      }
      if (resultTopics.success && resultTopics.data) {
        setTopics(resultTopics.data)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClientAdded = () => {
    refreshData()
  }

  return (
    <div className="w-full mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="flex gap-4">
            <TabsTrigger value="clients">Mandanten</TabsTrigger>
            <TabsTrigger value="publishers">Publisher</TabsTrigger>
            <TabsTrigger value="topics">Themen</TabsTrigger>
          </TabsList>
          <TabsContent value="clients">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-end w-full">
                <AddClientDialog onClientAdded={handleClientAdded} className="w-fit" />
              </div>
              <DataTable
                columns={createColumns({ onClientUpdated: handleClientAdded })}
                data={data}
                onClientUpdated={handleClientAdded}
                topics={topics}
              />
            </div>
          </TabsContent>
          <TabsContent value="publishers">
          <DataTablePublishers
                columns={createColumnsPublisher({ onPublisherUpdated: handleClientAdded })}
                data={publishers}
                onClientUpdated={handleClientAdded}
              />
          </TabsContent>
          <TabsContent value="topics">
          <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-end w-full">
                <AddClientTopic onTopicAdded={handleClientAdded} className="w-fit" />
              </div>
            <DataTableTopics
              columns={createColumnsTopics({ onTopicUpdated: handleClientAdded })}
              data={topics}
              onTopicUpdated={handleClientAdded}
            />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
