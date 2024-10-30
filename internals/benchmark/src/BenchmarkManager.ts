type BenchmarkMetrics = {
    timestamp: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    cpuUsage: {
        user: number;
        system: number;
    };
    eventCount: number;
    errors: number;
};

type TimingMetrics = {
    startTime: number;
    connectStartTime: number;
    readyTime: number;
    connectionDuration?: number;
};

export class BenchmarkManager {
    #metrics: BenchmarkMetrics[] = [];
    #startTime: number;
    #lastCpuUsage: NodeJS.CpuUsage;
    #eventCounter = 0;
    #errorCounter = 0;
    #timingMetrics: TimingMetrics;

    constructor() {
        this.#startTime = performance.now();
        this.#lastCpuUsage = process.cpuUsage();
        this.#timingMetrics = {
            startTime: this.#startTime,
            connectStartTime: 0,
            readyTime: 0,
        };
    }

    setConnectStartTime(): void {
        this.#timingMetrics.connectStartTime = performance.now();
    }

    setReadyTime(): void {
        this.#timingMetrics.readyTime = performance.now();
        this.#timingMetrics.connectionDuration = this.#timingMetrics.readyTime - this.#timingMetrics.connectStartTime;
    }

    incrementEventCount(): void {
        this.#eventCounter++;
    }

    incrementErrorCount(): void {
        this.#errorCounter++;
    }

    async captureMetrics(): Promise<BenchmarkMetrics> {
        const currentCpuUsage = process.cpuUsage();
        const cpuDiff = process.cpuUsage(this.#lastCpuUsage);
        this.#lastCpuUsage = currentCpuUsage;

        const mem = process.memoryUsage();
        const metrics: BenchmarkMetrics = {
            timestamp: performance.now() - this.#startTime,
            memoryUsage: {
                heapUsed: mem.heapUsed / 1024 / 1024,
                heapTotal: mem.heapTotal / 1024 / 1024,
                external: mem.external / 1024 / 1024,
                rss: mem.rss / 1024 / 1024,
            },
            cpuUsage: {
                user: cpuDiff.user / 1000,
                system: cpuDiff.system / 1000,
            },
            eventCount: this.#eventCounter,
            errors: this.#errorCounter,
        };

        this.#metrics.push(metrics);
        return metrics;
    }

    generateReport(): string {
        const lastMetrics = this.#metrics[this.#metrics.length - 1];
        const firstMetrics = this.#metrics[0];

        let report = "\n=== Benchmark Report ===\n";

        report += "Connection Timing:\n";
        if (this.#timingMetrics.connectionDuration) {
            report += `- Total connection time: ${this.#timingMetrics.connectionDuration.toFixed(2)}ms\n`;
        }

        const readyDuration = this.#timingMetrics.readyTime - this.#timingMetrics.startTime;
        report += `- Time until ready state: ${readyDuration.toFixed(2)}ms\n\n`;

        report += `Total benchmark duration: ${(lastMetrics!.timestamp / 1000).toFixed(2)} seconds\n\n`;

        report += "Memory:\n";
        report += `- Heap used: ${lastMetrics!.memoryUsage.heapUsed.toFixed(2)} MB\n`;
        report += `- Total heap: ${lastMetrics!.memoryUsage.heapTotal.toFixed(2)} MB\n`;
        report += `- External memory: ${lastMetrics!.memoryUsage.external.toFixed(2)} MB\n`;
        report += `- RSS: ${lastMetrics!.memoryUsage.rss.toFixed(2)} MB\n`;
        report += `- Heap increase: ${(lastMetrics!.memoryUsage.heapUsed - firstMetrics!.memoryUsage.heapUsed).toFixed(2)} MB\n\n`;

        report += "Performance:\n";
        report += `- User CPU: ${lastMetrics!.cpuUsage.user.toFixed(2)}ms\n`;
        report += `- System CPU: ${lastMetrics!.cpuUsage.system.toFixed(2)}ms\n`;
        report += `- Total CPU: ${(lastMetrics!.cpuUsage.user + lastMetrics!.cpuUsage.system).toFixed(2)}ms\n\n`;

        report += "Statistics:\n";
        report += `- Events processed: ${lastMetrics!.eventCount}\n`;
        report += `- Errors encountered: ${lastMetrics!.errors}\n`;
        report += `- Events/second: ${(lastMetrics!.eventCount / (lastMetrics!.timestamp / 1000)).toFixed(2)}\n`;
        report += `- Events/minute: ${(lastMetrics!.eventCount / (lastMetrics!.timestamp / 1000 / 60)).toFixed(2)}\n`;

        return report;
    }
}
