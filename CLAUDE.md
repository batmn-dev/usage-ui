# CLAUDE.md

> A shadcn/ui component registry for usage meters and quota visualization built with Next.js 15+.

## Project Overview

This is a **shadcn-style component registry** (not an npm package). Components are distributed via the shadcn CLI and copied into user projects. Users own and modify the code.

```bash
# How users install components
npx shadcn add https://registry-starter.vercel.app/r/brand-header.json
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC, Turbopack)
- **React**: 19.2.3
- **TypeScript**: 5.4.5 (strict)
- **Styling**: Tailwind CSS v4.1.18, oklch color space
- **Primitives**: radix-ui 1.4.3 (unified package)
- **Linting**: Biome
- **Package Manager**: pnpm 9.15.2

## Project Structure

```
src/
├── app/
│   ├── (registry)/      # Registry browser pages
│   ├── demo/[name]/     # Component demo pages
│   └── globals.css      # Theme CSS variables (oklch)
├── components/
│   ├── ui/              # shadcn/ui primitives (46+ components)
│   └── registry/        # Registry UI components
├── layouts/             # Shell, minimal layouts
├── lib/                 # Utilities (cn, registry helpers)
└── hooks/               # Custom React hooks
```

## Critical Files

| File | Purpose | Risk |
|------|---------|------|
| `registry.json` | Component manifest - breaking changes break ALL installations | 🔴 HIGH |
| `components.json` | shadcn CLI config | 🔴 HIGH |
| `src/app/globals.css` | Theme CSS variables | 🟡 MEDIUM |

## Coding Conventions

### Component Pattern

```tsx
"use client"  // Only if using hooks/state/Radix

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva("base-classes", {
  variants: { variant: { default: "...", destructive: "..." } },
  defaultVariants: { variant: "default" }
})

function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

### Key Rules

- **Imports**: Always use `@/` path aliases, never relative imports
- **Exports**: Named exports only, no default exports
- **Styling**: Use CSS variables (`bg-primary`), never hardcoded colors
- **Server Components**: Default to RSC, add `"use client"` only when needed
- **Data Slot**: Add `data-slot="name"` for styling hooks

## Common Commands

```bash
pnpm dev              # Start dev server (builds registry first)
pnpm build            # Build registry + Next.js
pnpm lint             # Run Biome linter
pnpm registry:build   # Rebuild registry JSON files
```

## Gotchas

1. **oklch Colors**: CSS variables use `oklch()` color space, not hex or hsl
   ```css
   --primary: oklch(0.52 0.13 144.17);  /* ✅ Correct */
   --primary: #22c55e;                   /* ❌ Wrong */
   ```

2. **Registry Updates**: Always update `registry.json` when adding/modifying components

3. **Radix Imports**: Use unified package, not individual packages
   ```tsx
   import { Progress } from "radix-ui"      // ✅ Correct
   import * as Progress from "@radix-ui/react-progress"  // ❌ Old style
   ```

4. **Path Aliases**: Components break when copied if using relative imports
   ```tsx
   import { cn } from "@/lib/utils"     // ✅ Correct
   import { cn } from "../../lib/utils" // ❌ Will break in user projects
   ```

5. **npm vs pnpm**: This project uses pnpm exclusively

## Registry Item Schema

When adding to `registry.json`:

```json
{
  "name": "component-name",
  "type": "registry:component",
  "title": "Human Title",
  "description": "Brief description",
  "registryDependencies": ["button", "card"],
  "dependencies": ["external-package"],
  "files": [
    {
      "path": "src/components/component-name.tsx",
      "type": "registry:component"
    }
  ]
}
```

## Memory

Facts Claude should remember across sessions:

- This registry currently targets usage meters and quota visualization (see ARCHITECTURE.md)
- Planning monorepo migration to `apps/www` + `packages/ui` structure
- Theme uses nature colors (greens/browns) with oklch color space
- shadcn CLI style is "new-york"
- Node.js 22+ required
- All 46 shadcn/ui base components are already installed
- Recharts is available for charts (not Tremor yet)
