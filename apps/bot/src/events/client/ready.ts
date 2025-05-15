import { sleep } from "nyxo.js";
import { defineEvent } from "../../types/index.js";

/**
 * Handles the 'ready' event emitted when the client successfully connects to Discord
 *
 * The ready event signifies that:
 * 1. The bot has successfully authenticated with Discord
 * 2. The gateway connection is established
 * 3. Initial guild data has been received (though guilds may still be marked as unavailable)
 *
 * This handler logs the bot's login information and memory usage statistics.
 */
export default defineEvent({
  name: "ready",
  once: true, // This event should only be handled once per connection
  execute: async (client, ready) => {
    // Log successful connection with bot user tag
    console.log(`[CLIENT] Ready! Logged in as ${client.user.tag}`);

    // Calculate and log memory usage in MB for monitoring
    const memoryUsage = process.memoryUsage();
    const mbDivisor = 1024 * 1024;
    const rss = Math.round((memoryUsage.rss / mbDivisor) * 100) / 100;
    const heapTotal =
      Math.round((memoryUsage.heapTotal / mbDivisor) * 100) / 100;
    const heapUsed = Math.round((memoryUsage.heapUsed / mbDivisor) * 100) / 100;
    // Log additional connection information if available
    if (ready.totalShards > 1) {
      console.log(
        `[SHARDING] Connected on shard ${ready.shardId} of ${ready.totalShards}`,
      );
    }

    // Log the number of guilds the bot is in
    console.log(`[GUILDS] Connected to ${client.cache.guilds.size} guilds`);

    // Wait for 10 seconds before logging memory usage statistics
    await sleep(10000);

    // Log memory usage statistics
    console.log(
      `[MEMORY] RSS: ${rss} MB | Heap Total: ${heapTotal} MB | Heap Used: ${heapUsed} MB`,
    );
  },
});
