import { readFileSync } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import chalk from "chalk";
import figures from "figures";
import prettyBytes from "pretty-bytes";
import { rolldown } from "rolldown";
import ts from "typescript";

/**
 * @typedef {Object} PackageJson
 * @property {string} name
 * @property {string} version
 * @property {Record<string, string>} [dependencies]
 * @property {Record<string, string>} [peerDependencies]
 */

/**
 * @typedef {Object} BuildPaths
 * @property {string} root
 * @property {string} src
 * @property {string} dist
 * @property {string} temp
 * @property {string} tsconfig
 * @property {string} package
 */

/**
 * @typedef {Object} LoggingTheme
 * @property {Function} primary
 * @property {Function} secondary
 * @property {Function} success
 * @property {Function} error
 * @property {Function} warning
 * @property {Function} info
 * @property {Function} highlight
 * @property {Function} dim
 * @property {Function} white
 * @property {Function} time
 */

/**
 * @typedef {Object} LoggingSymbols
 * @property {string} start
 * @property {string} success
 * @property {string} error
 * @property {string} warning
 * @property {string} info
 * @property {string} debug
 * @property {string} pending
 * @property {string} complete
 * @property {string} dot
 * @property {string} step
 */

/** @type {boolean} */
const isProduction = process.NODE_ENV === "production";

// Initialize paths
const root = process.cwd();

/**
 * Creates path objects for the build process
 * @type {BuildPaths}
 */
const paths = {
  root,
  src: resolve(root, "src"),
  dist: resolve(root, "dist"),
  temp: resolve(root, "temp"),
  tsconfig: resolve(root, "tsconfig.json"),
  package: resolve(root, "package.json"),
};

// Color theme for console logs
/** @type {LoggingTheme} */
const theme = {
  primary: chalk.rgb(147, 197, 253),
  secondary: chalk.rgb(167, 139, 250),
  success: chalk.rgb(134, 239, 172),
  error: chalk.rgb(252, 165, 165),
  warning: chalk.rgb(253, 230, 138),
  info: chalk.rgb(147, 197, 253),
  highlight: chalk.rgb(196, 181, 253),
  dim: chalk.rgb(209, 213, 219),
  white: chalk.rgb(255, 255, 255),
  time: chalk.rgb(147, 197, 253),
};

// Symbols for console logs
/** @type {LoggingSymbols} */
const symbols = {
  start: figures.pointer,
  success: figures.tick,
  error: figures.cross,
  warning: figures.warning,
  info: figures.info,
  debug: figures.bullet,
  pending: figures.circleDotted,
  complete: figures.circleFilled,
  dot: figures.dot,
  step: figures.pointerSmall,
};

/**
 * Creates an enhanced logger with timing capabilities
 * @returns {Object} Logger object
 */
function createLogger() {
  const startTime = process.hrtime();
  /** @type {Map<string, number>} */
  const steps = new Map();

  return {
    startTime,
    steps,

    /**
     * Gets a formatted timestamp for logs
     * @returns {string} Formatted timestamp
     */
    getTimestamp() {
      const now = new Date();
      return theme.dim(`[${now.toLocaleTimeString()}]`);
    },

    /**
     * Formats a duration from hrtime
     * @param {[number, number]} startTime - The hrtime to measure from
     * @returns {string} Formatted duration string
     */
    formatDuration(startTime) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      return `${(seconds + nanoseconds / 1e9).toFixed(2)}s`;
    },

    /**
     * Start timing a build step
     * @param {string} step - The name of the step
     */
    startStep(step) {
      const startTime = process.hrtime();
      this.steps.set(step, startTime[0] * 1e9 + startTime[1]);
      console.log(
        `${this.getTimestamp()} ${theme.info(symbols.start)} ${theme.primary(step)}`,
      );
    },

    /**
     * End timing a build step and log the duration
     * @param {string} step - The name of the step
     */
    endStep(step) {
      const startTimeNs = this.steps.get(step);
      if (startTimeNs) {
        const duration =
          (process.hrtime.bigint() - BigInt(startTimeNs)) / BigInt(1e9);
        console.log(
          `${this.getTimestamp()} ${theme.success(symbols.success)} ${theme.success(
            step,
          )} ${theme.dim(`(${duration.toString()}s)`)}`,
        );
      }
    },

    /**
     * Log an informational message
     * @param {string} message - The message to log
     */
    info(message) {
      console.log(
        `${this.getTimestamp()} ${theme.info(symbols.info)} ${message}`,
      );
    },

    /**
     * Log a success message
     * @param {string} message - The message to log
     */
    success(message) {
      console.log(
        `${this.getTimestamp()} ${theme.success(symbols.success)} ${theme.success(message)}`,
      );
    },

    /**
     * Log an error message
     * @param {string} message - The message to log
     * @param {Error} [error] - Optional error object
     */
    error(message, error) {
      console.error(
        `${this.getTimestamp()} ${theme.error(symbols.error)} ${theme.error(message)}`,
      );
      if (error?.stack) {
        console.error(theme.dim(error.stack));
      }
    },

    /**
     * Log a warning message
     * @param {string} message - The message to log
     */
    warning(message) {
      console.log(
        `${this.getTimestamp()} ${theme.warning(symbols.warning)} ${theme.warning(message)}`,
      );
    },

    /**
     * Log a debug message (only when DEBUG=true)
     * @param {string} message - The message to log
     * @param {any} [data] - Optional data to log
     */
    debug(message, data) {
      console.log(
        `${this.getTimestamp()} ${theme.secondary(symbols.debug)} ${theme.secondary(message)}`,
      );
      if (data) {
        console.log(
          typeof data === "string" ? data : JSON.stringify(data, null, 2),
        );
      }
    },

    /**
     * Show a summary of the build
     */
    showSummary() {
      const totalDuration = this.formatDuration(this.startTime);
      console.log(
        `${this.getTimestamp()} ${theme.success("✨ Build completed")} ${theme.white("in")} ${theme.time(totalDuration)}`,
      );
      console.log(
        `${this.getTimestamp()} ${theme.info("📦")} ${this.steps.size} steps completed successfully`,
      );
    },
  };
}

// Initialize logger
const logger = createLogger();

/**
 * Reads and parses package.json
 * @returns {PackageJson} Parsed package.json content
 */
function readPackageJson() {
  try {
    return JSON.parse(readFileSync(paths.package, "utf-8"));
  } catch (error) {
    logger.error(
      "Failed to read package.json",
      error instanceof Error ? error : new Error(String(error)),
    );
    return { name: "", version: "" };
  }
}

/**
 * Get Rolldown configuration for the build
 * @returns {import("rolldown").InputOptions} Rolldown configuration
 */
function getRolldownConfig() {
  const pkg = readPackageJson();

  // Define external modules (will not be bundled)
  /** @type {(string|RegExp)[]} */
  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    /^node:/,
  ];

  logger.debug("Package dependencies analysis:", {
    dependencies: pkg.dependencies || {},
    peerDependencies: pkg.peerDependencies || {},
  });

  logger.debug("Configured externals:", externals);

  // Define outputs
  /** @type {Object[]} */
  const outputs = [
    {
      // ESM format (ES Modules)
      file: resolve(paths.dist, "index.mjs"),
      format: "esm",
      sourcemap: !isProduction,
      esModule: true,
      exports: "named",
    },
    {
      // CommonJS format
      file: resolve(paths.dist, "index.cjs"),
      format: "cjs",
      sourcemap: !isProduction,
      esModule: true,
      exports: "named",
    },
  ];

  /**
   * Complete Rolldown configuration
   * @type {import("rolldown").InputOptions}
   */
  const config = {
    input: resolve(paths.src, "index.ts"),
    external: externals,
    output: outputs,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
    onLog: (level, log, pos) => {
      if (level === "error") {
        logger.error(
          `${log}${pos ? ` at ${pos.file}:${pos.line}:${pos.column}` : ""}`,
        );
      } else if (level === "warn") {
        logger.warning(log);
      } else {
        logger.debug(`Rolldown ${level}: ${log}`);
      }
    },
  };

  logger.debug("Rolldown configuration:", config);
  return config;
}

/**
 * Get API Extractor configuration
 * @returns {Object} API Extractor configuration
 */
const apiExtractorConfig = {
  projectFolder: paths.root,
  mainEntryPointFilePath: resolve(paths.temp, "index.d.ts"),
  compiler: {
    tsconfigFilePath: paths.tsconfig,
    overrideTsconfig: {
      compilerOptions: {
        types: ["node"],
        skipLibCheck: true,
        preserveSymlinks: true,
        isolatedModules: true,
        strict: true,
        exactOptionalPropertyTypes: true,
        noUncheckedIndexedAccess: true,
      },
    },
  },
  // API report for public packages
  apiReport: { enabled: false },
  // Documentation model generation (optional)
  docModel: { enabled: false },
  // TypeScript declaration rollup (combine all .d.ts files)
  dtsRollup: {
    enabled: true,
    untrimmedFilePath: resolve(paths.dist, "index.d.ts"),
    omitTrimmingComments: false,
  },
  // TSDoc metadata generation for better IDE integration
  tsdocMetadata: {
    enabled: isProduction,
    tsdocMetadataFilePath: resolve(paths.dist, "tsdoc-metadata.json"),
  },
  // Message reporting configuration with better error handling
  messages: {
    compilerMessageReporting: {
      default: { logLevel: "warning" },
      TS2589: { logLevel: "none" },
      TS2344: { logLevel: "none" },
      TS1375: { logLevel: "none" }, // 'await' expressions are only allowed within async functions
      TS2306: { logLevel: "none" }, // File is not a module
    },
    extractorMessageReporting: {
      default: { logLevel: "warning" },
      "ae-missing-release-tag": { logLevel: "none" },
      "ae-unresolved-link": { logLevel: "none" },
      "ae-internal-missing-underscore": { logLevel: "none" },
    },
    tsdocMessageReporting: {
      default: { logLevel: "warning" },
      "tsdoc-undefined-tag": { logLevel: "none" },
      "tsdoc-escape-right-brace": { logLevel: "none" },
      "tsdoc-malformed-inline-tag": { logLevel: "none" },
    },
  },
};

/**
 * Clean build directories
 * @returns {Promise<void>}
 */
async function clean() {
  logger.startStep("Cleaning directories");
  try {
    // Remove dist and temp directories
    await Promise.all([
      rm(paths.dist, { recursive: true, force: true }),
      rm(paths.temp, { recursive: true, force: true }),
    ]);

    // Create dist and temp directories
    await Promise.all([
      mkdir(paths.dist, { recursive: true }),
      mkdir(paths.temp, { recursive: true }),
    ]);

    logger.endStep("Cleaning directories");
  } catch (error) {
    throw new Error(
      `Cleaning failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Generate TypeScript declaration files
 * @returns {Promise<void>}
 */
async function compileTypes() {
  const buildMode = isProduction ? "production" : "development";
  logger.startStep(`Generating types (${buildMode})`);

  try {
    // Find TypeScript configuration file
    const configPath = ts.findConfigFile(
      paths.root,
      ts.sys.fileExists,
      "tsconfig.json",
    );

    if (!configPath) {
      throw new Error("Could not find tsconfig.json");
    }

    // Read and parse configuration file
    const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);

    if (error) {
      throw new Error(`Error reading tsconfig.json: ${error.messageText}`);
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      paths.root,
    );

    logger.debug("TypeScript compiler options:", parsedConfig.options);

    // Create TypeScript program with specific options for type generation
    const program = ts.createProgram(parsedConfig.fileNames, {
      ...parsedConfig.options,
      declaration: true,
      emitDeclarationOnly: true,
      declarationDir: isProduction ? paths.temp : paths.dist,
      outDir: isProduction ? paths.temp : paths.dist,
      noEmit: false,
      sourceMap: !isProduction,
    });

    logger.debug(
      "TypeScript program files count:",
      parsedConfig.fileNames.length,
    );

    // Emit declaration files
    const emitResult = program.emit();

    // Get diagnostics
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    // Report critical errors
    const criticalDiagnostics = diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Error,
    );

    if (criticalDiagnostics.length > 0) {
      for (const diagnostic of criticalDiagnostics) {
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } =
            diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            "\n",
          );
          logger.error(
            `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
          );
        } else {
          logger.error(
            ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
          );
        }
      }
    }

    // Report warnings
    const warningDiagnostics = diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Warning,
    );

    for (const diagnostic of warningDiagnostics) {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n",
        );
        logger.warning(
          `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
        );
      } else {
        logger.warning(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        );
      }
    }

    if (emitResult.emitSkipped) {
      throw new Error("TypeScript declaration compilation failed");
    }

    // In production mode, use API Extractor to bundle declarations
    if (isProduction) {
      const extractorConfig = ExtractorConfig.prepare({
        configObject: apiExtractorConfig,
        configObjectFullPath: paths.root,
        packageJsonFullPath: resolve(paths.root, "package.json"),
      });

      logger.debug("API Extractor configuration prepared");

      const extractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: true,
        showDiagnostics: true,
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
    }

    // Clean up temp directory after extraction
    await rm(paths.temp, { recursive: true, force: true });

    logger.endStep(`Generating types (${buildMode})`);
  } catch (error) {
    throw new Error(
      `Type generation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Build JavaScript bundles with Rolldown
 * @returns {Promise<void>}
 */
async function buildBundles() {
  logger.startStep("Building bundles");
  try {
    const rolldownConfig = getRolldownConfig();

    // Create bundle with Rolldown
    const bundle = await rolldown(rolldownConfig);

    // Generate output files (ESM and CJS)
    if (Array.isArray(rolldownConfig.output)) {
      await Promise.all(
        rolldownConfig.output.map(async (output) => {
          await bundle.write(output);
          const filePath = output.file;
          const stats = await stat(filePath);
          const formattedSize = prettyBytes(stats.size);

          logger.info(
            `Generated ${output.format.toUpperCase()} bundle: ${theme.highlight(formattedSize)}`,
          );

          logger.debug("Bundle details:", {
            format: output.format,
            file: filePath,
            size: formattedSize,
            rawSize: stats.size,
          });
        }),
      );
    }

    // Release resources
    await bundle.close();
    logger.endStep("Building bundles");
  } catch (error) {
    throw new Error(
      `Bundle creation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Main build function
 * @returns {Promise<void>}
 */
async function build() {
  try {
    logger.info(
      `Starting build ${isProduction ? "(production)" : "(development)"}...`,
    );

    // Step 1: Clean directories
    await clean();

    // Step 2: Build JavaScript bundles
    await buildBundles();

    // Step 3: Compile TypeScript types
    await compileTypes();

    // Show build summary
    logger.showSummary();
  } catch (error) {
    logger.error(
      "Build failed",
      error instanceof Error ? error : new Error(String(error)),
    );
    process.exit(1);
  }
}

// Start the build process
build().catch((error) => {
  logger.error(
    "Fatal build error:",
    error instanceof Error ? error : new Error(String(error)),
  );
  process.exit(1);
});
