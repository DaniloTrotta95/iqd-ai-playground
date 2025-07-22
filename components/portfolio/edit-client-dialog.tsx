"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientWithPublisher, Topic } from "@/db/types";
import { useState, useEffect } from "react";
import { updateClient } from "@/actions/client.actions";
import { getTopics } from "@/actions/topic.actions";
import MultipleSelector from "@/components/ui/multi-select";

interface EditClientDialogProps {
  client: ClientWithPublisher;
  onClientUpdated: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EditClientDialog({ client, onClientUpdated, open: externalOpen, onOpenChange: externalOnOpenChange }: EditClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState({
    name: client.name,
    url: client.url || "",
    selectedTopics: client.topics.map(topic => ({
      value: topic.id,
      label: topic.label
    })),
    clientType: client.clientType,
  });

  // Load available topics
  useEffect(() => {
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
    loadTopics();
  }, []);

  // Initialize form data when client changes
  useEffect(() => {
    setFormData({
      name: client.name,
      url: client.url || "",
      selectedTopics: client.topics.map(topic => ({
        value: topic.id,
        label: topic.label
      })),
      clientType: client.clientType,
    });
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateClient({
        id: client.id,
        name: formData.name,
        url: formData.url || undefined,
        topicIds: formData.selectedTopics.map(topic => topic.value),
        clientType: formData.clientType as 'display' | 'newsletter' | 'podcast',
      });

      if (result.success) {
        setOpen(false);
        onClientUpdated();
        // Reset form data
        setFormData({
          name: client.name,
          url: client.url || "",
          selectedTopics: client.topics.map(topic => ({
            value: topic.id,
            label: topic.label
          })),
          clientType: client.clientType,
        });
      } else {
        console.error("Failed to update client:", result.error);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form data when dialog closes
      setFormData({
        name: client.name,
        url: client.url || "",
        selectedTopics: client.topics.map(topic => ({
          value: topic.id,
          label: topic.label
        })),
        clientType: client.clientType,
      });
    }
  };

  // Convert topics to options format for MultipleSelector
  const topicOptions = availableTopics.map(topic => ({
    value: topic.id,
    label: topic.label
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Client bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie die Client-Informationen. Klicken Sie auf Speichern, wenn Sie fertig sind.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="col-span-3"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topics" className="text-right">
                Themen
              </Label>
              <div className="col-span-3">
                <MultipleSelector
                  value={formData.selectedTopics}
                  onChange={(topics) => setFormData({ ...formData, selectedTopics: topics })}
                  options={topicOptions}
                  placeholder="Select topics..."
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-type" className="text-right">
                Medium
              </Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientType: value as 'display' | 'newsletter' | 'podcast' })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Medium auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="display">Display</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 