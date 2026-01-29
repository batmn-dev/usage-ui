# ADR-001: Use OKLCH Color Space for CSS Variables

## Status

**Accepted** - January 2025

## Context

When setting up the theming system for Usage UI, we needed to choose a color space for CSS variables. Options considered:
- HSL (Hue, Saturation, Lightness)
- RGB/Hex
- OKLCH (OK Lightness, Chroma, Hue)

## Decision

Use **OKLCH** color space for all CSS variables.

```css
:root {
  --meter-success: oklch(0.723 0.191 142.5);
  --meter-warning: oklch(0.795 0.184 86.047);
  --meter-danger: oklch(0.637 0.237 25.331);
}
```

## Rationale

1. **Perceptual uniformity**: OKLCH is perceptually uniform, meaning equal changes in values produce equal perceived changes in color.

2. **shadcn/ui alignment**: shadcn/ui v4+ uses OKLCH as the default color space. Aligning with upstream reduces friction.

3. **Better for programmatic manipulation**: Creating tints/shades and color palettes is more predictable in OKLCH.

4. **Modern browser support**: All modern browsers support OKLCH as of 2024.

## Consequences

### Positive
- Consistent color perception across the theme
- Easy to create harmonious color variations
- Future-proof alignment with CSS standards

### Negative
- Less familiar to developers used to HSL/RGB
- Requires conversion when working with design tools that don't support OKLCH
- Slightly more complex syntax

## Notes

When converting from other color spaces, use tools like:
- [oklch.com](https://oklch.com)
- CSS `color()` function for browser conversion
