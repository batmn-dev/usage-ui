---
name: monorepo-validation
description: Validate Usage UI monorepo structure, configuration, and package setup. Use when checking migration progress, debugging workspace issues, verifying structure before commits, or when "pnpm install" or "pnpm build" fails with workspace errors.
---

# Monorepo Validation

Validates Usage UI monorepo structure against expected configuration.

## Quick Validation

Run the validation script to check all aspects:

```bash
.agents/skills/monorepo-validation/scripts/validate-monorepo.sh
```

Or run individual checks manually below.

## Validation Checks

### 1. Directory Structure

Expected layout:

```
usage-ui/
├── apps/www/                    # Docs site
├── packages/ui/                 # Component registry
├── tooling/typescript/          # Shared TS config
├── .changeset/                  # Version management
├── pnpm-workspace.yaml          # Workspace definition
├── turbo.json                   # Build orchestration
└── lefthook.yml                 # Git hooks
```

Verify:

```bash
# All required directories exist
ls -d apps/www packages/ui tooling/typescript .changeset 2>/dev/null && echo "✅ Directories OK" || echo "❌ Missing directories"
```

### 2. Workspace Configuration

Check `pnpm-workspace.yaml`:

```bash
cat pnpm-workspace.yaml
# Must contain:
# packages:
#   - "apps/*"
#   - "packages/*"
#   - "tooling/*"
```

### 3. Package Names

Verify package names match expected:

```bash
# Should be @usage-ui/www
grep '"name"' apps/www/package.json

# Should be @usage-ui/ui
grep '"name"' packages/ui/package.json
```

### 4. Workspace Links

Test that pnpm recognizes workspaces:

```bash
pnpm ls -r --depth 0
# Should list both @usage-ui/www and @usage-ui/ui
```

### 5. TypeScript Path Resolution

Check `apps/www/tsconfig.json` paths:

```bash
grep -A5 '"paths"' apps/www/tsconfig.json
# Must include:
# "@usage-ui/ui": ["../../packages/ui/src"]
# "@usage-ui/ui/*": ["../../packages/ui/src/*"]
```

### 6. Registry Configuration

Verify `packages/ui/registry.json`:

```bash
cat packages/ui/registry.json | head -10
# Must have $schema and items array
```

### 7. Build Output

After `pnpm build`, verify:

```bash
ls apps/www/public/r/*.json 2>/dev/null && echo "✅ Registry JSON generated" || echo "❌ No registry JSON"
```

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Workspace not found" | Missing `pnpm-workspace.yaml` | Create file at root |
| "Cannot find @usage-ui/ui" | Wrong tsconfig paths | Update `apps/www/tsconfig.json` |
| "No registry JSON" | Build not run | Run `pnpm build --filter=@usage-ui/ui` |
| Filter not matching | Wrong package name | Check exact name in `package.json` |

## References

- [Structure Checks](references/structure-checks.md) — Detailed validation criteria
- [Package Exports](references/package-exports.md) — Required exports configuration
