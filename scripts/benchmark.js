import { performance } from "node:perf_hooks";
import { config } from "dotenv";
import prettyBytes from "pretty-bytes";

const { parsed } = config({ debug: false });

class DiscordBenchmark {
  #config;
  #libraryInitializers = new Map();
  #results = [];

  constructor(config = {}) {
    this.#config = {
      token: parsed?.DISCORD_TOKEN || "",
      timeout: 120000,
      operationCount: 100,
      enableGc: true,
      warmupTime: 5000,
      cooldownTime: 10000,
      gcCycles: 5,
      memoryStabilizationTime: 3000,
      rateLimitDelay: { min: 5000, max: 10000 },
      ...config,
    };

    if (!this.#config.token) {
      throw new Error(
        "Discord token is required. Set DISCORD_TOKEN environment variable.",
      );
    }

    this.#setupLibraryInitializers();
  }

  #setupLibraryInitializers() {
    this.#libraryInitializers.set("nyxo.js", async () => {
      const { Client } = await import("nyxo.js");
      return new Client({
        token: this.#config.token,
        intents: 513,
      });
    });

    this.#libraryInitializers.set("discord.js", async () => {
      const { Client } = await import("discord.js");
      return new Client({
        intents: 513,
      });
    });

    this.#libraryInitializers.set("eris", async () => {
      const Eris = await import("eris");
      const Client = Eris.default || Eris;
      return new Client(this.#config.token, {
        intents: 513,
      });
    });

    this.#libraryInitializers.set("oceanic.js", async () => {
      const { Client } = await import("oceanic.js");
      return new Client({
        auth: `Bot ${this.#config.token}`,
        gateway: { intents: 513 },
      });
    });
  }

  async #forceGarbageCollection() {
    if (!(this.#config.enableGc && global.gc)) {
      return;
    }

    for (let i = 0; i < this.#config.gcCycles; i++) {
      global.gc();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    await new Promise((resolve) =>
      setTimeout(resolve, this.#config.memoryStabilizationTime),
    );
  }

  #takeMemorySnapshot() {
    const memUsage = process.memoryUsage();
    return {
      ...memUsage,
      timestamp: Date.now(),
    };
  }

  #getRandomDelay() {
    const { min, max } = this.#config.rateLimitDelay;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async #waitForReady(client, library) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Ready timeout for ${library}`));
      }, this.#config.timeout);

      const readyHandler = () => {
        clearTimeout(timeout);
        resolve();
      };

      client.once("ready", readyHandler);
    });
  }

  async #connectClient(client, library) {
    const delay = this.#getRandomDelay();
    await new Promise((resolve) => setTimeout(resolve, delay));

    switch (library) {
      case "discord.js":
        await client.login(this.#config.token);
        break;
      case "nyxo.js":
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Ready timeout for nyxo.js"));
          }, this.#config.timeout);

          const readyHandler = () => {
            clearTimeout(timeout);
            resolve();
          };

          client.once("ready", readyHandler);
          client.gateway.connect().catch(reject);
        });
      case "eris":
      case "oceanic.js":
        client.connect();
        break;
      default:
        client.connect();
    }

    if (library !== "nyxo.js") {
      await this.#waitForReady(client, library);
    }
  }

  async #performRealisticOperations(client, library) {
    const operations = [];

    for (let i = 0; i < this.#config.operationCount; i++) {
      try {
        const mockData = this.#generateMockData(i);

        await this.#simulateLibraryOperations(client, library, mockData);

        const memoryPressure = this.#createMemoryPressure();
        operations.push(memoryPressure);

        if (i % 20 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          if (operations.length > 50) {
            operations.splice(0, 25);
          }
        }
      } catch (_error) {}
    }

    operations.length = 0;
  }

  #generateMockData(index) {
    return {
      id: `${index}`,
      name: `test-object-${index}`,
      timestamp: Date.now(),
      data: new Array(200).fill(0).map((_, i) => ({
        value: index + i,
        nested: {
          property: `nested-${i}`,
          array: new Array(10).fill(index),
          timestamp: Date.now(),
        },
      })),
      largeString: "x".repeat(1000),
      buffer: Buffer.alloc(500, index % 256),
    };
  }

  #createMemoryPressure() {
    return {
      arrays: new Array(100)
        .fill(0)
        .map(() => new Array(50).fill(Math.random())),
      objects: new Array(50).fill(0).map((_, i) => ({
        id: i,
        data: new Array(20).fill(0).map(() => ({ value: Math.random() })),
      })),
      strings: new Array(20)
        .fill(0)
        .map(() => Math.random().toString(36).repeat(100)),
    };
  }

  async #simulateLibraryOperations(client, library, mockData) {
    const operations = {
      "discord.js": () => {
        if (client.guilds?.cache) {
          const guilds = Array.from(client.guilds.cache.values());
          const _processed = guilds.map((guild) => ({
            name: guild.name,
            id: guild.id,
            memberCount: guild.memberCount,
            channels: guild.channels?.cache?.size || 0,
          }));

          if (client.channels?.cache) {
            const channels = Array.from(client.channels.cache.values());
            for (const channel of channels) {
              if (channel.name && channel.id) {
                ({ name: channel.name, id: channel.id, type: channel.type });
              }
            }
          }
        }
      },
      eris: () => {
        if (client.guilds) {
          const _processed = Object.values(client.guilds).map((guild) => ({
            name: guild?.name,
            id: guild?.id,
            memberCount: guild?.memberCount,
            channels: Object.keys(guild?.channels || {}).length,
          }));
        }
      },
      "nyxo.js": () => {
        if (client.cache?.guilds) {
          const _processed = client.cache.guilds.map((guild) => ({
            name: guild.name,
            id: guild.id,
            memberCount: guild.memberCount,
          }));
        }
      },
      "oceanic.js": () => {
        if (client.guilds) {
          const _processed = Array.from(client.guilds.values()).map(
            (guild) => ({
              name: guild.name,
              id: guild.id,
              memberCount: guild.memberCount,
            }),
          );
        }
      },
    };

    operations[library]?.();

    const tempArrays = [
      new Array(500).fill(mockData),
      new Array(300).fill(0).map((_, i) => ({ ...mockData, index: i })),
      new Array(200).fill(0).map(() => JSON.parse(JSON.stringify(mockData))),
    ];

    for (const arr of tempArrays) {
      arr.forEach((item, index) => {
        const _processed = {
          ...item,
          processed: true,
          index,
          timestamp: Date.now(),
          hash: this.#simpleHash(JSON.stringify(item)),
        };
      });
    }

    tempArrays.length = 0;
  }

  #simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return hash;
  }

  async #forceCleanupClient(client, library) {
    try {
      const cleanupMethods = {
        "nyxo.js": async () => {
          if (client.destroy) {
            await client.destroy();
          }
          if (client.gateway?.disconnect) {
            await client.gateway.disconnect();
          }
        },
        "discord.js": async () => {
          if (client.destroy) {
            await client.destroy();
          }
          if (client.ws?.destroy) {
            client.ws.destroy();
          }
        },
        eris: async () => {
          if (client.disconnect) {
            client.disconnect({ reconnect: false });
          }
          if (client.shards) {
            for (const shard of client.shards) {
              if (shard.disconnect) {
                shard.disconnect({ reconnect: false });
              }
            }
          }
        },
        "oceanic.js": async () => {
          if (client.disconnect) {
            await client.disconnect();
          }
          if (client.rest?.destroy) {
            client.rest.destroy();
          }
        },
      };

      const cleanup = cleanupMethods[library];
      if (cleanup) {
        await cleanup();
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (client.removeAllListeners) {
        client.removeAllListeners();
      }

      for (const key of Object.keys(client)) {
        try {
          if (client[key] && typeof client[key] === "object") {
            client[key] = null;
          }
        } catch (_e) {}
      }
    } catch (error) {
      console.warn(`Cleanup warning for ${library}: ${error.message}`);
    }
  }

  async #benchmarkLibrary(library) {
    console.log(`\nBenchmarking ${library}...`);

    const result = {
      library,
      baseline: null,
      afterInit: null,
      afterReady: null,
      afterOperations: null,
      afterCleanup: null,
      initTime: 0,
      readyTime: 0,
      operationsTime: 0,
      cleanupTime: 0,
      totalTime: 0,
      peakMemory: 0,
      memoryLeak: 0,
      success: false,
      error: null,
    };

    const startTime = performance.now();
    let client = null;

    try {
      await this.#forceGarbageCollection();
      result.baseline = this.#takeMemorySnapshot();

      const initStart = performance.now();
      const initializer = this.#libraryInitializers.get(library);
      if (!initializer) {
        throw new Error(`No initializer found for ${library}`);
      }

      client = await initializer();
      result.initTime = performance.now() - initStart;
      result.afterInit = this.#takeMemorySnapshot();

      const readyStart = performance.now();
      await this.#connectClient(client, library);
      result.readyTime = performance.now() - readyStart;
      result.afterReady = this.#takeMemorySnapshot();

      await new Promise((resolve) =>
        setTimeout(resolve, this.#config.warmupTime),
      );

      const operationsStart = performance.now();
      await this.#performRealisticOperations(client, library);
      result.operationsTime = performance.now() - operationsStart;
      result.afterOperations = this.#takeMemorySnapshot();

      const cleanupStart = performance.now();
      await this.#forceCleanupClient(client, library);
      result.cleanupTime = performance.now() - cleanupStart;

      client = null;

      await this.#forceGarbageCollection();
      result.afterCleanup = this.#takeMemorySnapshot();

      result.totalTime = performance.now() - startTime;
      result.peakMemory = Math.max(
        result.afterInit?.heapUsed || 0,
        result.afterReady?.heapUsed || 0,
        result.afterOperations?.heapUsed || 0,
      );
      result.memoryLeak =
        (result.afterCleanup?.heapUsed || 0) - (result.baseline?.heapUsed || 0);
      result.success = true;

      console.log(
        `${library} completed: ${result.totalTime.toFixed(2)}ms, Peak: ${prettyBytes(result.peakMemory)}, Leak: ${prettyBytes(result.memoryLeak)}`,
      );
    } catch (error) {
      result.error = error.message;
      result.totalTime = performance.now() - startTime;
      console.error(`${library} failed: ${error.message}`);

      if (client) {
        try {
          await this.#forceCleanupClient(client, library);
        } catch (_cleanupError) {}
      }

      await this.#forceGarbageCollection();
      result.afterCleanup = this.#takeMemorySnapshot();
    }

    return result;
  }

  async runBenchmarks() {
    console.log("Starting Discord Libraries Benchmark");
    console.log(
      `Configuration: ${this.#config.operationCount} operations, ${this.#config.timeout}ms timeout`,
    );

    this.#results = [];

    for (const library of this.#libraryInitializers.keys()) {
      try {
        const result = await this.#benchmarkLibrary(library);
        this.#results.push(result);

        console.log(`Cooling down for ${this.#config.cooldownTime / 1000}s...`);
        await new Promise((resolve) =>
          setTimeout(resolve, this.#config.cooldownTime),
        );
      } catch (error) {
        console.error(`Critical failure for ${library}: ${error.message}`);
        this.#results.push({
          library,
          baseline: null,
          afterInit: null,
          afterReady: null,
          afterOperations: null,
          afterCleanup: null,
          initTime: 0,
          readyTime: 0,
          operationsTime: 0,
          cleanupTime: 0,
          totalTime: 0,
          peakMemory: 0,
          memoryLeak: 0,
          success: false,
          error: error.message,
        });
      }
    }

    return this.#results;
  }

  generateReport() {
    if (this.#results.length === 0) {
      return "No benchmark results available.";
    }

    let report = "\nDISCORD LIBRARIES BENCHMARK REPORT\n";
    report += `${"=".repeat(60)}\n\n`;

    const successfulResults = this.#results.filter((r) => r.success);

    if (successfulResults.length === 0) {
      report += "No successful benchmarks.\n\n";
      report += "ERRORS:\n";
      for (const result of this.#results) {
        if (!result.success) {
          report += `${result.library}: ${result.error}\n`;
        }
      }
      return report;
    }

    report += "MEMORY USAGE SUMMARY\n";
    report += `${"-".repeat(30)}\n`;

    const headers = [
      "Library",
      "Baseline",
      "After Init",
      "After Ready",
      "After Ops",
      "After Cleanup",
      "Peak",
      "Leak",
    ];
    const maxLengths = headers.map((h) => h.length);

    const tableData = successfulResults.map((result) => [
      result.library,
      prettyBytes(result.baseline?.heapUsed || 0),
      prettyBytes(result.afterInit?.heapUsed || 0),
      prettyBytes(result.afterReady?.heapUsed || 0),
      prettyBytes(result.afterOperations?.heapUsed || 0),
      prettyBytes(result.afterCleanup?.heapUsed || 0),
      prettyBytes(result.peakMemory),
      prettyBytes(result.memoryLeak),
    ]);

    for (const row of tableData) {
      row.forEach((cell, i) => {
        maxLengths[i] = Math.max(maxLengths[i], cell.length);
      });
    }

    const separator = `+${maxLengths.map((len) => "-".repeat(len + 2)).join("+")}+\n`;
    report += separator;
    report += `|${headers.map((header, i) => ` ${header.padEnd(maxLengths[i])} `).join("|")}|\n`;
    report += separator;

    for (const row of tableData) {
      report += `|${row.map((cell, i) => ` ${cell.padEnd(maxLengths[i])} `).join("|")}|\n`;
    }
    report += separator;

    report += "\nPERFORMANCE METRICS\n";
    report += `${"-".repeat(25)}\n`;

    for (const result of successfulResults) {
      report += `${result.library}:\n`;
      report += `  Initialization: ${result.initTime.toFixed(2)}ms\n`;
      report += `  Ready Time: ${result.readyTime.toFixed(2)}ms\n`;
      report += `  Operations: ${result.operationsTime.toFixed(2)}ms\n`;
      report += `  Cleanup: ${result.cleanupTime.toFixed(2)}ms\n`;
      report += `  Total: ${result.totalTime.toFixed(2)}ms\n`;
      report += `  Memory Efficiency: ${(result.peakMemory / (1024 * 1024)).toFixed(2)}MB peak\n\n`;
    }

    const memoryRanking = [...successfulResults].sort(
      (a, b) => a.peakMemory - b.peakMemory,
    );
    const speedRanking = [...successfulResults].sort(
      (a, b) => a.totalTime - b.totalTime,
    );
    const leakRanking = [...successfulResults].sort(
      (a, b) => a.memoryLeak - b.memoryLeak,
    );

    report += "RANKINGS\n";
    report += `${"-".repeat(15)}\n`;

    report += "Memory Efficiency (lowest peak usage):\n";
    memoryRanking.forEach((result, index) => {
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
      report += `${medal} ${index + 1}. ${result.library}: ${prettyBytes(result.peakMemory)}\n`;
    });

    report += "\nSpeed (fastest total time):\n";
    speedRanking.forEach((result, index) => {
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
      report += `${medal} ${index + 1}. ${result.library}: ${result.totalTime.toFixed(2)}ms\n`;
    });

    report += "\nMemory Leak Resistance (smallest leak):\n";
    leakRanking.forEach((result, index) => {
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
      report += `${medal} ${index + 1}. ${result.library}: ${prettyBytes(result.memoryLeak)}\n`;
    });

    const failedResults = this.#results.filter((r) => !r.success);
    if (failedResults.length > 0) {
      report += "\nFAILED BENCHMARKS\n";
      report += `${"-".repeat(20)}\n`;
      for (const result of failedResults) {
        report += `${result.library}: ${result.error}\n`;
      }
    }

    report += `\n${"=".repeat(60)}\n`;
    report += `Benchmark completed: ${new Date().toISOString()}\n`;

    return report;
  }

  exportResults() {
    return {
      timestamp: new Date().toISOString(),
      config: this.#config,
      results: this.#results,
      summary: {
        totalLibraries: this.#results.length,
        successfulBenchmarks: this.#results.filter((r) => r.success).length,
        failedBenchmarks: this.#results.filter((r) => !r.success).length,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }
}

async function main() {
  try {
    if (!global.gc) {
      console.log(
        "WARNING: Garbage collection not available. Run with --expose-gc for accurate results.",
      );
    }

    const benchmark = new DiscordBenchmark({
      timeout: 180000,
      operationCount: 150,
      enableGc: true,
      warmupTime: 5000,
      cooldownTime: 15000,
      gcCycles: 7,
      memoryStabilizationTime: 5000,
      rateLimitDelay: { min: 3000, max: 8000 },
    });

    const _results = await benchmark.runBenchmarks();
    const report = benchmark.generateReport();
    console.log(report);

    const exportData = benchmark.exportResults();
    const fs = await import("node:fs/promises");
    const filename = `discord-benchmark-${Date.now()}.json`;

    await fs.writeFile(filename, JSON.stringify(exportData, null, 2));
    console.log(`Results exported to ${filename}`);
  } catch (error) {
    console.error(`Benchmark failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
