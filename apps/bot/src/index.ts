import { config } from "dotenv";
import { Client, GatewayIntentsBits } from "nyxo.js";
import { registerCommands, registerEvents } from "./registries/index.js";

/**
 * Load environment variables from .env file
 * Make parsed config available for other modules through export
 */
export const { parsed } = config({ debug: true });

// Validate essential environment variables exist
if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

/**
 * Configure the Discord client with token and optimized intents
 *
 * ⚠️ MEMORY OPTIMIZATION: Only include intents you actually need!
 * Each intent adds memory overhead, especially GuildMembers and GuildPresences
 * which can consume significant RAM in large servers.
 */
const client = new Client({
  token: parsed.DISCORD_TOKEN,
  compressionType: "zstd-stream",
  encodingType: "etf",
  shard: {
    force: true,
    totalShards: "auto",
  },
  intents: [
    GatewayIntentsBits.Guilds,
    GatewayIntentsBits.GuildMessages,
    GatewayIntentsBits.MessageContent,
    GatewayIntentsBits.GuildMembers,
    GatewayIntentsBits.GuildPresences,
    GatewayIntentsBits.GuildVoiceStates,
    GatewayIntentsBits.GuildModeration,
    GatewayIntentsBits.GuildExpressions,
    GatewayIntentsBits.GuildIntegrations,
    GatewayIntentsBits.GuildWebhooks,
    GatewayIntentsBits.GuildInvites,
    GatewayIntentsBits.GuildMessageReactions,
    GatewayIntentsBits.GuildMessageTyping,
    GatewayIntentsBits.DirectMessages,
    GatewayIntentsBits.DirectMessageReactions,
    GatewayIntentsBits.DirectMessageTyping,
    GatewayIntentsBits.GuildScheduledEvents,
    GatewayIntentsBits.AutoModerationConfiguration,
    GatewayIntentsBits.AutoModerationExecution,
    GatewayIntentsBits.GuildMessagePolls,
    GatewayIntentsBits.DirectMessagePolls,
  ],
});

/**
 * Toggle for registering commands with Discord API
 * Set to false to skip registration during development
 * to avoid rate limits when frequently restarting the bot
 */
const registeredCommands = true;

/**
 * Memory monitoring interval (in milliseconds)
 * Set to 0 to disable periodic memory monitoring
 */
const MEMORY_MONITOR_INTERVAL = 10000; // 10 seconds

/**
 * Memory monitoring state
 */
let memoryMonitorTimer: NodeJS.Timeout | null = null;

/**
 * Logs current memory usage in a readable format
 * Useful for detecting memory leaks and monitoring resource usage
 */
function logMemoryUsage(label = "MEMORY"): void {
  const memoryUsage = process.memoryUsage();
  const mbDivisor = 1024 * 1024;
  const rss = Math.round((memoryUsage.rss / mbDivisor) * 100) / 100;
  const heapTotal = Math.round((memoryUsage.heapTotal / mbDivisor) * 100) / 100;
  const heapUsed = Math.round((memoryUsage.heapUsed / mbDivisor) * 100) / 100;
  const external = Math.round((memoryUsage.external / mbDivisor) * 100) / 100;

  console.log(
    `[${label}] RSS: ${rss}MB | Heap: ${heapUsed}/${heapTotal}MB | External: ${external}MB`,
  );
}

/**
 * Starts periodic memory monitoring to detect potential leaks
 * Logs memory usage at regular intervals for monitoring
 */
function startMemoryMonitoring(): void {
  if (MEMORY_MONITOR_INTERVAL <= 0) {
    return;
  }

  memoryMonitorTimer = setInterval(() => {
    logMemoryUsage("MEMORY_MONITOR");

    // Optional: Force garbage collection if available (requires --expose-gc flag)
    if (global.gc) {
      global.gc();
      logMemoryUsage("MEMORY_AFTER_GC");
    }
  }, MEMORY_MONITOR_INTERVAL);

  console.log(
    `[MEMORY] Started memory monitoring (interval: ${MEMORY_MONITOR_INTERVAL}ms)`,
  );
}

/**
 * Stops memory monitoring and cleans up the timer
 */
function stopMemoryMonitoring(): void {
  if (memoryMonitorTimer) {
    clearInterval(memoryMonitorTimer);
    memoryMonitorTimer = null;
    console.log("[MEMORY] Stopped memory monitoring");
  }
}

/**
 * Performs comprehensive cleanup to prevent memory leaks
 * This function should be called before process termination
 */
async function cleanup(): Promise<void> {
  console.log("[CLEANUP] Starting cleanup process...");

  try {
    // Stop memory monitoring
    stopMemoryMonitoring();

    // Destroy Discord client and cleanup all connections
    if (client) {
      console.log("[CLEANUP] Destroying Discord client...");
      await client.destroy();
    }

    // Force garbage collection if available
    if (global.gc) {
      console.log("[CLEANUP] Running garbage collection...");
      global.gc();
    }

    // Log final memory state
    logMemoryUsage("CLEANUP_FINAL");

    console.log("[CLEANUP] Cleanup completed successfully");
  } catch (error) {
    console.error("[CLEANUP] Error during cleanup:", error);
  }
}

/**
 * Main initialization function that orchestrates the bot startup process
 * Handles the loading of commands and events, connecting to Discord,
 * and registering slash commands with the Discord API
 */
async function main(): Promise<void> {
  try {
    // Log initial memory usage
    logMemoryUsage("STARTUP");

    // Load events and commands
    console.log("[INIT] Registering events...");
    registerEvents(client);

    // Date.now() is used to measure connection time
    const start = Date.now();

    // Connect to Discord Gateway
    console.log("[CLIENT] Connecting to Discord...");
    await client.gateway.connect();

    // Log connection time and memory after connection
    console.log(`[CLIENT] Connected to Discord in ${Date.now() - start}ms`);
    logMemoryUsage("POST_CONNECTION");

    // Register commands after connection if enabled
    if (registeredCommands) {
      console.log("[INIT] Registering commands...");
      await registerCommands(client);
      logMemoryUsage("POST_COMMANDS");
    }

    // Start memory monitoring for leak detection
    startMemoryMonitoring();

    console.log("[INIT] Bot initialization completed successfully");
  } catch (error) {
    console.error("[ERROR] Initialization error:", error);
    await cleanup();
    process.exit(1);
  }
}

/**
 * Enhanced error handlers to catch unhandled rejections and exceptions
 * Includes cleanup to prevent resource leaks during error states
 */
process.on("unhandledRejection", (error) => {
  console.error("[PROCESS] Unhandled rejection:", error);
  // Note: In production, you might want to restart the process
  // after cleanup for critical unhandled rejections
});

process.on("uncaughtException", async (error) => {
  console.error("[PROCESS] Uncaught exception:", error);
  await cleanup();
  process.exit(1); // Exit after uncaught exception
});

/**
 * Enhanced shutdown handlers for graceful termination
 * Handles multiple termination signals and ensures proper cleanup
 */
const shutdownSignals = ["SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"] as const;

for (const signal of shutdownSignals) {
  process.on(signal, async () => {
    console.log(`[PROCESS] Received ${signal}, shutting down gracefully...`);
    await cleanup();
    console.log("[PROCESS] Process terminated cleanly");
    process.exit(0);
  });
}

/**
 * Handle process warnings (useful for debugging memory issues)
 */
process.on("warning", (warning) => {
  console.warn("[PROCESS] Warning:", warning.name, warning.message);
  if (warning.stack) {
    console.warn(warning.stack);
  }
});

// Start the bot
main().catch(async (error) => {
  console.error("[MAIN] Fatal error:", error);
  await cleanup();
  process.exit(1);
});
