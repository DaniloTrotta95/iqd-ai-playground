"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {createWorkflow, workflowEvent} from "@llama-flow/core"

interface ParsedEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export default function AgentTest() {
    const [events, setEvents] = useState<ParsedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const parseEvent = (eventData: string): ParsedEvent | null => {
        try {
            const parsed = JSON.parse(eventData);
            return {
                type: Object.keys(parsed)[0] || 'unknown',
                data: parsed[Object.keys(parsed)[0]],
                timestamp: new Date()
            };
        } catch {
            return null;
        }
    };

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
                );

            case 'offerData':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                📊 Anfrage Daten
                            </Badge>
                            <span className="text-sm text-gray-500">
                                {event.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded border space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Kunde:</strong> {event.data.customer}</div>
                                <div><strong>Kampagnen Name:</strong> {event.data.campagneName}</div>
                                <div><strong>Zeitraum:</strong> {event.data.zeitraum}</div>
                                <div><strong>Budget:</strong> {event.data.budget}</div>
                            </div>
                            
                            <div className="space-y-1">
                                <div><strong>Umfelder:</strong></div>
                                <div className="flex flex-wrap gap-1">
                                    {event.data.umfelder?.map((env: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                            {env}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div><strong>Formate:</strong></div>
                                <div className="flex flex-wrap gap-1">
                                    {event.data.formate?.map((format: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {format}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div><strong>Devices:</strong></div>
                                <div className="flex flex-wrap gap-1">
                                    {event.data.devices?.map((device: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                            {device}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {event.data.wichtige_informationen && (
                                <div className="space-y-1">
                                    <div><strong>Wichtige Informationen:</strong></div>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        {event.data.wichtige_informationen.map((info: string, idx: number) => (
                                            <li key={idx}>{info}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'res':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                ⚡ Verarbeitung
                            </Badge>
                            <span className="text-sm text-gray-500">
                                {event.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <div className="text-sm text-gray-700">
                                {event.data}
                            </div>
                        </div>
                    </div>
                );

            case 'result':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                ✅ Abgeschlossen
                            </Badge>
                            <span className="text-sm text-gray-500">
                                {/* {event.timestamp.toLocaleTimeString()} */}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <div className="text-sm text-gray-700">
                                {event.data}
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {event.type}
                            </Badge>
                            <span className="text-sm text-gray-500">
                                {/* {event.timestamp.toLocaleTimeString()} */}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <pre className="text-sm text-gray-700">
                                {JSON.stringify(event.data, null, 2)}
                            </pre>
                        </div>
                    </div>
                );
        }
    };

    const handleRunAgent = () => {
        setIsLoading(true);
        setEvents([]); // Clear previous events
        const eventSource = new EventSource('/api/agent');
    
        eventSource.onmessage = (event) => {
          console.log("Got a new event", event.data)
          const parsedEvent = parseEvent(event.data);
          if (parsedEvent) {
            setEvents(prev => {
              // Check if this event is a duplicate by comparing type and data
              const isDuplicate = prev.some(existingEvent => 
                existingEvent.type === parsedEvent.type && 
                JSON.stringify(existingEvent.data) === JSON.stringify(parsedEvent.data)
              );
              
              if (isDuplicate) {
                console.log("Skipping duplicate event:", parsedEvent.type);
                return prev;
              }
              
              return [...prev, parsedEvent];
            });
          }
        };
    
        eventSource.onerror = () => {
          eventSource.close();
          setIsLoading(false);
        };
    
        return () => {
          eventSource.close();
          setIsLoading(false);
        };
      }

	return (
		<div className="p-4 space-y-4">
			<Button 
				onClick={handleRunAgent} 
				disabled={isLoading}
				className="w-full"
			>
				{isLoading ? "Running Agent..." : "Run Agent"}
			</Button>
			
			{events.length > 0 && (
				<Card className="mt-4">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							🤖 Agent Workflow Status
							{isLoading && (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
									<span className="text-sm text-blue-600">Processing...</span>
								</div>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{events.map((event, index) => (
								<div key={index} className="border-l-4 border-blue-200 pl-4">
									{renderEventContent(event)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}