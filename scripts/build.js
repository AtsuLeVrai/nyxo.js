import {readFileSync} from "node:fs";
import {mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {Extractor, ExtractorConfig} from "@microsoft/api-extractor";
import chokidar from "chokidar";
import {program} from "commander";
import {rollup} from "rollup";
import {defineRollupSwcOption, swc} from "rollup-plugin-swc3";
import ts from "typescript";

const paths = {
    root: process.cwd(),
    src: resolve(process.cwd(), "src"),
    dist: resolve(process.cwd(), "dist"),
    temp: resolve(process.cwd(), "temp"),
    tsconfig: resolve(process.cwd(), "tsconfig.json"),
    package: resolve(process.cwd(), "package.json"),
};

program
    .option("-w, --watch", "Watch mode - rebuild on changes")
    .option("-c, --clean", "Clean dist and temp folders before building")
    .option("--skipTypes", "Skip type generation")
    .option("-v, --verbose", "Verbose output")
    .parse(process.argv);

const options = program.opts();

function log(message, type = "info") {
    const prefix =
        {
            info: "📝",
            success: "✅",
            error: "❌",
            warning: "!",
            start: "🚀",
        }[type] || "📝";

    if (type === "error") {
        console.error(`${prefix} ${message}`);
    } else if (type === "warning") {
        console.warn(`${prefix} ${message}`);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

function getExternals() {
    const pkg = JSON.parse(readFileSync(paths.package, "utf-8").toString());
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
    apiReport: {enabled: false},
    docModel: {enabled: false},
    dtsRollup: {
        enabled: true,
        untrimmedFilePath: resolve(paths.dist, "index.d.ts"),
        omitTrimmingComments: false,
    },
    tsdocMetadata: {enabled: false},
    messages: {
        compilerMessageReporting: {default: {logLevel: "warning"}},
        extractorMessageReporting: {
            default: {logLevel: "warning"},
            "ae-missing-release-tag": {logLevel: "none"},
        },
        tsdocMessageReporting: {default: {logLevel: "warning"}},
    },
};

async function clean() {
    log("Cleaning dist and temp folders...", "start");
    try {
        await Promise.all([
            rm(paths.dist, {recursive: true, force: true}),
            rm(paths.temp, {recursive: true, force: true}),
        ]);
        await Promise.all([
            mkdir(paths.dist, {recursive: true}),
            mkdir(paths.temp, {recursive: true}),
        ]);
        log("Clean completed", "success");
    } catch (error) {
        log("Clean failed", "error");
        throw error;
    }
}

async function compileTypes() {
    log("Compiling TypeScript types...", "start");

    try {
        const configPath = ts.findConfigFile(
            paths.root,
            ts.sys.fileExists,
            "tsconfig.json",
        );

        if (!configPath) {
            throw new Error("Could not find tsconfig.json");
        }

        const {config, error} = ts.readConfigFile(configPath, ts.sys.readFile);
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
            log(`TypeScript warnings:\n${messages}`, "warning");
        }

        log("Types compilation completed", "success");
    } catch (error) {
        log("Types compilation failed", "error");
        throw error;
    }
}

async function buildBundles() {
    log("Creating bundles with Rollup...", "start");
    try {
        const bundle = await rollup(rollupConfig);
        await Promise.all(
            rollupConfig.output.map((output) => bundle.write(output)),
        );
        await bundle.close();
        log("Bundle creation completed", "success");
    } catch (error) {
        log("Bundle creation failed", "error");
        throw error;
    }
}

async function buildTypes() {
    log("Generating types with API Extractor...", "start");

    try {
        const extractorConfig = ExtractorConfig.prepare({
            configObject: apiExtractorConfig,
            configObjectFullPath: paths.root,
            packageJsonFullPath: resolve(paths.root, "package.json"),
        });

        const extractorResult = Extractor.invoke(extractorConfig, {
            localBuild: true,
            showVerboseMessages: options.verbose,
            showDiagnostics: options.verbose,
            typescriptCompilerFolder: resolve(
                paths.root,
                "node_modules",
                "typescript",
            ),
        });

        if (extractorResult.succeeded) {
            log("Type generation completed", "success");
        } else {
            throw new Error(
                `API Extractor: ${extractorResult.errorCount} error(s) and ${extractorResult.warningCount} warning(s)`,
            );
        }
    } catch (error) {
        log("Type generation failed", "error");
        throw error;
    }
}

async function cleanupTypes() {
    log("Cleaning up generated types...", "start");
    try {
        const dtsPath = resolve(paths.dist, "index.d.ts");
        const content = await readFile(dtsPath, "utf-8");

        const cleanedContent = content
            .replace(/\/\*\*\s*\*\s*\*\//g, "")
            .replace(/\*\/\s*\/\*\*/g, "*")
            .replace(/\n\s*\n\s*\n/g, "\n\n");

        await writeFile(dtsPath, cleanedContent, "utf-8");
        log("Types cleanup completed", "success");
    } catch (error) {
        log("Types cleanup failed", "error");
        throw error;
    }
}

async function build() {
    try {
        log("Starting build...", "start");

        if (options.clean) {
            await clean();
        }

        if (!options.skipTypes) {
            await compileTypes();
        }

        await buildBundles();

        if (!options.skipTypes) {
            await buildTypes();
            await cleanupTypes();
        }

        if (!options.watch) {
            await rm(paths.temp, {recursive: true, force: true});
        }

        log("Build completed successfully!", "success");
    } catch (error) {
        log(`Build failed: ${error}`, "error");
        process.exit(1);
    }
}

async function watch() {
    await build();

    log("Watching for changes...", "info");

    const watcher = chokidar.watch(paths.src, {
        ignored: /(^|[/\\])\../,
        persistent: true,
    });

    watcher.on("change", async (path) => {
        log(`File ${path} has been changed`, "info");
        await build();
    });

    process.on("SIGINT", () => {
        watcher.close();
        process.exit(0);
    });
}

if (options.watch) {
    watch().catch((error) => {
        log(`Watch error: ${error}`, "error");
        process.exit(1);
    });
} else {
    build().catch((error) => {
        log(`Build error: ${error}`, "error");
        process.exit(1);
    });
}
