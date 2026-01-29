---
name: sync-agent-skills
description: Sync skills from .agents/skills/ to tool-specific directories (.cursor/, .claude/, .codex/). Use after manually adding skills to .agents/skills/ or when symlinks are missing.
---

# Sync Agent Skills

Ensures all skills in `.agents/skills/` have symlinks in tool-specific directories.

## When to Use

Run the sync script after:
- Manually adding a new skill to `.agents/skills/`
- Cloning the repo (symlinks may not be tracked in git)
- Noticing a skill isn't being picked up by a tool

## Quick Sync

```bash
./scripts/sync-skills.sh
```

Or from project root:

```bash
./.agents/skills/sync-agent-skills/scripts/sync-skills.sh
```

## What It Does

1. Creates tool directories if missing (`.cursor/skills/`, `.claude/skills/`, `.codex/skills/`)
2. Creates symlinks from each tool directory to `.agents/skills/<skill-name>`
3. Removes broken symlinks (skills that were deleted)
4. Reports what was created/removed

## Target Directories

| Directory | Tool |
|-----------|------|
| `.cursor/skills/` | Cursor |
| `.claude/skills/` | Claude Code |
| `.codex/skills/` | OpenAI Codex |

## Adding New Tool Directories

Edit `scripts/sync-skills.sh` and add to the `TOOL_DIRS` array:

```bash
TOOL_DIRS=(".cursor/skills" ".claude/skills" ".codex/skills" ".your-tool/skills")
```
