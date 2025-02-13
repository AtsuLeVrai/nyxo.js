import { readFileSync } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import chalk from "chalk";
import ora from "ora";
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
 * Color configuration for logging
 */
const colors = {
  primary: chalk.rgb(129, 140, 248),
  secondary: chalk.rgb(167, 139, 250),
  success: chalk.rgb(52, 211, 153),
  error: chalk.rgb(248, 113, 113),
  warning: chalk.rgb(251, 191, 36),
  info: chalk.rgb(96, 165, 250),
  highlight: chalk.rgb(244, 114, 182),
};

/**
 * Logger implementation with colored output and debug support
 */
const logger = {
  info: (message) => console.log(colors.info(message)),
  success: (message) => console.log(colors.success(`✨ ${message}`)),
  error: (message, error) => {
    console.error(colors.error(`❌ ${message}`));
    if (error?.stack) {
      console.error(colors.error(error.stack));
    }
  },
  warning: (message) => console.log(colors.warning(`! ${message}`)),
  debug: (message, data) => {
    if (process.env.DEBUG) {
      console.log(colors.secondary(`🔍 ${message}`));
      if (data) {
        console.log(data);
      }
    }
  },
};

/**
 * Regular expression to match Node.js built-in modules
 * @type {RegExp}
 */
const NODE_MODULES_REGEX = /^node:/;

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

const isProduction = process.env.NODE_ENV === "production";

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
  sourceMaps: !isProduction,
  exclude: ["node_modules", "dist", ".*.js$", ".*\\.d.ts$"],
  minify: false,
});

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
      sourcemap: !isProduction,
    },
    {
      file: resolve(paths.dist, "index.cjs"),
      format: "cjs",
      sourcemap: !isProduction,
      interop: "auto",
      esModule: true,
    },
  ],
  plugins: [swc(swcConfig)],
};

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
    enabled: false,
  },
  docModel: {
    enabled: false,
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
  const spinner = ora({
    text: colors.info("Cleaning build directories..."),
    spinner: "dots",
  }).start();

  try {
    await Promise.all([
      rm(paths.dist, { recursive: true, force: true }),
      rm(paths.temp, { recursive: true, force: true }),
    ]);

    logger.debug("Removed old build files");

    await Promise.all([
      mkdir(paths.dist, { recursive: true }),
      mkdir(paths.temp, { recursive: true }),
    ]);

    spinner.succeed(colors.success("Created fresh build directories"));
  } catch (error) {
    spinner.fail(colors.error("Clean operation failed"));
    throw new Error(`Clean failed: ${error.message}`);
  }
}

/**
 * Compile TypeScript types for both development and production
 * @returns {Promise<void>}
 */
async function compileTypes() {
  const spinner = ora({
    text: colors.info(
      `Generating ${isProduction ? "production" : "development"} type declarations...`,
    ),
    spinner: "dots",
  }).start();

  try {
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
      declarationDir: isProduction ? paths.temp : paths.dist,
      outDir: isProduction ? paths.temp : paths.dist,
      noEmit: false,
      sourceMap: !isProduction,
    };

    logger.debug("Creating TypeScript program...");
    const program = ts.createProgram(parsedConfig.fileNames, compilerOptions);
    const emitResult = program.emit();

    // Only show diagnostics in development mode
    if (!isProduction) {
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
          logger.warning(
            `${diagnostic.file.fileName} (${line + 1},${
              character + 1
            }): ${message}`,
          );
        } else {
          logger.warning(
            ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
          );
        }
      }
    }

    if (emitResult.emitSkipped) {
      throw new Error("TypeScript declaration compilation failed");
    }

    // Additional steps for production build
    if (isProduction) {
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

      await rm(paths.temp, { recursive: true, force: true });
    }

    spinner.succeed(
      colors.success(
        `${isProduction ? "Production" : "Development"} type declarations completed`,
      ),
    );
  } catch (error) {
    spinner.fail(
      colors.error(
        `${isProduction ? "Production" : "Development"} type declaration generation failed`,
      ),
    );
    throw new Error(`Type declaration generation failed: ${error.message}`);
  }
}

/**
 * Build bundles using Rollup
 * @returns {Promise<void>}
 */
async function buildBundles() {
  const spinner = ora({
    text: colors.info("Creating bundles with Rollup..."),
    spinner: "dots",
  }).start();

  try {
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
    spinner.succeed(colors.success("Bundle creation completed"));
  } catch (error) {
    spinner.fail(colors.error("Bundle creation failed"));
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
    logger.warning(
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
    logger.info(`Starting build${isProduction ? " (production)" : ""}...`);

    await clean();
    await buildBundles();

    await compileTypes();

    await checkBundleSize();

    const [seconds] = process.hrtime(startTime);
    logger.success(
      `Build completed for ${isProduction ? "production" : "development"} mode in ${seconds}s`,
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
