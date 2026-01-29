# Workflow: Release Process

> Step-by-step procedure for versioning and releasing Usage UI packages.

---

## Prerequisites

- [ ] All changes are committed
- [ ] CI is passing on main branch
- [ ] You have push access to the repository

---

## Steps

### 1. Create Changesets for Unreleased Changes

For each notable change that doesn't have a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select affected packages (usually `@usage-ui/ui`)
2. Choose version bump type:
   - `patch` - Bug fixes, small changes
   - `minor` - New features, non-breaking changes
   - `major` - Breaking changes
3. Write a description (appears in CHANGELOG)

### 2. Review Pending Changesets

```bash
# List pending changesets
ls .changeset/*.md

# Read each to verify
cat .changeset/*.md
```

### 3. Version Packages

When ready to release:

```bash
pnpm version-packages
```

This will:
- Consume all changesets in `.changeset/`
- Bump versions in `package.json` files
- Update `CHANGELOG.md` files
- Create a "Version Packages" commit

### 4. Review Version Changes

```bash
# Check what changed
git diff HEAD~1

# Verify package versions
cat packages/ui/package.json | grep version
```

### 5. Push to Main

```bash
git push origin main
```

### 6. Verify Deployment

After push:
1. Check Vercel deployment completes
2. Verify registry JSON is accessible:
   ```bash
   curl https://usage-ui.vercel.app/r/usage-meter.json
   ```

### 7. Test Installation from Production

```bash
# In a test project
npx shadcn add https://usage-ui.vercel.app/r/usage-meter.json
```

---

## Version Bump Guidelines

| Change Type | Bump | Example |
|------------|------|---------|
| Bug fix | `patch` | Fix meter not rendering at 0% |
| New feature | `minor` | Add new `gradient-meter` component |
| New variant | `minor` | Add `size="xl"` to usage-meter |
| Breaking change | `major` | Rename `value` prop to `current` |
| Documentation only | `patch` | Update JSDoc comments |

---

## Validation Checklist

- [ ] All changesets describe the change clearly
- [ ] Version bumps match the change type
- [ ] CHANGELOG.md is readable and accurate
- [ ] CI passes after version commit
- [ ] Deployment succeeds
- [ ] Registry JSON is accessible
- [ ] Installation works from production URL

---

## Troubleshooting

### Changeset not detecting package

**Cause**: Package not listed in `pnpm-workspace.yaml`.

**Fix**: Ensure `packages/*` is in workspace definition.

### Version command fails

**Cause**: Uncommitted changes or dirty working directory.

**Fix**: Commit or stash all changes before running `version-packages`.

### CHANGELOG not updating

**Cause**: Changeset `config.json` misconfigured.

**Fix**: Check `.changeset/config.json` has correct `changelog` setting.

---

## Emergency Rollback

If a release causes issues:

```bash
# Revert the version commit
git revert HEAD

# Push revert
git push origin main

# Vercel will auto-deploy the previous state
```
