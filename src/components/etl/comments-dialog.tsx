"use client";

import { useState, useEffect } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CommentsPanel } from "@/components/etl/comments-panel";
import {
  EtlService,
  type JobApplication,
  type Comment,
} from "@/api-client/services/EtlService";

interface Props {
  application: JobApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserName: string;
  onSaved: (updated: JobApplication) => void;
}

export function CommentsDialog({
  application,
  open,
  onOpenChange,
  currentUserName,
  onSaved,
}: Props) {
  // Local optimistic state — updates instantly without waiting for the API
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [saving, setSaving] = useState(false);

  // Sync local comments whenever the dialog opens or the application changes
  useEffect(() => {
    if (open && application) {
      setLocalComments(application.comments ?? []);
    }
  }, [open, application]);

  if (!application) return null;

  const handleCommentsChange = async (comments: Comment[]) => {
    // Optimistic update — show changes immediately
    setLocalComments(comments);
    setSaving(true);
    try {
      const updated = await EtlService.updateJobApplication(application.id, {
        comments,
      });
      onSaved(updated);
    } catch {
      // Roll back on failure
      setLocalComments(application.comments ?? []);
      toast.error("Failed to save comments — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const candidateName = application.candidate?.name ?? application.candidateId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary shrink-0" />
            <DialogTitle>Comments</DialogTitle>
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />
            )}
          </div>
          <DialogDescription className="truncate">
            <span className="font-medium text-foreground">{candidateName}</span>
            {" · "}
            {application.companyName} — {application.jobRole}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1">
          <CommentsPanel
            comments={localComments}
            onChange={handleCommentsChange}
            currentUserName={currentUserName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
