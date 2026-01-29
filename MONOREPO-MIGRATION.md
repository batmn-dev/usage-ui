# Monorepo Migration Guide

> Step-by-step checklist for migrating Usage UI from single-app to monorepo structure.

## Prerequisites

- [ ] Node.js 22+ installed
- [ ] pnpm 9.15+ installed
- [ ] Current codebase committed to git (clean working tree)

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

Replace current `package.json` with:

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

### 1.4 Create lefthook.yml

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
          exit 1
        fi
```

**Checkpoint:** `[ ]` Root config files created

---

## Phase 2: Create Directory Structure

```bash
# Create directories
mkdir -p apps/www
mkdir -p packages/ui/src/{components/{ui,registry},hooks,lib,styles}
mkdir -p tooling/typescript
mkdir -p .changeset
mkdir -p .github/workflows
```

**Checkpoint:** `[ ]` Directory structure created

---

## Phase 3: Move Current App to apps/www

### 3.1 Move Source Files

```bash
# Move app code
mv src apps/www/
mv public apps/www/
mv next.config.ts apps/www/
mv postcss.config.mjs apps/www/
```

### 3.2 Create apps/www/package.json

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
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.506.0",
    "next": "^16.0.10",
    "next-themes": "^0.4.6",
    "react": "^19.2.3",
    "react-day-picker": "^9.12.0",
    "react-dom": "^19.2.3",
    "react-hook-form": "^7.68.0",
    "react-resizable-panels": "^3.0.6",
    "sonner": "^2.0.7",
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

**Checkpoint:** `[ ]` apps/www configured

---

## Phase 4: Set Up packages/ui

### 4.1 Create packages/ui/package.json

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
    "./lib/*": "./src/lib/*.ts",
    "./styles/*": "./src/styles/*"
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

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "usage-ui",
  "homepage": "https://usage-ui.vercel.app",
  "items": []
}
```

### 4.4 Create packages/ui/components.json

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

### 4.5 Copy Shared Code to packages/ui

```bash
# Copy utilities
cp apps/www/src/lib/utils.ts packages/ui/src/lib/

# Copy base shadcn components
cp -r apps/www/src/components/ui/* packages/ui/src/components/ui/

# Create styles with meter CSS variables
```

### 4.6 Create packages/ui/src/styles/globals.css

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
    --meter-success: oklch(0.627 0.194 142.5);
    --meter-warning: oklch(0.695 0.184 86.047);
    --meter-danger: oklch(0.577 0.237 25.331);
    --meter-info: oklch(0.523 0.214 259.1);
    --meter-track: oklch(0.269 0.006 264.5);
    --meter-track-foreground: oklch(0.708 0.03 264.5);
  }
}
```

**Checkpoint:** `[ ]` packages/ui configured

---

## Phase 5: Shared Tooling

### 5.1 Create tooling/typescript/base.json

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

### 5.2 Create .changeset/config.json

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

**Checkpoint:** `[ ]` CI/CD configured

---

## Phase 7: Install and Verify

```bash
# Remove old node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Install all dependencies
pnpm install

# Verify builds work
pnpm build

# Start dev server
pnpm dev
```

**Checkpoint:** `[ ]` Build succeeds

---

## Phase 8: Cleanup

### 8.1 Remove Demo Components (Optional)

```bash
rm -f apps/www/src/components/brand-header.tsx
rm -f apps/www/src/components/brand-sidebar.tsx
rm -f apps/www/src/components/hero.tsx
rm -f apps/www/src/components/login.tsx
rm -f apps/www/src/components/logo.tsx
rm -f apps/www/src/components/product-grid.tsx
rm -f apps/www/src/components/promo.tsx
```

### 8.2 Clean registry.json

Remove demo items from `packages/ui/registry.json`, keeping only the schema and empty items array.

### 8.3 Update Documentation

- [ ] Update README.md with monorepo structure
- [ ] Update CLAUDE.md
- [ ] Update AGENTS.md
- [ ] Update .cursor/rules/

**Checkpoint:** `[ ]` Cleanup complete

---

## Final Verification Checklist

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` builds all packages
- [ ] `pnpm dev` starts the dev server
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `http://localhost:3000` loads correctly
- [ ] Git hooks work (`pnpm lefthook install`)

---

## Post-Migration: First Component

Once migration is complete, validate by creating the first component:

1. Create `packages/ui/src/components/registry/usage-meter/`
2. Add `usage-meter.tsx` and `usage-meter-base.tsx`
3. Add to `packages/ui/registry.json`
4. Run `pnpm build`
5. Test: `npx shadcn add http://localhost:3000/r/usage-meter.json`

See [ARCHITECTURE.md](./ARCHITECTURE.md) for component templates and detailed guidance.

---

## Troubleshooting

### "Workspace package not found"

Ensure `pnpm-workspace.yaml` is at root and includes all package paths.

### "Cannot find module @usage-ui/ui"

Check `apps/www/tsconfig.json` has the correct path mapping.

### "turbo: command not found"

Run `pnpm install` to install turbo as a devDependency.

### Build fails with type errors

Ensure `tooling/typescript/base.json` exists and all tsconfigs extend it.
