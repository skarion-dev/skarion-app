"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface AssignCustomerSupportModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: { id: string; name: string; username: string; roles: { id: string; name: string }[] };
  accessToken?: string;
  onSuccess: (updatedUser: any) => void;
}

export default function AssignCustomerSupportModal({
  isOpen,
  setIsOpen,
  user,
  accessToken,
  onSuccess,
}: AssignCustomerSupportModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleAssign() {
    try {
      setIsLoading(true);
      const res = await fetch(getApiUrl(`/users/${user.id}/assign-customer-support`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success(`${user.name} is now a customer support representative!`);
      onSuccess(data.user);
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Assign Customer Support Role
          </DialogTitle>
          <DialogDescription>
            This will grant <b>{user?.name}</b> the <b>customer support</b> role. They will be able to manage candidate chats and help candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium text-foreground">Name:</span> {user.name}
          </p>
          <p>
            <span className="font-medium text-foreground">Username:</span> @{user.username}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? "Assigning…" : "Confirm & Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
