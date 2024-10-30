import { config } from "dotenv";
import { Client, GatewayIntents } from "nyx.js";
import { BenchmarkManager } from "./BenchmarkManager.js";

config();

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("Missing Discord token");
}

const client = new Client(process.env["DISCORD_TOKEN"], {
    intents: GatewayIntents.All(),
    gateway: {
        shard: "auto",
    },
});

const benchmark = new BenchmarkManager();

client.on("error", (error) => {
    console.error("Error:", error);
    benchmark.incrementErrorCount();
});

client.on("close", (event) => {
    console.log("Connection closed:", event);
    benchmark.incrementEventCount();
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
