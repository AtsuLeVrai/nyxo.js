import fs from "node:fs";
import path from "node:path";
import apiExtractor from "@microsoft/api-extractor";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import chalk from "chalk";
import prettyBytes from "pretty-bytes";
import { rollup } from "rollup";
import swc from "rollup-plugin-swc3";
import ts from "typescript";
import winston from "winston";

// Main paths
const paths = {
  root: process.cwd(),
  src: path.resolve(process.cwd(), "src"),
  dist: path.resolve(process.cwd(), "dist"),
  temp: path.resolve(process.cwd(), "temp"),
  tsconfig: path.resolve(process.cwd(), "tsconfig.json"),
  package: path.resolve(process.cwd(), "package.json"),
};

// Define a custom format with symbols and colors
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  let colorizedLevel;

  // Determine the symbol and color based on the level
  switch (level) {
    case "debug":
      colorizedLevel = chalk.rgb(167, 139, 250)(level.toUpperCase());
      break;
    case "info":
      colorizedLevel = chalk.rgb(186, 230, 253)(level.toUpperCase());
      break;
    case "success":
      colorizedLevel = chalk.rgb(134, 239, 172)(level.toUpperCase());
      break;
    case "warn":
      colorizedLevel = chalk.rgb(253, 230, 138)(level.toUpperCase());
      break;
    case "error":
      colorizedLevel = chalk.rgb(252, 165, 165)(level.toUpperCase());
      break;
    default:
      colorizedLevel = level.toUpperCase();
  }

  return `${chalk.gray(`[${timestamp}]`)} ${colorizedLevel}: ${message}`;
});

// Create custom levels including 'success'
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    success: "green",
    info: "blue",
    debug: "magenta",
  },
};

// Configure Winston with our custom formats and levels
winston.addColors(customLevels.colors);

const Logger = winston.createLogger({
  levels: customLevels.levels,
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "HH:mm:ss" }),
    customFormat,
  ),
  transports: [new winston.transports.Console()],
});

// Build JavaScript bundles with Rollup and SWC3
async function buildWithRollup(paths, pkg) {
  Logger.debug("Building bundles with Rollup + SWC3");

  // Get external dependencies to exclude from the bundle
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];

  // Common Rollup input options
  const inputOptions = {
    input: path.resolve(paths.src, "index.ts"),
    external,
    plugins: [
      nodeResolve({
        preferBuiltins: true,
        exportConditions: ["node"],
      }),
      commonjs(),
      json(),
      swc({
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: false,
            decorators: true,
            dynamicImport: true,
            privateMethod: true,
            importMeta: true,
            preserveAllComments: false,
          },
          target: "esnext",
          loose: false,
          externalHelpers: false,
          keepClassNames: true,
          transform: {
            decoratorVersion: "2022-03",
            decoratorMetadata: true,
            useDefineForClassFields: true,
            optimizer: {
              simplify: false,
            },
          },
          output: {
            charset: "utf8",
          },
        },
        module: {
          type: "es6",
          strict: true,
          strictMode: true,
          lazy: false,
          noInterop: false,
        },
        sourceMaps: false,
        minify: false,
        inlineSourcesContent: true,
        isModule: true,
      }),
    ],
    onwarn: (warning, warn) => {
      // Suppress certain warnings
      if (warning.code === "THIS_IS_UNDEFINED") {
        return;
      }
      if (warning.code === "MISSING_EXPORT") {
        return;
      }
      if (warning.code === "CIRCULAR_DEPENDENCY") {
        return;
      }
      if (warning.code === "INVALID_ANNOTATION") {
        return;
      }
      warn(warning);
    },
  };

  // Build configurations
  const builds = [
    {
      ...inputOptions,
      output: {
        file: path.resolve(paths.dist, "index.js"),
        format: "esm",
        sourcemap: false,
        exports: "auto",
      },
    },
    {
      ...inputOptions,
      output: {
        file: path.resolve(paths.dist, "index.cjs"),
        format: "cjs",
        sourcemap: false,
        exports: "auto",
      },
    },
  ];

  // Build all configurations
  const results = await Promise.all(
    builds.map(async (config) => {
      const bundle = await rollup(config);
      try {
        await bundle.write(config.output);
        return config.output.file;
      } finally {
        await bundle.close();
      }
    }),
  );

  // Get file sizes and log results
  for (const filePath of results) {
    const stats = fs.statSync(filePath);
    const format = path.extname(filePath) === ".cjs" ? "CJS" : "ESM";
    Logger.info(`${format} bundle generated (${prettyBytes(stats.size)})`);
  }

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
    module: ts.ModuleKind.NodeNext,
    target: ts.ScriptTarget.ESNext,
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
    showVerboseMessages: false,
    showDiagnostics: false,
  });

  if (extractorResult.succeeded) {
    Logger.success("API Extractor completed successfully");
  } else {
    Logger.warn("API Extractor completed with warnings");
  }

  // Verify the output file existence
  const outputDtsPath = path.resolve(paths.dist, "index.d.ts");
  const dtsStats = await fs.promises.stat(outputDtsPath);
  Logger.info(`Declaration bundle generated (${prettyBytes(dtsStats.size)})`);

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

  // Step 2: Build bundles with Rollup and generate types in parallel
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
  Logger.success(`Build completed successfully in ${duration}s`);

  return true;
}

// Start the build process
build().catch((error) => {
  Logger.error("Fatal error:", error);
  process.exit(1);
});
