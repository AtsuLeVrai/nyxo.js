import { readFileSync } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import chalk from "chalk";
import figures from "figures";
import { rollup } from "rollup";
import { swc } from "rollup-plugin-swc3";
import ts from "typescript";

const isProduction = process.env.NODE_ENV === "production";

// Main paths
const paths = {
  root: process.cwd(),
  src: resolve(process.cwd(), "src"),
  dist: resolve(process.cwd(), "dist"),
  temp: resolve(process.cwd(), "temp"),
  tsconfig: resolve(process.cwd(), "tsconfig.json"),
  package: resolve(process.cwd(), "package.json"),
};

// Colors for logger
const colors = {
  debug: chalk.rgb(167, 139, 250),
  success: chalk.rgb(134, 239, 172),
  error: chalk.rgb(252, 165, 165),
  warning: chalk.rgb(253, 230, 138),
};

// Simplified logger
const Logger = {
  getTimestamp() {
    return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
  },

  success(message) {
    console.log(
      `${this.getTimestamp()} ${colors.success(figures.tick)} ${colors.success(message)}`,
    );
  },

  error(message, error) {
    console.error(
      `${this.getTimestamp()} ${colors.error(figures.cross)} ${colors.error(message)}`,
    );
    if (error?.stack) {
      console.error(chalk.gray(error.stack));
    }
  },

  warn(message) {
    console.log(
      `${this.getTimestamp()} ${colors.warning(figures.info)} ${colors.warning(message)}`,
    );
  },

  debug(message, data) {
    console.log(
      `${this.getTimestamp()} ${colors.debug(figures.bullet)} ${colors.debug(message)}`,
    );
    if (data) {
      console.log(
        typeof data === "string" ? data : JSON.stringify(data, null, 2),
      );
    }
  },
};

// Read package.json
function readPackageJson() {
  try {
    return JSON.parse(readFileSync(paths.package, "utf-8"));
  } catch (error) {
    Logger.error("Unable to read package.json", error);
    return { name: "", version: "" };
  }
}

// Rollup configuration
function getRollupConfig() {
  const pkg = readPackageJson();

  // External modules (will not be bundled)
  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    /^node:/,
  ];

  // Output definitions
  const outputs = [
    {
      file: resolve(paths.dist, "index.mjs"),
      format: "esm",
      sourcemap: !isProduction,
      exports: "named",
    },
    {
      file: resolve(paths.dist, "index.cjs"),
      format: "cjs",
      sourcemap: !isProduction,
      exports: "named",
    },
  ];

  // Rollup configuration
  const config = {
    input: resolve(paths.src, "index.ts"),
    external: externals,
    treeshake: true,
    plugins: [
      swc({
        jsc: {
          target: "esnext",
          parser: {
            syntax: "typescript",
            tsx: false,
            decorators: true,
            dynamicImport: true,
          },
          transform: {
            decoratorMetadata: true,
            useDefineForClassFields: true,
          },
        },
        sourceMaps: !isProduction,
        minify: isProduction,
      }),
    ],
  };

  return { config, outputs };
}

// Simplified API Extractor configuration
const apiExtractorConfig = {
  projectFolder: paths.root,
  mainEntryPointFilePath: resolve(paths.temp, "index.d.ts"),
  compiler: {
    tsconfigFilePath: paths.tsconfig,
    overrideTsconfig: {
      compilerOptions: {
        types: ["node"],
        skipLibCheck: true,
        isolatedModules: true,
        strict: true,
      },
    },
  },
  apiReport: { enabled: false },
  docModel: { enabled: false },
  dtsRollup: {
    enabled: true,
    untrimmedFilePath: resolve(paths.dist, "index.d.ts"),
  },
  tsdocMetadata: {
    enabled: isProduction,
    tsdocMetadataFilePath: resolve(paths.dist, "tsdoc-metadata.json"),
  },
  messages: {
    compilerMessageReporting: {
      default: { logLevel: "warning" },
      TS2589: { logLevel: "none" },
      TS2344: { logLevel: "none" },
      TS1375: { logLevel: "none" },
      TS2306: { logLevel: "none" },
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
    },
  },
};

// Clean directories
async function clean() {
  try {
    await Promise.all([
      rm(paths.dist, { recursive: true, force: true }),
      rm(paths.temp, { recursive: true, force: true }),
    ]);

    await Promise.all([
      mkdir(paths.dist, { recursive: true }),
      mkdir(paths.temp, { recursive: true }),
    ]);

    Logger.success("Cleaning successful");
  } catch (error) {
    throw new Error(`Cleaning failed: ${error.message}`);
  }
}

// Generate TypeScript declaration files
async function compileTypes() {
  try {
    // Find tsconfig.json file
    const configPath = ts.findConfigFile(
      paths.root,
      ts.sys.fileExists,
      "tsconfig.json",
    );
    if (!configPath) {
      throw new Error("tsconfig.json not found");
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

    // Create TypeScript program with specific options
    const program = ts.createProgram(parsedConfig.fileNames, {
      ...parsedConfig.options,
      declaration: true,
      emitDeclarationOnly: true,
      declarationDir: isProduction ? paths.temp : paths.dist,
      outDir: isProduction ? paths.temp : paths.dist,
      noEmit: false,
      sourceMap: !isProduction,
    });

    // Emit declaration files
    const emitResult = program.emit();
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    // Report critical errors
    const errors = diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Error,
    );

    for (const diagnostic of errors) {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n",
        );
        Logger.error(
          `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
        );
      } else {
        Logger.error(
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

      const extractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: false,
        showDiagnostics: true,
      });

      if (!extractorResult.succeeded) {
        throw new Error(
          `API Extractor failed with ${extractorResult.errorCount} errors`,
        );
      }
    }

    // Clean up temp directory after extraction
    await rm(paths.temp, { recursive: true, force: true });

    Logger.success("Type generation completed");
  } catch (error) {
    throw new Error(`Type generation failed: ${error.message}`);
  }
}

// Build JavaScript bundles with Rollup
async function buildBundles() {
  try {
    const { config, outputs } = getRollupConfig();

    // Create bundle with Rollup
    const bundle = await rollup(config);

    // Generate output files (ESM and CJS)
    await Promise.all(
      outputs.map(async (output) => {
        await bundle.write(output);
        const filePath = output.file;
        const stats = await stat(filePath);

        Logger.success(
          `${output.format.toUpperCase()} bundle generated (${stats.size} bytes)`,
        );
      }),
    );

    // Release resources
    await bundle.close();
  } catch (error) {
    throw new Error(`Bundle creation failed: ${error.message}`);
  }
}

// Main build function
async function build() {
  const startTime = Date.now();

  try {
    Logger.debug(
      `Starting build (${isProduction ? "production" : "development"})`,
    );

    // Step 1: Clean directories
    await clean();

    // Step 2: Build JavaScript bundles
    await buildBundles();

    // Step 3: Compile TypeScript types
    await compileTypes();

    // Build summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    Logger.success(`Build completed in ${duration}s`);
  } catch (error) {
    Logger.error(
      "Build failed",
      error instanceof Error ? error : new Error(String(error)),
    );
    process.exit(1);
  }
}

// Start the build process
build().catch((error) => {
  Logger.error("Fatal error:", error);
  process.exit(1);
});
