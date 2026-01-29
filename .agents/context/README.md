# AI Context Directory

> Passive knowledge that AI agents can retrieve on-demand. This content is NOT automatically loaded.

## Structure

```
context/
├── research/       # Raw research materials, deep-dive documentation
│   └── *.md        # Topic-specific research
├── decisions/      # Architecture Decision Records (ADRs)
│   └── NNN-*.md    # Numbered decision records
└── glossary.md     # Project-specific terminology
```

## Purpose

This directory contains **reference materials** (passive knowledge) that agents can fetch when needed, but that should NOT be included in every context window.

### vs Skills

| Context (`context/`) | Skills (`skills/`) |
|---------------------|-------------------|
| **WHAT** things are | **HOW** to do things |
| Reference materials | Action-oriented instructions |
| Loaded on-demand | Triggered by user request |
| Background knowledge | Step-by-step procedures |

### vs Workflows

| Context (`context/`) | Workflows (`workflows/`) |
|---------------------|-------------------------|
| Understanding | Execution |
| Research & decisions | Step-by-step procedures |
| Read to learn | Follow to accomplish |

## When to Add Here

Add content to `context/` when:
- It's background research that informs decisions
- It's an Architecture Decision Record (ADR)
- It defines terminology or concepts
- It's too detailed for AGENTS.md but useful for deep dives

## When NOT to Add Here

Don't add content to `context/` when:
- It's a step-by-step procedure → use `workflows/`
- It's a reusable capability → use `skills/`
- It needs to be in every session → use `AGENTS.md` or `.cursor/rules/`
