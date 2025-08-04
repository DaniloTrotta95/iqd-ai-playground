'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { createWorkflow, workflowEvent } from '@llama-flow/core'
import { createPublisher, getPublishers } from '@/actions/publisher.actions'
import { createClient } from '@/actions/client.actions'
import { cn } from '@/lib/utils'
import {
  ImageIcon,
  Figma,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
  PlayIcon,
  ZapIcon,
  BotIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'

interface ParsedEvent {
  type: string
  data: any
  timestamp: Date
  id: string // Add unique ID for better tracking
}

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

interface CommandSuggestion {
  icon: React.ReactNode
  label: string
  description: string
  prefix: string
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string
  showRing?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className={cn('relative', containerClassName)}>
        <textarea
          className={cn(
            'border-input bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm',
            'transition-all duration-200 ease-in-out',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            showRing
              ? 'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none'
              : '',
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showRing && isFocused && (
          <motion.span
            className="ring-primary/30 pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div
            className="bg-primary absolute right-2 bottom-2 h-2 w-2 rounded-full opacity-0"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export default function AgentTest() {
  const [events, setEvents] = useState<ParsedEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [recentCommand, setRecentCommand] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  })
  const [inputFocused, setInputFocused] = useState(false)
  const commandPaletteRef = useRef<HTMLDivElement>(null)

  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <PlayIcon className="h-4 w-4" />,
      label: 'Run Agent',
      description: 'Start the AI agent workflow',
      prefix: '/run',
    },
    {
      icon: <ZapIcon className="h-4 w-4" />,
      label: 'Quick Test',
      description: 'Run with hardcoded prompt',
      prefix: '/quick',
    },
    {
      icon: <BotIcon className="h-4 w-4" />,
      label: 'Custom Prompt',
      description: 'Send custom prompt to agent',
      prefix: '/prompt',
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: 'Clear Events',
      description: 'Clear all events',
      prefix: '/clear',
    },
  ]

  const parseEvent = (eventData: string): ParsedEvent[] => {
    try {
      console.log('Event data is ', eventData)
      const parsed = JSON.parse(eventData)

      // Handle different event structures
      const events: ParsedEvent[] = []

      // Check for specific event types
      if (parsed.anfrage) {
        events.push({
          type: 'anfrage',
          data: parsed.anfrage,
          timestamp: new Date(),
          id: `anfrage-${Date.now()}`,
        })
      }

      if (parsed.customerData) {
        events.push({
          type: 'customerData',
          data: parsed.customerData,
          timestamp: new Date(),
          id: `customerData-${Date.now()}`,
        })
      }

      if (parsed.offerData) {
        events.push({
          type: 'offerData',
          data: parsed.offerData,
          timestamp: new Date(),
          id: `offerData-${Date.now()}`,
        })
      }

      if (parsed.salesForceCustomer) {
        events.push({
          type: 'salesForceCustomer',
          data: parsed.salesForceCustomer,
          timestamp: new Date(),
          id: `salesForceCustomer-${Date.now()}`,
        })
      }

      if (parsed.inOurPortfolio) {
        events.push({
          type: 'inOurPortfolio',
          data: parsed.inOurPortfolio,
          timestamp: new Date(),
          id: `inOurPortfolio-${Date.now()}`,
        })
      }

      if (parsed.notInOurPortfolio) {
        events.push({
          type: 'notInOurPortfolio',
          data: parsed.notInOurPortfolio,
          timestamp: new Date(),
          id: `notInOurPortfolio-${Date.now()}`,
        })
      }

      if (parsed.fetchAGM) {
        events.push({
          type: 'fetchAGM',
          data: parsed.fetchAGM,
          timestamp: new Date(),
          id: `fetchAGM-${Date.now()}`,
        })
      }

      if (parsed.result) {
        events.push({
          type: 'result',
          data: parsed.result,
          timestamp: new Date(),
          id: `result-${Date.now()}`,
        })
      }

      // If no specific events were found, try the old method
      if (events.length === 0) {
        const keys = Object.keys(parsed)
        keys.forEach((key) => {
          if (parsed[key] !== null && parsed[key] !== undefined) {
            events.push({
              type: key || 'unknown',
              data: parsed[key],
              timestamp: new Date(),
              id: `${key}-${Date.now()}`,
            })
          }
        })
      }

      return events
    } catch (error) {
      console.error('Error parsing event:', error)
      return []
    }
  }

  const renderEventContent = (event: ParsedEvent) => {
    switch (event.type) {
      case 'anfrage':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                📋 Request
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {event.data}
              </pre>
            </div>
          </div>
        )

      case 'customerData':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                📊 Customer Data
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <pre className="text-sm text-gray-700">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </div>
          </div>
        )

      case 'salesForceCustomer':
        if (!event.data.hasBeenFound) {
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  👤 Salesforce Contact
                </Badge>
                <span className="text-sm text-gray-500">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700"
                      >
                        ❌ Contact not found in Salesforce
                      </Badge>
                    </div>
                  </div>
                  
                  {/* User Information Display */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Available User Information
                      </span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.data.name && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Name
                            </span>
                            <p className="text-sm text-gray-800 font-medium">
                              {event.data.name}
                            </p>
                          </div>
                        )}
                        
                        {event.data.email && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Email
                            </span>
                            <p className="text-sm text-gray-800">
                              {event.data.email}
                            </p>
                          </div>
                        )}
                        
                        {event.data.phone && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Phone
                            </span>
                            <p className="text-sm text-gray-800">
                              {event.data.phone}
                            </p>
                          </div>
                        )}
                        
                        {event.data.accountName && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Account Name
                            </span>
                            <p className="text-sm text-gray-800">
                              {event.data.accountName}
                            </p>
                          </div>
                        )}
                        
                        {event.data.accountId && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Account ID
                            </span>
                            <p className="text-sm text-gray-800 font-mono">
                              {event.data.accountId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Create User Button */}
                    <div className="flex justify-center pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white cursor-pointer hover:bg-blue-700 text-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        onClick={() => {
                          // TODO: Implement create user functionality
                          console.log('Create user with data:', event.data)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">+</span>
                          <span className="text-xs font-bold">Create User in Salesforce</span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        const url =
          'https://iqdigital--sprintsv2.sandbox.lightning.force.com/lightning/r'
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                👤 Salesforce Contact
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="space-y-4">
                {/* Contact Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Contact
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Name:
                        </span>
                        <a
                          href={
                            url + '/contact/' + event.data.contactId + '/view'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          {event.data.name}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Email:
                        </span>
                        <span className="text-sm text-gray-800">
                          {event.data.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Phone:
                        </span>
                        <span className="text-sm text-gray-800">
                          {event.data.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Account
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Account ID:
                        </span>
                        <a
                          href={
                            url + '/account/' + event.data.accountId + '/view'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          {event.data.accountId}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Account Name:
                        </span>
                        <span className="text-sm text-gray-800">
                          {event.data.accountName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opportunities Section */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Opportunities
                    </span>
                  </div>
                  <div className="space-y-2">
                    {event.data.opportunities.map(
                      (
                        opportunity: {
                          id: string
                          opportunityName: string
                          stage: string
                          closeDate: string
                        },
                        idx: number
                      ) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <a
                              href={
                                url + '/opportunity/' + opportunity.id + '/view'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className="text-sm font-medium text-gray-800">
                                {opportunity.opportunityName}
                              </span>
                            </a>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {opportunity.stage}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Close Date: {opportunity.closeDate}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'offerData':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                📋 Offer Data
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Kunde:</strong> {event.data.customer}
                </div>
                <div>
                  <strong>Agentur:</strong> {event.data.agency}
                </div>
                <div>
                  <strong>Kontakt:</strong> {event.data.contact}
                </div>
                <div>
                  <strong>Email:</strong> {event.data.email}
                </div>
                <div>
                  <strong>Kampagnen Name:</strong> {event.data.campagneName}
                </div>
                <div>
                  <strong>Zeitraum:</strong> {event.data.zeitraum}
                </div>
                <div>
                  <strong>Budget:</strong> {event.data.budget}
                </div>
              </div>

              {event.data.umfelder && (
                <div className="space-y-1">
                  <div>
                    <strong>Umfelder:</strong>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {event.data.umfelder.map(
                      (
                        umfeld: { seite: string; rubrik: string },
                        idx: number
                      ) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {umfeld.seite} - {umfeld.rubrik}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {event.data.formate && (
                <div className="space-y-1">
                  <div>
                    <strong>Formate:</strong>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {event.data.formate.map((format: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {event.data.devices && (
                <div className="space-y-1">
                  <div>
                    <strong>Devices:</strong>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {event.data.devices.map((device: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-purple-50 text-purple-700"
                      >
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {event.data.wichtige_informationen && (
                <div className="space-y-1">
                  <div>
                    <strong>Wichtige Informationen:</strong>
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {event.data.wichtige_informationen.map(
                      (info: string, idx: number) => (
                        <li key={idx}>{info}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )

      case 'inOurPortfolio':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700"
              >
                ✅ In Portfolio
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-700">
                <span className="font-bold">
                  Verfügbare Seiten in unserem Portfolio:
                </span>
                <ul className="mt-2 space-y-1">
                  {event.data.map((umfeld: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span>
                      {umfeld}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'notInOurPortfolio':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                ⚠️ Nicht in Portfolio
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-700">
                <span className="font-bold">Nicht verfügbare Seiten:</span>
                <ul className="mt-2 space-y-1">
                  {event.data.map((umfeld: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-orange-600">✗</span>
                      {umfeld}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'fetchAGM':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                🔍 AGM API
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-700">{event.data}</div>
            </div>
          </div>
        )

      case 'result':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700"
              >
                ✅ Abgeschlossen
              </Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-700">{event.data}</div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{event.type}</Badge>
              <span className="text-sm text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <pre className="text-sm text-gray-700">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </div>
          </div>
        )
    }
  }

  const handleRunAgent = (customPrompt?: string) => {
    setIsLoading(true)
    setEvents([]) // Clear previous events
    const eventSource = new EventSource('/api/agent')

    eventSource.onmessage = (event) => {
      console.log('Raw event data:', event.data)
      const parsedEvents = parseEvent(event.data)
      console.log('Parsed events:', parsedEvents)

      if (parsedEvents.length > 0) {
        setEvents((prev) => {
          const newEvents = [...prev]

          parsedEvents.forEach((parsedEvent) => {
            // Check if this event is a duplicate by comparing type and data
            const isDuplicate = prev.some(
              (existingEvent) =>
                existingEvent.type === parsedEvent.type &&
                JSON.stringify(existingEvent.data) ===
                  JSON.stringify(parsedEvent.data)
            )

            if (!isDuplicate) {
              console.log(
                'Adding new event:',
                parsedEvent.type,
                parsedEvent.data
              )
              newEvents.push(parsedEvent)
            } else {
              console.log('Skipping duplicate event:', parsedEvent.type)
            }
          })

          return newEvents
        })
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      eventSource.close()
      setIsLoading(false)
    }

    return () => {
      eventSource.close()
      setIsLoading(false)
    }
  }

  const handleQuickTest = () => {
    // Use a hardcoded prompt for quick testing
    setValue(
      'Teste den Agent mit einer einfachen Anfrage für eine Marketingkampagne'
    )
    handleRunAgent()
  }

  const handleClearEvents = () => {
    setEvents([])
    setIsLoading(false)
  }

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true)

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value)
      )

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex)
      } else {
        setActiveSuggestion(-1)
      }
    } else {
      setShowCommandPalette(false)
    }
  }, [value])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const commandButton = document.querySelector('[data-command-button]')

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        )
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion]
          handleCommandAction(selectedCommand.prefix)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowCommandPalette(false)
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        handleSendMessage()
      }
    }
  }

  const handleCommandAction = (prefix: string) => {
    switch (prefix) {
      case '/run':
        handleRunAgent()
        break
      case '/quick':
        handleQuickTest()
        break
      case '/prompt':
        // Keep the current value for custom prompt
        break
      case '/clear':
        handleClearEvents()
        break
    }
    setShowCommandPalette(false)
    setValue('')
  }

  const handleSendMessage = () => {
    if (value.trim()) {
      startTransition(() => {
        setIsTyping(true)
        // If it's a custom prompt, run the agent with it
        if (value.trim() && !value.startsWith('/')) {
          handleRunAgent(value.trim())
        }
        setTimeout(() => {
          setIsTyping(false)
          setValue('')
          adjustHeight(true)
        }, 1000)
      })
    }
  }

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`
    setAttachments((prev) => [...prev, mockFileName])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index]
    handleCommandAction(selectedCommand.prefix)

    setRecentCommand(selectedCommand.label)
    setTimeout(() => setRecentCommand(null), 2000)
  }

  return (
    <div className="flex w-full max-w-4xl mx-auto flex-1 ">
      <div className="text-foreground relative flex min-h-screen w-full flex-col items-center  bg-transparent p-6">
        <div className="relative w-full ">
          <motion.div
            className="relative z-10 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="space-y-3 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block"
              >
                <h1 className="pb-1 text-3xl font-medium tracking-tight">
                  AI Agent Test Interface
                </h1>
                <motion.div
                  className="via-primary/50 h-px bg-gradient-to-r from-transparent to-transparent"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </motion.div>
              <motion.p
                className="text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Geben Sie einen Befehl ein oder stellen Sie dem Agenten eine
                Frage
              </motion.p>
            </div>

            <motion.div
              className="border-border bg-card/80 relative rounded-2xl border shadow-2xl backdrop-blur-2xl"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <AnimatePresence>
                {showCommandPalette && (
                  <motion.div
                    ref={commandPaletteRef}
                    className="border-border bg-background/90 absolute right-4 bottom-full left-4 z-50 mb-2 overflow-hidden rounded-lg border shadow-lg backdrop-blur-xl"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="bg-background py-1">
                      {commandSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={suggestion.prefix}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors',
                            activeSuggestion === index
                              ? 'bg-primary/20 text-foreground'
                              : 'text-muted-foreground hover:bg-primary/10'
                          )}
                          onClick={() => selectCommandSuggestion(index)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <div className="text-primary flex h-5 w-5 items-center justify-center">
                            {suggestion.icon}
                          </div>
                          <div className="font-medium">{suggestion.label}</div>
                          <div className="text-muted-foreground ml-1 text-xs">
                            {suggestion.prefix}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                    adjustHeight()
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Stellen Sie dem KI-Agenten eine Frage oder verwenden Sie /run für einen schnellen Test..."
                  containerClassName="w-full"
                  className={cn(
                    'w-full px-4 py-3',
                    'resize-none',
                    'bg-transparent',
                    'border-none',
                    'text-foreground text-sm',
                    'focus:outline-none',
                    'placeholder:text-muted-foreground',
                    'min-h-[60px]'
                  )}
                  style={{
                    overflow: 'hidden',
                  }}
                  showRing={false}
                />
              </div>

              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2 px-4 pb-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {attachments.map((file, index) => (
                      <motion.div
                        key={index}
                        className="bg-primary/5 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <span>{file}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-border flex items-center justify-between gap-4 border-t p-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={handleAttachFile}
                    whileTap={{ scale: 0.94 }}
                    className="group text-muted-foreground hover:text-foreground relative rounded-lg p-2 transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    <motion.span
                      className="bg-primary/10 absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                      layoutId="button-highlight"
                    />
                  </motion.button>
                  <motion.button
                    type="button"
                    data-command-button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCommandPalette((prev) => !prev)
                    }}
                    whileTap={{ scale: 0.94 }}
                    className={cn(
                      'group text-muted-foreground hover:text-foreground relative rounded-lg p-2 transition-colors',
                      showCommandPalette && 'bg-primary/20 text-foreground'
                    )}
                  >
                    <Command className="h-4 w-4" />
                    <motion.span
                      className="bg-primary/10 absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                      layoutId="button-highlight"
                    />
                  </motion.button>
                </div>

                <motion.button
                  type="button"
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isTyping || !value.trim()}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    'flex items-center gap-2',
                    value.trim()
                      ? 'bg-primary text-primary-foreground shadow-primary/10 shadow-lg'
                      : 'bg-muted/50 text-muted-foreground'
                  )}
                >
                  {isTyping ? (
                    <LoaderIcon className="h-4 w-4 animate-[spin_2s_linear_infinite]" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                  <span>Senden</span>
                </motion.button>
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {commandSuggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.prefix}
                  onClick={() => selectCommandSuggestion(index)}
                  className="group bg-primary/5 text-muted-foreground hover:bg-primary/10 hover:text-foreground relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {suggestion.icon}
                  <span>{suggestion.label}</span>
                  <motion.div
                    className="border-border/50 absolute inset-0 rounded-lg border"
                    initial={false}
                    animate={{
                      opacity: [0, 1],
                      scale: [0.98, 1],
                    }}
                    transition={{
                      duration: 0.3,
                      ease: 'easeOut',
                    }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Events Display */}
            {events.length > 0 && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-lg font-semibold">workflow</h3>
                  {isLoading && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-600">
                        Verarbeiten...
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="border-border bg-card/80 rounded-xl border shadow-lg backdrop-blur-xl p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {renderEventContent(event)}
                    </motion.div>
                  ))}
                </div>

                {isLoading && (
                  <motion.div
                    className="border-border bg-card/80 rounded-xl border shadow-lg backdrop-blur-xl p-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: events.length * 0.1 }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-600">
                        Loading Spinner
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="border-border bg-background/80 fixed bottom-8 mx-auto -translate-x-1/2 transform rounded-full border px-4 py-2 shadow-lg backdrop-blur-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-7 w-8 items-center justify-center rounded-full text-center">
                  <Sparkles className="text-primary h-4 w-4" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span>Verarbeiten</span>
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {inputFocused && (
          <motion.div
            className="from-primary via-primary/80 to-secondary pointer-events-none fixed z-0 h-[50rem] w-[50rem] rounded-full bg-gradient-to-r opacity-[0.02] blur-[96px]"
            animate={{
              x: mousePosition.x - 400,
              y: mousePosition.y - 400,
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 150,
              mass: 0.5,
            }}
          />
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="ml-1 flex items-center">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="bg-primary mx-0.5 h-1.5 w-1.5 rounded-full"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: 'easeInOut',
          }}
          style={{
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.3)',
          }}
        />
      ))}
    </div>
  )
}
