# Contributing to Usage UI

Thank you for your interest in contributing to Usage UI! This guide will help you get started.

## Prerequisites

- Node.js 22+
- pnpm 9.15+
- Basic understanding of React, TypeScript, and Tailwind CSS
- Familiarity with shadcn/ui patterns

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/usage-ui.git
cd usage-ui

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Project Structure

```
usage-ui/
├── apps/www/               # Documentation site
├── packages/ui/            # Component registry
│   └── src/components/
│       ├── ui/             # Base shadcn (don't modify)
│       └── registry/       # YOUR components go here
└── tooling/                # Shared configs
```

## Adding a New Component

### Step 1: Create Component Directory

```bash
mkdir -p packages/ui/src/components/registry/my-component
```

### Step 2: Create Component Files

**Radix Version** (`my-component.tsx`):
```tsx
"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

interface MyComponentProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "warning" | "danger"
}

const MyComponent = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  MyComponentProps
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="my-component"
      className={cn("base-classes", className)}
      {...props}
    />
  )
})
MyComponent.displayName = "MyComponent"

export { MyComponent }
export type { MyComponentProps }
```

**Base Version** (`my-component-base.tsx`) - for lightweight usage without Radix:
```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MyComponentBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger"
}

const MyComponentBase = React.forwardRef<HTMLDivElement, MyComponentBaseProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        data-slot="my-component"
        className={cn("base-classes", className)}
        {...props}
      />
    )
  }
)
MyComponentBase.displayName = "MyComponentBase"

export { MyComponentBase }
export type { MyComponentBaseProps }
```

**Index File** (`index.ts`):
```ts
export { MyComponent } from "./my-component"
export type { MyComponentProps } from "./my-component"

export { MyComponentBase } from "./my-component-base"
export type { MyComponentBaseProps } from "./my-component-base"
```

### Step 3: Add to Registry

Edit `packages/ui/registry.json`:

```json
{
  "items": [
    {
      "name": "my-component",
      "type": "registry:component",
      "title": "My Component",
      "description": "A brief description of what this component does.",
      "dependencies": [],
      "registryDependencies": [],
      "files": [
        {
          "path": "packages/ui/src/components/registry/my-component/my-component.tsx",
          "type": "registry:component",
          "target": "components/ui/my-component.tsx"
        }
      ]
    },
    {
      "name": "my-component-base",
      "type": "registry:component",
      "title": "My Component (Base)",
      "description": "Lightweight version without Radix dependency.",
      "dependencies": [],
      "registryDependencies": [],
      "files": [
        {
          "path": "packages/ui/src/components/registry/my-component/my-component-base.tsx",
          "type": "registry:component",
          "target": "components/ui/my-component-base.tsx"
        }
      ]
    }
  ]
}
```

### Step 4: Build and Test

```bash
# Build the registry
pnpm build

# Test installation in a separate project
npx shadcn add http://localhost:3000/r/my-component.json
```

### Step 5: Add Documentation (Optional but Encouraged)

Create a demo page at `apps/www/src/app/docs/my-component/page.tsx`.

### Step 6: Create a Changeset

```bash
pnpm changeset
```

Follow the prompts to describe your changes.

## Code Style Guidelines

### Do's

- ✅ Use `@/` path aliases for imports
- ✅ Use `cn()` for className merging
- ✅ Add `data-slot="name"` to root element
- ✅ Use shadcn CSS variables (`bg-primary`, `text-muted-foreground`)
- ✅ Export types alongside components
- ✅ Use TypeScript strict mode patterns
- ✅ Create both Radix and Base versions for core meters

### Don'ts

- ❌ Use relative imports (`../../lib/utils`)
- ❌ Use hardcoded colors (`bg-blue-500`)
- ❌ Use default exports
- ❌ Skip TypeScript types
- ❌ Use `npm` (use `pnpm`)
- ❌ Modify base shadcn components in `packages/ui/src/components/ui/`

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-component`
3. **Make** your changes following the guidelines above
4. **Test** your changes: `pnpm lint && pnpm typecheck && pnpm build`
5. **Create** a changeset: `pnpm changeset`
6. **Commit** using conventional commits: `feat: add my-component`
7. **Push** to your fork
8. **Open** a pull request

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add usage-meter component
fix: correct variant colors in circular-meter
docs: add usage examples for quota-card
refactor: simplify meter calculation logic
chore: update dependencies
```

## Quality Gates

Your PR must pass:

- [ ] `pnpm lint` - No linting errors
- [ ] `pnpm typecheck` - No TypeScript errors
- [ ] `pnpm build` - Build succeeds
- [ ] Registry JSON is valid
- [ ] Component renders correctly
- [ ] Both Radix and Base versions work (if applicable)

## Questions?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical decisions
- Check [CLAUDE.md](./CLAUDE.md) for AI assistant context
- Open an issue for questions or discussions

Thank you for contributing!
