import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "tsup";

/**
 * Loads dependencies from package.json
 * @returns {string[]} Array of dependency names
 */
function loadDependencies() {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf-8"),
    );
    return [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ];
  } catch (_error) {
    return [];
  }
}

/**
 * @typedef {Object} CreateTsupConfigOptions
 * @property {boolean} [isProduction] - Indicates if it's a production build
 * @property {boolean} [enableExperimentalDts] - Enables experimental type definitions
 * @property {Object[]} [additionalPlugins] - Additional esbuild plugins
 * @property {Object} [define] - Additional define options
 * @property {() => Promise<void>} [onSuccess] - Callback function on successful build
 */

/**
 * Creates Tsup configuration
 * @param {string[]} [entry=['src/index.ts']] - Entry points for bundling
 * @param {CreateTsupConfigOptions} [options={}] - Configuration options
 * @returns {Object|Object[]|function} Tsup configuration
 */
export function createTsupConfig(entry = ["src/index.ts"], options = {}) {
  const isProduction =
    options.isProduction ?? process.env.NODE_ENV === "production";
  const enableExperimentalDts = options.enableExperimentalDts ?? true;

  return defineConfig({
    entry,
    format: ["cjs", "esm"],
    target: "esnext",
    platform: "node",
    treeshake: true,
    splitting: true,
    clean: true,
    sourcemap: !isProduction,
    tsconfig: resolve(process.cwd(), "tsconfig.json"),
    outDir: "dist",
    experimentalDts: enableExperimentalDts
      ? {
          entry,
          compilerOptions: {
            composite: true,
            incremental: true,
            tsBuildInfoFile: "dist/.tsbuildinfo",
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
          },
        }
      : undefined,
    shims: true,
    skipNodeModulesBundle: true,
    external: loadDependencies(),

    /**
     * Configures esbuild options
     * @param {Object} esbuildOptions - Esbuild configuration options
     * @param {Object} _context - Build context
     */
    esbuildOptions(esbuildOptions, _context) {
      Object.assign(esbuildOptions, {
        keepNames: !isProduction,
        jsx: "transform",
        banner: {
          js: '"use strict";',
        },
        define: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
          "Symbol.metadata": "Symbol.metadata",
          ...options.define,
        },
      });
    },

    esbuildPlugins: [...(options.additionalPlugins || [])],

    /**
     * Runs on successful build
     * @returns {Promise<void>}
     */
    async onSuccess() {
      if (options.onSuccess) {
        await options.onSuccess();
      }
    },

    /**
     * Determines output file extension based on format
     * @param {Object} param - Format parameter
     * @param {string} param.format - Build format
     * @returns {Object} Output extension configuration
     */
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".mjs" : ".cjs",
      };
    },
    ...options,
  });
}
