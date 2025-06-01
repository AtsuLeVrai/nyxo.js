import { config } from "dotenv";
import { Gateway, Rest } from "nyxo.js";

/**
 * Load environment variables from .env file
 * Validates required configuration before client initialization
 */
export const { parsed } = config({ debug: false });

// Validate essential environment variables
if (!parsed?.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required in .env file");
}

/**
 * Optimized Discord client configuration for minimal memory footprint
 *
 * Intent 513 breakdown:
 * - Guilds (1): Basic guild information
 * - GuildMessages (512): Message events in guilds
 *
 * Performance optimizations:
 * - zstd-stream compression for bandwidth efficiency
 * - ETF encoding for faster serialization
 * - Auto sharding for scalability
 */
const rest = new Rest({
  token: parsed.DISCORD_TOKEN,
  authType: "Bot",
  userAgent: "DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)",
});

const gateway = new Gateway(rest, {
  token: parsed.DISCORD_TOKEN,

  /**
   * Minimal intent configuration (513)
   * Only includes essential intents for basic bot functionality
   */
  intents: 513,
});

/**
 * Ready event handler - fired when the client successfully connects to Discord
 *
 * This event indicates:
 * - Successful authentication with Discord
 * - Gateway connection established
 * - Initial guild data received
 */
gateway.on("dispatch", (eventType, data) => {
  if (eventType === "READY") {
    const ready = data as any;
    console.log(
      `[CLIENT] Ready! Logged in as ${ready.user.username}#${ready.user.discriminator}`,
    );

    // Log connection performance metrics
    const connectionTime = Date.now() - startTime;
    console.log(`[PERFORMANCE] Connected in ${connectionTime}ms`);

    // Log shard information if using multiple shards
    if (ready.shard && ready.shard.length > 1) {
      console.log(`[SHARDING] Shard ${ready.shard[0]}/${ready.shard[1]} ready`);
    }

    // Log guild count for monitoring
    console.log(`[GUILDS] Connected to ${ready.guilds.length} guilds`);

    // Memory usage baseline logging
    logMemoryUsage("READY");
  }
});

/**
 * Logs current memory usage with timestamp and context
 * Useful for performance monitoring and memory leak detection
 *
 * @param context - Context label for the memory measurement
 */
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

/**
 * Global error handlers to prevent uncaught exceptions from crashing the bot
 * Logs errors for debugging while maintaining bot stability
 */
process.on("unhandledRejection", (error: Error) => {
  console.error("[PROCESS] Unhandled rejection:", error.message);
  console.error(error.stack);
});

process.on("uncaughtException", (error) => {
  console.error("[PROCESS] Uncaught exception:", error.message);
  console.error(error.stack);
});

/**
 * Graceful shutdown handler
 * Ensures clean disconnection and resource cleanup
 */
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

/**
 * Performance monitoring setup
 * Tracks connection time and periodic memory usage
 */
const startTime = Date.now();

// Log initial memory state
logMemoryUsage("STARTUP");

/**
 * Main execution function
 * Handles bot initialization and connection with error handling
 */
async function main(): Promise<void> {
  try {
    console.log("[CLIENT] Initializing Discord connection...");

    // Connect to Discord Gateway
    await gateway.connect();

    // Set up periodic memory monitoring (every 5 secondes)
    setInterval(() => {
      logMemoryUsage("PERIODIC");
    }, 5000); // 5 secondes
  } catch (error) {
    console.error("[ERROR] Failed to initialize bot:", error);
    process.exit(1);
  }
}

// Start the bot
main().catch((error) => {
  console.error("[FATAL] Unhandled error in main():", error);
  process.exit(1);
});
