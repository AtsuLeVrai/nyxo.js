#!/usr/bin/env node

import { access, copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { glob } from "glob";

/**
 * Library configurations for different native dependencies
 */
const LIBRARY_CONFIGS = {
  zstd: {
    name: "Zstandard",
    pathMapping: {
      "deps/zstd/": "libs/zstd/",
    },
    additionalPatterns: ["libs/zstd/lib/**/*.h", "libs/zstd/lib/**/*.hpp"],
    outputPrefix: "zstd",
  },

  zlib: {
    name: "zlib",
    pathMapping: {
      "deps/zlib/": "libs/zlib/",
    },
    additionalPatterns: ["libs/zlib/**/*.h", "libs/zlib/**/*.hpp"],
    outputPrefix: "zlib",
  },

  opus: {
    name: "Opus",
    pathMapping: {
      "deps/opus/": "libs/opus/",
    },
    additionalPatterns: [
      "libs/opus/include/**/*.h",
      "libs/opus/src/**/*.h",
      "libs/opus/celt/**/*.h",
      "libs/opus/silk/**/*.h",
      "libs/opus/**/*.hpp",
    ],
    outputPrefix: "opus",
    autoDetectIncludes: true,
  },
};

/**
 * Base configuration for the native dependency extraction
 */
const BASE_CONFIG = {
  // Root directory of the monorepo (where libs/ folder is located)
  monoRepoRoot: resolve(process.cwd(), "../../"),

  // Source libs directory (where native sources are located)
  libsDir: resolve(process.cwd(), "../../libs"),

  // Output directory for the extracted files (relative to script)
  outputDir: resolve(process.cwd(), "./deps"),

  // binding.gyp file location
  bindingGypPath: resolve(process.cwd(), "./binding.gyp"),

  // Files to exclude (tests, examples, etc.)
  excludePatterns: [
    "**/test/**",
    "**/tests/**",
    "**/example/**",
    "**/examples/**",
    "**/benchmark/**",
    "**/doc/**",
    "**/docs/**",
    "**/build/**",
    "**/cmake/**",
    "**/.git/**",
    "**/win32/**",
    "**/msvc/**",
  ],
};

/**
 * Parses command line arguments
 * @returns {Object} - Parsed arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const parsed = {
    library: "zstd", // default
    help: false,
    verbose: false,
    clean: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--library":
      case "--lib":
      case "-l":
        if (i + 1 < args.length) {
          parsed.library = args[++i];
        }
        break;

      case "--help":
      case "-h":
        parsed.help = true;
        break;

      case "--verbose":
      case "-v":
        parsed.verbose = true;
        break;

      case "--clean":
      case "-c":
        parsed.clean = true;
        break;

      default:
        // Support --library=zstd format
        if (arg.startsWith("--library=")) {
          parsed.library = arg.split("=")[1];
        } else if (arg.startsWith("--lib=")) {
          parsed.library = arg.split("=")[1];
        }
        break;
    }
  }

  return parsed;
}

/**
 * Displays help information
 */
function showHelp() {
  console.log(`
📦 Native Dependencies Extractor

USAGE:
  node extract-native-deps.js [OPTIONS]

OPTIONS:
  --library, --lib, -l <name>    Library to extract (default: zstd)
  --clean, -c                    Clean output directory before extraction
  --verbose, -v                  Verbose output
  --help, -h                     Show this help

SUPPORTED LIBRARIES:
${Object.entries(LIBRARY_CONFIGS)
  .map(([key, config]) => `  ${key.padEnd(8)} - ${config.name}`)
  .join("\n")}

EXAMPLES:
  node extract-native-deps.js --library zstd
  node extract-native-deps.js --lib opus --clean
  node extract-native-deps.js -l zlib -v
`);
}

/**
 * Creates a merged configuration for the specified library
 * @param {string} libraryName - Name of the library
 * @returns {Object} - Merged configuration
 */
function createConfig(libraryName) {
  const libConfig = LIBRARY_CONFIGS[libraryName];
  if (!libConfig) {
    throw new Error(
      `Unsupported library: ${libraryName}. Supported: ${Object.keys(LIBRARY_CONFIGS).join(", ")}`,
    );
  }

  return {
    ...BASE_CONFIG,
    ...libConfig,
    libraryName,
  };
}

/**
 * Checks if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} - True if file exists
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Maps deps/ paths to actual libs/ paths for source lookup
 * @param {string} depsPath - Path starting with deps/
 * @param {Object} config - Configuration object
 * @returns {string} - Mapped path to libs/
 */
function mapDepsToLibsPath(depsPath, config) {
  for (const [depsPrefix, libsPrefix] of Object.entries(config.pathMapping)) {
    if (depsPath.startsWith(depsPrefix)) {
      return depsPath.replace(depsPrefix, libsPrefix);
    }
  }
  return depsPath;
}

/**
 * Converts any path to a clean relative path from the library root
 * @param {string} filePath - Input file path (could start with deps/, libs/, or be relative)
 * @param {Object} config - Configuration object
 * @returns {string} - Clean path relative to library/...
 */
function normalizeToLibraryPath(filePath, config) {
  // Normalize path separators to forward slashes
  const normalizedPath = filePath.replace(/\\/g, "/");

  // Remove any leading deps/lib/ or libs/lib/ to get just the internal structure
  let cleanPath = normalizedPath;

  for (const [depsPrefix, libsPrefix] of Object.entries(config.pathMapping)) {
    cleanPath = cleanPath
      .replace(new RegExp(`^${depsPrefix.replace("/", "\\/")}`), "")
      .replace(new RegExp(`^${libsPrefix.replace("/", "\\/")}`), "");
  }

  return `${config.outputPrefix}/${cleanPath}`;
}

/**
 * Parses the binding.gyp file to extract source files and include directories
 * @param {string} bindingGypPath - Path to binding.gyp file
 * @param {Object} config - Configuration object
 * @returns {Promise<{sources: string[], includeDirs: string[]}>} - Parsed configuration
 */
async function parseBindingGyp(bindingGypPath, _config) {
  try {
    const content = await readFile(bindingGypPath, "utf-8");
    const gyp = JSON.parse(content);

    const sources = [];
    const includeDirs = [];

    // Extract from all targets
    for (const target of gyp.targets || []) {
      // Add source files that start with deps/
      if (target.sources) {
        for (const src of target.sources) {
          if (src.startsWith("deps/")) {
            sources.push(src);
          }
        }
      }

      // Add include directories that start with deps/
      if (target.include_dirs) {
        for (const dir of target.include_dirs) {
          if (dir.startsWith("deps/")) {
            includeDirs.push(dir);
          }
        }
      }
    }

    return {
      sources: [...new Set(sources)], // Remove duplicates
      includeDirs: [...new Set(includeDirs)],
    };
  } catch (error) {
    throw new Error(`Failed to parse binding.gyp: ${error.message}`);
  }
}

/**
 * Finds all header files in the specified directories
 * @param {string[]} includeDirs - Array of include directories
 * @param {Object} config - Configuration object
 * @param {boolean} verbose - Verbose output
 * @returns {Promise<string[]>} - Array of header file paths
 */
async function findHeaderFiles(includeDirs, config, verbose = false) {
  const headerFiles = [];

  for (const dir of includeDirs) {
    const mappedDir = mapDepsToLibsPath(dir, config);
    const fullDir = join(config.monoRepoRoot, mappedDir);

    if (verbose) {
      console.log(`🔍 Scanning: ${mappedDir}`);
    }

    if (await fileExists(fullDir)) {
      try {
        const pattern = join(fullDir, "**/*.{h,hpp,hxx}");
        const files = await glob(pattern, {
          ignore: config.excludePatterns.map((p) => join(fullDir, p)),
        });

        const relativePaths = [];
        for (const file of files) {
          const libsRelative = relative(config.monoRepoRoot, file);
          relativePaths.push(normalizeToLibraryPath(libsRelative, config));
        }

        headerFiles.push(...relativePaths);

        if (verbose) {
          console.log(`   Found ${relativePaths.length} headers`);
        }
      } catch (error) {
        console.warn(
          `Warning: Could not scan directory ${dir}: ${error.message}`,
        );
      }
    } else if (verbose) {
      console.log(`   Directory not found: ${fullDir}`);
    }
  }

  return [...new Set(headerFiles)]; // Remove duplicates
}

/**
 * Finds additional files based on patterns
 * @param {string[]} patterns - Glob patterns to search for
 * @param {Object} config - Configuration object
 * @param {boolean} verbose - Verbose output
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findAdditionalFiles(patterns, config, verbose = false) {
  const additionalFiles = [];

  for (const pattern of patterns) {
    if (verbose) {
      console.log(`🔍 Pattern: ${pattern}`);
    }

    try {
      const files = await glob(pattern, {
        cwd: config.monoRepoRoot,
        ignore: config.excludePatterns,
      });

      const normalizedFiles = [];
      for (const file of files) {
        normalizedFiles.push(normalizeToLibraryPath(file, config));
      }
      additionalFiles.push(...normalizedFiles);

      if (verbose) {
        console.log(`   Found ${normalizedFiles.length} files`);
      }
    } catch (error) {
      console.warn(`Warning: Pattern ${pattern} failed: ${error.message}`);
    }
  }

  return [...new Set(additionalFiles)]; // Remove duplicates
}

/**
 * Copies a file from source to destination, creating directories as needed
 * @param {string} srcPath - Source file path
 * @param {string} destPath - Destination file path
 * @param {Object} config - Configuration object
 * @param {boolean} verbose - Verbose output
 */
async function copyFileWithDirs(srcPath, destPath, config, verbose = false) {
  const destDir = dirname(destPath);

  try {
    await mkdir(destDir, { recursive: true });
    await copyFile(srcPath, destPath);

    if (verbose) {
      console.log(
        `✓ Copied: ${relative(config.monoRepoRoot, srcPath)} -> ${relative(process.cwd(), destPath)}`,
      );
    } else {
      console.log(`✓ ${relative(config.monoRepoRoot, srcPath)}`);
    }
  } catch (error) {
    console.error(
      `✗ Failed to copy ${relative(config.monoRepoRoot, srcPath)}: ${error.message}`,
    );
    throw error;
  }
}

/**
 * Copies all required files to the output directory
 * @param {string[]} filePaths - Array of normalized file paths
 * @param {Object} config - Configuration object
 * @param {boolean} verbose - Verbose output
 */
async function copyFiles(filePaths, config, verbose = false) {
  console.log(
    `\n📦 Copying ${filePaths.length} files to ${relative(process.cwd(), config.outputDir)}...`,
  );

  let copied = 0;
  let skipped = 0;

  for (const filePath of filePaths) {
    // Convert normalized path back to source path for lookup
    const libsSourcePath = filePath.replace(
      new RegExp(`^${config.outputPrefix}/`),
      `libs/${config.libraryName}/`,
    );
    const srcPath = join(config.monoRepoRoot, libsSourcePath);

    const destPath = join(config.outputDir, filePath);

    if (await fileExists(srcPath)) {
      await copyFileWithDirs(srcPath, destPath, config, verbose);
      copied++;
    } else {
      console.warn(
        `⚠ Source file not found: ${libsSourcePath} (normalized from ${filePath})`,
      );
      skipped++;
    }
  }

  console.log(`\n📊 Summary: ${copied} copied, ${skipped} skipped`);
}

/**
 * Cleans the output directory
 * @param {string} outputDir - Output directory to clean
 */
async function cleanOutputDir(outputDir) {
  try {
    const { rm } = await import("node:fs/promises");
    await rm(outputDir, { recursive: true, force: true });
    console.log(
      `🧹 Cleaned output directory: ${relative(process.cwd(), outputDir)}`,
    );
  } catch (error) {
    console.warn(`Warning: Could not clean output directory: ${error.message}`);
  }
}

/**
 * Auto-detects directories containing header files for include_dirs
 * @param {Object} config - Configuration object
 * @returns {Promise<string[]>} - Array of directories containing headers
 */
async function autoDetectIncludeDirs(config) {
  const includeDirs = new Set();

  try {
    const pattern = `libs/${config.libraryName}/**/*.h`;
    const headerFiles = await glob(pattern, {
      cwd: config.monoRepoRoot,
      ignore: config.excludePatterns,
    });

    // Extract unique directories containing headers
    for (const file of headerFiles) {
      const dir = dirname(file);
      const depsPath = dir.replace(
        `libs/${config.libraryName}`,
        `deps/${config.libraryName}`,
      );
      includeDirs.add(depsPath);
    }

    return Array.from(includeDirs).sort();
  } catch (error) {
    console.warn(
      `Warning: Could not auto-detect include dirs: ${error.message}`,
    );
    return [];
  }
}

/**
 * Generates binding.gyp suggestions for include directories
 * @param {string[]} includeDirs - Detected include directories
 * @param {Object} config - Configuration object
 */
function generateBindingGypSuggestions(includeDirs, config) {
  console.log(`\n💡 Binding.gyp suggestions for ${config.name}:`);
  console.log("Add these directories to your include_dirs:");
  console.log("```json");
  console.log('"include_dirs": [');
  console.log('  "<!@(node -p \\"require(\'node-addon-api\').include\\")",');

  for (const dir of includeDirs) {
    console.log(`  "${dir}",`);
  }

  console.log("]");
  console.log("```\n");
}

/**
 * Main extraction function
 * @param {Object} args - Parsed command line arguments
 */
async function extractNativeDeps(args) {
  const config = createConfig(args.library);

  console.log(`🚀 Starting native dependency extraction for ${config.name}...`);
  console.log(`📁 Monorepo root: ${config.monoRepoRoot}`);
  console.log(`📚 Libs directory: ${config.libsDir}`);
  console.log(`📦 Output directory: ${config.outputDir}`);

  try {
    // Clean output directory if requested
    if (args.clean) {
      await cleanOutputDir(config.outputDir);
    }

    // Parse binding.gyp
    console.log("\n📖 Parsing binding.gyp...");
    const { sources, includeDirs } = await parseBindingGyp(
      config.bindingGypPath,
      config,
    );
    console.log(
      `Found ${sources.length} source files and ${includeDirs.length} include directories`,
    );

    // Normalize source files to library/... structure
    const normalizedSources = [];
    for (const src of sources) {
      normalizedSources.push(normalizeToLibraryPath(src, config));
    }

    // Find header files
    console.log("\n🔍 Finding header files...");
    const headers = await findHeaderFiles(includeDirs, config, args.verbose);
    console.log(`Found ${headers.length} header files`);

    // Find additional files
    console.log("\n🔍 Finding additional files...");
    const additional = await findAdditionalFiles(
      config.additionalPatterns,
      config,
      args.verbose,
    );
    console.log(`Found ${additional.length} additional files`);

    // Combine all files
    const allFiles = [...normalizedSources, ...headers, ...additional];
    const uniqueFiles = [...new Set(allFiles)];

    console.log(`\n📊 Total unique files to copy: ${uniqueFiles.length}`);
    console.log(
      `📍 All files will be copied to deps/${config.outputPrefix}/... structure`,
    );

    // Create output directory
    await mkdir(config.outputDir, { recursive: true });

    // Copy files
    await copyFiles(uniqueFiles, config, args.verbose);

    // Auto-detect include directories if enabled
    if (config.autoDetectIncludes) {
      console.log("\n🔍 Auto-detecting include directories...");
      const detectedIncludes = await autoDetectIncludeDirs(config);
      generateBindingGypSuggestions(detectedIncludes, config);
    }

    console.log(
      `\n✅ ${config.name} dependency extraction completed successfully!`,
    );
    console.log("\n📁 Final structure:");
    console.log("deps/");
    console.log(`└── ${config.outputPrefix}/`);

    // Show file distribution
    const sourcesByDir = {};
    for (const src of normalizedSources) {
      const dir = dirname(src).split("/").slice(1).join("/") || "root";
      sourcesByDir[dir] = (sourcesByDir[dir] || 0) + 1;
    }

    for (const [dir, count] of Object.entries(sourcesByDir)) {
      console.log(`    ├── ${dir}/ (${count} files)`);
    }
  } catch (error) {
    console.error(`\n❌ Extraction failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = parseArguments();

  if (args.help) {
    showHelp();
    return;
  }

  await extractNativeDeps(args);
}

// Run if this script is executed directly
main().catch((error) => {
  console.error(`💥 Fatal error: ${error.message}`);
  process.exit(1);
});

export { extractNativeDeps, parseArguments, createConfig, LIBRARY_CONFIGS };
