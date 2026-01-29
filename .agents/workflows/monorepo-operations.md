# Workflow: Monorepo Operations

> Common pnpm workspace and Turborepo operations for Usage UI.

---

## Quick Reference

### Development

```bash
# Start all dev servers
pnpm dev

# Start only docs site
pnpm dev --filter=@usage-ui/www

# Start only UI package (watch mode)
pnpm dev --filter=@usage-ui/ui
```

### Building

```bash
# Build all packages (with Turbo caching)
pnpm build

# Build only UI package
pnpm build --filter=@usage-ui/ui

# Build only docs site
pnpm build --filter=@usage-ui/www

# Force rebuild (ignore cache)
pnpm build --force
```

### Linting & Type Checking

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Lint specific package
pnpm lint --filter=@usage-ui/ui

# Run Biome check with auto-fix
pnpm check --write
```

---

## Dependency Management

### Add Dependency to UI Package

```bash
# Production dependency
pnpm add <package-name> --filter=@usage-ui/ui

# Example: Add Tremor
pnpm add @tremor/react --filter=@usage-ui/ui
```

### Add Dependency to Docs Site

```bash
pnpm add <package-name> --filter=@usage-ui/www
```

### Add Shared Dev Dependency

```bash
# Add to root (shared across all packages)
pnpm add -D <package-name> -w
```

### Remove Dependency

```bash
pnpm remove <package-name> --filter=@usage-ui/ui
```

### Update Dependencies

```bash
# Update all packages
pnpm update

# Update specific package
pnpm update <package-name> --filter=@usage-ui/ui

# Interactive update
pnpm update -i
```

---

## Workspace Navigation

### List All Workspaces

```bash
pnpm ls --depth -1
```

### Run Command in Specific Workspace

```bash
# Using --filter
pnpm --filter=@usage-ui/ui <command>

# Using directory
pnpm --filter="./packages/ui" <command>
```

### Run Command in All Workspaces

```bash
pnpm -r <command>
```

---

## Turborepo Operations

### View Task Graph

```bash
# See what will run
pnpm build --dry-run

# Visualize dependency graph
pnpm build --graph
```

### Cache Management

```bash
# Clear Turbo cache
rm -rf .turbo

# Or use clean script
pnpm clean
```

### Run Specific Task

```bash
# Run only typecheck task
pnpm turbo run typecheck

# Run with specific filter
pnpm turbo run build --filter=@usage-ui/ui
```

---

## Common Patterns

### Add New Component and Test

```bash
# 1. Create component
mkdir -p packages/ui/src/components/registry/new-component

# 2. Build to generate JSON
pnpm build --filter=@usage-ui/ui

# 3. Start dev server
pnpm dev --filter=@usage-ui/www

# 4. Test installation (in another terminal)
npx shadcn add http://localhost:3000/r/new-component.json
```

### Full Validation Before PR

```bash
# Run all checks
pnpm lint && pnpm typecheck && pnpm build

# Or use combined check
pnpm check && pnpm build
```

### Sync After Pull

```bash
# Install any new dependencies
pnpm install

# Rebuild (Turbo will skip unchanged)
pnpm build
```

---

## Troubleshooting

### "Cannot find module" errors

**Cause**: Dependencies not installed or workspace link broken.

**Fix**:
```bash
pnpm install
pnpm build
```

### Turbo cache giving stale results

**Cause**: Cache not invalidated properly.

**Fix**:
```bash
rm -rf .turbo
pnpm build --force
```

### Filter not matching package

**Cause**: Package name mismatch.

**Fix**: Check exact name in package's `package.json`:
```bash
cat packages/ui/package.json | grep '"name"'
```

### Workspace protocol errors

**Cause**: Using `workspace:*` for non-workspace package.

**Fix**: Only use `workspace:*` for internal packages:
```json
{
  "dependencies": {
    "@usage-ui/ui": "workspace:*",  // ✅ Internal
    "react": "^19.0.0"              // ✅ External
  }
}
```
