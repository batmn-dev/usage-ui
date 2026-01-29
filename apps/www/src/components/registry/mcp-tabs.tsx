"use client";

import { Check, ClipboardIcon } from "lucide-react";
import * as React from "react";

import { AddToCursor } from "@/components/registry/add-to-cursor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function MCPTabs({ rootUrl }: { rootUrl: string }) {
  // Track mount state to prevent hydration mismatch with Radix Tabs
  const [mounted, setMounted] = React.useState(false);
  const [tab, setTab] = React.useState("cursor");
  const [hasCopied, setHasCopied] = React.useState(false);

  const mcp = {
    command: "npx -y shadcn@canary registry:mcp",
    env: {
      REGISTRY_URL: `https://${rootUrl}/r/registry.json`,
    },
  };

  const mcpServer = JSON.stringify(
    {
      mcpServers: {
        shadcn: mcp,
      },
    },
    null,
    2,
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (hasCopied) {
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  }, [hasCopied]);

  // Show skeleton during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="cursor">Cursor</TabsTrigger>
          <TabsTrigger value="windsurf">Windsurf</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="cursor">
        <p className="text-muted-foreground text-sm">
          Click Add to Cursor or copy and paste the code into{" "}
          <code className="inline text-sm tabular-nums">.cursor/mcp.json</code>
        </p>
      </TabsContent>

      <TabsContent value="windsurf">
        <p className="text-muted-foreground text-sm">
          Copy and paste the code into{" "}
          <code className="inline text-sm tabular-nums">
            .codeium/windsurf/mcp_config.json
          </code>
        </p>
      </TabsContent>

      <div className="relative">
        <div className="absolute top-3 right-3 flex gap-2">
          {tab === "cursor" && <AddToCursor mcp={mcp} />}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              copyToClipboard(mcpServer);
              setHasCopied(true);
            }}
            className="shadow-none"
          >
            {hasCopied ? <Check /> : <ClipboardIcon />}
            Copy
          </Button>
        </div>

        <pre className="mt-16 overflow-x-auto rounded-lg border bg-muted p-1 sm:mt-0">
          <code className="relative rounded bg-transparent p-1 font-mono text-muted-foreground text-sm">
            {mcpServer}
          </code>
        </pre>
      </div>
    </Tabs>
  );
}
