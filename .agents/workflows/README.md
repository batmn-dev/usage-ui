# Workflows Directory

> Step-by-step procedures for common tasks. AI agents can follow these to accomplish specific goals.

## Purpose

Workflows are **action-oriented procedures** that aren't tied to a specific skill. They describe HOW to accomplish common project tasks.

### vs Skills

| Workflows | Skills |
|-----------|--------|
| Task-specific | Capability-specific |
| "How to release" | "How to use shadcn/ui" |
| Project procedures | Reusable knowledge |
| Sequential steps | Reference + instructions |

### vs Context

| Workflows | Context |
|-----------|---------|
| DO this | KNOW this |
| Procedures | Understanding |
| Follow to accomplish | Read to learn |

## Available Workflows

| Workflow | Purpose |
|----------|---------|
| `add-registry-component.md` | Create a new component for the registry |
| `execute-monorepo-migration.md` | Step-by-step monorepo migration execution |
| `monorepo-operations.md` | Common pnpm workspace commands |
| `release-process.md` | Version and release with changesets |

## When to Add Here

Add a workflow when:
- It's a multi-step procedure specific to this project
- It's not tied to external tool knowledge (use skills for that)
- Multiple team members need to follow the same steps
- AI agents should be able to execute it autonomously

## Format

Each workflow should include:
1. **Prerequisites** - What must be true before starting
2. **Steps** - Numbered, actionable steps
3. **Validation** - How to verify success
4. **Troubleshooting** - Common issues and fixes
