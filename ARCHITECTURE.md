# Usage UI - Architecture & Implementation Guide

> A usage meter-focused component library built on the shadcn ecosystem.

---

## Table of Contents

### For AI Agents (Read First)
1. [AI Agent Instructions](#ai-agent-instructions) ⚠️ **READ FIRST**
2. [Critical Path](#critical-path)
3. [Priority Matrix](#priority-matrix)
4. [Foundation Setup](#foundation-setup-step-by-step)

### Project Context
5. [Project Overview](#project-overview)
6. [Current State Assessment](#current-state-assessment)
7. [Architecture Decision: Single App vs Monorepo](#architecture-decision-single-app-vs-monorepo)
8. [Radix + Base Primitive Strategy](#radix--base-primitive-strategy)
9. [Key Decisions](#key-decisions)
10. [Technology Stack](#technology-stack)

### Implementation Details
11. [Distribution Model](#distribution-model)
12. [Repository Structure](#repository-structure)
13. [Files Reference](#files-reference)
14. [Available shadcn Components](#available-shadcn-components-already-installed)
15. [Reference Implementation: Existing Progress Component](#reference-implementation-existing-progress-component)
16. [Component Architecture](#component-architecture)
17. [Component Dependency Graph](#component-dependency-graph)
18. [Proposed Components](#proposed-components)

### Integration & Styling
19. [Tremor Integration](#tremor-integration)
20. [Styling Guidelines](#styling-guidelines)
21. [Registry Configuration](#registry-configuration)
22. [Registry.json Cleanup](#registryjson-cleanup)

### Workflow & Quality
23. [Development Workflow](#development-workflow)
24. [Quality Gates](#quality-gates)
25. [Common Pitfalls](#common-pitfalls)
26. [Validation Commands](#validation-commands)
27. [Decision Framework](#decision-framework)

### Deployment & Resources
28. [Deployment](#deployment)
29. [Resources](#resources)
30. [Quick Reference for AI Agents](#quick-reference-for-ai-agents)
31. [Checklist (Prioritized)](#checklist-prioritized)

---

## AI Agent Instructions

> ⚠️ **CRITICAL: Read this section before making ANY changes to this codebase.**

### Context

This is a **shadcn-style component registry** for usage meters, structured as a **monorepo**. It is NOT:
- A traditional npm package (it's a registry)
- A fork of shadcn/ui (it extends the ecosystem)
- A single Next.js app (it's a monorepo with apps/ and packages/)

Components are distributed via the **shadcn CLI** and copied into user projects.

### Project Structure (Monorepo)

```
usage-ui/
├── apps/www/           # Documentation site (Next.js)
├── packages/ui/        # Component registry (YOUR COMPONENTS GO HERE)
├── tooling/            # Shared configs
├── turbo.json          # Build orchestration
└── pnpm-workspace.yaml # Workspace definition
```

### Critical Files (Modify with Extreme Care)

| File | Location | Risk Level | Notes |
|------|----------|------------|-------|
| `registry.json` | `packages/ui/` | 🔴 **CRITICAL** | Breaking changes break ALL installations |
| `components.json` | `packages/ui/` | 🔴 **CRITICAL** | shadcn CLI config. Invalid = CLI fails |
| `turbo.json` | Root | 🔴 **CRITICAL** | Build pipeline. Errors break CI/CD |
| `pnpm-workspace.yaml` | Root | 🔴 **CRITICAL** | Workspace definition |
| `globals.css` | `packages/ui/src/styles/` | 🟡 **HIGH** | CSS variables affect all components |
| `package.json` | `packages/ui/` | 🟡 **HIGH** | Dependencies affect users |

### Before Modifying Any Component

1. **Verify monorepo setup is complete** - Phase 0 must be done first
2. **Check if it exists in `packages/ui/registry.json`** - Update the entry too
3. **Check for dependents** - `grep -r "from.*component-name" packages/`
4. **Maintain backwards compatibility** - Don't rename exports or required props
5. **Test the build** - `pnpm build --filter=@usage-ui/ui`

### Component Creation Checklist

When creating a new component, you MUST:

```
□ Verify Phase 0 (monorepo setup) is complete
□ Create component in packages/ui/src/components/registry/[name]/
□ Create both Radix and Base versions if applicable
□ Create index.ts with exports
□ Add entry to packages/ui/registry.json with correct schema
□ Ensure all imports use @/ path aliases
□ Use shadcn CSS variables (not hardcoded colors)
□ Include TypeScript types for all props
□ Export types alongside components
□ Add "use client" directive if using hooks/state
□ Run pnpm build to verify registry generation
□ Test installation: npx shadcn add http://localhost:3000/r/[name].json
□ Create changeset if this is a notable change: pnpm changeset
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component files | kebab-case | `usage-meter.tsx` |
| Component names | PascalCase | `UsageMeter` |
| Registry names | kebab-case | `"name": "usage-meter"` |
| CSS variables | kebab-case with `--` prefix | `--meter-warning` |
| Props interfaces | PascalCase + Props | `UsageMeterProps` |

### Import Patterns (MUST Follow)

```tsx
// ✅ CORRECT - Use path aliases
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ❌ WRONG - Relative imports break when copied to user projects
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
```

### Do NOT

- ❌ Modify existing component APIs without updating registry.json
- ❌ Add dependencies without adding to registry.json `dependencies` array
- ❌ Use colors outside shadcn CSS variables without explicit approval
- ❌ Create components without TypeScript types
- ❌ Skip the base (non-Radix) version for core meter components
- ❌ Use `npm` commands (this project uses `pnpm`)

---

## Critical Path

> **Build order matters.** Monorepo setup must complete before any component work.

### Phase 0: Monorepo Setup ✅ COMPLETE

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ COMPLETE: Monorepo migration finished January 2026      │
├─────────────────────────────────────────────────────────────┤
│  ✅ 1. Create monorepo structure (apps/, packages/, tooling/)│
│  ✅ 2. Configure pnpm-workspace.yaml                         │
│  ✅ 3. Configure turbo.json                                  │
│  ✅ 4. Set up shared TypeScript configs                      │
│  ✅ 5. Set up Changesets                                     │
│  ✅ 6. Set up Lefthook for git hooks                         │
│  ✅ 7. Move current code to apps/www                         │
│  ✅ 8. Create packages/ui structure                          │
│  ✅ 9. Verify `pnpm build` works across workspace            │
│  ✅ 10. Set up GitHub Actions CI                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation (Package Setup)

```
┌─────────────────────────────────────────────────────────────┐
│  1. Configure packages/ui/registry.json                     │
│  2. Install Tremor: pnpm add @tremor/react --filter ui      │
│  3. Add meter CSS variables to packages/ui styles           │
│  4. Verify build works: pnpm build                          │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Core Meters (No Internal Dependencies)

```
┌─────────────────────────────────────────────────────────────┐
│  Build these in ANY order (no dependencies on each other):  │
│                                                             │
│  • usage-meter + usage-meter-base                           │
│  • circular-meter + circular-meter-base                     │
│  • gradient-meter                                           │
│  • stepped-meter                                            │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Compound Meters (Depend on Core)

```
┌─────────────────────────────────────────────────────────────┐
│  REQUIRES Phase 2 complete:                                 │
│                                                             │
│  • segmented-meter (uses usage-meter internally)            │
│  • stacked-meter (uses usage-meter internally)              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 4: Indicators (Depend on Core)

```
┌─────────────────────────────────────────────────────────────┐
│  REQUIRES Phase 2 complete:                                 │
│                                                             │
│  • usage-badge                                              │
│  • threshold-indicator                                      │
│  • limit-warning                                            │
│  • overage-indicator                                        │
└─────────────────────────────────────────────────────────────┘
```

### Phase 5: Cards (Depend on Meters + shadcn Card)

```
┌─────────────────────────────────────────────────────────────┐
│  REQUIRES: shadcn card component + Phase 2-3 meters         │
│                                                             │
│  • quota-card (needs: card, usage-meter)                    │
│  • usage-summary (needs: card)                              │
│  • storage-card (needs: card, stacked-meter)                │
│  • plan-usage-card (needs: card, segmented-meter)           │
│  • resource-card (needs: card)                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 6: Data Visualization (Depend on Tremor)

```
┌─────────────────────────────────────────────────────────────┐
│  REQUIRES: Tremor installed                                 │
│                                                             │
│  • usage-chart                                              │
│  • usage-breakdown                                          │
│  • comparison-bar                                           │
└─────────────────────────────────────────────────────────────┘
```

### Phase 7: Utilities (Can Build Anytime)

```
┌─────────────────────────────────────────────────────────────┐
│  No dependencies - build whenever:                          │
│                                                             │
│  • usage-tooltip                                            │
│  • usage-legend                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Priority Matrix

### P0 - Blocking (Must Complete First)

| Task | Why Critical | Estimated Complexity |
|------|--------------|---------------------|
| Update registry.json metadata | Required for any installation to work | Low |
| Install Tremor dependencies | Required for data viz components | Low |
| Add meter CSS variables | Required for consistent theming | Low |
| Create `usage-meter` component | Foundation for 5+ other components | Medium |
| Create `usage-meter-base` variant | Required for lightweight option | Medium |

### P1 - High Priority (Core Functionality)

| Task | Dependencies | Estimated Complexity |
|------|--------------|---------------------|
| `circular-meter` | None | Medium |
| `quota-card` | usage-meter, shadcn card | Medium |
| `threshold-indicator` | usage-meter | Low |
| `usage-badge` | None | Low |

### P2 - Medium Priority (Enhanced Functionality)

| Task | Dependencies | Estimated Complexity |
|------|--------------|---------------------|
| `segmented-meter` | usage-meter | Medium |
| `stacked-meter` | usage-meter | Medium |
| `storage-card` | stacked-meter, card | Medium |
| `usage-chart` | Tremor | Medium |

### P3 - Lower Priority (Nice to Have)

| Task | Dependencies | Estimated Complexity |
|------|--------------|---------------------|
| `gradient-meter` | None | Low |
| `stepped-meter` | None | Medium |
| `usage-breakdown` | Tremor | Medium |
| `comparison-bar` | Tremor | Medium |
| `usage-tooltip` | None | Low |
| `usage-legend` | None | Low |
| Demo pages | Components exist | Low each |
| Documentation | Components exist | Medium |

---

## Foundation Setup: Monorepo Migration

> ⚠️ **BLOCKING: Complete ALL steps before creating any components.**

### Step 1: Create Root Configuration Files

**Create `pnpm-workspace.yaml`:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

**Update root `package.json`:**
```json
{
  "name": "usage-ui",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "biome format --write .",
    "check": "biome check .",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo build --filter=./packages/* && changeset publish"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@changesets/cli": "^2.27.0",
    "lefthook": "^1.6.0",
    "turbo": "^2.3.0",
    "typescript": "^5.4.5"
  },
  "packageManager": "pnpm@9.15.2",
  "engines": {
    "node": ">=22"
  }
}
```

**Create `turbo.json`:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "public/r/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Step 2: Create Directory Structure

```bash
# Create monorepo directories
mkdir -p apps/www
mkdir -p packages/ui/src/{components/{ui,registry},hooks,lib}
mkdir -p tooling/{typescript,tailwind}
mkdir -p .changeset
mkdir -p .github/workflows
```

### Step 3: Move Current Code to apps/www

```bash
# Move the current app to apps/www
mv src apps/www/
mv public apps/www/
mv next.config.ts apps/www/
mv postcss.config.mjs apps/www/
mv tsconfig.json apps/www/
mv biome.json ./  # Keep at root for shared config
```

**Create `apps/www/package.json`:**
```json
{
  "name": "@usage-ui/www",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "biome check src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@usage-ui/ui": "workspace:*",
    "next": "^16.0.10",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/node": "^22.19.3",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.4.5"
  }
}
```

### Step 4: Set Up packages/ui

**Create `packages/ui/package.json`:**
```json
{
  "name": "@usage-ui/ui",
  "version": "0.1.0",
  "private": false,
  "sideEffects": false,
  "exports": {
    "./registry.json": "./registry.json",
    "./components/*": "./src/components/*/index.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts"
  },
  "scripts": {
    "build": "npx shadcn@latest build",
    "lint": "biome check src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tremor/react": "^3.18.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "radix-ui": "^1.4.3",
    "recharts": "^2.15.4",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.7",
    "react": "^19.2.3",
    "typescript": "^5.4.5"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

**Create `packages/ui/registry.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "usage-ui",
  "homepage": "https://usage-ui.vercel.app",
  "items": []
}
```

**Create `packages/ui/components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### Step 5: Set Up Shared TypeScript Config

**Create `tooling/typescript/base.json`:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true
  },
  "exclude": ["node_modules"]
}
```

**Create `packages/ui/tsconfig.json`:**
```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 6: Set Up Changesets

**Create `.changeset/config.json`:**
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@usage-ui/www"]
}
```

### Step 7: Set Up Lefthook

**Create `lefthook.yml`:**
```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,tsx,json}"
      run: pnpm biome check --staged --no-errors-on-unmatched {staged_files}
    typecheck:
      run: pnpm typecheck

commit-msg:
  commands:
    conventional:
      run: |
        message=$(cat {1})
        pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+"
        if ! echo "$message" | grep -qE "$pattern"; then
          echo "Commit message must follow Conventional Commits format"
          echo "Examples: feat: add usage meter, fix(ui): correct color"
          exit 1
        fi
```

### Step 8: Set Up GitHub Actions CI

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Build
        run: pnpm build
```

### Step 9: Add Meter CSS Variables

**Create `packages/ui/src/styles/globals.css`:**
```css
@import "tailwindcss";

@layer base {
  :root {
    /* Usage UI - Meter Status Colors */
    --meter-success: oklch(0.723 0.191 142.5);
    --meter-warning: oklch(0.795 0.184 86.047);
    --meter-danger: oklch(0.637 0.237 25.331);
    --meter-info: oklch(0.623 0.214 259.1);

    /* Usage UI - Meter Track Colors */
    --meter-track: oklch(0.928 0.006 264.5);
    --meter-track-foreground: oklch(0.45 0.03 264.5);
  }

  .dark {
    /* Usage UI - Meter Status Colors (Dark Mode) */
    --meter-success: oklch(0.627 0.194 142.5);
    --meter-warning: oklch(0.695 0.184 86.047);
    --meter-danger: oklch(0.577 0.237 25.331);
    --meter-info: oklch(0.523 0.214 259.1);

    /* Usage UI - Meter Track Colors (Dark Mode) */
    --meter-track: oklch(0.269 0.006 264.5);
    --meter-track-foreground: oklch(0.708 0.03 264.5);
  }
}
```

### Step 10: Install Dependencies and Verify

```bash
# Install all dependencies
pnpm install

# Run build to verify everything works
pnpm build

# Start dev server
pnpm dev
```

### Step 11: Clean Up Starter Demo Code

```bash
# Remove demo components from apps/www (after migration)
rm -f apps/www/src/components/brand-header.tsx
rm -f apps/www/src/components/brand-sidebar.tsx
rm -f apps/www/src/components/hero.tsx
rm -f apps/www/src/components/login.tsx
rm -f apps/www/src/components/logo.tsx
rm -f apps/www/src/components/product-grid.tsx
rm -f apps/www/src/components/promo.tsx
```

---

## Files Reference (Monorepo)

### Critical Files (🔴 Modify with Extreme Care)

| File | Location | Purpose | Risk Level |
|------|----------|---------|------------|
| `turbo.json` | Root | Build orchestration | 🔴 CRITICAL |
| `pnpm-workspace.yaml` | Root | Workspace definition | 🔴 CRITICAL |
| `registry.json` | `packages/ui/` | Component manifest | 🔴 CRITICAL |
| `components.json` | `packages/ui/` | shadcn CLI config | 🔴 CRITICAL |
| `.changeset/config.json` | Root | Version management | 🟡 HIGH |
| `lefthook.yml` | Root | Git hooks | 🟡 HIGH |

### Package-Specific Files

| File | Package | Purpose |
|------|---------|---------|
| `packages/ui/package.json` | ui | Component package deps |
| `packages/ui/tsconfig.json` | ui | TypeScript config |
| `apps/www/package.json` | www | Docs site deps |
| `apps/www/next.config.ts` | www | Next.js config |

### Generated Files (DO NOT EDIT)

| File/Directory | Purpose |
|----------------|---------|
| `apps/www/public/r/*.json` | Generated by `pnpm build` |
| `apps/www/.next/` | Next.js build output |
| `**/node_modules/` | Dependencies |
| `.turbo/` | Turbo cache |

### Key Source Directories

| Directory | Purpose | Add Files Here |
|-----------|---------|----------------|
| `packages/ui/src/components/registry/` | YOUR meter components | ✅ Yes |
| `packages/ui/src/components/ui/` | Base shadcn components | ❌ No |
| `packages/ui/src/hooks/` | Shared hooks | ✅ If needed |
| `packages/ui/src/lib/` | Utilities (cn, etc.) | ✅ If needed |
| `apps/www/src/app/docs/` | Documentation pages | ✅ Yes |
| `apps/www/content/` | MDX content | ✅ Yes |

---

## Available shadcn Components (Already Installed)

These are available in `src/components/ui/` - use them as building blocks:

### Layout & Containers
- `card.tsx` - For quota-card, storage-card, etc.
- `separator.tsx` - Visual dividers
- `scroll-area.tsx` - Scrollable containers
- `resizable.tsx` - Resizable panels

### Feedback & Status
- `progress.tsx` - **BASE FOR METERS** - Study this first
- `badge.tsx` - For usage-badge
- `alert.tsx` - For limit-warning
- `skeleton.tsx` - Loading states
- `sonner.tsx` - Toast notifications

### Data Display
- `table.tsx` - For usage tables
- `chart.tsx` - Recharts integration (study for Tremor patterns)

### Interactive
- `tooltip.tsx` - For usage-tooltip
- `popover.tsx` - Detailed hover info
- `dialog.tsx` - Modals

### Forms (If Needed)
- `input.tsx`, `label.tsx`, `select.tsx`, `slider.tsx`

---

## Reference Implementation: Existing Progress Component

> **Study this file first:** `src/components/ui/progress.tsx`

This is the existing shadcn Progress component. Your `usage-meter` will extend this pattern.

```tsx
// Current implementation in src/components/ui/progress.tsx
"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
```

### Key Patterns to Follow

1. **`"use client"` directive** - Required for Radix components
2. **`data-slot` attribute** - shadcn convention for styling hooks
3. **`cn()` utility** - For merging classNames
4. **`transform: translateX`** - Animation technique for progress
5. **Spread `...props`** - Forward all props to root element
6. **Type from Radix** - `React.ComponentProps<typeof Primitive.Root>`

### What UsageMeter Adds

| Feature | Progress (Base) | UsageMeter (Extended) |
|---------|----------------|----------------------|
| Value display | ❌ | ✅ Shows percentage/label |
| Variants | ❌ | ✅ success/warning/danger |
| Size options | ❌ | ✅ sm/default/lg |
| Max value | ❌ (assumes 100) | ✅ Configurable |
| Label | ❌ | ✅ Optional label text |

---

## Registry.json Cleanup

The starter template includes demo items that must be removed or replaced.

### Items to REMOVE from registry.json

```json
// DELETE these items from the "items" array:
{
  "name": "theme",           // Demo theme - replace with your own
  "name": "blank",           // Demo block
  "name": "login",           // Demo block
  "name": "sidebar-left",    // Demo block (if present)
  // ... any other demo items
}
```

### Clean registry.json Template

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "usage-ui",
  "homepage": "https://usage-ui.vercel.app",
  "items": [
    {
      "name": "usage-meter",
      "type": "registry:component",
      "title": "Usage Meter",
      "description": "A linear meter for displaying usage/quota with full accessibility via Radix primitives.",
      "dependencies": [],
      "registryDependencies": [],
      "files": [
        {
          "path": "src/components/registry/usage-meter/usage-meter.tsx",
          "type": "registry:component",
          "target": "components/ui/usage-meter.tsx"
        }
      ]
    },
    {
      "name": "usage-meter-base",
      "type": "registry:component",
      "title": "Usage Meter (Base)",
      "description": "A lightweight linear meter without Radix dependency.",
      "dependencies": [],
      "registryDependencies": [],
      "files": [
        {
          "path": "src/components/registry/usage-meter/usage-meter-base.tsx",
          "type": "registry:component",
          "target": "components/ui/usage-meter-base.tsx"
        }
      ]
    }
  ]
}
```

---

---

## Project Overview

**Usage UI** is a specialized component library for building usage meters, quota indicators, and resource consumption visualizations. It follows the shadcn/ui philosophy of code ownership through a registry-based distribution model.

### Goals

- Provide 20+ usage meter-focused components
- Full compatibility with shadcn CLI (`npx shadcn add`)
- Support both Radix primitives and base (lightweight) versions
- Integrate Tremor for advanced data visualization
- Free and open source

---

## Current State Assessment

> **Status:** Monorepo migration complete (January 2026). Ready for component development.

### What's Available ✅

| Item | Status | Location |
|------|--------|----------|
| **Monorepo Structure** | ✅ Complete | `apps/`, `packages/`, `tooling/` |
| pnpm Workspaces | ✅ Configured | `pnpm-workspace.yaml` |
| Turborepo | ✅ Configured | `turbo.json` |
| Changesets | ✅ Configured | `.changeset/config.json` |
| Lefthook | ✅ Configured | `lefthook.yml` |
| GitHub Actions CI | ✅ Configured | `.github/workflows/ci.yml` |
| Next.js 16 + React 19 | ✅ Installed | `apps/www/package.json` |
| Tailwind CSS v4 | ✅ Installed | `@tailwindcss/postcss` |
| Radix UI (unified package) | ✅ Installed | `radix-ui@1.4.3` |
| Recharts | ✅ Installed | `recharts@2.15.4` |
| 46+ shadcn UI components | ✅ Available | `packages/ui/src/components/ui/` |
| Progress component (base for meters) | ✅ Available | `packages/ui/src/components/ui/progress.tsx` |
| Card component | ✅ Available | `packages/ui/src/components/ui/card.tsx` |
| Registry structure | ✅ Set up | `packages/ui/src/components/registry/` |
| Demo page structure | ✅ Set up | `apps/www/src/app/demo/` |
| Biome linting | ✅ Configured | `biome.json` |
| Path aliases | ✅ Configured | `packages/ui/tsconfig.json`, `packages/ui/components.json` |
| Meter CSS variables | ✅ Added | `packages/ui/src/styles/globals.css` |

### Ready for Next Phase 🟢

| Task | Priority | Status |
|------|----------|--------|
| Create first meter component | P1 | Ready to start |
| Create `usage-meter-base` variant | P1 | Ready to start |
| Install `@tremor/react` | P1 | Ready when needed for data viz |
| Build out component library | P2 | Ready to start |

### Current Monorepo Structure

```
usage-ui/                              
├── apps/
│   └── www/                    # Docs site (@usage-ui/www)
│       ├── src/
│       │   ├── app/            # Next.js pages
│       │   └── components/     # Site-specific components
│       └── public/r/           # Generated registry JSON
├── packages/
│   └── ui/                     # Components (@usage-ui/ui)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/         # Base shadcn (don't modify)
│       │   │   └── registry/   # YOUR meter components
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── styles/
│       ├── registry.json       # Component manifest
│       └── components.json     # shadcn CLI config
├── tooling/
│   └── typescript/             # Shared TS configs
├── turbo.json
├── pnpm-workspace.yaml
└── lefthook.yml
```

---

## Architecture Decision: Lightweight Monorepo

### Decision: **Lightweight Monorepo Structure**

Following industry standards (Magic UI, Origin UI, shadcn/ui itself), Usage UI will use a **lightweight monorepo** structure with pnpm workspaces and Turborepo.

### Why Monorepo is the Correct Choice

| Factor | Single App | Monorepo (Chosen) |
|--------|------------|-------------------|
| **Industry standard** | ❌ Not for libraries | ✅ Magic UI, Origin UI, shadcn |
| **Separation of concerns** | ❌ Docs + registry coupled | ✅ Clean separation |
| **Scalability** | ❌ Gets messy at 30+ components | ✅ Scales well |
| **Independent deployment** | ❌ All or nothing | ✅ Deploy docs separately |
| **Shared tooling** | ❌ N/A | ✅ Shared configs, utilities |
| **Future packages** | ❌ Requires migration | ✅ Already set up |
| **CI/CD caching** | ❌ Rebuild everything | ✅ Turbo caching |

### Target Structure

```
usage-ui/
├── apps/
│   └── www/                        # Documentation + demo site
│       ├── app/
│       │   ├── (marketing)/        # Landing pages
│       │   ├── docs/               # Component documentation
│       │   └── globals.css         # Site-specific styles
│       ├── components/             # Site-specific components
│       ├── content/                # MDX documentation content
│       ├── next.config.ts
│       ├── package.json            # App-specific deps
│       └── tsconfig.json
│
├── packages/
│   └── ui/                         # Component registry package
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/             # Base shadcn components
│       │   │   └── registry/       # Usage-ui components
│       │   ├── hooks/              # Shared hooks
│       │   └── lib/                # Utilities (cn, etc.)
│       ├── registry.json           # Component manifest
│       ├── components.json         # shadcn CLI config
│       ├── package.json
│       └── tsconfig.json
│
├── tooling/                        # Shared configurations
│   ├── eslint/                     # Shared ESLint config
│   ├── typescript/                 # Shared tsconfig
│   └── tailwind/                   # Shared Tailwind config
│
├── .changeset/                     # Changesets for versioning
├── .github/
│   └── workflows/                  # CI/CD pipelines
│       ├── ci.yml                  # Lint, type-check, build
│       └── release.yml             # Publish workflow
│
├── turbo.json                      # Turborepo configuration
├── pnpm-workspace.yaml             # Workspace definition
├── package.json                    # Root package.json
├── biome.json                      # Shared linting/formatting
└── tsconfig.json                   # Root TypeScript config
```

### Migration Required

The current Vercel Registry Starter is a single app. **Migration to monorepo is a P0 task** before any component development.

---

## Radix + Base Primitive Strategy

### Understanding the Two Approaches

**Radix Version** (Full Accessibility)
- Uses `@radix-ui/react-progress` or other Radix primitives
- Full keyboard navigation, ARIA attributes, focus management
- Slightly larger bundle size
- Required for complex interactive components

**Base Version** (Lightweight)
- Pure React + HTML elements with manual ARIA
- Smaller bundle size
- User adds accessibility as needed
- Good for simple visual indicators

### How Radix is Set Up (Already Done)

The project uses the **unified `radix-ui` package** (v1.4.3), which includes all primitives:

```tsx
// Import from the unified package
import { Progress } from "radix-ui"

// Or import specific primitive (both work)
import * as ProgressPrimitive from "@radix-ui/react-progress"
```

### Implementation Pattern

```
src/components/registry/
├── usage-meter/
│   ├── usage-meter.tsx           # Uses Radix Progress primitive
│   ├── usage-meter-base.tsx      # Pure div with role="progressbar"
│   └── index.ts                  # Re-exports both
```

### When to Create Both Versions

| Component Type | Radix Version | Base Version |
|----------------|---------------|--------------|
| Core meters (linear, circular) | ✅ Yes | ✅ Yes |
| Cards (quota-card, etc.) | ❌ No (uses Card) | ❌ No |
| Indicators (badge, warning) | ❌ No | ✅ Only base |
| Charts (Tremor-based) | ❌ No | ❌ No (Tremor handles) |

### Radix Version Template

```tsx
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface UsageMeterProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger"
}

const UsageMeter = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  UsageMeterProps
>(({ className, value, max = 100, variant = "default", ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      value={value}
      max={max}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          variant === "default" && "bg-primary",
          variant === "success" && "bg-[--meter-success]",
          variant === "warning" && "bg-[--meter-warning]",
          variant === "danger" && "bg-[--meter-danger]"
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
UsageMeter.displayName = "UsageMeter"

export { UsageMeter }
export type { UsageMeterProps }
```

### Base Version Template

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface UsageMeterBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger"
}

const UsageMeterBase = React.forwardRef<HTMLDivElement, UsageMeterBaseProps>(
  ({ className, value, max = 100, variant = "default", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${Math.round(percentage)}%`}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all",
            variant === "default" && "bg-primary",
            variant === "success" && "bg-[--meter-success]",
            variant === "warning" && "bg-[--meter-warning]",
            variant === "danger" && "bg-[--meter-danger]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
UsageMeterBase.displayName = "UsageMeterBase"

export { UsageMeterBase }
export type { UsageMeterBaseProps }
```

---

## Key Decisions

### Why Not Fork shadcn/ui?

The shadcn ecosystem uses a **registry-based distribution model**, not traditional npm packages or GitHub forks. Key reasons:

| Approach | Why Not |
|----------|---------|
| Fork shadcn/ui repo | shadcn isn't meant to be forked; it's a distribution system |
| npm package | Users lose code ownership and customization ability |
| Copy files manually | No versioning, hard to update |

**Chosen approach**: Create a custom registry that integrates with the shadcn CLI.

### Why Registry Distribution?

| Aspect | npm Package | shadcn Registry (Chosen) |
|--------|-------------|--------------------------|
| Installation | `npm install your-lib` | `npx shadcn add @usage-ui/meter` |
| Code location | Hidden in `node_modules/` | Copied directly into project |
| Ownership | Library maintains code | User owns and modifies code |
| Updates | `npm update` replaces code | Manual re-add (preserves customizations) |
| Bundling | Included as dependency | Compiled with app code |

### Why Monorepo?

For 20+ components with documentation, a lightweight monorepo provides:

- Separation of concerns (docs vs registry)
- Scalability for future growth
- Consistent tooling across packages
- Industry standard (Magic UI, Origin UI use this pattern)

---

## Technology Stack

### Core Stack

```json
{
  "packageManager": "pnpm@9+",
  "monorepo": {
    "workspaces": "pnpm workspaces",
    "orchestration": "turborepo",
    "versioning": "changesets"
  },
  "framework": "next.js 15+",
  "language": "typescript 5.x",
  "styling": "tailwind css v4",
  "cssVariables": "shadcn css variables (OKLCH)",
  "primitives": {
    "accessible": "radix-ui",
    "lightweight": "base (no radix)"
  },
  "dataVisualization": "@tremor/react + recharts",
  "animations": "none (future consideration)",
  "codeQuality": {
    "linting": "biome",
    "gitHooks": "lefthook",
    "commitLint": "conventional commits"
  },
  "testing": "vitest + @testing-library/react",
  "ci": "github actions",
  "registry": "shadcn registry schema"
}
```

### Technology Decisions (Industry Standard)

| Category | Choice | Alternatives Considered | Why This Choice |
|----------|--------|------------------------|-----------------|
| **Package Manager** | pnpm | npm, yarn, bun | Fastest, best monorepo support, disk efficient |
| **Monorepo Tool** | Turborepo | Nx, Lerna, Rush | Simple config, excellent caching, Vercel-native |
| **Versioning** | Changesets | semantic-release, Lerna | Industry standard, works with pnpm, GitHub integration |
| **Framework** | Next.js 15+ | Vite, Remix | Best for docs sites, shadcn-native, Vercel deployment |
| **Styling** | Tailwind v4 | v3, CSS-in-JS | Latest version, better performance, shadcn default |
| **Linting** | Biome | ESLint + Prettier | 10-100x faster, single tool, modern |
| **Git Hooks** | Lefthook | Husky + lint-staged | Faster, simpler config, used by Magic UI |
| **Testing** | Vitest | Jest | Faster, better ESM support, Vite-compatible |
| **CI/CD** | GitHub Actions | CircleCI, GitLab CI | Free for open source, excellent caching |

### Version Requirements

| Tool | Minimum Version | Notes |
|------|-----------------|-------|
| Node.js | 22+ | Required by current package.json |
| pnpm | 9.15+ | Workspace protocol support |
| TypeScript | 5.4+ | Satisfies keyword, better inference |
| Next.js | 15+ | App Router, React 19 |
| React | 19+ | New features, better performance |
| Tailwind | 4.1+ | @theme directive, OKLCH colors |

---

## Distribution Model

Users install components via the shadcn CLI:

```bash
# Add to components.json registries (one-time setup)
# Then install components:
npx shadcn add @usage-ui/usage-meter
npx shadcn add @usage-ui/quota-card
```

Components are copied into the user's project at `components/ui/` where they own and can modify the code.

---

## Repository Structure (Monorepo)

```
usage-ui/
├── apps/
│   └── www/                          # Documentation + demo site
│       ├── src/
│       │   ├── app/
│       │   │   ├── (marketing)/      # Landing pages
│       │   │   ├── (registry)/       # Registry API routes
│       │   │   ├── docs/             # Documentation pages
│       │   │   └── globals.css       # Site styles
│       │   └── components/           # Site-specific components
│       ├── content/                  # MDX documentation
│       ├── public/
│       │   └── r/                    # Generated registry JSON
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── ui/                           # 📦 Component registry package
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/               # Base shadcn components
│       │   │   └── registry/         # YOUR usage-ui components
│       │   │       ├── usage-meter/
│       │   │       ├── circular-meter/
│       │   │       └── ...
│       │   ├── hooks/                # Shared hooks
│       │   ├── lib/                  # Utilities (cn, etc.)
│       │   └── styles/
│       │       └── globals.css       # Shared CSS variables
│       ├── registry.json             # 🔴 CRITICAL: Component manifest
│       ├── components.json           # shadcn CLI config
│       ├── package.json
│       └── tsconfig.json
│
├── tooling/
│   ├── typescript/
│   │   └── base.json                 # Shared TS config
│   └── tailwind/
│       └── base.config.ts            # Shared Tailwind config (if needed)
│
├── .changeset/
│   └── config.json                   # Changesets config
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, typecheck, build
│       └── release.yml               # Publish workflow
│
├── turbo.json                        # 🔴 Turborepo config
├── pnpm-workspace.yaml               # 🔴 Workspace definition
├── package.json                      # Root scripts
├── biome.json                        # Shared linting
├── lefthook.yml                      # Git hooks
└── tsconfig.json                     # Root TS config
```

### Key Directories

| Directory | Purpose | Edit Frequency |
|-----------|---------|----------------|
| `packages/ui/src/components/registry/` | YOUR components | Every component |
| `packages/ui/src/components/ui/` | Base shadcn (don't edit) | Rarely |
| `packages/ui/registry.json` | Component manifest | Every component |
| `apps/www/src/app/docs/` | Documentation pages | Per component |
| `apps/www/public/r/` | Generated JSON (don't edit) | Never (generated) |

---

## Component Architecture

---

## Component Dependency Graph

```
                    ┌─────────────────┐
                    │  CSS Variables  │
                    │  (globals.css)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │  cn util  │      │   Radix   │      │  Tremor   │
   │ (lib/utils)│      │ Progress  │      │  Charts   │
   └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
         │                  │                   │
         │    ┌─────────────┴─────────────┐    │
         │    │                           │    │
         ▼    ▼                           ▼    │
   ┌─────────────────┐            ┌─────────────────┐
   │  usage-meter    │            │ usage-meter-base│
   │    (Radix)      │            │  (No deps)      │
   └────────┬────────┘            └────────┬────────┘
            │                              │
    ┌───────┴───────┬──────────────┬───────┴────────┐
    │               │              │                │
    ▼               ▼              ▼                ▼
┌─────────┐  ┌───────────┐  ┌────────────┐  ┌──────────────┐
│segmented│  │  stacked  │  │ threshold  │  │ usage-badge  │
│  meter  │  │   meter   │  │ indicator  │  │              │
└────┬────┘  └─────┬─────┘  └────────────┘  └──────────────┘
     │             │
     ▼             ▼
┌──────────┐ ┌────────────┐
│plan-usage│ │  storage   │
│   card   │ │   card     │
└──────────┘ └────────────┘

   TREMOR BRANCH (Independent)
   ────────────────────────────
         │
         ▼
   ┌───────────┐
   │  Tremor   │
   │ AreaChart │
   │ DonutChart│
   │ BarChart  │
   └─────┬─────┘
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
┌────────┐┌────────┐┌──────────┐
│ usage  ││ usage  ││comparison│
│ chart  ││breakdown│   bar   │
└────────┘└────────┘└──────────┘
```

### Dependency Rules

| Component | Hard Dependencies | Soft Dependencies |
|-----------|-------------------|-------------------|
| `usage-meter` | `@radix-ui/react-progress`, `cn` | None |
| `usage-meter-base` | `cn` | None |
| `circular-meter` | `@radix-ui/react-progress`, `cn` | None |
| `segmented-meter` | `usage-meter` | None |
| `stacked-meter` | `usage-meter` | None |
| `quota-card` | `card` (shadcn), `usage-meter` | None |
| `storage-card` | `card` (shadcn), `stacked-meter` | None |
| `usage-chart` | `@tremor/react`, `recharts` | None |
| `usage-breakdown` | `@tremor/react`, `recharts` | None |

---

### Dual Primitive Support

Each component should have two versions when applicable:

```
src/components/registry/
├── usage-meter/
│   ├── usage-meter.tsx        # Radix-based (full accessibility)
│   └── usage-meter-base.tsx   # Lightweight (no Radix dependency)
├── circular-meter/
│   ├── circular-meter.tsx
│   └── circular-meter-base.tsx
└── ...
```

### Component Template

```tsx
// src/components/registry/usage-meter/usage-meter.tsx
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface UsageMeterProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: "default" | "success" | "warning" | "danger"
  size?: "sm" | "default" | "lg"
}

const UsageMeter = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  UsageMeterProps
>(({ value, max = 100, label, showPercentage = true, variant = "default", size = "default", ...props }, ref) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{percentage}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          size === "sm" && "h-2",
          size === "default" && "h-3",
          size === "lg" && "h-4"
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full transition-all",
            variant === "default" && "bg-primary",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-yellow-500",
            variant === "danger" && "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
UsageMeter.displayName = "UsageMeter"

export { UsageMeter }
```

### Base Version (No Radix)

```tsx
// src/components/registry/usage-meter/usage-meter-base.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface UsageMeterBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: "default" | "success" | "warning" | "danger"
  size?: "sm" | "default" | "lg"
}

const UsageMeterBase = React.forwardRef<HTMLDivElement, UsageMeterBaseProps>(
  ({ value, max = 100, label, showPercentage = true, variant = "default", size = "default", className, ...props }, ref) => {
    const percentage = Math.round((value / max) * 100)

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {(label || showPercentage) && (
          <div className="flex justify-between text-sm">
            {label && <span className="text-muted-foreground">{label}</span>}
            {showPercentage && <span className="font-medium">{percentage}%</span>}
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            "relative overflow-hidden rounded-full bg-secondary",
            size === "sm" && "h-2",
            size === "default" && "h-3",
            size === "lg" && "h-4"
          )}
        >
          <div
            className={cn(
              "h-full transition-all",
              variant === "default" && "bg-primary",
              variant === "success" && "bg-green-500",
              variant === "warning" && "bg-yellow-500",
              variant === "danger" && "bg-red-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
UsageMeterBase.displayName = "UsageMeterBase"

export { UsageMeterBase }
```

---

## Proposed Components

### Core Meters (6)

| Component | Description | Primitives |
|-----------|-------------|------------|
| `usage-meter` | Linear progress bar with labels | Radix + Base |
| `circular-meter` | Radial/donut progress indicator | Radix + Base |
| `segmented-meter` | Multi-tier usage (free/pro/enterprise) | Radix + Base |
| `stacked-meter` | Multiple values in one bar | Base |
| `stepped-meter` | Discrete steps/levels | Base |
| `gradient-meter` | Gradient fill based on value | Base |

### Cards & Containers (5)

| Component | Description | Dependencies |
|-----------|-------------|--------------|
| `quota-card` | Card showing usage + limit | Card, UsageMeter |
| `usage-summary` | Multiple metrics overview | Card |
| `storage-card` | Storage-specific with breakdown | Card, StackedMeter |
| `plan-usage-card` | Subscription plan usage | Card, SegmentedMeter |
| `resource-card` | Generic resource consumption | Card |

### Indicators & Badges (4)

| Component | Description |
|-----------|-------------|
| `usage-badge` | Compact inline indicator |
| `threshold-indicator` | Warning/critical state display |
| `limit-warning` | Alert when approaching limit |
| `overage-indicator` | Over-limit state visualization |

### Data Visualization - Tremor (3)

| Component | Description | Tremor Base |
|-----------|-------------|-------------|
| `usage-chart` | Historical usage line/area chart | AreaChart |
| `usage-breakdown` | Pie/donut breakdown | DonutChart |
| `comparison-bar` | Used vs allocated bar chart | BarChart |

### Utilities (2)

| Component | Description |
|-----------|-------------|
| `usage-tooltip` | Detailed hover information |
| `usage-legend` | Legend for multi-value meters |

---

## Tremor Integration

### Installation

```bash
pnpm add @tremor/react recharts
```

### Strategy

Wrap Tremor components and restyle with shadcn CSS variables:

```tsx
// src/components/registry/usage-chart/usage-chart.tsx
"use client"

import { AreaChart } from "@tremor/react"
import { cn } from "@/lib/utils"

interface UsageChartProps {
  data: Array<{ date: string; usage: number }>
  className?: string
}

export function UsageChart({ data, className }: UsageChartProps) {
  return (
    <AreaChart
      className={cn("h-72", className)}
      data={data}
      index="date"
      categories={["usage"]}
      colors={["blue"]}
      showLegend={false}
      showGridLines={false}
    />
  )
}
```

### Tremor + shadcn Theming

Update your `globals.css` to include Tremor-compatible CSS variables that reference your shadcn theme.

---

## Styling Guidelines

### Use shadcn CSS Variables

Always use the existing shadcn CSS variables:

```tsx
// Good - uses shadcn variables
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
className="bg-muted text-muted-foreground"
className="border-border"

// Avoid - hardcoded colors
className="bg-blue-500 text-white"
```

### Variant Colors for Meters

Define semantic variants in your components:

```tsx
const variants = {
  default: "bg-primary",
  success: "bg-green-500 dark:bg-green-400",
  warning: "bg-yellow-500 dark:bg-yellow-400",
  danger: "bg-red-500 dark:bg-red-400",
}
```

Consider adding these as CSS variables in `globals.css`:

```css
:root {
  --meter-success: oklch(0.723 0.191 142.5);
  --meter-warning: oklch(0.795 0.184 86.047);
  --meter-danger: oklch(0.637 0.237 25.331);
}
```

### Size Variants

Maintain consistent sizing across components:

```tsx
const sizes = {
  sm: "h-2",
  default: "h-3",
  lg: "h-4",
}
```

---

## Registry Configuration

### registry.json Structure

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "usage-ui",
  "homepage": "https://usage-ui.dev",
  "items": [
    {
      "name": "usage-meter",
      "type": "registry:component",
      "title": "Usage Meter",
      "description": "A linear meter for displaying usage/quota with Radix primitives",
      "dependencies": ["@radix-ui/react-progress"],
      "registryDependencies": [],
      "files": [
        {
          "path": "src/components/registry/usage-meter/usage-meter.tsx",
          "type": "registry:component",
          "target": "components/ui/usage-meter.tsx"
        }
      ]
    },
    {
      "name": "usage-meter-base",
      "type": "registry:component",
      "title": "Usage Meter (Base)",
      "description": "A lightweight linear meter without Radix dependency",
      "dependencies": [],
      "registryDependencies": [],
      "files": [
        {
          "path": "src/components/registry/usage-meter/usage-meter-base.tsx",
          "type": "registry:component",
          "target": "components/ui/usage-meter-base.tsx"
        }
      ]
    },
    {
      "name": "quota-card",
      "type": "registry:component",
      "title": "Quota Card",
      "description": "A card component showing usage and limits",
      "dependencies": [],
      "registryDependencies": ["card", "usage-meter"],
      "files": [
        {
          "path": "src/components/registry/quota-card/quota-card.tsx",
          "type": "registry:component",
          "target": "components/ui/quota-card.tsx"
        }
      ]
    },
    {
      "name": "usage-chart",
      "type": "registry:component",
      "title": "Usage Chart",
      "description": "Historical usage visualization with Tremor",
      "dependencies": ["@tremor/react", "recharts"],
      "registryDependencies": [],
      "files": [
        {
          "path": "src/components/registry/usage-chart/usage-chart.tsx",
          "type": "registry:component",
          "target": "components/ui/usage-chart.tsx"
        }
      ]
    }
  ]
}
```

### Key Fields

| Field | Purpose |
|-------|---------|
| `name` | CLI identifier (`npx shadcn add @usage-ui/[name]`) |
| `type` | Always `registry:component` for components |
| `dependencies` | npm packages to install |
| `registryDependencies` | Other registry items required |
| `files[].target` | Where file is copied in user's project |

---

## Development Workflow

### 1. Create a New Component

```bash
# Create component directory
mkdir -p src/components/registry/circular-meter

# Create component files
touch src/components/registry/circular-meter/circular-meter.tsx
touch src/components/registry/circular-meter/circular-meter-base.tsx
```

### 2. Add to Registry

Edit `registry.json` to include your new component (see structure above).

### 3. Build Registry

```bash
# Generate public/r/*.json files
pnpm build
```

### 4. Test Locally

```bash
# Start dev server
pnpm dev

# In another project, test installation:
npx shadcn add http://localhost:3000/r/circular-meter.json
```

### 5. Create Demo

Add a demo page at `src/app/demo/circular-meter/page.tsx` showcasing variants and usage.

---

## Quality Gates

> **A component is NOT complete until ALL gates pass.**

### Gate 1: Code Quality

```bash
# Must pass with no errors
pnpm lint        # or: pnpm biome check
pnpm typecheck   # or: pnpm tsc --noEmit
```

| Check | Requirement |
|-------|-------------|
| TypeScript | No `any` types. All props typed. |
| Linting | Zero errors (warnings acceptable) |
| Formatting | Consistent with Biome config |

### Gate 2: Registry Integration

```bash
# Must generate valid JSON
pnpm build
```

| Check | Requirement |
|-------|-------------|
| `registry.json` entry | Valid schema, all fields present |
| Build succeeds | `public/r/[component].json` generated |
| JSON valid | Parseable, correct structure |

### Gate 3: Installation Test

```bash
# In a SEPARATE test project:
npx shadcn add http://localhost:3000/r/[component].json
```

| Check | Requirement |
|-------|-------------|
| CLI installs | No errors during installation |
| Files copied | Component appears in `components/ui/` |
| Imports work | No broken imports in copied code |
| Renders | Component renders without errors |

### Gate 4: Functionality

| Check | Requirement |
|-------|-------------|
| All variants work | default, success, warning, danger |
| All sizes work | sm, default, lg |
| Props documented | TypeScript interface is complete |
| Accessibility | Radix version has proper ARIA |
| Dark mode | Works in both light and dark themes |

### Gate 5: Documentation (Before Release)

| Check | Requirement |
|-------|-------------|
| Demo page exists | `src/app/demo/[component]/page.tsx` |
| Props table | All props documented |
| Usage example | At least one code example |

---

## Common Pitfalls

### 🚫 Pitfall 1: Forgetting `"use client"`

**Symptom:** "useState is not defined" or hydration errors

**Fix:** Add directive at top of file:
```tsx
"use client"

import * as React from "react"
// ...
```

**When needed:** Any component using:
- `useState`, `useEffect`, `useRef`
- Event handlers (`onClick`, etc.)
- Radix UI primitives (they use state internally)

### 🚫 Pitfall 2: Wrong Import Paths

**Symptom:** "Module not found" after user installs component

**Wrong:**
```tsx
import { cn } from "../../lib/utils"
```

**Correct:**
```tsx
import { cn } from "@/lib/utils"
```

### 🚫 Pitfall 3: Missing Registry Dependencies

**Symptom:** Component installs but crashes because dependency wasn't installed

**Fix:** Add ALL component dependencies to `registry.json`:
```json
{
  "registryDependencies": ["card", "usage-meter"],
  "dependencies": ["@radix-ui/react-progress"]
}
```

### 🚫 Pitfall 4: Hardcoded Colors

**Symptom:** Component doesn't match user's theme

**Wrong:**
```tsx
className="bg-blue-500 text-white"
```

**Correct:**
```tsx
className="bg-primary text-primary-foreground"
```

### 🚫 Pitfall 5: Forgetting forwardRef

**Symptom:** User can't attach refs to component

**Fix:** Always use forwardRef pattern:
```tsx
const UsageMeter = React.forwardRef<HTMLDivElement, UsageMeterProps>(
  (props, ref) => {
    return <div ref={ref} {...props} />
  }
)
UsageMeter.displayName = "UsageMeter"
```

### 🚫 Pitfall 6: Not Testing the Build

**Symptom:** Works in dev, breaks in production

**Fix:** Always run before committing:
```bash
pnpm build
```

### 🚫 Pitfall 7: Modifying Existing API Without Updating Registry

**Symptom:** Existing users' code breaks on update

**Rule:** If you change:
- Prop names → Update registry.json description
- Required props → This is a BREAKING CHANGE, requires major version
- Export names → NEVER do this

---

## Validation Commands (Monorepo)

### Quick Validation (Run After Every Change)

```bash
# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Build all packages (with Turbo caching)
pnpm build
```

### Package-Specific Commands

```bash
# Build only the UI package
pnpm build --filter=@usage-ui/ui

# Dev only the docs site
pnpm dev --filter=@usage-ui/www

# Type check only UI package
pnpm typecheck --filter=@usage-ui/ui

# Add dependency to UI package
pnpm add <package> --filter=@usage-ui/ui
```

### Full Validation (Run Before Commit)

```bash
# All checks (Turbo runs in parallel)
pnpm lint && pnpm typecheck && pnpm build

# Or use the check script
pnpm check && pnpm build

# Start dev server
pnpm dev

# Test in browser
open http://localhost:3000
```

### Installation Validation (Run Before PR)

```bash
# In a separate Next.js project with shadcn configured:
cd ~/test-project

# Test specific component (use dev server URL)
npx shadcn add http://localhost:3000/r/usage-meter.json

# Verify it works
# 1. Check file exists: ls components/ui/usage-meter.tsx
# 2. Import and render in a page
# 3. Check no console errors
```

### Registry JSON Validation

```bash
# Check registry.json is valid
cat packages/ui/registry.json | jq .

# Check generated component JSON (after build)
cat apps/www/public/r/usage-meter.json | jq .

# Validate against schema
npx ajv validate -s https://ui.shadcn.com/schema/registry.json -d packages/ui/registry.json
```

### Changesets Workflow

```bash
# Create a changeset (run when making changes)
pnpm changeset

# Version packages (run before release)
pnpm version-packages

# Publish (CI typically handles this)
pnpm release
```

### CI Simulation (Run Before Push)

```bash
# Simulate what CI will do
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
```

---

## Decision Framework

> **Use this when you're unsure how to proceed.**

### Q: Should this component have a Base (non-Radix) version?

```
Is it a CORE METER component?
├── YES → Create both versions
│         (usage-meter.tsx AND usage-meter-base.tsx)
│
└── NO → Is accessibility critical for this component?
         ├── YES → Use Radix, single version
         └── NO → Base version only is fine
```

### Q: Should I use a shadcn CSS variable or a custom color?

```
Is this color semantic (primary, secondary, muted)?
├── YES → Use shadcn variable: bg-primary
│
└── NO → Is it a STATUS color (success, warning, danger)?
         ├── YES → Define custom CSS variable in globals.css
         │         Then use: bg-[--meter-warning]
         │
         └── NO → Is it truly unique to this component?
                  ├── YES → Define component-specific variable
                  └── NO → Probably should use existing variable
```

### Q: Should this be a new component or a variant of an existing one?

```
Does it share 70%+ of the code with an existing component?
├── YES → Add as a variant prop to existing component
│         Example: variant="segmented" on usage-meter
│
└── NO → Does it have a fundamentally different DOM structure?
         ├── YES → New component
         └── NO → Consider variant first, new component if complex
```

### Q: Should I add this dependency?

```
Is it already in package.json?
├── YES → Just import it
│
└── NO → Is it a peer dependency of an existing dep?
         ├── YES → Add to peerDependencies
         │
         └── NO → Is the bundle size < 50KB?
                  ├── YES → Add to dependencies AND registry.json
                  └── NO → Reconsider. Can you achieve this without it?
```

### Q: Where should this file go?

```
Is it a distributable component?
├── YES → src/components/registry/[component-name]/
│
└── NO → Is it a shared utility?
         ├── YES → src/lib/
         │
         └── NO → Is it a React hook?
                  ├── YES → src/hooks/
                  │
                  └── NO → Is it for the demo/docs site only?
                           ├── YES → src/components/ (not registry/)
                           └── NO → Ask for clarification
```

### Q: How do I handle breaking changes?

```
Is this a BREAKING change?
(Changed prop name, removed export, changed required props)

├── YES → STOP. This requires:
│         1. Discussion with maintainer
│         2. Major version bump plan
│         3. Migration guide
│         4. Deprecation period (if possible)
│
└── NO → Proceed, but:
         1. Maintain backwards compatibility
         2. Add new props as optional
         3. Use default values for new behavior
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

### After Deployment

1. Update `registry.json` homepage URL
2. Register in [Registry Directory](https://registry.directory/) (optional)
3. Users can now install via:

```bash
npx shadcn add https://your-domain.com/r/usage-meter.json
```

### Namespaced Registry Setup

For cleaner installs, users add to their `components.json`:

```json
{
  "registries": {
    "usage-ui": {
      "url": "https://usage-ui.dev/r"
    }
  }
}
```

Then install with:

```bash
npx shadcn add @usage-ui/usage-meter
```

---

## Resources

### Official Documentation

- [shadcn/ui Registry Docs](https://ui.shadcn.com/docs/registry)
- [Registry Getting Started](https://ui.shadcn.com/docs/registry/getting-started)
- [registry.json Schema](https://ui.shadcn.com/docs/registry/registry-json)
- [registry-item.json Schema](https://ui.shadcn.com/docs/registry/registry-item-json)
- [Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)

### Templates & Examples

- [Official Registry Template](https://github.com/shadcn-ui/registry-template)
- [Vercel Registry Starter](https://github.com/vercel/registry-starter)
- [Registry Template v3](https://github.com/shadcn-ui/registry-template-v3) (if needed)

### Popular shadcn Libraries (Reference)

- [Magic UI](https://github.com/magicuidesign/magicui) - 20k+ stars, animated components
- [Origin UI](https://originui.com/) - 400+ free components
- [Aceternity UI](https://ui.aceternity.com/) - Premium animated effects
- [shadcn-ui-meter](https://github.com/DavidAmunga/shadcn-ui-meter) - Existing meter component

### Data Visualization

- [Tremor Documentation](https://tremor.so/docs)
- [Recharts Documentation](https://recharts.org/)

---

## Checklist

### Initial Setup
- [x] Clone registry template
- [x] Install dependencies
- [x] Migrate to monorepo structure
- [x] Update `registry.json` with project name
- [x] Configure CSS variables in `packages/ui/src/styles/globals.css`
- [ ] Add Tremor: `pnpm add @tremor/react --filter=@usage-ui/ui`

### First Component
- [ ] Create `usage-meter` component
- [ ] Create `usage-meter-base` variant
- [ ] Add to `packages/ui/registry.json`
- [ ] Build and test locally
- [ ] Create demo page

### All Components
- [ ] Core Meters (6)
- [ ] Cards & Containers (5)
- [ ] Indicators & Badges (4)
- [ ] Data Visualization (3)
- [ ] Utilities (2)

### Documentation
- [x] Installation guide (README)
- [x] Contributing guide
- [ ] Component API documentation
- [ ] Usage examples
- [ ] Theming guide

### Deployment
- [ ] Deploy to Vercel
- [ ] Update registry URLs
- [ ] Test remote installation
- [ ] Submit to Registry Directory

---

## Quick Reference for AI Agents

### TL;DR - The Most Important Rules

1. **Complete monorepo setup first** - No component work until Phase 0 is done
2. **Always use `@/` path aliases** - Never relative imports
3. **Always update `packages/ui/registry.json`** when creating/modifying components
4. **Always run `pnpm build`** before considering work complete
5. **Always create both Radix and Base versions** for core meters
6. **Never use hardcoded colors** - Use shadcn CSS variables
7. **Never break existing APIs** - Add, don't modify or remove
8. **Use Turborepo filters** - `--filter=@usage-ui/ui` for package-specific commands

### File Quick Reference (Monorepo)

| When you need to... | Edit this file |
|---------------------|----------------|
| Add a new component | `packages/ui/registry.json` + create in `packages/ui/src/components/registry/` |
| Add a CSS variable | `packages/ui/src/styles/globals.css` |
| Add a dependency to UI | `pnpm add <pkg> --filter=@usage-ui/ui` + update registry.json |
| Add a utility function | `packages/ui/src/lib/utils.ts` |
| Add a demo page | `apps/www/src/app/docs/[component]/page.tsx` |
| Add documentation | `apps/www/content/docs/[component].mdx` |
| Create a changeset | Run `pnpm changeset` |

### Command Quick Reference (Monorepo)

```bash
# Development
pnpm dev                              # Start all dev servers
pnpm dev --filter=@usage-ui/www       # Start only docs site

# Building
pnpm build                            # Build all packages (cached)
pnpm build --filter=@usage-ui/ui      # Build only UI package

# Quality
pnpm lint                             # Lint all packages
pnpm typecheck                        # Type check all packages
pnpm check                            # Run Biome checks

# Dependencies
pnpm add <pkg> --filter=@usage-ui/ui  # Add to UI package
pnpm add <pkg> --filter=@usage-ui/www # Add to docs site
pnpm add -D <pkg> -w                  # Add to root devDependencies

# Versioning
pnpm changeset                        # Create a changeset
pnpm version-packages                 # Apply changesets
```

### Component Template Quick Copy

**Location:** `packages/ui/src/components/registry/[component-name]/[component-name].tsx`

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add props here
}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      />
    )
  }
)
ComponentName.displayName = "ComponentName"

export { ComponentName }
export type { ComponentNameProps }
```

### Registry Entry Template Quick Copy

**Location:** `packages/ui/registry.json` → add to `items` array

```json
{
  "name": "component-name",
  "type": "registry:component",
  "title": "Component Name",
  "description": "Description here",
  "dependencies": [],
  "registryDependencies": [],
  "files": [
    {
      "path": "packages/ui/src/components/registry/component-name/component-name.tsx",
      "type": "registry:component",
      "target": "components/ui/component-name.tsx"
    }
  ]
}
```

### Index File Template

**Location:** `packages/ui/src/components/registry/[component-name]/index.ts`

```ts
export { ComponentName } from "./component-name"
export type { ComponentNameProps } from "./component-name"

// If base version exists:
export { ComponentNameBase } from "./component-name-base"
export type { ComponentNameBaseProps } from "./component-name-base"
```

---

## Checklist (Prioritized)

### ✅ P0 - Monorepo Setup (COMPLETE)

> ✅ **Monorepo migration completed January 2026.**

**Directory Structure:**
- [x] Create `apps/` directory
- [x] Create `packages/` directory
- [x] Create `tooling/` directory
- [x] Create `.changeset/` directory
- [x] Create `.github/workflows/` directory

**Root Configuration:**
- [x] Create `pnpm-workspace.yaml`
- [x] Update root `package.json` (name, scripts, devDependencies)
- [x] Create `turbo.json`
- [x] Create `lefthook.yml`
- [x] Move `biome.json` to root (if not already)

**Move Current Code:**
- [x] Move `src/` to `apps/www/src/`
- [x] Move `public/` to `apps/www/public/`
- [x] Move `next.config.ts` to `apps/www/`
- [x] Move `postcss.config.mjs` to `apps/www/`
- [x] Create `apps/www/package.json`
- [x] Create `apps/www/tsconfig.json`

**Set Up packages/ui:**
- [x] Create `packages/ui/package.json`
- [x] Create `packages/ui/tsconfig.json`
- [x] Create `packages/ui/registry.json` (clean, with name "usage-ui")
- [x] Create `packages/ui/components.json`
- [x] Create `packages/ui/src/styles/globals.css` with meter CSS variables
- [x] Create `packages/ui/src/lib/utils.ts` (copy cn utility)
- [x] Copy base shadcn components to `packages/ui/src/components/ui/`

**Set Up Shared Config:**
- [x] Create `tooling/typescript/base.json`
- [x] Create `.changeset/config.json`

**Set Up CI/CD:**
- [x] Create `.github/workflows/ci.yml`

**Validation:**
- [x] Run `pnpm install` - No errors
- [x] Run `pnpm build` - All packages build
- [x] Run `pnpm dev` - Dev server starts
- [x] Run `pnpm lint` - No lint errors
- [x] Run `pnpm typecheck` - No type errors

### 🔴 P0 - First Component (Ready to Start)

- [ ] Create `packages/ui/src/components/registry/usage-meter/` directory
- [ ] Create `usage-meter.tsx` - Radix-based version
- [ ] Create `usage-meter-base.tsx` - Lightweight version
- [ ] Create `index.ts` - Re-export both components
- [ ] Add both to `packages/ui/registry.json`
- [ ] Run `pnpm build` - Verify JSON generated in `apps/www/public/r/`
- [ ] Test locally - `npx shadcn add http://localhost:3000/r/usage-meter.json`

### 🟡 P1 - Tremor Integration

- [ ] Run `pnpm add @tremor/react --filter=@usage-ui/ui`
- [ ] Verify recharts is installed (already should be)
- [ ] Create wrapper components for Tremor charts

### 🟡 P1 - Core Components

| Component | Radix | Base | Card Dep | Notes |
|-----------|-------|------|----------|-------|
| `circular-meter` | [ ] | [ ] | ❌ | SVG-based circular progress |
| `quota-card` | ❌ | ❌ | ✅ | Uses usage-meter + card |
| `threshold-indicator` | ❌ | [ ] | ❌ | Visual warning states |
| `usage-badge` | ❌ | [ ] | ❌ | Compact inline indicator |

### 🟢 P2 - Extended Components

| Component | Dependencies | Notes |
|-----------|--------------|-------|
| `segmented-meter` | usage-meter | Multi-tier display |
| `stacked-meter` | usage-meter | Multiple values stacked |
| `storage-card` | card, stacked-meter | Storage breakdown |
| `plan-usage-card` | card, segmented-meter | Subscription usage |
| `usage-chart` | @tremor/react | Line/area chart |

### 🔵 P3 - Complete Library

| Component | Type | Dependencies |
|-----------|------|--------------|
| `gradient-meter` | Base only | None |
| `stepped-meter` | Base only | None |
| `limit-warning` | Base only | alert (shadcn) |
| `overage-indicator` | Base only | None |
| `resource-card` | Compound | card |
| `usage-summary` | Compound | card |
| `usage-breakdown` | Tremor | @tremor/react |
| `comparison-bar` | Tremor | @tremor/react |
| `usage-tooltip` | Utility | tooltip (shadcn) |
| `usage-legend` | Utility | None |

### 📄 Documentation

- [x] Installation guide in README (updated for monorepo)
- [ ] Demo page for `usage-meter` (create first as template)
- [ ] Demo page for each additional component
- [ ] Theming/customization guide
- [ ] API reference (props tables)

### 🚀 Launch

- [ ] Deploy to Vercel
- [ ] Update `registry.json` homepage with production URL
- [ ] Test installation from production URL
- [ ] Submit to [Registry Directory](https://registry.directory/)
- [x] Create comprehensive README.md
- [ ] Add LICENSE file (MIT recommended)

---

---

## Testing Strategy

### Recommended Testing Stack

```json
{
  "unitTesting": "vitest",
  "componentTesting": "@testing-library/react",
  "e2e": "playwright (optional, for docs site)",
  "visualRegression": "chromatic (optional)"
}
```

### Test File Locations

```
packages/ui/
├── src/
│   └── components/
│       └── registry/
│           └── usage-meter/
│               ├── usage-meter.tsx
│               ├── usage-meter.test.tsx    # Unit tests
│               └── usage-meter.stories.tsx # Storybook (optional)
```

### Minimum Test Requirements

| Component Type | Required Tests |
|----------------|----------------|
| Core meters | Renders, props work, variants display correctly |
| Cards | Renders with children, slots work |
| Tremor wrappers | Renders, data displays |

### Example Test

```tsx
// packages/ui/src/components/registry/usage-meter/usage-meter.test.tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { UsageMeter } from "./usage-meter"

describe("UsageMeter", () => {
  it("renders with value", () => {
    render(<UsageMeter value={50} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50")
  })

  it("displays correct percentage", () => {
    render(<UsageMeter value={75} max={100} />)
    expect(screen.getByText("75%")).toBeInTheDocument()
  })

  it("applies variant classes", () => {
    render(<UsageMeter value={90} variant="danger" />)
    // Assert danger styling is applied
  })
})
```

### CI Testing

Tests run automatically in GitHub Actions on every PR:

```yaml
# In .github/workflows/ci.yml
- name: Test
  run: pnpm test
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2025 | Initial architecture document |
| 1.1 | January 2025 | Added monorepo structure, updated all sections for industry best practices |
| 1.2 | January 2026 | Monorepo migration complete, updated checklists and current state |

---

## Summary of Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Monorepo | Industry standard, scales, clean separation |
| Package Manager | pnpm | Fastest, best monorepo support |
| Build Tool | Turborepo | Simple, excellent caching, Vercel-native |
| Versioning | Changesets | Industry standard for monorepos |
| Linting | Biome | Fast, modern, replaces ESLint + Prettier |
| Git Hooks | Lefthook | Fast, simple config |
| CI/CD | GitHub Actions | Free for open source |
| Framework | Next.js 15+ | shadcn-native, best for docs |
| Styling | Tailwind v4 | Latest, shadcn default |
| Primitives | Radix + Base | Accessibility + lightweight options |
| Data Viz | Tremor + Recharts | Best-in-class charts |

---

*Document created: January 2025*
*Updated: January 2026 - Monorepo migration complete*
*Based on shadcn/ui ecosystem best practices and research*
*Optimized for AI agent consumption with explicit priorities and decision frameworks*
