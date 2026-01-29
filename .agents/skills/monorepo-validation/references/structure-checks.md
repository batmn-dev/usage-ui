# Monorepo Structure Checks

Detailed validation criteria for Usage UI monorepo structure.

## Required Files

### Root Level

| File | Required | Purpose |
|------|----------|---------|
| `pnpm-workspace.yaml` | ✅ | Workspace definition |
| `turbo.json` | ✅ | Build orchestration |
| `package.json` | ✅ | Root scripts |
| `tsconfig.json` | ✅ | Project references |
| `biome.json` | ✅ | Linting config |
| `lefthook.yml` | ⚠️ | Git hooks (optional but recommended) |

### apps/www/

| File | Required | Purpose |
|------|----------|---------|
| `package.json` | ✅ | App dependencies |
| `tsconfig.json` | ✅ | TS config with paths |
| `components.json` | ✅ | shadcn CLI config |
| `next.config.ts` | ✅ | Next.js config |
| `postcss.config.mjs` | ✅ | PostCSS config |
| `src/` | ✅ | Source directory |
| `public/` | ✅ | Static assets |

### packages/ui/

| File | Required | Purpose |
|------|----------|---------|
| `package.json` | ✅ | Package exports |
| `tsconfig.json` | ✅ | TS config |
| `components.json` | ✅ | shadcn CLI config |
| `registry.json` | ✅ | Component manifest |
| `src/components/ui/` | ✅ | Base shadcn components |
| `src/components/registry/` | ✅ | Custom meter components |
| `src/lib/utils.ts` | ✅ | Utilities (cn, etc.) |
| `src/styles/globals.css` | ✅ | CSS variables |

### tooling/typescript/

| File | Required | Purpose |
|------|----------|---------|
| `package.json` | ✅ | Package identity |
| `base.json` | ✅ | Shared TS config |

### .changeset/

| File | Required | Purpose |
|------|----------|---------|
| `config.json` | ✅ | Changeset config |

## Package.json Validations

### Root package.json

Required scripts:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}
```

Required devDependencies:

- `turbo`
- `@biomejs/biome`
- `typescript`

### apps/www/package.json

Required fields:

```json
{
  "name": "@usage-ui/www",
  "private": true,
  "dependencies": {
    "@usage-ui/ui": "workspace:*"
  }
}
```

### packages/ui/package.json

Required fields:

```json
{
  "name": "@usage-ui/ui",
  "exports": {
    "./registry.json": "./registry.json",
    "./components": "./src/components/index.ts",
    "./components/*": "./src/components/*/index.ts",
    "./lib/*": "./src/lib/*.ts",
    "./styles/*": "./src/styles/*"
  }
}
```

## tsconfig.json Validations

### apps/www/tsconfig.json

Must extend shared config and define paths:

```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@usage-ui/ui": ["../../packages/ui/src"],
      "@usage-ui/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

### packages/ui/tsconfig.json

Must extend shared config:

```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## components.json Validations

### apps/www/components.json

Critical aliases:

```json
{
  "aliases": {
    "utils": "@usage-ui/ui/lib/utils",
    "ui": "@usage-ui/ui/components"
  },
  "tailwind": {
    "css": "../../packages/ui/src/styles/globals.css"
  }
}
```

### packages/ui/components.json

Standard aliases:

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## Turbo Configuration

### turbo.json

Required tasks:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "public/r/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

Key points:
- `build` must include `"dependsOn": ["^build"]` for proper ordering
- `dev` must have `"cache": false` and `"persistent": true`
- `public/r/**` must be in build outputs for registry JSON
