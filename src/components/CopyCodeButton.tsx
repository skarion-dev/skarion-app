"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyCodeButton({ code }: { code?: string }) {
  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success("Referral code copied to clipboard!");
    } else {
      toast.error("No code available to copy");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      Copy
    </Button>
  );
}
