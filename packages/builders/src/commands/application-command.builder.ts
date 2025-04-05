import {
  APPLICATION_COMMAND_NAME_REGEX,
  type AnyApplicationCommandEntity,
  type ApplicationCommandType,
  type ApplicationIntegrationType,
  type InteractionContextType,
  type Locale,
} from "@nyxjs/core";

/**
 * Base abstract builder for creating Discord application commands.
 * This abstract class provides common functionality for all application command builders.
 *
 * Application commands appear in the Discord client as:
 * - Slash commands - Text-based commands that show up when a user types /
 * - User commands - UI-based commands that show up when right-clicking on a user
 * - Message commands - UI-based commands that show up when right-clicking on a message
 * - Entry point commands - UI-based commands that represent the primary way to invoke an app's Activity
 *
 * @template T The application command entity type this builder produces
 * @template B The builder type (for method chaining)
 *
 * @example
 * ```typescript
 * // Creating a slash command
 * const command = new ChatInputCommandBuilder()
 *   .setName('ping')
 *   .setDescription('Replies with Pong!')
 *   .build();
 *
 * // Creating a user context menu command
 * const userCommand = new UserCommandBuilder()
 *   .setName('Get Avatar')
 *   .build();
 * ```
 *
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md}
 */
export abstract class ApplicationCommandBuilder<
  T extends AnyApplicationCommandEntity,
  B extends ApplicationCommandBuilder<T, B>,
> {
  /** The command data being built */
  protected readonly data: Partial<T>;

  /**
   * Creates a new ApplicationCommandBuilder instance.
   *
   * @param type The type of command to create
   * @param data Optional initial command data
   */
  protected constructor(type: ApplicationCommandType, data: Partial<T> = {}) {
    this.data = {
      type,
      ...data,
    };
  }

  /**
   * Returns this builder for method chaining.
   * Used internally to ensure correct typing for subclasses.
   */
  protected abstract get self(): B;

  /**
   * Sets the name of the command.
   *
   * Command names must match the regex pattern ^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$
   * with the unicode flag set. If there is a lowercase variant of any letters used,
   * the lowercase variant must be used.
   *
   * @param name The name to set (1-32 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If name exceeds 32 characters or doesn't match the regex pattern
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .setName('ping')
   * ```
   */
  setName(name: string): B {
    if (name.length > 32) {
      throw new Error("Command name cannot exceed 32 characters");
    }

    if (!APPLICATION_COMMAND_NAME_REGEX.test(name)) {
      throw new Error(
        "Command name must match regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
      );
    }

    this.data.name = name;
    return this.self;
  }

  /**
   * Sets localization dictionary for the command name.
   *
   * Localized names must follow the same restrictions as the name field.
   *
   * @param localizations Dictionary of localized names by locale
   * @returns This builder instance, for method chaining
   * @throws Error If any localized name exceeds 32 characters or doesn't match the regex pattern
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .setNameLocalizations({
   *     'fr': 'ping-fr',
   *     'es-ES': 'ping-es'
   *   })
   * ```
   */
  setNameLocalizations(localizations: Record<Locale, string> | null): B {
    if (localizations) {
      for (const [locale, name] of Object.entries(localizations)) {
        if (name.length > 32) {
          throw new Error(
            `Command name for locale ${locale} cannot exceed 32 characters`,
          );
        }

        if (!APPLICATION_COMMAND_NAME_REGEX.test(name)) {
          throw new Error(
            `Command name for locale ${locale} must match regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$`,
          );
        }
      }
    }

    this.data.name_localizations = localizations;
    return this.self;
  }

  /**
   * Sets the default member permissions required to use the command.
   *
   * By setting this value, you can restrict who can use the command in a guild
   * based on the permissions they have. Set to "0" to disable the command for
   * everyone except administrators by default.
   *
   * @param permissions Set of permissions represented as a bit set string
   * @returns This builder instance, for method chaining
   *
   * @example
   * ```typescript
   * // Only members with MANAGE_GUILD permission can use this command by default
   * const manageGuildPermission = (1n << 5n).toString();
   *
   * new ChatInputCommandBuilder()
   *   .setDefaultMemberPermissions(manageGuildPermission)
   *
   * // Command disabled for everyone except administrators
   * new ChatInputCommandBuilder()
   *   .setDefaultMemberPermissions('0')
   * ```
   */
  setDefaultMemberPermissions(permissions: string | null): B {
    this.data.default_member_permissions = permissions;
    return this.self;
  }

  /**
   * Sets whether the command is age-restricted (NSFW).
   *
   * Age-restricted commands can only be used in age-restricted channels
   * or DMs by users who have opted to see age-restricted content.
   *
   * @param nsfw Whether the command is age-restricted
   * @returns This builder instance, for method chaining
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .setNSFW(true)
   * ```
   */
  setNsfw(nsfw = true): B {
    this.data.nsfw = nsfw;
    return this.self;
  }

  /**
   * Sets the installation contexts where the command will be available.
   * Only applicable for global commands.
   *
   * @param types Array of integration types
   * @returns This builder instance, for method chaining
   *
   * @example
   * ```typescript
   * import { ApplicationIntegrationType } from "@nyxjs/core";
   *
   * // Command available both in guilds and for user installations
   * new ChatInputCommandBuilder()
   *   .setIntegrationTypes([
   *     ApplicationIntegrationType.GuildInstall,
   *     ApplicationIntegrationType.UserInstall
   *   ])
   * ```
   */
  setIntegrationTypes(types: ApplicationIntegrationType[]): B {
    this.data.integration_types = types;
    return this.self;
  }

  /**
   * Sets the interaction contexts where the command can be used.
   * Only applicable for global commands.
   *
   * @param contexts Array of interaction context types
   * @returns This builder instance, for method chaining
   *
   * @example
   * ```typescript
   * import { InteractionContextType } from "@nyxjs/core";
   *
   * // Command only available in guilds, not in DMs
   * new ChatInputCommandBuilder()
   *   .setContexts([InteractionContextType.Guild])
   * ```
   */
  setContexts(contexts: InteractionContextType[]): B {
    this.data.contexts = contexts;
    return this.self;
  }

  /**
   * Sets whether the command is enabled by default when the app is added to a guild.
   *
   * @deprecated Use setDefaultMemberPermissions instead
   *
   * @param defaultPermission Whether the command is enabled by default
   * @returns This builder instance, for method chaining
   */
  setDefaultPermission(defaultPermission: boolean | null): B {
    this.data.default_permission = defaultPermission;
    return this.self;
  }

  /**
   * Builds and returns the final command object.
   *
   * @returns The constructed application command entity
   * @throws Error If required fields are missing or validation fails
   */
  abstract build(): T;

  /**
   * Returns the current command data as a plain object.
   *
   * @returns The current command data
   */
  toJson(): Partial<T> {
    return { ...this.data };
  }
}
