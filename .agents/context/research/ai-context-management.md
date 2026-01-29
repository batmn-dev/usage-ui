# AI Context Management Research

> Research findings on managing AI agent context effectively. Last updated: January 2026.

---

## Executive Summary

AI coding assistants rely on **context** to generate accurate code. Without proper configuration, these tools lack memory between sessions. The solution isn't "more context" — it's **structured, on-demand context**.

### Key Finding

Research from Anthropic shows that **accuracy drops from 99% to ~50%** as context window fills, even with million-token windows.

---

## Industry Standards (2025-2026)

### AGENTS.md

The de facto universal standard with 60,000+ GitHub adoptions. Supported by:
- GitHub Copilot
- OpenAI Codex
- Google Gemini CLI
- Cursor
- Claude Code
- Devin, Aider, VS Code

### Tool-Specific Files

| Tool | Primary File | Directory |
|------|-------------|-----------|
| Universal | `AGENTS.md` | Root, subdirs |
| Cursor | `.cursor/rules/*.mdc` | `.cursor/rules/` |
| Claude Code | `CLAUDE.md` | Root, `.claude/` |
| Gemini CLI | `GEMINI.md` | Root |

---

## Context Architecture

### The Two-Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│                     ALWAYS LOADED                           │
│  AGENTS.md + .cursor/rules/*.mdc (auto-attached)           │
│  Keep these SMALL (<500 lines total)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ triggers skill
┌─────────────────────────────────────────────────────────────┐
│                   ON-DEMAND (Skills)                        │
│  .agents/skills/[name]/SKILL.md + references/              │
│  Loaded when user requests or agent determines need        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ deep research
┌─────────────────────────────────────────────────────────────┐
│                   DEEP CONTEXT (Rarely)                     │
│  .agents/context/research/ + decisions/                    │
│  Loaded only for deep investigation                        │
└─────────────────────────────────────────────────────────────┘
```

### Content Categories

| Category | Purpose | Load Pattern |
|----------|---------|--------------|
| **Rules** | ALWAYS enforce | Auto-loaded every session |
| **Instructions** | HOW to do things | On-demand (skill trigger) |
| **Reference** | WHAT things are | Just-in-time retrieval |
| **Research** | Raw learnings | Rarely (deep dives only) |

---

## Context Rot Prevention

### What Is Context Rot?

Performance degradation as context grows stale, bloated, or misaligned with current state.

### Prevention Strategies

| Strategy | Implementation |
|----------|----------------|
| **Keep AGENTS.md lean** | <500 lines, essential info only |
| **Use skills for modularity** | Don't dump everything in one file |
| **Just-in-time loading** | Let agents `Read` files when needed |
| **Explicit scope boundaries** | Document what to ignore |
| **Monthly review** | Prune stale context regularly |
| **Session hygiene** | Clear between unrelated tasks |

### File Size Guidelines

| File Type | Max Lines | Rationale |
|-----------|-----------|-----------|
| `AGENTS.md` | 500 | Loaded every session |
| `SKILL.md` | 200 | Core instructions only |
| `.cursor/rules/*.mdc` | 100 | Always applied |
| `references/*.md` | No limit | Loaded on-demand |
| `context/research/*.md` | No limit | Rarely accessed |

---

## Separation Pattern

### Instructions vs Reference

**Instructions (SKILL.md, workflows/)**
- Action-oriented
- Step-by-step procedures
- "HOW to do X"
- Loaded when performing tasks

**Reference (references/, context/)**
- Knowledge-oriented
- Background information
- "WHAT is X"
- Loaded when understanding is needed

### Example Skill Structure

```
.agents/skills/shadcn-ui/
├── SKILL.md                    # Instructions (<200 lines)
├── commands/                   # Step-by-step procedures
│   └── add-component.md
└── references/                 # Background knowledge
    ├── api-reference.md
    └── patterns.md
```

---

## Sources

- Anthropic context window research (2024)
- AGENTS.md specification
- Cursor documentation
- Claude Code documentation
- llms.txt specification
- shadcn/ui registry patterns
