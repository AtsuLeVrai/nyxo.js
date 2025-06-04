import { config } from "dotenv";
import { Client } from "eris";

const { parsed } = config({ debug: false });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required in .env file");
}

const client = new Client(`Bot ${parsed.DISCORD_TOKEN}`, {
  intents: 513,
});

client.once("ready", () => {
  console.log(
    `[CLIENT] Ready! Logged in as ${client.user.username}#${client.user.discriminator}`,
  );

  const connectionTime = Date.now() - startTime;
  console.log(`[PERFORMANCE] Connected in ${connectionTime}ms`);

  if (client.shards.size > 1) {
    console.log(`[SHARDING] ${client.shards.size} shards ready`);
  }

  console.log(`[GUILDS] Connected to ${client.guilds.size} guilds`);

  logMemoryUsage("READY");
});

function logMemoryUsage(context: string): void {
  const memoryUsage = process.memoryUsage();
  const mbDivisor = 1024 * 1024;

  const metrics = {
    rss: Math.round((memoryUsage.rss / mbDivisor) * 100) / 100,
    heapTotal: Math.round((memoryUsage.heapTotal / mbDivisor) * 100) / 100,
    heapUsed: Math.round((memoryUsage.heapUsed / mbDivisor) * 100) / 100,
    external: Math.round((memoryUsage.external / mbDivisor) * 100) / 100,
  };
  console.log(
    `[MEMORY:${context}] RSS: ${metrics.rss}MB | ` +
      `Heap: ${metrics.heapUsed}/${metrics.heapTotal}MB | ` +
      `External: ${metrics.external}MB`,
  );
}

process.on("unhandledRejection", (error: Error) => {
  console.error("[PROCESS] Unhandled rejection:", error.message);
  console.error(error.stack);
});

process.on("uncaughtException", (error) => {
  console.error("[PROCESS] Uncaught exception:", error.message);
  console.error(error.stack);
});

process.on("SIGINT", () => {
  console.log("[PROCESS] Shutdown signal received...");

  try {
    client.disconnect({ reconnect: false });
    console.log("[PROCESS] Client disconnected successfully");
  } catch (error) {
    console.error("[PROCESS] Error during shutdown:", error);
  }
  logMemoryUsage("SHUTDOWN");
  console.log("[PROCESS] Process terminated");
  process.exit(0);
});

const startTime = Date.now();

logMemoryUsage("STARTUP");

async function main(): Promise<void> {
  try {
    console.log("[CLIENT] Initializing Discord connection...");

    await client.connect();

    setInterval(() => {
      logMemoryUsage("PERIODIC");
    }, 5000);
  } catch (error) {
    console.error("[ERROR] Failed to initialize bot:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[FATAL] Unhandled error in main():", error);
  process.exit(1);
});
