# Monorepo Migration Guide

> Step-by-step checklist for migrating Usage UI from single-app to monorepo structure.
> 
> **Approach**: Hybrid method — use shadcn CLI as a configuration reference, execute manual migration to preserve git history and customizations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Strategy](#migration-strategy)
3. [Phase 0: Pre-flight & Reference Generation](#phase-0-pre-flight--reference-generation)
4. [Phase 1: Root Configuration](#phase-1-root-configuration)
5. [Phase 2: Directory Structure](#phase-2-directory-structure)
6. [Phase 3: Move App to apps/www](#phase-3-move-app-to-appswww)
7. [Phase 4: Set Up packages/ui](#phase-4-set-up-packagesui)
8. [Phase 5: Shared Tooling](#phase-5-shared-tooling)
9. [Phase 6: CI/CD](#phase-6-cicd)
10. [Phase 7: Install and Verify](#phase-7-install-and-verify)
11. [Phase 7.5: Dependency Reconciliation](#phase-75-dependency-reconciliation)
12. [Phase 8: Cleanup](#phase-8-cleanup)
13. [Phase 9: Post-Migration Validation](#phase-9-post-migration-validation)
14. [Troubleshooting](#troubleshooting)
15. [Common Pitfalls](#common-pitfalls)

---

## Prerequisites

- [ ] Node.js 22+ installed (`node --version`)
- [ ] pnpm 9.15+ installed (`pnpm --version`)
- [ ] Current codebase committed to git (clean working tree)
- [ ] Backup branch created: `git checkout -b pre-monorepo-backup && git checkout -`

---

## Migration Strategy

### Why Hybrid Approach?

| Approach | Pros | Cons |
|----------|------|------|
| **Option A: CLI Scaffold** | Guaranteed correct config | Loses git history, requires manual code copy |
| **Option B: Manual Only** | Preserves history | Prone to configuration errors |
| **Hybrid (Recommended)** | Correct configs + preserved history | Slightly more setup time |

### Hybrid Method

1. **Generate reference**: Use `npx shadcn@latest init` in a temp directory to get correct configurations
2. **Execute manually**: Migrate your project using the reference configs
3. **Result**: Best of both worlds — correct configs AND preserved git history

---

## Phase 0: Pre-flight & Reference Generation

### 0.1 Verify Clean State

```bash
# Ensure working tree is clean
git status

# Create backup branch
git checkout -b pre-monorepo-backup
git checkout -
```

### 0.2 Generate Reference Configuration (Optional but Recommended)

```bash
# Create temporary directory for reference
# macOS/Linux:
mkdir -p /tmp/shadcn-monorepo-reference
cd /tmp/shadcn-monorepo-reference

# Windows (PowerShell):
# mkdir $env:TEMP\shadcn-monorepo-reference
# cd $env:TEMP\shadcn-monorepo-reference

# Generate reference monorepo structure
pnpm dlx shadcn@latest init
# Select: "Next.js (Monorepo)"
# This creates correct turbo.json, components.json, tsconfig.json

# Keep this open for reference during migration
# Key files to reference:
# - turbo.json
# - apps/web/components.json
# - packages/ui/components.json
# - pnpm-workspace.yaml
```

**Checkpoint:** `[ ]` Reference generated or skipped

---

## Phase 1: Root Configuration

### 1.1 Create Workspace File

Create `pnpm-workspace.yaml` at root:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### 1.2 Update Root package.json

> **Note**: Both `turbo run <task>` and `turbo <task>` work in Turbo v2+. We use `turbo run` for explicitness.

Replace current `package.json` with:

```json
{
  "name": "usage-ui",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "format": "biome format --write .",
    "check": "biome check .",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=./packages/* && changeset publish"
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

### 1.3 Create turbo.json

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
    "lint": {},
    "typecheck": {},
    "clean": {
      "cache": false
    }
  }
}
```

### 1.4 Create lefthook.yml

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,tsx,json}"
      run: pnpm biome check --staged --no-errors-on-unmatched {staged_files}
    typecheck:
      run: pnpm run typecheck

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

### 1.5 Verify Root Config

```bash
# Verify files exist
ls -la pnpm-workspace.yaml turbo.json lefthook.yml package.json
```

**Checkpoint:** `[ ]` Root config files created and verified

---

## Phase 2: Directory Structure

### 2.1 Create All Directories

```bash
# Create monorepo directories
mkdir -p apps/www
mkdir -p packages/ui/src/{components/{ui,registry},hooks,lib,styles}
mkdir -p tooling/typescript
mkdir -p .changeset
mkdir -p .github/workflows
```

### 2.2 Verify Structure

```bash
# Should show: apps, packages, tooling, .changeset, .github
ls -la
ls -la apps packages tooling
```

**Checkpoint:** `[ ]` Directory structure created

---

## Phase 3: Move App to apps/www

### 3.1 Move Source Files

```bash
# Move app code (order matters!)
mv src apps/www/
mv public apps/www/
mv next.config.ts apps/www/
mv postcss.config.mjs apps/www/

# Keep these at root:
# - biome.json (shared)
# - tsconfig.json (will be updated)
# - registry.json (will move to packages/ui)
# - components.json (will be updated)
```

### 3.2 Create apps/www/package.json

> ⚠️ **Important**: If `apps/www/src/components/ui/` contains shadcn components, you need their dependencies here too. The list below includes all common shadcn/ui dependencies. Remove any you don't use.

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
    "@hookform/resolvers": "^5.2.2",
    "@tanstack/react-table": "^8.21.3",
    "@vercel/analytics": "^1.6.1",
    "@vercel/speed-insights": "^1.3.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.506.0",
    "next": "^16.0.10",
    "next-themes": "^0.4.6",
    "radix-ui": "^1.4.3",
    "react": "^19.2.3",
    "react-day-picker": "^9.12.0",
    "react-dom": "^19.2.3",
    "react-hook-form": "^7.68.0",
    "react-resizable-panels": "^3.0.6",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "vaul": "^1.1.2",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^22.19.3",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.4.5"
  }
}
```

### 3.3 Create apps/www/tsconfig.json

```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@usage-ui/ui": ["../../packages/ui/src"],
      "@usage-ui/ui/*": ["../../packages/ui/src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["src/**/*", "next-env.d.ts", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3.4 Create apps/www/components.json

> ⚠️ **Critical**: This file tells the shadcn CLI where to install components and how to resolve imports. The CSS path must point to the shared styles in packages/ui.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@usage-ui/ui/lib/utils",
    "ui": "@usage-ui/ui/components"
  }
}
```

### 3.5 Verify apps/www Structure

```bash
ls -la apps/www/
# Should show: src/, public/, next.config.ts, postcss.config.mjs, package.json, tsconfig.json, components.json
```

### 3.6 Ensure Site Registry File Exists

> **Registry File Architecture**: This project uses **two registry files** with different purposes:
>
> | File | Purpose | Used By |
> |------|---------|---------|
> | `packages/ui/registry.json` | Component manifest for shadcn CLI | External users installing components |
> | `apps/www/src/registry.json` | Documentation site data | `apps/www/src/lib/registry.ts` for UI display |

If your docs site imports from `@/registry.json` (check `apps/www/src/lib/registry.ts`), ensure the file exists:

```bash
# Check if registry.ts imports from @/registry.json
if grep -q "@/registry.json" apps/www/src/lib/registry.ts 2>/dev/null; then
  # Verify the file exists
  if [ ! -f apps/www/src/registry.json ]; then
    echo "⚠️  apps/www/src/registry.json is missing but required by registry.ts"
    echo "   Copy from root or create: cp registry.json apps/www/src/registry.json"
  else
    echo "✅ apps/www/src/registry.json exists"
  fi
fi
```

If missing, copy from root before Phase 8 deletes it:

```bash
cp registry.json apps/www/src/registry.json
```

**Checkpoint:** `[ ]` apps/www configured with all files
**Checkpoint:** `[ ]` Site registry file exists (if needed by registry.ts)

---

## Phase 4: Set Up packages/ui

### 4.1 Create packages/ui/package.json

> ⚠️ **Important**: shadcn/ui components have many peer dependencies. The list below includes all common ones. Adjust based on which components exist in `packages/ui/src/components/ui/`.

```json
{
  "name": "@usage-ui/ui",
  "version": "0.1.0",
  "private": false,
  "sideEffects": false,
  "exports": {
    "./registry.json": "./registry.json",
    "./components": "./src/components/index.ts",
    "./components/*": "./src/components/*/index.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts",
    "./styles/*": "./src/styles/*"
  },
  "scripts": {
    "build": "pnpm dlx shadcn@latest build --output ../../apps/www/public/r",
    "lint": "biome check src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.506.0",
    "next-themes": "^0.4.6",
    "radix-ui": "^1.4.3",
    "react-day-picker": "^9.12.0",
    "react-hook-form": "^7.68.0",
    "react-resizable-panels": "^3.0.6",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "vaul": "^1.1.2"
  },
  "devDependencies": {
    "@types/react": "^19.2.7",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "typescript": "^5.4.5"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

<details>
<summary>📦 Dependency Reference: Which packages are needed for which components</summary>

| Package | Required By |
|---------|-------------|
| `class-variance-authority` | All components using `cva()` variants |
| `clsx` | All components (via `cn()` utility) |
| `tailwind-merge` | All components (via `cn()` utility) |
| `radix-ui` | Most primitives (Dialog, Dropdown, Select, etc.) |
| `lucide-react` | Components with icons |
| `cmdk` | Command component |
| `embla-carousel-react` | Carousel component |
| `input-otp` | InputOTP component |
| `next-themes` | ThemeProvider, theme toggle |
| `react-day-picker` | Calendar, DatePicker components |
| `react-hook-form` | Form component |
| `react-resizable-panels` | Resizable component |
| `recharts` | Chart components |
| `sonner` | Sonner toast component |
| `vaul` | Drawer component |

</details>

### 4.2 Create packages/ui/tsconfig.json

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

### 4.3 Create packages/ui/registry.json

> ⚠️ **Critical**: This is the component manifest. Start clean, add components as you build them.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "usage-ui",
  "homepage": "https://usage-ui.vercel.app",
  "items": []
}
```

### 4.4 Create packages/ui/components.json

> ⚠️ **Critical**: Aliases must use the package name pattern for proper resolution.

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
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "ui": "@/components/ui"
  }
}
```

### 4.5 Copy Shared Code to packages/ui

```bash
# Copy utilities
cp apps/www/src/lib/utils.ts packages/ui/src/lib/

# Copy base shadcn components
cp -r apps/www/src/components/ui/* packages/ui/src/components/ui/

# Copy hooks if any exist
if ls apps/www/src/hooks/*.ts 1>/dev/null 2>&1; then
  cp apps/www/src/hooks/*.ts packages/ui/src/hooks/
else
  echo "No hooks to copy (this is fine)"
fi
```

### 4.6 Create packages/ui/src/styles/globals.css

> This contains only the meter-specific CSS variables. The full theme remains in apps/www.

```css
@import "tailwindcss";

@theme inline {
  /* Usage UI - Meter Status Colors */
  --color-meter-success: oklch(0.723 0.191 142.5);
  --color-meter-warning: oklch(0.795 0.184 86.047);
  --color-meter-danger: oklch(0.637 0.237 25.331);
  --color-meter-info: oklch(0.623 0.214 259.1);

  /* Usage UI - Meter Track Colors */
  --color-meter-track: oklch(0.928 0.006 264.5);
  --color-meter-track-foreground: oklch(0.45 0.03 264.5);
}

@layer base {
  :root {
    /* Meter CSS variables for direct use */
    --meter-success: var(--color-meter-success);
    --meter-warning: var(--color-meter-warning);
    --meter-danger: var(--color-meter-danger);
    --meter-info: var(--color-meter-info);
    --meter-track: var(--color-meter-track);
    --meter-track-foreground: var(--color-meter-track-foreground);
  }

  .dark {
    --meter-success: oklch(0.627 0.194 142.5);
    --meter-warning: oklch(0.695 0.184 86.047);
    --meter-danger: oklch(0.577 0.237 25.331);
    --meter-info: oklch(0.523 0.214 259.1);
    --meter-track: oklch(0.269 0.006 264.5);
    --meter-track-foreground: oklch(0.708 0.03 264.5);
  }
}
```

### 4.7 Create Component Barrel Files

> ⚠️ **Important**: TypeScript requires files to have at least one export to be valid modules. Since `registry/` is empty initially, we need a placeholder export.

**First**, create the registry index with a valid empty export:

```bash
cat > packages/ui/src/components/registry/index.ts << 'EOF'
// Registry components will be exported here as they are created
// Example: export * from "./usage-meter";

// Placeholder export to ensure this is a valid module
export {};
EOF
```

**Then**, create the main barrel file `packages/ui/src/components/index.ts`:

```ts
// Re-export component directories
export * from "./ui";
export * from "./registry";
```

### 4.8 Verify packages/ui Structure

```bash
ls -la packages/ui/
# Should show: src/, package.json, tsconfig.json, registry.json, components.json

ls -la packages/ui/src/
# Should show: components/, hooks/, lib/, styles/

ls -la packages/ui/src/components/
# Should show: ui/, registry/
```

**Checkpoint:** `[ ]` packages/ui configured with all files

---

## Phase 5: Shared Tooling

### 5.1 Create tooling/typescript/package.json

> **Note**: Even though this folder only contains config files, pnpm requires a package.json for workspace recognition.

```json
{
  "name": "@usage-ui/typescript-config",
  "version": "0.0.0",
  "private": true
}
```

### 5.2 Create tooling/typescript/base.json

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

### 5.3 Create .changeset/config.json

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

### 5.4 Update Root tsconfig.json

Replace the root `tsconfig.json`:

```json
{
  "extends": "./tooling/typescript/base.json",
  "compilerOptions": {
    "baseUrl": "."
  },
  "include": [],
  "exclude": ["node_modules", "apps", "packages", "tooling"],
  "references": [
    { "path": "./apps/www" },
    { "path": "./packages/ui" }
  ]
}
```

**Checkpoint:** `[ ]` Shared tooling configured

---

## Phase 6: CI/CD

### 6.1 Create .github/workflows/ci.yml

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

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Type check
        run: pnpm run typecheck

      - name: Build
        run: pnpm run build
```

**Checkpoint:** `[ ]` CI/CD configured

---

## Phase 7: Install and Verify

### 7.1 Clean Install

```bash
# Remove old artifacts
rm -rf node_modules pnpm-lock.yaml .turbo

# Also remove from moved locations
rm -rf apps/www/node_modules packages/ui/node_modules

# Fresh install
pnpm install
```

### 7.2 Verify Workspace Recognition

```bash
# Should show both packages
pnpm ls --depth 0

# Should list @usage-ui/www and @usage-ui/ui
pnpm ls -r --depth 0
```

### 7.3 Test Build

```bash
# Build all packages
pnpm run build

# Expected: Both packages build successfully
```

### 7.4 Test Dev Server

```bash
# Start dev server
pnpm run dev

# Open http://localhost:3000 - should load
```

### 7.5 Test Individual Commands

```bash
# Lint all
pnpm run lint

# Type check all
pnpm run typecheck

# Test filter syntax
pnpm run build --filter=@usage-ui/ui
pnpm run build --filter=@usage-ui/www
```

**Checkpoint:** `[ ]` All builds and commands succeed

---

## Phase 7.5: Dependency Reconciliation

> Even well-planned migrations often reveal missing dependencies during validation. This phase systematically identifies and fixes them.

### 7.5.1 Identify Missing Dependencies

If `pnpm install` succeeds but `pnpm build` or `pnpm typecheck` fails with import errors:

```bash
# Capture TypeScript errors for missing modules
pnpm typecheck 2>&1 | grep "Cannot find module" | sort -u

# Common patterns:
# - "Cannot find module 'class-variance-authority'" → missing in package.json
# - "Cannot find module '@/registry.json'" → missing file
# - "File is not a module" → empty index.ts without exports
```

### 7.5.2 Fix apps/www Dependencies

If UI components in `apps/www/src/components/ui/` fail to build, add their dependencies:

```bash
# Core shadcn dependencies (almost always needed)
pnpm add class-variance-authority clsx radix-ui tailwind-merge --filter=@usage-ui/www

# Data visualization
pnpm add recharts --filter=@usage-ui/www

# Component-specific (add as needed based on errors)
pnpm add lucide-react --filter=@usage-ui/www  # Icons
```

### 7.5.3 Fix packages/ui Dependencies

If components in `packages/ui/src/components/ui/` fail to build:

```bash
# Add missing shadcn component dependencies
pnpm add lucide-react cmdk embla-carousel-react input-otp next-themes \
  react-day-picker react-hook-form react-resizable-panels sonner vaul \
  --filter=@usage-ui/ui
```

### 7.5.4 Fix Missing Registry File

If `apps/www/src/lib/registry.ts` imports `@/registry.json` but the file doesn't exist:

```bash
# Check if the import exists
grep -l "@/registry.json" apps/www/src/lib/*.ts

# If found, copy from packages/ui or root
cp packages/ui/registry.json apps/www/src/registry.json
# OR if you have site-specific registry data:
cp registry.json apps/www/src/registry.json
```

### 7.5.5 Fix Empty Module Exports

If TypeScript errors with "File is not a module" for `packages/ui/src/components/registry/index.ts`:

```bash
# Create valid empty export
cat > packages/ui/src/components/registry/index.ts << 'EOF'
// Registry components will be exported here as they are created
// Example: export * from "./usage-meter";

// Placeholder export to ensure this is a valid module
export {};
EOF
```

### 7.5.6 Re-validate

After fixes, re-run validation:

```bash
pnpm install        # Refresh dependencies
pnpm typecheck      # Should pass
pnpm build          # Should succeed
pnpm dev            # Should start without errors
```

**Checkpoint:** `[ ]` All TypeScript errors resolved
**Checkpoint:** `[ ]` Build succeeds without errors
**Checkpoint:** `[ ]` Dev server starts cleanly

---

## Phase 8: Cleanup

### 8.1 Remove Old Root Files

```bash
# Remove old files that were moved
rm -f components.json  # Moved to apps/www/ and packages/ui/
rm -f registry.json    # Replaced by packages/ui/registry.json

# Keep at root:
# - biome.json (shared)
# - package.json (updated)
# - tsconfig.json (updated)
# - turbo.json (new)
# - pnpm-workspace.yaml (new)
# - lefthook.yml (new)
```

### 8.2 Enable Git Hooks

```bash
# Install lefthook hooks
pnpm lefthook install
```

### 8.3 Remove Demo Components (Optional)

If you want to start fresh without the Vercel Registry Starter demo components:

```bash
# Remove demo brand components
rm -f apps/www/src/components/brand-header.tsx
rm -f apps/www/src/components/brand-sidebar.tsx
rm -f apps/www/src/components/hero.tsx
rm -f apps/www/src/components/login.tsx
rm -f apps/www/src/components/logo.tsx
rm -f apps/www/src/components/product-grid.tsx
rm -f apps/www/src/components/promo.tsx
rm -f apps/www/src/lib/products.ts
```

### 8.4 Update apps/www/src/app/globals.css

> ⚠️ **Important**: Choose ONE approach to avoid duplicate Tailwind base styles.

**Option A: App owns Tailwind, package adds variables only**

Keep your existing `globals.css` with `@import "tailwindcss"`, then add meter variables:

```css
@import "tailwindcss";

/* Import meter-specific CSS variables (no Tailwind base) */
@import "@usage-ui/ui/styles/meter-variables.css";

/* Your existing theme variables... */
```

**Option B: Package owns shared styles (simpler)**

Replace your `globals.css` to import everything from the package:

```css
/* Import complete shared styles including Tailwind */
@import "@usage-ui/ui/styles/globals.css";

/* App-specific overrides only */
```

If using Option A, rename `packages/ui/src/styles/globals.css` to `meter-variables.css` and remove the `@import "tailwindcss"` line from it.

### 8.5 Update .gitignore

Add monorepo-specific ignores:

```bash
# Add to .gitignore
cat >> .gitignore << 'EOF'

# Monorepo build artifacts
apps/www/.next/
apps/www/.turbo/
packages/ui/dist/
.turbo/

# Generated registry files (optional - some prefer to commit these)
# apps/www/public/r/
EOF
```

**Checkpoint:** `[ ]` Cleanup complete

---

## Phase 9: Post-Migration Validation

### 9.1 Final Verification Checklist

```bash
# Run all checks
pnpm install          # ✅ Should complete without errors
pnpm run build        # ✅ Should build all packages
pnpm run dev          # ✅ Should start dev server
pnpm run lint         # ✅ Should pass
pnpm run typecheck    # ✅ Should pass
```

### 9.2 Test shadcn CLI Integration

```bash
# Navigate to apps/www
cd apps/www

# Test adding a component (should install to packages/ui)
pnpm dlx shadcn@latest add button --dry-run

# The CLI should recognize the monorepo structure
```

### 9.3 Verify Browser

- [ ] Open `http://localhost:3000`
- [ ] Site loads correctly
- [ ] No console errors
- [ ] Theme works (light/dark toggle if present)

### 9.4 Test Git Hooks

```bash
# Create a test commit
git add .
git commit -m "test: verify hooks work"
# Should run lint and typecheck before commit

# If using conventional commits, this should fail:
git commit -m "bad commit message"
```

### 9.5 Create First Component (Validates Setup)

Create a minimal component to validate the entire pipeline:

```bash
# Create component directory
mkdir -p packages/ui/src/components/registry/usage-meter

# Create minimal component file
cat > packages/ui/src/components/registry/usage-meter/usage-meter.tsx << 'EOF'
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface UsageMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
}

function UsageMeter({ value, max = 100, className, ...props }: UsageMeterProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export { UsageMeter }
export type { UsageMeterProps }
EOF

# Create index file
cat > packages/ui/src/components/registry/usage-meter/index.ts << 'EOF'
export { UsageMeter } from "./usage-meter"
export type { UsageMeterProps } from "./usage-meter"
EOF
```

Add to `packages/ui/registry.json`:

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
      "description": "A linear meter for displaying usage/quota percentages.",
      "dependencies": [],
      "registryDependencies": [],
      "files": [
        {
          "path": "src/components/registry/usage-meter/usage-meter.tsx",
          "target": "components/ui/usage-meter.tsx"
        }
      ]
    }
  ]
}
```

Test the build:

```bash
# Build registry (outputs to apps/www/public/r/)
pnpm run build --filter=@usage-ui/ui

# Verify output exists
ls apps/www/public/r/usage-meter.json
```

> **Note**: The `--output` flag in `packages/ui/package.json` build script tells shadcn where to generate the registry JSON files.

**Checkpoint:** `[ ]` Migration complete and validated

---

## Troubleshooting

### "Workspace package not found"

**Cause**: `pnpm-workspace.yaml` missing or malformed.

**Fix**:
```bash
# Verify file exists at root
cat pnpm-workspace.yaml

# Should contain:
# packages:
#   - "apps/*"
#   - "packages/*"
#   - "tooling/*"
```

### "Cannot find module @usage-ui/ui"

**Cause**: TypeScript path mapping incorrect or pnpm not recognizing workspace.

**Fix**:
```bash
# Check apps/www/tsconfig.json has:
# "paths": {
#   "@usage-ui/ui": ["../../packages/ui/src"],
#   "@usage-ui/ui/*": ["../../packages/ui/src/*"]
# }

# Reinstall to refresh workspace links
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "turbo: command not found"

**Cause**: Turbo not installed in devDependencies.

**Fix**:
```bash
pnpm install
# or explicitly:
pnpm add -D turbo -w
```

### "Recursive turbo invocations" (Turbo v1 only)

**Cause**: In Turbo v1, script names conflicting with task names caused recursion.

**Note**: Turbo v2+ handles this automatically. If you're on v2+, this is not an issue. For v1:

**Fix**: Use `turbo run build` not `turbo build`:
```json
{
  "scripts": {
    "build": "turbo run build"  // Explicit form (works in all versions)
  }
}
```

### Build fails with type errors

**Cause**: TypeScript config not extending shared base.

**Fix**:
```bash
# Verify tooling/typescript/base.json exists
cat tooling/typescript/base.json

# Verify packages extend it:
# apps/www/tsconfig.json: "extends": "../../tooling/typescript/base.json"
# packages/ui/tsconfig.json: "extends": "../../tooling/typescript/base.json"
```

### "Cannot find CSS file" or styles not working

**Cause**: CSS path in `components.json` is incorrect.

**Fix**: Verify paths:
```
apps/www/components.json:
  "css": "../../packages/ui/src/styles/globals.css"

packages/ui/components.json:
  "css": "src/styles/globals.css"
```

### shadcn CLI installs to wrong location

**Cause**: `components.json` aliases not pointing to workspace package.

**Fix**: In `apps/www/components.json`:
```json
{
  "aliases": {
    "utils": "@usage-ui/ui/lib/utils",
    "ui": "@usage-ui/ui/components"
  }
}
```

---

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Script recursion (Turbo v1) | Use `turbo run <task>` in root scripts (v2+ handles this) |
| CSS path wrong | Use relative paths from the file's location |
| Missing workspace protocol | Use `workspace:*` for internal deps |
| Forgetting `pnpm-workspace.yaml` | Create before running `pnpm install` |
| Not copying `utils.ts` | Copy to `packages/ui/src/lib/utils.ts` |
| Mismatched component.json aliases | Use `@usage-ui/ui/` prefix for shared code |
| Old node_modules | Clean install after restructuring |
| Missing shared tsconfig | Create `tooling/typescript/base.json` first |
| Missing tooling package.json | Add minimal package.json to `tooling/typescript/` |
| Duplicate Tailwind imports | Only ONE package should `@import "tailwindcss"` |
| Export/alias mismatch | Ensure package exports match component.json aliases |
| Missing shadcn dependencies | Include `cva`, `clsx`, `radix-ui`, `tailwind-merge` in packages with UI components |
| Two registry files needed | `packages/ui/registry.json` (CLI) + `apps/www/src/registry.json` (site) |
| Empty registry/index.ts | Add `export {};` placeholder until components exist |
| Incomplete dependency analysis | Analyze imports in moved files before creating package.json |

---

## Quick Reference

### Package Names

| Package | Name | Location |
|---------|------|----------|
| Docs Site | `@usage-ui/www` | `apps/www/` |
| Component Library | `@usage-ui/ui` | `packages/ui/` |

### Key Commands

```bash
# Development
pnpm run dev                              # Start all
pnpm run dev --filter=@usage-ui/www       # Start docs only

# Building
pnpm run build                            # Build all
pnpm run build --filter=@usage-ui/ui      # Build UI only

# Quality
pnpm run lint
pnpm run typecheck

# Dependencies
pnpm add <pkg> --filter=@usage-ui/ui      # Add to UI
pnpm add <pkg> --filter=@usage-ui/www     # Add to docs
pnpm add -D <pkg> -w                      # Add to root
```

### File Locations After Migration

| What | Where |
|------|-------|
| Your meter components | `packages/ui/src/components/registry/` |
| Base shadcn components | `packages/ui/src/components/ui/` |
| Shared utilities | `packages/ui/src/lib/` |
| Shared hooks | `packages/ui/src/hooks/` |
| Shared styles | `packages/ui/src/styles/` |
| Component manifest | `packages/ui/registry.json` |
| Docs site | `apps/www/` |
| Site-specific components | `apps/www/src/components/` |

---

*Last updated: January 2026*
*Based on shadcn/ui monorepo support (December 2024), Turborepo v2 best practices, and Tailwind CSS v4*
