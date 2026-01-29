"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

interface ComponentPreviewProps {
  name: string;
  type: "registry:component" | "registry:block";
  children?: React.ReactNode;
  className?: string;
}

export function ComponentPreview({
  name,
  type,
  children,
  className,
}: ComponentPreviewProps) {
  const isBlock = type === "registry:block";

  if (isBlock) {
    return (
      <div className={cn("w-full", className)}>
        <iframe
          src={`/demo/${name}`}
          className="h-[800px] w-full rounded-md border"
          title={`${name} preview`}
        />
      </div>
    );
  }

  // Direct rendering for UI components
  return (
    <div
      className={cn(
        "flex min-h-[350px] w-full items-center justify-center rounded-md border p-8",
        className,
      )}
    >
      <div className="w-full max-w-3xl">
        {children || (
          <p className="text-center text-muted-foreground">
            Preview not available
          </p>
        )}
      </div>
    </div>
  );
}
