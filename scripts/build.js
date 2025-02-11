import { readFileSync } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import terser from "@rollup/plugin-terser";
import { program } from "commander";
import { createConsola } from "consola";
import { rollup } from "rollup";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";
import ts from "typescript";

/**
 * @typedef {Object} BuildPaths
 * @property {string} root - Project root directory
 * @property {string} src - Source directory
 * @property {string} dist - Distribution directory
 * @property {string} temp - Temporary directory
 * @property {string} tsconfig - TypeScript config path
 * @property {string} package - Package.json path
 */

/**
 * @typedef {Object} BuildOptions
 * @property {boolean} clean - Whether to clean directories before building
 * @property {boolean} production - Whether to build for production
 */

/**
 * Regular expression to match Node.js built-in modules
 * @type {RegExp}
 */
const NODE_MODULES_REGEX = /^node:/;

/**
 * Consola logger instance
 * @type {import("consola").ConsolaInstance}
 */
const logger = createConsola({
  level: 20,
  formatOptions: {
    date: true,
  },
});

/**
 * Build paths configuration
 * @type {BuildPaths}
 */
const paths = {
  root: process.cwd(),
  src: resolve(process.cwd(), "src"),
  dist: resolve(process.cwd(), "dist"),
  temp: resolve(process.cwd(), "temp"),
  tsconfig: resolve(process.cwd(), "tsconfig.json"),
  package: resolve(process.cwd(), "package.json"),
};

// CLI Configuration
program.option("-p, --production", "Build for production").parse(process.argv);

/** @type {BuildOptions} */
const options = program.opts();

/**
 * Get external dependencies from package.json
 * @returns {string[]} Array of external dependencies
 */
function getExternals() {
  logger.debug("Analyzing package dependencies...");

  const pkg = JSON.parse(readFileSync(paths.package, "utf-8"));
  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    NODE_MODULES_REGEX,
  ];

  logger.debug(`Found ${externals.length - 1} external dependencies`);
  return externals;
}

/**
 * SWC configuration for Rollup
 * @type {import('rollup-plugin-swc3').RollupSwcOptions}
 */
const swcConfig = defineRollupSwcOption({
  jsc: {
    target: "esnext",
    parser: {
      syntax: "typescript",
      tsx: false,
      decorators: true,
      dynamicImport: true,
      importAssertions: true,
    },
    externalHelpers: true,
    keepClassNames: true,
    transform: {
      legacyDecorator: false,
      decoratorMetadata: true,
      useDefineForClassFields: true,
    },
  },
  module: {
    type: "es6",
    strict: true,
    lazy: true,
    importInterop: "swc",
  },
  sourceMaps: !options.production,
  exclude: ["node_modules", "dist", ".*.js$", ".*\\.d.ts$"],
  minify: options.production,
});

/**
 * Terser configuration for production builds
 * @type {import('@rollup/plugin-terser').Options}
 */
const terserConfig = {
  format: {
    comments: false,
    ecma: 2020,
  },
  compress: {
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    unsafe_math: true,
    unsafe_methods: true,
    drop_console: options.production,
    drop_debugger: options.production,
  },
  module: true,
  toplevel: true,
};

/**
 * Rollup build configuration
 * @type {import('rollup').RollupOptions}
 */
const rollupConfig = {
  input: resolve(paths.src, "index.ts"),
  external: getExternals(),
  output: [
    {
      file: resolve(paths.dist, "index.mjs"),
      format: "esm",
      sourcemap: !options.production,
      plugins: options.production ? [terser(terserConfig)] : [],
    },
    {
      file: resolve(paths.dist, "index.cjs"),
      format: "cjs",
      sourcemap: !options.production,
      interop: "auto",
      esModule: true,
      plugins: options.production ? [terser(terserConfig)] : [],
    },
  ],
  plugins: [swc(swcConfig)],
};

/**
 * API Extractor configuration
 * @type {import('@microsoft/api-extractor').IConfigFile}
 */
/**
 * API Extractor configuration
 * @type {import('@microsoft/api-extractor').IConfigFile}
 */
const apiExtractorConfig = {
  projectFolder: paths.root,
  mainEntryPointFilePath: resolve(paths.temp, "index.d.ts"),
  bundledPackages: [],
  compiler: {
    tsconfigFilePath: paths.tsconfig,
    overrideTsconfig: {
      compilerOptions: {
        types: ["node"],
        skipLibCheck: true,
        preserveSymlinks: true,
        isolatedModules: true,
      },
    },
  },
  apiReport: {
    enabled: true,
    reportFileName: "api-report.md",
    reportFolder: "<projectFolder>/docs/",
    reportTempFolder: "<projectFolder>/temp/",
    includeForgottenExports: true,
  },
  docModel: {
    enabled: true,
    apiJsonFilePath: "<projectFolder>/docs/api.json",
    includeForgottenExports: true,
    projectFolderUrl: "https://github.com/AtsuLeVrai/nyx.js/tree/main",
  },
  dtsRollup: {
    enabled: true,
    untrimmedFilePath: resolve(paths.dist, "index.d.ts"),
    omitTrimmingComments: false,
  },
  tsdocMetadata: { enabled: false },
  messages: {
    compilerMessageReporting: { default: { logLevel: "warning" } },
    extractorMessageReporting: {
      default: { logLevel: "warning" },
      "ae-missing-release-tag": { logLevel: "none" },
    },
    tsdocMessageReporting: { default: { logLevel: "warning" } },
  },
};

/**
 * Clean build directories
 * @returns {Promise<void>}
 */
async function clean() {
  try {
    logger.info("Cleaning build directories...");

    await Promise.all([
      rm(paths.dist, { recursive: true, force: true }),
      rm(paths.temp, { recursive: true, force: true }),
    ]);

    logger.debug("Removed old build files");

    await Promise.all([
      mkdir(paths.dist, { recursive: true }),
      mkdir(paths.temp, { recursive: true }),
    ]);

    logger.success("Created fresh build directories");
  } catch (error) {
    logger.error("Clean operation failed", error);
    throw new Error(`Clean failed: ${error.message}`);
  }
}

/**
 * Compile TypeScript types for development
 * @returns {void}
 */
function compileDevTypes() {
  try {
    logger.info(
      "Starting TypeScript declaration compilation for development...",
    );

    const configPath = ts.findConfigFile(
      paths.root,
      ts.sys.fileExists,
      "tsconfig.json",
    );
    if (!configPath) {
      throw new Error("Could not find tsconfig.json");
    }

    const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
    if (error) {
      throw new Error(`Error reading tsconfig.json: ${error.messageText}`);
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      paths.root,
    );
    const compilerOptions = {
      ...parsedConfig.options,
      declaration: true,
      emitDeclarationOnly: true, // Only emit .d.ts files
      declarationDir: paths.dist,
      outDir: paths.dist,
      noEmit: false,
      sourceMap: true,
    };

    logger.debug("Creating TypeScript program...");
    const program = ts.createProgram(parsedConfig.fileNames, compilerOptions);
    const emitResult = program.emit();

    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);
    for (const diagnostic of allDiagnostics) {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n",
        );
        logger.warn(
          `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
        );
      } else {
        logger.warn(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        );
      }
    }

    if (emitResult.emitSkipped) {
      throw new Error("TypeScript declaration compilation failed");
    }

    logger.success("Development TypeScript declarations completed");
  } catch (error) {
    logger.error(
      "Development TypeScript declaration compilation failed",
      error,
    );
    throw new Error(`Types compilation failed: ${error.message}`);
  }
}

/**
 * Compile TypeScript types for production using API Extractor
 * @returns {Promise<void>}
 */
async function compileProdTypes() {
  try {
    logger.info("Generating production type declarations...");

    // First compile TS declarations to temp directory
    const configPath = ts.findConfigFile(
      paths.root,
      ts.sys.fileExists,
      "tsconfig.json",
    );
    if (!configPath) {
      throw new Error("Could not find tsconfig.json");
    }

    const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
    if (error) {
      throw new Error(`Error reading tsconfig.json: ${error.messageText}`);
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      paths.root,
    );
    const compilerOptions = {
      ...parsedConfig.options,
      declaration: true,
      emitDeclarationOnly: true,
      declarationDir: paths.temp,
      outDir: paths.temp,
      noEmit: false,
    };

    logger.debug("Compiling TypeScript declarations...");
    const program = ts.createProgram(parsedConfig.fileNames, compilerOptions);
    const emitResult = program.emit();

    if (emitResult.emitSkipped) {
      throw new Error("TypeScript declaration compilation failed");
    }

    // Then use API Extractor to bundle types
    logger.debug("Bundling declarations with API Extractor...");
    const extractorConfig = ExtractorConfig.prepare({
      configObject: apiExtractorConfig,
      configObjectFullPath: paths.root,
      packageJsonFullPath: resolve(paths.root, "package.json"),
    });

    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: false,
      showDiagnostics: false,
      typescriptCompilerFolder: resolve(
        paths.root,
        "node_modules",
        "typescript",
      ),
    });

    if (!extractorResult.succeeded) {
      throw new Error(
        `API Extractor failed with ${extractorResult.errorCount} errors`,
      );
    }

    // Clean up temp directory
    await rm(paths.temp, { recursive: true, force: true });

    logger.success("Production type declarations completed");
  } catch (error) {
    logger.error("Production type declaration generation failed", error);
    throw new Error(`Type declaration generation failed: ${error.message}`);
  }
}

/**
 * Build bundles using Rollup
 * @returns {Promise<void>}
 */
async function buildBundles() {
  try {
    logger.info("Creating bundles with Rollup...");

    logger.debug("Building bundle...");
    const bundle = await rollup(rollupConfig);

    logger.debug("Writing output files...");
    await Promise.all(
      rollupConfig.output.map(async (output) => {
        await bundle.write(output);
        logger.debug(`Generated ${output.format.toUpperCase()} bundle`, {
          file: output.file,
        });
      }),
    );

    await bundle.close();
    logger.success("Bundle creation completed");
  } catch (error) {
    logger.error("Bundle creation failed", error);
    throw new Error(`Bundle creation failed: ${error.message}`);
  }
}

/**
 * Check bundle size for unusually large declaration files
 * @returns {Promise<void>}
 */
async function checkBundleSize() {
  const dtsPath = resolve(paths.dist, "index.d.ts");
  const stats = await stat(dtsPath);
  const sizeInMb = stats.size / (1024 * 1024);

  if (sizeInMb > 1) {
    logger.warn(
      `Declaration file size (${sizeInMb.toFixed(2)}MB) is unusually large!`,
    );
  }
}

/**
 * Main build function
 * @returns {Promise<void>}
 */
async function build() {
  const startTime = process.hrtime();

  try {
    logger.info(
      `Starting build${options.production ? " (production)" : ""}...`,
    );

    // Clean directories first
    await clean();

    // Build bundles using Rollup
    await buildBundles();

    // Handle types based on environment
    if (options.production) {
      await compileProdTypes();
    } else {
      await compileDevTypes();
    }

    await checkBundleSize();

    const [seconds] = process.hrtime(startTime);
    logger.success(
      `Build completed for ${options.production ? "production" : "development"} mode in ${seconds}s`,
    );
  } catch (error) {
    const [seconds] = process.hrtime(startTime);
    logger.error(`Build failed after ${seconds}s:`, error);
    process.exit(1);
  }
}

build().catch((error) => {
  logger.error("Build failed:", error);
  process.exit(1);
});
