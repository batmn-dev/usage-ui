import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * Props information extracted from TypeScript interfaces.
 */
export interface PropInfo {
  /** Property name */
  prop: string;
  /** TypeScript type as string */
  type: string;
  /** Default value (if any) */
  default?: string;
  /** Whether the prop is required */
  required: boolean;
  /** Description from JSDoc comment */
  description?: string;
}

/**
 * Component documentation extracted from TypeScript files.
 */
export interface ComponentDoc {
  /** Component display name */
  displayName: string;
  /** Component description from JSDoc */
  description?: string;
  /** Extracted props */
  props: PropInfo[];
}

// Registry types
interface RegistryFile {
  path: string;
  type: string;
  target: string;
}

interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description?: string;
  files?: RegistryFile[];
}

interface Registry {
  items: RegistryItem[];
}

/**
 * Get the path to the packages/ui directory from apps/www.
 */
function getPackageUiPath(): string {
  // In monorepo: apps/www -> packages/ui
  return path.join(process.cwd(), "..", "..", "packages", "ui");
}

/**
 * Parse JSDoc comments from a line of code.
 * Extracts the description text from /** comment * / blocks.
 */
function parseJSDocComment(comment: string): string {
  return comment
    .replace(/\/\*\*\s*/g, "")
    .replace(/\s*\*\//g, "")
    .replace(/^\s*\*\s?/gm, "")
    .trim();
}

/**
 * Extract default value from component implementation.
 * Looks for destructuring patterns like: { value, max = 100 }
 */
function extractDefaultFromDestructuring(
  content: string,
  propName: string,
): string | undefined {
  // Match destructuring patterns: { propName = defaultValue }
  const patterns = [
    // { prop = value } pattern
    new RegExp(`${propName}\\s*=\\s*([^,}]+)`, "m"),
    // prop: defaultValue in object
    new RegExp(`${propName}:\\s*([^,}]+)`, "m"),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      const value = match[1].trim();
      // Clean up the value - remove type annotations and trailing content
      const cleanValue = value.split(",")[0].trim();
      // Skip if it's a type annotation or complex expression
      if (
        !cleanValue.includes(":") &&
        !cleanValue.includes("=>") &&
        cleanValue.length < 50
      ) {
        return cleanValue;
      }
    }
  }

  return undefined;
}

/**
 * Extract props from a TypeScript interface definition.
 * This is a lightweight parser that handles common patterns.
 */
function extractPropsFromInterface(
  content: string,
  interfaceName: string,
): PropInfo[] {
  const props: PropInfo[] = [];

  // Find the interface definition
  const interfaceRegex = new RegExp(
    `interface\\s+${interfaceName}[^{]*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`,
    "s",
  );
  const match = content.match(interfaceRegex);

  if (!match) {
    return props;
  }

  const interfaceBody = match[1];

  // Split into individual property declarations
  // Handle multi-line JSDoc comments
  const propRegex = /(\/\*\*[\s\S]*?\*\/\s*)?([\w]+)(\?)?:\s*([^;]+);/g;

  for (const propMatch of interfaceBody.matchAll(propRegex)) {
    const [, jsDocComment, propName, optional, typeStr] = propMatch;

    // Skip inherited props (from extends)
    if (propName.startsWith("...") || propName === "className") {
      continue;
    }

    const description = jsDocComment
      ? parseJSDocComment(jsDocComment)
      : undefined;

    // Clean up type string
    let cleanType = typeStr.trim();
    // Remove React.ComponentProps extensions for cleaner display
    cleanType = cleanType
      .replace(/React\.\w+<[^>]+>/g, "")
      .replace(/Omit<[^>]+>/g, "")
      .trim();

    // Try to extract default from JSDoc or implementation
    let defaultValue: string | undefined;
    const defaultMatch = description?.match(/\(default:\s*([^)]+)\)/i);
    if (defaultMatch) {
      defaultValue = defaultMatch[1].trim();
    } else {
      defaultValue = extractDefaultFromDestructuring(content, propName);
    }

    props.push({
      prop: propName,
      type: cleanType || "unknown",
      required: !optional,
      default: defaultValue,
      description: description?.replace(/\(default:\s*[^)]+\)/i, "").trim(),
    });
  }

  return props;
}

/**
 * Extract component documentation from a TypeScript file.
 *
 * @param filePath - Relative path from packages/ui/
 * @returns Array of component documentation
 */
export const extractComponentDoc = cache((filePath: string): ComponentDoc[] => {
  const absolutePath = path.join(getPackageUiPath(), filePath);
  const docs: ComponentDoc[] = [];

  try {
    const content = fs.readFileSync(absolutePath, "utf-8");

    // Find all interface definitions that end with "Props"
    const interfaceNames = content.match(/interface\s+(\w+Props)/g) || [];

    for (const match of interfaceNames) {
      const interfaceName = match.replace("interface ", "");
      const componentName = interfaceName.replace("Props", "");

      // Extract component JSDoc (if any) - look above the component definition
      const componentJSDocRegex = new RegExp(
        `(\\/\\*\\*[\\s\\S]*?\\*\\/)\\s*(?:export\\s+)?(?:const|function)\\s+${componentName}`,
      );
      const componentJSDocMatch = content.match(componentJSDocRegex);
      const componentDescription = componentJSDocMatch?.[1]
        ? parseJSDocComment(componentJSDocMatch[1])
        : undefined;

      const props = extractPropsFromInterface(content, interfaceName);

      if (props.length > 0) {
        docs.push({
          displayName: componentName,
          description: componentDescription,
          props,
        });
      }
    }

    return docs;
  } catch (error) {
    console.error(`Failed to extract props from: ${absolutePath}`, error);
    return [];
  }
});

/**
 * Extract props for a registry component by name.
 * Looks up the file path in registry.json and extracts props.
 *
 * @param componentName - The component name from registry.json
 * @returns Array of component documentation, or empty array if not found
 */
export const getComponentProps = cache(
  (componentName: string): ComponentDoc[] => {
    const registryPath = path.join(getPackageUiPath(), "registry.json");

    try {
      const registryContent = fs.readFileSync(registryPath, "utf-8");
      const registry: Registry = JSON.parse(registryContent);
      const item = registry.items.find((i) => i.name === componentName);

      if (!item?.files?.[0]?.path) {
        console.warn(`Component "${componentName}" not found in registry`);
        return [];
      }

      return extractComponentDoc(item.files[0].path);
    } catch (error) {
      console.error(`Failed to load registry for "${componentName}"`, error);
      return [];
    }
  },
);

/**
 * Get all available component names from the registry.
 *
 * @returns Array of component names
 */
export const getComponentNames = cache((): string[] => {
  const registryPath = path.join(getPackageUiPath(), "registry.json");

  try {
    const registryContent = fs.readFileSync(registryPath, "utf-8");
    const registry: Registry = JSON.parse(registryContent);
    return registry.items
      .filter((item) => item.type === "registry:component")
      .map((item) => item.name);
  } catch (error) {
    console.error("Failed to load registry", error);
    return [];
  }
});

/**
 * Convert PropInfo array to ApiTable-compatible format.
 * Formats types and defaults for display.
 *
 * @param props - Array of PropInfo from extraction
 * @returns Formatted data for ApiTable component
 */
export function formatPropsForApiTable(props: PropInfo[]): Array<{
  prop: string;
  type: string;
  default: string;
  description?: string;
}> {
  return props.map((p) => ({
    prop: p.prop,
    type: formatType(p.type),
    default: p.required ? "Required" : p.default || "—",
    description: p.description,
  }));
}

/**
 * Format a TypeScript type for display.
 * Handles union types, generics, etc.
 */
function formatType(type: string): string {
  // Clean up keyof expressions
  if (type.includes("keyof typeof")) {
    const match = type.match(/keyof typeof (\w+)/);
    if (match) {
      // Try to resolve the actual values
      return type;
    }
  }

  // Format union types with quotes for string literals
  if (type.includes("|")) {
    return type
      .split("|")
      .map((t) => t.trim())
      .join(" | ");
  }

  return type;
}
