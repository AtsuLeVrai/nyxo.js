import { commands } from "../../handlers/index.js";
import { defineEvent } from "../../types/index.js";

/**
 * Handles all incoming interactions from Discord
 *
 * This event is triggered whenever a user interacts with the bot through:
 * - Slash commands
 * - Buttons
 * - Select menus
 * - Modals
 * - Context menus
 *
 * This implementation specifically handles slash command interactions
 * by routing them to the appropriate command handler.
 */
export default defineEvent({
  name: "interactionCreate",
  once: false,
  execute: async (client, interaction) => {
    // Check if this is a slash command interaction
    if (
      !(
        interaction.isCommandInteraction() &&
        interaction.isSlashCommand() &&
        interaction.commandName
      )
    ) {
      return;
    }

    // Retrieve the command handler from the commands store
    const command = commands.get(interaction.commandName);

    // Handle case where command doesn't exist
    if (!command) {
      console.error(
        `[ERROR] No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      // Execute the command
      await command.execute(client, interaction);
    } catch (error) {
      // Log error and inform user if command execution fails
      console.error(`[ERROR] Error executing ${interaction.commandName}`);
      console.error(error);

      const replyOptions = {
        content: "There was an error while executing this command!",
        ephemeral: true, // Only visible to the command invoker
      };

      // Send error response to user
      await interaction.reply(replyOptions);
    }
  },
});
