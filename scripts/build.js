import { readFileSync } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import chalk from "chalk";
import esbuild from "esbuild";
import figures from "figures";
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

// Build JavaScript bundles with Rollup
async function buildBundles() {
  try {
    const pkg = readPackageJson();

    // External modules (will not be bundled)
    const external = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ];

    // Common options for all builds
    const commonOptions = {
      entryPoints: [resolve(paths.src, "index.ts")],
      bundle: true,
      platform: "node",
      target: "esnext",
      sourcemap: !isProduction,
      external: external,
    };

    // Build ESM and CJS bundles
    await Promise.all([
      esbuild.build({
        ...commonOptions,
        outfile: resolve(paths.dist, "index.mjs"),
        format: "esm",
      }),
      esbuild.build({
        ...commonOptions,
        outfile: resolve(paths.dist, "index.cjs"),
        format: "cjs",
      }),
    ]);

    // Log the build results
    const esmStats = await stat(resolve(paths.dist, "index.mjs"));
    const cjsStats = await stat(resolve(paths.dist, "index.cjs"));

    Logger.success(`ESM bundle generated (${esmStats.size} bytes)`);
    Logger.success(`CJS bundle generated (${cjsStats.size} bytes)`);
  } catch (error) {
    throw new Error(`Bundle creation failed: ${error.message}`);
  }
}

// Generate TypeScript declaration files using tsc
async function compileTypes() {
  // Find tsconfig.json file
  const configPath = ts.findConfigFile(
    paths.root,
    ts.sys.fileExists,
    "tsconfig.json",
  );
  if (!configPath) {
    Logger.error("tsconfig.json not found");
    return false;
  }

  // Read and parse configuration file
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
  if (error) {
    Logger.error(`Error reading tsconfig.json: ${error.messageText}`);
    return false;
  }

  try {
    const parsedConfig = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      paths.root,
    );

    // Create TypeScript program with specific options
    const program = ts.createProgram(parsedConfig.fileNames, {
      ...parsedConfig.options,
      declaration: true,
      declarationMap: !isProduction,
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
      Logger.error("TypeScript declaration compilation failed");
      return false;
    }

    // In production mode, use API Extractor to bundle declarations
    if (isProduction) {
      await runApiExtractor();
    }

    await rm(paths.temp, { recursive: true, force: true });

    Logger.success("Type generation completed");
    return true;
  } catch (error) {
    Logger.error(`Type generation failed: ${error.message}`);
    return false;
  }
}

// Run API Extractor to bundle .d.ts files
async function runApiExtractor() {
  try {
    Logger.debug("Running API Extractor");

    // Create in-memory API Extractor configuration
    // Only keeping the minimal required configuration for d.ts bundling
    const apiExtractorConfig = {
      $schema:
        "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
      projectFolder: paths.root,
      mainEntryPointFilePath: resolve(paths.temp, "index.d.ts"),

      // Required section
      compiler: {
        tsconfigFilePath: paths.tsconfig,
        skipLibCheck: true,
      },

      // The only section we actually want to use
      dtsRollup: {
        enabled: true,
        untrimmedFilePath: "",
        betaTrimmedFilePath: "",
        publicTrimmedFilePath: resolve(paths.dist, "index.d.ts"),
      },

      // Disabling everything else
      apiReport: { enabled: false },
      docModel: { enabled: false },
      tsdocMetadata: { enabled: false },

      // Message configuration
      messages: {
        compilerMessageReporting: {
          default: { logLevel: "warning" },
        },
        extractorMessageReporting: {
          default: { logLevel: "warning" },
          "ae-missing-release-tag": { logLevel: "none" },
        },
        tsdocMessageReporting: {
          default: { logLevel: "warning" },
        },
      },
    };

    // Prepare the configuration for API Extractor
    const extractorConfig = ExtractorConfig.prepare({
      configObject: apiExtractorConfig,
      configObjectFullPath: paths.root,
      packageJsonFullPath: paths.package,
    });

    // Run API Extractor
    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true,
    });

    if (extractorResult.succeeded) {
      Logger.success("API Extractor completed successfully");
    } else {
      Logger.warn("API Extractor completed with warnings");
    }

    // Verify the output file existence
    const outputDtsPath = resolve(paths.dist, "index.d.ts");
    const stats = await stat(outputDtsPath);
    Logger.success(`Declaration bundle generated (${stats.size} bytes)`);

    return extractorResult;
  } catch (error) {
    throw new Error(`API Extractor failed: ${error.message}`);
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
    const typesSuccess = await compileTypes();
    if (!typesSuccess) {
      throw new Error("Type generation failed");
    }

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
