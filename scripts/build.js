import fs from "node:fs";
import module from "node:module";
import path from "node:path";
import apiExtractor from "@microsoft/api-extractor";
import chalk from "chalk";
import esbuild from "esbuild";
import prettyBytes from "pretty-bytes";
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

// Creates external dependencies configuration for esbuild
function createExternalConfig(pkg) {
  // Collect all project dependencies
  const projectDependencies = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);

  // Node.js built-in modules (with and without node: prefix)
  const nodeBuiltins = new Set([
    ...module.builtinModules,
    ...module.builtinModules.map((builtin) => `node:${builtin}`),
  ]);

  // Combine all external dependencies
  return [...Array.from(nodeBuiltins), ...Array.from(projectDependencies)];
}

// Build JavaScript bundles with esbuild (ESM only)
async function buildWithEsbuild(paths, pkg) {
  Logger.debug("Building ESM bundle with esbuild");

  // Get external dependencies to exclude from the bundle
  const external = createExternalConfig(pkg);

  try {
    await esbuild.build({
      entryPoints: [path.resolve(paths.src, "index.ts")],
      outfile: path.resolve(paths.dist, "index.js"),
      bundle: true,
      platform: "node",
      target: "esnext",
      format: "esm",
      external,
      allowOverwrite: true,
      logLevel: "warning",
      tsconfig: paths.tsconfig,
      legalComments: "none",
    });

    const stats = fs.statSync(path.resolve(paths.dist, "index.js"));
    Logger.info(`ESM bundle generated (${prettyBytes(stats.size)})`);

    Logger.success("ESM bundle created successfully");
    return true;
  } catch (error) {
    Logger.error("esbuild failed:", error.message);
    return false;
  }
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

  Logger.debug("Starting ESM-only build process with esbuild");

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

  // Step 2: Build bundle with esbuild and generate types in parallel
  const [bundlesSuccess, typesSuccess] = await Promise.all([
    buildWithEsbuild(paths, pkg),
    generateTypeDeclarations(paths),
  ]);

  if (!bundlesSuccess) {
    throw new Error("ESM bundle creation failed");
  }

  if (!typesSuccess) {
    throw new Error("Type generation failed");
  }

  // Clean up temporary files
  await fs.promises.rm(paths.temp, { recursive: true, force: true });

  // Build summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  Logger.success(`ESM-only build completed successfully in ${duration}s`);

  return true;
}

// Start the build process
build().catch((error) => {
  Logger.error("Fatal error:", error);
  process.exit(1);
});
