#!/bin/bash
# Monorepo Validation Script
# Run from repository root: .agents/skills/monorepo-validation/scripts/validate-monorepo.sh

set -e

echo "🔍 Validating Usage UI Monorepo Structure..."
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✅ $1${NC}"
}

fail() {
  echo -e "${RED}❌ $1${NC}"
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# ============================================================================
# 1. Directory Structure
# ============================================================================
echo "📁 Checking directory structure..."

[ -d "apps/www" ] && pass "apps/www exists" || fail "apps/www missing"
[ -d "packages/ui" ] && pass "packages/ui exists" || fail "packages/ui missing"
[ -d "tooling/typescript" ] && pass "tooling/typescript exists" || fail "tooling/typescript missing"
[ -d ".changeset" ] && pass ".changeset exists" || fail ".changeset missing"

echo ""

# ============================================================================
# 2. Root Configuration Files
# ============================================================================
echo "📄 Checking root configuration..."

[ -f "pnpm-workspace.yaml" ] && pass "pnpm-workspace.yaml exists" || fail "pnpm-workspace.yaml missing"
[ -f "turbo.json" ] && pass "turbo.json exists" || fail "turbo.json missing"
[ -f "biome.json" ] && pass "biome.json exists" || fail "biome.json missing"
[ -f "lefthook.yml" ] && pass "lefthook.yml exists" || warn "lefthook.yml missing (optional)"

echo ""

# ============================================================================
# 3. apps/www Files
# ============================================================================
echo "📦 Checking apps/www..."

if [ -d "apps/www" ]; then
  [ -f "apps/www/package.json" ] && pass "apps/www/package.json exists" || fail "apps/www/package.json missing"
  [ -f "apps/www/tsconfig.json" ] && pass "apps/www/tsconfig.json exists" || fail "apps/www/tsconfig.json missing"
  [ -f "apps/www/components.json" ] && pass "apps/www/components.json exists" || fail "apps/www/components.json missing"
  [ -f "apps/www/next.config.ts" ] && pass "apps/www/next.config.ts exists" || fail "apps/www/next.config.ts missing"
  [ -d "apps/www/src" ] && pass "apps/www/src exists" || fail "apps/www/src missing"
  [ -d "apps/www/public" ] && pass "apps/www/public exists" || fail "apps/www/public missing"
fi

echo ""

# ============================================================================
# 4. packages/ui Files
# ============================================================================
echo "📦 Checking packages/ui..."

if [ -d "packages/ui" ]; then
  [ -f "packages/ui/package.json" ] && pass "packages/ui/package.json exists" || fail "packages/ui/package.json missing"
  [ -f "packages/ui/tsconfig.json" ] && pass "packages/ui/tsconfig.json exists" || fail "packages/ui/tsconfig.json missing"
  [ -f "packages/ui/registry.json" ] && pass "packages/ui/registry.json exists" || fail "packages/ui/registry.json missing"
  [ -f "packages/ui/components.json" ] && pass "packages/ui/components.json exists" || fail "packages/ui/components.json missing"
  [ -d "packages/ui/src/components/ui" ] && pass "packages/ui/src/components/ui exists" || fail "packages/ui/src/components/ui missing"
  [ -f "packages/ui/src/lib/utils.ts" ] && pass "packages/ui/src/lib/utils.ts exists" || fail "packages/ui/src/lib/utils.ts missing"
fi

echo ""

# ============================================================================
# 5. Package Names
# ============================================================================
echo "🏷️  Checking package names..."

if [ -f "apps/www/package.json" ]; then
  WWW_NAME=$(grep '"name"' apps/www/package.json | head -1 | sed 's/.*"\(.*\)".*/\1/' | sed 's/.*: "//' | sed 's/".*//')
  if [[ "$WWW_NAME" == *"@usage-ui/www"* ]]; then
    pass "apps/www name is @usage-ui/www"
  else
    fail "apps/www name should be @usage-ui/www (got: $WWW_NAME)"
  fi
fi

if [ -f "packages/ui/package.json" ]; then
  UI_NAME=$(grep '"name"' packages/ui/package.json | head -1 | sed 's/.*"\(.*\)".*/\1/' | sed 's/.*: "//' | sed 's/".*//')
  if [[ "$UI_NAME" == *"@usage-ui/ui"* ]]; then
    pass "packages/ui name is @usage-ui/ui"
  else
    fail "packages/ui name should be @usage-ui/ui (got: $UI_NAME)"
  fi
fi

echo ""

# ============================================================================
# 6. Workspace Configuration
# ============================================================================
echo "🔗 Checking workspace configuration..."

if [ -f "pnpm-workspace.yaml" ]; then
  if grep -q "apps/\*" pnpm-workspace.yaml && grep -q "packages/\*" pnpm-workspace.yaml; then
    pass "pnpm-workspace.yaml includes apps/* and packages/*"
  else
    fail "pnpm-workspace.yaml missing required patterns"
  fi
fi

echo ""

# ============================================================================
# 7. TypeScript Paths
# ============================================================================
echo "🛤️  Checking TypeScript paths..."

if [ -f "apps/www/tsconfig.json" ]; then
  if grep -q "@usage-ui/ui" apps/www/tsconfig.json; then
    pass "apps/www/tsconfig.json has @usage-ui/ui paths"
  else
    fail "apps/www/tsconfig.json missing @usage-ui/ui paths"
  fi
fi

echo ""

# ============================================================================
# 8. Build Output (if exists)
# ============================================================================
echo "🏗️  Checking build output..."

if [ -d "apps/www/public/r" ]; then
  JSON_COUNT=$(ls apps/www/public/r/*.json 2>/dev/null | wc -l | tr -d ' ')
  if [ "$JSON_COUNT" -gt 0 ]; then
    pass "Registry JSON files generated ($JSON_COUNT files)"
  else
    warn "No registry JSON files in apps/www/public/r/"
  fi
else
  warn "apps/www/public/r/ not found (run pnpm build)"
fi

echo ""

# ============================================================================
# 9. Site Registry File (if needed)
# ============================================================================
echo "📋 Checking site registry file..."

if [ -f "apps/www/src/lib/registry.ts" ]; then
  if grep -q "@/registry.json" apps/www/src/lib/registry.ts 2>/dev/null; then
    if [ -f "apps/www/src/registry.json" ]; then
      pass "apps/www/src/registry.json exists (required by registry.ts)"
    else
      fail "apps/www/src/registry.json missing (registry.ts imports it)"
    fi
  else
    pass "registry.ts doesn't require @/registry.json"
  fi
else
  pass "No registry.ts file (check not needed)"
fi

echo ""

# ============================================================================
# 10. Valid Module Exports
# ============================================================================
echo "📤 Checking module exports..."

if [ -f "packages/ui/src/components/registry/index.ts" ]; then
  if grep -q "export" packages/ui/src/components/registry/index.ts; then
    pass "packages/ui/src/components/registry/index.ts has exports"
  else
    fail "packages/ui/src/components/registry/index.ts missing exports (add 'export {}')"
  fi
else
  warn "packages/ui/src/components/registry/index.ts not found"
fi

echo ""

# ============================================================================
# 11. Core shadcn Dependencies
# ============================================================================
echo "📦 Checking shadcn dependencies..."

if [ -f "packages/ui/package.json" ]; then
  for dep in "class-variance-authority" "clsx" "tailwind-merge" "radix-ui"; do
    if grep -q "\"$dep\"" packages/ui/package.json; then
      pass "$dep in packages/ui"
    else
      fail "$dep missing in packages/ui/package.json"
    fi
  done
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warning(s), 0 errors${NC}"
else
  echo -e "${RED}❌ $ERRORS error(s), $WARNINGS warning(s)${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
