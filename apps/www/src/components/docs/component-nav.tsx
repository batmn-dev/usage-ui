import { getRegistryItems } from "@/lib/registry";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ComponentNavProps {
  currentName: string;
  className?: string;
}

export function ComponentNav({ currentName, className }: ComponentNavProps) {
  const items = getRegistryItems();
  const currentIndex = items.findIndex((item) => item.name === currentName);

  const prev = currentIndex > 0 ? items[currentIndex - 1] : null;
  const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  return (
    <div className={cn("flex justify-between pt-12 pb-20", className)}>
      {prev ? (
        <Link
          href={`/docs/${prev.name}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5",
            "text-muted-foreground text-sm transition-colors",
            "hover:bg-muted hover:text-foreground",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {prev.title}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/docs/${next.name}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5",
            "text-muted-foreground text-sm transition-colors",
            "hover:bg-muted hover:text-foreground",
          )}
        >
          {next.title}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
