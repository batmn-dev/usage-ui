# ADR-005: Component Documentation and Preview Strategy

## Status

**Accepted** - January 2025

## Context

To improve the documentation experience and align with industry standards (shadcn/ui, prompt-kit), we evaluated multiple approaches for:

1. How to access component source code for "Code" tabs
2. How to structure documentation pages
3. How to render component previews
4. How to document component props/API

This decision follows research documented in `.agents/context/research/prompt-kit-component-page-analysis.md`.

---

## Decision 1: Source Code Access Strategy

### Selected: Option A (filesystem) + Option B (registry.json) hybrid

**Approach:**
- **Docs site**: Read source files from filesystem at build time using `fs.readFileSync`
- **Registry distribution**: Embed source in generated JSON files for shadcn CLI

```typescript
// lib/code.ts - For docs site
import fs from "fs"
import { cache } from "react"

export const extractCodeFromFilePath = cache((filePath: string) => {
  return fs.readFileSync(filePath, "utf-8")
})
```

### Rationale

| Consideration | Analysis |
|---------------|----------|
| **Prompt-kit precedent** | Uses filesystem reads for docs - proven, simple |
| **shadcn/ui precedent** | Embeds source in registry JSON for CLI distribution |
| **Maintenance** | Filesystem reads always reflect actual code (no drift) |
| **Performance** | React cache + static generation = fast |
| **Monorepo fit** | Works well - read from `packages/ui/src/components/` |

### Alternatives Rejected

- **Fetch from GitHub raw URLs**: Network dependency, rate limiting, slower
- **Registry.json only**: Bloats JSON, harder to maintain, can drift

---

## Decision 2: Documentation Format

### Selected: Option A (MDX-based docs)

**Approach:**
- Use MDX files for component documentation
- Each component gets a dedicated MDX file with examples, usage, and API reference
- Custom MDX components for Preview/Code tabs, API tables

```
apps/www/src/app/docs/
├── usage-meter/
│   ├── page.mdx                    # Main documentation
│   ├── usage-meter-basic.tsx       # Example variant
│   └── usage-meter-advanced.tsx    # Example variant
```

### Rationale

| Consideration | Analysis |
|---------------|----------|
| **Industry standard** | shadcn/ui, Radix, prompt-kit, Chakra all use MDX |
| **Rich content** | Supports prose, callouts, warnings, custom components |
| **SEO** | Static content is better for search engines |
| **Flexibility** | Mix markdown prose with React components |
| **Scalability** | Well-suited for growing component libraries |

### Alternatives Rejected

- **Dynamic routes only**: Less flexible, harder to write custom prose
- **Hybrid**: Two systems create confusion about where content lives

### Migration Note

Current implementation uses dynamic `[name]/page.tsx` routes. Migration path:
1. Set up MDX infrastructure (@mdx-js/loader, mdx-components.tsx)
2. Create MDX templates for new components
3. Gradually migrate existing component pages

---

## Decision 3: Preview Rendering Strategy

### Selected: Option C (Hybrid)

**Approach:**
- **Blocks** (full-page layouts): Render in iframe for complete isolation
- **UI components** (buttons, meters, cards): Render directly in the page

```tsx
const isBlock = component.type === "registry:block"

return isBlock ? (
  <iframe src={`/demo/${name}`} className="h-[800px] w-full" />
) : (
  <div className="min-h-[350px] rounded-md border p-8">
    <ComponentPreview component={component} />
  </div>
)
```

### Rationale

| Component Type | Best Approach | Why |
|----------------|---------------|-----|
| **Blocks** (dashboards, pages) | iframe | Need full viewport, own CSS scope |
| **UI components** (buttons, inputs) | Direct | Theme-aware, inspectable, lighter |

This matches shadcn/ui's approach: simple components render inline, complex "blocks" get their own demo pages.

### Alternatives Rejected

- **iframe only**: Heavy for small components, theme doesn't sync
- **Direct only**: Full-page blocks don't fit, layout breaks

---

## Decision 4: Props/API Documentation

### Selected: Option A (Manual markdown tables in MDX)

**Approach:**
- Write API Reference tables manually in MDX files
- Follow shadcn/ui's format: Prop | Type | Default columns

```mdx
## API Reference

### UsageMeter

| Prop | Type | Default |
|------|------|---------|
| `value` | `number` | Required |
| `max` | `number` | `100` |
| `variant` | `"default" \| "success" \| "warning" \| "danger"` | `"default"` |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` |
```

### Rationale

**What shadcn/ui does:**
shadcn/ui uses manual markdown tables in MDX files for API documentation. Example from their Button docs:

```markdown
## API Reference

### Button

| Prop | Type | Default |
|------|------|---------|
| `variant` | `"default" | "outline" | "ghost" | "destructive" | "secondary" | "link"` | `"default"` |
| `size` | `"default" | "xs" | "sm" | "lg" | "icon"` | `"default"` |
| `asChild` | `boolean` | `false` |
```

| Consideration | Analysis |
|---------------|----------|
| **shadcn/ui alignment** | Matches their approach exactly |
| **Prompt-kit alignment** | Also uses manual markdown tables |
| **Simplicity** | No tooling required, just markdown |
| **Control** | Human-written descriptions are clearer |
| **Trade-off** | Manual = can drift, but component count is manageable |

### Alternatives Considered for Future

As component count grows (10+), consider:
- **JSDoc extraction**: Write docs in code, auto-generate tables
- **TypeScript type extraction**: Use `react-docgen-typescript`

These add build complexity but ensure docs stay in sync with code.

---

## Decision 5: Theme Synchronization for Direct Rendering

### Selected: CSS Variable Inheritance (No Additional Providers Needed)

**Approach:**
- Direct rendering of UI components inherits theme automatically via CSS variables
- No additional context providers or wrapper components required
- Dark mode toggle updates `:root` CSS variables, which automatically propagate to all descendants

```tsx
// Direct rendering - theme inherits naturally
<div className="flex min-h-[350px] items-center justify-center rounded-md border p-8">
  <UsageMeter value={75} variant="warning" />
</div>
```

### Rationale

| Consideration | Analysis |
|---------------|----------|
| **CSS variable cascade** | Variables on `:root` cascade to all descendants automatically |
| **shadcn theme toggle** | Updates CSS variables on document element, affecting all components |
| **prompt-kit pattern** | Uses direct rendering with CSS variable inheritance |
| **No extra bundle** | Avoids React context overhead |
| **Dark mode** | `dark:` Tailwind utilities + CSS variables work seamlessly |

### How It Works

1. **Theme CSS Variables** defined in `globals.css`:
```css
:root {
  --background: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  --meter-success: oklch(0.723 0.191 142.5);
}
.dark {
  --background: oklch(0.145 0 0);
  --primary: oklch(0.922 0 0);
}
```

2. **Components use variables**:
```tsx
<div className="bg-background text-foreground">
  <div className="bg-[--meter-success]" />
</div>
```

3. **Theme toggle** updates document class:
```tsx
// next-themes handles this automatically
document.documentElement.classList.toggle("dark");
```

### When Iframe Isolation is Needed

For **blocks** (full-page layouts), use iframe rendering:
- Blocks may have their own layout/styles that conflict with docs page
- Iframe provides complete CSS isolation
- Demo pages (`/demo/[name]`) load full theme context

```tsx
// For registry:block type
<iframe src={`/demo/${name}`} className="h-[800px] w-full" />
```

### No Provider Wrappers Needed

Unlike some theming solutions that require context providers, shadcn/ui's CSS variable approach means:
- ✅ No `<ThemeProvider>` wrapper around previews
- ✅ No `useTheme()` hook needed in preview components
- ✅ Components are portable - they just read CSS variables

---

## Decision 6: Auto-Generated API Documentation

### Selected: Build-Time TypeScript Extraction with react-docgen-typescript

**Approach:**
- Use `react-docgen-typescript` to extract props from TypeScript interfaces at build time
- Generate structured JSON data for `ApiTable` component consumption
- Supplement with JSDoc comments for descriptions
- Run as part of the build pipeline, not at runtime

### Implementation Strategy

**Phase 1: Infrastructure (Immediate)**

1. Install dependency:
```bash
pnpm add -D react-docgen-typescript --filter=@usage-ui/www
```

2. Create extraction utility at `apps/www/src/lib/extract-props.ts`

3. Extract at build time using `generateStaticParams` or a prebuild script

**Phase 2: Integration**

```tsx
// In docs/[slug]/page.tsx
import { extractComponentProps } from "@/lib/extract-props"

const props = await extractComponentProps("usage-meter")
// Returns: [{ prop: "value", type: "number", required: true, description: "Current value" }, ...]

<ApiTable data={props} />
```

### Rationale

| Consideration | Analysis |
|---------------|----------|
| **Source of truth** | TypeScript interfaces are the canonical API definition |
| **Maintenance** | Docs auto-update when interfaces change |
| **JSDoc support** | Extracts `/** comments */` as descriptions |
| **Industry precedent** | Used by Storybook, Docz, React Styleguidist |
| **shadcn approach** | Manual tables, but their component count justifies it |
| **Our scale** | Automation justified even with small component count |

### Props Extraction Output Format

```typescript
interface PropInfo {
  prop: string        // "value"
  type: string        // "number"
  default?: string    // "100"
  required: boolean   // true
  description?: string // "Current usage value"
}
```

### JSDoc Convention for Components

Document props with JSDoc comments:

```typescript
interface UsageMeterProps {
  /** Current value (required) */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Visual variant */
  variant?: "default" | "success" | "warning" | "danger"
}
```

### Trade-offs vs Manual Tables

| Manual Tables | Auto-Generated |
|---------------|----------------|
| ✅ Full prose control | ✅ Always in sync with code |
| ❌ Can drift from code | ✅ Extracts JSDoc descriptions |
| ✅ No build dependency | ❌ Adds build-time processing |
| ❌ Duplicate maintenance | ✅ Single source of truth |

**Decision**: Auto-generation is worth the build complexity for consistency and reduced maintenance.

---

## Implementation Plan

### Phase 1: Infrastructure
1. Add Shiki for syntax highlighting
2. Create code extraction utility (`lib/code.ts`)
3. Set up MDX loader and components
4. **Add `extract-props.ts` for auto-generated API docs**

### Phase 2: Core Components
5. Build `ComponentCodePreview` (Preview/Code tabs)
6. Build `ApiTable` component
7. Build `CodeRenderer` (Shiki wrapper)

### Phase 3: Documentation
8. Create `/docs/[slug]` route with new template
9. Create documentation pages for components
10. Add Previous/Next navigation
11. **Update sidebar links to use `/docs/` routes**
12. **Remove old `/registry/[name]` route**

---

## Consequences

### Positive
- Aligns with shadcn/ui and prompt-kit patterns
- Rich, flexible documentation format
- Better developer experience for docs contributors
- SEO benefits from static MDX content

### Negative
- Migration effort from current dynamic routes
- MDX adds build complexity
- Manual props tables require discipline to keep updated

---

## References

- [prompt-kit component page analysis](./../research/prompt-kit-component-page-analysis.md)
- [shadcn/ui Button docs](https://ui.shadcn.com/docs/components/button)
- [prompt-kit GitHub](https://github.com/ibelick/prompt-kit)
