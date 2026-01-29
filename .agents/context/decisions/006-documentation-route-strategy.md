# ADR-006: Documentation Route Strategy

## Status

**Accepted** - January 2025

## Context

The documentation redesign (ADR-005) introduces new `/docs/[slug]` routes with enhanced MDX-based documentation. The project currently uses `/registry/[name]` routes for component pages. We need to decide on the URL structure for documentation pages.

### Current State Analysis

**Existing routes:**
- `/registry/[name]` - Component detail pages (e.g., `/registry/usage-meter`)
- Internal links from sidebar, home page, and "About" section use `/registry/[name]`
- `public/r/[name].json` files serve the shadcn CLI (separate from page routes)

**Project status:**
- New project, not yet publicly launched
- `X-Robots-Tag: noindex` header prevents indexing
- No external links to preserve
- No backward compatibility requirements

---

## Decision

### Selected: Direct replacement (no redirects needed)

**Approach:**
1. Create new `/docs/[slug]` routes as the documentation pages
2. Remove the `/registry/[name]` route entirely
3. Update all internal links to use `/docs/[name]`

Since this is a new project with no external dependencies on the current URLs, there's no need for a transitional redirect period.

### Implementation

**Step 1: Create new docs route**

Create `apps/www/src/app/docs/[slug]/page.tsx` with the new documentation template.

**Step 2: Update internal links**

Update all internal links to use `/docs/[name]`:

1. `registry-sidebar.tsx`:
   - Change `href={"/registry/${item.name}"}` → `href={"/docs/${item.name}"}`

2. Home page `page.tsx`:
   - Change `href={"/registry/${item.name}"}` → `href={"/docs/${item.name}"}`
   - Change `href="/registry/blank"` → `href="/docs/blank"`

**Step 3: Remove old route**

Delete `apps/www/src/app/(registry)/registry/[name]/page.tsx` once the new route is working.

---

## Rationale

### Why direct replacement?

| Factor | Analysis |
|--------|----------|
| **New project** | No external links or bookmarks to preserve |
| **Simplicity** | No redirect configuration needed |
| **Clean codebase** | Single route, no transitional code |
| **shadcn alignment** | shadcn/ui uses `/docs/components/[name]` pattern |

### Why `/docs/` over `/registry/`?

- Industry standard for documentation sites
- Clearer intent - these are documentation pages, not registry endpoints
- Registry JSON files live at `/r/[name].json` (different concern)

---

## Consequences

### Positive

- Clean URL structure aligned with industry standards (`/docs/`)
- Single documentation source, no maintenance overhead
- No redirect configuration complexity
- Immediate clean slate

### Neutral

- Registry JSON files (`/r/[name].json`) are unaffected (separate concern)
- Demo routes (`/demo/[name]`) remain unchanged

---

## Implementation Checklist

- [ ] Create `/docs/[slug]/page.tsx` with new documentation template
- [ ] Create `/docs/layout.tsx` for docs layout
- [ ] Update `registry-sidebar.tsx` to use `/docs/` links
- [ ] Update home `page.tsx` to use `/docs/` links
- [ ] Delete `/registry/[name]/page.tsx`
- [ ] Verify all links work correctly

---

## References

- [ADR-005: Component Documentation and Preview Strategy](./005-component-documentation-strategy.md)
- [shadcn/ui URL structure](https://ui.shadcn.com/docs/components)
