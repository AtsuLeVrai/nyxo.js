import {
  APPLICATION_COMMAND_NAME_REGEX,
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
import { z } from "zod/v4";
import {
  AttachmentOptionSchema,
  BooleanOptionSchema,
  ChannelOptionSchema,
  CommandOptionChoiceSchema,
  IntegerOptionSchema,
  MentionableOptionSchema,
  NumberOptionSchema,
  RoleOptionSchema,
  StringOptionSchema,
  SubCommandGroupOptionSchema,
  SubCommandOptionSchema,
  UserOptionSchema,
} from "../schemas/index.js";
import { COMMAND_LIMITS } from "../utils/index.js";

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

  /** Schema used for validation */
  protected readonly schema: z.ZodType;

  /**
   * Creates a new BaseCommandOptionBuilder instance.
   *
   * @param type - The type of option to build
   * @param schema - The Zod schema to use for validation
   * @param data - Optional initial data to populate the option with
   */
  protected constructor(
    type: ApplicationCommandOptionType,
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
   * Sets the name of the option.
   *
   * @param name - The name to set (max 32 characters)
   * @returns The option builder instance for method chaining
   */
  setName(name: string): this {
    if (name.length > COMMAND_LIMITS.OPTION_NAME) {
      throw new Error(
        `Option name cannot exceed ${COMMAND_LIMITS.OPTION_NAME} characters`,
      );
    }

    if (!APPLICATION_COMMAND_NAME_REGEX.test(name)) {
      throw new Error(
        "Option name must match the regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
      );
    }

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
    // Validate each localized name
    if (localizations) {
      for (const [locale, name] of Object.entries(localizations)) {
        if (name.length > COMMAND_LIMITS.OPTION_NAME) {
          throw new Error(
            `Localized option name for ${locale} cannot exceed ${COMMAND_LIMITS.OPTION_NAME} characters`,
          );
        }

        if (!APPLICATION_COMMAND_NAME_REGEX.test(name)) {
          throw new Error(
            `Localized option name for ${locale} must match the regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$`,
          );
        }
      }
    }

    this.data.name_localizations = localizations;
    return this;
  }

  /**
   * Sets the description of the option.
   *
   * @param description - The description to set (max 100 characters)
   * @returns The option builder instance for method chaining
   */
  setDescription(description: string): this {
    if (description.length > COMMAND_LIMITS.OPTION_DESCRIPTION) {
      throw new Error(
        `Option description cannot exceed ${COMMAND_LIMITS.OPTION_DESCRIPTION} characters`,
      );
    }

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
    // Validate each localized description
    if (localizations) {
      for (const [locale, description] of Object.entries(localizations)) {
        if (description.length > COMMAND_LIMITS.OPTION_DESCRIPTION) {
          throw new Error(
            `Localized option description for ${locale} cannot exceed ${COMMAND_LIMITS.OPTION_DESCRIPTION} characters`,
          );
        }
      }
    }

    this.data.description_localizations = localizations;
    return this;
  }

  /**
   * Returns a JSON representation of the option.
   *
   * @returns A read-only copy of the option data
   */
  toJson(): Readonly<Partial<T>> {
    return Object.freeze({ ...this.data });
  }

  /**
   * Abstract build method to be implemented by subclasses.
   * Should return the complete option entity.
   */
  abstract build(): T;
}

/**
 * Builder for creating choice objects for string/integer/number options.
 * Choices provide predefined values for users to select from.
 */
export class CommandOptionChoiceBuilder {
  /** Internal choice data being constructed */
  private readonly data: Partial<ApplicationCommandOptionChoiceEntity> = {};

  /**
   * Creates a new CommandOptionChoiceBuilder instance.
   *
   * @param data - Optional initial data to populate the choice with
   */
  constructor(data?: Partial<ApplicationCommandOptionChoiceEntity>) {
    if (data) {
      const result = CommandOptionChoiceSchema.partial().safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data = result.data;
    }
  }

  /**
   * Creates a new CommandOptionChoiceBuilder from existing choice data.
   *
   * @param data - The choice data to use
   * @returns A new CommandOptionChoiceBuilder instance with the provided data
   */
  static from(
    data: Partial<ApplicationCommandOptionChoiceEntity>,
  ): CommandOptionChoiceBuilder {
    return new CommandOptionChoiceBuilder(data);
  }

  /**
   * Sets the name of the choice as displayed to users.
   *
   * @param name - The name to set (max 100 characters)
   * @returns The choice builder instance for method chaining
   */
  setName(name: string): this {
    if (name.length > COMMAND_LIMITS.CHOICE_NAME) {
      throw new Error(
        `Choice name cannot exceed ${COMMAND_LIMITS.CHOICE_NAME} characters`,
      );
    }

    this.data.name = name;
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
    // Validate each localized name
    for (const [locale, name] of Object.entries(localizations)) {
      if (name.length > COMMAND_LIMITS.CHOICE_NAME) {
        throw new Error(
          `Localized choice name for ${locale} cannot exceed ${COMMAND_LIMITS.CHOICE_NAME} characters`,
        );
      }
    }

    this.data.name_localizations = localizations;
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
    if (
      typeof value === "string" &&
      value.length > COMMAND_LIMITS.CHOICE_STRING_VALUE
    ) {
      throw new Error(
        `Choice string value cannot exceed ${COMMAND_LIMITS.CHOICE_STRING_VALUE} characters`,
      );
    }

    this.data.value = value;
    return this;
  }

  /**
   * Builds the final choice entity.
   *
   * @returns The complete choice entity
   * @throws Error if the choice configuration is invalid
   */
  build(): ApplicationCommandOptionChoiceEntity {
    const result = CommandOptionChoiceSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<StringCommandOptionEntity>) {
    super(ApplicationCommandOptionType.String, StringOptionSchema, data);

    // Initialize choices array if needed
    if (data?.choices && !this.data.choices) {
      this.data.choices = [...data.choices];
    }
  }

  /**
   * Creates a new StringOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new StringOptionBuilder instance with the provided data
   */
  static from(data: Partial<StringCommandOptionEntity>): StringOptionBuilder {
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

    if (this.data.choices.length >= COMMAND_LIMITS.OPTION_CHOICES) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTION_CHOICES} choices to an option`,
      );
    }

    if (typeof choice === "function") {
      // Create a new choice using the builder function
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      // Validate the choice
      const result = CommandOptionChoiceSchema.safeParse(choice);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data.choices.push(result.data);
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
    if (minLength < 0 || minLength > 6000) {
      throw new Error("Minimum length must be between 0 and 6000");
    }

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
    if (maxLength < 1 || maxLength > 6000) {
      throw new Error("Maximum length must be between 1 and 6000");
    }

    this.data.max_length = maxLength;
    return this;
  }

  /**
   * Builds the final string option entity.
   *
   * @returns The complete string option entity
   * @throws Error if the option configuration is invalid
   */
  build(): StringCommandOptionEntity {
    const result = StringOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<IntegerCommandOptionEntity>) {
    super(ApplicationCommandOptionType.Integer, IntegerOptionSchema, data);

    // Initialize choices array if needed
    if (data?.choices && !this.data.choices) {
      this.data.choices = [...data.choices];
    }
  }

  /**
   * Creates a new IntegerOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new IntegerOptionBuilder instance with the provided data
   */
  static from(data: Partial<IntegerCommandOptionEntity>): IntegerOptionBuilder {
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

    if (this.data.choices.length >= COMMAND_LIMITS.OPTION_CHOICES) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTION_CHOICES} choices to an option`,
      );
    }

    let finalChoice: ApplicationCommandOptionChoiceEntity;

    if (typeof choice === "function") {
      // Create a new choice using the builder function
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      finalChoice = result.build();
    } else {
      // Use the provided choice directly
      const result = CommandOptionChoiceSchema.safeParse(choice);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      finalChoice = result.data;
    }

    // Validate that the value is an integer
    if (
      typeof finalChoice.value === "number" &&
      !Number.isInteger(finalChoice.value)
    ) {
      throw new Error("Choice value must be an integer");
    }

    this.data.choices.push(finalChoice);

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
    if (!Number.isInteger(minValue)) {
      throw new Error("Minimum value must be an integer");
    }

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
    if (!Number.isInteger(maxValue)) {
      throw new Error("Maximum value must be an integer");
    }

    this.data.max_value = maxValue;
    return this;
  }

  /**
   * Builds the final integer option entity.
   *
   * @returns The complete integer option entity
   * @throws Error if the option configuration is invalid
   */
  build(): IntegerCommandOptionEntity {
    const result = IntegerOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<NumberCommandOptionEntity>) {
    super(ApplicationCommandOptionType.Number, NumberOptionSchema, data);

    // Initialize choices array if needed
    if (data?.choices && !this.data.choices) {
      this.data.choices = [...data.choices];
    }
  }

  /**
   * Creates a new NumberOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new NumberOptionBuilder instance with the provided data
   */
  static from(data: Partial<NumberCommandOptionEntity>): NumberOptionBuilder {
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

    if (this.data.choices.length >= COMMAND_LIMITS.OPTION_CHOICES) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTION_CHOICES} choices to an option`,
      );
    }

    if (typeof choice === "function") {
      // Create a new choice using the builder function
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      // Validate the choice
      const result = CommandOptionChoiceSchema.safeParse(choice);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data.choices.push(result.data);
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

  /**
   * Builds the final number option entity.
   *
   * @returns The complete number option entity
   * @throws Error if the option configuration is invalid
   */
  build(): NumberCommandOptionEntity {
    const result = NumberOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<BooleanCommandOptionEntity>) {
    super(ApplicationCommandOptionType.Boolean, BooleanOptionSchema, data);
  }

  /**
   * Creates a new BooleanOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new BooleanOptionBuilder instance with the provided data
   */
  static from(data: Partial<BooleanCommandOptionEntity>): BooleanOptionBuilder {
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

  /**
   * Builds the final boolean option entity.
   *
   * @returns The complete boolean option entity
   * @throws Error if the option configuration is invalid
   */
  build(): BooleanCommandOptionEntity {
    const result = BooleanOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<UserCommandOptionEntity>) {
    super(ApplicationCommandOptionType.User, UserOptionSchema, data);
  }

  /**
   * Creates a new UserOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new UserOptionBuilder instance with the provided data
   */
  static from(data: Partial<UserCommandOptionEntity>): UserOptionBuilder {
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

  /**
   * Builds the final user option entity.
   *
   * @returns The complete user option entity
   * @throws Error if the option configuration is invalid
   */
  build(): UserCommandOptionEntity {
    const result = UserOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<ChannelCommandOptionEntity>) {
    super(ApplicationCommandOptionType.Channel, ChannelOptionSchema, data);

    // Initialize channel_types array if needed
    if (data?.channel_types && !this.data.channel_types) {
      this.data.channel_types = [...data.channel_types];
    }
  }

  /**
   * Creates a new ChannelOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new ChannelOptionBuilder instance with the provided data
   */
  static from(data: Partial<ChannelCommandOptionEntity>): ChannelOptionBuilder {
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

  /**
   * Builds the final channel option entity.
   *
   * @returns The complete channel option entity
   * @throws Error if the option configuration is invalid
   */
  build(): ChannelCommandOptionEntity {
    const result = ChannelOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<RoleCommandOptionEntity>) {
    super(ApplicationCommandOptionType.Role, RoleOptionSchema, data);
  }

  /**
   * Creates a new RoleOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new RoleOptionBuilder instance with the provided data
   */
  static from(data: Partial<RoleCommandOptionEntity>): RoleOptionBuilder {
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

  /**
   * Builds the final role option entity.
   *
   * @returns The complete role option entity
   * @throws Error if the option configuration is invalid
   */
  build(): RoleCommandOptionEntity {
    const result = RoleOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<MentionableCommandOptionEntity>) {
    super(
      ApplicationCommandOptionType.Mentionable,
      MentionableOptionSchema,
      data,
    );
  }

  /**
   * Creates a new MentionableOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new MentionableOptionBuilder instance with the provided data
   */
  static from(
    data: Partial<MentionableCommandOptionEntity>,
  ): MentionableOptionBuilder {
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

  /**
   * Builds the final mentionable option entity.
   *
   * @returns The complete mentionable option entity
   * @throws Error if the option configuration is invalid
   */
  build(): MentionableCommandOptionEntity {
    const result = MentionableOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<AttachmentCommandOptionEntity>) {
    super(
      ApplicationCommandOptionType.Attachment,
      AttachmentOptionSchema,
      data,
    );
  }

  /**
   * Creates a new AttachmentOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new AttachmentOptionBuilder instance with the provided data
   */
  static from(
    data: Partial<AttachmentCommandOptionEntity>,
  ): AttachmentOptionBuilder {
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

  /**
   * Builds the final attachment option entity.
   *
   * @returns The complete attachment option entity
   * @throws Error if the option configuration is invalid
   */
  build(): AttachmentCommandOptionEntity {
    const result = AttachmentOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<SubCommandOptionEntity>) {
    super(
      ApplicationCommandOptionType.SubCommand,
      SubCommandOptionSchema,
      data,
    );

    // Initialize options array if needed
    if (data?.options && !this.data.options) {
      this.data.options = [...data.options];
    }
  }

  /**
   * Creates a new SubCommandBuilder from existing subcommand data.
   *
   * @param data - The subcommand data to use
   * @returns A new SubCommandBuilder instance with the provided data
   */
  static from(data: Partial<SubCommandOptionEntity>): SubCommandBuilder {
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
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

    if (this.data.options.length >= COMMAND_LIMITS.OPTIONS) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
      );
    }

    const builder = new AttachmentOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());

    return this;
  }

  /**
   * Builds the final subcommand option entity.
   *
   * @returns The complete subcommand option entity
   * @throws Error if the subcommand configuration is invalid
   */
  build(): SubCommandOptionEntity {
    const result = SubCommandOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
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
  constructor(data?: Partial<SubCommandGroupOptionEntity>) {
    super(
      ApplicationCommandOptionType.SubCommandGroup,
      SubCommandGroupOptionSchema,
      data,
    );

    // Initialize options array if needed
    if (data?.options && !this.data.options) {
      this.data.options = [...data.options];
    } else if (!this.data.options) {
      this.data.options = [];
    }
  }

  /**
   * Creates a new SubCommandGroupBuilder from existing subcommand group data.
   *
   * @param data - The subcommand group data to use
   * @returns A new SubCommandGroupBuilder instance with the provided data
   */
  static from(
    data: Partial<SubCommandGroupOptionEntity>,
  ): SubCommandGroupBuilder {
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
    if (
      this.data.options &&
      this.data.options.length >= COMMAND_LIMITS.OPTIONS
    ) {
      throw new Error(
        `Cannot add more than ${COMMAND_LIMITS.OPTIONS} subcommands to a group`,
      );
    }

    if (typeof subcommand === "function") {
      // Create a new subcommand using the builder function
      const builder = new SubCommandBuilder();
      const result = subcommand(builder);
      this.data.options?.push(result.build());
    } else {
      // Validate the subcommand
      const result = SubCommandOptionSchema.safeParse(subcommand);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data.options?.push(result.data);
    }

    return this;
  }

  /**
   * Builds the final subcommand group option entity.
   *
   * @returns The complete subcommand group option entity
   * @throws Error if the subcommand group configuration is invalid
   */
  build(): SubCommandGroupOptionEntity {
    const result = SubCommandGroupOptionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }
}
