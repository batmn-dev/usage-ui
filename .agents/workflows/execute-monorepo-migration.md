# Workflow: Execute Monorepo Migration

> AI-executable workflow for migrating Usage UI to monorepo structure.
> 
> **Source**: This workflow references [MONOREPO-MIGRATION.md](../../MONOREPO-MIGRATION.md) for detailed configs.

---

## Prerequisites

Before starting, verify:

```bash
# Clean working tree
git status  # Should show no uncommitted changes

# Node.js 22+
node --version

# pnpm 9.15+
pnpm --version

# Create backup branch
git checkout -b pre-monorepo-backup && git checkout -
```

- [ ] Working tree is clean
- [ ] Node.js 22+ installed
- [ ] pnpm 9.15+ installed
- [ ] Backup branch created

---

## Phase Overview

| Phase | Name | Risk | Reversible |
|-------|------|------|------------|
| 0 | Pre-flight | None | N/A |
| 1 | Root Configuration | Low | Yes |
| 2 | Directory Structure | Low | Yes |
| 3 | Move App to apps/www | Medium | Git revert |
| 4 | Set Up packages/ui | Medium | Git revert |
| 5 | Shared Tooling | Low | Yes |
| 6 | CI/CD | Low | Yes |
| 7 | Install and Verify | None | N/A |
| 8 | Cleanup | Low | Yes |
| 9 | Post-Migration Validation | None | N/A |

---

## Phase 1: Root Configuration

### Actions

1. Create `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - "apps/*"
     - "packages/*"
     - "tooling/*"
   ```

2. Update root `package.json` — see [MONOREPO-MIGRATION.md#12-update-root-packagejson](../../MONOREPO-MIGRATION.md#12-update-root-packagejson)

3. Create `turbo.json` — see [MONOREPO-MIGRATION.md#13-create-turbojson](../../MONOREPO-MIGRATION.md#13-create-turbojson)

4. Create `lefthook.yml` — see [MONOREPO-MIGRATION.md#14-create-lefthookyml](../../MONOREPO-MIGRATION.md#14-create-lefthookyml)

### Validation

```bash
ls -la pnpm-workspace.yaml turbo.json lefthook.yml package.json
```

- [ ] All four files exist at root

---

## Phase 2: Directory Structure

### Actions

```bash
mkdir -p apps/www
mkdir -p packages/ui/src/{components/{ui,registry},hooks,lib,styles}
mkdir -p tooling/typescript
mkdir -p .changeset
mkdir -p .github/workflows
```

### Validation

```bash
ls -la apps packages tooling .changeset .github
```

- [ ] `apps/` directory exists
- [ ] `packages/` directory exists
- [ ] `tooling/` directory exists
- [ ] `.changeset/` directory exists
- [ ] `.github/workflows/` directory exists

---

## Phase 3: Move App to apps/www

### Actions

```bash
# Move source files (order matters!)
mv src apps/www/
mv public apps/www/
mv next.config.ts apps/www/
mv postcss.config.mjs apps/www/
```

Then create these files in `apps/www/`:
- `package.json` — see [MONOREPO-MIGRATION.md#32-create-appswwwpackagejson](../../MONOREPO-MIGRATION.md#32-create-appswwwpackagejson)
- `tsconfig.json` — see [MONOREPO-MIGRATION.md#33-create-appswwwtsconfigjson](../../MONOREPO-MIGRATION.md#33-create-appswwwtsconfigjson)
- `components.json` — see [MONOREPO-MIGRATION.md#34-create-appswwwcomponentsjson](../../MONOREPO-MIGRATION.md#34-create-appswwwcomponentsjson)

### Validation

```bash
ls -la apps/www/
# Should show: src/, public/, next.config.ts, postcss.config.mjs, package.json, tsconfig.json, components.json
```

- [ ] `apps/www/src/` exists
- [ ] `apps/www/public/` exists
- [ ] `apps/www/package.json` created
- [ ] `apps/www/tsconfig.json` created
- [ ] `apps/www/components.json` created

---

## Phase 4: Set Up packages/ui

### Actions

Create these files in `packages/ui/`:
- `package.json` — see [MONOREPO-MIGRATION.md#41-create-packagesuipackagejson](../../MONOREPO-MIGRATION.md#41-create-packagesuipackagejson)
- `tsconfig.json` — see [MONOREPO-MIGRATION.md#42-create-packagesuitsconfigjson](../../MONOREPO-MIGRATION.md#42-create-packagesuitsconfigjson)
- `registry.json` — see [MONOREPO-MIGRATION.md#43-create-packagesuiregistryjson](../../MONOREPO-MIGRATION.md#43-create-packagesuiregistryjson)
- `components.json` — see [MONOREPO-MIGRATION.md#44-create-packagesuicomponentsjson](../../MONOREPO-MIGRATION.md#44-create-packagesuicomponentsjson)

Copy shared code:

```bash
cp apps/www/src/lib/utils.ts packages/ui/src/lib/
cp -r apps/www/src/components/ui/* packages/ui/src/components/ui/

# Copy hooks if they exist
if ls apps/www/src/hooks/*.ts 1>/dev/null 2>&1; then
  cp apps/www/src/hooks/*.ts packages/ui/src/hooks/
fi
```

Create styles — see [MONOREPO-MIGRATION.md#46-create-packagesuisrcstylesglobalscss](../../MONOREPO-MIGRATION.md#46-create-packagesuisrcstylesglobalscss)

Create barrel file `packages/ui/src/components/index.ts`:
```ts
export * from "./ui";
export * from "./registry";
```

### Validation

```bash
ls -la packages/ui/
ls -la packages/ui/src/
ls -la packages/ui/src/components/
```

- [ ] `packages/ui/package.json` exists
- [ ] `packages/ui/registry.json` exists
- [ ] `packages/ui/src/lib/utils.ts` exists
- [ ] `packages/ui/src/components/ui/` populated
- [ ] `packages/ui/src/styles/globals.css` exists

---

## Phase 5: Shared Tooling

### Actions

Create `tooling/typescript/package.json`:
```json
{
  "name": "@usage-ui/typescript-config",
  "version": "0.0.0",
  "private": true
}
```

Create `tooling/typescript/base.json` — see [MONOREPO-MIGRATION.md#52-create-toolingtypescriptbasejson](../../MONOREPO-MIGRATION.md#52-create-toolingtypescriptbasejson)

Create `.changeset/config.json` — see [MONOREPO-MIGRATION.md#53-create-changesetconfigjson](../../MONOREPO-MIGRATION.md#53-create-changesetconfigjson)

Update root `tsconfig.json` — see [MONOREPO-MIGRATION.md#54-update-root-tsconfigjson](../../MONOREPO-MIGRATION.md#54-update-root-tsconfigjson)

### Validation

```bash
ls -la tooling/typescript/
cat .changeset/config.json
```

- [ ] `tooling/typescript/base.json` exists
- [ ] `.changeset/config.json` exists
- [ ] Root `tsconfig.json` updated

---

## Phase 6: CI/CD

### Actions

Create `.github/workflows/ci.yml` — see [MONOREPO-MIGRATION.md#61-create-githubworkflowsciyml](../../MONOREPO-MIGRATION.md#61-create-githubworkflowsciyml)

### Validation

- [ ] `.github/workflows/ci.yml` exists

---

## Phase 7: Install and Verify

### Actions

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml .turbo
rm -rf apps/www/node_modules packages/ui/node_modules
pnpm install
```

### Validation

```bash
# Verify workspaces
pnpm ls -r --depth 0

# Test commands
pnpm run build
pnpm run lint
pnpm run typecheck
```

- [ ] `pnpm install` succeeds
- [ ] `pnpm ls -r` shows `@usage-ui/www` and `@usage-ui/ui`
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` succeeds
- [ ] `pnpm typecheck` succeeds

---

## Phase 8: Cleanup

### Actions

```bash
# Remove old root files
rm -f components.json registry.json

# Enable git hooks
pnpm lefthook install

# Update .gitignore
cat >> .gitignore << 'EOF'

# Monorepo build artifacts
apps/www/.next/
apps/www/.turbo/
packages/ui/dist/
.turbo/
EOF
```

### Validation

- [ ] Old `components.json` removed from root
- [ ] Old `registry.json` removed from root
- [ ] Lefthook installed

---

## Phase 9: Post-Migration Validation

### Final Checklist

```bash
pnpm install          # ✅ No errors
pnpm run build        # ✅ All packages build
pnpm run dev          # ✅ Dev server starts
pnpm run lint         # ✅ Passes
pnpm run typecheck    # ✅ Passes
```

### Browser Test

- [ ] Open `http://localhost:3000`
- [ ] Site loads correctly
- [ ] No console errors
- [ ] Theme toggle works (if present)

### shadcn CLI Test

```bash
cd apps/www
pnpm dlx shadcn@latest add button --dry-run
```

- [ ] CLI recognizes monorepo structure

### Git Hooks Test

```bash
git add .
git commit -m "chore: complete monorepo migration"
```

- [ ] Pre-commit hooks run
- [ ] Commit succeeds

---

## Rollback

If migration fails at any phase:

```bash
# Reset to backup branch
git checkout pre-monorepo-backup
git checkout -b main-recovery
git branch -D main
git checkout -b main
```

---

## Troubleshooting

See [MONOREPO-MIGRATION.md#troubleshooting](../../MONOREPO-MIGRATION.md#troubleshooting) for common issues:

- "Workspace package not found"
- "Cannot find module @usage-ui/ui"
- "turbo: command not found"
- Build fails with type errors
- CSS not working
