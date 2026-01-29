import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cache } from "react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the path to the packages/ui directory from apps/www.
 */
function getPackageUiPath(): string {
  // From apps/www/src/lib/ -> packages/ui (4 levels up, then into packages/ui)
  return path.join(__dirname, "..", "..", "..", "..", "packages", "ui");
}

/**
 * Extract source code from a file path at build time.
 * Uses React cache for deduplication during SSG.
 *
 * @param filePath - Relative path from packages/ui/
 * @returns The file contents as a string
 */
export const extractCodeFromFilePath = cache((filePath: string): string => {
  const absolutePath = path.join(getPackageUiPath(), filePath);

  try {
    return fs.readFileSync(absolutePath, "utf-8");
  } catch (error) {
    console.error(`Failed to read file: ${absolutePath}`, error);
    return `// Error: Could not load source code for ${filePath}`;
  }
});

/**
 * Extract source code for a registry component by name.
 * Looks up the path in registry.json and reads the file.
 *
 * @param componentName - The component name from registry.json
 * @returns The source code string
 */
export const getComponentSource = cache((componentName: string): string => {
  const registryPath = path.join(getPackageUiPath(), "registry.json");

  try {
    const registryContent = fs.readFileSync(registryPath, "utf-8");
    const registry = JSON.parse(registryContent);
    const item = registry.items.find(
      (i: { name: string }) => i.name === componentName,
    );

    if (!item || !item.files?.[0]?.path) {
      return `// Component "${componentName}" not found in registry`;
    }

    return extractCodeFromFilePath(item.files[0].path);
  } catch (error) {
    console.error(`Error loading registry for "${componentName}"`, error);
    return `// Error loading registry for "${componentName}"`;
  }
});

/**
 * Get the file path for a registry component.
 *
 * @param componentName - The component name from registry.json
 * @returns The relative file path from packages/ui/, or null if not found
 */
export const getComponentFilePath = cache(
  (componentName: string): string | null => {
    const registryPath = path.join(getPackageUiPath(), "registry.json");

    try {
      const registryContent = fs.readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(registryContent);
      const item = registry.items.find(
        (i: { name: string }) => i.name === componentName,
      );

      return item?.files?.[0]?.path || null;
    } catch {
      return null;
    }
  },
);
