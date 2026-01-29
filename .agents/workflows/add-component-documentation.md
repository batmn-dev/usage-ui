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

```bash
touch apps/www/src/content/docs/[component-name].mdx
```

### 2. Add Frontmatter

```mdx
---
title: Component Name
description: Brief description of the component.
---
```

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

```bash
# Start dev server
pnpm dev --filter=@usage-ui/www

# Visit the page
open http://localhost:3000/docs/[component-name]
```

### 6. Build and Test

```bash
pnpm build --filter=@usage-ui/www
```

---

## MDX Template

```mdx
---
title: Component Name
description: Brief description of the component.
---

# Component Name

[Description paragraph explaining the component's purpose and use cases.]

## Examples

### Basic Usage

<ComponentCodePreview name="component-name">
  {/* Preview content */}
</ComponentCodePreview>

### With Variants

[If the component has variants, show additional examples]

<ComponentCodePreview name="component-name-variants">
  {/* Variant preview content */}
</ComponentCodePreview>

## Installation

<InstallationTabs componentName="component-name" />

## Usage

\`\`\`tsx
import { ComponentName } from "@/components/ui/component-name"

export function MyComponent() {
  return (
    <ComponentName
      prop="value"
    />
  )
}
\`\`\`

## API Reference

### ComponentName

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | Required | The current value |
| `max` | `number` | `100` | The maximum value |
| `variant` | `"default" \| "success"` | `"default"` | Visual variant |
| `className` | `string` | — | Additional CSS classes |

## Accessibility

[If using Radix primitives, document accessibility features:]

- Proper semantic HTML elements
- ARIA attributes (`aria-label`, `aria-valuenow`, etc.)
- Keyboard navigation support
- Screen reader announcements
```

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

### "Cannot find module" error

**Cause**: MDX components not exported from mdx-components.tsx.

**Fix**: Add ComponentCodePreview and InstallationTabs to the useMDXComponents return object.

---

## References

- Component Creation: `.agents/workflows/add-registry-component.md`
- Documentation Strategy: `.agents/context/decisions/005-component-documentation-strategy.md`
- Implementation Guide: `.agents/workflows/implement-documentation-redesign.md`
