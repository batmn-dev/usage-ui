import type { ReactNode } from "react";

import {
  MobileSidebarTrigger,
  RegistrySidebar,
} from "@/components/registry/registry-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DocsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="container-wrapper flex min-h-svh flex-1 flex-col px-2">
      <SidebarProvider
        className="flex min-h-min w-full flex-1 items-start px-0 lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--top-spacing": "0",
          } as React.CSSProperties
        }
      >
        <MobileSidebarTrigger />
        <RegistrySidebar />
        {/* Content wrapper - matches shadcn docs pattern */}
        <div className="h-full w-full">
          <div
            data-slot="docs"
            className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
          >
            <main className="flex min-w-0 flex-1 flex-col">
              {/* Top spacing */}
              <div className="h-4 shrink-0 lg:h-8" />
              <div className="mx-auto flex w-full min-w-0 max-w-[40rem] flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </div>
  );
}
