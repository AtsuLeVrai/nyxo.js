import type { Client } from "nyxo.js";
import pingCommand from "../commands/utility/ping.js";
import { parsed } from "../index.js";
import type { SlashCommand } from "../types/index.js";

/*
 * Centralized command registry for Discord slash commands.
 *
 * This registry stores all available slash commands in a readonly array to ensure
 * immutability and type safety. Commands are statically imported and registered
 * to provide better tree-shaking, compile-time validation, and performance.
 *
 * **Performance benefits:**
 * - **Static Analysis**: All commands are known at compile time
 * - **Memory Efficient**: Static imports prevent duplicate instances
 * - **Type Safe**: Full TypeScript validation at compile time
 * - **Tree Shakable**: Unused commands can be eliminated during bundling
 *
 * **Registry pattern advantages:**
 * - Centralized command management
 * - Easy command discovery and maintenance
 * - Consistent command structure validation
 * - Simplified debugging and logging
 */
export const commandRegistry: readonly SlashCommand[] = [pingCommand] as const;

/**
 * Registers all commands with the Discord API.
 *
 * This function handles the complete command registration process, supporting
 * both global and guild-specific deployment strategies. The registration
 * method is determined by the presence of a GUILD_ID environment variable.
 *
 * **Deployment strategies:**
 * - **Guild Registration**: Instant deployment for development (when GUILD_ID is set)
 * - **Global Registration**: Worldwide deployment for production (up to 1 hour propagation)
 *
 * **Error handling:**
 * - Comprehensive error logging for debugging
 * - Graceful failure that doesn't crash the bot
 * - Detailed success messages for monitoring
 *
 * **Rate limiting considerations:**
 * - Global commands: 200 per day limit
 * - Guild commands: Higher limits, suitable for development
 * - Bulk operations are more efficient than individual registrations
 *
 * @param client - The Discord client instance. Must be authenticated and connected
 *                to the Discord Gateway before calling this function.
 *
 * @throws {Error} May throw if Discord API returns an error, client is not
 *                authenticated, or if command data is malformed.
 *
 * @example
 * ```ts
 * // After client connection
 * await client.gateway.connect();
 *
 * // Register commands (automatically detects deployment strategy)
 * await registerCommands(client);
 *
 * // For development, set GUILD_ID in .env:
 * // GUILD_ID=123456789012345678
 *
 * // For production, leave GUILD_ID empty for global registration
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#registering-a-command}
 */
export async function registerCommands(client: Client): Promise<void> {
  // Convert commands to Discord API format
  const commandsArray = commandRegistry.map((cmd) => cmd.data);

  try {
    console.log(
      `[COMMAND] Started refreshing ${commandsArray.length} application commands.`,
    );

    // Check deployment strategy based on environment configuration
    const guildId = parsed?.GUILD_ID;
    if (guildId) {
      // Guild-specific deployment (development)
      // Benefits: Instant deployment, higher rate limits, isolated testing
      await client.rest.commands.bulkOverwriteGuildCommands(
        client.user.id,
        guildId,
        commandsArray,
      );
      console.log(
        `[COMMAND] Successfully registered commands for guild ${guildId}`,
      );

      return;
    }

    // Global deployment (production)
    // Benefits: Available in all guilds, persistent across guild joins/leaves
    // Drawbacks: Up to 1 hour propagation time, lower rate limits
    await client.rest.commands.bulkOverwriteGlobalCommands(
      client.user.id,
      commandsArray,
    );

    console.log(
      "[COMMAND] Successfully registered application commands globally",
    );
  } catch (error) {
    console.error("[ERROR] Failed to register commands:", error);

    // In production, you might want to implement retry logic or
    // fallback strategies here depending on the error type
  }
}
