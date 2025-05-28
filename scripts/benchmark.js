import { performance } from "node:perf_hooks";
import { config } from "dotenv";

// Load environment variables from .env file
const { parsed } = config({ debug: true });

/**
 * @typedef {Object} MemorySnapshot
 * @property {number} rss - Resident Set Size (total memory allocated)
 * @property {number} heapTotal - Total heap memory
 * @property {number} heapUsed - Used heap memory
 * @property {number} external - External memory usage
 * @property {number} arrayBuffers - ArrayBuffer memory usage
 * @property {number} timestamp - Timestamp when snapshot was taken
 */

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} library - Library name
 * @property {MemorySnapshot} initial - Initial memory snapshot
 * @property {MemorySnapshot} afterInit - Memory after initialization
 * @property {MemorySnapshot} afterReady - Memory after ready event
 * @property {MemorySnapshot} afterOperations - Memory after operations
 * @property {MemorySnapshot} final - Final memory snapshot
 * @property {number} initTime - Time taken for initialization (ms)
 * @property {number} readyTime - Time taken to reach ready state (ms)
 * @property {number} totalTime - Total benchmark time (ms)
 * @property {boolean} success - Whether benchmark completed successfully
 * @property {string|null} error - Error message if benchmark failed
 */

/**
 * @typedef {Object} BenchmarkConfig
 * @property {string} token - Discord bot token
 * @property {number} timeout - Timeout for operations (ms)
 * @property {number} operationCount - Number of operations to perform
 * @property {boolean} enableGc - Whether to force garbage collection
 * @property {number} warmupTime - Time to wait before measurements (ms)
 */

/**
 * Discord Libraries RAM Benchmark
 *
 * This class provides comprehensive benchmarking capabilities for various Discord.js libraries,
 * measuring memory usage patterns during initialization, connection, and common operations.
 */
class DiscordBenchmark {
  /**
   * @private
   * @type {BenchmarkConfig}
   */
  #config;

  /**
   * @private
   * @type {Map<string, Function>}
   */
  #libraryInitializers = new Map();

  /**
   * @private
   * @type {BenchmarkResult[]}
   */
  #results = [];

  /**
   * Creates a new Discord benchmark instance
   *
   * @param {Partial<BenchmarkConfig>} config - Configuration options
   */
  constructor(config = {}) {
    this.#config = {
      token: parsed?.DISCORD_TOKEN || "",
      timeout: 30000,
      operationCount: 100,
      enableGc: true,
      warmupTime: 1000,
      ...config,
    };

    if (!this.#config.token) {
      throw new Error(
        "Discord token is required. Set DISCORD_TOKEN environment variable.",
      );
    }

    this.#setupLibraryInitializers();
  }

  /**
   * Sets up initializer functions for each Discord library
   *
   * @private
   */
  #setupLibraryInitializers() {
    // Nyxo.js initializer
    this.#libraryInitializers.set("nyxo.js", async () => {
      const { Client } = await import("nyxo.js");
      const client = new Client({
        token: this.#config.token,
        intents: 513,
      });

      console.log("  ✅ Nyxo.js client created successfully");
      console.log("  🔍 Client properties:", Object.keys(client));
      console.log("  🔍 Gateway available:", Boolean(client.gateway));
      console.log("  🔍 Rest available:", Boolean(client.rest));

      return client;
    });

    // Discord.js initializer
    this.#libraryInitializers.set("discord.js", async () => {
      const { Client } = await import("discord.js");
      return new Client({
        intents: 513,
      });
    });

    // Eris initializer
    this.#libraryInitializers.set("eris", async () => {
      const Eris = await import("eris");
      const Client = Eris.default || Eris;
      return new Client(this.#config.token, {
        intents: 513,
      });
    });

    // Oceanic.js initializer
    this.#libraryInitializers.set("oceanic.js", async () => {
      const { Client } = await import("oceanic.js");
      return new Client({
        auth: `Bot ${this.#config.token}`,
        gateway: {
          intents: 513,
        },
      });
    });
  }

  /**
   * Takes a memory snapshot with additional metadata
   *
   * @private
   * @returns {MemorySnapshot} Current memory usage snapshot
   */
  #takeMemorySnapshot() {
    if (this.#config.enableGc && global.gc) {
      global.gc();
    }

    const memUsage = process.memoryUsage();
    return {
      ...memUsage,
      timestamp: Date.now(),
    };
  }

  /**
   * Formats memory usage in MB for display
   *
   * @private
   * @param {number} bytes - Memory usage in bytes
   * @returns {string} Formatted memory usage
   */
  #formatMemory(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  /**
   * Waits for a client to emit the ready event
   *
   * @private
   * @param {Object} client - Discord client instance
   * @param {string} library - Library name for event handling
   * @returns {Promise<void>} Resolves when client is ready
   */
  async #waitForReady(client, library) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Ready timeout for ${library}`));
      }, this.#config.timeout);

      const readyHandler = (ready) => {
        clearTimeout(timeout);
        console.log(`  ✅ ${library} ready event received`);
        if (ready?.user?.username) {
          console.log(`  👤 User: ${ready.user.username}`);
        }
        resolve();
      };

      // Different libraries use different ready events
      switch (library) {
        case "discord.js":
          client.once("ready", readyHandler);
          break;
        case "eris":
          client.once("ready", readyHandler);
          break;
        case "nyxo.js":
          client.once("ready", readyHandler);
          break;
        case "oceanic.js":
          client.once("ready", readyHandler);
          break;
        default:
          client.once("ready", readyHandler);
      }
    });
  }

  /**
   * Connects nyxo.js client and waits for ready event
   *
   * @private
   * @param {Object} client - Nyxo.js client instance
   * @returns {Promise<void>} Resolves when client is ready
   */
  async #connectNyxo(client) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Ready timeout for nyxo.js"));
      }, this.#config.timeout);

      const readyHandler = (ready) => {
        clearTimeout(timeout);
        console.log("  ✅ nyxo.js ready event received");
        if (ready?.user?.username) {
          console.log(`  👤 User: ${ready.user.username}`);
        }
        resolve();
      };

      // Listen for ready event BEFORE connecting
      client.once("ready", readyHandler);

      // Connect to gateway
      client.gateway.connect().catch(reject);
    });
  }

  /**
   * Performs common operations to stress test memory usage
   *
   * @private
   * @param {Object} client - Discord client instance
   * @param {string} library - Library name
   * @returns {Promise<void>} Resolves when operations complete
   */
  async #performOperations(client, library) {
    // Simulate cache operations and API calls
    for (let i = 0; i < this.#config.operationCount; i++) {
      try {
        // Create mock data structures
        const mockData = {
          id: `${i}`,
          name: `test-${i}`,
          data: new Array(100)
            .fill(i)
            .map((n) => ({ value: n, timestamp: Date.now() })),
        };

        // Simulate different operations based on library capabilities
        await this.#simulateLibraryOperations(client, library, mockData);

        // Small delay to prevent overwhelming
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      } catch (error) {
        // Continue with other operations even if some fail
        console.warn(`Operation ${i} failed for ${library}:`, error.message);
      }
    }
  }

  /**
   * Simulates library-specific operations
   *
   * @private
   * @param {Object} client - Discord client instance
   * @param {string} library - Library name
   * @param {Object} mockData - Mock data for operations
   * @returns {Promise<void>} Resolves when simulation completes
   */
  async #simulateLibraryOperations(client, library, mockData) {
    switch (library) {
      case "discord.js":
        // Simulate discord.js specific operations
        if (client.guilds?.cache) {
          const guilds = Array.from(client.guilds.cache.values());
          for (const guild of guilds) {
            const { name, id } = guild;
          }
        }
        break;

      case "eris":
        // Simulate Eris specific operations
        if (client.guilds) {
          for (const guild of Object.values(client.guilds)) {
            if (guild?.name && guild.id) {
              const { name, id } = guild;
            }
          }
        }
        break;

      case "nyxo.js": {
        // Simulate nyxo.js specific operations
        if (client.cache?.guilds) {
          for (const guild of client.cache.guilds.values()) {
            const { name, id } = guild;
          }
        }
        break;
      }

      case "oceanic.js":
        // Simulate Oceanic.js specific operations
        if (client.guilds) {
          for (const guild of client.guilds) {
            const { name, id } = guild;
          }
        }
        break;

      default:
      // No specific operations for unknown libraries
    }

    // Common operations for all libraries
    // Create temporary objects to simulate memory usage
    const tempArray = new Array(1000).fill(mockData);
    tempArray.forEach((item, index) => {
      const _processed = { ...item, processed: true, index };
    });
  }

  /**
   * Benchmarks a specific Discord library
   *
   * @private
   * @param {string} library - Library name to benchmark
   * @returns {Promise<BenchmarkResult>} Benchmark results
   */
  async #benchmarkLibrary(library) {
    console.log(`\n🔍 Benchmarking ${library}...`);

    const result = {
      library,
      initial: null,
      afterInit: null,
      afterReady: null,
      afterOperations: null,
      final: null,
      initTime: 0,
      readyTime: 0,
      totalTime: 0,
      success: false,
      error: null,
    };

    const startTime = performance.now();

    try {
      // Take initial memory snapshot
      result.initial = this.#takeMemorySnapshot();
      console.log(
        `  📊 Initial memory: ${this.#formatMemory(result.initial.heapUsed)}`,
      );

      // Initialize client
      const initStart = performance.now();
      const initializer = this.#libraryInitializers.get(library);

      if (!initializer) {
        throw new Error(`No initializer found for ${library}`);
      }

      const client = await initializer();
      result.initTime = performance.now() - initStart;

      // Memory after initialization
      result.afterInit = this.#takeMemorySnapshot();
      console.log(
        `  🚀 After init: ${this.#formatMemory(result.afterInit.heapUsed)} (+${this.#formatMemory(result.afterInit.heapUsed - result.initial.heapUsed)})`,
      );

      // Connect and wait for ready
      const readyStart = performance.now();

      if (library === "discord.js") {
        await client.login(this.#config.token);
      } else if (library === "nyxo.js") {
        // Special handling for nyxo.js - listen for ready BEFORE connecting
        await this.#connectNyxo(client);
      } else if (library === "eris" || library === "oceanic.js") {
        client.connect();
      }

      // Wait for ready event for non-nyxo libraries
      if (library !== "nyxo.js") {
        await this.#waitForReady(client, library);
      }

      result.readyTime = performance.now() - readyStart;

      // Memory after ready
      result.afterReady = this.#takeMemorySnapshot();
      console.log(
        `  ✅ After ready: ${this.#formatMemory(result.afterReady.heapUsed)} (+${this.#formatMemory(result.afterReady.heapUsed - result.afterInit.heapUsed)})`,
      );

      // Wait for warmup
      await new Promise((resolve) =>
        setTimeout(resolve, this.#config.warmupTime),
      );

      // Perform operations
      console.log(
        `  ⚙️  Performing ${this.#config.operationCount} operations...`,
      );
      await this.#performOperations(client, library);

      // Memory after operations
      result.afterOperations = this.#takeMemorySnapshot();
      console.log(
        `  🏋️  After operations: ${this.#formatMemory(result.afterOperations.heapUsed)} (+${this.#formatMemory(result.afterOperations.heapUsed - result.afterReady.heapUsed)})`,
      );

      // Cleanup
      if (library === "nyxo.js" && client.destroy) {
        await client.destroy();
      } else if (client.destroy) {
        await client.destroy();
      } else if (client.disconnect) {
        client.disconnect();
      }

      // Final memory snapshot
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for cleanup
      result.final = this.#takeMemorySnapshot();

      result.totalTime = performance.now() - startTime;
      result.success = true;

      console.log(
        `  🏁 Final memory: ${this.#formatMemory(result.final.heapUsed)}`,
      );
      console.log(`  ⏱️  Total time: ${result.totalTime.toFixed(2)}ms`);
    } catch (error) {
      result.error = error.message;
      result.totalTime = performance.now() - startTime;
      console.error(`  ❌ Error: ${error.message}`);

      // Take final snapshot even on error
      result.final = this.#takeMemorySnapshot();
    }

    return result;
  }

  /**
   * Runs benchmarks for all configured libraries
   *
   * @returns {Promise<BenchmarkResult[]>} Array of benchmark results
   */
  async runBenchmarks() {
    console.log("🚀 Starting Discord Libraries RAM Benchmark");
    console.log("📝 Configuration:");
    console.log(`   - Timeout: ${this.#config.timeout}ms`);
    console.log(`   - Operations: ${this.#config.operationCount}`);
    console.log(`   - GC Enabled: ${this.#config.enableGc}`);
    console.log(`   - Warmup Time: ${this.#config.warmupTime}ms`);

    this.#results = [];

    for (const library of this.#libraryInitializers.keys()) {
      try {
        const result = await this.#benchmarkLibrary(library);
        this.#results.push(result);

        // Wait between benchmarks to allow cleanup
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to benchmark ${library}:`, error);
        this.#results.push({
          library,
          initial: null,
          afterInit: null,
          afterReady: null,
          afterOperations: null,
          final: null,
          initTime: 0,
          readyTime: 0,
          totalTime: 0,
          success: false,
          error: error.message,
        });
      }
    }

    return this.#results;
  }

  /**
   * Generates a comprehensive report of benchmark results
   *
   * @returns {string} Formatted benchmark report
   */
  generateReport() {
    if (this.#results.length === 0) {
      return "No benchmark results available. Run benchmarks first.";
    }

    let report = "\n📊 DISCORD LIBRARIES RAM BENCHMARK REPORT\n";
    report += `${"=".repeat(50)}\n\n`;

    // Summary table
    report += "📋 SUMMARY\n";
    report += `${"-".repeat(20)}\n`;

    const successfulResults = this.#results.filter((r) => r.success);

    if (successfulResults.length === 0) {
      report += "❌ No successful benchmarks to report.\n\n";

      // Show errors
      report += "🚨 ERRORS\n";
      report += `${"-".repeat(20)}\n`;
      for (const result of this.#results) {
        if (!result.success) {
          report += `${result.library}: ${result.error}\n`;
        }
      }

      return report;
    }

    // Memory usage comparison table
    const headers = [
      "Library",
      "Initial",
      "After Init",
      "After Ready",
      "After Ops",
      "Final",
      "Peak Usage",
    ];
    const maxLengths = headers.map((h) => h.length);

    const tableData = successfulResults.map((result) => {
      const peak = Math.max(
        result.initial?.heapUsed || 0,
        result.afterInit?.heapUsed || 0,
        result.afterReady?.heapUsed || 0,
        result.afterOperations?.heapUsed || 0,
        result.final?.heapUsed || 0,
      );

      return [
        result.library,
        this.#formatMemory(result.initial?.heapUsed || 0),
        this.#formatMemory(result.afterInit?.heapUsed || 0),
        this.#formatMemory(result.afterReady?.heapUsed || 0),
        this.#formatMemory(result.afterOperations?.heapUsed || 0),
        this.#formatMemory(result.final?.heapUsed || 0),
        this.#formatMemory(peak),
      ];
    });

    // Calculate column widths
    for (const row of tableData) {
      row.forEach((cell, i) => {
        maxLengths[i] = Math.max(maxLengths[i], cell.length);
      });
    }

    // Build table
    const separator = `+${maxLengths.map((len) => "-".repeat(len + 2)).join("+")}+\n`;

    report += separator;
    report += `|${headers
      .map((header, i) => ` ${header.padEnd(maxLengths[i])} `)
      .join("|")}|\n`;
    report += separator;

    for (const row of tableData) {
      report += `|${row.map((cell, i) => ` ${cell.padEnd(maxLengths[i])} `).join("|")}|\n`;
    }
    report += separator;

    // Performance metrics
    report += "\n⏱️  PERFORMANCE METRICS\n";
    report += `${"-".repeat(25)}\n`;

    for (const result of successfulResults) {
      report += `${result.library}:\n`;
      report += `  • Initialization: ${result.initTime.toFixed(2)}ms\n`;
      report += `  • Ready Time: ${result.readyTime.toFixed(2)}ms\n`;
      report += `  • Total Time: ${result.totalTime.toFixed(2)}ms\n`;

      const memoryIncrease =
        (result.afterOperations?.heapUsed || 0) -
        (result.initial?.heapUsed || 0);
      report += `  • Memory Increase: ${this.#formatMemory(memoryIncrease)}\n\n`;
    }

    // Rankings
    report += "🏆 RANKINGS\n";
    report += `${"-".repeat(15)}\n`;

    // Memory efficiency ranking (lowest peak usage wins)
    const memoryRanking = [...successfulResults].sort((a, b) => {
      const peakA = Math.max(
        a.afterInit?.heapUsed || 0,
        a.afterReady?.heapUsed || 0,
        a.afterOperations?.heapUsed || 0,
      );
      const peakB = Math.max(
        b.afterInit?.heapUsed || 0,
        b.afterReady?.heapUsed || 0,
        b.afterOperations?.heapUsed || 0,
      );
      return peakA - peakB;
    });

    report += "Memory Efficiency (lowest peak usage):\n";
    memoryRanking.forEach((result, index) => {
      const peak = Math.max(
        result.afterInit?.heapUsed || 0,
        result.afterReady?.heapUsed || 0,
        result.afterOperations?.heapUsed || 0,
      );
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
      report += `${medal} ${index + 1}. ${result.library}: ${this.#formatMemory(peak)}\n`;
    });

    // Speed ranking (fastest total time wins)
    const speedRanking = [...successfulResults].sort(
      (a, b) => a.totalTime - b.totalTime,
    );

    report += "\nSpeed (fastest total time):\n";
    speedRanking.forEach((result, index) => {
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
      report += `${medal} ${index + 1}. ${result.library}: ${result.totalTime.toFixed(2)}ms\n`;
    });

    // Failed benchmarks
    const failedResults = this.#results.filter((r) => !r.success);
    if (failedResults.length > 0) {
      report += "\n❌ FAILED BENCHMARKS\n";
      report += `${"-".repeat(20)}\n`;

      for (const result of failedResults) {
        report += `${result.library}: ${result.error}\n`;
      }
    }

    report += `\n${"=".repeat(50)}\n`;
    report += `📊 Benchmark completed at ${new Date().toISOString()}\n`;

    return report;
  }

  /**
   * Exports benchmark results to JSON format
   *
   * @returns {Object} JSON-serializable benchmark data
   */
  exportResults() {
    return {
      timestamp: new Date().toISOString(),
      config: this.#config,
      results: this.#results,
      summary: {
        totalLibraries: this.#results.length,
        successfulBenchmarks: this.#results.filter((r) => r.success).length,
        failedBenchmarks: this.#results.filter((r) => !r.success).length,
      },
    };
  }
}

/**
 * Main execution function
 *
 * @returns {Promise<void>} Resolves when benchmark completes
 */
async function main() {
  try {
    // Enable garbage collection for more accurate memory measurements
    if (global.gc) {
      console.log("✅ Garbage collection enabled");
    } else {
      console.log(
        "⚠️  Garbage collection not available. Run with --expose-gc for better accuracy.",
      );
    }

    // Create benchmark instance
    const benchmark = new DiscordBenchmark({
      timeout: 60000, // Increased timeout for nyxo.js
      operationCount: 50,
      enableGc: true,
      warmupTime: 2000,
    });

    // Run benchmarks
    const _results = await benchmark.runBenchmarks();

    // Generate and display report
    const report = benchmark.generateReport();
    console.log(report);

    // Export results to JSON file
    const exportData = benchmark.exportResults();
    const fs = await import("node:fs/promises");
    const filename = `discord-benchmark-${Date.now()}.json`;

    await fs.writeFile(filename, JSON.stringify(exportData, null, 2));
    console.log(`📄 Results exported to ${filename}`);
  } catch (error) {
    console.error("💥 Benchmark failed:", error);
    process.exit(1);
  }
}

// Run if called directly
main().catch(console.error);
