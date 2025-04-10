import { readFileSync } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import chalk from "chalk";
import esbuild from "esbuild";
import figures from "figures";
import prettyBytes from "pretty-bytes";
import ts from "typescript";

// Determine build mode from environment variables
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
  info: chalk.rgb(186, 230, 253),
};

// Enhanced logger
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
    return error;
  },

  warn(message) {
    console.log(
      `${this.getTimestamp()} ${colors.warning(figures.warning)} ${colors.warning(message)}`,
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

  info(message) {
    console.log(
      `${this.getTimestamp()} ${colors.info(figures.info)} ${colors.info(message)}`,
    );
  },
};

// Read package.json
function readPackageJson(packagePath) {
  try {
    return JSON.parse(readFileSync(packagePath, "utf-8"));
  } catch (_error) {
    return { name: "", version: "" };
  }
}

// Clean directories
async function cleanDirectories(paths) {
  try {
    await Promise.all([
      rm(paths.dist, { recursive: true, force: true }),
      rm(paths.temp, { recursive: true, force: true }),
    ]);

    await Promise.all([
      mkdir(paths.dist, { recursive: true }),
      mkdir(paths.temp, { recursive: true }),
    ]);

    Logger.success("Directories cleaned successfully");
    return true;
  } catch (error) {
    throw Logger.error(`Directory cleaning failed: ${error.message}`, error);
  }
}

// Build JavaScript bundles with esbuild
async function buildWithEsbuild(paths, pkg, options = {}) {
  try {
    Logger.debug("Building bundles with esbuild");

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
      target: options.target || "esnext",
      sourcemap:
        options.sourcemap !== undefined ? options.sourcemap : !isProduction,
      minify: false,
      external,
      logLevel: "silent",
      metafile: true,
    };

    // Build ESM and CJS bundles
    const [_esmResult, _cjsResult] = await Promise.all([
      esbuild.build({
        ...commonOptions,
        outfile: resolve(paths.dist, "index.js"),
        format: "esm",
      }),
      esbuild.build({
        ...commonOptions,
        outfile: resolve(paths.dist, "index.cjs"),
        format: "cjs",
      }),
    ]);

    // Log the build results
    const esmStats = await stat(resolve(paths.dist, "index.js"));
    const cjsStats = await stat(resolve(paths.dist, "index.cjs"));

    Logger.success(`ESM bundle generated (${prettyBytes(esmStats.size)})`);
    Logger.success(`CJS bundle generated (${prettyBytes(cjsStats.size)})`);

    return true;
  } catch (error) {
    throw Logger.error(`Bundle creation failed: ${error.message}`, error);
  }
}

// Build with TypeScript compiler (for development mode)
async function buildWithTypeScript(paths) {
  try {
    Logger.debug("Building with TypeScript compiler");

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
    const compilerOptions = {
      ...parsedConfig.options,
      outDir: paths.dist,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    };

    const program = ts.createProgram(parsedConfig.fileNames, compilerOptions);

    // Emit compiled files
    const emitResult = program.emit();
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    // Report errors
    const errors = diagnostics.filter(
      (d) => d.category === ts.DiagnosticCategory.Error,
    );

    if (errors.length > 0) {
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
      return false;
    }

    if (emitResult.emitSkipped) {
      Logger.error("TypeScript compilation failed");
      return false;
    }

    Logger.success("TypeScript compilation completed successfully");
    return true;
  } catch (error) {
    throw Logger.error(
      `TypeScript compilation failed: ${error.message}`,
      error,
    );
  }
}

// Generate TypeScript declaration files
async function generateTypeDeclarations(paths) {
  try {
    Logger.debug("Generating type declarations");

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

    // Create TypeScript program with specific options for declarations only
    const program = ts.createProgram(parsedConfig.fileNames, {
      ...parsedConfig.options,
      declaration: true,
      declarationMap: false,
      emitDeclarationOnly: true,
      declarationDir: paths.temp,
      outDir: paths.temp,
      noEmit: false,
      sourceMap: false,
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

    if (errors.length > 0) {
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
      return false;
    }

    if (emitResult.emitSkipped) {
      Logger.error("TypeScript declaration compilation failed");
      return false;
    }

    // Use API Extractor to bundle declarations
    await bundleDeclarations(paths);

    Logger.success("Type generation completed");
    return true;
  } catch (error) {
    throw Logger.error(`Type generation failed: ${error.message}`, error);
  }
}

// Bundle declaration files with API Extractor
async function bundleDeclarations(paths) {
  try {
    Logger.debug("Running API Extractor for d.ts bundling");

    // Create in-memory API Extractor configuration
    const apiExtractorConfig = {
      $schema:
        "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
      projectFolder: paths.root,
      mainEntryPointFilePath: resolve(paths.temp, "index.d.ts"),

      compiler: {
        tsconfigFilePath: paths.tsconfig,
        skipLibCheck: true,
      },

      dtsRollup: {
        enabled: true,
        untrimmedFilePath: "",
        betaTrimmedFilePath: "",
        publicTrimmedFilePath: resolve(paths.dist, "index.d.ts"),
      },

      apiReport: { enabled: false },
      docModel: { enabled: false },
      tsdocMetadata: { enabled: false },

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
    Logger.success(`Declaration bundle generated (${prettyBytes(stats.size)})`);

    return extractorResult.succeeded;
  } catch (error) {
    throw Logger.error(`API Extractor failed: ${error.message}`, error);
  }
}

// Main build function
async function build() {
  const startTime = Date.now();

  // Read package.json
  const pkg = readPackageJson(paths.package);

  try {
    Logger.debug(
      `Starting build (${isProduction ? "production" : "development"} mode)`,
      {
        mode: isProduction ? "production" : "development",
      },
    );

    // Define the build process
    const performBuild = async () => {
      // Step 1: Clean directories
      await cleanDirectories(paths);

      // Step 2: Build bundles based on mode
      let bundlesSuccess = false;

      if (isProduction) {
        // In production, use esbuild
        bundlesSuccess = await buildWithEsbuild(paths, pkg);

        // Step 3: In production mode, separately generate types
        if (bundlesSuccess) {
          const typesSuccess = await generateTypeDeclarations(paths);
          if (!typesSuccess) {
            throw new Error("Type generation failed");
          }
        }
      } else {
        // In development, use TypeScript compiler which also generates declarations
        bundlesSuccess = await buildWithTypeScript(paths);
      }

      if (!bundlesSuccess) {
        throw new Error("Bundle creation failed");
      }

      // Clean up temporary files
      await rm(paths.temp, { recursive: true, force: true });

      // Build summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.success(`Build completed in ${duration}s`);

      return true;
    };

    // Execute the build
    await performBuild();
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
  console.error("Fatal error:", error);
  process.exit(1);
});
