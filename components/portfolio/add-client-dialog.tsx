"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { createPublisher, getPublishers } from "@/actions/publisher.actions";
import { createClient } from "@/actions/client.actions";
import { getTopics } from "@/actions/topic.actions";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import MultipleSelector from "@/components/ui/multi-select";
import { Topic } from "@/db/types";

interface AddClientDialogProps {
  onClientAdded?: () => void;
  className?: string;
}

export default function AddClientDialog({ onClientAdded, className }: AddClientDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [publisherName, setPublisherName] = useState("");
    const [isCreatingPublisher, setIsCreatingPublisher] = useState(false);
    
    // Client creation state
    const [clientName, setClientName] = useState("");
    const [clientUrl, setClientUrl] = useState("");
    const [selectedPublisherId, setSelectedPublisherId] = useState("");
    const [selectedTopics, setSelectedTopics] = useState<Array<{value: string, label: string}>>([]);
    const [selectedClientType, setSelectedClientType] = useState<'display' | 'newsletter' | 'podcast'>('display');
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [publishers, setPublishers] = useState<Array<{id: string, name: string, createdAt: Date, updatedAt: Date}>>([]);
    const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);

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
                // Refresh publishers list
                loadPublishers();
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

    const loadTopics = async () => {
        try {
            const result = await getTopics();
            if (result.success && result.data) {
                setAvailableTopics(result.data);
            }
        } catch (error) {
            console.error("Error loading topics:", error);
        }
    };

    // Load publishers and topics on component mount
    useEffect(() => {
        loadPublishers();
        loadTopics();
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
                topicIds: selectedTopics.map(topic => topic.value),
                clientType: selectedClientType,
            });
            
            if (result.success) {
                alert("Client created successfully!");
                // Clear the form
                setClientName("");
                setClientUrl("");
                setSelectedPublisherId("");
                setSelectedTopics([]);
                setIsOpen(false);
                // Notify parent component to refresh data
                if (onClientAdded) {
                    onClientAdded();
                }
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

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset form when dialog closes
            setClientName("");
            setClientUrl("");
            setSelectedPublisherId("");
            setSelectedTopics([]);
            setPublisherName("");
        }
    };

    // Convert topics to options format for MultipleSelector
    const topicOptions = availableTopics.map(topic => ({
        value: topic.id,
        label: topic.label
    }));

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className={cn("flex items-center gap-2", className)}>
                    <Plus className="w-4 h-4" />
                    Mandant hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                        Create a new client and assign them to a publisher.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Publisher Creation Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Create Publisher (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="publisher-name" className="text-xs">Publisher Name</Label>
                                <Input
                                    id="publisher-name"
                                    value={publisherName}
                                    onChange={(e) => setPublisherName(e.target.value)}
                                    placeholder="Enter publisher name..."
                                    disabled={isCreatingPublisher}
                                    className="text-sm"
                                />
                            </div>
                            <Button 
                                onClick={handleCreatePublisher}
                                disabled={isCreatingPublisher || !publisherName.trim()}
                                size="sm"
                                className="w-full"
                            >
                                {isCreatingPublisher ? "Creating..." : "Create Publisher"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Client Creation Section */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="client-name">Client Name *</Label>
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
                            <Label htmlFor="publisher-select">Publisher *</Label>
                            <select
                                id="publisher-select"
                                value={selectedPublisherId}
                                onChange={(e) => setSelectedPublisherId(e.target.value)}
                                disabled={isCreatingClient}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                            <Label htmlFor="topics-select">Themen</Label>
                            <MultipleSelector
                                value={selectedTopics}
                                onChange={setSelectedTopics}
                                options={topicOptions}
                                placeholder="Select topics..."
                                disabled={isCreatingClient}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="client-type">Medium</Label>
                            <select
                                id="client-type"
                                value={selectedClientType}
                                onChange={(e) => setSelectedClientType(e.target.value as any)}
                                disabled={isCreatingClient}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="display">Display</option>
                                <option value="newsletter">Newsletter</option>
                                <option value="podcast">Podcast</option>
                            </select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleCreateClient}
                        disabled={isCreatingClient || !clientName.trim() || !selectedPublisherId}
                        className="w-full"
                    >
                        {isCreatingClient ? "Creating Client..." : "Create Client"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 