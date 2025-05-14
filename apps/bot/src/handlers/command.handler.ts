import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { type Client, Store } from "nyxo.js";
import { parsed } from "../index.js";
import type { SlashCommand } from "../types/index.js";

// Get current directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Store containing all loaded commands
 * Uses a key-value structure where the key is the command name
 */
export const commands: Store<string, SlashCommand> = new Store<
  string,
  SlashCommand
>();

/**
 * Loads all commands from the commands directory
 * Traverses subdirectories for categorized command organization
 *
 * Expected structure:
 * commands/
 *   ├── moderation/
 *   │   ├── ban.ts
 *   │   └── kick.ts
 *   └── utility/
 *       ├── ping.ts
 *       └── help.ts
 */
export async function loadCommands(): Promise<void> {
  try {
    // Path to commands directory
    const commandsPath = join(__dirname, "..", "commands");
    // List of category folders
    const commandFolders = readdirSync(commandsPath);

    // Traverse each category folder
    for (const folder of commandFolders) {
      const folderPath = join(commandsPath, folder);
      // Filter to keep only .js and .ts files
      const commandFiles = readdirSync(folderPath).filter(
        (file) => file.endsWith(".js") || file.endsWith(".ts"),
      );

      // Load each command file
      for (const file of commandFiles) {
        const filePath = join(folderPath, file);
        // Convert path to URL (necessary for ESM on Windows)
        const fileUrl = pathToFileURL(filePath);

        // Import the command
        const command = (await import(fileUrl.href)).default as SlashCommand;

        // Verify command has required properties
        if ("data" in command && "execute" in command) {
          commands.set(command.data.name, command);
          console.log(`[COMMAND] Loaded command: ${command.data.name}`);
        } else {
          console.warn(
            `[WARNING] The command at ${filePath} is missing required "data" or "execute" property.`,
          );
        }
      }
    }
  } catch (error) {
    console.error("[ERROR] Error loading commands:", error);
    console.error(error);
  }
}

/**
 * Registers commands with the Discord API
 * Can register either globally or for a specific guild
 *
 * @param client - The Discord client
 */
export async function registerCommands(client: Client): Promise<void> {
  // Convert commands to API format
  const commandsArray = Array.from(commands.values()).map((cmd) => cmd.data);

  try {
    console.log(
      `[COMMAND] Started refreshing ${commandsArray.length} application commands.`,
    );

    // Check if a guild ID is specified for limited deployment
    const guildId = parsed?.GUILD_ID;
    if (guildId) {
      // Deploy to specific guild (instant, ideal for development)
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

    // Deploy globally (may take up to an hour to propagate)
    await client.rest.commands.bulkOverwriteGlobalCommands(
      client.user.id,
      commandsArray,
    );

    console.log(
      "[COMMAND] Successfully registered application commands globally",
    );
  } catch (error) {
    console.error("[ERROR] Failed to register commands:", error);
  }
}
