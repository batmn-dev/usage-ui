"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import * as React from "react";

interface ClientCodeWrapperProps {
  code: string;
  children: React.ReactNode;
  className?: string;
}

export function ClientCodeWrapper({
  code,
  children,
  className,
}: ClientCodeWrapperProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail due to denied permissions or insecure context
      // Silently fail - the UI simply won't show the "copied" state
    }
  };

  return (
    <div className={cn("group relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={copyToClipboard}
      >
        <div className="relative h-4 w-4">
          <Copy
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-300",
              copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
            )}
          />
          <Check
            className={cn(
              "absolute inset-0 h-4 w-4 text-green-500 transition-all duration-300",
              copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          />
        </div>
      </Button>
      {children}
    </div>
  );
}
