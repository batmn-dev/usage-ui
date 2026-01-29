# Claude Skills — AI Agent Review (Prioritized)
#
# Scope: Usage UI shadcn registry (usage meters, strict registry compliance,
# OKLCH theming, future monorepo migration).
#
# Format: each item includes What it does + Why add it.
#
# ---------------------------------------------------------------------------
# P0 — Highest Impact / Lowest Risk
# ---------------------------------------------------------------------------
#
# 1) Registry-Aware Component Scaffolding
# What it does:
# - Generates new components with correct patterns (Radix + Base when needed),
#   data-slot, cn(), "use client" where required, proper file paths, and
#   index.ts exports.
#
# Why add it:
# - Prevents inconsistent component patterns across 20+ planned components and
#   reduces time-to-create for each item.
#
# 2) Registry.json Schema + Dependency Validator
# What it does:
# - Validates registry.json entries for correct schema, file paths, targets,
#   type, and registryDependencies vs actual files.
#
# Why add it:
# - registry.json is critical; a single mistake breaks installs for users.
#   This catches issues before build/ship.
#
# 3) Theme and Styling Compliance Auditor
# What it does:
# - Flags hardcoded colors, missing OKLCH CSS variables, relative imports, and
#   missing data-slot usage.
#
# Why add it:
# - Ensures components remain themeable and copy-safe in user projects;
#   prevents regressions in theming and installability.
#
# 4) Build + Install Smoke Test Skill
# What it does:
# - Runs pnpm build and an automated npx shadcn add using local registry JSON to
#   confirm install success.
#
# Why add it:
# - Mirrors required quality gates and catches regressions before release.
#
# ---------------------------------------------------------------------------
# P1 — High Value / Medium Effort
# ---------------------------------------------------------------------------
#
# 5) Accessibility and ARIA Audit
# What it does:
# - Verifies ARIA roles/attributes in Base components and ensures Radix usage
#   includes "use client" and correct semantics.
#
# Why add it:
# - Usage meters are UI-critical; accessibility issues create trust and
#   compliance problems.
#
# 6) Docs + Demo Generator
# What it does:
# - Creates demo pages, MDX docs, and updates llms.txt/README entries based on
#   component props.
#
# Why add it:
# - Documentation drives adoption; automation keeps docs consistent and removes
#   a major bottleneck.
#
# 7) Component Dependency Graph Awareness
# What it does:
# - Checks dependency rules (e.g., segmented-meter depends on usage-meter) and
#   flags missing registry dependencies.
#
# Why add it:
# - Prevents install/runtime failures caused by missing or incorrect
#   dependency links.
#
# ---------------------------------------------------------------------------
# P2 — Strategic / Forward-Looking
# ---------------------------------------------------------------------------
#
# 8) Tremor/Recharts Wrapper Skill
# What it does:
# - Generates Tremor chart wrappers styled with shadcn variables and consistent
#   props.
#
# Why add it:
# - Planned data-viz components depend on Tremor; this standardizes charts and
#   reduces boilerplate.
#
# 9) Monorepo Migration and Structure Guardrail
# What it does:
# - Validates the repo layout against the target apps/www + packages/ui
#   structure and required workspace configs.
#
# Why add it:
# - Prevents drift during migration and ensures tooling expectations stay
#   aligned.
#
# 10) Changeset and Release Automation
# What it does:
# - Generates changesets, validates conventional commits, and checks release
#   readiness.
#
# Why add it:
# - Scales cleanly as component count grows and reduces release errors.
