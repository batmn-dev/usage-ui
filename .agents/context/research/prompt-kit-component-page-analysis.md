# Prompt-Kit Component Page Analysis

> Research comparing prompt-kit's component documentation pages with usage-ui's current implementation.

**Date:** 2026-01-29  
**Source:** https://prompt-kit.com/docs/chain-of-thought  
**Purpose:** Identify UI/UX patterns to improve usage-ui's registry component pages

---

## Executive Summary

Prompt-kit has a polished, documentation-focused component page design that includes multiple example variants, code viewing, API documentation tables, and navigation between components. Usage-ui's current implementation is more minimal, focusing on a single iframe preview with basic copy/open actions.

---

## Layout & Structure Comparison

### Grid System

| Aspect | prompt-kit | usage-ui |
|--------|------------|----------|
| **Grid** | 12-column (`md:grid-cols-12`), content in cols 4-10 | Simple container with padding |
| **Max Width** | `max-w-(--breakpoint-2xl)` | Container default |
| **Typography** | `prose prose-zinc dark:prose-invert` wrapper | Manual styling |

### prompt-kit Layout Structure

```html
<div class="relative mx-auto grid w-full max-w-(--breakpoint-2xl) grid-cols-6 md:grid-cols-12">
  <div class="col-start-1 col-end-7 flex flex-col md:col-start-4 md:col-end-12 lg:col-end-10">
    <main class="flex-1">
      <div class="prose prose-zinc dark:prose-invert ...">
        <!-- Content here -->
      </div>
    </main>
  </div>
</div>
```

### usage-ui Layout Structure

```tsx
<div className="container p-5 md:p-10">
  <div className="mb-6 flex items-center justify-between">
    <!-- Back button + title -->
  </div>
  <ComponentCard ... />
</div>
```

---

## Component Page Content Sections

### prompt-kit Page Structure

1. **Title** (`<h1>`) - Component name
2. **Description** (`<p>`) - One-line summary
3. **Examples Section** (`<h2>Examples</h2>`)
   - Multiple example variants (Basic, Advanced, etc.)
   - Each with Preview/Code tabs
4. **Installation Section** (`<h2>Installation</h2>`)
   - CLI/Manual tabs
   - Copy-to-clipboard functionality
5. **Component API Section** (`<h2>Component API</h2>`)
   - Props tables for each sub-component
6. **Previous/Next Navigation** - Links to adjacent components

### usage-ui Page Structure

1. **Back Button** - Returns to home
2. **Title** - Component name
3. **Preview Card**
   - Description
   - Copy command button
   - Open in v0 button
   - iframe preview (800px height)

### Missing in usage-ui

- [ ] Multiple example variants
- [ ] Preview/Code tabs
- [ ] API documentation tables
- [ ] Installation section with CLI/Manual options
- [ ] Previous/Next navigation
- [ ] Prose typography wrapper

---

## Tab Component Implementation

### prompt-kit Tab Design

```html
<div role="tablist" class="inline-flex h-10 w-full items-center justify-start border-b">
  <button 
    role="tab" 
    data-state="active" 
    class="relative inline-flex h-10 items-center justify-center px-4 py-1 pt-2 pb-3 text-sm font-medium"
  >
    <!-- Animated bottom indicator -->
    <div class="absolute bottom-0 flex h-0.5 w-full justify-center" style="opacity: 1;">
      <div class="bg-foreground h-0.5 w-4/5"></div>
    </div>
    Preview
  </button>
  <button role="tab" data-state="inactive" class="...">
    Code
  </button>
</div>
```

**Key Features:**
- Border-bottom on tab list container
- Active tab has animated underline indicator (80% width, centered)
- Inactive tabs show `text-muted-foreground`
- Active tabs show `text-zinc-950 dark:text-white`

### Tab Styling Classes

```css
/* Tab trigger base */
.tab-trigger {
  @apply relative inline-flex h-10 items-center justify-center;
  @apply rounded-none bg-transparent px-4 py-1 pt-2 pb-3;
  @apply text-sm font-medium whitespace-nowrap;
  @apply text-muted-foreground transition-none;
  @apply focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden;
  @apply disabled:pointer-events-none disabled:opacity-50;
  @apply data-[state=active]:text-zinc-950;
  @apply dark:text-zinc-500 dark:data-[state=active]:text-white;
}
```

---

## Preview Container

### prompt-kit Preview

```html
<div class="border-border flex min-h-[350px] w-full items-center justify-center rounded-md border p-8">
  <div class="w-full max-w-3xl">
    <!-- Component renders directly here -->
  </div>
</div>
```

**Characteristics:**
- Minimum height: 350px
- Centered content with max-width
- Generous padding (p-8)
- Direct component rendering (not iframe)

### usage-ui Preview

```tsx
<div className="h-[800px] w-full overflow-hidden rounded-md border border-border p-4">
  <iframe src={`/demo/${component.name}`} className="h-full w-full" />
</div>
```

**Characteristics:**
- Fixed height: 800px
- Uses iframe for isolation
- Less padding (p-4)

---

## Code Display

### prompt-kit Code Block

```html
<div class="group relative">
  <!-- Copy button - appears on hover -->
  <button class="bg-background absolute top-3 right-3 p-2 opacity-0 transition-opacity group-hover:opacity-100">
    <div class="absolute inset-0 transform transition-all duration-300 scale-100 opacity-100">
      <svg class="lucide lucide-copy h-4 w-4 text-zinc-400">...</svg>
    </div>
    <div class="absolute inset-0 transform transition-all duration-300 scale-0 opacity-0">
      <svg class="lucide lucide-check h-4 w-4 text-zinc-400">...</svg>
    </div>
  </button>
  
  <!-- Syntax highlighted code -->
  <div class="not-prose bg-background border-border overflow-auto rounded-md border p-2 text-[13px]">
    <pre class="shiki github-light" style="background-color:#fff;color:#24292e">
      <code>
        <span class="line">
          <span style="color:#6F42C1">npx</span>
          <span style="color:#032F62"> shadcn</span>
          ...
        </span>
      </code>
    </pre>
  </div>
</div>
```

**Features:**
- Shiki syntax highlighting (github-light theme)
- Hover-to-reveal copy button
- Animated copy/check icon transition
- Dark mode support: `dark:[&_pre]:!bg-transparent dark:[&_span]:!text-white`

---

## API Documentation Tables

### prompt-kit Table Structure

```html
<div class="not-prose border-border relative w-full table-auto overflow-auto rounded-lg border text-sm">
  <table class="w-full">
    <thead class="bg-secondary text-foreground">
      <tr class="h-10">
        <th class="px-4 pb-0 text-left align-middle font-[450]">Prop</th>
        <th class="px-4 pb-0 text-left align-middle font-[450]">Type</th>
        <th class="px-4 pb-0 text-left align-middle font-[450]">Default</th>
        <th class="px-4 pb-0 text-left align-middle font-[450]">Description</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-zinc-200 dark:divide-zinc-600">
      <tr class="h-10">
        <td class="px-4 py-2 text-left align-middle">children</td>
        <td class="px-4 py-2 text-left align-middle">React.ReactNode</td>
        <td class="px-4 py-2 text-left align-middle"></td>
        <td class="px-4 py-2 text-left align-middle">ChainOfThoughtStep components</td>
      </tr>
      <!-- More rows -->
    </tbody>
  </table>
</div>
```

**Styling:**
- `not-prose` to escape prose typography
- Rounded corners with border
- Secondary background on header
- Dividers between rows
- Font weight 450 for headers
- Consistent padding and alignment

---

## Navigation Between Components

### prompt-kit Previous/Next Links

```html
<div class="flex justify-between pt-12 pb-20">
  <a class="hover:bg-primary-foreground inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-zinc-500 transition-colors duration-200" 
     href="/docs/mcp">
    <svg class="lucide lucide-chevron-left h-4 w-4">...</svg>
    Model Context Protocol
  </a>
  <a class="hover:bg-primary-foreground inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-zinc-500 transition-colors duration-200" 
     href="/docs/chat-container">
    Chat Container
    <svg class="lucide lucide-chevron-right h-4 w-4">...</svg>
  </a>
</div>
```

**Features:**
- Flexbox with `justify-between`
- Generous vertical spacing (pt-12 pb-20)
- Bordered pill-style buttons
- Hover background change
- Chevron icons indicating direction

---

## Sidebar Comparison

### Common Patterns

Both use shadcn's Sidebar component with:
- Collapsible groups
- Active item highlighting
- Mobile responsive behavior

### prompt-kit Sidebar Enhancements

1. **"new" badges** on recent components:
```html
<span class="text-primary text-xs leading-none">new</span>
```

2. **Dashed border** on content area:
```html
<div class="border-r border-dashed">...</div>
```

3. **Theme toggle** integrated in sidebar content

4. **No search** visible in sidebar

### usage-ui Sidebar Features

1. **Search input** with icon
2. **Collapsible groups** with icons
3. **Theme toggle** in footer

---

## Typography (Prose) Configuration

### prompt-kit Prose Classes

```css
.prose {
  /* Headings */
  @apply prose-h1:scroll-m-20 prose-h1:text-2xl prose-h1:font-semibold;
  @apply prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-xl prose-h2:font-medium;
  @apply prose-h3:scroll-m-20 prose-h3:text-base prose-h3:font-medium;
  @apply prose-h4:scroll-m-20 prose-h4:text-base prose-h4:font-medium;
  @apply prose-h5:scroll-m-20 prose-h5:text-sm;
  @apply prose-h6:scroll-m-20 prose-h6:text-xs;
  
  /* Content */
  @apply prose-strong:font-medium;
  @apply prose-code:block prose-code:rounded-md prose-code:bg-gray-100 prose-code:p-1 prose-code:text-gray-800;
  @apply prose-table:block prose-table:overflow-y-auto;
  @apply prose-img:m-0;
}
```

**Key Settings:**
- `scroll-m-20` on headings for anchor link offset
- h2 has `mt-12` for section spacing
- Font weights: semibold (h1), medium (h2-h4)
- Code blocks have background and padding

---

## Recommendations for usage-ui

### High Priority

1. **Add Preview/Code tabs** to component pages
   - Show source code alongside preview
   - Use Shiki for syntax highlighting

2. **Add API documentation tables**
   - Document props for each component
   - Follow prompt-kit's table structure

3. **Implement Previous/Next navigation**
   - Help users browse components sequentially

### Medium Priority

4. **Use prose typography wrapper**
   - Consistent heading sizes and spacing
   - Better readability

5. **Multiple example variants**
   - Show different use cases per component
   - Basic, Advanced, With Icons, etc.

6. **Installation section**
   - CLI/Manual tabs
   - Clear copy-to-clipboard UX

### Low Priority

7. **"new" badges** for recent components
8. **Animated tab indicators**
9. **Direct component rendering** (vs iframe)

---

## Implementation Notes

### Dependencies Needed

- **Shiki** - Syntax highlighting
- Already have: Radix Tabs, existing shadcn components

### Files to Modify

1. `apps/www/src/app/(registry)/registry/[name]/page.tsx` - Main component page
2. Create new components:
   - `ComponentTabs.tsx` - Preview/Code tabs
   - `ApiTable.tsx` - Props documentation
   - `ComponentNav.tsx` - Previous/Next links
3. Add prose configuration to `globals.css`

### Data Requirements

- Source code for each component (for code view)
- Props definitions (for API tables)
- Component ordering (for prev/next nav)

---

## References

- [prompt-kit Chain of Thought page](https://prompt-kit.com/docs/chain-of-thought)
- [prompt-kit GitHub](https://github.com/ibelick/prompt-kit)
- [shadcn/ui docs pattern](https://ui.shadcn.com/docs/components)
