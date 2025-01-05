import { GatewayIntentsBits, type GatewayOptions } from "@nyxjs/gateway";
import type { RestOptions } from "@nyxjs/rest";
import { config } from "dotenv";
import type { BenchmarkOptions } from "./benchmark.js";

const env = config();

if (!env.parsed?.TOKEN) {
  throw new Error("Missing TOKEN in environment variables");
}

export const TOKEN = env.parsed?.TOKEN;

export const BENCHMARK_OPTIONS: BenchmarkOptions = {
  debug: env.parsed.DEBUG_BENCHMARK === "true",
  logToFile: true,
  logPath: "./logs/benchmark",
  metricsInterval: 60000,
};

export const GATEWAY_OPTIONS: GatewayOptions = {
  token: TOKEN,
  intents: Object.values(GatewayIntentsBits),
  shard: {
    totalShards: "auto",
  },
};

export const REST_OPTIONS: RestOptions = {
  token: TOKEN,
  cacheLifetime: 0,
};
