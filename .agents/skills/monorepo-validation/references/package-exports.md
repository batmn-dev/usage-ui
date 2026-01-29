# Package Exports Configuration

How package exports work in the Usage UI monorepo.

## @usage-ui/ui Exports

The UI package uses the `exports` field to define what can be imported:

```json
{
  "exports": {
    "./registry.json": "./registry.json",
    "./components": "./src/components/index.ts",
    "./components/*": "./src/components/*/index.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts",
    "./styles/*": "./src/styles/*"
  }
}
```

### Export Patterns

| Export Path | Resolves To | Example Import |
|-------------|-------------|----------------|
| `./registry.json` | `registry.json` | `import "@usage-ui/ui/registry.json"` |
| `./components` | `src/components/index.ts` | `import { Button } from "@usage-ui/ui/components"` |
| `./components/*` | `src/components/*/index.ts` | `import { UsageMeter } from "@usage-ui/ui/components/registry/usage-meter"` |
| `./lib/*` | `src/lib/*.ts` | `import { cn } from "@usage-ui/ui/lib/utils"` |
| `./styles/*` | `src/styles/*` | `@import "@usage-ui/ui/styles/globals.css"` |

### Barrel Files

Each component directory needs an `index.ts` for the wildcard export to work:

```
packages/ui/src/components/
├── index.ts                 # Re-exports ui/ and registry/
├── ui/
│   └── index.ts             # Re-exports all shadcn components
└── registry/
    ├── index.ts             # Re-exports all registry components
    └── usage-meter/
        └── index.ts         # Exports UsageMeter
```

Example `packages/ui/src/components/registry/usage-meter/index.ts`:

```ts
export { UsageMeter } from "./usage-meter"
export type { UsageMeterProps } from "./usage-meter"
```

## Workspace Protocol

Internal dependencies use the `workspace:*` protocol:

```json
// apps/www/package.json
{
  "dependencies": {
    "@usage-ui/ui": "workspace:*"
  }
}
```

This tells pnpm to:
1. Link directly to the local package (not npm)
2. Always use the current workspace version
3. Publish with actual version numbers (e.g., `^0.1.0`)

## TypeScript Path Aliases

Exports work at runtime. For TypeScript to understand imports at compile time, paths must be configured:

### In apps/www/tsconfig.json

```json
{
  "paths": {
    "@usage-ui/ui": ["../../packages/ui/src"],
    "@usage-ui/ui/*": ["../../packages/ui/src/*"]
  }
}
```

### Alias vs Export Mapping

| Import | TypeScript Resolves To | Runtime Resolves To |
|--------|------------------------|---------------------|
| `@usage-ui/ui/lib/utils` | `packages/ui/src/lib/utils.ts` | `packages/ui/src/lib/utils.ts` |
| `@usage-ui/ui/components` | `packages/ui/src/components/index.ts` | `packages/ui/src/components/index.ts` |

## Validation Commands

Check exports are configured:

```bash
# Verify exports field exists
grep -A10 '"exports"' packages/ui/package.json

# Verify barrel files exist
ls packages/ui/src/components/index.ts
ls packages/ui/src/components/ui/index.ts 2>/dev/null || echo "ui/index.ts missing"
ls packages/ui/src/components/registry/index.ts 2>/dev/null || echo "registry/index.ts missing"
```

Test import resolution:

```bash
# From apps/www directory
cd apps/www
pnpm exec tsc --noEmit --traceResolution 2>&1 | grep "@usage-ui/ui"
```

## Common Export Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing index.ts | "Cannot find module" | Create barrel file |
| Wrong export path | Import resolves to undefined | Check exports field mapping |
| Missing tsconfig paths | TS error but runtime works | Add paths to tsconfig |
| Circular exports | Build hangs or fails | Restructure barrel files |
