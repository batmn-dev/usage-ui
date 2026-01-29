# Workflow: Add a Registry Component

> Step-by-step procedure for adding a new component to the Usage UI registry.

---

## Prerequisites

- [ ] Monorepo setup is complete (Phase 0 in ARCHITECTURE.md)
- [ ] You know which package the component belongs to (`@usage-ui/ui`)
- [ ] You've determined if it needs Radix + Base versions

---

## Steps

### 1. Create Component Directory

```bash
mkdir -p packages/ui/src/components/registry/[component-name]
```

### 2. Create Component File(s)

**For Radix-based component:**
```bash
touch packages/ui/src/components/registry/[component-name]/[component-name].tsx
```

**For Base version (if needed):**
```bash
touch packages/ui/src/components/registry/[component-name]/[component-name]-base.tsx
```

### 3. Implement the Component

Use this template:

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add props
}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="component-name"
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

### 4. Create Index File

Create `packages/ui/src/components/registry/[component-name]/index.ts`:

```ts
export { ComponentName } from "./component-name"
export type { ComponentNameProps } from "./component-name"

// If base version exists:
export { ComponentNameBase } from "./component-name-base"
export type { ComponentNameBaseProps } from "./component-name-base"
```

### 5. Add to registry.json

Edit `packages/ui/registry.json`, add to `items` array:

```json
{
  "name": "component-name",
  "type": "registry:component",
  "title": "Component Name",
  "description": "Description of what it does",
  "dependencies": [],
  "registryDependencies": [],
  "files": [
    {
      "path": "src/components/registry/component-name/component-name.tsx",
      "type": "registry:component",
      "target": "components/ui/component-name.tsx"
    }
  ]
}
```

### 6. Build and Verify

```bash
# Build the registry
pnpm build

# Verify JSON was generated
ls apps/www/public/r/component-name.json
```

### 7. Test Installation

```bash
# Start dev server
pnpm dev

# In a separate test project:
npx shadcn add http://localhost:3000/r/component-name.json
```

### 8. Create Changeset (if notable change)

```bash
pnpm changeset
# Select @usage-ui/ui
# Choose patch/minor based on change type
# Write description
```

### 9. Create Documentation Page (After Component Complete)

**Create:** `apps/www/src/content/docs/[component-name].mdx`

Use the MDX template:

```mdx
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
| `value` | `number` | Required | The current value |
| `max` | `number` | `100` | The maximum value |
| `variant` | `"default" \| "success" \| "warning" \| "danger"` | `"default"` | Visual variant |

## Accessibility

[Include ARIA details if component uses Radix primitives]
```

**Validation:**

```bash
# Start dev server
pnpm dev --filter=@usage-ui/www

# Visit documentation page
open http://localhost:3000/docs/[component-name]
```

---

## Validation Checklist

- [ ] Component renders without errors
- [ ] All variants work (if applicable)
- [ ] TypeScript has no errors: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Generated JSON exists in `apps/www/public/r/`
- [ ] Installation works via shadcn CLI
- [ ] Documentation page exists at `apps/www/src/content/docs/[component-name].mdx`
- [ ] Documentation page renders without errors at `/docs/[component-name]`

---

## Troubleshooting

### "Module not found" after installation

**Cause**: Using relative imports instead of path aliases.

**Fix**: Replace `../../lib/utils` with `@/lib/utils`.

### Component not appearing in registry

**Cause**: Missing or malformed entry in `registry.json`.

**Fix**: Validate JSON syntax, ensure `files[].path` is correct.

### Build fails with type errors

**Cause**: Missing types or incorrect props interface.

**Fix**: Ensure all props are typed, use `React.HTMLAttributes<HTMLElement>` as base.

### "use client" errors

**Cause**: Missing directive for client components.

**Fix**: Add `"use client"` as first line for any component using hooks, state, or Radix.
