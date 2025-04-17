import fs from "node:fs";
import path from "node:path";
import apiExtractor from "@microsoft/api-extractor";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import chalk from "chalk";
import figures from "figures";
import prettyBytes from "pretty-bytes";
import { rollup } from "rollup";
import swc from "rollup-plugin-swc3";
import ts from "typescript";

// Main paths
const paths = {
  root: process.cwd(),
  src: path.resolve(process.cwd(), "src"),
  dist: path.resolve(process.cwd(), "dist"),
  temp: path.resolve(process.cwd(), "temp"),
  tsconfig: path.resolve(process.cwd(), "tsconfig.json"),
  package: path.resolve(process.cwd(), "package.json"),
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

// Build JavaScript bundles with Rollup + SWC
async function buildWithRollup(paths, pkg) {
  Logger.debug("Building bundles with Rollup + SWC");

  // External modules (will not be bundled)
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];

  // SWC configuration for TypeScript and advanced features
  const swcOptions = {
    // JavaScript Compiler options
    jsc: {
      // Parser configuration
      parser: {
        syntax: "typescript",
        tsx: false, // Set to true if your project uses TSX
        decorators: true, // Enable decorators
        dynamicImport: true, // Support dynamic imports
        privateMethod: true, // Support private methods
        importMeta: true, // Support import.meta
        preserveAllComments: false, // Don't preserve all comments
      },

      // Compilation target
      target: "esnext", // Match your deployment environment

      // Use loose mode for better performance
      loose: false, // Set to true for better performance but less spec compliance

      // External helpers reduce bundle size when using bundler
      externalHelpers: false, // TODO: Requires @swc/helpers as dependency but there is a bug with the detection

      // Preserve original class names in output (for better debugging)
      keepClassNames: true, // Helps with debugging and error messages

      // Transformation options
      transform: {
        // Use modern decorators (stage 3) instead of legacy
        decoratorVersion: "2022-03", // Modern decorators specification
        decoratorMetadata: true, // Required for reflection metadata in TypeScript

        // Use define semantics for class fields (matches TypeScript)
        useDefineForClassFields: true,

        // Optimizer configuration
        optimizer: {
          simplify: true, // Enable expression simplification
          globals: {
            // You can add environment-specific globals here
            vars: {
              // Example: "__DEV__": process.env.NODE_ENV === "development" ? "true" : "false"
            },
          },
        },
      },

      // Output configuration
      output: {
        // Use UTF-8 for output files
        charset: "utf8",
      },
    },

    // Module configuration
    module: {
      type: "es6", // 'es6' for ESM, 'commonjs' for CJS
      strict: true, // Use strict mode for modules
      strictMode: true, // Emit 'use strict'
      lazy: false, // Don't use lazy loading
      noInterop: false, // Add interop code for better compatibility
    },

    // Source map generation
    sourceMaps: false, // Generate source maps for debugging

    // Don't minify during compilation
    minify: false,

    // Include source content in source maps for better debugging
    inlineSourcesContent: true,

    // Automatic module/script detection
    isModule: true, // Treat input as a module
  };

  // Common Rollup plugins
  const plugins = [
    nodeResolve({
      extensions: [".ts", ".js", ".mjs", ".cjs"],
    }),
    commonjs(),
    swc(swcOptions),
  ];

  // Create a rollup bundle
  const startTime = Date.now();
  const bundle = await rollup({
    input: path.resolve(paths.src, "index.ts"),
    plugins,
    external,
  });

  // Generate ESM and CJS outputs
  await Promise.all([
    // ESM output
    bundle.write({
      file: path.resolve(paths.dist, "index.js"),
      format: "es",
      exports: "named",
      sourcemap: false,
    }),
    // CJS output
    bundle.write({
      file: path.resolve(paths.dist, "index.cjs"),
      format: "cjs",
      exports: "named",
      sourcemap: false,
    }),
  ]);

  // Close the bundle
  await bundle.close();

  // Calculate and log stats
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Get file sizes
  const esmStats = fs.statSync(path.resolve(paths.dist, "index.js"));
  const cjsStats = fs.statSync(path.resolve(paths.dist, "index.cjs"));

  Logger.success(`ESM bundle generated (${prettyBytes(esmStats.size)})`);
  Logger.success(`CJS bundle generated (${prettyBytes(cjsStats.size)})`);
  Logger.debug(`Bundle generation completed in ${duration}s`);

  return true;
}

// Generate TypeScript declaration files
async function generateTypeDeclarations(paths) {
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
}

// Bundle declaration files with API Extractor
async function bundleDeclarations(paths) {
  Logger.debug("Running API Extractor for d.ts bundling");

  // Create in-memory API Extractor configuration
  const apiExtractorConfig = {
    projectFolder: paths.root,
    mainEntryPointFilePath: path.resolve(paths.temp, "index.d.ts"),

    compiler: {
      tsconfigFilePath: paths.tsconfig,
      skipLibCheck: true,
    },

    dtsRollup: {
      enabled: true,
      untrimmedFilePath: "",
      betaTrimmedFilePath: "",
      publicTrimmedFilePath: path.resolve(paths.dist, "index.d.ts"),
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
  const extractorConfig = apiExtractor.ExtractorConfig.prepare({
    configObject: apiExtractorConfig,
    configObjectFullPath: paths.root,
    packageJsonFullPath: paths.package,
  });

  // Run API Extractor
  const extractorResult = apiExtractor.Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
    showDiagnostics: true,
  });

  if (extractorResult.succeeded) {
    Logger.success("API Extractor completed successfully");
  } else {
    Logger.warn("API Extractor completed with warnings");
  }

  // Verify the output file existence
  const outputDtsPath = path.resolve(paths.dist, "index.d.ts");
  const dtsStats = await fs.promises.stat(outputDtsPath);
  Logger.success(
    `Declaration bundle generated (${prettyBytes(dtsStats.size)})`,
  );

  return extractorResult.succeeded;
}

// Main build function
async function build() {
  const startTime = Date.now();

  // Read package.json
  const pkg = JSON.parse(fs.readFileSync(paths.package, "utf-8"));

  Logger.debug("Starting build process");

  // Step 1: Clean directories
  await Promise.all([
    fs.promises.rm(paths.dist, { recursive: true, force: true }),
    fs.promises.rm(paths.temp, { recursive: true, force: true }),
  ]);

  // Create directories if they don't exist
  await Promise.all([
    fs.promises.mkdir(paths.dist, { recursive: true }),
    fs.promises.mkdir(paths.temp, { recursive: true }),
  ]);

  // Step 2: Build bundles with Rollup+SWC and generate types in parallel
  const [bundlesSuccess, typesSuccess] = await Promise.all([
    buildWithRollup(paths, pkg),
    generateTypeDeclarations(paths),
  ]);

  if (!bundlesSuccess) {
    throw new Error("Bundle creation failed");
  }

  if (!typesSuccess) {
    throw new Error("Type generation failed");
  }

  // Clean up temporary files
  await fs.promises.rm(paths.temp, { recursive: true, force: true });

  // Build summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  Logger.success(`Build completed in ${duration}s`);

  return true;
}

// Start the build process
build().catch((error) => {
  Logger.error("Fatal error:", error);
  process.exit(1);
});
