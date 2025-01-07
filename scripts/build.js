import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { rollup } from "rollup";
import { defineRollupSwcOption, swc } from "rollup-plugin-swc3";
import ts from "typescript";

const paths = {
  root: process.cwd(),
  src: resolve(process.cwd(), "src"),
  dist: resolve(process.cwd(), "dist"),
  temp: resolve(process.cwd(), "temp"),
  tsconfig: resolve(process.cwd(), "tsconfig.json"),
  package: resolve(process.cwd(), "package.json"),
};

function getExternals() {
  const pkg = JSON.parse(readFileSync(paths.package, "utf-8"));
  return [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    /^node:/, // Node.js native modules
  ];
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
  sourceMaps: true,
  exclude: ["node_modules", "dist", ".*.js$", ".*\\.d.ts$"],
});

const rollupConfig = {
  input: resolve(paths.src, "index.ts"),
  external: getExternals(),
  output: [
    {
      file: resolve(paths.dist, "index.mjs"),
      format: "esm",
      sourcemap: true,
    },
    {
      file: resolve(paths.dist, "index.cjs"),
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: [swc(swcConfig)],
};

const apiExtractorConfig = {
  $schema:
    "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.json",
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
  apiReport: {
    enabled: false,
  },
  docModel: {
    enabled: false,
  },
  dtsRollup: {
    enabled: true,
    untrimmedFilePath: resolve(paths.dist, "index.d.ts"),
  },
  tsdocMetadata: {
    enabled: false,
  },
  messages: {
    compilerMessageReporting: {
      default: {
        logLevel: "warning",
      },
    },
    extractorMessageReporting: {
      default: {
        logLevel: "warning",
      },
      "ae-missing-release-tag": {
        logLevel: "none",
      },
    },
    tsdocMessageReporting: {
      default: {
        logLevel: "warning",
      },
    },
  },
};

async function clean() {
  console.log("🧹 Cleaning dist and temp folders...");
  await Promise.all([
    rm(paths.dist, { recursive: true, force: true }),
    rm(paths.temp, { recursive: true, force: true }),
  ]);
  await Promise.all([
    mkdir(paths.dist, { recursive: true }),
    mkdir(paths.temp, { recursive: true }),
  ]);
}

async function compileTypes() {
  console.log("📝 Compiling TypeScript types...");

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
    outDir: paths.temp,
    noEmit: false,
  };

  const program = ts.createProgram(parsedConfig.fileNames, compilerOptions);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  if (allDiagnostics.length > 0) {
    const formatHost = {
      getCurrentDirectory: () => paths.root,
      getCanonicalFileName: (path) => path,
      getNewLine: () => ts.sys.newLine,
    };

    const messages = allDiagnostics
      .map((diagnostic) => ts.formatDiagnostic(diagnostic, formatHost))
      .join("\n");

    if (emitResult.emitSkipped) {
      throw new Error(`TypeScript compilation failed:\n${messages}`);
    }
    console.warn(`! TypeScript warnings:\n${messages}`);
  }
}

async function buildBundles() {
  console.log("📦 Creating bundles with Rollup...");
  try {
    const bundle = await rollup(rollupConfig);
    await Promise.all(
      rollupConfig.output.map((output) => bundle.write(output)),
    );
    await bundle.close();
  } catch (error) {
    console.error("❌ Error during bundling:", error);
    throw error;
  }
}

async function buildTypes() {
  console.log("🔍 Generating types with API Extractor...");

  try {
    const extractorConfig = ExtractorConfig.prepare({
      configObject: apiExtractorConfig,
      configObjectFullPath: paths.root,
      packageJsonFullPath: resolve(paths.root, "package.json"),
    });

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

    if (extractorResult.succeeded) {
      console.log("✅ API Extractor: Type generation successful");
    } else {
      throw new Error(
        `API Extractor: ${extractorResult.errorCount} error(s) and ${extractorResult.warningCount} warning(s)`,
      );
    }
  } catch (error) {
    console.error("❌ Error with API Extractor:", error);
    throw error;
  }
}

async function build() {
  try {
    console.log("🚀 Starting build...");

    await clean();
    await compileTypes();
    await buildBundles();
    await buildTypes();
    await rm(paths.temp, { recursive: true, force: true });

    console.log("✨ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build error:", error);
    process.exit(1);
  }
}

build().catch((error) => {
  console.error("❌ Build error:", error);
  process.exit(1);
});
