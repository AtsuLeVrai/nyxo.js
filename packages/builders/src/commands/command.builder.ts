import {
  APPLICATION_COMMAND_NAME_REGEX,
  type AnyApplicationCommandEntity,
  type ApplicationCommandEntity,
  ApplicationCommandEntryPointType,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type ApplicationIntegrationType,
  type InteractionContextType,
  type LocaleValues,
} from "@nyxojs/core";
import { z } from "zod/v4";
import {
  ChatInputCommandSchema,
  EntryPointCommandSchema,
  MessageCommandSchema,
  UserCommandSchema,
} from "../schemas/index.js";
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
 * Base builder class for application commands.
 * Provides common functionality for all command types.
 *
 * @template T - The specific command entity type this builder creates
 */
export abstract class BaseCommandBuilder<
  T extends AnyApplicationCommandEntity,
> {
  /** Internal command data being constructed */
  protected readonly data: Partial<T>;

  /** Command type for this builder */
  protected readonly type: ApplicationCommandType;

  /** Schema used for validation */
  protected readonly schema: z.ZodType;

  /**
   * Creates a new BaseCommandBuilder instance.
   *
   * @param type - The type of command to build
   * @param schema - The Zod schema to use for validation
   * @param data - Optional initial data to populate the command with
   */
  protected constructor(
    type: ApplicationCommandType,
    schema: z.ZodObject,
    data?: Partial<T>,
  ) {
    this.type = type;
    this.schema = schema;

    if (data) {
      // Validate the initial data
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data = {
        type,
        ...result.data,
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
   * @param name - The name to set (max 32 characters)
   * @returns The command builder instance for method chaining
   * @throws Error if name exceeds 32 characters or doesn't match the allowed pattern
   */
  setName(name: string): this {
    if (name.length > COMMAND_LIMITS.NAME) {
      throw new Error(
        `Command name cannot exceed ${COMMAND_LIMITS.NAME} characters`,
      );
    }

    // Slash commands must use lowercase names
    const nameToSet =
      this.type === ApplicationCommandType.ChatInput
        ? name.toLowerCase()
        : name;

    if (this.type === ApplicationCommandType.ChatInput) {
      if (!APPLICATION_COMMAND_NAME_REGEX.test(nameToSet)) {
        throw new Error(
          "Slash command name must match the regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
        );
      }
    } else if (name.length === 0) {
      throw new Error("Command name cannot be empty");
    }

    this.data.name = nameToSet;
    return this;
  }

  /**
   * Sets localization for the command name in different languages.
   *
   * @param localizations - Dictionary of locale to localized name
   * @returns The command builder instance for method chaining
   */
  setNameLocalizations(
    localizations: Partial<Record<LocaleValues, string>> | null,
  ): this {
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
   * Sets the installation contexts where the command is available (global commands only).
   *
   * @param types - Array of integration types
   * @returns The command builder instance for method chaining
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
   */
  setContexts(...contexts: InteractionContextType[]): this {
    this.data.contexts = contexts;
    return this;
  }

  /**
   * Sets whether the command is available in DMs (deprecated).
   *
   * @param enabled - Whether the command is available in DMs
   * @returns The command builder instance for method chaining
   * @deprecated Use setContexts instead
   */
  setDmPermission(enabled: boolean): this {
    this.data.dm_permission = enabled;
    return this;
  }

  /**
   * Returns a JSON representation of the command.
   *
   * @returns A read-only copy of the command data
   */
  toJson(): Readonly<Partial<T>> {
    return Object.freeze({ ...this.data });
  }

  /**
   * Abstract build method to be implemented by subclasses.
   * Should return the complete command entity.
   */
  abstract build(): T;
}

/**
 * Builder for slash commands (CHAT_INPUT type).
 * These are text-based commands invoked with a / prefix.
 */
export class SlashCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new SlashCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(ApplicationCommandType.ChatInput, ChatInputCommandSchema, data);

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
   */
  setDescriptionLocalizations(
    localizations: Partial<Record<LocaleValues, string>> | null,
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
    // Validate the entire command
    const result = ChatInputCommandSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data as ApplicationCommandEntity;
  }
}

/**
 * Builder for user context menu commands.
 * These appear when right-clicking on a user.
 */
export class UserCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new UserCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(ApplicationCommandType.User, UserCommandSchema, data);

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
    // Validate the entire command
    const result = UserCommandSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data as ApplicationCommandEntity;
  }
}

/**
 * Builder for message context menu commands.
 * These appear when right-clicking on a message.
 */
export class MessageCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new MessageCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(ApplicationCommandType.Message, MessageCommandSchema, data);

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
    // Validate the entire command
    const result = MessageCommandSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data as ApplicationCommandEntity;
  }
}

/**
 * Builder for entry point commands (PRIMARY_ENTRY_POINT type).
 * These serve as the primary way to launch an app's Activity from the App Launcher.
 */
export class EntryPointCommandBuilder extends BaseCommandBuilder<ApplicationCommandEntity> {
  /**
   * Creates a new EntryPointCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the command with
   */
  constructor(data?: Partial<ApplicationCommandEntity>) {
    super(
      ApplicationCommandType.PrimaryEntryPoint,
      EntryPointCommandSchema,
      data,
    );

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
   */
  setDescriptionLocalizations(
    localizations: Partial<Record<LocaleValues, string>> | null,
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
    // Validate the entire command
    const result = EntryPointCommandSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data as ApplicationCommandEntity;
  }
}
