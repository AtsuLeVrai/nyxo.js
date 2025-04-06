import {
  type ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  type AttachmentOptionEntity,
  type BooleanOptionEntity,
  type ChannelOptionEntity,
  type ChannelType,
  type IntegerOptionEntity,
  type Locale,
  type MentionableOptionEntity,
  type NumberOptionEntity,
  type RoleOptionEntity,
  type StringOptionEntity,
  type SubGroupOptionEntity,
  type SubOptionEntity,
  type UserOptionEntity,
} from "@nyxjs/core";
import { ApplicationCommandOptionBuilder } from "./application-command-option.builder.js";

/**
 * Builder for creating string command options.
 *
 * String options allow users to input text values.
 *
 * @example
 * ```typescript
 * const option = new StringOptionBuilder()
 *   .setName('input')
 *   .setDescription('The input text')
 *   .setRequired(true)
 *   .setMinLength(1)
 *   .setMaxLength(100)
 *   .build();
 * ```
 */
export class StringOptionBuilder extends ApplicationCommandOptionBuilder<
  StringOptionEntity,
  StringOptionBuilder
> {
  /**
   * Creates a new StringOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<StringOptionEntity> = {}) {
    super(ApplicationCommandOptionType.String, data);
  }

  protected get self(): StringOptionBuilder {
    return this;
  }

  /**
   * Sets the minimum allowed length for the string input.
   *
   * @param minLength The minimum length (0-6000)
   * @returns This builder instance, for method chaining
   * @throws Error If minLength is outside the valid range
   */
  setMinLength(minLength: number): this {
    if (minLength < 0 || minLength > 6000) {
      throw new Error(
        "String option minimum length must be between 0 and 6000",
      );
    }

    this.data.min_length = minLength;
    return this;
  }

  /**
   * Sets the maximum allowed length for the string input.
   *
   * @param maxLength The maximum length (1-6000)
   * @returns This builder instance, for method chaining
   * @throws Error If maxLength is outside the valid range
   */
  setMaxLength(maxLength: number): this {
    if (maxLength < 1 || maxLength > 6000) {
      throw new Error(
        "String option maximum length must be between 1 and 6000",
      );
    }

    this.data.max_length = maxLength;
    return this;
  }

  /**
   * Sets the choices for this option.
   * If choices are provided, users can only select from these predefined values.
   *
   * @param choices Array of choice objects
   * @returns This builder instance, for method chaining
   * @throws Error If more than 25 choices are provided or if autocomplete is enabled
   */
  setChoices(choices: ApplicationCommandOptionChoiceEntity[]): this {
    if (choices.length > 25) {
      throw new Error("String option cannot have more than 25 choices");
    }

    if (this.data.autocomplete) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    this.data.choices = choices;
    return this;
  }

  /**
   * Adds a single choice to this option.
   *
   * @param name The display name of the choice
   * @param value The string value of the choice
   * @param nameLocalizations Optional localized names for the choice
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 choices, if autocomplete is enabled, or if name/value are invalid
   */
  addChoice(
    name: string,
    value: string,
    nameLocalizations?: Record<Locale, string>,
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }

    if (this.data.choices.length >= 25) {
      throw new Error("String option cannot have more than 25 choices");
    }

    if (this.data.autocomplete) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    if (name.length > 100) {
      throw new Error("Choice name cannot exceed 100 characters");
    }

    if (value.length > 100) {
      throw new Error("Choice value cannot exceed 100 characters");
    }

    if (nameLocalizations) {
      for (const [locale, localizedName] of Object.entries(nameLocalizations)) {
        if (localizedName.length > 100) {
          throw new Error(
            `Choice name for locale ${locale} cannot exceed 100 characters`,
          );
        }
      }
    }

    this.data.choices.push({
      name,
      value,
      name_localizations: nameLocalizations || null,
    });

    return this;
  }

  /**
   * Enables or disables autocomplete for this option.
   * When enabled, your application will receive typed inputs and can dynamically
   * suggest values to the user.
   *
   * @param autocomplete Whether to enable autocomplete
   * @returns This builder instance, for method chaining
   * @throws Error If choices are already set
   */
  setAutocomplete(autocomplete = true): this {
    if (autocomplete && this.data.choices && this.data.choices?.length > 0) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    this.data.autocomplete = autocomplete;
    return this;
  }

  /**
   * Builds and returns the final string option object.
   *
   * @returns The constructed string option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): StringOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    if (
      this.data.min_length !== undefined &&
      this.data.max_length !== undefined &&
      this.data.min_length > this.data.max_length
    ) {
      throw new Error(
        "Option minimum length cannot be greater than maximum length",
      );
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.String;

    return this.data as StringOptionEntity;
  }
}

/**
 * Builder for creating integer command options.
 *
 * Integer options allow users to input whole number values.
 *
 * @example
 * ```typescript
 * const option = new IntegerOptionBuilder()
 *   .setName('amount')
 *   .setDescription('The amount to process')
 *   .setRequired(true)
 *   .setMinValue(1)
 *   .setMaxValue(100)
 *   .build();
 * ```
 */
export class IntegerOptionBuilder extends ApplicationCommandOptionBuilder<
  IntegerOptionEntity,
  IntegerOptionBuilder
> {
  /**
   * Creates a new IntegerOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<IntegerOptionEntity> = {}) {
    super(ApplicationCommandOptionType.Integer, data);
  }

  protected get self(): IntegerOptionBuilder {
    return this;
  }

  /**
   * Sets the minimum value allowed for the integer input.
   *
   * @param minValue The minimum value (must be an integer between -2^53 and 2^53)
   * @returns This builder instance, for method chaining
   * @throws Error If minValue is not a valid integer
   */
  setMinValue(minValue: number): this {
    if (!Number.isInteger(minValue)) {
      throw new Error("Option minimum value must be an integer");
    }

    this.data.min_value = minValue;
    return this;
  }

  /**
   * Sets the maximum value allowed for the integer input.
   *
   * @param maxValue The maximum value (must be an integer between -2^53 and 2^53)
   * @returns This builder instance, for method chaining
   * @throws Error If maxValue is not a valid integer
   */
  setMaxValue(maxValue: number): this {
    if (!Number.isInteger(maxValue)) {
      throw new Error("Option maximum value must be an integer");
    }

    this.data.max_value = maxValue;
    return this;
  }

  /**
   * Sets the choices for this option.
   * If choices are provided, users can only select from these predefined values.
   *
   * @param choices Array of choice objects
   * @returns This builder instance, for method chaining
   * @throws Error If more than 25 choices are provided or if autocomplete is enabled
   */
  setChoices(choices: ApplicationCommandOptionChoiceEntity[]): this {
    if (choices.length > 25) {
      throw new Error("Integer option cannot have more than 25 choices");
    }

    if (this.data.autocomplete) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    // Validate that all choice values are integers
    for (const choice of choices) {
      if (typeof choice.value === "number" && !Number.isInteger(choice.value)) {
        throw new Error("Integer option choices must have integer values");
      }
    }

    this.data.choices = choices;
    return this;
  }

  /**
   * Adds a single choice to this option.
   *
   * @param name The display name of the choice
   * @param value The integer value of the choice
   * @param nameLocalizations Optional localized names for the choice
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 choices, if autocomplete is enabled, or if name/value are invalid
   */
  addChoice(
    name: string,
    value: number,
    nameLocalizations?: Record<Locale, string>,
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }

    if (this.data.choices.length >= 25) {
      throw new Error("Integer option cannot have more than 25 choices");
    }

    if (this.data.autocomplete) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    if (!Number.isInteger(value)) {
      throw new Error("Integer option choice value must be an integer");
    }

    if (name.length > 100) {
      throw new Error("Choice name cannot exceed 100 characters");
    }

    if (nameLocalizations) {
      for (const [locale, localizedName] of Object.entries(nameLocalizations)) {
        if (localizedName.length > 100) {
          throw new Error(
            `Choice name for locale ${locale} cannot exceed 100 characters`,
          );
        }
      }
    }

    this.data.choices.push({
      name,
      value,
      name_localizations: nameLocalizations || null,
    });

    return this;
  }

  /**
   * Enables or disables autocomplete for this option.
   * When enabled, your application will receive typed inputs and can dynamically
   * suggest values to the user.
   *
   * @param autocomplete Whether to enable autocomplete
   * @returns This builder instance, for method chaining
   * @throws Error If choices are already set
   */
  setAutocomplete(autocomplete = true): this {
    if (autocomplete && this.data.choices && this.data.choices?.length > 0) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    this.data.autocomplete = autocomplete;
    return this;
  }

  /**
   * Builds and returns the final integer option object.
   *
   * @returns The constructed integer option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): IntegerOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    if (
      this.data.min_value !== undefined &&
      this.data.max_value !== undefined &&
      this.data.min_value > this.data.max_value
    ) {
      throw new Error(
        "Option minimum value cannot be greater than maximum value",
      );
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.Integer;

    return this.data as IntegerOptionEntity;
  }
}

/**
 * Builder for creating number command options.
 *
 * Number options allow users to input floating-point values.
 *
 * @example
 * ```typescript
 * const option = new NumberOptionBuilder()
 *   .setName('amount')
 *   .setDescription('The amount to process')
 *   .setRequired(true)
 *   .setMinValue(0.1)
 *   .setMaxValue(99.9)
 *   .build();
 * ```
 */
export class NumberOptionBuilder extends ApplicationCommandOptionBuilder<
  NumberOptionEntity,
  NumberOptionBuilder
> {
  /**
   * Creates a new NumberOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<NumberOptionEntity> = {}) {
    super(ApplicationCommandOptionType.Number, data);
  }

  protected get self(): NumberOptionBuilder {
    return this;
  }

  /**
   * Sets the minimum value allowed for the number input.
   *
   * @param minValue The minimum value (must be between -2^53 and 2^53)
   * @returns This builder instance, for method chaining
   */
  setMinValue(minValue: number): this {
    this.data.min_value = minValue;
    return this;
  }

  /**
   * Sets the maximum value allowed for the number input.
   *
   * @param maxValue The maximum value (must be between -2^53 and 2^53)
   * @returns This builder instance, for method chaining
   */
  setMaxValue(maxValue: number): this {
    this.data.max_value = maxValue;
    return this;
  }

  /**
   * Sets the choices for this option.
   * If choices are provided, users can only select from these predefined values.
   *
   * @param choices Array of choice objects
   * @returns This builder instance, for method chaining
   * @throws Error If more than 25 choices are provided or if autocomplete is enabled
   */
  setChoices(choices: ApplicationCommandOptionChoiceEntity[]): this {
    if (choices.length > 25) {
      throw new Error("Number option cannot have more than 25 choices");
    }

    if (this.data.autocomplete) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    this.data.choices = choices;
    return this;
  }

  /**
   * Adds a single choice to this option.
   *
   * @param name The display name of the choice
   * @param value The number value of the choice
   * @param nameLocalizations Optional localized names for the choice
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 choices, if autocomplete is enabled, or if name/value are invalid
   */
  addChoice(
    name: string,
    value: number,
    nameLocalizations?: Record<Locale, string>,
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }

    if (this.data.choices.length >= 25) {
      throw new Error("Number option cannot have more than 25 choices");
    }

    if (this.data.autocomplete) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    if (name.length > 100) {
      throw new Error("Choice name cannot exceed 100 characters");
    }

    if (nameLocalizations) {
      for (const [locale, localizedName] of Object.entries(nameLocalizations)) {
        if (localizedName.length > 100) {
          throw new Error(
            `Choice name for locale ${locale} cannot exceed 100 characters`,
          );
        }
      }
    }

    this.data.choices.push({
      name,
      value,
      name_localizations: nameLocalizations || null,
    });

    return this;
  }

  /**
   * Enables or disables autocomplete for this option.
   * When enabled, your application will receive typed inputs and can dynamically
   * suggest values to the user.
   *
   * @param autocomplete Whether to enable autocomplete
   * @returns This builder instance, for method chaining
   * @throws Error If choices are already set
   */
  setAutocomplete(autocomplete = true): this {
    if (autocomplete && this.data.choices && this.data.choices?.length > 0) {
      throw new Error(
        "Option cannot have both choices and autocomplete enabled",
      );
    }

    this.data.autocomplete = autocomplete;
    return this;
  }

  /**
   * Builds and returns the final number option object.
   *
   * @returns The constructed number option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): NumberOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    if (
      this.data.min_value !== undefined &&
      this.data.max_value !== undefined &&
      this.data.min_value > this.data.max_value
    ) {
      throw new Error(
        "Option minimum value cannot be greater than maximum value",
      );
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.Number;

    return this.data as NumberOptionEntity;
  }
}

/**
 * Builder for creating boolean command options.
 *
 * Boolean options allow users to select true or false values.
 *
 * @example
 * ```typescript
 * const option = new BooleanOptionBuilder()
 *   .setName('ephemeral')
 *   .setDescription('Whether the response should be ephemeral')
 *   .build();
 * ```
 */
export class BooleanOptionBuilder extends ApplicationCommandOptionBuilder<
  BooleanOptionEntity,
  BooleanOptionBuilder
> {
  /**
   * Creates a new BooleanOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<BooleanOptionEntity> = {}) {
    super(ApplicationCommandOptionType.Boolean, data);
  }

  protected get self(): BooleanOptionBuilder {
    return this;
  }

  /**
   * Builds and returns the final boolean option object.
   *
   * @returns The constructed boolean option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): BooleanOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.Boolean;

    return this.data as BooleanOptionEntity;
  }
}

/**
 * Builder for creating user command options.
 *
 * User options allow users to select a member of the guild.
 *
 * @example
 * ```typescript
 * const option = new UserOptionBuilder()
 *   .setName('target')
 *   .setDescription('The user to target')
 *   .setRequired(true)
 *   .build();
 * ```
 */
export class UserOptionBuilder extends ApplicationCommandOptionBuilder<
  UserOptionEntity,
  UserOptionBuilder
> {
  /**
   * Creates a new UserOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<UserOptionEntity> = {}) {
    super(ApplicationCommandOptionType.User, data);
  }

  protected get self(): UserOptionBuilder {
    return this;
  }

  /**
   * Builds and returns the final user option object.
   *
   * @returns The constructed user option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): UserOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.User;

    return this.data as UserOptionEntity;
  }
}

/**
 * Builder for creating channel command options.
 *
 * Channel options allow users to select a channel from the guild.
 *
 * @example
 * ```typescript
 * import { ChannelType } from "@nyxjs/core";
 *
 * const option = new ChannelOptionBuilder()
 *   .setName('channel')
 *   .setDescription('The channel to target')
 *   .setRequired(true)
 *   .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
 *   .build();
 * ```
 */
export class ChannelOptionBuilder extends ApplicationCommandOptionBuilder<
  ChannelOptionEntity,
  ChannelOptionBuilder
> {
  /**
   * Creates a new ChannelOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<ChannelOptionEntity> = {}) {
    super(ApplicationCommandOptionType.Channel, data);
  }

  protected get self(): ChannelOptionBuilder {
    return this;
  }

  /**
   * Sets the channel types that can be selected.
   * If not specified, all channel types can be selected.
   *
   * @param types The channel types to allow
   * @returns This builder instance, for method chaining
   */
  setChannelTypes(...types: ChannelType[]): this {
    this.data.channel_types = types;
    return this;
  }

  /**
   * Adds channel types that can be selected.
   *
   * @param types The channel types to add
   * @returns This builder instance, for method chaining
   */
  addChannelTypes(...types: ChannelType[]): this {
    if (!this.data.channel_types) {
      this.data.channel_types = [];
    }

    this.data.channel_types.push(...types);
    return this;
  }

  /**
   * Builds and returns the final channel option object.
   *
   * @returns The constructed channel option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): ChannelOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.Channel;

    return this.data as ChannelOptionEntity;
  }
}

/**
 * Builder for creating role command options.
 *
 * Role options allow users to select a role from the guild.
 *
 * @example
 * ```typescript
 * const option = new RoleOptionBuilder()
 *   .setName('role')
 *   .setDescription('The role to target')
 *   .setRequired(true)
 *   .build();
 * ```
 */
export class RoleOptionBuilder extends ApplicationCommandOptionBuilder<
  RoleOptionEntity,
  RoleOptionBuilder
> {
  /**
   * Creates a new RoleOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<RoleOptionEntity> = {}) {
    super(ApplicationCommandOptionType.Role, data);
  }

  protected get self(): RoleOptionBuilder {
    return this;
  }

  /**
   * Builds and returns the final role option object.
   *
   * @returns The constructed role option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): RoleOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.Role;

    return this.data as RoleOptionEntity;
  }
}

/**
 * Builder for creating mentionable command options.
 *
 * Mentionable options allow users to select either a user or a role from the guild.
 *
 * @example
 * ```typescript
 * const option = new MentionableOptionBuilder()
 *   .setName('target')
 *   .setDescription('The user or role to target')
 *   .setRequired(true)
 *   .build();
 * ```
 */
export class MentionableOptionBuilder extends ApplicationCommandOptionBuilder<
  MentionableOptionEntity,
  MentionableOptionBuilder
> {
  /**
   * Creates a new MentionableOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<MentionableOptionEntity> = {}) {
    super(ApplicationCommandOptionType.Mentionable, data);
  }

  protected get self(): MentionableOptionBuilder {
    return this;
  }

  /**
   * Builds and returns the final mentionable option object.
   *
   * @returns The constructed mentionable option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): MentionableOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.Mentionable;

    return this.data as MentionableOptionEntity;
  }
}

/**
 * Builder for creating attachment command options.
 *
 * Attachment options allow users to upload files.
 *
 * @example
 * ```typescript
 * const option = new AttachmentOptionBuilder()
 *   .setName('file')
 *   .setDescription('The file to upload')
 *   .setRequired(true)
 *   .build();
 * ```
 */
export class AttachmentOptionBuilder extends ApplicationCommandOptionBuilder<
  AttachmentOptionEntity,
  AttachmentOptionBuilder
> {
  /**
   * Creates a new AttachmentOptionBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<AttachmentOptionEntity> = {}) {
    super(ApplicationCommandOptionType.Attachment, data);
  }

  protected get self(): AttachmentOptionBuilder {
    return this;
  }

  /**
   * Builds and returns the final attachment option object.
   *
   * @returns The constructed attachment option entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): AttachmentOptionEntity {
    if (!this.data.name) {
      throw new Error("Option name is required");
    }

    if (!this.data.description) {
      throw new Error("Option description is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.Attachment;

    return this.data as AttachmentOptionEntity;
  }
}

/**
 * Builder for creating subcommand options.
 *
 * Subcommands allow you to organize commands into logical groups.
 *
 * @example
 * ```typescript
 * const subcommand = new SubcommandBuilder()
 *   .setName('get')
 *   .setDescription('Get permissions for a user')
 *   .addUserOption(option =>
 *     option
 *       .setName('user')
 *       .setDescription('The user to get permissions for')
 *       .setRequired(true)
 *   )
 *   .build();
 * ```
 */
export class SubcommandBuilder extends ApplicationCommandOptionBuilder<
  SubOptionEntity,
  SubcommandBuilder
> {
  /**
   * Creates a new SubcommandBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<SubOptionEntity> = {}) {
    super(ApplicationCommandOptionType.SubCommand, data);
  }

  protected get self(): SubcommandBuilder {
    return this;
  }

  /**
   * Sets the options for this subcommand.
   * These are the parameters/arguments that users can provide when using the subcommand.
   *
   * @param options Array of option entities
   * @returns This builder instance, for method chaining
   * @throws Error If more than 25 options are provided
   */
  setOptions(
    options:
      | StringOptionEntity
      | IntegerOptionEntity
      | NumberOptionEntity
      | BooleanOptionEntity
      | UserOptionEntity
      | ChannelOptionEntity
      | RoleOptionEntity
      | MentionableOptionEntity
      | AttachmentOptionEntity
      | (
          | StringOptionEntity
          | IntegerOptionEntity
          | NumberOptionEntity
          | BooleanOptionEntity
          | UserOptionEntity
          | ChannelOptionEntity
          | RoleOptionEntity
          | MentionableOptionEntity
          | AttachmentOptionEntity
        )[],
  ): this {
    const optionsArray = Array.isArray(options) ? options : [options];

    if (optionsArray.length > 25) {
      throw new Error("Subcommands cannot have more than 25 options");
    }

    this.data.options = optionsArray;
    return this;
  }

  /**
   * Adds options to this subcommand.
   *
   * @param options The options to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addOptions(
    ...options: (
      | StringOptionEntity
      | IntegerOptionEntity
      | NumberOptionEntity
      | BooleanOptionEntity
      | UserOptionEntity
      | ChannelOptionEntity
      | RoleOptionEntity
      | MentionableOptionEntity
      | AttachmentOptionEntity
    )[]
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length + options.length > 25) {
      throw new Error("Subcommands cannot have more than 25 options");
    }

    this.data.options.push(...options);
    return this;
  }

  /**
   * Adds a string option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addStringOption(
    fn: (option: StringOptionBuilder) => StringOptionBuilder,
  ): this {
    const option = new StringOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds an integer option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addIntegerOption(
    fn: (option: IntegerOptionBuilder) => IntegerOptionBuilder,
  ): this {
    const option = new IntegerOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds a number option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addNumberOption(
    fn: (option: NumberOptionBuilder) => NumberOptionBuilder,
  ): this {
    const option = new NumberOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds a boolean option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addBooleanOption(
    fn: (option: BooleanOptionBuilder) => BooleanOptionBuilder,
  ): this {
    const option = new BooleanOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds a user option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addUserOption(fn: (option: UserOptionBuilder) => UserOptionBuilder): this {
    const option = new UserOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds a channel option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addChannelOption(
    fn: (option: ChannelOptionBuilder) => ChannelOptionBuilder,
  ): this {
    const option = new ChannelOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds a role option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addRoleOption(fn: (option: RoleOptionBuilder) => RoleOptionBuilder): this {
    const option = new RoleOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds a mentionable option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addMentionableOption(
    fn: (option: MentionableOptionBuilder) => MentionableOptionBuilder,
  ): this {
    const option = new MentionableOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Adds an attachment option to this subcommand.
   *
   * @param fn A function that configures the option
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addAttachmentOption(
    fn: (option: AttachmentOptionBuilder) => AttachmentOptionBuilder,
  ): this {
    const option = new AttachmentOptionBuilder();
    return this.#addOption(fn(option).build());
  }

  /**
   * Builds and returns the final subcommand object.
   *
   * @returns The constructed subcommand entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): SubOptionEntity {
    if (!this.data.name) {
      throw new Error("Subcommand name is required");
    }

    if (!this.data.description) {
      throw new Error("Subcommand description is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.SubCommand;

    return this.data as SubOptionEntity;
  }

  /**
   * Adds a single option to this subcommand.
   *
   * @param option The option to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  #addOption(
    option:
      | StringOptionEntity
      | IntegerOptionEntity
      | NumberOptionEntity
      | BooleanOptionEntity
      | UserOptionEntity
      | ChannelOptionEntity
      | RoleOptionEntity
      | MentionableOptionEntity
      | AttachmentOptionEntity,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= 25) {
      throw new Error("Subcommands cannot have more than 25 options");
    }

    this.data.options.push(option);
    return this;
  }
}

/**
 * Builder for creating subcommand group options.
 *
 * Subcommand groups allow you to organize subcommands into logical groups.
 *
 * @example
 * ```typescript
 * const group = new SubcommandGroupBuilder()
 *   .setName('user')
 *   .setDescription('Manage user permissions')
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
 *   .build();
 * ```
 */
export class SubcommandGroupBuilder extends ApplicationCommandOptionBuilder<
  SubGroupOptionEntity,
  SubcommandGroupBuilder
> {
  /**
   * Creates a new SubcommandGroupBuilder instance.
   *
   * @param data Optional initial option data
   */
  constructor(data: Partial<SubGroupOptionEntity> = {}) {
    super(ApplicationCommandOptionType.SubCommandGroup, data);
  }

  protected get self(): SubcommandGroupBuilder {
    return this;
  }

  /**
   * Sets the subcommands for this subcommand group.
   *
   * @param subcommands Array of subcommand entities
   * @returns This builder instance, for method chaining
   * @throws Error If more than 25 subcommands are provided
   */
  setSubcommands(subcommands: SubOptionEntity[]): this {
    if (subcommands.length > 25) {
      throw new Error("Subcommand groups cannot have more than 25 subcommands");
    }

    this.data.options = subcommands;
    return this;
  }

  /**
   * Adds subcommands to this subcommand group.
   *
   * @param subcommands The subcommands to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 subcommands
   */
  addSubcommands(...subcommands: SubOptionEntity[]): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length + subcommands.length > 25) {
      throw new Error("Subcommand groups cannot have more than 25 subcommands");
    }

    this.data.options.push(...subcommands);
    return this;
  }

  /**
   * Adds a subcommand to this subcommand group.
   *
   * @param fn A function that configures the subcommand
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 subcommands
   */
  addSubcommand(
    fn: (subcommand: SubcommandBuilder) => SubcommandBuilder,
  ): this {
    const subcommand = new SubcommandBuilder();

    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= 25) {
      throw new Error("Subcommand groups cannot have more than 25 subcommands");
    }

    this.data.options.push(fn(subcommand).build());
    return this;
  }

  /**
   * Builds and returns the final subcommand group object.
   *
   * @returns The constructed subcommand group entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): SubGroupOptionEntity {
    if (!this.data.name) {
      throw new Error("Subcommand group name is required");
    }

    if (!this.data.description) {
      throw new Error("Subcommand group description is required");
    }

    if (!this.data.options || this.data.options.length === 0) {
      throw new Error("Subcommand groups must have at least one subcommand");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandOptionType.SubCommandGroup;

    return this.data as SubGroupOptionEntity;
  }
}
