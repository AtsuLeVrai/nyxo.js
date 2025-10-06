import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Node.js does not support __dirname and __filename in ES modules, so we recreate them here
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration options for native addon loading.
 */
export interface NativeAddonLoadOptions {
  /**
   * Name of the addon (used for error messages and cache key).
   * Example: 'zlib', 'zstd'
   */
  name: string;

  /**
   * Base directory to search for the addon.
   * Defaults to parent directory of current module.
   */
  baseDir?: string;

  /**
   * Custom search paths for the addon.
   * Paths are tried in order until one succeeds.
   */
  searchPaths?: string[];

  /**
   * Required exports that must exist on the loaded addon.
   * Example: ['ZlibStream', 'ZLIB_VERSION']
   */
  requiredExports?: string[];

  /**
   * Optional validation function for additional checks.
   * Should throw an error if validation fails.
   */
  validate?: (addon: unknown) => void;

  /**
   * Enable caching of loaded addons.
   * Default: true
   */
  enableCache?: boolean;
}

/**
 * Detailed error information for addon loading failures.
 */
export interface NativeAddonError extends Error {
  /** Addon name that failed to load */
  addonName: string;
  /** Platform information */
  platform: string;
  /** Node.js version */
  nodeVersion: string;
  /** All paths that were attempted */
  attemptedPaths: string[];
  /** Individual error for each path */
  pathErrors: Array<{ path: string; error: string }>;
}

/**
 * @private
 * Cache for loaded native addons to avoid repeated loading
 */
const addonCache = new Map<string, unknown>();

/**
 * @private
 * Generates standard search paths for native addons
 */
function generateSearchPaths(baseDir: string, addonName: string): string[] {
  return [
    // Standard node-gyp build output
    join(baseDir, "build", "Release", `${addonName}.node`),
    join(baseDir, "build", "Debug", `${addonName}.node`),

    // Prebuild locations
    join(baseDir, "prebuilds", `${process.platform}-${process.arch}`, `${addonName}.node`),

    // Alternative build directory
    join(baseDir, "dist", "native", `${addonName}.node`),

    // Root level (for simple builds)
    join(baseDir, `${addonName}.node`),
  ];
}

/**
 * @private
 * Validates that required exports exist on the addon
 */
function validateRequiredExports(
  addon: unknown,
  requiredExports: string[],
  addonName: string,
): void {
  if (!addon || typeof addon !== "object") {
    throw new Error(`Addon ${addonName} is not a valid object`);
  }

  const missingExports = requiredExports.filter((exportName) => !(exportName in addon));

  if (missingExports.length > 0) {
    const available = Object.keys(addon).join(", ") || "(none)";
    throw new Error(
      `Addon ${addonName} is missing required exports: ${missingExports.join(", ")}. ` +
        `Available exports: ${available}`,
    );
  }
}

/**
 * Loads native Node.js addon with comprehensive error handling and validation.
 * Automatically searches common build locations and validates required exports.
 *
 * @typeParam T - Type of the native addon interface
 * @param options - Configuration options for loading
 * @returns Loaded and validated native addon
 * @throws {NativeAddonError} When addon cannot be loaded or validation fails
 */
export function loadNativeAddon<T = unknown>(options: NativeAddonLoadOptions): T {
  const {
    name,
    baseDir = join(__dirname, "..", ".."),
    searchPaths,
    requiredExports = [],
    validate,
    enableCache = true,
  } = options;

  // Check cache first
  const cacheKey = `${name}:${baseDir}`;
  if (enableCache && addonCache.has(cacheKey)) {
    return addonCache.get(cacheKey) as T;
  }

  // Determine paths to try
  const paths = searchPaths ?? generateSearchPaths(baseDir, name);
  const pathErrors: Array<{ path: string; error: string }> = [];

  // Try each path
  for (const path of paths) {
    try {
      // Check if file exists before attempting require
      if (!existsSync(path)) {
        pathErrors.push({
          path,
          error: "File does not exist",
        });
        continue;
      }

      // Attempt to load the addon
      const addon = require(path) as T;

      // Validate required exports
      if (requiredExports.length > 0) {
        validateRequiredExports(addon, requiredExports, name);
      }

      // Run custom validation if provided
      if (validate) {
        validate(addon);
      }

      // Cache the loaded addon
      if (enableCache) {
        addonCache.set(cacheKey, addon);
      }

      return addon;
    } catch (error) {
      pathErrors.push({
        path,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // All attempts failed, throw comprehensive error
  throw createNativeAddonError(name, paths, pathErrors);
}

/**
 * @private
 * Creates detailed error object for addon loading failures
 */
function createNativeAddonError(
  name: string,
  attemptedPaths: string[],
  pathErrors: Array<{ path: string; error: string }>,
): NativeAddonError {
  const platform = `${process.platform}-${process.arch}`;
  const nodeVersion = process.version;

  const errorDetails = pathErrors
    .map(({ path, error }) => `  - ${path}\n    → ${error}`)
    .join("\n");

  const message = [
    `Failed to load native addon "${name}"`,
    ``,
    `Platform: ${platform}`,
    `Node.js: ${nodeVersion}`,
    ``,
    `Attempted paths:`,
    errorDetails,
    ``,
    `Possible solutions:`,
    `  1. Rebuild the addon: npm run build:native`,
    `  2. Install prebuilt binaries: npm install`,
    `  3. Check that the addon is built for your platform`,
    `  4. Verify Node.js version compatibility`,
  ].join("\n");

  const error = new Error(message) as NativeAddonError;
  error.name = "NativeAddonError";
  error.addonName = name;
  error.platform = platform;
  error.nodeVersion = nodeVersion;
  error.attemptedPaths = attemptedPaths;
  error.pathErrors = pathErrors;

  return error;
}

/**
 * Clears the addon cache for a specific addon or all addons.
 * Useful for testing or when addons are rebuilt during development.
 *
 * @param addonName - Optional name of addon to clear. If omitted, clears all.
 */
export function clearAddonCache(addonName?: string): void {
  if (addonName) {
    // Clear all entries for this addon name
    const keysToDelete: string[] = [];
    for (const key of addonCache.keys()) {
      if (key.startsWith(`${addonName}:`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      addonCache.delete(key);
    }
  } else {
    // Clear all cached addons
    addonCache.clear();
  }
}

/**
 * Checks if a native addon can be loaded without actually loading it.
 * Useful for feature detection or graceful degradation.
 *
 * @param options - Configuration options (same as loadNativeAddon)
 * @returns True if addon can be loaded, false otherwise
 */
export function canLoadNativeAddon(options: NativeAddonLoadOptions): boolean {
  try {
    loadNativeAddon({ ...options, enableCache: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves information about available addon paths without loading.
 * Useful for diagnostics and debugging.
 *
 * @param name - Name of the addon
 * @param baseDir - Base directory to search (optional)
 * @returns Array of path information objects
 */
export function getAddonPathInfo(
  name: string,
  baseDir?: string,
): Array<{ path: string; exists: boolean }> {
  const base = baseDir ?? join(__dirname, "..");
  const paths = generateSearchPaths(base, name);

  return paths.map((path) => ({
    path,
    exists: existsSync(path),
  }));
}

/**
 * Type guard for NativeAddonError.
 *
 * @param error - Error to check
 * @returns True if error is NativeAddonError
 */
export function isNativeAddonError(error: unknown): error is NativeAddonError {
  return (
    error instanceof Error &&
    error.name === "NativeAddonError" &&
    "addonName" in error &&
    "platform" in error &&
    "attemptedPaths" in error
  );
}
