"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { RegistryLogo } from "@/components/registry/registry-logo";
import { ModeToggle } from "@/components/registry/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getBlocks, getComponents, getUIPrimitives } from "@/lib/registry";
import { cn } from "@/lib/utils";

const uiItems = getUIPrimitives();
const componentItems = getComponents();
const blockItems = getBlocks();

export const gettingStartedItems = [
  { title: "Introduction", path: "/" },
  { title: "Design Tokens", path: "/tokens" },
];

export function MobileSidebarTrigger() {
  const { setOpenMobile } = useSidebar();

  return (
    <div className="absolute top-8 right-4 md:hidden">
      <Button aria-label="Open menu" onClick={() => setOpenMobile(true)}>
        <Menu className="size-5" />
      </Button>
    </div>
  );
}

// Gradient fade component for top/bottom of sidebar
function SidebarFade({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={cn(
        "pointer-events-none z-10 h-8 w-full shrink-0 blur-[2px]",
        position === "top" &&
          "absolute top-0 bg-gradient-to-b from-sidebar via-sidebar/80 to-transparent",
        position === "bottom" &&
          "-bottom-1 sticky bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent",
      )}
    />
  );
}

export function RegistrySidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-2 py-2">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <RegistryLogo />
          </Link>

          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpenMobile(false)}
          >
            <X />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="relative">
        {/* Top gradient fade */}
        <SidebarFade position="top" />

        {/* Subtle vertical border line */}
        <div className="absolute top-0 right-0 bottom-0 hidden h-full w-px bg-gradient-to-b from-transparent via-border to-transparent lg:flex" />

        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="font-medium text-muted-foreground text-xs">
            Getting Started
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {gettingStartedItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.path}
                    size="sm"
                    className="h-[30px] text-[0.8rem]"
                  >
                    <Link onClick={() => setOpenMobile(false)} href={item.path}>
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-muted-foreground text-xs">
            Blocks
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {blockItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/docs/${item.name}`}
                    size="sm"
                    className="h-[30px] text-[0.8rem]"
                  >
                    <Link
                      onClick={() => setOpenMobile(false)}
                      href={`/docs/${item.name}`}
                    >
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-muted-foreground text-xs">
            Components
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {componentItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/docs/${item.name}`}
                    size="sm"
                    className="h-[30px] text-[0.8rem]"
                  >
                    <Link
                      onClick={() => setOpenMobile(false)}
                      href={`/docs/${item.name}`}
                    >
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-muted-foreground text-xs">
            UI Primitives
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {uiItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/docs/${item.name}`}
                    size="sm"
                    className="h-[30px] text-[0.8rem]"
                  >
                    <Link
                      onClick={() => setOpenMobile(false)}
                      href={`/docs/${item.name}`}
                    >
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom gradient fade */}
        <SidebarFade position="bottom" />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex justify-end">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
