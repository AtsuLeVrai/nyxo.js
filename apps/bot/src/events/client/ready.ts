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
  execute: (client, _ready) => {
    // Log successful connection with bot user tag
    console.log(`[CLIENT] Ready! Logged in as ${client.user.tag}`);
  },
});
