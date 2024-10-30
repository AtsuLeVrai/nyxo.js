import { config } from "dotenv";
import { Client } from "oceanic.js";
import { BenchmarkManager } from "./BenchmarkManager.js";

config();

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

const client = new Client({
    auth: `Bot ${process.env["DISCORD_TOKEN"]}`,
    gateway: {
        intents: ["ALL"],
        compress: "zlib-stream",
        concurrency: "auto",
        maxShards: "auto",
    },
});

const benchmark = new BenchmarkManager();

client.on("error", (error) => {
    console.error("Error:", error);
    benchmark.incrementErrorCount();
});

client.on("warn", (warning) => {
    console.warn("Warning:", warning);
    benchmark.incrementEventCount();
});

client.on("debug", (info) => {
    console.debug("Debug:", info);
    benchmark.incrementEventCount();
});

client.on("ready", async () => {
    benchmark.setReadyTime();
    console.log("Gateway connected");
    await benchmark.captureMetrics();
});

console.log("Starting benchmark...");
const BENCHMARK_DURATION = 10000;

benchmark.setConnectStartTime();
client.connect().catch((error) => {
    console.error("Connection error:", error);
    process.exit(1);
});

const metricsInterval = setInterval(async () => {
    await benchmark.captureMetrics();
}, 1000);

setTimeout(() => {
    clearInterval(metricsInterval);
    console.log(benchmark.generateReport());
    void client.disconnect();
    process.exit(0);
}, BENCHMARK_DURATION);
