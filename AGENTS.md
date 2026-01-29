# AGENTS.md

Quick reference for AI coding assistants working on Usage UI.

## Monorepo Structure

```
usage-ui/
├── apps/www/               # Docs site (@usage-ui/www)
├── packages/ui/            # Components (@usage-ui/ui)
│   ├── src/components/
│   │   ├── ui/             # Base shadcn (don't modify)
│   │   └── registry/       # YOUR components
│   └── registry.json       # Component manifest
├── tooling/                # Shared configs
├── turbo.json              # Build orchestration
└── pnpm-workspace.yaml     # Workspace definition
```

## Commands

```bash
# All packages
pnpm dev                            # Start dev servers
pnpm build                          # Build all (Turbo cached)
pnpm lint                           # Biome check
pnpm typecheck                      # Type check

# Package-specific
pnpm dev --filter=@usage-ui/www     # Dev docs only
pnpm build --filter=@usage-ui/ui    # Build UI only

# Dependencies
pnpm add <pkg> --filter=@usage-ui/ui    # Add to UI
pnpm add -D <pkg> -w                    # Add to root

# Versioning
pnpm changeset                      # Create changeset
```

## Tech Stack

- **Monorepo**: pnpm 9.15.2 + Turborepo + Changesets
- **Framework**: Next.js 16, React 19, TypeScript 5.4.5
- **Styling**: Tailwind CSS 4.1.18 (OKLCH colors)
- **Primitives**: radix-ui 1.4.3 (unified package)
- **Data Viz**: Tremor + Recharts
- **Linting**: Biome 1.9.4

## Code Style

### Component Pattern

```tsx
"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

interface UsageMeterProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "warning" | "danger";
}

function UsageMeter({ className, variant = "default", ...props }: UsageMeterProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="usage-meter"
      className={cn("relative h-3 w-full overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

export { UsageMeter };
export type { UsageMeterProps };
```

### Import Patterns

```tsx
// ✅ Correct - unified radix-ui package
import { Progress } from "radix-ui";

// ❌ Wrong - individual packages
import * as Progress from "@radix-ui/react-progress";

// ✅ Correct - path aliases
import { cn } from "@/lib/utils";

// ❌ Wrong - relative imports break in user projects
import { cn } from "../../lib/utils";
```

### CSS Variables

```tsx
// ✅ Correct - semantic variables
className="bg-primary text-primary-foreground"
className="bg-[--meter-success]"

// ❌ Wrong - hardcoded colors
className="bg-blue-500 text-white"
```

## Where to Add Code

| Type | Location |
|------|----------|
| New meter components | `packages/ui/src/components/registry/` |
| Component manifest | `packages/ui/registry.json` |
| CSS variables | `packages/ui/src/styles/globals.css` |
| Docs pages | `apps/www/src/app/docs/` |
| Site components | `apps/www/src/components/` |

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Run `pnpm lint && pnpm build` before committing
- Create changeset for notable changes: `pnpm changeset`

## Boundaries

**Always:**
- Use `"use client"` for stateful components
- Use `@/` path aliases
- Use `cn()` for class merging
- Add `data-slot` attributes
- Update `packages/ui/registry.json` when adding components
- Create both Radix and Base versions for core meters
- Export types alongside components
- Run `pnpm build` to verify

**Ask First:**
- Adding npm dependencies
- Modifying registry.json structure
- Changing component APIs
- Modifying CSS variables in globals.css

**Never:**
- Use relative imports
- Import from `@radix-ui/react-*` (use `radix-ui`)
- Edit `apps/www/public/r/` (generated)
- Use `npm` (use `pnpm`)
- Hardcode colors
- Skip TypeScript types
- Modify `packages/ui/src/components/ui/` (base shadcn)

## Gotchas

1. **Turbo Filters**: Always use `--filter=@usage-ui/ui` for package-specific commands
2. **Radix Import**: Uses unified `radix-ui` package, NOT `@radix-ui/react-*`
3. **Registry Location**: `packages/ui/registry.json`, not root
4. **Generated Files**: `apps/www/public/r/` is auto-generated, never edit
5. **Biome Ignores**: `public/r/` and `components/ui/` excluded from linting
6. **shadcn Style**: Uses `new-york` style variant
7. **Dual Versions**: Core meters need both Radix (accessible) and Base (lightweight) versions

## Key Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full roadmap and decision framework
- [MONOREPO-MIGRATION.md](./MONOREPO-MIGRATION.md) - Migration checklist
- [CLAUDE.md](./CLAUDE.md) - Extended AI context

## AI Context Structure

```
.agents/
├── skills/           # Reusable capabilities (HOW to do things)
│   ├── shadcn-ui/    # shadcn/ui patterns and reference
│   └── tailwind-v4-shadcn/  # Tailwind v4 setup
│
├── context/          # Passive knowledge (WHAT things are)
│   ├── glossary.md   # Project terminology
│   ├── research/     # Deep-dive research materials
│   └── decisions/    # Architecture Decision Records (ADRs)
│
└── workflows/        # Step-by-step procedures
    ├── add-registry-component.md
    ├── release-process.md
    └── monorepo-operations.md
```

**Load on-demand**: Skills, context, and workflows are NOT loaded automatically. AI agents fetch them when relevant to the task.
