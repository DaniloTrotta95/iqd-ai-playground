"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {createWorkflow, workflowEvent} from "@llama-flow/core"
import { createPublisher, getPublishers } from "@/actions/publisher.actions";
import { createClient } from "@/actions/client.actions";

interface ParsedEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export default function AgentTest() {
    const [events, setEvents] = useState<ParsedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [publisherName, setPublisherName] = useState("");
    const [isCreatingPublisher, setIsCreatingPublisher] = useState(false);
    
    // Client creation state
    const [clientName, setClientName] = useState("");
    const [clientUrl, setClientUrl] = useState("");
    const [selectedPublisherId, setSelectedPublisherId] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<'news' | 'business' | 'finance' | 'sport' | 'lifestyle' | 'science' | 'family' | 'travel'>('news');
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [publishers, setPublishers] = useState<Array<{id: string, name: string, createdAt: Date, updatedAt: Date}>>([]);


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

    const handleCreatePublisher = async () => {
        if (!publisherName.trim()) {
            alert("Please enter a publisher name");
            return;
        }

        setIsCreatingPublisher(true);
        try {
            const result = await createPublisher({ name: publisherName.trim() });
            
            if (result.success) {
                alert("Publisher created successfully!");
                setPublisherName(""); // Clear the input
            } else {
                alert(`Failed to create publisher: ${result.error}`);
            }
        } catch (error) {
            console.error("Error creating publisher:", error);
            alert("An error occurred while creating the publisher");
        } finally {
            setIsCreatingPublisher(false);
        }
    };

    // Load publishers on component mount
    useEffect(() => {
        const loadPublishers = async () => {
            try {
                const result = await getPublishers();
                if (result.success && result.data) {
                    setPublishers(result.data);
                }
            } catch (error) {
                console.error("Error loading publishers:", error);
            }
        };
        loadPublishers();
    }, []);

    const handleCreateClient = async () => {
        if (!clientName.trim() || !selectedPublisherId) {
            alert("Please enter a client name and select a publisher");
            return;
        }

        setIsCreatingClient(true);
        try {
            const result = await createClient({
                publisherId: selectedPublisherId,
                name: clientName.trim(),
                url: clientUrl.trim() || undefined,
                topic: selectedTopic,
            });
            
            if (result.success) {
                alert("Client created successfully!");
                // Clear the form
                setClientName("");
                setClientUrl("");
                setSelectedPublisherId("");
                setSelectedTopic('news');
            } else {
                alert(`Failed to create client: ${result.error}`);
            }
        } catch (error) {
            console.error("Error creating client:", error);
            alert("An error occurred while creating the client");
        } finally {
            setIsCreatingClient(false);
        }
    };

	return (
		<div className="p-4 space-y-4">
			{/* Publisher Creation Section */}
			<Card>
				<CardHeader>
					<CardTitle>Create Publisher</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="publisher-name">Publisher Name</Label>
						<Input
							id="publisher-name"
							value={publisherName}
							onChange={(e) => setPublisherName(e.target.value)}
							placeholder="Enter publisher name..."
							disabled={isCreatingPublisher}
						/>
					</div>
					<Button 
						onClick={handleCreatePublisher}
						disabled={isCreatingPublisher || !publisherName.trim()}
						className="w-full"
					>
						{isCreatingPublisher ? "Creating Publisher..." : "Create Publisher"}
					</Button>
				</CardContent>
			</Card>

			{/* Client Creation Section */}
			<Card>
				<CardHeader>
					<CardTitle>Create Client</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="client-name">Client Name</Label>
						<Input
							id="client-name"
							value={clientName}
							onChange={(e) => setClientName(e.target.value)}
							placeholder="Enter client name..."
							disabled={isCreatingClient}
						/>
					</div>
					
					<div className="space-y-2">
						<Label htmlFor="client-url">Website URL (Optional)</Label>
						<Input
							id="client-url"
							value={clientUrl}
							onChange={(e) => setClientUrl(e.target.value)}
							placeholder="https://example.com"
							disabled={isCreatingClient}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="publisher-select">Publisher</Label>
						<select
							id="publisher-select"
							value={selectedPublisherId}
							onChange={(e) => setSelectedPublisherId(e.target.value)}
							disabled={isCreatingClient}
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select a publisher...</option>
							{publishers.map((publisher) => (
								<option key={publisher.id} value={publisher.id}>
									{publisher.name}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="topic-select">Topic</Label>
						<select
							id="topic-select"
							value={selectedTopic}
							onChange={(e) => setSelectedTopic(e.target.value as any)}
							disabled={isCreatingClient}
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="news">News</option>
							<option value="business">Business</option>
							<option value="finance">Finance</option>
							<option value="sport">Sport</option>
							<option value="lifestyle">Lifestyle</option>
							<option value="science">Science</option>
							<option value="family">Family</option>
							<option value="travel">Travel</option>
						</select>
					</div>

					<Button 
						onClick={handleCreateClient}
						disabled={isCreatingClient || !clientName.trim() || !selectedPublisherId}
						className="w-full"
					>
						{isCreatingClient ? "Creating Client..." : "Create Client"}
					</Button>
				</CardContent>
			</Card>

			{/* Agent Test Section */}
			<Card>
				<CardHeader>
					<CardTitle>Agent Test</CardTitle>
				</CardHeader>
				<CardContent>
					<Button 
						onClick={handleRunAgent} 
						disabled={isLoading}
						className="w-full"
					>
						{isLoading ? "Running Agent..." : "Run Agent"}
					</Button>
				</CardContent>
			</Card>
			
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