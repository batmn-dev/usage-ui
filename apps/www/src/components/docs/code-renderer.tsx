import { type SupportedLanguage, highlightCode } from "@/lib/shiki";
import { cn } from "@/lib/utils";

interface CodeRendererProps {
  code: string;
  lang?: SupportedLanguage;
  className?: string;
}

export async function CodeRenderer({
  code,
  lang = "tsx",
  className,
}: CodeRendererProps) {
  const html = await highlightCode(code, lang);

  return (
    <div
      className={cn(
        "not-prose overflow-auto rounded-md border bg-background p-4 text-[13px]",
        // Theme-aware styling for Shiki output
        "[&_pre]:!bg-transparent [&_code]:!bg-transparent",
        "dark:[&_span]:!text-[var(--shiki-dark)]",
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki returns safe pre-rendered HTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
