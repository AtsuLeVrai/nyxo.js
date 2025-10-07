import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface NativeAddonLoadOptions {
  name: string;

  baseDir?: string;

  searchPaths?: string[];

  requiredExports?: string[];

  validate?: (addon: unknown) => void;

  enableCache?: boolean;
}

export interface NativeAddonError extends Error {
  addonName: string;

  platform: string;

  nodeVersion: string;

  attemptedPaths: string[];

  pathErrors: Array<{ path: string; error: string }>;
}

const addonCache = new Map<string, unknown>();

function generateSearchPaths(baseDir: string, addonName: string): string[] {
  return [
    join(baseDir, "build", "Release", `${addonName}.node`),
    join(baseDir, "build", "Debug", `${addonName}.node`),

    join(baseDir, "prebuilds", `${process.platform}-${process.arch}`, `${addonName}.node`),

    join(baseDir, "dist", "native", `${addonName}.node`),

    join(baseDir, `${addonName}.node`),
  ];
}

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

export function loadNativeAddon<T = unknown>(options: NativeAddonLoadOptions): T {
  const {
    name,
    baseDir = join(__dirname, "..", ".."),
    searchPaths,
    requiredExports = [],
    validate,
    enableCache = true,
  } = options;

  const cacheKey = `${name}:${baseDir}`;
  if (enableCache && addonCache.has(cacheKey)) {
    return addonCache.get(cacheKey) as T;
  }

  const paths = searchPaths ?? generateSearchPaths(baseDir, name);
  const pathErrors: Array<{ path: string; error: string }> = [];

  for (const path of paths) {
    try {
      if (!existsSync(path)) {
        pathErrors.push({
          path,
          error: "File does not exist",
        });
        continue;
      }

      const addon = require(path) as T;

      if (requiredExports.length > 0) {
        validateRequiredExports(addon, requiredExports, name);
      }

      if (validate) {
        validate(addon);
      }

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

  throw createNativeAddonError(name, paths, pathErrors);
}

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

export function clearAddonCache(addonName?: string): void {
  if (addonName) {
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
    addonCache.clear();
  }
}

export function canLoadNativeAddon(options: NativeAddonLoadOptions): boolean {
  try {
    loadNativeAddon({ ...options, enableCache: false });
    return true;
  } catch {
    return false;
  }
}

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

export function isNativeAddonError(error: unknown): error is NativeAddonError {
  return (
    error instanceof Error &&
    error.name === "NativeAddonError" &&
    "addonName" in error &&
    "platform" in error &&
    "attemptedPaths" in error
  );
}
