import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Client, ClientEvents } from "nyxo.js";
import type { Event } from "../types/index.js";

// Get current directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads all events from the events directory
 * Traverses subdirectories for categorized event organization
 *
 * Expected structure:
 * events/
 *   ├── client/
 *   │   ├── ready.ts
 *   │   └── interactionCreate.ts
 *   └── guild/
 *       └── guildCreate.ts
 *
 * @param client - The Discord client
 */
export async function loadEvents(client: Client): Promise<void> {
  try {
    // Path to events directory
    const eventsPath = join(__dirname, "..", "events");
    // List of category folders
    const eventFolders = readdirSync(eventsPath);

    // Traverse each category folder
    for (const folder of eventFolders) {
      const folderPath = join(eventsPath, folder);
      // Filter to keep only .js and .ts files
      const eventFiles = readdirSync(folderPath).filter(
        (file) => file.endsWith(".js") || file.endsWith(".ts"),
      );

      // Load each event file
      for (const file of eventFiles) {
        const filePath = join(folderPath, file);
        // Convert path to URL (necessary for ESM on Windows)
        const fileUrl = pathToFileURL(filePath);

        // Import the event
        const event = (await import(fileUrl.href)).default as Event<
          keyof ClientEvents
        >;

        // Register event based on whether it's one-time or not
        if (event.once) {
          // One-time trigger event
          client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
          // Multiple trigger event
          client.on(event.name, (...args) => event.execute(client, ...args));
        }

        console.log(`[EVENT] Loaded event: ${event.name}`);
      }
    }
  } catch (error) {
    console.error("[ERROR] Error loading events:", error);
    console.error(error);
  }
}
