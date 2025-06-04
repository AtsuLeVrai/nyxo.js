import { Gateway } from "@nyxojs/gateway";
import { Rest } from "@nyxojs/rest";
import { config } from "dotenv";

const { parsed } = config({ debug: false });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required in .env file");
}

const rest = new Rest({
  token: parsed.DISCORD_TOKEN,
});

const gateway = new Gateway(rest, {
  token: parsed.DISCORD_TOKEN,
  intents: 513,
});

gateway.on("dispatch", (eventType, data) => {
  if (eventType === "READY") {
    const ready = data as {
      user: { username: string; discriminator: string };
      guilds: unknown[];
      shard?: [number, number];
    };
    console.log(
      `[CLIENT] Ready! Logged in as ${ready.user.username}#${ready.user.discriminator}`,
    );

    const connectionTime = Date.now() - startTime;
    console.log(`[PERFORMANCE] Connected in ${connectionTime}ms`);

    if (ready.shard && ready.shard.length > 1) {
      console.log(`[SHARDING] Shard ${ready.shard[0]}/${ready.shard[1]} ready`);
    }

    console.log(`[GUILDS] Connected to ${ready.guilds.length} guilds`);

    logMemoryUsage("READY");
  }
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

process.on("SIGINT", async () => {
  console.log("[PROCESS] Shutdown signal received...");

  try {
    gateway.destroy();
    console.log("[PROCESS] Client disconnected successfully");
  } catch (error) {
    console.error("[PROCESS] Error during shutdown:", error);
  }

  try {
    await rest.destroy();
    console.log("[PROCESS] REST client destroyed successfully");
  } catch (error) {
    console.error("[PROCESS] Error during REST cleanup:", error);
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

    await gateway.connect();

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
