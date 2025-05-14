import { defineEvent } from "../../types/index.js";

/**
 * Handles the 'guildCreate' event emitted when the bot joins a new guild
 *
 * This handler logs information about the new guild.
 */
export default defineEvent({
  name: "guildCreate",
  execute: (_client, guild) => {
    console.log(
      `[GUILD] Connected to new guild: ${guild.name} (ID: ${guild.id})`,
    );
  },
});
