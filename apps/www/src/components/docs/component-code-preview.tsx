"use client";

import { cn } from "@/lib/utils";
import { Tabs } from "radix-ui";
import { ClientCodeWrapper } from "./client-code-wrapper";
import { CodeRenderer } from "./code-renderer";

interface ComponentCodePreviewProps {
  name: string;
  code: string;
  children: React.ReactNode;
  className?: string;
}

export function ComponentCodePreview({
  name,
  code,
  children,
  className,
}: ComponentCodePreviewProps) {
  return (
    <Tabs.Root defaultValue="preview" className={cn("w-full", className)}>
      <Tabs.List className="inline-flex h-10 w-full items-center justify-start border-b">
        <Tabs.Trigger
          value="preview"
          className={cn(
            "group relative inline-flex h-10 items-center justify-center px-4 py-1 pt-2 pb-3",
            "font-medium text-muted-foreground text-sm",
            "data-[state=active]:text-foreground",
            "transition-none focus-visible:outline-none",
          )}
        >
          <TabIndicator />
          Preview
        </Tabs.Trigger>
        <Tabs.Trigger
          value="code"
          className={cn(
            "group relative inline-flex h-10 items-center justify-center px-4 py-1 pt-2 pb-3",
            "font-medium text-muted-foreground text-sm",
            "data-[state=active]:text-foreground",
            "transition-none focus-visible:outline-none",
          )}
        >
          <TabIndicator />
          Code
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="preview" className="mt-4">
        <div className="flex min-h-[350px] w-full items-center justify-center rounded-md border p-8">
          <div className="w-full max-w-3xl">{children}</div>
        </div>
      </Tabs.Content>

      <Tabs.Content value="code" className="mt-4">
        <ClientCodeWrapper code={code}>
          <CodeRenderer code={code} />
        </ClientCodeWrapper>
      </Tabs.Content>
    </Tabs.Root>
  );
}

// Animated underline indicator for active tab
function TabIndicator() {
  return (
    <div className="absolute bottom-0 flex h-0.5 w-full justify-center opacity-0 transition-opacity group-data-[state=active]:opacity-100">
      <div className="h-0.5 w-4/5 bg-foreground" />
    </div>
  );
}
