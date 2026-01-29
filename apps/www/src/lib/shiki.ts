import { cache } from "react";
import {
  type BundledLanguage,
  type Highlighter,
  createHighlighter,
} from "shiki";

/** Supported languages for syntax highlighting */
export type SupportedLanguage =
  | "typescript"
  | "tsx"
  | "javascript"
  | "jsx"
  | "bash"
  | "json"
  | "css";

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create the Shiki highlighter singleton.
 * Loads github-light and github-dark themes.
 */
export const getHighlighter = cache(async (): Promise<Highlighter> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "bash",
        "json",
        "css",
      ] satisfies SupportedLanguage[],
    });
  }
  return highlighterPromise;
});

/**
 * Highlight code with Shiki.
 * Returns HTML string with syntax highlighting.
 *
 * @param code - The source code to highlight
 * @param lang - The language for syntax highlighting
 */
export const highlightCode = cache(
  async (code: string, lang: BundledLanguage = "tsx"): Promise<string> => {
    const highlighter = await getHighlighter();

    return highlighter.codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  },
);

/**
 * Highlight code and return the HTML tokens for more control over rendering.
 * Useful when you need to wrap lines or add line numbers.
 *
 * @param code - The source code to highlight
 * @param lang - The language for syntax highlighting
 */
export const highlightCodeToTokens = cache(
  async (code: string, lang: BundledLanguage = "tsx") => {
    const highlighter = await getHighlighter();

    return highlighter.codeToTokens(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  },
);
