# ADR-004: Hybrid Monorepo Migration Approach

## Status

**Accepted** - January 2025

## Context

When migrating Usage UI from single-app to monorepo structure, we needed to choose between:

1. **CLI Scaffold**: Use `npx shadcn@latest init` with monorepo preset to generate correct configs
2. **Manual Migration**: Manually restructure directories and create configs
3. **Hybrid Approach**: Use CLI to generate reference configs, manually migrate code

Key considerations:
- 46+ shadcn components already installed with customizations
- Custom theme (OKLCH colors, nature palette)
- Git history preservation important for accountability
- Configuration errors are common and hard to debug

## Decision

Adopt a **hybrid migration approach**:

1. Generate a reference monorepo using shadcn CLI in a temp directory
2. Use reference configs as authoritative source
3. Execute migration manually to preserve git history
4. Validate structure with automated checks

## Rationale

### Why Not CLI Scaffold

- Loses all git history
- Requires manually copying 46+ components
- Custom theme would need re-implementation
- High risk of missing customizations

### Why Not Pure Manual

- shadcn monorepo config is complex (components.json aliases, exports)
- Easy to make subtle errors in turbo.json, tsconfig.json paths
- No authoritative reference for correct configuration
- Higher chance of "works on my machine" issues

### Why Hybrid

| Benefit | How It Helps |
|---------|--------------|
| Correct configs | Reference from CLI is guaranteed correct |
| Preserved history | Manual moves keep git blame |
| Validation | Can diff against reference |
| Customizations kept | Copy files, don't regenerate |

## Implementation

### Reference Generation

```bash
mkdir -p /tmp/shadcn-monorepo-reference
cd /tmp/shadcn-monorepo-reference
pnpm dlx shadcn@latest init  # Select "Next.js (Monorepo)"
```

Reference files to use:
- `turbo.json` — Build orchestration
- `pnpm-workspace.yaml` — Workspace definition
- `apps/web/components.json` — App-level shadcn config
- `packages/ui/components.json` — Package-level shadcn config
- `packages/ui/package.json` — Exports configuration

### Migration Execution

See [execute-monorepo-migration.md](../../workflows/execute-monorepo-migration.md) for step-by-step workflow.

### Validation

See [monorepo-validation skill](../../skills/monorepo-validation/SKILL.md) for automated structure checks.

## Consequences

### Positive

- Git history preserved for all components
- Configs match shadcn CLI expectations exactly
- Automated validation catches drift
- Documented process is repeatable

### Negative

- More steps than pure CLI scaffold
- Requires understanding of both approaches
- Reference must be regenerated if shadcn CLI changes

### Mitigations

- Workflow documentation reduces complexity
- Validation script catches most errors
- Reference can be cached or checked into `.references/` if needed

## Related

- [ADR-002: Adopt Lightweight Monorepo Structure](./002-monorepo-structure.md) — Why monorepo
- [MONOREPO-MIGRATION.md](../../MONOREPO-MIGRATION.md) — Detailed migration guide
