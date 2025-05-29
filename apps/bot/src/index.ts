import { config } from "dotenv";
import { Client, GatewayIntentsBits, Store } from "nyxo.js";
import {
  loadCommands,
  loadEvents,
  registerCommands,
} from "./handlers/index.js";
import type { SlashCommand } from "./types/index.js";

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
 * Configure the Discord client with token and required intents
 *
 * Intents determine which events the bot will receive from Discord.
 * Including all intents here for comprehensive functionality, but
 * in production, you should only include the intents you actually need.
 */
const client = new Client({
  token: parsed.DISCORD_TOKEN,
  // @ts-ignore
  intents: [
    GatewayIntentsBits.Guilds,
    GatewayIntentsBits.GuildMembers,
    GatewayIntentsBits.GuildModeration,
    GatewayIntentsBits.GuildExpressions,
    GatewayIntentsBits.GuildIntegrations,
    GatewayIntentsBits.GuildWebhooks,
    GatewayIntentsBits.GuildInvites,
    GatewayIntentsBits.GuildVoiceStates,
    GatewayIntentsBits.GuildPresences,
    GatewayIntentsBits.GuildMessages,
    GatewayIntentsBits.GuildMessageReactions,
    GatewayIntentsBits.GuildMessageTyping,
    GatewayIntentsBits.DirectMessages,
    GatewayIntentsBits.DirectMessageReactions,
    GatewayIntentsBits.DirectMessageTyping,
    GatewayIntentsBits.MessageContent,
    GatewayIntentsBits.GuildScheduledEvents,
    GatewayIntentsBits.AutoModerationConfiguration,
    GatewayIntentsBits.AutoModerationExecution,
    GatewayIntentsBits.GuildMessagePolls,
    GatewayIntentsBits.DirectMessagePolls,
  ] /* TODO: Temporary bypass with build:prod */ as number[],
  compressionType: "zstd-stream",
  encodingType: "etf",
  shard: {
    totalShards: "auto",
  },
});

/**
 * Store containing all loaded commands
 * Uses a key-value structure where the key is the command name
 */
export const commands: Store<string, SlashCommand> = new Store<
  string,
  SlashCommand
>();

/**
 * Toggle for registering commands with Discord API
 * Set to false to skip registration during development
 * to avoid rate limits when frequently restarting the bot
 */
const registeredCommands = true;

/**
 * Main initialization function that orchestrates the bot startup process
 * Handles the loading of commands and events, connecting to Discord,
 * and registering slash commands with the Discord API
 */
async function main(): Promise<void> {
  try {
    // Calculate and log memory usage in MB for monitoring
    const memoryUsage = process.memoryUsage();
    const mbDivisor = 1024 * 1024;
    const rss = Math.round((memoryUsage.rss / mbDivisor) * 100) / 100;
    const heapTotal =
      Math.round((memoryUsage.heapTotal / mbDivisor) * 100) / 100;
    const heapUsed = Math.round((memoryUsage.heapUsed / mbDivisor) * 100) / 100;

    // Log memory usage statistics
    console.log(
      `[MEMORY] RSS: ${rss} MB | Heap Total: ${heapTotal} MB | Heap Used: ${heapUsed} MB`,
    );

    // Load events and commands
    await loadEvents(client);
    await loadCommands();

    // Date.now() is used to measure connection time
    const start = Date.now();

    // Connect to Discord Gateway
    console.log("[CLIENT] Connecting to Discord...");
    await client.gateway.connect();

    // Log connection time
    console.log(`[CLIENT] Connected to Discord in ${Date.now() - start}ms`);

    // Register commands after connection if enabled
    if (registeredCommands) {
      await registerCommands(client);
    }
  } catch (error) {
    console.error("[ERROR] Initialization error:", error);
  }
}

/**
 * Global error handlers to catch unhandled rejections and exceptions
 * Prevents the bot from crashing without logging when errors occur
 */
process.on("unhandledRejection", (error) => {
  console.error("[PROCESS] Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[PROCESS] Uncaught exception:", error);
});

/**
 * Clean shutdown handler
 * Properly closes connections when the process is terminated
 * Prevents potential issues with zombie connections
 */
process.on("SIGINT", async () => {
  console.log("[PROCESS] Shutting down...");
  await client.destroy();
  console.log("[PROCESS] All connections closed, exiting");
  process.exit(0);
});

// Start the bot
main().catch(console.error);
