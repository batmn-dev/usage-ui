# AI Context Management Research for shadcn Component Libraries

> A comprehensive guide to configuring your project for effective AI coding assistant context management, specifically tailored for shadcn-based component library development.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Project Assessment](#current-project-assessment)
3. [AI Context File Standards](#ai-context-file-standards)
4. [Recommended Files & Configuration](#recommended-files--configuration)
5. [Cursor IDE Configuration](#cursor-ide-configuration)
6. [shadcn Registry Best Practices](#shadcn-registry-best-practices)
7. [Implementation Checklist](#implementation-checklist)
8. [File Templates](#file-templates)
9. [Resources](#resources)

---

## Executive Summary

AI coding assistants like Cursor, Claude Code, and GitHub Copilot rely on **context** to generate accurate, project-specific code. Without proper configuration, these tools lack memory between sessions and must repeatedly learn your project's conventions, architecture, and patterns.

This research identifies **three categories** of files your component library should implement:

| Category | Purpose | Files |
|----------|---------|-------|
| **AI Assistant Rules** | Persistent instructions for code generation | `.cursor/rules/`, `AGENTS.md`, `CLAUDE.md` |
| **Project Documentation** | Machine-readable project context | `llms.txt`, `ARCHITECTURE.md` |
| **shadcn Configuration** | Component registry setup | `registry.json`, `components.json` |

---

## Current Project Assessment

### What You Already Have (Good Foundation)

| File | Status | Purpose |
|------|--------|---------|
| `ARCHITECTURE.md` | ✅ Present | Project architecture documentation |
| `AI-AGENT-PROJECT-BEST-PRACTICES.md` | ✅ Present | General AI agent development guide |
| `registry.json` | ✅ Present | shadcn registry configuration |
| `components.json` | ✅ Present | shadcn CLI configuration |
| `biome.json` | ✅ Present | Linting/formatting rules |
| `README.md` | ✅ Present | Basic documentation |

### What's Missing (Recommended Additions)

| File/Directory | Priority | Purpose |
|----------------|----------|---------|
| `.cursor/rules/*.mdc` | **High** | Cursor-specific AI rules |
| `AGENTS.md` | **High** | Cross-platform AI context |
| `CLAUDE.md` | **Medium** | Claude-specific instructions |
| `llms.txt` | **Medium** | LLM-friendly documentation index |
| `.cursorrules` (legacy) | Low | Fallback for older Cursor versions |

---

## AI Context File Standards

### 1. AGENTS.md (Cross-Platform Standard)

**Purpose**: Universal AI assistant context file supported by Cursor, Zed, OpenCode, and other editors.

**Location**: Project root (`/AGENTS.md`)

**Why It Matters**:
- Provides immediate project understanding without repeated explanations
- Ensures consistent code generation across sessions
- Works across multiple AI tools and editors
- Version-controlled alongside your codebase

**Structure**:
```markdown
# Project Name

> Single-sentence project description

## Overview
Brief explanation of what this project does (2-3 sentences max)

## Tech Stack
- Framework: Next.js 15+ (App Router)
- UI: shadcn/ui, Radix UI, Tailwind CSS v4
- Language: TypeScript (strict mode)
- Package Manager: pnpm

## Project Structure
src/
├── app/           # Next.js App Router pages
├── components/    # React components
│   ├── ui/        # shadcn/ui primitives
│   └── registry/  # Registry-specific components
├── lib/           # Utilities and helpers
├── hooks/         # Custom React hooks
└── layouts/       # Layout components

## Conventions
- Use functional components with hooks
- Prefer composition over inheritance
- Use the `cn()` utility for className merging
- Follow shadcn/ui patterns for new components

## Common Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run Biome linter

## Gotchas
- CSS variables use oklch color space
- Registry items require specific schema compliance
```

### 2. CLAUDE.md (Claude-Specific)

**Purpose**: Claude Code reads this file at the start of each session.

**Location**: Project root (`/CLAUDE.md`) or `~/.claude/CLAUDE.md` for global settings

**Key Features**:
- Claude Code auto-discovers and reads this file
- Supports directory-specific overrides
- Can be generated with `/init` command in Claude Code

**Structure**:
```markdown
# Claude Instructions for [Project Name]

## Project Context
This is a shadcn/ui component registry...

## Code Style Requirements
- Always use TypeScript with explicit types
- Use `interface` over `type` for object shapes
- Prefer named exports for components
- Use `forwardRef` for components that forward refs

## Component Patterns
When creating new components:
1. Base on existing shadcn/ui primitives when possible
2. Include proper TypeScript interfaces
3. Support className prop with cn() utility
4. Follow accessibility guidelines (ARIA)

## Registry Requirements
All registry items must:
- Have registry-item.json metadata
- Include proper registryDependencies
- Specify correct file types
```

### 3. Cursor Rules (.cursor/rules/)

**Purpose**: Cursor-specific persistent rules that guide AI code generation.

**Location**: `.cursor/rules/` directory

**Format**: `.mdc` files (Markdown with YAML front matter)

**Rule Types**:
| Type | Description | Use Case |
|------|-------------|----------|
| **Always Apply** | Loaded into every context | Coding standards, project conventions |
| **Auto Attach** | Applied to matching file patterns | File-specific rules via globs |
| **Agent Requested** | AI decides when to include | Reference documentation |
| **Manual** | User explicitly invokes | Specialized workflows |

**Directory Structure**:
```
.cursor/
└── rules/
    ├── general/
    │   ├── coding-standards.mdc
    │   └── naming-conventions.mdc
    ├── components/
    │   ├── shadcn-patterns.mdc
    │   └── accessibility.mdc
    ├── registry/
    │   └── registry-item-rules.mdc
    └── testing/
        └── component-testing.mdc
```

### 4. llms.txt (LLM Documentation Index)

**Purpose**: Standardized file for providing LLM-friendly documentation at inference time.

**Location**: `/llms.txt` (served at root URL)

**Why It Matters**:
- Proposed standard by Jeremy Howard (fast.ai)
- Curates essential project information in one place
- Helps LLMs retrieve authoritative answers efficiently
- Already adopted by shadcn/ui (see https://ui.shadcn.com/llms.txt)

**Structure**:
```markdown
# Registry Starter

> A custom shadcn/ui component registry for building branded React applications.

This registry provides themed UI components, blocks, and layouts following shadcn/ui conventions.

## Documentation

- [Getting Started](https://your-registry.com/docs/getting-started)
- [Component List](https://your-registry.com/docs/components)
- [Theming Guide](https://your-registry.com/docs/theming)

## Components

- [Button](https://your-registry.com/r/button.json): Interactive button component
- [Card](https://your-registry.com/r/card.json): Content container component
- [Brand Header](https://your-registry.com/r/brand-header.json): Styled header with branding

## Blocks

- [Dashboard](https://your-registry.com/r/dashboard.json): Complete dashboard layout
- [Store](https://your-registry.com/r/store.json): E-commerce store layout

## Optional

- [Data Table](https://your-registry.com/r/data-table.json): Advanced table with sorting
```

---

## Recommended Files & Configuration

### Complete File Structure

```
usage-ui/
├── .cursor/
│   └── rules/
│       ├── general/
│       │   ├── coding-standards.mdc      # TypeScript, React conventions
│       │   └── project-structure.mdc     # File organization rules
│       ├── components/
│       │   ├── shadcn-patterns.mdc       # shadcn/ui specific patterns
│       │   ├── accessibility.mdc         # ARIA, keyboard navigation
│       │   └── styling.mdc               # Tailwind, CSS variables
│       └── registry/
│           └── registry-items.mdc        # Registry schema compliance
├── AGENTS.md                             # Cross-platform AI context
├── CLAUDE.md                             # Claude Code instructions
├── llms.txt                              # LLM documentation index
├── ARCHITECTURE.md                       # ✅ Already exists
├── AI-AGENT-PROJECT-BEST-PRACTICES.md   # ✅ Already exists
├── registry.json                         # ✅ Already exists
├── components.json                       # ✅ Already exists
└── ...
```

---

## Cursor IDE Configuration

### Rule File Format (.mdc)

`.mdc` files use Markdown with YAML front matter:

```markdown
---
description: "Coding standards for TypeScript React components"
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: false
---

# TypeScript React Component Standards

## File Organization
- One component per file
- Use PascalCase for component files (e.g., `Button.tsx`)
- Co-locate related files (component, types, tests)

## Component Structure

✅ Good:
```tsx
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
```

❌ Bad:
```tsx
// Missing forwardRef, no TypeScript interfaces, inline styles
export default function Button(props) {
  return <button style={{color: 'red'}} {...props} />
}
```

## Rationale
These patterns ensure consistency with shadcn/ui conventions and maintain accessibility.
```

### Recommended Rule Categories

| Rule File | Glob Pattern | Purpose |
|-----------|--------------|---------|
| `coding-standards.mdc` | `**/*.{ts,tsx}` | TypeScript/React conventions |
| `shadcn-patterns.mdc` | `**/components/**/*.tsx` | Component patterns |
| `registry-items.mdc` | `**/registry/**` | Registry compliance |
| `styling.mdc` | `**/*.{css,tsx}` | Tailwind/CSS conventions |
| `testing.mdc` | `**/*.test.{ts,tsx}` | Testing patterns |

---

## shadcn Registry Best Practices

### Registry Configuration (registry.json)

Your current `registry.json` follows the schema correctly. Key considerations:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "your-registry-name",
  "homepage": "https://your-registry.com",
  "items": [
    {
      "name": "component-name",
      "type": "registry:component",
      "title": "Human Readable Title",
      "description": "Brief description for AI and humans",
      "registryDependencies": ["button", "@namespace/other"],
      "dependencies": ["package@version"],
      "files": [
        {
          "path": "src/components/component-name.tsx",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

### Registry Item Types

| Type | Use Case |
|------|----------|
| `registry:block` | Complex multi-file components |
| `registry:component` | Single-file components |
| `registry:ui` | UI primitives |
| `registry:lib` | Utility functions |
| `registry:hook` | React hooks |
| `registry:page` | Page templates |
| `registry:theme` | Theme configurations |
| `registry:style` | CSS/style files |

### AI-Friendly Component Documentation

For better AI context, include JSDoc comments in components:

```tsx
/**
 * Brand Header Component
 * 
 * A styled header component with navigation, search, and user controls.
 * 
 * @example
 * ```tsx
 * <BrandHeader 
 *   logo={<Logo />}
 *   navigation={navItems}
 *   user={currentUser}
 * />
 * ```
 * 
 * @see https://your-registry.com/docs/brand-header
 */
export function BrandHeader({ logo, navigation, user }: BrandHeaderProps) {
  // ...
}
```

---

## Implementation Checklist

### Phase 1: Essential Files (High Priority)

- [ ] Create `.cursor/rules/` directory structure
- [ ] Write `general/coding-standards.mdc`
- [ ] Write `components/shadcn-patterns.mdc`
- [ ] Create `AGENTS.md` in project root
- [ ] Create `llms.txt` in public directory

### Phase 2: Enhanced Configuration (Medium Priority)

- [ ] Create `CLAUDE.md` for Claude Code users
- [ ] Add `registry/registry-items.mdc` rules
- [ ] Add accessibility rules (`components/accessibility.mdc`)
- [ ] Add styling rules (`components/styling.mdc`)

### Phase 3: Advanced Setup (Optional)

- [ ] Set up directory-specific AGENTS.md overrides
- [ ] Configure auto-generated llms.txt from registry
- [ ] Add testing rules and patterns
- [ ] Create component generation templates

---

## File Templates

### AGENTS.md Template

```markdown
# Usage UI - shadcn Component Registry

> A custom shadcn/ui component registry for building branded React applications with a nature theme.

## Overview

This project is a shadcn/ui registry that provides themed UI components, blocks, and layouts. Components are designed to be installed via the shadcn CLI and customized for specific brand needs.

## Tech Stack

- **Framework**: Next.js 15+ (App Router, RSC)
- **UI Library**: shadcn/ui, Radix UI primitives
- **Styling**: Tailwind CSS v4, CSS variables (oklch color space)
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Linting**: Biome

## Project Structure

```
src/
├── app/
│   ├── (registry)/     # Registry pages (component browser)
│   └── demo/[name]/    # Demo pages for components
├── components/
│   ├── ui/             # shadcn/ui primitives
│   └── registry/       # Registry UI components
├── layouts/            # Layout components
├── lib/                # Utilities (cn, registry helpers)
└── hooks/              # Custom React hooks
```

## Key Conventions

### Components
- Use functional components with hooks
- Always use `forwardRef` for DOM-forwarding components
- Export named components, not defaults
- Use `cn()` utility from `@/lib/utils` for className merging
- Follow composition patterns over inheritance

### Styling
- Use Tailwind CSS utility classes
- CSS variables use oklch color space for theme colors
- Theme variables defined in `globals.css`
- Support both light and dark modes

### Registry Items
- All components must have registry.json entries
- Include proper `registryDependencies` for shadcn primitives
- Specify correct file `type` (component, lib, hook, etc.)
- Provide clear `title` and `description` for discoverability

### File Naming
- PascalCase for component files: `BrandHeader.tsx`
- kebab-case for utility files: `use-mobile.ts`
- All TypeScript files use `.ts` or `.tsx` extension

## Common Gotchas

1. **CSS Variables**: Colors use oklch, not hex or hsl
2. **Registry URLs**: Remote dependencies need full URLs
3. **RSC**: Default to server components, add "use client" only when needed
4. **Imports**: Use `@/` alias for src directory imports

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run Biome linter
- `pnpm check` - Type check with TypeScript
```

### Cursor Rule Template (.mdc)

```markdown
---
description: "shadcn/ui component development patterns"
globs: ["**/components/**/*.tsx"]
alwaysApply: false
---

# shadcn/ui Component Patterns

## Component Structure

All UI components should follow this pattern:

```tsx
"use client" // Only if client interactivity needed

import * as React from "react"
import { cn } from "@/lib/utils"

// Use interface for props
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary"
  size?: "sm" | "md" | "lg"
}

// Use forwardRef for DOM components
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          // Variant styles
          variant === "default" && "bg-primary text-primary-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground",
          // Size styles
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4",
          size === "lg" && "h-12 px-6 text-lg",
          // Allow custom classes
          className
        )}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component }
export type { ComponentProps }
```

## Do's and Don'ts

✅ **Do**:
- Use semantic HTML elements
- Include proper ARIA attributes
- Support keyboard navigation
- Use CSS variables for theme colors
- Export both component and types

❌ **Don't**:
- Use inline styles
- Hard-code colors (use CSS variables)
- Forget displayName for forwardRef components
- Use default exports for components
- Mix concerns (keep components focused)

## Registry Compliance

When adding to registry.json:
- Use descriptive `title` and `description`
- List all `registryDependencies` (shadcn primitives)
- List all `dependencies` (npm packages)
- Specify correct `type` for each file
```

### llms.txt Template

```markdown
# Usage UI Registry

> A shadcn/ui component registry providing branded UI components, blocks, and layouts with a nature theme.

This registry extends shadcn/ui with custom themed components for building React applications. All components follow shadcn/ui conventions and can be installed via the CLI.

## Documentation

- [Registry Home](https://registry-starter.vercel.app): Browse all components
- [Architecture](https://registry-starter.vercel.app/docs/architecture): Project structure and patterns

## Theme

- [Nature Theme](https://registry-starter.vercel.app/r/theme.json): Green/brown color palette using oklch

## Brand Components

- [Brand Header](https://registry-starter.vercel.app/r/brand-header.json): Navigation header with search and user menu
- [Brand Sidebar](https://registry-starter.vercel.app/r/brand-sidebar.json): Collapsible sidebar navigation
- [Logo](https://registry-starter.vercel.app/r/logo.json): Brand logo component
- [Hero](https://registry-starter.vercel.app/r/hero.json): Landing page hero section
- [Promo](https://registry-starter.vercel.app/r/promo.json): Promotional banner component

## Blocks

- [Blank](https://registry-starter.vercel.app/r/blank.json): Minimal starter template
- [Dashboard](https://registry-starter.vercel.app/r/dashboard.json): Dashboard layout with sidebar
- [Store](https://registry-starter.vercel.app/r/store.json): E-commerce store layout

## UI Components

- [Button](https://registry-starter.vercel.app/r/button.json): Interactive button
- [Card](https://registry-starter.vercel.app/r/card.json): Content container
- [Input](https://registry-starter.vercel.app/r/input.json): Form input field
- [Dialog](https://registry-starter.vercel.app/r/dialog.json): Modal dialog
- [Tabs](https://registry-starter.vercel.app/r/tabs.json): Tabbed interface

## Optional

- [Data Table](https://registry-starter.vercel.app/r/data-table.json): Advanced table with TanStack Table
- [Chart](https://registry-starter.vercel.app/r/chart.json): Data visualization with Recharts
- [Calendar](https://registry-starter.vercel.app/r/calendar.json): Date picker calendar
```

---

## Resources

### Official Documentation

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [shadcn/ui Registry Docs](https://ui.shadcn.com/docs/registry)
- [llms.txt Specification](https://llmstxt.org/)
- [CLAUDE.md Guide](https://docs.anthropic.com/en/docs/claude-code)

### Community Resources

- [Cursor Rules Collection](https://www.cursorhow.com/cursor-rules)
- [shadcn/ui Registry Template](https://github.com/shadcn-ui/registry-template)
- [Awesome Cursor Rules](https://github.com/PatrickJS/awesome-cursorrules)

### Related Specifications

- [AGENTS.md Standard](https://opencode.ai/docs/rules)
- [shadcn/ui MCP Server](https://ui.shadcn.com/docs/mcp)
- [Registry Item Schema](https://ui.shadcn.com/schema/registry-item.json)

---

## Summary of Key Recommendations

1. **Create AGENTS.md** - Universal AI context that works across tools
2. **Set up .cursor/rules/** - Persistent Cursor-specific guidance
3. **Add llms.txt** - LLM-friendly documentation index for your registry
4. **Document component patterns** - JSDoc comments help AI understand intent
5. **Keep context concise** - Every line competes for attention; prioritize essential information
6. **Version control rules** - Treat AI configuration as code; review and iterate

---

*Research compiled: January 2026*
*Based on: Cursor Documentation, shadcn/ui Registry Docs, llms.txt Specification, CLAUDE.md Guide*
