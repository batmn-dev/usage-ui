import type * as React from "react";

// Import documentation components (created in Phase 2)
// import { ComponentCodePreview } from "@/components/docs/component-code-preview"
// import { ApiTable } from "@/components/docs/api-table"

type MDXComponents = Record<
  string,
  React.ComponentType<{ children?: React.ReactNode; [key: string]: unknown }>
>;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override default elements with custom styling
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="scroll-m-20 font-semibold text-3xl tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="mt-12 scroll-m-20 border-b pb-2 font-medium text-xl tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-8 scroll-m-20 font-medium text-lg tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="mt-6 scroll-m-20 font-medium text-base tracking-tight">
        {children}
      </h4>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
    ),
    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4"
      >
        {children}
      </a>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-4 md:my-8" />,
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-6 w-full overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="m-0 border-t p-0 even:bg-muted">{children}</tr>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="mt-6 mb-4 overflow-x-auto rounded-lg border bg-muted px-4 py-4">
        {children}
      </pre>
    ),
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
        {children}
      </code>
    ),
    // Add custom components (uncomment when created in Phase 2)
    // ComponentCodePreview,
    // ApiTable,
    ...components,
  };
}
