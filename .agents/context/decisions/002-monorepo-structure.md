# ADR-002: Adopt Lightweight Monorepo Structure

## Status

**Accepted** - January 2025

## Context

Usage UI started as a single Next.js app using the Vercel Registry Starter template. As the project grew to support 20+ components, we needed to decide on the architecture:

1. **Single App**: Keep everything in one Next.js application
2. **Monorepo**: Separate docs site and component registry into packages
3. **Multi-repo**: Separate repositories for docs and components

## Decision

Adopt a **lightweight monorepo** structure using pnpm workspaces and Turborepo.

```
usage-ui/
├── apps/
│   └── www/              # Documentation site
├── packages/
│   └── ui/               # Component registry
├── tooling/              # Shared configs
├── turbo.json
└── pnpm-workspace.yaml
```

## Rationale

### Why Monorepo Over Single App

1. **Industry standard**: Magic UI, Origin UI, shadcn/ui all use monorepo structure
2. **Separation of concerns**: Docs site vs distributable components are distinct
3. **Scalability**: Easier to manage 20+ components with clear boundaries
4. **Independent deployment**: Can deploy docs without rebuilding components

### Why Monorepo Over Multi-repo

1. **Atomic changes**: Can update component + docs in single PR
2. **Shared tooling**: One Biome config, one TypeScript config
3. **Simpler CI/CD**: Single pipeline with Turbo caching
4. **Cross-package testing**: Can test integration between packages

### Why pnpm + Turborepo

1. **pnpm**: Fastest package manager, best monorepo support, disk efficient
2. **Turborepo**: Simple config, excellent caching, Vercel-native integration

## Consequences

### Positive
- Clear separation between distributable code and docs
- Turbo caching speeds up CI/CD significantly
- Changesets enables proper versioning
- Matches industry best practices

### Negative
- More complex initial setup
- Steeper learning curve for contributors
- Requires understanding of workspace protocols

## Implementation Notes

Key files created:
- `pnpm-workspace.yaml` - Workspace definition
- `turbo.json` - Build orchestration
- `.changeset/config.json` - Version management
- `lefthook.yml` - Git hooks
