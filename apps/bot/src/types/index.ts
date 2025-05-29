import type {
  Client,
  ClientEvents,
  GlobalCommandCreateOptions,
  GuildCommandCreateOptions,
  Promisable,
  SlashCommandInteraction,
} from "nyxo.js";

/**
 * Interface defining the structure of a Discord slash command.
 * Each command must provide configuration data and an execution function.
 */
export interface SlashCommand {
  /**
   * Command configuration (name, description, options, etc.)
   */
  data: GlobalCommandCreateOptions | GuildCommandCreateOptions;

  /**
   * Function executed when the command is invoked
   * @param client - Discord client instance
   * @param interaction - The received command interaction
   * @returns A resolved promise or void
   */
  execute: (
    client: Client,
    interaction: SlashCommandInteraction,
  ) => Promisable<void>;
}

/**
 * Utility function to define a slash command with type checking.
 * Provides better readability and validation when creating commands.
 *
 * @param options - Command configuration
 * @returns The properly typed command object
 *
 * @example
 * ```ts
 * export default defineSlashCommand({
 *   data: {
 *     name: "ping",
 *     description: "Replies with Pong!"
 *   },
 *   execute: async (client, interaction) => {
 *     await interaction.reply("Pong!");
 *   }
 * });
 * ```
 */
export function defineSlashCommand(options: SlashCommand): SlashCommand {
  return options;
}

/**
 * Generic interface defining the structure of a Discord event handler.
 * Uses generic types to ensure correspondence between the event name
 * and the expected arguments in the execution function.
 *
 * @template K - The event name in ClientEvents
 */
export interface Event<K extends keyof ClientEvents> {
  /**
   * Name of the Discord event to listen for
   */
  name: K;

  /**
   * If true, the event will only be triggered once
   * @default false
   */
  once?: boolean;

  /**
   * Function executed when the event is triggered
   * @param client - Discord client instance
   * @param args - Event-specific arguments (automatically typed according to K)
   * @returns A resolved promise or void
   */
  execute: (client: Client, ...args: ClientEvents[K]) => Promisable<void>;
}

/**
 * Utility function to define an event handler with type checking.
 * Ensures that argument types correctly match the defined event type.
 *
 * @template K - The event name in ClientEvents
 * @param options - Event configuration
 * @returns The properly typed event object
 *
 * @example
 * ```ts
 * export default defineEvent({
 *   name: "messageCreate",
 *   execute: async (client, message) => {
 *     if (message.content === "!ping") {
 *       await message.reply("Pong!");
 *     }
 *   }
 * });
 * ```
 */
export function defineEvent<K extends keyof ClientEvents>(
  options: Event<K>,
): Event<K> {
  return options;
}
