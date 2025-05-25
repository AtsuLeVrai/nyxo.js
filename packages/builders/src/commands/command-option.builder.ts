import {
  type AnyApplicationCommandOptionEntity,
  type ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  type AttachmentCommandOptionEntity,
  type BooleanCommandOptionEntity,
  type ChannelCommandOptionEntity,
  type ChannelType,
  type IntegerCommandOptionEntity,
  type LocaleValues,
  type MentionableCommandOptionEntity,
  type NumberCommandOptionEntity,
  type RoleCommandOptionEntity,
  type StringCommandOptionEntity,
  type SubCommandGroupOptionEntity,
  type SubCommandOptionEntity,
  type UserCommandOptionEntity,
} from "@nyxojs/core";

/**
 * Base class for all application command option builders.
 * Provides common functionality for all option types.
 *
 * @template T - The specific option entity type this builder creates
 */
export abstract class BaseCommandOptionBuilder<
  T extends AnyApplicationCommandOptionEntity,
> {
  /** Internal option data being constructed */
  protected readonly data: Partial<T>;

  /** Option type for this builder */
  protected readonly type: ApplicationCommandOptionType;

  /**
   * Creates a new BaseCommandOptionBuilder instance.
   *
   * @param type - The type of option to build
   * @param data - Optional initial data to populate the option with
   */
  protected constructor(type: ApplicationCommandOptionType, data?: T) {
    this.type = type;

    if (data) {
      this.data = {
        ...data,
        type,
      } as Partial<T>;
    } else {
      this.data = {
        type,
      } as Partial<T>;
    }
  }

  /**
   * Sets the name of the option.
   *
   * @param name - The name to set (1-32 characters)
   * @returns The option builder instance for method chaining
   */
  setName(name: string): this {
    this.data.name = name.toLowerCase();
    return this;
  }

  /**
   * Sets localization for the option name in different languages.
   *
   * @param localizations - Dictionary of locale to localized name
   * @returns The option builder instance for method chaining
   */
  setNameLocalizations(
    localizations: Partial<Record<LocaleValues, string>> | null,
  ): this {
    this.data.name_localizations = localizations;
    return this;
  }

  /**
   * Sets the description of the option.
   *
   * @param description - The description to set (1-100 characters)
   * @returns The option builder instance for method chaining
   */
  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  /**
   * Sets localizations for the option description.
   *
   * @param localizations - Dictionary of locale to localized description
   * @returns The option builder instance for method chaining
   */
  setDescriptionLocalizations(
    localizations: Partial<Record<LocaleValues, string>> | null,
  ): this {
    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Builds the final command option entity.
   *
   * @returns The complete command option entity ready to be sent to Discord's API
   */
  build(): T {
    return this.data as T;
  }

  /**
   * Converts the command option data to an immutable object.
   * This is useful for serialization or sending to Discord's API.
   *
   * @returns A read-only copy of the command option data
   */
  toJson(): Readonly<T> {
    return Object.freeze({ ...this.data }) as T;
  }
}

/**
 * Builder for creating choice objects for string/integer/number options.
 * Choices provide predefined values for users to select from.
 */
export class CommandOptionChoiceBuilder {
  /** Internal choice data being constructed */
  readonly #data: Partial<ApplicationCommandOptionChoiceEntity> = {};

  /**
   * Creates a new CommandOptionChoiceBuilder instance.
   *
   * @param data - Optional initial data to populate the choice with
   */
  constructor(data?: ApplicationCommandOptionChoiceEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new CommandOptionChoiceBuilder from existing choice data.
   *
   * @param data - The choice data to use
   * @returns A new CommandOptionChoiceBuilder instance with the provided data
   */
  static from(
    data: ApplicationCommandOptionChoiceEntity,
  ): CommandOptionChoiceBuilder {
    return new CommandOptionChoiceBuilder(data);
  }

  /**
   * Sets the name of the choice as displayed to users.
   *
   * @param name - The name to set (1-100 characters)
   * @returns The choice builder instance for method chaining
   */
  setName(name: string): this {
    this.#data.name = name;
    return this;
  }

  /**
   * Sets localization for the choice name in different languages.
   *
   * @param localizations - Dictionary of locale to localized name
   * @returns The choice builder instance for method chaining
   */
  setNameLocalizations(
    localizations: Partial<Record<LocaleValues, string>>,
  ): this {
    this.#data.name_localizations = localizations;
    return this;
  }

  /**
   * Sets the value of the choice.
   * This is the value sent to your application when this choice is selected.
   *
   * @param value - The value to set (string or number)
   * @returns The choice builder instance for method chaining
   */
  setValue(value: string | number): this {
    this.#data.value = value;
    return this;
  }

  /**
   * Builds the final choice entity.
   *
   * @returns The complete choice entity
   */
  build(): ApplicationCommandOptionChoiceEntity {
    return this.#data as ApplicationCommandOptionChoiceEntity;
  }

  /**
   * Converts the choice data to an immutable object.
   * This is useful for serialization or sending to Discord's API.
   *
   * @returns A read-only copy of the choice data
   */
  toJson(): Readonly<ApplicationCommandOptionChoiceEntity> {
    return Object.freeze({
      ...this.#data,
    }) as ApplicationCommandOptionChoiceEntity;
  }
}

/**
 * Builder for string command options.
 * Allows text input with optional choices or autocomplete.
 */
export class StringOptionBuilder extends BaseCommandOptionBuilder<StringCommandOptionEntity> {
  /**
   * Creates a new StringOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: StringCommandOptionEntity) {
    super(ApplicationCommandOptionType.String, data);

    // Initialize choices array if needed
    if (data?.choices) {
      this.data.choices = [...data.choices];
    }
  }

  /**
   * Creates a new StringOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new StringOptionBuilder instance with the provided data
   */
  static from(data: StringCommandOptionEntity): StringOptionBuilder {
    return new StringOptionBuilder(data);
  }

  /**
   * Adds a choice to the string option.
   *
   * @param choice - The choice to add or a function that returns a choice
   * @returns The option builder instance for method chaining
   */
  addChoice(
    choice:
      | ApplicationCommandOptionChoiceEntity
      | ((builder: CommandOptionChoiceBuilder) => CommandOptionChoiceBuilder),
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }

    if (typeof choice === "function") {
      // Create a new choice using the builder function
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      this.data.choices.push(choice);
    }

    return this;
  }

  /**
   * Adds multiple choices to the string option.
   *
   * @param choices - Array of choices to add
   * @returns The option builder instance for method chaining
   */
  addChoices(...choices: ApplicationCommandOptionChoiceEntity[]): this {
    for (const choice of choices) {
      this.addChoice(choice);
    }
    return this;
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  /**
   * Sets whether autocomplete is enabled for this option.
   * Cannot be true if choices are present.
   *
   * @param autocomplete - Whether autocomplete is enabled
   * @returns The option builder instance for method chaining
   */
  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }

  /**
   * Sets the minimum length for the string value.
   *
   * @param minLength - The minimum length (minimum of 0, maximum of 6000)
   * @returns The option builder instance for method chaining
   */
  setMinLength(minLength: number): this {
    this.data.min_length = minLength;
    return this;
  }

  /**
   * Sets the maximum length for the string value.
   *
   * @param maxLength - The maximum length (minimum of 1, maximum of 6000)
   * @returns The option builder instance for method chaining
   */
  setMaxLength(maxLength: number): this {
    this.data.max_length = maxLength;
    return this;
  }
}

/**
 * Builder for integer command options.
 * Allows integer input with optional choices or autocomplete.
 */
export class IntegerOptionBuilder extends BaseCommandOptionBuilder<IntegerCommandOptionEntity> {
  /**
   * Creates a new IntegerOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: IntegerCommandOptionEntity) {
    super(ApplicationCommandOptionType.Integer, data);

    // Initialize choices array if needed
    if (data?.choices) {
      this.data.choices = [...data.choices];
    }
  }

  /**
   * Creates a new IntegerOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new IntegerOptionBuilder instance with the provided data
   */
  static from(data: IntegerCommandOptionEntity): IntegerOptionBuilder {
    return new IntegerOptionBuilder(data);
  }

  /**
   * Adds a choice to the integer option.
   *
   * @param choice - The choice to add or a function that returns a choice
   * @returns The option builder instance for method chaining
   */
  addChoice(
    choice:
      | ApplicationCommandOptionChoiceEntity
      | ((builder: CommandOptionChoiceBuilder) => CommandOptionChoiceBuilder),
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }

    if (typeof choice === "function") {
      // Create a new choice using the builder function
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      this.data.choices.push(choice);
    }

    return this;
  }

  /**
   * Adds multiple choices to the integer option.
   *
   * @param choices - Array of choices to add
   * @returns The option builder instance for method chaining
   */
  addChoices(...choices: ApplicationCommandOptionChoiceEntity[]): this {
    for (const choice of choices) {
      this.addChoice(choice);
    }
    return this;
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  /**
   * Sets whether autocomplete is enabled for this option.
   * Cannot be true if choices are present.
   *
   * @param autocomplete - Whether autocomplete is enabled
   * @returns The option builder instance for method chaining
   */
  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }

  /**
   * Sets the minimum value for the integer option.
   *
   * @param minValue - The minimum value (-2^53 to 2^53)
   * @returns The option builder instance for method chaining
   */
  setMinValue(minValue: number): this {
    this.data.min_value = minValue;
    return this;
  }

  /**
   * Sets the maximum value for the integer option.
   *
   * @param maxValue - The maximum value (-2^53 to 2^53)
   * @returns The option builder instance for method chaining
   */
  setMaxValue(maxValue: number): this {
    this.data.max_value = maxValue;
    return this;
  }
}

/**
 * Builder for number command options (floating point values).
 * Allows numeric input with optional choices or autocomplete.
 */
export class NumberOptionBuilder extends BaseCommandOptionBuilder<NumberCommandOptionEntity> {
  /**
   * Creates a new NumberOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: NumberCommandOptionEntity) {
    super(ApplicationCommandOptionType.Number, data);

    // Initialize choices array if needed
    if (data?.choices) {
      this.data.choices = [...data.choices];
    }
  }

  /**
   * Creates a new NumberOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new NumberOptionBuilder instance with the provided data
   */
  static from(data: NumberCommandOptionEntity): NumberOptionBuilder {
    return new NumberOptionBuilder(data);
  }

  /**
   * Adds a choice to the number option.
   *
   * @param choice - The choice to add or a function that returns a choice
   * @returns The option builder instance for method chaining
   */
  addChoice(
    choice:
      | ApplicationCommandOptionChoiceEntity
      | ((builder: CommandOptionChoiceBuilder) => CommandOptionChoiceBuilder),
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }

    if (typeof choice === "function") {
      // Create a new choice using the builder function
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      this.data.choices.push(choice);
    }

    return this;
  }

  /**
   * Adds multiple choices to the number option.
   *
   * @param choices - Array of choices to add
   * @returns The option builder instance for method chaining
   */
  addChoices(...choices: ApplicationCommandOptionChoiceEntity[]): this {
    for (const choice of choices) {
      this.addChoice(choice);
    }
    return this;
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  /**
   * Sets whether autocomplete is enabled for this option.
   * Cannot be true if choices are present.
   *
   * @param autocomplete - Whether autocomplete is enabled
   * @returns The option builder instance for method chaining
   */
  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }

  /**
   * Sets the minimum value for the number option.
   *
   * @param minValue - The minimum value (-2^53 to 2^53)
   * @returns The option builder instance for method chaining
   */
  setMinValue(minValue: number): this {
    this.data.min_value = minValue;
    return this;
  }

  /**
   * Sets the maximum value for the number option.
   *
   * @param maxValue - The maximum value (-2^53 to 2^53)
   * @returns The option builder instance for method chaining
   */
  setMaxValue(maxValue: number): this {
    this.data.max_value = maxValue;
    return this;
  }
}

/**
 * Builder for boolean command options.
 * Provides a simple true/false toggle.
 */
export class BooleanOptionBuilder extends BaseCommandOptionBuilder<BooleanCommandOptionEntity> {
  /**
   * Creates a new BooleanOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: BooleanCommandOptionEntity) {
    super(ApplicationCommandOptionType.Boolean, data);
  }

  /**
   * Creates a new BooleanOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new BooleanOptionBuilder instance with the provided data
   */
  static from(data: BooleanCommandOptionEntity): BooleanOptionBuilder {
    return new BooleanOptionBuilder(data);
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

/**
 * Builder for user command options.
 * Allows selecting a user from the guild.
 */
export class UserOptionBuilder extends BaseCommandOptionBuilder<UserCommandOptionEntity> {
  /**
   * Creates a new UserOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: UserCommandOptionEntity) {
    super(ApplicationCommandOptionType.User, data);
  }

  /**
   * Creates a new UserOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new UserOptionBuilder instance with the provided data
   */
  static from(data: UserCommandOptionEntity): UserOptionBuilder {
    return new UserOptionBuilder(data);
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

/**
 * Builder for channel command options.
 * Allows selecting a channel from the guild.
 */
export class ChannelOptionBuilder extends BaseCommandOptionBuilder<ChannelCommandOptionEntity> {
  /**
   * Creates a new ChannelOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: ChannelCommandOptionEntity) {
    super(ApplicationCommandOptionType.Channel, data);

    // Initialize channel_types array if needed
    if (data?.channel_types) {
      this.data.channel_types = [...data.channel_types];
    }
  }

  /**
   * Creates a new ChannelOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new ChannelOptionBuilder instance with the provided data
   */
  static from(data: ChannelCommandOptionEntity): ChannelOptionBuilder {
    return new ChannelOptionBuilder(data);
  }

  /**
   * Adds a channel type to the option's filter.
   *
   * @param channelType - The channel type to add
   * @returns The option builder instance for method chaining
   */
  addChannelType(channelType: ChannelType): this {
    if (!this.data.channel_types) {
      this.data.channel_types = [];
    }

    if (!this.data.channel_types.includes(channelType)) {
      this.data.channel_types.push(channelType);
    }

    return this;
  }

  /**
   * Sets the channel types for the option's filter.
   *
   * @param channelTypes - The channel types to set
   * @returns The option builder instance for method chaining
   */
  setChannelTypes(...channelTypes: ChannelType[]): this {
    this.data.channel_types = [...channelTypes];
    return this;
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

/**
 * Builder for role command options.
 * Allows selecting a role from the guild.
 */
export class RoleOptionBuilder extends BaseCommandOptionBuilder<RoleCommandOptionEntity> {
  /**
   * Creates a new RoleOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: RoleCommandOptionEntity) {
    super(ApplicationCommandOptionType.Role, data);
  }

  /**
   * Creates a new RoleOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new RoleOptionBuilder instance with the provided data
   */
  static from(data: RoleCommandOptionEntity): RoleOptionBuilder {
    return new RoleOptionBuilder(data);
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

/**
 * Builder for mentionable command options (users and roles).
 * Allows selecting users or roles from the guild.
 */
export class MentionableOptionBuilder extends BaseCommandOptionBuilder<MentionableCommandOptionEntity> {
  /**
   * Creates a new MentionableOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: MentionableCommandOptionEntity) {
    super(ApplicationCommandOptionType.Mentionable, data);
  }

  /**
   * Creates a new MentionableOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new MentionableOptionBuilder instance with the provided data
   */
  static from(data: MentionableCommandOptionEntity): MentionableOptionBuilder {
    return new MentionableOptionBuilder(data);
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

/**
 * Builder for attachment command options.
 * Allows file uploads.
 */
export class AttachmentOptionBuilder extends BaseCommandOptionBuilder<AttachmentCommandOptionEntity> {
  /**
   * Creates a new AttachmentOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: AttachmentCommandOptionEntity) {
    super(ApplicationCommandOptionType.Attachment, data);
  }

  /**
   * Creates a new AttachmentOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new AttachmentOptionBuilder instance with the provided data
   */
  static from(data: AttachmentCommandOptionEntity): AttachmentOptionBuilder {
    return new AttachmentOptionBuilder(data);
  }

  /**
   * Sets whether this option is required.
   *
   * @param required - Whether the option is required
   * @returns The option builder instance for method chaining
   */
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

/**
 * Builder for subcommand options.
 * Creates a nested command within a parent command.
 */
export class SubCommandBuilder extends BaseCommandOptionBuilder<SubCommandOptionEntity> {
  /**
   * Creates a new SubCommandBuilder instance.
   *
   * @param data - Optional initial data to populate the subcommand with
   */
  constructor(data?: SubCommandOptionEntity) {
    super(ApplicationCommandOptionType.SubCommand, data);

    // Initialize options array if needed
    if (data?.options) {
      this.data.options = [...data.options];
    }
  }

  /**
   * Creates a new SubCommandBuilder from existing subcommand data.
   *
   * @param data - The subcommand data to use
   * @returns A new SubCommandBuilder instance with the provided data
   */
  static from(data: SubCommandOptionEntity): SubCommandBuilder {
    return new SubCommandBuilder(data);
  }

  /**
   * Adds a string option to the subcommand.
   *
   * @param optionBuilder - Function that configures the string option
   * @returns The subcommand builder instance for method chaining
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
   * Adds an integer option to the subcommand.
   *
   * @param optionBuilder - Function that configures the integer option
   * @returns The subcommand builder instance for method chaining
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
   * Adds a number option to the subcommand.
   *
   * @param optionBuilder - Function that configures the number option
   * @returns The subcommand builder instance for method chaining
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
   * Adds a boolean option to the subcommand.
   *
   * @param optionBuilder - Function that configures the boolean option
   * @returns The subcommand builder instance for method chaining
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
   * Adds a user option to the subcommand.
   *
   * @param optionBuilder - Function that configures the user option
   * @returns The subcommand builder instance for method chaining
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
   * Adds a channel option to the subcommand.
   *
   * @param optionBuilder - Function that configures the channel option
   * @returns The subcommand builder instance for method chaining
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
   * Adds a role option to the subcommand.
   *
   * @param optionBuilder - Function that configures the role option
   * @returns The subcommand builder instance for method chaining
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
   * Adds a mentionable option to the subcommand.
   *
   * @param optionBuilder - Function that configures the mentionable option
   * @returns The subcommand builder instance for method chaining
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
   * Adds an attachment option to the subcommand.
   *
   * @param optionBuilder - Function that configures the attachment option
   * @returns The subcommand builder instance for method chaining
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
}

/**
 * Builder for subcommand group options.
 * Creates a group of related subcommands.
 */
export class SubCommandGroupBuilder extends BaseCommandOptionBuilder<SubCommandGroupOptionEntity> {
  /**
   * Creates a new SubCommandGroupBuilder instance.
   *
   * @param data - Optional initial data to populate the subcommand group with
   */
  constructor(data?: SubCommandGroupOptionEntity) {
    super(ApplicationCommandOptionType.SubCommandGroup, data);

    // Initialize options array if needed
    if (data?.options) {
      this.data.options = [...data.options];
    } else {
      this.data.options = [];
    }
  }

  /**
   * Creates a new SubCommandGroupBuilder from existing subcommand group data.
   *
   * @param data - The subcommand group data to use
   * @returns A new SubCommandGroupBuilder instance with the provided data
   */
  static from(data: SubCommandGroupOptionEntity): SubCommandGroupBuilder {
    return new SubCommandGroupBuilder(data);
  }

  /**
   * Adds a subcommand to the group.
   *
   * @param subcommand - The subcommand to add or a function that returns a subcommand
   * @returns The subcommand group builder instance for method chaining
   */
  addSubcommand(
    subcommand:
      | SubCommandOptionEntity
      | ((builder: SubCommandBuilder) => SubCommandBuilder),
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (typeof subcommand === "function") {
      // Create a new subcommand using the builder function
      const builder = new SubCommandBuilder();
      const result = subcommand(builder);
      this.data.options.push(result.build());
    } else {
      this.data.options.push(subcommand);
    }

    return this;
  }
}
