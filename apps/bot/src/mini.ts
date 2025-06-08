import { config } from "dotenv";
import { Client, GatewayIntentsBits } from "nyxo.js";

export const { parsed } = config({ debug: true });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

const client = new Client({
  token: parsed.DISCORD_TOKEN,
  intents: [
    GatewayIntentsBits.Guilds,
    GatewayIntentsBits.GuildMessages,
    GatewayIntentsBits.MessageContent,
  ],
  compressionType: "zstd-stream",
  encodingType: "etf",
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

function logMemory(label = "MEMORY"): void {
  const mem = process.memoryUsage();
  const mb = 1024 * 1024;
  const rss = Math.round((mem.rss / mb) * 100) / 100;
  const heap = Math.round((mem.heapUsed / mb) * 100) / 100;
  const total = Math.round((mem.heapTotal / mb) * 100) / 100;
  console.log(`[${label}] RSS: ${rss}MB | Heap: ${heap}/${total}MB`);
}

let memTimer: NodeJS.Timeout | null = null;

function startMemMonitor(): void {
  memTimer = setInterval(() => {
    logMemory("MONITOR");
    if (global.gc) {
      global.gc();
      logMemory("AFTER_GC");
    }
  }, 1000);
}

async function cleanup(): Promise<void> {
  if (memTimer) {
    clearInterval(memTimer);
  }
  if (client) {
    await client.destroy();
  }
  if (global.gc) {
    global.gc();
  }
  logMemory("CLEANUP");
}

async function main(): Promise<void> {
  try {
    logMemory("START");
    await client.gateway.connect();
    logMemory("CONNECTED");
    startMemMonitor();
    console.log("Bot ready");
  } catch (error) {
    console.error("Error:", error);
    await cleanup();
    process.exit(1);
  }
}

process.on("unhandledRejection", console.error);
process.on("uncaughtException", async (error) => {
  console.error(error);
  await cleanup();
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await cleanup();
    process.exit(0);
  });
}

main();
