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

## Implementation Plan

### Phase 1: Infrastructure
1. Add Shiki for syntax highlighting
2. Create code extraction utility (`lib/code.ts`)
3. Set up MDX loader and components

### Phase 2: Core Components
4. Build `ComponentCodePreview` (Preview/Code tabs)
5. Build `ApiTable` component
6. Build `CodeRenderer` (Shiki wrapper)

### Phase 3: Documentation
7. Create MDX template for component docs
8. Migrate existing component pages to MDX
9. Add Previous/Next navigation

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
