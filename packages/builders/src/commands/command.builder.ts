import {
  APPLICATION_COMMAND_NAME_REGEX,
  type AnyApplicationCommandEntity,
  type AnyApplicationCommandOptionEntity,
  type ApplicationCommandEntity,
  ApplicationCommandEntryPointType,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type ApplicationIntegrationType,
  type InteractionContextType,
  type Locale,
} from "@nyxojs/core";
import { COMMAND_LIMITS } from "../utils/index.js";
import {
  AttachmentOptionBuilder,
  BooleanOptionBuilder,
  ChannelOptionBuilder,
  IntegerOptionBuilder,
  MentionableOptionBuilder,
  NumberOptionBuilder,
  RoleOptionBuilder,
  StringOptionBuilder,
  SubCommandBuilder,
  SubCommandGroupBuilder,
  UserOptionBuilder,
} from "./command-option.builder.js";

/**
 * Base class for all application command builders.
 *
 * @template T - The type of command entity this builder creates
 */
export abstract class BaseCommandBuilder<
  T extends AnyApplicationCommandEntity,
> {
  /** The internal command data being constructed */
  protected readonly data: Partial<T>;

  /** The command type for this builder */
  protected readonly type: ApplicationCommandType;

  /**
   * Creates a new BaseCommandBuilder instance.
   *
   * @param type - The type of this command
   * @param data - Optional initial data to populate the command with
   */
  protected constructor(type: ApplicationCommandType, data?: Partial<T>) {
    this.type = type;
    this.data = {
      type: type,
      ...(data || {}),
    } as Partial<T>;
  }

  /**
   * Sets the name of the command.
   *
   * @param name - The name to set (max 32 characters)
   * @returns The command builder instance for method chaining
   * @throws Error if name exceeds 32 characters or doesn't match the allowed pattern
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().setName('ping');
   * ```
   */
  setName(name: string): this {
    if (name.length > COMMAND_LIMITS.NAME) {
      throw new Error(
        `Command name cannot exceed ${COMMAND_LIMITS.NAME} characters`,
      );
    }

    if (this.type === ApplicationCommandType.ChatInput) {
      // Slash commands must use lowercase names
      const lowercaseName = name.toLowerCase();

      if (!APPLICATION_COMMAND_NAME_REGEX.test(lowercaseName)) {
        throw new Error(
          "Slash command name must match the regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
        );
      }

      this.data.name = lowercaseName;
    } else {
      // User and Message commands can use mixed case
      if (name.length === 0) {
        throw new Error("Command name cannot be empty");
      }

      this.data.name = name;
    }

    return this;
  }

  /**
   * Sets localizations for the command name.
   *
   * @param localizations - Dictionary of locale to localized name
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().setNameLocalizations({
   *   'fr': 'ping-fr',
   *   'es-ES': 'ping-es'
   * });
   * ```
   */
  setNameLocalizations(localizations: Record<Locale, string> | null): this {
    // Validate each localized name
    if (localizations) {
      for (const [locale, name] of Object.entries(localizations)) {
        if (name.length > COMMAND_LIMITS.NAME) {
          throw new Error(
            `Localized command name for ${locale} cannot exceed ${COMMAND_LIMITS.NAME} characters`,
          );
        }

        if (
          this.type === ApplicationCommandType.ChatInput &&
          !APPLICATION_COMMAND_NAME_REGEX.test(name.toLowerCase())
        ) {
          throw new Error(
            `Localized slash command name for ${locale} must match the regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$`,
          );
        }
      }
    }

    this.data.name_localizations = localizations;
    return this;
  }

  /**
   * Sets whether the command is age-restricted (NSFW).
   *
   * @param nsfw - Whether the command is age-restricted
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().setNSFW(true);
   * ```
   */
  setNsfw(nsfw = true): this {
    this.data.nsfw = nsfw;
    return this;
  }

  /**
   * Sets the default required permissions for the command.
   *
   * @param permissions - The permissions as a bitfield string
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Require ADMINISTRATOR permission
   * new SlashCommandBuilder().setDefaultMemberPermissions('8');
   *
   * // Disable the command for everyone except admins
   * new SlashCommandBuilder().setDefaultMemberPermissions('0');
   * ```
   */
  setDefaultMemberPermissions(permissions: string | null): this {
    this.data.default_member_permissions = permissions;
    return this;
  }

  /**
   * Sets the installation contexts where the command is available (global commands only).
   *
   * @param types - Array of integration types
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Make the command available for both guild and user installations
   * new SlashCommandBuilder().setIntegrationTypes([
   *   ApplicationIntegrationType.GuildInstall,
   *   ApplicationIntegrationType.UserInstall
   * ]);
   * ```
   */
  setIntegrationTypes(...types: ApplicationIntegrationType[]): this {
    this.data.integration_types = types;
    return this;
  }

  /**
   * Sets the interaction contexts where the command can be used (global commands only).
   *
   * @param contexts - Array of interaction context types
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Make the command usable in guilds and DMs
   * new SlashCommandBuilder().setContexts([
   *   InteractionContextType.Guild,
   *   InteractionContextType.BotDM
   * ]);
   * ```
   */
  setContexts(...contexts: InteractionContextType[]): this {
    this.data.contexts = contexts;
    return this;
  }

  /**
   * Sets whether the command is available in DMs (deprecated - use setContexts instead).
   *
   * @param enabled - Whether the command is available in DMs
   * @returns The command builder instance for method chaining
   * @deprecated Use setContexts instead
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().setDMPermission(false);
   * ```
   */
  setDmPermission(enabled: boolean): this {
    this.data.dm_permission = enabled;
    return this;
  }

  /**
   * Abstract build method that must be implemented by subclasses.
   * Should return the complete command entity.
   */
  abstract build(): T;

  /**
   * Returns a JSON representation of the command.
   * Can be used directly with the Discord API for command registration.
   *
   * @returns A read-only copy of the command data
   */
  toJson(): Readonly<Partial<T>> {
    return Object.freeze({ ...this.data });
  }
}

/**
 * Builder for slash commands (CHAT_INPUT type).
 *
 * @example
 * ```typescript
 * const command = new SlashCommandBuilder()
 *   .setName('echo')
 *   .setDescription('Echoes your input')
 *   .addStringOption(option =>
 *     option
 *       .setName('input')
 *       .setDescription('The input to echo back')
 *       .setRequired(true)
 *   )
 *   .build();
 * ```
 */
export class SlashCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new SlashCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(ApplicationCommandType.ChatInput, data);

    // Initialize description and options if provided
    if (data?.description) {
      this.data.description = data.description;
    } else {
      this.data.description = "";
    }

    if (data?.options && !this.data.options) {
      this.data.options = [...data.options];
    }
  }

  /**
   * Creates a new SlashCommandBuilder from existing command data.
   *
   * @param data - The command data to use
   * @returns A new SlashCommandBuilder instance with the provided data
   */
  static from(data: Partial<ApplicationCommandEntity>): SlashCommandBuilder {
    return new SlashCommandBuilder(data);
  }

  /**
   * Sets the description of the command.
   *
   * @param description - The description to set (max 100 characters)
   * @returns The command builder instance for method chaining
   * @throws Error if description exceeds 100 characters
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().setDescription('Echoes your input back to you');
   * ```
   */
  setDescription(description: string): this {
    if (description.length > COMMAND_LIMITS.DESCRIPTION) {
      throw new Error(
        `Command description cannot exceed ${COMMAND_LIMITS.DESCRIPTION} characters`,
      );
    }

    this.data.description = description;
    return this;
  }

  /**
   * Sets localizations for the command description.
   *
   * @param localizations - Dictionary of locale to localized description
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().setDescriptionLocalizations({
   *   'fr': 'Renvoie votre saisie',
   *   'es-ES': 'Devuelve tu entrada'
   * });
   * ```
   */
  setDescriptionLocalizations(
    localizations: Record<Locale, string> | null,
  ): this {
    // Validate each localized description
    if (localizations) {
      for (const [locale, description] of Object.entries(localizations)) {
        if (description.length > COMMAND_LIMITS.DESCRIPTION) {
          throw new Error(
            `Localized command description for ${locale} cannot exceed ${COMMAND_LIMITS.DESCRIPTION} characters`,
          );
        }
      }
    }

    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Adds an option to the command.
   *
   * @param option - The option to add or a function that returns an option
   * @returns The command builder instance for method chaining
   * @throws Error if adding the option would exceed the maximum number of options
   *
   * @example
   * ```typescript
   * // Adding a pre-built option
   * const stringOption = new StringOptionBuilder()
   *   .setName('input')
   *   .setDescription('The input to echo back')
   *   .setRequired(true)
   *   .build();
   *
   * new SlashCommandBuilder().addOption(stringOption);
   *
   * // Using a builder function
   * new SlashCommandBuilder().addOption(option =>
   *   option
   *     .setName('input')
   *     .setDescription('The input to echo back')
   *     .setRequired(true)
   * );
   * ```
   */
  addOption(
    option:
      | AnyApplicationCommandOptionEntity
      | ((builder: StringOptionBuilder) => StringOptionBuilder),
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    if (typeof option === "function") {
      // Create a new option using the builder function
      const builder = new StringOptionBuilder();
      const result = option(builder);
      this.data.options.push(result.build());
    } else {
      // Add the existing option
      this.data.options.push(option);
    }

    return this;
  }

  /**
   * Adds a string option to the command.
   *
   * @param optionBuilder - Function that configures the string option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addStringOption(option =>
   *   option
   *     .setName('input')
   *     .setDescription('The input to echo back')
   *     .setRequired(true)
   * );
   * ```
   */
  addStringOption(
    optionBuilder: (builder: StringOptionBuilder) => StringOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new StringOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds an integer option to the command.
   *
   * @param optionBuilder - Function that configures the integer option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addIntegerOption(option =>
   *   option
   *     .setName('count')
   *     .setDescription('The number of items')
   *     .setRequired(true)
   *     .setMinValue(1)
   * );
   * ```
   */
  addIntegerOption(
    optionBuilder: (builder: IntegerOptionBuilder) => IntegerOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new IntegerOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a number option to the command.
   *
   * @param optionBuilder - Function that configures the number option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addNumberOption(option =>
   *   option
   *     .setName('price')
   *     .setDescription('The price of the item')
   *     .setRequired(true)
   *     .setMinValue(0.01)
   * );
   * ```
   */
  addNumberOption(
    optionBuilder: (builder: NumberOptionBuilder) => NumberOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new NumberOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a boolean option to the command.
   *
   * @param optionBuilder - Function that configures the boolean option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addBooleanOption(option =>
   *   option
   *     .setName('ephemeral')
   *     .setDescription('Whether the response should be ephemeral')
   *     .setRequired(false)
   * );
   * ```
   */
  addBooleanOption(
    optionBuilder: (builder: BooleanOptionBuilder) => BooleanOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new BooleanOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a user option to the command.
   *
   * @param optionBuilder - Function that configures the user option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addUserOption(option =>
   *   option
   *     .setName('target')
   *     .setDescription('The user to target')
   *     .setRequired(true)
   * );
   * ```
   */
  addUserOption(
    optionBuilder: (builder: UserOptionBuilder) => UserOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new UserOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a channel option to the command.
   *
   * @param optionBuilder - Function that configures the channel option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addChannelOption(option =>
   *   option
   *     .setName('channel')
   *     .setDescription('The channel to use')
   *     .setRequired(true)
   *     .addChannelType(ChannelType.GuildText)
   * );
   * ```
   */
  addChannelOption(
    optionBuilder: (builder: ChannelOptionBuilder) => ChannelOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new ChannelOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a role option to the command.
   *
   * @param optionBuilder - Function that configures the role option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addRoleOption(option =>
   *   option
   *     .setName('role')
   *     .setDescription('The role to use')
   *     .setRequired(true)
   * );
   * ```
   */
  addRoleOption(
    optionBuilder: (builder: RoleOptionBuilder) => RoleOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new RoleOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a mentionable option to the command.
   *
   * @param optionBuilder - Function that configures the mentionable option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addMentionableOption(option =>
   *   option
   *     .setName('mention')
   *     .setDescription('Mention a user or role')
   *     .setRequired(true)
   * );
   * ```
   */
  addMentionableOption(
    optionBuilder: (
      builder: MentionableOptionBuilder,
    ) => MentionableOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new MentionableOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds an attachment option to the command.
   *
   * @param optionBuilder - Function that configures the attachment option
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addAttachmentOption(option =>
   *   option
   *     .setName('file')
   *     .setDescription('The file to upload')
   *     .setRequired(true)
   * );
   * ```
   */
  addAttachmentOption(
    optionBuilder: (
      builder: AttachmentOptionBuilder,
    ) => AttachmentOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    const builder = new AttachmentOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a subcommand to the command.
   *
   * @param subcommandBuilder - Function that configures the subcommand
   * @returns The command builder instance for method chaining
   * @throws Error if adding the subcommand would exceed the maximum number of options
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addSubcommand(subcommand =>
   *   subcommand
   *     .setName('add')
   *     .setDescription('Add a new item')
   *     .addStringOption(option =>
   *       option
   *         .setName('name')
   *         .setDescription('The name of the item')
   *         .setRequired(true)
   *     )
   * );
   * ```
   */
  addSubcommand(
    subcommandBuilder: (builder: SubCommandBuilder) => SubCommandBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    // Check if there are any options that aren't subcommands or subcommand groups
    if (
      this.data.options.some(
        (option) =>
          option.type !== ApplicationCommandOptionType.SubCommand &&
          option.type !== ApplicationCommandOptionType.SubCommandGroup,
      )
    ) {
      throw new Error(
        "Commands with subcommands cannot also have other option types",
      );
    }

    const builder = new SubCommandBuilder();
    const result = subcommandBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Adds a subcommand group to the command.
   *
   * @param groupBuilder - Function that configures the subcommand group
   * @returns The command builder instance for method chaining
   * @throws Error if adding the group would exceed the maximum number of options
   *
   * @example
   * ```typescript
   * new SlashCommandBuilder().addSubcommandGroup(group =>
   *   group
   *     .setName('manage')
   *     .setDescription('Manage items')
   *     .addSubcommand(subcommand =>
   *       subcommand
   *         .setName('add')
   *         .setDescription('Add a new item')
   *         .addStringOption(option =>
   *           option
   *             .setName('name')
   *             .setDescription('The name of the item')
   *             .setRequired(true)
   *         )
   *     )
   * );
   * ```
   */
  addSubcommandGroup(
    groupBuilder: (builder: SubCommandGroupBuilder) => SubCommandGroupBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
      );
    }

    // Check if there are any options that aren't subcommands or subcommand groups
    if (
      this.data.options.some(
        (option) =>
          option.type !== ApplicationCommandOptionType.SubCommand &&
          option.type !== ApplicationCommandOptionType.SubCommandGroup,
      )
    ) {
      throw new Error(
        "Commands with subcommand groups cannot also have other option types",
      );
    }

    const builder = new SubCommandGroupBuilder();
    const result = groupBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Builds the final slash command entity.
   *
   * @returns The complete slash command entity
   * @throws Error if the command configuration is invalid
   */
  build(): ApplicationCommandEntity {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    if (!this.data.description) {
      throw new Error("Command description is required");
    }

    // Check total character count
    let charCount = this.data.name.length + this.data.description.length;

    // Count characters in options
    if (this.data.options) {
      for (const option of this.data.options) {
        charCount += option.name.length + option.description.length;

        // Count characters in choices
        if ("choices" in option && option.choices) {
          for (const choice of option.choices) {
            charCount += choice.name.length;
            if (typeof choice.value === "string") {
              charCount += choice.value.length;
            }
          }
        }

        // Count characters in subcommand options
        if (
          option.type === ApplicationCommandOptionType.SubCommand &&
          option.options
        ) {
          for (const subOption of option.options) {
            charCount += subOption.name.length + subOption.description.length;

            // Count characters in choices
            if ("choices" in subOption && subOption.choices) {
              for (const choice of subOption.choices) {
                charCount += choice.name.length;
                if (typeof choice.value === "string") {
                  charCount += choice.value.length;
                }
              }
            }
          }
        }

        // Count characters in subcommand group options
        if (
          option.type === ApplicationCommandOptionType.SubCommandGroup &&
          option.options
        ) {
          for (const subCommand of option.options) {
            charCount += subCommand.name.length + subCommand.description.length;

            if (subCommand.options) {
              for (const subOption of subCommand.options) {
                charCount +=
                  subOption.name.length + subOption.description.length;

                // Count characters in choices
                if ("choices" in subOption && subOption.choices) {
                  for (const choice of subOption.choices) {
                    charCount += choice.name.length;
                    if (typeof choice.value === "string") {
                      charCount += choice.value.length;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (charCount > COMMAND_LIMITS.TOTAL_LENGTH) {
      throw new Error(
        `Command exceeds maximum total character limit (${charCount}/${COMMAND_LIMITS.TOTAL_LENGTH})`,
      );
    }

    // Check if any options have the same name
    if (this.data.options && this.data.options.length > 0) {
      const names = new Set<string>();
      for (const option of this.data.options) {
        if (names.has(option.name)) {
          throw new Error(`Duplicate option name: ${option.name}`);
        }
        names.add(option.name);
      }
    }

    return this.data as ApplicationCommandEntity;
  }
}

/**
 * Builder for user context menu commands.
 *
 * @example
 * ```typescript
 * const command = new UserCommandBuilder()
 *   .setName('View Profile')
 *   .setDefaultMemberPermissions('0')
 *   .build();
 * ```
 */
export class UserCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new UserCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(ApplicationCommandType.User, data);

    // User commands always have an empty description
    this.data.description = "";
  }

  /**
   * Creates a new UserCommandBuilder from existing command data.
   *
   * @param data - The command data to use
   * @returns A new UserCommandBuilder instance with the provided data
   */
  static from(data: Partial<ApplicationCommandEntity>): UserCommandBuilder {
    return new UserCommandBuilder(data);
  }

  /**
   * Builds the final user command entity.
   *
   * @returns The complete user command entity
   * @throws Error if the command configuration is invalid
   */
  build(): ApplicationCommandEntity {
    this.#validate();
    return this.data as ApplicationCommandEntity;
  }

  /**
   * Validates the user command configuration.
   *
   * @returns True if the command is valid
   * @throws Error if the command configuration is invalid
   * @private
   */
  #validate(): boolean {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    if (this.data.options) {
      throw new Error("User commands cannot have options");
    }

    return true;
  }
}

/**
 * Builder for message context menu commands.
 *
 * @example
 * ```typescript
 * const command = new MessageCommandBuilder()
 *   .setName('Translate')
 *   .setDefaultMemberPermissions(null)  // Allow everyone to use it
 *   .build();
 * ```
 */
export class MessageCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new MessageCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(ApplicationCommandType.Message, data);

    // Message commands always have an empty description
    this.data.description = "";
  }

  /**
   * Creates a new MessageCommandBuilder from existing command data.
   *
   * @param data - The command data to use
   * @returns A new MessageCommandBuilder instance with the provided data
   */
  static from(data: Partial<ApplicationCommandEntity>): MessageCommandBuilder {
    return new MessageCommandBuilder(data);
  }

  /**
   * Builds the final message command entity.
   *
   * @returns The complete message command entity
   * @throws Error if the command configuration is invalid
   */
  build(): ApplicationCommandEntity {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    if (this.data.options) {
      throw new Error("Message commands cannot have options");
    }

    return this.data as ApplicationCommandEntity;
  }
}

/**
 * Builder for entry point commands (PRIMARY_ENTRY_POINT type).
 * These commands serve as the primary way to launch an app's Activity from the App Launcher.
 *
 * @example
 * ```typescript
 * const command = new EntryPointCommandBuilder()
 *   .setName('Launch Game')
 *   .setDescription('Start playing our awesome game')
 *   .setHandler(ApplicationCommandEntryPointType.DiscordLaunchActivity)
 *   .build();
 * ```
 */
export class EntryPointCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new EntryPointCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(ApplicationCommandType.PrimaryEntryPoint, data);

    // Initialize description if provided
    if (data?.description) {
      this.data.description = data.description;
    } else {
      this.data.description = "";
    }

    // Initialize handler if provided
    if (data?.handler) {
      this.data.handler = data.handler;
    } else {
      // Default to Discord handling the interaction
      this.data.handler =
        ApplicationCommandEntryPointType.DiscordLaunchActivity;
    }
  }

  /**
   * Creates a new EntryPointCommandBuilder from existing command data.
   *
   * @param data - The command data to use
   * @returns A new EntryPointCommandBuilder instance with the provided data
   */
  static from(
    data: Partial<ApplicationCommandEntity>,
  ): EntryPointCommandBuilder {
    return new EntryPointCommandBuilder(data);
  }

  /**
   * Sets the description of the command.
   *
   * @param description - The description to set (max 100 characters)
   * @returns The command builder instance for method chaining
   * @throws Error if description exceeds 100 characters
   *
   * @example
   * ```typescript
   * new EntryPointCommandBuilder().setDescription('Launch our awesome game');
   * ```
   */
  setDescription(description: string): this {
    if (description.length > COMMAND_LIMITS.DESCRIPTION) {
      throw new Error(
        `Command description cannot exceed ${COMMAND_LIMITS.DESCRIPTION} characters`,
      );
    }

    this.data.description = description;
    return this;
  }

  /**
   * Sets localizations for the command description.
   *
   * @param localizations - Dictionary of locale to localized description
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * new EntryPointCommandBuilder().setDescriptionLocalizations({
   *   'fr': 'Lancer notre jeu génial',
   *   'es-ES': 'Inicia nuestro increíble juego'
   * });
   * ```
   */
  setDescriptionLocalizations(
    localizations: Record<Locale, string> | null,
  ): this {
    // Validate each localized description
    if (localizations) {
      for (const [locale, description] of Object.entries(localizations)) {
        if (description.length > COMMAND_LIMITS.DESCRIPTION) {
          throw new Error(
            `Localized command description for ${locale} cannot exceed ${COMMAND_LIMITS.DESCRIPTION} characters`,
          );
        }
      }
    }

    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Sets the handler for the entry point command.
   * This determines how the interaction should be handled when a user invokes the command.
   *
   * @param handler - The handler type to use
   * @returns The command builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Let Discord handle launching the Activity
   * new EntryPointCommandBuilder().setHandler(ApplicationCommandEntryPointType.DiscordLaunchActivity);
   *
   * // Let the app handle the interaction
   * new EntryPointCommandBuilder().setHandler(ApplicationCommandEntryPointType.AppHandler);
   * ```
   */
  setHandler(handler: ApplicationCommandEntryPointType): this {
    this.data.handler = handler;
    return this;
  }

  /**
   * Builds the final entry point command entity.
   *
   * @returns The complete entry point command entity
   * @throws Error if the command configuration is invalid
   */
  build(): ApplicationCommandEntity {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    if (!this.data.description) {
      throw new Error("Command description is required");
    }

    if (this.data.options) {
      throw new Error("Entry point commands cannot have options");
    }

    if (!this.data.handler) {
      throw new Error("Entry point commands must have a handler specified");
    }

    return this.data as ApplicationCommandEntity;
  }
}
