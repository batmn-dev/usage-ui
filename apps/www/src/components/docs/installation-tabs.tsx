"use client";

import { cn } from "@/lib/utils";
import { Tabs } from "radix-ui";
import * as React from "react";
import { ClientCodeWrapper } from "./client-code-wrapper";

interface InstallationTabsProps {
  componentName: string;
  registryUrl?: string;
  className?: string;
}

export function InstallationTabs({
  componentName,
  registryUrl = "https://usage-ui.vercel.app",
  className,
}: InstallationTabsProps) {
  const cliCommand = `npx shadcn add ${registryUrl}/r/${componentName}.json`;

  return (
    <Tabs.Root defaultValue="cli" className={cn("w-full", className)}>
      <Tabs.List className="inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-muted p-1">
        <Tabs.Trigger
          value="cli"
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5",
            "font-medium text-sm transition-colors",
            "data-[state=active]:bg-background data-[state=active]:shadow-sm",
            "data-[state=inactive]:text-muted-foreground",
          )}
        >
          CLI
        </Tabs.Trigger>
        <Tabs.Trigger
          value="manual"
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5",
            "font-medium text-sm transition-colors",
            "data-[state=active]:bg-background data-[state=active]:shadow-sm",
            "data-[state=inactive]:text-muted-foreground",
          )}
        >
          Manual
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="cli" className="mt-4">
        <ClientCodeWrapper code={cliCommand}>
          <pre className="overflow-auto rounded-md border bg-muted p-4 text-sm">
            <code>{cliCommand}</code>
          </pre>
        </ClientCodeWrapper>
      </Tabs.Content>

      <Tabs.Content value="manual" className="mt-4">
        <div className="rounded-md border bg-muted p-4">
          <p className="text-muted-foreground text-sm">
            Copy the component source code from the{" "}
            <a
              href={`${registryUrl}/r/${componentName}.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              registry JSON
            </a>{" "}
            and paste it into your project at{" "}
            <code className="rounded bg-background px-1 py-0.5 text-xs">
              components/ui/{componentName}.tsx
            </code>
          </p>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
