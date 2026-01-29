<h1 align="center">Usage UI</h1>

<p align="center">
  A shadcn/ui component registry for building usage meters, quota indicators, and resource consumption visualizations.
</p>

<p align="center">
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#components"><strong>Components</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#monorepo-structure"><strong>Monorepo Structure</strong></a> ·
  <a href="https://ui.shadcn.com/docs/registry"><strong>Registry Docs</strong></a>
</p>

<br/>

## Overview

Usage UI is a **shadcn-style component registry** (not an npm package) focused on usage meters and quota visualization. Built as a **monorepo** using pnpm workspaces and Turborepo, components are distributed via the shadcn CLI and copied directly into your project—you own and modify the code.

### Key Features

- **Usage-focused components**: Linear meters, circular gauges, quota cards, and more
- **Full shadcn/ui compatibility**: Works with the shadcn CLI and theming system
- **Dual primitive support**: Both Radix-based (accessible) and lightweight base versions
- **Monorepo architecture**: Clean separation between docs site and component library
- **Modern stack**: Next.js 16+, React 19, TypeScript, Tailwind CSS v4
- **OKLCH color space**: Modern color system with semantic CSS variables

## Installation

Install components using the shadcn CLI:

```bash
# Add a single component
npx shadcn add https://usage-ui.vercel.app/r/usage-meter.json

# Or configure the registry in your components.json for cleaner installs
```

### Registry Setup (Optional)

Add to your `components.json` for namespaced installs:

```json
{
  "registries": {
    "usage-ui": {
      "url": "https://usage-ui.vercel.app/r"
    }
  }
}
```

Then install with:

```bash
npx shadcn add @usage-ui/usage-meter
```

## Components

### Planned Component Library

| Category | Components |
|----------|------------|
| **Core Meters** | `usage-meter`, `circular-meter`, `segmented-meter`, `stacked-meter`, `gradient-meter`, `stepped-meter` |
| **Cards** | `quota-card`, `usage-summary`, `storage-card`, `plan-usage-card`, `resource-card` |
| **Indicators** | `usage-badge`, `threshold-indicator`, `limit-warning`, `overage-indicator` |
| **Data Viz** | `usage-chart`, `usage-breakdown`, `comparison-bar` |
| **Utilities** | `usage-tooltip`, `usage-legend` |

> **Note**: This project is in active development. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full roadmap.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Monorepo** | pnpm 9+ + Turborepo | Workspace management |
| Next.js | 16+ | Framework (App Router, RSC) |
| React | 19 | UI Library |
| TypeScript | 5.4+ | Type Safety |
| Tailwind CSS | 4.1+ | Styling (OKLCH colors) |
| Radix UI | 1.4+ | Accessible Primitives |
| Recharts | 2.15+ | Charts |
| Biome | 1.9+ | Linting & Formatting |
| Changesets | 2.27+ | Version Management |

## Running Locally

```bash
# Install dependencies
pnpm install

# Start all development servers
pnpm dev

# Start only the docs site
pnpm dev --filter=@usage-ui/www

# Build all packages
pnpm build

# Build only the UI package
pnpm build --filter=@usage-ui/ui

# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck
```

Your docs site will be running at [localhost:3000](http://localhost:3000).

## Monorepo Structure

```
usage-ui/
├── apps/
│   └── www/                    # Documentation + demo site (@usage-ui/www)
│       ├── src/
│       │   ├── app/            # Next.js pages
│       │   └── components/     # Site-specific components
│       └── public/r/           # Generated registry JSON (do not edit)
│
├── packages/
│   └── ui/                     # Component registry (@usage-ui/ui)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/         # Base shadcn components (do not modify)
│       │   │   └── registry/   # YOUR meter components go here
│       │   ├── hooks/          # Shared hooks
│       │   ├── lib/            # Utilities (cn, etc.)
│       │   └── styles/         # CSS variables
│       ├── registry.json       # Component manifest (CRITICAL)
│       └── components.json     # shadcn CLI config
│
├── tooling/
│   └── typescript/             # Shared TypeScript configs
│
├── turbo.json                  # Build orchestration
├── pnpm-workspace.yaml         # Workspace definition
└── lefthook.yml                # Git hooks
```

### Package Names

| Package | Name | Location |
|---------|------|----------|
| Documentation Site | `@usage-ui/www` | `apps/www/` |
| Component Library | `@usage-ui/ui` | `packages/ui/` |

### Key Files

| File | Location | Purpose |
|------|----------|---------|
| `registry.json` | `packages/ui/` | Component manifest for shadcn CLI |
| `components.json` | `packages/ui/` | shadcn CLI configuration |
| `globals.css` | `packages/ui/src/styles/` | Meter CSS variables |
| `public/r/*.json` | `apps/www/` | Generated registry files (do not edit) |

## Theming

Customize the theme by modifying CSS variables in `packages/ui/src/styles/globals.css`. This project uses OKLCH color space for modern color management.

```css
:root {
  --meter-success: oklch(0.723 0.191 142.5);
  --meter-warning: oklch(0.795 0.184 86.047);
  --meter-danger: oklch(0.637 0.237 25.331);
  --meter-info: oklch(0.623 0.214 259.1);
}
```

## Open in v0

Components support the "Open in v0" workflow for AI-assisted development:

[![Open in v0](https://registry-starter.vercel.app/open-in-v0.svg)](https://v0.dev/chat/api/open?title=Usage+UI&prompt=These+are+existing+design+system+styles+and+files.+Please+utilize+them+alongside+base+components+to+build.&url=https%3A%2F%2Fusage-ui.vercel.app%2Fr%2Ftheme.json)

## MCP Support

This registry works with AI coding tools (Cursor, Windsurf) via MCP. The `registry.json` includes theme and component definitions that AI tools can use to understand your design system.

## Contributing

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Create components in `packages/ui/src/components/registry/`
4. Add entries to `packages/ui/registry.json`
5. Test locally: `pnpm dev`
6. Create a changeset: `pnpm changeset`
7. Submit a PR

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full architecture guide and component roadmap
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CLAUDE.md](./CLAUDE.md) - AI agent context file
- [AGENTS.md](./AGENTS.md) - Quick reference for AI coding assistants
- [shadcn/ui Registry Docs](https://ui.shadcn.com/docs/registry) - Official registry documentation

## License

MIT