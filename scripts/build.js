import { readFileSync } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import chalk from "chalk";
import figures from "figures";
import prettyBytes from "pretty-bytes";
import { rollup } from "rollup";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";
import ts from "typescript";

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

class Logger {
  constructor() {
    this.metrics = {
      startTime: process.hrtime(),
      steps: new Map(),
    };
  }

  getTimestamp() {
    const now = new Date();
    return theme.dim(`[${now.toLocaleTimeString()}]`);
  }

  formatDuration(startTime) {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    return `${(seconds + nanoseconds / 1e9).toFixed(2)}s`;
  }

  startStep(step) {
    const startTime = process.hrtime();
    this.metrics.steps.set(step, startTime[0] * 1e9 + startTime[1]);
    console.log(
      `${this.getTimestamp()} ${theme.info(symbols.start)} ${theme.primary(step)}`,
    );
  }

  endStep(step) {
    const startTimeNs = this.metrics.steps.get(step);
    if (startTimeNs) {
      const duration =
        (process.hrtime.bigint() - BigInt(startTimeNs)) / BigInt(1e9);
      console.log(
        `${this.getTimestamp()} ${theme.success(symbols.success)} ${theme.success(
          step,
        )} ${theme.dim(`(${duration.toString()}s)`)}`,
      );
    }
  }

  info(message) {
    console.log(
      `${this.getTimestamp()} ${theme.info(symbols.info)} ${message}`,
    );
  }

  success(message) {
    console.log(
      `${this.getTimestamp()} ${theme.success(symbols.success)} ${theme.success(message)}`,
    );
  }

  error(message, error) {
    console.error(
      `${this.getTimestamp()} ${theme.error(symbols.error)} ${theme.error(message)}`,
    );
    if (error?.stack) {
      console.error(theme.dim(error.stack));
    }
  }

  warning(message) {
    console.log(
      `${this.getTimestamp()} ${theme.warning(symbols.warning)} ${theme.warning(message)}`,
    );
  }

  debug(message, data) {
    console.log(
      `${this.getTimestamp()} ${theme.secondary(symbols.debug)} ${theme.secondary(message)}`,
    );
    if (data) {
      console.log(
        typeof data === "string" ? data : JSON.stringify(data, null, 2),
      );
    }
  }

  showSummary() {
    const totalDuration = this.formatDuration(this.metrics.startTime);
    console.log(
      `${this.getTimestamp()} ${theme.success("✨ Build completed")} ${theme.white("in")} ${theme.time(totalDuration)}`,
    );
    console.log(
      `${this.getTimestamp()} ${theme.info("📦")} ${this.metrics.steps.size} steps completed successfully`,
    );
  }
}

const paths = {
  root: process.cwd(),
  src: resolve(process.cwd(), "src"),
  dist: resolve(process.cwd(), "dist"),
  temp: resolve(process.cwd(), "temp"),
  tsconfig: resolve(process.cwd(), "tsconfig.json"),
  package: resolve(process.cwd(), "package.json"),
};

const isProduction = process.env.NODE_ENV === "production";
const logger = new Logger();

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
      optimizer: {
        simplify: true,
        globals: {
          vars: {
            "process.env.NODE_ENV": isProduction
              ? '"production"'
              : '"development"',
          },
        },
      },
    },
  },
  module: {
    type: "es6",
    strict: true,
    lazy: false,
    importInterop: "node",
  },
  sourceMaps: !isProduction,
  minify: false,
});

function getRollupConfig() {
  const pkg = JSON.parse(readFileSync(paths.package, "utf-8"));
  logger.debug("Package dependencies analysis:", {
    dependencies: pkg.dependencies || {},
    peerDependencies: pkg.peerDependencies || {},
  });

  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    /^node:/,
  ];
  logger.debug("Configured externals:", externals);

  const config = {
    input: resolve(paths.src, "index.ts"),
    external: externals,
    output: [
      {
        file: resolve(paths.dist, "index.mjs"),
        format: "esm",
        sourcemap: !isProduction,
        interop: "auto",
        esModule: true,
        exports: "named",
        generatedCode: {
          constBindings: true,
        },
      },
      {
        file: resolve(paths.dist, "index.cjs"),
        format: "cjs",
        sourcemap: !isProduction,
        interop: "auto",
        esModule: true,
        exports: "named",
        generatedCode: {
          constBindings: true,
        },
      },
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true,
        extensions: [".ts", ".js", ".mjs", ".cjs", ".json"],
      }),
      commonjs({
        include: /node_modules/,
        extensions: [".js", ".cjs"],
        ignoreTryCatch: true,
        requireReturnsDefault: "preferred",
      }),
      swc(swcConfig),
    ],
  };
  logger.debug("Rollup configuration:", config);
  return config;
}

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
  apiReport: { enabled: false },
  docModel: { enabled: false },
  dtsRollup: {
    enabled: true,
    untrimmedFilePath: resolve(paths.dist, "index.d.ts"),
    omitTrimmingComments: false,
  },
  tsdocMetadata: { enabled: false },
  messages: {
    compilerMessageReporting: {
      default: { logLevel: "warning" },
      TS2589: { logLevel: "none" },
      TS2344: { logLevel: "none" },
    },
    extractorMessageReporting: {
      default: { logLevel: "warning" },
      "ae-missing-release-tag": { logLevel: "none" },
    },
    tsdocMessageReporting: { default: { logLevel: "warning" } },
  },
};

async function clean() {
  logger.startStep("Cleaning directories");
  try {
    await Promise.all([
      rm(paths.dist, { recursive: true, force: true }),
      rm(paths.temp, { recursive: true, force: true }),
    ]);

    await Promise.all([
      mkdir(paths.dist, { recursive: true }),
      mkdir(paths.temp, { recursive: true }),
    ]);

    logger.endStep("Cleaning directories");
  } catch (error) {
    throw new Error(`Cleaning failed: ${error.message}`);
  }
}

async function compileTypes() {
  logger.startStep(
    `Generating types ${isProduction ? "(production)" : "(development)"}`,
  );

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

    logger.debug("TypeScript compiler options:", parsedConfig.options);

    const program = ts.createProgram(parsedConfig.fileNames, {
      ...parsedConfig.options,
      declaration: true,
      emitDeclarationOnly: true,
      declarationDir: isProduction ? paths.temp : paths.dist,
      outDir: isProduction ? paths.temp : paths.dist,
      noEmit: false,
      sourceMap: !isProduction,
    });

    logger.debug("TypeScript program files:", parsedConfig.fileNames);

    const emitResult = program.emit();

    if (!isProduction) {
      const diagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
      for (const diagnostic of diagnostics) {
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
        }
      }
    }

    if (emitResult.emitSkipped) {
      throw new Error("TypeScript declaration compilation failed");
    }

    if (isProduction) {
      const extractorConfig = ExtractorConfig.prepare({
        configObject: apiExtractorConfig,
        configObjectFullPath: paths.root,
        packageJsonFullPath: resolve(paths.root, "package.json"),
      });

      logger.debug("API Extractor configuration:", extractorConfig);

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
    }

    await rm(paths.temp, { recursive: true, force: true });
    logger.endStep(
      `Generating types ${isProduction ? "(production)" : "(development)"}`,
    );
  } catch (error) {
    throw new Error(`Type generation failed: ${error.message}`);
  }
}

async function buildBundles() {
  logger.startStep("Building bundles");
  try {
    const rollupConfig = getRollupConfig();
    logger.debug("Starting Rollup build with config:", rollupConfig);
    const bundle = await rollup(rollupConfig);

    await Promise.all(
      rollupConfig.output.map(async (output) => {
        await bundle.write(output);
        const stats = await stat(output.file);
        logger.info(
          `Generated ${output.format.toUpperCase()} bundle: ${theme.highlight(prettyBytes(stats.size))}`,
        );
        logger.debug("Bundle details:", {
          format: output.format,
          file: output.file,
          size: prettyBytes(stats.size),
          rawSize: stats.size,
        });
      }),
    );

    await bundle.close();
    logger.endStep("Building bundles");
  } catch (error) {
    throw new Error(`Bundle creation failed: ${error.message}`);
  }
}

async function checkBundleSize() {
  logger.startStep("Checking bundle sizes");
  try {
    const dtsPath = resolve(paths.dist, "index.d.ts");
    const stats = await stat(dtsPath);
    const sizeInMb = stats.size / (1024 * 1024);

    if (sizeInMb > 1) {
      logger.warning(
        `Declaration file (${prettyBytes(stats.size)}) is unusually large!`,
      );
    }

    logger.endStep("Checking bundle sizes");
  } catch (error) {
    throw new Error(`Size check failed: ${error.message}`);
  }
}

async function build() {
  try {
    logger.info(
      `Starting build ${isProduction ? "(production)" : "(development)"}...`,
    );

    await clean();
    await buildBundles();
    await compileTypes();
    await checkBundleSize();

    logger.showSummary();
  } catch (error) {
    logger.error(
      "Build failed",
      error instanceof Error ? error : new Error(String(error)),
    );
    process.exit(1);
  }
}

build().catch((error) => {
  logger.error(
    "Fatal build error:",
    error instanceof Error ? error : new Error(String(error)),
  );
  process.exit(1);
});
