# Project Glossary

> Domain-specific terminology for Usage UI. AI agents should reference this when encountering unfamiliar terms.

---

## Architecture Terms

### Monorepo
A single repository containing multiple packages/projects. Usage UI uses pnpm workspaces + Turborepo.

### Workspace
A pnpm workspace is a package within the monorepo. We have:
- `@usage-ui/www` - Documentation site (apps/www)
- `@usage-ui/ui` - Component registry (packages/ui)

### Turborepo
Build orchestration tool that caches builds and runs tasks in parallel across workspaces.

### Changesets
Versioning and changelog management tool for monorepos. Creates `.changeset/*.md` files that become CHANGELOG entries.

---

## shadcn/ui Terms

### Registry
A collection of components distributed via the shadcn CLI. NOT an npm package. Components are copied into user projects.

### Registry Item
A single distributable component in the registry, defined in `registry.json`.

### Base shadcn Components
Components in `packages/ui/src/components/ui/`. These are upstream shadcn components. **DO NOT MODIFY**.

### Registry Components
Components in `packages/ui/src/components/registry/`. These are YOUR custom components.

### registry.json
The manifest file listing all distributable components. Location: `packages/ui/registry.json`. **CRITICAL FILE**.

### components.json
Configuration for the shadcn CLI. Defines aliases, styles, and paths.

### registryDependencies
Other registry items that must be installed alongside a component (e.g., `["card", "usage-meter"]`).

---

## Styling Terms

### OKLCH
A perceptually uniform color space used for CSS variables. Format: `oklch(lightness chroma hue)`.
```css
--meter-success: oklch(0.723 0.191 142.5);
```

### CSS Variables
Theme tokens defined in `globals.css`. Always use these instead of hardcoded colors.
```tsx
// ✅ Correct
className="bg-primary text-primary-foreground"

// ❌ Wrong
className="bg-blue-500 text-white"
```

### cn() Utility
Class merging function from `@/lib/utils`. Combines clsx + tailwind-merge.

### data-slot
A `data-*` attribute convention for styling hooks. Required on all components.
```tsx
<div data-slot="usage-meter" />
```

---

## Component Terms

### Radix Version
Component built on Radix UI primitives. Full accessibility (ARIA, keyboard nav, focus management). Slightly larger bundle.

### Base Version
Component without Radix dependency. Pure HTML + manual ARIA. Smaller bundle. User adds accessibility as needed.

### Core Meters
Fundamental meter components: `usage-meter`, `circular-meter`, `segmented-meter`, `stacked-meter`, `stepped-meter`, `gradient-meter`.

### Compound Components
Components composed of other components (e.g., `quota-card` uses `card` + `usage-meter`).

### Indicators
Visual status components: `usage-badge`, `threshold-indicator`, `limit-warning`, `overage-indicator`.

---

## React/Next.js Terms

### RSC (React Server Component)
Default component type in Next.js App Router. No `"use client"` directive. Cannot use hooks or browser APIs.

### Client Component
Component with `"use client"` directive. Can use hooks, state, and browser APIs. Required for Radix components.

### forwardRef
React pattern for passing refs through components. Required for DOM-forwarding components.

---

## File Location Reference

| Term | Location |
|------|----------|
| Base shadcn (don't modify) | `packages/ui/src/components/ui/` |
| Your components | `packages/ui/src/components/registry/` |
| Registry manifest | `packages/ui/registry.json` |
| CSS variables | `packages/ui/src/styles/globals.css` |
| Generated JSON | `apps/www/public/r/` (auto-generated, never edit) |
| Documentation | `apps/www/src/app/docs/` |

---

## Command Reference

| Term | Command |
|------|---------|
| Build all | `pnpm build` |
| Dev all | `pnpm dev` |
| Build UI only | `pnpm build --filter=@usage-ui/ui` |
| Add dep to UI | `pnpm add <pkg> --filter=@usage-ui/ui` |
| Create changeset | `pnpm changeset` |

---

## Abbreviations

| Abbrev | Meaning |
|--------|---------|
| ADR | Architecture Decision Record |
| CLI | Command Line Interface |
| RSC | React Server Component |
| CVA | Class Variance Authority |
| PR | Pull Request |
