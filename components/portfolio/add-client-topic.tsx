"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTopic } from "@/actions/topic.actions";

interface AddClientTopicProps {
  onTopicAdded?: () => void;
  className?: string;
}

export default function AddClientTopic({ onTopicAdded, className }: AddClientTopicProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [label, setLabel] = useState("");
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);

    const handleCreateTopic = async () => {
        if (!name.trim() || !label.trim()) {
            alert("Please enter both name and label");
            return;
        }

        setIsCreatingTopic(true);
        try {
            const result = await createTopic({ 
                name: name.trim(), 
                label: label.trim() 
            });
            
            if (result.success) {
                alert("Topic created successfully!");
                setName(""); // Clear the inputs
                setLabel("");
                setIsOpen(false);
                // Notify parent component to refresh data
                if (onTopicAdded) {
                    onTopicAdded();
                }
            } else {
                alert(`Failed to create topic: ${result.error}`);
            }
        } catch (error) {
            console.error("Error creating topic:", error);
            alert("An error occurred while creating the topic");
        } finally {
            setIsCreatingTopic(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset form when dialog closes
            setName("");
            setLabel("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className={cn("flex items-center gap-2", className)}>
                    <Plus className="w-4 h-4" />
                    Thema hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Neues Thema hinzufügen</DialogTitle>
                    <DialogDescription>
                        Erstelle ein neues Thema.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Topic Creation Section */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter topic name..."
                                disabled={isCreatingTopic}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="label">Label *</Label>
                            <Input
                                id="label"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Enter topic label..."
                                disabled={isCreatingTopic}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleCreateTopic}
                        disabled={isCreatingTopic || !name.trim() || !label.trim()}
                        className="w-full"
                    >
                        {isCreatingTopic ? "Creating Topic..." : "Create Topic"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 