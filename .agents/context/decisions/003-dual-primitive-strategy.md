# ADR-003: Dual Primitive Strategy (Radix + Base)

## Status

**Accepted** - January 2025

## Context

When building meter components, we needed to decide how to handle accessibility primitives:

1. **Radix-only**: All components use Radix UI primitives
2. **Base-only**: All components use plain HTML with manual ARIA
3. **Dual versions**: Provide both Radix and Base versions

## Decision

Implement **dual versions** for core meter components:
- `usage-meter.tsx` - Radix-based (full accessibility)
- `usage-meter-base.tsx` - Lightweight (no Radix)

## Rationale

### Why Not Radix-Only

1. **Bundle size**: Some users prioritize minimal bundle size
2. **Simple use cases**: Not all meters need full keyboard nav
3. **Framework flexibility**: Some frameworks don't work well with Radix

### Why Not Base-Only

1. **Accessibility compliance**: Many projects require WCAG compliance
2. **Complex interactions**: Radix handles edge cases we'd miss
3. **shadcn alignment**: shadcn/ui uses Radix for all interactive components

### Why Dual Versions

1. **User choice**: Let users pick based on their requirements
2. **Documentation value**: Shows both accessible and minimal patterns
3. **Gradual adoption**: Users can start with base, upgrade to Radix

## Implementation

```
packages/ui/src/components/registry/usage-meter/
├── usage-meter.tsx       # Radix Progress primitive
├── usage-meter-base.tsx  # div with role="progressbar"
└── index.ts              # Exports both
```

### When to Create Both Versions

| Component Type | Radix | Base |
|----------------|-------|------|
| Core meters | ✅ | ✅ |
| Cards (use shadcn Card) | ❌ | ❌ |
| Indicators (simple display) | ❌ | ✅ |
| Charts (Tremor-based) | ❌ | ❌ |

## Consequences

### Positive
- Maximum flexibility for users
- Clear accessibility story
- Smaller bundle for simple use cases

### Negative
- More code to maintain
- Must keep both versions in sync
- Documentation complexity

## Notes

The base version MUST include manual ARIA attributes:
```tsx
<div
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuetext={`${percentage}%`}
/>
```
