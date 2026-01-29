# AGENTS.md

## Commands

```bash
# Development
pnpm dev                    # Build registry + start dev server (turbopack)
pnpm build                  # Build registry + production build
pnpm lint                   # Biome check
pnpm lint:fix               # Biome check --write
pnpm registry:build         # npx shadcn@latest build

# File-scoped validation
pnpm biome check src/components/ui/component.tsx
pnpm tsc --noEmit
```

## Tech Stack

- Next.js 16.0.10, React 19.2.3, TypeScript 5.4.5
- Tailwind CSS 4.1.18 (v4 syntax, `@import "tailwindcss"`)
- Radix UI 1.4.3 (unified `radix-ui` package)
- Recharts 2.15.4, class-variance-authority 0.7.1
- Biome 1.9.4 (linting + formatting)
- pnpm 9.15.2, Node.js ≥22

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (registry)/         # Registry routes (/, /registry/[name])
│   ├── demo/[name]/        # Component demo pages
│   └── globals.css         # Global styles + CSS variables
├── components/
│   ├── ui/                 # shadcn base components (46 components)
│   └── registry/           # Site-specific registry components
├── lib/
│   └── utils.ts            # cn() utility + helpers
└── hooks/                  # Custom hooks
registry.json               # Component manifest (CRITICAL)
components.json             # shadcn CLI config
public/r/                   # Generated registry JSON (DO NOT EDIT)
```

## Code Style

### Component Pattern (React 19)

```tsx
"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

function ComponentName({
  className,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="component-name"
      className={cn("base-classes", className)}
      {...props}
    />
  );
}

export { ComponentName };
```

### Import Patterns

```tsx
// ✅ Correct - unified radix-ui package
import { Progress as ProgressPrimitive } from "radix-ui";

// ❌ Wrong - individual packages not installed
import * as ProgressPrimitive from "@radix-ui/react-progress";

// ✅ Correct - path aliases
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ❌ Wrong - relative imports break in user projects
import { cn } from "../../lib/utils";
```

### CSS Variables

Use shadcn semantic variables with OKLCH format:

```tsx
// ✅ Correct
className="bg-primary text-primary-foreground"
className="bg-muted text-muted-foreground"

// ❌ Wrong - hardcoded colors
className="bg-blue-500 text-white"
```

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Run `pnpm lint && pnpm build` before committing

## Boundaries

**Always:** Use `"use client"` for stateful components | `@/` path aliases | `cn()` for classes | `data-slot` attributes | Update `registry.json` when adding components | Run `pnpm build` to verify

**Ask First:** Adding npm dependencies | Modifying `registry.json` structure | Changing component APIs | Modifying CSS variables

**Never:** Use relative imports | Import from `@radix-ui/react-*` (use `radix-ui`) | Edit `public/r/` | Use `npm` (use `pnpm`) | Hardcode colors | Skip TypeScript types

## Gotchas

- **Radix Import**: Uses unified `radix-ui` package, NOT `@radix-ui/react-*`
- **Demo Items**: `registry.json` has demo template items (pointing to `registry-starter.vercel.app`) that need replacement
- **Biome Ignores**: `public/r/` and `components/ui/` excluded from linting
- **shadcn Style**: Uses `new-york` style variant
- **Build Output**: `pnpm build` generates `public/r/*.json` from `registry.json`
