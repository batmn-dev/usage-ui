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
 * Get the path to the apps/www directory.
 */
function getWwwPath(): string {
  // From apps/www/src/lib/ -> apps/www (2 levels up)
  return path.join(__dirname, "..", "..");
}

/**
 * Registry item type for type safety.
 */
interface RegistryItem {
  name: string;
  files?: Array<{ path: string; type?: string }>;
}

/**
 * Look up a component in a registry file.
 *
 * @param registryPath - Absolute path to the registry.json file
 * @param componentName - The component name to find
 * @returns The registry item if found, null otherwise
 */
function findInRegistry(
  registryPath: string,
  componentName: string,
): RegistryItem | null {
  try {
    const registryContent = fs.readFileSync(registryPath, "utf-8");
    const registry = JSON.parse(registryContent);
    return (
      registry.items.find((i: RegistryItem) => i.name === componentName) || null
    );
  } catch {
    return null;
  }
}

/**
 * Extract source code from a file path at build time.
 * Uses React cache for deduplication during SSG.
 *
 * @param filePath - Relative path from a base directory
 * @param basePath - The base directory to resolve from
 * @returns The file contents as a string
 */
export const extractCodeFromFilePath = cache(
  (filePath: string, basePath?: string): string => {
    const absolutePath = path.join(basePath || getPackageUiPath(), filePath);

    try {
      return fs.readFileSync(absolutePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read file: ${absolutePath}`, error);
      return `// Error: Could not load source code for ${filePath}`;
    }
  },
);

/**
 * Extract source code for a registry component by name.
 * Looks up the path in registry.json files and reads the file.
 *
 * Checks packages/ui/registry.json first (distributable components),
 * then falls back to apps/www/src/registry.json (legacy/demo components).
 *
 * @param componentName - The component name from registry.json
 * @returns The source code string
 */
export const getComponentSource = cache((componentName: string): string => {
  const packageUiPath = getPackageUiPath();
  const wwwPath = getWwwPath();

  // First, check packages/ui/registry.json (distributable components)
  const packageRegistryPath = path.join(packageUiPath, "registry.json");
  const packageItem = findInRegistry(packageRegistryPath, componentName);

  if (packageItem?.files?.[0]?.path) {
    return extractCodeFromFilePath(packageItem.files[0].path, packageUiPath);
  }

  // Fall back to apps/www/src/registry.json (legacy/demo components)
  const wwwRegistryPath = path.join(wwwPath, "src", "registry.json");
  const wwwItem = findInRegistry(wwwRegistryPath, componentName);

  if (wwwItem?.files?.[0]?.path) {
    return extractCodeFromFilePath(wwwItem.files[0].path, wwwPath);
  }

  return `// Component "${componentName}" not found in registry`;
});

/**
 * Get the file path for a registry component.
 *
 * @param componentName - The component name from registry.json
 * @returns The relative file path, or null if not found
 */
export const getComponentFilePath = cache(
  (componentName: string): string | null => {
    const packageUiPath = getPackageUiPath();
    const wwwPath = getWwwPath();

    // First, check packages/ui/registry.json
    const packageRegistryPath = path.join(packageUiPath, "registry.json");
    const packageItem = findInRegistry(packageRegistryPath, componentName);

    if (packageItem?.files?.[0]?.path) {
      return packageItem.files[0].path;
    }

    // Fall back to apps/www/src/registry.json
    const wwwRegistryPath = path.join(wwwPath, "src", "registry.json");
    const wwwItem = findInRegistry(wwwRegistryPath, componentName);

    return wwwItem?.files?.[0]?.path || null;
  },
);
