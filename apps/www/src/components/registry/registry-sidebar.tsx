"use client";

import {
  Blocks,
  ChevronDown,
  Component,
  Home,
  Menu,
  Search,
  ToyBrick,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { RegistryLogo } from "@/components/registry/registry-logo";
import { ModeToggle } from "@/components/registry/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getBlocks, getComponents, getUIPrimitives } from "@/lib/registry";

const uiItems = getUIPrimitives();
const componentItems = getComponents();
const blockItems = getBlocks();

export const gettingStartedItems = [
  { title: "Home", path: "/" },
  { title: "Design Tokens", path: "/tokens" },
];

// Skeleton fallback for SSR to prevent hydration mismatch with Radix components
function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-2">
      {/* Getting Started */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-1 pl-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      {/* Blocks */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-1 pl-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      {/* Components */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-1 pl-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      {/* UI Primitives */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-1 pl-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}

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

export function RegistrySidebar() {
  const pathname = usePathname();

  const { setOpenMobile } = useSidebar();

  // Track mount state to prevent hydration mismatch.
  // Radix Collapsible components use useId for accessibility attributes,
  // which can generate different IDs on server vs client due to streaming.
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredUiItems, setFilteredUiItems] = React.useState(uiItems);
  const [filteredComponents, setFilteredComponents] =
    React.useState(componentItems);
  const [filteredBlocks, setFilteredBlocks] = React.useState(blockItems);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (searchTerm) {
      setFilteredUiItems(
        uiItems.filter((item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
      setFilteredComponents(
        componentItems.filter((item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
      setFilteredBlocks(
        blockItems.filter((item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    } else {
      setFilteredUiItems(uiItems);
      setFilteredComponents(componentItems);
      setFilteredBlocks(blockItems);
    }
  }, [searchTerm]);

  return (
    <Sidebar collapsible="icon">
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
        <div className="px-2 py-2 opacity-100 transition-all duration-200">
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full w-full pr-2">
          {!mounted ? (
            // Show skeleton during SSR to prevent hydration mismatch
            <SidebarSkeleton />
          ) : (
            <>
              <Collapsible defaultOpen={true} className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger className="w-full">
                    <SidebarGroupLabel className="flex cursor-pointer items-center justify-between">
                      <div className="flex min-w-0 items-center">
                        <Home className="size-4 flex-shrink-0" />
                        <span className="ml-2 opacity-100 transition-all duration-200">
                          Getting Started
                        </span>
                      </div>
                      <ChevronDown className="size-4 flex-shrink-0 opacity-100 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {gettingStartedItems.map((item) => (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === item.path}
                            >
                              <Link
                                onClick={() => setOpenMobile(false)}
                                href={item.path}
                              >
                                {item.title}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>

              <Collapsible defaultOpen={true} className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger className="w-full">
                    <SidebarGroupLabel className="flex cursor-pointer items-center justify-between">
                      <div className="flex min-w-0 items-center">
                        <Blocks className="size-4 flex-shrink-0" />
                        <span className="ml-2 transition-all duration-200">
                          Blocks
                        </span>
                      </div>
                      <ChevronDown className="size-4 flex-shrink-0 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {filteredBlocks.map((item) => (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === `/docs/${item.name}`}
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
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>

              <Collapsible defaultOpen={true} className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger className="w-full">
                    <SidebarGroupLabel className="flex cursor-pointer items-center justify-between">
                      <div className="flex min-w-0 items-center">
                        <Component className="size-4 flex-shrink-0" />
                        <span className="ml-2 transition-all duration-200">
                          Components
                        </span>
                      </div>
                      <ChevronDown className="size-4 flex-shrink-0 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {filteredComponents.map((item) => (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === `/docs/${item.name}`}
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
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>

              <Collapsible defaultOpen={true} className="group/collapsible">
                <SidebarGroup>
                  <CollapsibleTrigger className="w-full">
                    <SidebarGroupLabel className="flex cursor-pointer items-center justify-between">
                      <div className="flex min-w-0 items-center">
                        <ToyBrick className="size-4 flex-shrink-0" />
                        <span className="ml-2 transition-all duration-200">
                          UI Primitives
                        </span>
                      </div>
                      <ChevronDown className="size-4 flex-shrink-0 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {filteredUiItems.map((item) => (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === `/docs/${item.name}`}
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
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            </>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex justify-end">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
