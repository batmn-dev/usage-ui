# Workflow: Implement Component Documentation Redesign

> Step-by-step procedure for implementing the enhanced component documentation system based on ADR-005 decisions.

**Based on:** ADR-005: Component Documentation and Preview Strategy  
**Reference:** `.agents/context/research/prompt-kit-component-page-analysis.md`

---

## Prerequisites

- [ ] Monorepo setup is complete (Phase 0 in ARCHITECTURE.md)
- [ ] At least one component exists in `packages/ui/src/components/registry/`
- [ ] Current `pnpm build` passes without errors
- [ ] Familiarity with ADR-005 decisions

---

## Phase Overview

| Phase | Objective | Complexity | Estimated Files |
|-------|-----------|------------|-----------------|
| 1 | Infrastructure Setup | Medium | 4-5 new files |
| 2 | Core Documentation Components | High | 4 new components |
| 3 | Page Layout Components | Medium | 3 new components |
| 4 | Preview System | Medium | 2-3 files |
| 5 | Documentation Migration | Medium | Template + 1 pilot |
| 6 | Validation & Documentation | Low | 2 workflow updates |

---

## Phase 1: Infrastructure Setup

### Objective
Set up the foundational dependencies and utilities for syntax highlighting and source code extraction.

### Prerequisites
- [ ] `pnpm build` passes

### 1.1 Add Dependencies

```bash
# Add Shiki for syntax highlighting
pnpm add shiki --filter=@usage-ui/www

# Add MDX support
pnpm add @next/mdx @mdx-js/loader @mdx-js/react --filter=@usage-ui/www

# Add types for MDX
pnpm add -D @types/mdx --filter=@usage-ui/www
```

### 1.2 Create Code Extraction Utility

**Create:** `apps/www/src/lib/code.ts`

```typescript
import fs from "node:fs"
import path from "node:path"
import { cache } from "react"

/**
 * Extract source code from a file path at build time.
 * Uses React cache for deduplication during SSG.
 * 
 * @param filePath - Relative path from packages/ui/
 * @returns The file contents as a string
 */
export const extractCodeFromFilePath = cache((filePath: string): string => {
  const absolutePath = path.join(process.cwd(), "..", "ui", filePath)
  
  try {
    return fs.readFileSync(absolutePath, "utf-8")
  } catch (error) {
    console.error(`Failed to read file: ${absolutePath}`)
    return `// Error: Could not load source code for ${filePath}`
  }
})

/**
 * Extract source code for a registry component by name.
 * Looks up the path in registry.json and reads the file.
 * 
 * @param componentName - The component name from registry.json
 * @returns The source code string
 */
export const getComponentSource = cache((componentName: string): string => {
  const registryPath = path.join(process.cwd(), "..", "ui", "registry.json")
  
  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"))
    const item = registry.items.find((i: { name: string }) => i.name === componentName)
    
    if (!item || !item.files?.[0]?.path) {
      return `// Component "${componentName}" not found in registry`
    }
    
    return extractCodeFromFilePath(item.files[0].path)
  } catch (error) {
    return `// Error loading registry for "${componentName}"`
  }
})
```

### 1.3 Create Shiki Highlighter Singleton

**Create:** `apps/www/src/lib/shiki.ts`

```typescript
import { createHighlighter, type Highlighter } from "shiki"
import { cache } from "react"

let highlighterPromise: Promise<Highlighter> | null = null

/**
 * Get or create the Shiki highlighter singleton.
 * Loads github-light and github-dark themes.
 */
export const getHighlighter = cache(async (): Promise<Highlighter> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["typescript", "tsx", "javascript", "jsx", "bash", "json", "css"],
    })
  }
  return highlighterPromise
})

/**
 * Highlight code with Shiki.
 * Returns HTML string with syntax highlighting.
 * 
 * @param code - The source code to highlight
 * @param lang - The language for syntax highlighting
 */
export const highlightCode = cache(
  async (code: string, lang: string = "tsx"): Promise<string> => {
    const highlighter = await getHighlighter()
    
    return highlighter.codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    })
  }
)
```

### 1.4 Configure MDX in Next.js

**Update:** `apps/www/next.config.ts`

```typescript
import createMDX from "@next/mdx"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // ... existing config
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
```

### 1.5 Create MDX Components Configuration

**Create:** `apps/www/src/mdx-components.tsx`

```tsx
import type { MDXComponents } from "mdx/types"

// Import documentation components (created in Phase 2)
// import { ComponentCodePreview } from "@/components/docs/component-code-preview"
// import { ApiTable } from "@/components/docs/api-table"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override default elements with custom styling
    h1: ({ children }) => (
      <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 scroll-m-20 border-b pb-2 text-xl font-medium tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 scroll-m-20 text-lg font-medium tracking-tight">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
    ),
    code: ({ children }) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
        {children}
      </code>
    ),
    // Add custom components (uncomment when created)
    // ComponentCodePreview,
    // ApiTable,
    ...components,
  }
}
```

### 1.6 Create Props Extraction Utility

**Create:** `apps/www/src/lib/extract-props.ts`

This utility extracts TypeScript interface definitions and JSDoc comments from component files for auto-generated API documentation.

```typescript
import fs from "node:fs"
import path from "node:path"
import { cache } from "react"

export interface PropInfo {
  prop: string
  type: string
  default?: string
  required: boolean
  description?: string
}

export interface ComponentDoc {
  displayName: string
  description?: string
  props: PropInfo[]
}

/**
 * Extract props for a registry component by name.
 */
export const getComponentProps = cache((componentName: string): ComponentDoc[] => {
  // Implementation reads from packages/ui/registry.json
  // then parses the TypeScript file for interface definitions
  // See full implementation in apps/www/src/lib/extract-props.ts
})

/**
 * Convert PropInfo to ApiTable-compatible format.
 */
export function formatPropsForApiTable(props: PropInfo[]) {
  return props.map((p) => ({
    prop: p.prop,
    type: p.type,
    default: p.required ? "Required" : p.default || "—",
    description: p.description,
  }))
}
```

**JSDoc Convention:** Document component props with JSDoc comments:

```typescript
interface UsageMeterProps {
  /** Current value (required) */
  value: number
  /** Maximum value (default: 100) */
  max?: number
}
```

### Validation Steps

```bash
# Verify dependencies installed
pnpm ls shiki --filter=@usage-ui/www
pnpm ls @next/mdx --filter=@usage-ui/www

# Verify build still works
pnpm build --filter=@usage-ui/www

# Verify dev server starts
pnpm dev --filter=@usage-ui/www
```

---

## Phase 2: Core Documentation Components

### Objective
Build the primary components for displaying component documentation with code previews.

### Prerequisites
- [ ] Phase 1 complete
- [ ] Shiki and MDX dependencies installed

### 2.1 Create Components Directory

```bash
mkdir -p apps/www/src/components/docs
```

### 2.2 Build CodeRenderer Component

**Create:** `apps/www/src/components/docs/code-renderer.tsx`

```tsx
import { highlightCode } from "@/lib/shiki"

interface CodeRendererProps {
  code: string
  lang?: string
  className?: string
}

export async function CodeRenderer({
  code,
  lang = "tsx",
  className,
}: CodeRendererProps) {
  const html = await highlightCode(code, lang)

  return (
    <div
      className={cn(
        "not-prose overflow-auto rounded-md border bg-background p-4 text-[13px]",
        // Theme-aware styling for Shiki output
        "[&_pre]:!bg-transparent [&_code]:!bg-transparent",
        "dark:[&_span]:!text-[var(--shiki-dark)]",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

### 2.3 Build ClientCodeWrapper Component

**Create:** `apps/www/src/components/docs/client-code-wrapper.tsx`

```tsx
"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ClientCodeWrapperProps {
  code: string
  children: React.ReactNode
  className?: string
}

export function ClientCodeWrapper({
  code,
  children,
  className,
}: ClientCodeWrapperProps) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("group relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={copyToClipboard}
      >
        <div className="relative h-4 w-4">
          <Copy
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-300",
              copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          />
          <Check
            className={cn(
              "absolute inset-0 h-4 w-4 text-green-500 transition-all duration-300",
              copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          />
        </div>
      </Button>
      {children}
    </div>
  )
}
```

### 2.4 Build ComponentCodePreview Component

**Create:** `apps/www/src/components/docs/component-code-preview.tsx`

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "radix-ui"
import { cn } from "@/lib/utils"
import { CodeRenderer } from "./code-renderer"
import { ClientCodeWrapper } from "./client-code-wrapper"

interface ComponentCodePreviewProps {
  name: string
  code: string
  children: React.ReactNode
  className?: string
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
            "relative inline-flex h-10 items-center justify-center px-4 py-1 pt-2 pb-3",
            "text-sm font-medium text-muted-foreground",
            "data-[state=active]:text-foreground",
            "transition-none focus-visible:outline-none"
          )}
        >
          <TabIndicator />
          Preview
        </Tabs.Trigger>
        <Tabs.Trigger
          value="code"
          className={cn(
            "relative inline-flex h-10 items-center justify-center px-4 py-1 pt-2 pb-3",
            "text-sm font-medium text-muted-foreground",
            "data-[state=active]:text-foreground",
            "transition-none focus-visible:outline-none"
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
  )
}

// Animated underline indicator for active tab
function TabIndicator() {
  return (
    <div className="absolute bottom-0 flex h-0.5 w-full justify-center opacity-0 data-[state=active]:opacity-100 transition-opacity">
      <div className="h-0.5 w-4/5 bg-foreground" />
    </div>
  )
}
```

### 2.5 Build ApiTable Component

**Create:** `apps/www/src/components/docs/api-table.tsx`

```tsx
import { cn } from "@/lib/utils"

interface ApiTableProps {
  data: Array<{
    prop: string
    type: string
    default?: string
    description?: string
  }>
  className?: string
}

export function ApiTable({ data, className }: ApiTableProps) {
  return (
    <div
      className={cn(
        "not-prose relative w-full overflow-auto rounded-lg border text-sm",
        className
      )}
    >
      <table className="w-full">
        <thead className="bg-secondary text-foreground">
          <tr className="h-10">
            <th className="px-4 pb-0 text-left align-middle font-[450]">
              Prop
            </th>
            <th className="px-4 pb-0 text-left align-middle font-[450]">
              Type
            </th>
            <th className="px-4 pb-0 text-left align-middle font-[450]">
              Default
            </th>
            {data.some((row) => row.description) && (
              <th className="px-4 pb-0 text-left align-middle font-[450]">
                Description
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={row.prop} className="h-10">
              <td className="px-4 py-2 text-left align-middle font-mono text-sm">
                {row.prop}
              </td>
              <td className="px-4 py-2 text-left align-middle font-mono text-sm text-muted-foreground">
                {row.type}
              </td>
              <td className="px-4 py-2 text-left align-middle font-mono text-sm">
                {row.default || "—"}
              </td>
              {data.some((r) => r.description) && (
                <td className="px-4 py-2 text-left align-middle">
                  {row.description}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 2.6 Create Index Export

**Create:** `apps/www/src/components/docs/index.ts`

```typescript
export { CodeRenderer } from "./code-renderer"
export { ClientCodeWrapper } from "./client-code-wrapper"
export { ComponentCodePreview } from "./component-code-preview"
export { ApiTable } from "./api-table"
```

### Validation Steps

```bash
# Type check the new components
pnpm typecheck --filter=@usage-ui/www

# Lint the new components
pnpm lint --filter=@usage-ui/www

# Build to verify no compilation errors
pnpm build --filter=@usage-ui/www
```

---

## Phase 3: Page Layout Components

### Objective
Build navigation and installation components for complete documentation pages.

### Prerequisites
- [ ] Phase 2 complete
- [ ] Core documentation components working

### 3.1 Build ComponentNav Component

**Create:** `apps/www/src/components/docs/component-nav.tsx`

```tsx
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRegistryItems } from "@/lib/registry"

interface ComponentNavProps {
  currentName: string
  className?: string
}

export function ComponentNav({ currentName, className }: ComponentNavProps) {
  const items = getRegistryItems()
  const currentIndex = items.findIndex((item) => item.name === currentName)
  
  const prev = currentIndex > 0 ? items[currentIndex - 1] : null
  const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null

  return (
    <div className={cn("flex justify-between pt-12 pb-20", className)}>
      {prev ? (
        <Link
          href={`/docs/${prev.name}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5",
            "text-sm text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {prev.title}
        </Link>
      ) : (
        <div />
      )}
      
      {next ? (
        <Link
          href={`/docs/${next.name}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5",
            "text-sm text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground"
          )}
        >
          {next.title}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
```

### 3.2 Build InstallationTabs Component

**Create:** `apps/www/src/components/docs/installation-tabs.tsx`

```tsx
"use client"

import * as React from "react"
import { Tabs } from "radix-ui"
import { cn } from "@/lib/utils"
import { ClientCodeWrapper } from "./client-code-wrapper"

interface InstallationTabsProps {
  componentName: string
  registryUrl?: string
  className?: string
}

export function InstallationTabs({
  componentName,
  registryUrl = "https://usage-ui.vercel.app",
  className,
}: InstallationTabsProps) {
  const cliCommand = `npx shadcn add ${registryUrl}/r/${componentName}.json`
  
  return (
    <Tabs.Root defaultValue="cli" className={cn("w-full", className)}>
      <Tabs.List className="inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-muted p-1">
        <Tabs.Trigger
          value="cli"
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5",
            "text-sm font-medium transition-colors",
            "data-[state=active]:bg-background data-[state=active]:shadow-sm",
            "data-[state=inactive]:text-muted-foreground"
          )}
        >
          CLI
        </Tabs.Trigger>
        <Tabs.Trigger
          value="manual"
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5",
            "text-sm font-medium transition-colors",
            "data-[state=active]:bg-background data-[state=active]:shadow-sm",
            "data-[state=inactive]:text-muted-foreground"
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
          <p className="text-sm text-muted-foreground">
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
  )
}
```

### 3.3 Add Prose Typography to Globals

**Update:** `apps/www/src/app/globals.css`

Add the following prose configuration:

```css
/* Documentation Prose Typography */
@layer components {
  .prose-docs {
    @apply prose prose-neutral dark:prose-invert max-w-none;
    
    /* Headings */
    @apply prose-h1:scroll-m-20 prose-h1:text-3xl prose-h1:font-semibold prose-h1:tracking-tight;
    @apply prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:border-b prose-h2:pb-2 prose-h2:text-xl prose-h2:font-medium;
    @apply prose-h3:mt-8 prose-h3:scroll-m-20 prose-h3:text-lg prose-h3:font-medium;
    
    /* Content */
    @apply prose-p:leading-7;
    @apply prose-strong:font-medium;
    @apply prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-sm;
    @apply prose-code:before:content-none prose-code:after:content-none;
    
    /* Tables */
    @apply prose-table:block prose-table:overflow-y-auto;
    
    /* Images */
    @apply prose-img:m-0 prose-img:rounded-md;
  }
}
```

### 3.4 Update Index Export

**Update:** `apps/www/src/components/docs/index.ts`

```typescript
export { CodeRenderer } from "./code-renderer"
export { ClientCodeWrapper } from "./client-code-wrapper"
export { ComponentCodePreview } from "./component-code-preview"
export { ApiTable } from "./api-table"
export { ComponentNav } from "./component-nav"
export { InstallationTabs } from "./installation-tabs"
```

### Validation Steps

```bash
# Type check
pnpm typecheck --filter=@usage-ui/www

# Lint
pnpm lint --filter=@usage-ui/www

# Build
pnpm build --filter=@usage-ui/www
```

---

## Phase 4: Preview System

### Objective
Implement hybrid preview rendering based on component type (iframe for blocks, direct for UI components).

### Prerequisites
- [ ] Phase 3 complete
- [ ] Core and layout components working

### 4.1 Build ComponentPreview Wrapper

**Create:** `apps/www/src/components/docs/component-preview.tsx`

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ComponentPreviewProps {
  name: string
  type: "registry:component" | "registry:block"
  children?: React.ReactNode
  className?: string
}

export function ComponentPreview({
  name,
  type,
  children,
  className,
}: ComponentPreviewProps) {
  const isBlock = type === "registry:block"

  if (isBlock) {
    return (
      <div className={cn("w-full", className)}>
        <iframe
          src={`/demo/${name}`}
          className="h-[800px] w-full rounded-md border"
          title={`${name} preview`}
        />
      </div>
    )
  }

  // Direct rendering for UI components
  return (
    <div
      className={cn(
        "flex min-h-[350px] w-full items-center justify-center rounded-md border p-8",
        className
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
  )
}
```

### 4.2 Create Preview Error Boundary

**Create:** `apps/www/src/components/docs/preview-error-boundary.tsx`

```tsx
"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PreviewErrorBoundaryProps {
  children: React.ReactNode
}

interface PreviewErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class PreviewErrorBoundary extends React.Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  constructor(props: PreviewErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preview Error</AlertTitle>
          <AlertDescription>
            Failed to render component preview.
            {this.state.error && (
              <pre className="mt-2 text-xs">{this.state.error.message}</pre>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}
```

### 4.3 Update Index Export

**Update:** `apps/www/src/components/docs/index.ts`

```typescript
export { CodeRenderer } from "./code-renderer"
export { ClientCodeWrapper } from "./client-code-wrapper"
export { ComponentCodePreview } from "./component-code-preview"
export { ApiTable } from "./api-table"
export { ComponentNav } from "./component-nav"
export { InstallationTabs } from "./installation-tabs"
export { ComponentPreview } from "./component-preview"
export { PreviewErrorBoundary } from "./preview-error-boundary"
```

### Validation Steps

```bash
# Type check
pnpm typecheck --filter=@usage-ui/www

# Build
pnpm build --filter=@usage-ui/www

# Start dev server and test preview rendering
pnpm dev --filter=@usage-ui/www
```

---

## Phase 5: Documentation Migration

### Objective
Create MDX template and migrate one component as a pilot.

### Prerequisites
- [ ] Phase 4 complete
- [ ] All documentation components working
- [ ] At least one component exists in the registry

### 5.1 Create Docs Route Structure

```bash
# Create docs directory structure
mkdir -p apps/www/src/app/docs
mkdir -p apps/www/src/content/docs
```

### 5.2 Create Docs Layout

**Create:** `apps/www/src/app/docs/layout.tsx`

```tsx
import { RegistrySidebar } from "@/components/registry/registry-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative mx-auto grid w-full max-w-screen-2xl grid-cols-6 md:grid-cols-12">
      {/* Sidebar */}
      <aside className="col-span-6 border-r md:col-span-3 lg:col-span-2">
        <RegistrySidebar />
      </aside>
      
      {/* Main content */}
      <main className="col-span-6 md:col-span-9 lg:col-span-8">
        <div className="px-6 py-10 lg:px-10">
          <div className="prose-docs">{children}</div>
        </div>
      </main>
    </div>
  )
}
```

### 5.3 Create MDX Documentation Template

**Create:** `apps/www/src/app/docs/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation"
import { getRegistryItem, getRegistryItems } from "@/lib/registry"
import { getComponentSource } from "@/lib/code"
import {
  ComponentCodePreview,
  ApiTable,
  ComponentNav,
  InstallationTabs,
  ComponentPreview,
  PreviewErrorBoundary,
} from "@/components/docs"

export async function generateStaticParams() {
  const items = getRegistryItems()
  return items.map((item) => ({ slug: item.name }))
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const component = getRegistryItem(slug)

  if (!component) {
    notFound()
  }

  const sourceCode = getComponentSource(slug)

  return (
    <>
      {/* Header */}
      <h1>{component.title}</h1>
      <p className="text-lg text-muted-foreground">{component.description}</p>

      {/* Examples Section */}
      <h2>Examples</h2>
      
      <h3>Basic</h3>
      <ComponentCodePreview name={slug} code={sourceCode}>
        <PreviewErrorBoundary>
          <ComponentPreview name={slug} type={component.type}>
            {/* Dynamic preview would be imported here */}
          </ComponentPreview>
        </PreviewErrorBoundary>
      </ComponentCodePreview>

      {/* Installation Section */}
      <h2>Installation</h2>
      <InstallationTabs componentName={slug} />

      {/* API Reference Section */}
      <h2>API Reference</h2>
      <h3>{component.title}</h3>
      
      {/* 
        API table data would come from MDX or be generated.
        For now, show placeholder with instructions.
      */}
      <ApiTable
        data={[
          {
            prop: "value",
            type: "number",
            default: "Required",
            description: "The current value",
          },
          {
            prop: "max",
            type: "number",
            default: "100",
            description: "The maximum value",
          },
          {
            prop: "variant",
            type: '"default" | "success" | "warning" | "danger"',
            default: '"default"',
            description: "Visual variant",
          },
        ]}
      />

      {/* Navigation */}
      <ComponentNav currentName={slug} />
    </>
  )
}
```

### 5.4 Create Example MDX Documentation

**Create:** `apps/www/src/content/docs/usage-meter.mdx`

```mdx
---
title: Usage Meter
description: A linear progress meter for displaying usage/quota with accessibility support.
---

# Usage Meter

A linear progress meter component for displaying usage and quota information. Available in both Radix (accessible) and Base (lightweight) versions.

## Examples

### Basic Usage

<ComponentCodePreview name="usage-meter">
  {/* Preview content */}
</ComponentCodePreview>

### With Variants

The meter supports four variants: `default`, `success`, `warning`, and `danger`.

<ComponentCodePreview name="usage-meter-variants">
  {/* Preview content */}
</ComponentCodePreview>

## Installation

<InstallationTabs componentName="usage-meter" />

## Usage

```tsx
import { UsageMeter } from "@/components/ui/usage-meter"

export function MyComponent() {
  return (
    <UsageMeter
      value={75}
      max={100}
      variant="warning"
      label="API Requests"
    />
  )
}
```

## API Reference

### UsageMeter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | Required | Current usage value |
| `max` | `number` | `100` | Maximum value |
| `variant` | `"default" \| "success" \| "warning" \| "danger"` | `"default"` | Visual variant |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Size variant |
| `label` | `string` | — | Optional label text |
| `showPercentage` | `boolean` | `true` | Show percentage text |

### UsageMeterBase

Same props as `UsageMeter`, but without Radix dependency.

## Accessibility

The Radix version includes full accessibility support:
- Proper `role="progressbar"` semantics
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes
- `aria-valuetext` for screen readers
```

### Validation Steps

```bash
# Type check
pnpm typecheck --filter=@usage-ui/www

# Build
pnpm build --filter=@usage-ui/www

# Start dev server
pnpm dev --filter=@usage-ui/www

# Visit http://localhost:3000/docs/usage-meter
```

---

## Phase 6: Validation & Documentation

### Objective
Update workflows and run full validation.

### Prerequisites
- [ ] Phase 5 complete
- [ ] Pilot documentation page working

### 6.1 Update add-registry-component.md Workflow

**Update:** `.agents/workflows/add-registry-component.md`

Add to the validation checklist:

```markdown
### 9. Create Documentation Page (After Component Complete)

**Create:** `apps/www/src/content/docs/[component-name].mdx`

Use the MDX template:

\`\`\`mdx
---
title: Component Name
description: Brief description of the component.
---

# Component Name

[Description paragraph]

## Examples

### Basic Usage

<ComponentCodePreview name="component-name">
  {/* Preview content */}
</ComponentCodePreview>

## Installation

<InstallationTabs componentName="component-name" />

## API Reference

### ComponentName

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| ... | ... | ... | ... |
\`\`\`
```

### 6.2 Create add-component-documentation.md Workflow

**Create:** `.agents/workflows/add-component-documentation.md`

```markdown
# Workflow: Add Component Documentation

> Step-by-step procedure for adding documentation to an existing registry component.

---

## Prerequisites

- [ ] Component exists in `packages/ui/src/components/registry/`
- [ ] Component is registered in `packages/ui/registry.json`
- [ ] Documentation infrastructure is set up (Phase 1-4 complete)

---

## Steps

### 1. Create MDX File

\`\`\`bash
touch apps/www/src/content/docs/[component-name].mdx
\`\`\`

### 2. Add Frontmatter

\`\`\`mdx
---
title: Component Name
description: Brief description of the component.
---
\`\`\`

### 3. Write Documentation Sections

Include these sections in order:

1. **Title & Description** - H1 and intro paragraph
2. **Examples** - ComponentCodePreview for each variant
3. **Installation** - InstallationTabs component
4. **Usage** - Code example with import
5. **API Reference** - Props table for each exported component
6. **Accessibility** (if applicable) - ARIA details

### 4. Add Props Documentation

Document all props in the API Reference table:

| Column | Content |
|--------|---------|
| Prop | Prop name in backticks |
| Type | TypeScript type |
| Default | Default value or "Required" |
| Description | Brief description |

### 5. Verify Documentation

\`\`\`bash
# Start dev server
pnpm dev --filter=@usage-ui/www

# Visit the page
open http://localhost:3000/docs/[component-name]
\`\`\`

### 6. Build and Test

\`\`\`bash
pnpm build --filter=@usage-ui/www
\`\`\`

---

## Validation Checklist

- [ ] MDX file exists at correct path
- [ ] Frontmatter has title and description
- [ ] Examples section shows component in action
- [ ] Installation section uses InstallationTabs
- [ ] API Reference documents all exported components
- [ ] All props are documented with types
- [ ] Page renders without errors
- [ ] Build succeeds

---

## Troubleshooting

### MDX not rendering

**Cause**: MDX loader not configured or file extension wrong.

**Fix**: Verify `next.config.ts` has MDX configuration and file uses `.mdx` extension.

### Component preview not showing

**Cause**: Preview component not imported or type mismatch.

**Fix**: Ensure ComponentPreview receives correct `type` prop.

### Props table not displaying

**Cause**: ApiTable data array malformed.

**Fix**: Verify each row has `prop`, `type`, and `default` fields.
```

### 6.3 Run Full Validation

```bash
# Full validation suite
pnpm lint && pnpm typecheck && pnpm build

# Start dev server and test
pnpm dev

# Verify in browser:
# - http://localhost:3000 (home)
# - http://localhost:3000/docs/[component] (docs page)
# - http://localhost:3000/registry/[component] (legacy)
```

### 6.4 Create Changeset

```bash
pnpm changeset

# Select @usage-ui/www
# Choose: minor
# Description: Add component documentation system with MDX, Shiki highlighting, and preview/code tabs
```

---

## Validation Checklist

### Phase 1: Infrastructure
- [ ] Shiki installed and working
- [ ] MDX dependencies installed
- [ ] `lib/code.ts` extracts source code
- [ ] `lib/shiki.ts` highlights code
- [ ] `mdx-components.tsx` configured
- [ ] `next.config.ts` updated for MDX

### Phase 2: Core Components
- [ ] `CodeRenderer` highlights code with themes
- [ ] `ClientCodeWrapper` has working copy button
- [ ] `ComponentCodePreview` switches between tabs
- [ ] `ApiTable` renders props documentation

### Phase 3: Layout Components
- [ ] `ComponentNav` shows previous/next links
- [ ] `InstallationTabs` shows CLI/Manual options
- [ ] Prose typography applied

### Phase 4: Preview System
- [ ] `ComponentPreview` handles both types
- [ ] Blocks render in iframe
- [ ] Components render directly
- [ ] Error boundary catches failures

### Phase 5: Migration
- [ ] Docs route structure created
- [ ] Template page working
- [ ] One component documented as pilot

### Phase 6: Final
- [ ] Workflows updated
- [ ] Full build passes
- [ ] Changeset created

---

## Troubleshooting

### Shiki theme not working in dark mode

**Cause**: CSS not applying theme variables correctly.

**Fix**: Ensure `dark:[&_span]:!text-[var(--shiki-dark)]` is applied to code container.

### MDX not rendering custom components

**Cause**: Components not exported from `mdx-components.tsx`.

**Fix**: Add components to the return object in `useMDXComponents`.

### Source code extraction failing

**Cause**: Path resolution issue in monorepo.

**Fix**: Verify `path.join` uses correct relative paths from `apps/www` to `packages/ui`.

### Build fails with "Cannot find module"

**Cause**: Missing peer dependencies or incorrect imports.

**Fix**: Run `pnpm install` and verify all imports use `@/` aliases.

### Preview shows "not available"

**Cause**: Component type not detected or children not passed.

**Fix**: Verify registry.json has correct `type` field and preview content is provided.

---

## References

- ADR-005: `.agents/context/decisions/005-component-documentation-strategy.md`
- Research: `.agents/context/research/prompt-kit-component-page-analysis.md`
- Monorepo Ops: `.agents/workflows/monorepo-operations.md`
- Component Creation: `.agents/workflows/add-registry-component.md`
