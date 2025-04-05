import {
  type AnyApplicationCommandOptionEntity,
  ApplicationCommandType,
  type ChatInputApplicationCommandEntity,
  type Locale,
} from "@nyxjs/core";
import { ApplicationCommandBuilder } from "./application-command.builder.js";
import {
  AttachmentOptionBuilder,
  BooleanOptionBuilder,
  ChannelOptionBuilder,
  IntegerOptionBuilder,
  MentionableOptionBuilder,
  NumberOptionBuilder,
  RoleOptionBuilder,
  StringOptionBuilder,
  SubcommandBuilder,
  SubcommandGroupBuilder,
  UserOptionBuilder,
} from "./specific-option.builders.js";

/**
 * Builder for creating slash commands (CHAT_INPUT type).
 *
 * Slash commands are text-based commands that show up when a user types / in Discord.
 * They can include options/arguments, subcommands, and subcommand groups.
 *
 * @example
 * ```typescript
 * const command = new ChatInputCommandBuilder()
 *   .setName('ping')
 *   .setDescription('Replies with Pong!')
 *   .build();
 *
 * // Command with options
 * const advancedCommand = new ChatInputCommandBuilder()
 *   .setName('echo')
 *   .setDescription('Echoes your input')
 *   .addStringOption(option =>
 *     option.setName('input')
 *       .setDescription('The input to echo back')
 *       .setRequired(true)
 *   )
 *   .build();
 * ```
 */
export class ChatInputCommandBuilder extends ApplicationCommandBuilder<
  ChatInputApplicationCommandEntity,
  ChatInputCommandBuilder
> {
  /**
   * Creates a new ChatInputCommandBuilder instance.
   *
   * @param data Optional initial command data
   */
  constructor(data: Partial<ChatInputApplicationCommandEntity> = {}) {
    super(ApplicationCommandType.ChatInput, data);
  }

  protected get self(): ChatInputCommandBuilder {
    return this;
  }

  /**
   * Sets the description of the command.
   *
   * @param description The description to set (1-100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If description exceeds 100 characters
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .setDescription('Replies with Pong!')
   * ```
   */
  setDescription(description: string): this {
    if (description.length > 100) {
      throw new Error("Command description cannot exceed 100 characters");
    }

    this.data.description = description;
    return this;
  }

  /**
   * Sets localization dictionary for the command description.
   *
   * Localized descriptions must follow the same restrictions as the description field.
   *
   * @param localizations Dictionary of localized descriptions by locale
   * @returns This builder instance, for method chaining
   * @throws Error If any localized description exceeds 100 characters
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .setDescriptionLocalizations({
   *     'fr': 'Répond avec Pong!',
   *     'es-ES': '¡Responde con Pong!'
   *   })
   * ```
   */
  setDescriptionLocalizations(
    localizations: Record<Locale, string> | null,
  ): this {
    if (localizations) {
      for (const [locale, description] of Object.entries(localizations)) {
        if (description.length > 100) {
          throw new Error(
            `Command description for locale ${locale} cannot exceed 100 characters`,
          );
        }
      }
    }

    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Sets the options for the command.
   * These are the parameters/arguments that users can provide when using the command.
   *
   * @param options Array of command options
   * @returns This builder instance, for method chaining
   * @throws Error If more than 25 options are provided
   *
   * @example
   * ```typescript
   * const stringOption = new StringOptionBuilder()
   *   .setName('input')
   *   .setDescription('The input to echo back')
   *   .setRequired(true)
   *   .build();
   *
   * new ChatInputCommandBuilder()
   *   .setOptions([stringOption])
   * ```
   */
  setOptions(options: AnyApplicationCommandOptionEntity[]): this {
    if (options.length > 25) {
      throw new Error("Commands cannot have more than 25 options");
    }

    this.data.options = options;
    return this;
  }

  /**
   * Adds a single option to the command's options.
   *
   * @param option A command option to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * const stringOption = new StringOptionBuilder()
   *   .setName('input')
   *   .setDescription('The input to echo back')
   *   .setRequired(true)
   *   .build();
   *
   * new ChatInputCommandBuilder()
   *   .addOption(stringOption)
   * ```
   */
  addOption(option: AnyApplicationCommandOptionEntity): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= 25) {
      throw new Error("Commands cannot have more than 25 options");
    }

    this.data.options.push(option);
    return this;
  }

  /**
   * Adds multiple options to the command's options.
   *
   * @param options Command options to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * const inputOption = new StringOptionBuilder()
   *   .setName('input')
   *   .setDescription('The input to echo back')
   *   .setRequired(true)
   *   .build();
   *
   * const flagOption = new BooleanOptionBuilder()
   *   .setName('ephemeral')
   *   .setDescription('Whether the response should be ephemeral')
   *   .build();
   *
   * new ChatInputCommandBuilder()
   *   .addOptions(inputOption, flagOption)
   * ```
   */
  addOptions(...options: AnyApplicationCommandOptionEntity[]): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length + options.length > 25) {
      throw new Error("Commands cannot have more than 25 options");
    }

    this.data.options.push(...options);
    return this;
  }

  /**
   * Adds a string option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addStringOption(option =>
   *     option.setName('input')
   *       .setDescription('The input to echo back')
   *       .setRequired(true)
   *   )
   * ```
   */
  addStringOption(
    fn: (option: StringOptionBuilder) => StringOptionBuilder,
  ): this {
    const option = new StringOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds an integer option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addIntegerOption(option =>
   *     option.setName('amount')
   *       .setDescription('The amount to process')
   *       .setRequired(true)
   *       .setMinValue(1)
   *       .setMaxValue(100)
   *   )
   * ```
   */
  addIntegerOption(
    fn: (option: IntegerOptionBuilder) => IntegerOptionBuilder,
  ): this {
    const option = new IntegerOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds a number option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addNumberOption(option =>
   *     option.setName('amount')
   *       .setDescription('The amount to process')
   *       .setRequired(true)
   *       .setMinValue(0.1)
   *       .setMaxValue(99.9)
   *   )
   * ```
   */
  addNumberOption(
    fn: (option: NumberOptionBuilder) => NumberOptionBuilder,
  ): this {
    const option = new NumberOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds a boolean option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addBooleanOption(option =>
   *     option.setName('ephemeral')
   *       .setDescription('Whether the response should be ephemeral')
   *   )
   * ```
   */
  addBooleanOption(
    fn: (option: BooleanOptionBuilder) => BooleanOptionBuilder,
  ): this {
    const option = new BooleanOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds a user option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addUserOption(option =>
   *     option.setName('target')
   *       .setDescription('The user to target')
   *       .setRequired(true)
   *   )
   * ```
   */
  addUserOption(fn: (option: UserOptionBuilder) => UserOptionBuilder): this {
    const option = new UserOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds a channel option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * import { ChannelType } from "@nyxjs/core";
   *
   * new ChatInputCommandBuilder()
   *   .addChannelOption(option =>
   *     option.setName('channel')
   *       .setDescription('The channel to target')
   *       .setRequired(true)
   *       .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
   *   )
   * ```
   */
  addChannelOption(
    fn: (option: ChannelOptionBuilder) => ChannelOptionBuilder,
  ): this {
    const option = new ChannelOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds a role option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addRoleOption(option =>
   *     option.setName('role')
   *       .setDescription('The role to target')
   *       .setRequired(true)
   *   )
   * ```
   */
  addRoleOption(fn: (option: RoleOptionBuilder) => RoleOptionBuilder): this {
    const option = new RoleOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds a mentionable option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addMentionableOption(option =>
   *     option.setName('target')
   *       .setDescription('The user or role to target')
   *       .setRequired(true)
   *   )
   * ```
   */
  addMentionableOption(
    fn: (option: MentionableOptionBuilder) => MentionableOptionBuilder,
  ): this {
    const option = new MentionableOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds an attachment option to the command.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .addAttachmentOption(option =>
   *     option.setName('file')
   *       .setDescription('The file to upload')
   *       .setRequired(true)
   *   )
   * ```
   */
  addAttachmentOption(
    fn: (option: AttachmentOptionBuilder) => AttachmentOptionBuilder,
  ): this {
    const option = new AttachmentOptionBuilder();
    return this.addOption(fn(option).build());
  }

  /**
   * Adds a subcommand to the command.
   *
   * @param fn A function that configures the subcommand
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options or if mixing with subcommand groups
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .setName('permissions')
   *   .setDescription('Manage permissions')
   *   .addSubcommand(subcommand =>
   *     subcommand
   *       .setName('get')
   *       .setDescription('Get permissions for a user')
   *       .addUserOption(option =>
   *         option
   *           .setName('user')
   *           .setDescription('The user to get permissions for')
   *           .setRequired(true)
   *       )
   *   )
   * ```
   */
  addSubcommand(
    fn: (subcommand: SubcommandBuilder) => SubcommandBuilder,
  ): this {
    const subcommand = new SubcommandBuilder();
    return this.addOption(fn(subcommand).build());
  }

  /**
   * Adds a subcommand group to the command.
   *
   * @param fn A function that configures the subcommand group
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options or if mixing with regular subcommands
   *
   * @example
   * ```typescript
   * new ChatInputCommandBuilder()
   *   .setName('permissions')
   *   .setDescription('Manage permissions')
   *   .addSubcommandGroup(group =>
   *     group
   *       .setName('user')
   *       .setDescription('Manage user permissions')
   *       .addSubcommand(subcommand =>
   *         subcommand
   *           .setName('get')
   *           .setDescription('Get permissions for a user')
   *           .addUserOption(option =>
   *             option
   *               .setName('user')
   *               .setDescription('The user to get permissions for')
   *               .setRequired(true)
   *           )
   *       )
   *   )
   * ```
   */
  addSubcommandGroup(
    fn: (group: SubcommandGroupBuilder) => SubcommandGroupBuilder,
  ): this {
    const group = new SubcommandGroupBuilder();
    return this.addOption(fn(group).build());
  }

  /**
   * Builds and returns the final slash command object.
   *
   * @returns The constructed slash command entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): ChatInputApplicationCommandEntity {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    if (!this.data.description) {
      throw new Error("Command description is required");
    }

    // Validate that options aren't mixing subcommands, subcommand groups, and regular options
    if (this.data.options && this.data.options?.length > 0) {
      const hasSubcommands = this.data.options.some(
        (option) => option.type === 1, // SubCommand
      );

      const hasSubcommandGroups = this.data.options.some(
        (option) => option.type === 2, // SubCommandGroup
      );

      const hasOptions = this.data.options.some(
        (option) => option.type > 2, // Any regular option type
      );

      if ((hasSubcommands || hasSubcommandGroups) && hasOptions) {
        throw new Error(
          "Commands cannot have both subcommands/subcommand groups and regular options",
        );
      }

      if (hasSubcommands && hasSubcommandGroups) {
        throw new Error(
          "Commands cannot have both subcommands and subcommand groups at the top level",
        );
      }
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandType.ChatInput;

    return this.data as ChatInputApplicationCommandEntity;
  }
}
