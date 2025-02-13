import { createHash } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { transform } from "@swc/core";
import boxen from "boxen";
import chalk from "chalk";
import { globby } from "globby";
import gradient from "gradient-string";
import ora from "ora";
import type { NyxJsOptions } from "../options/index.js";
import { loadConfig } from "../utils/index.js";

const styles = {
  info: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  highlight: chalk.cyan,
  dim: chalk.gray,
  bold: chalk.bold,
  header: gradient.mind,
  subHeader: gradient.mind,
};

interface BuildContext {
  config: NyxJsOptions;
  outDir: string;
  srcDir: string;
  cacheDir: string;
}

interface FileMetadata {
  path: string;
  type: "command" | "event" | "custom" | "other";
  hash: string;
  size: number;
  lastModified: number;
}

interface BuildMetadata {
  timestamp: number;
  files: FileMetadata[];
  buildTime: number;
  totalFiles: number;
  totalSize: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
  };
}

function logHeader(text: string): void {
  console.log(
    boxen(styles.header(text), {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
    }),
  );
}

function logSection(text: string): void {
  console.log(styles.subHeader(`\n${text}\n`));
}

function logDebug(text: string): void {
  console.log(styles.dim(`🔍 ${text}`));
}

async function calculateFileHash(filePath: string): Promise<string> {
  try {
    const fileContent = await readFile(filePath);
    return createHash("sha256").update(fileContent).digest("hex");
  } catch (error) {
    throw new Error(`Failed to calculate hash for ${filePath}:`, {
      cause: error,
    });
  }
}

async function initializeBuildContext(): Promise<BuildContext> {
  logSection("Initializing Build Context");
  const config = await loadConfig();

  const outDir = resolve(process.cwd(), config.paths?.outDir as string);
  const srcDir = resolve(process.cwd(), config.paths?.srcDir as string);
  const cacheDir = resolve(process.cwd(), config.paths?.cache as string);

  logDebug(`Source directory: ${srcDir}`);
  logDebug(`Output directory: ${outDir}`);
  logDebug(`Cache directory: ${cacheDir}`);

  try {
    await stat(srcDir);
  } catch {
    throw new Error(`Source directory ${srcDir} does not exist`);
  }

  return {
    config,
    outDir,
    srcDir,
    cacheDir,
  };
}

async function cleanDirectories(context: BuildContext): Promise<void> {
  const spinner = ora({
    text: "Cleaning directories...",
    spinner: "dots",
  }).start();

  try {
    if (context.config.build?.clean) {
      await Promise.all([
        rm(context.outDir, { recursive: true, force: true }),
        rm(context.cacheDir, { recursive: true, force: true }),
      ]);
      logDebug("Cleaned existing directories");
    }

    await Promise.all([
      mkdir(context.outDir, { recursive: true }),
      mkdir(context.cacheDir, { recursive: true }),
    ]);

    spinner.succeed(styles.success("✨ Directories prepared successfully"));
  } catch (error) {
    spinner.fail(styles.error("Failed to clean directories"));
    throw error;
  }
}

function determineFileType(
  filepath: string,
  config: NyxJsOptions,
): FileMetadata["type"] {
  const filename = filepath.toLowerCase();

  if (filename.endsWith(".command.ts") || filename.endsWith(".command.js")) {
    return "command";
  }

  if (filename.endsWith(".event.ts") || filename.endsWith(".event.js")) {
    return "event";
  }

  const customDirs = config.paths?.customDir || [];
  const isInCustomDir = Array.isArray(customDirs)
    ? customDirs.some((dir) => filepath.includes(dir))
    : filepath.includes(customDirs);

  if (isInCustomDir) {
    return "custom";
  }

  return "other";
}

async function getSourceFiles(_context: BuildContext): Promise<string[]> {
  logSection("Scanning for Source Files");

  const patterns = ["src/**/*.ts", "src/**/*.js"];
  logDebug("Search patterns:");
  for (const pattern of patterns) {
    logDebug(`- ${pattern}`);
  }

  logDebug(`Current working directory: ${process.cwd()}`);

  try {
    const files = await globby(patterns, {
      ignore: [
        "**/node_modules/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/tests/**",
      ],
      absolute: true,
      onlyFiles: true,
      expandDirectories: true,
      cwd: process.cwd(),
    });

    logDebug("\nFound files:");
    for (const file of files) {
      logDebug(`- ${file}`);
    }

    console.log(
      styles.info(`Found ${styles.bold(String(files.length))} source files`),
    );

    return files;
  } catch (error) {
    console.error("Error during file search:", error);
    throw error;
  }
}

function analyzeDependencies(code: string): Set<string> {
  const deps = new Set<string>();

  const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

  const declarations = new Set<string>();
  const declMatches = cleanCode.matchAll(
    /(?:function|const|let|var|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  );
  for (const match of declMatches) {
    declarations.add(String(match[1]));
  }

  for (const decl of declarations) {
    const regex = new RegExp(
      `\\b${decl}\\b(?=\\s*[\\(\\[\\{\\;\\,\\)\\}\\]])`,
      "g",
    );
    const usage = cleanCode.search(regex);
    if (usage !== -1 && usage < cleanCode.indexOf(decl)) {
      deps.add(decl);
    }
  }

  return deps;
}

async function processFiles(
  files: string[],
  context: BuildContext,
): Promise<void> {
  const spinner = ora({
    text: "Compiling files...",
    spinner: "dots",
  }).start();

  try {
    const filesByType = new Map<FileMetadata["type"], string[]>();

    for (const file of files) {
      const type = determineFileType(file, context.config);
      if (!filesByType.has(type)) {
        filesByType.set(type, []);
      }
      filesByType.get(type)?.push(file);
    }

    const targetDir =
      process.env.NODE_ENV === "development"
        ? context.cacheDir
        : context.outDir;

    for (const [type, typeFiles] of filesByType) {
      const compiledCode = new Map<string, string>();
      const declarations = new Map<string, string>();
      const dependencies = new Map<string, Set<string>>();

      for (const file of typeFiles) {
        const sourceCode = await readFile(file, "utf8");
        const fileName = relative(context.srcDir, file);

        const result = await transform(sourceCode, {
          filename: file,
          jsc: {
            target: "es2020",
            parser: {
              syntax: "typescript",
              tsx: file.endsWith(".tsx"),
              decorators: true,
            },
            keepClassNames: true,
            preserveAllComments: true,
          },
          ...context.config.build?.swc,
        });

        let code = result.code;

        if (type === "other") {
          code = code
            .replace(
              /import\s+?(?:(?:(?:{[^}]*}|\*(?:\s+as\s+\w+)?|\w+(?:\s+as\s+\w+)?))(?:\s*,\s*)?)*\s+from\s+['"][^'"]+['"];?\n?/g,
              "",
            )
            .replace(/export\s+/g, "");
        }

        compiledCode.set(fileName, code);

        const deps = analyzeDependencies(code);
        dependencies.set(fileName, deps);

        const declMatches = code.matchAll(
          /(?:function|const|let|var|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        );
        for (const match of declMatches) {
          declarations.set(String(match[1]), fileName);
        }
      }

      const graph = new Map<string, Set<string>>();
      for (const [fileName, deps] of dependencies) {
        const fileDeps = new Set<string>();
        for (const dep of deps) {
          const depFile = declarations.get(dep);
          if (depFile && depFile !== fileName) {
            fileDeps.add(depFile);
          }
        }
        graph.set(fileName, fileDeps);
      }

      const sorted: string[] = [];
      const visited = new Set<string>();
      const temp = new Set<string>();

      function visit(fileName: string) {
        if (temp.has(fileName)) {
          throw new Error(
            `Circular dependency detected: ${[...temp, fileName].join(" -> ")}`,
          );
        }
        if (visited.has(fileName)) {
          return;
        }

        temp.add(fileName);
        const deps = graph.get(fileName) || new Set();
        for (const dep of deps) {
          visit(dep);
        }
        temp.delete(fileName);
        visited.add(fileName);
        sorted.unshift(fileName);
      }

      for (const fileName of compiledCode.keys()) {
        if (!visited.has(fileName)) {
          visit(fileName);
        }
      }

      const compiledContents: string[] = [];
      for (const fileName of sorted) {
        const code = compiledCode.get(fileName);
        if (code) {
          compiledContents.push(`
/**
 * ==========================================
 * Source: ${fileName}
 * ==========================================
 */
${code.trim()}`);
        }
      }

      let outputFileName: string;
      let header: string;

      switch (type) {
        case "command": {
          outputFileName = "commands.js";
          header = "/* @nyxjs-commands */\n";
          break;
        }
        case "event": {
          outputFileName = "events.js";
          header = "/* @nyxjs-events */\n";
          break;
        }
        case "custom": {
          const customDir = Array.isArray(context.config.paths?.customDir)
            ? context.config.paths?.customDir[0]
            : context.config.paths?.customDir;
          outputFileName = `${customDir || "custom"}.js`;
          header = "/* @nyxjs-custom */\n";
          break;
        }
        default: {
          outputFileName = "index.js";
          header = "/* @nyxjs-core */\n";
          break;
        }
      }

      const finalContent = header + compiledContents.join("\n\n");
      const outputPath = join(targetDir, outputFileName);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, finalContent);

      logDebug(`Created ${type} file: ${outputPath}`);
    }

    spinner.succeed(
      styles.success("✨ Successfully compiled and combined files by type"),
    );
  } catch (error) {
    spinner.fail(styles.error("Compilation failed"));
    throw error;
  }
}

async function generateMetadata(
  files: string[],
  context: BuildContext,
  startTime: number,
): Promise<void> {
  const spinner = ora({
    text: "Generating metadata...",
    spinner: "dots",
  }).start();

  try {
    const filePromises = files.map(async (file) => {
      const stats = await stat(file);
      const hash = await calculateFileHash(file);
      const relativePath = relative(context.srcDir, file);
      const type = determineFileType(file, context.config);

      return {
        path: relativePath,
        type,
        hash,
        size: stats.size,
        lastModified: stats.mtimeMs,
      } as FileMetadata;
    });

    const fileMetadata = await Promise.all(filePromises);
    const totalSize = fileMetadata.reduce((acc, file) => acc + file.size, 0);

    const { heapUsed, heapTotal } = process.memoryUsage();

    const metadata: BuildMetadata = {
      timestamp: Date.now(),
      files: fileMetadata,
      buildTime: Date.now() - startTime,
      totalFiles: files.length,
      totalSize,
      memoryUsage: {
        heapUsed,
        heapTotal,
      },
    };

    await writeFile(
      join(context.cacheDir, "metadata.json"),
      JSON.stringify(metadata, null, 2),
    );

    spinner.succeed(styles.success("✨ Metadata generated successfully"));

    const filesByType = fileMetadata.reduce(
      (acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log(
      boxen(
        `Build Statistics:
• Total Files: ${styles.bold(metadata.totalFiles)}
• Commands: ${styles.bold(filesByType.command || 0)}
• Events: ${styles.bold(filesByType.event || 0)}
• Custom: ${styles.bold(filesByType.custom || 0)}
• Other: ${styles.bold(filesByType.other || 0)}
• Total Size: ${styles.bold((metadata.totalSize / 1024).toFixed(2))} KB
• Build Time: ${styles.bold((metadata.buildTime / 1000).toFixed(2))}s
• Memory Used: ${styles.bold((heapUsed / 1024 / 1024).toFixed(2))} MB`,
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
        },
      ),
    );
  } catch (error) {
    spinner.fail(styles.error("Failed to generate metadata"));
    throw error;
  }
}

export async function build(): Promise<void> {
  const startTime = Date.now();
  logHeader("🚀 Starting Build Process");

  let context: BuildContext | undefined;

  try {
    context = await initializeBuildContext();
    await cleanDirectories(context);

    const files = await getSourceFiles(context);

    if (files.length === 0) {
      console.log(styles.warning("\nNo files found to compile"));
      return;
    }

    await processFiles(files, context);
    await generateMetadata(files, context, startTime);

    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    logHeader(`✨ Build Completed Successfully in ${buildTime}s!`);
  } catch (error) {
    console.error(styles.error("\n❌ Build failed:"), error);
    process.exit(1);
  }
}
