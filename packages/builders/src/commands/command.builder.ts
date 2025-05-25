import {
  ApplicationCommandType,
  type ApplicationIntegrationType,
} from "@nyxojs/core";
import type {
  GlobalCommandCreateOptions,
  GuildCommandCreateOptions,
} from "@nyxojs/rest";
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
 * Base builder class for application commands.
 * Provides common functionality for all command types.
 *
 * @template T - The specific command create options type this builder creates
 */
export abstract class BaseCommandBuilder<
  T extends GlobalCommandCreateOptions | GuildCommandCreateOptions,
> {
  /** Internal command data being constructed */
  protected readonly data: Partial<T>;

  /** Command type for this builder */
  protected readonly type: ApplicationCommandType;

  /**
   * Creates a new BaseCommandBuilder instance.
   *
   * @param type - The type of command to build
   * @param data - Optional initial data to populate the command with
   */
  protected constructor(type: ApplicationCommandType, data?: T) {
    this.type = type;

    if (data) {
      this.data = {
        type,
        ...data,
      } as Partial<T>;
    } else {
      this.data = {
        type,
      } as Partial<T>;
    }
  }

  /**
   * Sets the name of the command.
   *
   * @param name - The name to set (1-32 characters)
   * @returns The command builder instance for method chaining
   */
  setName(name: string): this {
    // Slash commands must use lowercase names
    this.data.name =
      this.type === ApplicationCommandType.ChatInput
        ? name.toLowerCase()
        : name;
    return this;
  }

  /**
   * Sets localization for the command name in different languages.
   *
   * @param localizations - Dictionary of locale to localized name
   * @returns The command builder instance for method chaining
   */
  setNameLocalizations(localizations: Record<string, string> | null): this {
    this.data.name_localizations = localizations;
    return this;
  }

  /**
   * Sets whether the command is age-restricted (NSFW).
   *
   * @param nsfw - Whether the command is age-restricted
   * @returns The command builder instance for method chaining
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
   */
  setDefaultMemberPermissions(permissions: string | null): this {
    this.data.default_member_permissions = permissions;
    return this;
  }

  /**
   * Sets whether the command is available in DMs (deprecated).
   *
   * @param enabled - Whether the command is available in DMs
   * @returns The command builder instance for method chaining
   * @deprecated Use setContexts instead
   */
  setDmPermission(enabled: boolean | null): this {
    this.data.dm_permission = enabled;
    return this;
  }

  /**
   * Sets whether the command is enabled by default when added to a guild (deprecated).
   *
   * @param enabled - Whether the command is enabled by default
   * @returns The command builder instance for method chaining
   * @deprecated Use setDefaultMemberPermissions instead
   */
  setDefaultPermission(enabled: boolean | null): this {
    this.data.default_permission = enabled;
    return this;
  }

  /**
   * Builds the final command data.
   *
   * @returns The complete command entity ready to be sent to Discord's API
   */
  build(): T {
    return this.data as T;
  }

  /**
   * Converts the command data to an immutable object.
   * This is useful for serialization or sending to Discord's API.
   *
   * @returns A read-only copy of the command data
   */
  toJson(): Readonly<T> {
    return Object.freeze({ ...this.data }) as T;
  }
}

/**
 * Builder for global application commands.
 * These commands are available across all guilds where the app is installed.
 */
export class GlobalCommandBuilder extends BaseCommandBuilder<GlobalCommandCreateOptions> {
  /**
   * Creates a new GlobalCommandBuilder instance.
   *
   * @param type - The type of command to build
   * @param data - Optional initial data to populate the command with
   */
  constructor(
    type: ApplicationCommandType = ApplicationCommandType.ChatInput,
    data?: GlobalCommandCreateOptions,
  ) {
    super(type, data);

    // Initialize description based on command type
    if (data?.description !== undefined) {
      this.data.description = data.description;
    } else {
      // Chat input commands need a description, others use empty string
      this.data.description =
        type === ApplicationCommandType.ChatInput ? "" : "";
    }

    if (data?.options) {
      this.data.options = [...data.options];
    }
  }

  /**
   * Creates a new GlobalCommandBuilder from existing command data.
   *
   * @param data - The command data to use
   * @returns A new GlobalCommandBuilder instance with the provided data
   */
  static from(data: GlobalCommandCreateOptions): GlobalCommandBuilder {
    return new GlobalCommandBuilder(data.type, data);
  }

  /**
   * Sets the installation contexts where the command is available.
   *
   * @param types - Array of integration types
   * @returns The command builder instance for method chaining
   */
  setIntegrationTypes(...types: ApplicationIntegrationType[]): this {
    this.data.integration_types = types;
    return this;
  }

  /**
   * Sets the interaction contexts where the command can be used.
   *
   * @param contexts - Array of interaction context types (as numbers)
   * @returns The command builder instance for method chaining
   */
  setContexts(...contexts: number[]): this {
    this.data.contexts = contexts;
    return this;
  }

  /**
   * Sets the description of the command.
   *
   * @param description - The description to set (1-100 characters)
   * @returns The command builder instance for method chaining
   */
  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  /**
   * Sets localizations for the command description.
   *
   * @param localizations - Dictionary of locale to localized description
   * @returns The command builder instance for method chaining
   */
  setDescriptionLocalizations(
    localizations: Record<string, string> | null,
  ): this {
    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Adds a string option to the command.
   *
   * @param optionBuilder - Function that configures the string option
   * @returns The command builder instance for method chaining
   */
  addStringOption(
    optionBuilder: (builder: StringOptionBuilder) => StringOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addIntegerOption(
    optionBuilder: (builder: IntegerOptionBuilder) => IntegerOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addNumberOption(
    optionBuilder: (builder: NumberOptionBuilder) => NumberOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addBooleanOption(
    optionBuilder: (builder: BooleanOptionBuilder) => BooleanOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addUserOption(
    optionBuilder: (builder: UserOptionBuilder) => UserOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addChannelOption(
    optionBuilder: (builder: ChannelOptionBuilder) => ChannelOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addRoleOption(
    optionBuilder: (builder: RoleOptionBuilder) => RoleOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addMentionableOption(
    optionBuilder: (
      builder: MentionableOptionBuilder,
    ) => MentionableOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addAttachmentOption(
    optionBuilder: (
      builder: AttachmentOptionBuilder,
    ) => AttachmentOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addSubcommand(
    subcommandBuilder: (builder: SubCommandBuilder) => SubCommandBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addSubcommandGroup(
    groupBuilder: (builder: SubCommandGroupBuilder) => SubCommandGroupBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    const builder = new SubCommandGroupBuilder();
    const result = groupBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }
}

/**
 * Builder for guild-specific application commands.
 * These commands are only available in the specific guild they're created for.
 */
export class GuildCommandBuilder extends BaseCommandBuilder<GuildCommandCreateOptions> {
  /**
   * Creates a new GuildCommandBuilder instance.
   *
   * @param type - The type of command to build
   * @param data - Optional initial data to populate the command with
   */
  constructor(
    type: ApplicationCommandType = ApplicationCommandType.ChatInput,
    data?: GuildCommandCreateOptions,
  ) {
    super(type, data);

    // Initialize description based on command type
    if (data?.description !== undefined) {
      this.data.description = data.description;
    } else {
      // Chat input commands need a description, others use empty string
      this.data.description =
        type === ApplicationCommandType.ChatInput ? "" : "";
    }

    if (data?.options) {
      this.data.options = [...data.options];
    }
  }

  /**
   * Creates a new GuildCommandBuilder from existing command data.
   *
   * @param data - The command data to use
   * @returns A new GuildCommandBuilder instance with the provided data
   */
  static from(data: GuildCommandCreateOptions): GuildCommandBuilder {
    return new GuildCommandBuilder(data.type, data);
  }

  /**
   * Sets the description of the command.
   *
   * @param description - The description to set (1-100 characters)
   * @returns The command builder instance for method chaining
   */
  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  /**
   * Sets localizations for the command description.
   *
   * @param localizations - Dictionary of locale to localized description
   * @returns The command builder instance for method chaining
   */
  setDescriptionLocalizations(
    localizations: Record<string, string> | null,
  ): this {
    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Adds a string option to the command.
   *
   * @param optionBuilder - Function that configures the string option
   * @returns The command builder instance for method chaining
   */
  addStringOption(
    optionBuilder: (builder: StringOptionBuilder) => StringOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addIntegerOption(
    optionBuilder: (builder: IntegerOptionBuilder) => IntegerOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addNumberOption(
    optionBuilder: (builder: NumberOptionBuilder) => NumberOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addBooleanOption(
    optionBuilder: (builder: BooleanOptionBuilder) => BooleanOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addUserOption(
    optionBuilder: (builder: UserOptionBuilder) => UserOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addChannelOption(
    optionBuilder: (builder: ChannelOptionBuilder) => ChannelOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addRoleOption(
    optionBuilder: (builder: RoleOptionBuilder) => RoleOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addMentionableOption(
    optionBuilder: (
      builder: MentionableOptionBuilder,
    ) => MentionableOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addAttachmentOption(
    optionBuilder: (
      builder: AttachmentOptionBuilder,
    ) => AttachmentOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addSubcommand(
    subcommandBuilder: (builder: SubCommandBuilder) => SubCommandBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
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
   */
  addSubcommandGroup(
    groupBuilder: (builder: SubCommandGroupBuilder) => SubCommandGroupBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    const builder = new SubCommandGroupBuilder();
    const result = groupBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }
}
