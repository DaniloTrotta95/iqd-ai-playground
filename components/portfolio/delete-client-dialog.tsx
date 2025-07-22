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
import { ClientWithPublisher } from "@/db/types";
import { useState } from "react";
import { deleteClient } from "@/actions/client.actions";
import { AlertTriangle } from "lucide-react";

interface DeleteClientDialogProps {
  client: ClientWithPublisher;
  onClientDeleted: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DeleteClientDialog({ 
  client, 
  onClientDeleted, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange 
}: DeleteClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const result = await deleteClient({
        id: client.id,
      });

      if (result.success) {
        setOpen(false);
        onClientDeleted();
      } else {
        console.error("Failed to delete client:", result.error);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Client löschen
          </DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie den Client <strong>"{client.name}"</strong> löschen möchten? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Löschen..." : "Löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 