import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Top spacing matching shadcn pattern */}
      <div className="h-4 shrink-0 lg:h-8" />

      <div className="mx-auto flex w-full min-w-0 max-w-[40rem] flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-2">
          <h1 className="scroll-m-24 font-semibold text-3xl tracking-tight">
            Introduction
          </h1>
          <p className="text-balance text-[1.05rem] text-muted-foreground sm:text-base md:max-w-[80%]">
            A shadcn/ui component registry for usage meters, quota indicators,
            and resource consumption visualizations.
          </p>
        </div>

        <div className="w-full flex-1 space-y-6 text-[1.05rem] leading-relaxed sm:text-[15px]">
          <p>
            <strong className="font-medium">
              This is not a component library.
            </strong>{" "}
            It's a collection of copy-paste components you can use to build your
            own usage and quota visualization system.
          </p>

          <p>
            Components are distributed via the shadcn CLI. You install them into
            your project and own the code completely. Customize, extend, or
            modify them however you need.
          </p>

          <div className="rounded-lg border bg-muted/50 p-4">
            <code className="text-sm">
              npx shadcn add https://usage-ui.vercel.app/r/usage-meter.json
            </code>
          </div>

          <h2 className="scroll-m-28 pt-4 font-medium text-xl tracking-tight">
            Open Code
          </h2>
          <p>
            Every component's source code is open for modification. You have
            full control to customize and extend components to fit your design
            system. No wrapper components, no style overrides—just edit the code
            directly.
          </p>

          <h2 className="scroll-m-28 pt-4 font-medium text-xl tracking-tight">
            AI-Ready
          </h2>
          <p>
            Integrate this registry with AI IDEs using{" "}
            <Link href="/docs/mcp" className="underline underline-offset-4">
              Model Context Protocol (MCP)
            </Link>
            . The open code and consistent API make it easy for AI models to
            read, understand, and generate new components.
          </p>

          <h2 className="scroll-m-28 pt-4 font-medium text-xl tracking-tight">
            Getting Started
          </h2>
          <p>
            Browse the sidebar to explore available components. Start with a{" "}
            <Link href="/docs/blank" className="underline underline-offset-4">
              blank block
            </Link>{" "}
            for a clean starting point, or pick individual components like the{" "}
            <Link
              href="/docs/usage-meter"
              className="underline underline-offset-4"
            >
              usage meter
            </Link>{" "}
            to add specific functionality.
          </p>

          <p>
            Each component page includes a live preview, installation
            instructions, and API documentation.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-6 text-sm">
          <span className="text-muted-foreground">Built with shadcn/ui</span>
          <Link
            href="/docs/button"
            className="flex items-center gap-1 font-medium hover:underline"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </>
  );
}
