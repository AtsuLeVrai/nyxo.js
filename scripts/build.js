import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import chalk from "chalk";
import { program } from "commander";
import { rollup } from "rollup";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";
import ts from "typescript";

const NODE_MODULES_REGEX = /^node:/;

const paths = {
  root: process.cwd(),
  src: resolve(process.cwd(), "src"),
  dist: resolve(process.cwd(), "dist"),
  temp: resolve(process.cwd(), "temp"),
  tsconfig: resolve(process.cwd(), "tsconfig.json"),
  package: resolve(process.cwd(), "package.json"),
};

const prefix = {
  app: chalk.magenta("⚡") + chalk.cyan(" Nyx") + chalk.gray(".js"),
  time: () => chalk.gray(`[${new Date().toLocaleTimeString()}]`),
  success: chalk.green("✓"),
  error: chalk.red("✗"),
  warning: chalk.yellow("!"),
  info: chalk.blue("i"),
  debug: chalk.gray("⚙"),
};

program
  .option("-c, --clean", "Clean dist and temp folders before building")
  .option("-p, --production", "Build for production")
  .parse(process.argv);

const options = program.opts();

function log(message, type = "info", details = "") {
  const icon = prefix[type] || prefix.info;
  const messageColor =
    {
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow,
      info: chalk.white,
      debug: chalk.gray,
    }[type] || chalk.white;

  console.log(
    `${prefix.app} ${prefix.time()} ${icon} ${messageColor(message)}${
      details ? chalk.gray(` (${details})`) : ""
    }`,
  );
}

function getExternals() {
  log("Analyzing package dependencies...", "debug");

  const pkg = JSON.parse(readFileSync(paths.package, "utf-8").toString());
  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    NODE_MODULES_REGEX,
  ];

  log(`Found ${externals.length - 1} external dependencies`, "debug");
  return externals;
}

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
    strictMode: true,
    lazy: false,
    noInterop: false,
  },
  sourceMaps: !options.production,
  exclude: ["node_modules", "dist", ".*.js$", ".*\\.d.ts$"],
});

const rollupConfig = {
  input: resolve(paths.src, "index.ts"),
  external: getExternals(),
  output: [
    {
      file: resolve(paths.dist, "index.mjs"),
      format: "esm",
      sourcemap: !options.production,
    },
    {
      file: resolve(paths.dist, "index.cjs"),
      format: "cjs",
      sourcemap: !options.production,
    },
  ],
  plugins: [swc(swcConfig)],
};

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
      },
    },
  },
  apiReport: { enabled: false },
  docModel: { enabled: false },
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

async function clean() {
  try {
    log("Cleaning build directories...", "info");

    await Promise.all([
      rm(paths.dist, { recursive: true, force: true }),
      rm(paths.temp, { recursive: true, force: true }),
    ]);

    log("Removed old build files", "debug");

    await Promise.all([
      mkdir(paths.dist, { recursive: true }),
      mkdir(paths.temp, { recursive: true }),
    ]);

    log("Created fresh build directories", "success");
  } catch (error) {
    log("Clean operation failed", "error", error.message);
    throw new Error(`Clean failed: ${error.message}`);
  }
}

function compileTypes() {
  try {
    log("Starting TypeScript compilation...", "info");

    const configPath = ts.findConfigFile(
      paths.root,
      ts.sys.fileExists,
      "tsconfig.json",
    );

    if (!configPath) {
      throw new Error("Could not find tsconfig.json");
    }

    log("Found TypeScript configuration", "debug");

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
      outDir: paths.temp,
      noEmit: false,
    };

    log("Creating TypeScript program...", "debug");

    const program = ts.createProgram(parsedConfig.fileNames, compilerOptions);
    const emitResult = program.emit();

    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    if (allDiagnostics.length > 0) {
      log(
        `Found ${allDiagnostics.length} TypeScript diagnostic messages`,
        "warning",
      );
    }

    if (allDiagnostics.length > 0 && emitResult.emitSkipped) {
      throw new Error("TypeScript compilation failed");
    }

    log("TypeScript compilation completed", "success");
  } catch (error) {
    log("TypeScript compilation failed", "error", error.message);
    throw new Error(`Types compilation failed: ${error.message}`);
  }
}

function buildTypes() {
  try {
    log("Generating types with API Extractor...", "info");

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

    log("Type generation completed", "success");
  } catch (error) {
    log("Type generation failed", "error", error.message);
    throw new Error(`Type generation failed: ${error.message}`);
  }
}

async function buildBundles() {
  try {
    log("Creating bundles with Rollup...", "info");

    log("Building bundle...", "debug");
    const bundle = await rollup(rollupConfig);

    log("Writing output files...", "debug");
    await Promise.all(
      rollupConfig.output.map(async (output) => {
        await bundle.write(output);
        log(
          `Generated ${output.format.toUpperCase()} bundle`,
          "debug",
          output.file,
        );
      }),
    );

    await bundle.close();
    log("Bundle creation completed", "success");
  } catch (error) {
    log("Bundle creation failed", "error", error.message);
    throw new Error(`Bundle creation failed: ${error.message}`);
  }
}

async function build() {
  const startTime = Date.now();
  try {
    log(
      `Starting build${options.production ? " (production)" : ""}...`,
      "info",
    );

    if (options.clean) {
      await clean();
    }

    await buildBundles();

    compileTypes();
    buildTypes();

    await rm(paths.temp, { recursive: true, force: true });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const mode = options.production
      ? chalk.yellow("production")
      : chalk.blue("development");
    log(
      `Build completed for ${mode} mode in ${chalk.cyan(`${duration}s`)}`,
      "success",
    );
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Build failed after ${duration}s`, "error", error.message);
    process.exit(1);
  }
}

build().catch((error) => {
  log("Build failed", "error", error.message);
  process.exit(1);
});
