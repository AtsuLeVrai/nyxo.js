import { EventEmitter } from "node:events";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import type { Gateway } from "@nyxjs/gateway";

export interface BenchmarkMetrics {
  connectionTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  system: {
    platform: string;
    arch: string;
    cpus: number;
    totalMemory: number;
    freeMemory: number;
    uptime: number;
    networkInterfaces: {
      name: string;
      address: string;
      netmask: string;
      mac: string;
      internal: boolean;
    }[];
  };
  process: {
    pid: number;
    uptime: number;
    version: string;
    env: string;
    title: string;
    memoryUsage: NodeJS.MemoryUsage;
  };
  ping: number;
}

export interface BenchmarkOptions {
  debug?: boolean;
  logToFile?: boolean;
  logPath?: string;
  metricsInterval?: number;
}

export class BenchmarkManager extends EventEmitter {
  #startTime = 0;
  #metrics: BenchmarkMetrics | null = null;
  #cpuUsageStart: NodeJS.CpuUsage | null = null;
  #options: Required<BenchmarkOptions>;
  #metricsInterval: NodeJS.Timer | null = null;
  #isReady = false;
  #gateway: Gateway;

  constructor(gateway: Gateway, options: BenchmarkOptions = {}) {
    super();
    this.#gateway = gateway;
    this.#options = {
      debug: options.debug ?? false,
      logToFile: options.logToFile ?? true,
      logPath: options.logPath ?? "./logs/benchmark",
      metricsInterval: options.metricsInterval ?? 60000,
    };

    this.#setupListeners();
    this.#initializeLogDirectory().catch(console.error);
  }

  getMetrics(): BenchmarkMetrics | null {
    return this.#metrics;
  }

  getLatestConnectionTime(): number {
    return this.#metrics?.connectionTime ?? 0;
  }

  getSystemInfo(): Partial<BenchmarkMetrics["system"]> {
    return this.#metrics?.system ?? {};
  }

  destroy(): void {
    this.#stopMetricsInterval();
    this.removeAllListeners();
  }

  async #initializeLogDirectory(): Promise<void> {
    if (this.#options.logToFile) {
      try {
        await fs.mkdir(this.#options.logPath, { recursive: true });
      } catch (error) {
        console.error("Failed to create log directory:", error);
      }
    }
  }

  #setupListeners(): void {
    this.#gateway.on("connecting", () => {
      this.#startTime = performance.now();
      this.#cpuUsageStart = process.cpuUsage();
      this.#debug("Starting benchmark measurement");
    });

    this.#gateway.on("dispatch", (event) => {
      if (event === "READY") {
        this.#isReady = true;
        this.#collectMetrics().catch(console.error);
        this.#startMetricsInterval();
      }
    });

    this.#gateway.on("close", () => {
      this.#isReady = false;
      this.#stopMetricsInterval();
    });
  }

  #startMetricsInterval(): void {
    if (this.#metricsInterval) {
      return;
    }

    this.#metricsInterval = setInterval(() => {
      if (this.#isReady) {
        this.#collectMetrics().catch(console.error);
      }
    }, this.#options.metricsInterval);
  }

  #stopMetricsInterval(): void {
    if (this.#metricsInterval) {
      clearInterval(this.#metricsInterval as NodeJS.Timeout);
      this.#metricsInterval = null;
    }
  }

  async #collectMetrics(): Promise<void> {
    const endTime = performance.now();
    const cpuUsageEnd = process.cpuUsage(
      this.#cpuUsageStart as NodeJS.CpuUsage,
    );

    // Calculer l'utilisation CPU
    const cpuUsagePercent =
      ((cpuUsageEnd.user + cpuUsageEnd.system) /
        1000000 /
        (endTime - this.#startTime)) *
      100;

    // Collecter les métriques réseau
    const networkInterfaces = Object.entries(os.networkInterfaces()).flatMap(
      ([name, interfaces]) =>
        interfaces?.map((int) => ({
          name,
          address: int.address,
          netmask: int.netmask,
          mac: int.mac || "",
          internal: int.internal,
        })) || [],
    );

    this.#metrics = {
      connectionTime: endTime - this.#startTime,
      memoryUsage: {
        heapUsed:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        heapTotal:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
        rss: Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100,
        external:
          Math.round((process.memoryUsage().external / 1024 / 1024) * 100) /
          100,
      },
      cpu: {
        usage: Math.round(cpuUsagePercent * 100) / 100,
        loadAverage: os.loadavg(),
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        cpus: os.cpus().length,
        totalMemory: Math.round((os.totalmem() / 1024 / 1024) * 100) / 100,
        freeMemory: Math.round((os.freemem() / 1024 / 1024) * 100) / 100,
        uptime: Math.round(os.uptime() * 100) / 100,
        networkInterfaces,
      },
      process: {
        pid: process.pid,
        uptime: Math.round(process.uptime() * 100) / 100,
        version: process.version,
        env: process.env.NODE_ENV || "development",
        title: process.title,
        memoryUsage: process.memoryUsage(),
      },
      ping: this.#gateway.ping,
    };

    this.emit("benchmarkComplete", this.#metrics);
    await this.#logMetrics();
  }

  async #logMetrics(): Promise<void> {
    if (!this.#metrics) {
      return;
    }

    const output = [
      "\n=== Benchmark Results ===",
      "\nConnection Metrics:",
      `⏱  Connection Time: ${this.#metrics.connectionTime}ms`,
      `⚡ Gateway Ping: ${this.#metrics.ping}ms`,

      "\nMemory Usage:",
      `📊 Heap Used: ${this.#metrics.memoryUsage.heapUsed}MB`,
      `📊 Heap Total: ${this.#metrics.memoryUsage.heapTotal}MB`,
      `📊 RSS: ${this.#metrics.memoryUsage.rss}MB`,
      `📊 External: ${this.#metrics.memoryUsage.external}MB`,

      "\nCPU Metrics:",
      `💻 CPU Usage: ${this.#metrics.cpu.usage}%`,
      `💻 Load Average: ${this.#metrics.cpu.loadAverage.join(", ")}`,

      "\nSystem Information:",
      `🖥  Platform: ${this.#metrics.system.platform}`,
      `🖥  Architecture: ${this.#metrics.system.arch}`,
      `🖥  CPU Cores: ${this.#metrics.system.cpus}`,
      `🖥  Total Memory: ${this.#metrics.system.totalMemory}MB`,
      `🖥  Free Memory: ${this.#metrics.system.freeMemory}MB`,
      `🖥  System Uptime: ${this.#metrics.system.uptime}s`,

      "\nProcess Information:",
      `📝 PID: ${this.#metrics.process.pid}`,
      `📝 Process Uptime: ${this.#metrics.process.uptime}s`,
      `📝 Node.js Version: ${this.#metrics.process.version}`,
      `📝 Environment: ${this.#metrics.process.env}`,
      "\n======================\n",
    ].join("\n");

    console.log(output);

    if (this.#options.logToFile) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const logFile = path.join(
        this.#options.logPath,
        `benchmark-${timestamp}.log`,
      );

      try {
        await fs.writeFile(logFile, JSON.stringify(this.#metrics, null, 2));
        this.#debug(`Metrics saved to ${logFile}`);
      } catch (error) {
        console.error("Failed to write metrics to file:", error);
      }
    }
  }

  #debug(message: string): void {
    if (this.#options.debug) {
      console.debug(`[Benchmark] ${message}`);
    }
  }
}
