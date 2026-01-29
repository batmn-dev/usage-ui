# CLAUDE.md

> A shadcn/ui component registry for usage meters and quota visualization, structured as a monorepo.

## Project Overview

This is a **shadcn-style component registry** (not an npm package) built as a **monorepo**. Components are distributed via the shadcn CLI and copied into user projects. Users own and modify the code.

```bash
# How users install components
npx shadcn add https://usage-ui.vercel.app/r/usage-meter.json
```

## Monorepo Structure

```
usage-ui/
├── apps/
│   └── www/                    # Documentation + demo site (Next.js)
│       ├── src/app/            # Pages, globals.css
│       ├── src/components/     # Site-specific components
│       └── public/r/           # Generated registry JSON
│
├── packages/
│   └── ui/                     # Component registry package
│       ├── src/components/
│       │   ├── ui/             # Base shadcn components (46+)
│       │   └── registry/       # YOUR meter components go here
│       ├── src/lib/            # Utilities (cn, etc.)
│       ├── src/styles/         # Shared CSS variables
│       ├── registry.json       # Component manifest (CRITICAL)
│       └── components.json     # shadcn CLI config
│
├── tooling/                    # Shared configs
├── turbo.json                  # Build orchestration
├── pnpm-workspace.yaml         # Workspace definition
└── lefthook.yml                # Git hooks
```

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Framework**: Next.js 16 (App Router, RSC, Turbopack)
- **React**: 19.2.3
- **TypeScript**: 5.4.5 (strict)
- **Styling**: Tailwind CSS v4.1.18, OKLCH color space
- **Primitives**: radix-ui 1.4.3 (unified package)
- **Data Viz**: Tremor + Recharts
- **Linting**: Biome
- **Versioning**: Changesets
- **Package Manager**: pnpm 9.15.2

## Critical Files

| File | Location | Risk |
|------|----------|------|
| `registry.json` | `packages/ui/` | 🔴 CRITICAL - breaks all installations |
| `components.json` | `packages/ui/` | 🔴 CRITICAL - shadcn CLI config |
| `turbo.json` | Root | 🔴 CRITICAL - build pipeline |
| `globals.css` | `packages/ui/src/styles/` | 🟡 HIGH - CSS variables |

## Common Commands

```bash
# Development (all packages)
pnpm dev                            # Start all dev servers
pnpm build                          # Build all packages
pnpm lint                           # Lint all packages
pnpm typecheck                      # Type check all

# Package-specific
pnpm dev --filter=@usage-ui/www     # Dev docs site only
pnpm build --filter=@usage-ui/ui    # Build UI package only

# Dependencies
pnpm add <pkg> --filter=@usage-ui/ui    # Add to UI package
pnpm add -D <pkg> -w                    # Add to root

# Versioning
pnpm changeset                      # Create changeset
```

## Coding Conventions

### Component Pattern

```tsx
"use client"  // Only if using hooks/state/Radix

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const meterVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", success: "...", warning: "...", danger: "..." },
    size: { sm: "h-2", default: "h-3", lg: "h-4" }
  },
  defaultVariants: { variant: "default", size: "default" }
})

interface UsageMeterProps extends VariantProps<typeof meterVariants> {
  value: number
  max?: number
}

function UsageMeter({ value, max = 100, variant, size, className }: UsageMeterProps) {
  return (
    <div
      data-slot="usage-meter"
      className={cn(meterVariants({ variant, size }), className)}
    />
  )
}

export { UsageMeter, meterVariants }
export type { UsageMeterProps }
```

### Key Rules

- **Imports**: Always use `@/` path aliases, never relative imports
- **Exports**: Named exports only, export types alongside components
- **Styling**: Use CSS variables (`bg-primary`), never hardcoded colors
- **Server Components**: Default to RSC, add `"use client"` only when needed
- **Data Slot**: Add `data-slot="name"` for styling hooks
- **Dual Versions**: Core meters need both Radix and Base versions

## Component Locations

| Type | Location |
|------|----------|
| Your meter components | `packages/ui/src/components/registry/` |
| Base shadcn (don't modify) | `packages/ui/src/components/ui/` |
| Site-specific (docs) | `apps/www/src/components/` |

## Gotchas

1. **OKLCH Colors**: CSS variables use `oklch()` color space
   ```css
   --meter-success: oklch(0.723 0.191 142.5);  /* ✅ Correct */
   ```

2. **Radix Imports**: Use unified package
   ```tsx
   import { Progress } from "radix-ui"           // ✅ Correct
   import * as Progress from "@radix-ui/react-progress"  // ❌ Old style
   ```

3. **Registry Updates**: Always update `packages/ui/registry.json` when adding components

4. **Path Aliases**: Components break in user projects if using relative imports

5. **Turbo Filters**: Use `--filter=@usage-ui/ui` for package-specific commands

## Memory

Facts Claude should remember across sessions:

- This is a **monorepo** with `apps/www` (docs) and `packages/ui` (components)
- Theme uses nature colors (greens/browns) with OKLCH color space
- shadcn CLI style is "new-york"
- Node.js 22+ required
- Core meters need both Radix and Base versions
- Tremor is used for data visualization charts
- See ARCHITECTURE.md for component roadmap and detailed guidance
- See MONOREPO-MIGRATION.md for migration checklist (if not yet migrated)
