import {
  type AnySelectMenuEntity,
  type ChannelSelectMenuEntity,
  ChannelType,
  ComponentType,
  type EmojiResolvable,
  type MentionableSelectMenuEntity,
  type RoleSelectMenuEntity,
  type SelectMenuDefaultValueEntity,
  type SelectMenuOptionEntity,
  type Snowflake,
  type StringSelectMenuEntity,
  type UserSelectMenuEntity,
  resolveEmoji,
} from "@nyxojs/core";
import { z } from "zod/v4";
import {
  BaseSelectMenuSchema,
  ChannelSelectMenuSchema,
  MentionableSelectMenuSchema,
  RoleSelectMenuSchema,
  SelectMenuDefaultValueSchema,
  SelectMenuEmojiSchema,
  SelectMenuOptionSchema,
  StringSelectMenuSchema,
  UserSelectMenuSchema,
} from "../schemas/index.js";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Builder for select menu options used in string select menus.
 *
 * Each option represents a choice that users can select from a dropdown menu.
 */
export class SelectMenuOptionBuilder {
  /** The internal option data being constructed */
  readonly #data: Partial<z.input<typeof SelectMenuOptionSchema>> = {};

  /**
   * Creates a new SelectMenuOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: z.input<typeof SelectMenuOptionSchema>) {
    if (data) {
      // Validate the initial data
      const result = SelectMenuOptionSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new SelectMenuOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new SelectMenuOptionBuilder instance with the provided data
   */
  static from(
    data: z.input<typeof SelectMenuOptionSchema>,
  ): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(data);
  }

  /**
   * Sets the label of the select option.
   * This is the text displayed to users in the dropdown.
   *
   * @param label - The label to set (max 100 characters)
   * @returns The option builder instance for method chaining
   */
  setLabel(label: string): this {
    const result = SelectMenuOptionSchema.shape.label.safeParse(label);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.label = result.data;
    return this;
  }

  /**
   * Sets the value of the select option.
   * This is the data sent to your application when this option is selected.
   *
   * @param value - The value to set (max 100 characters)
   * @returns The option builder instance for method chaining
   */
  setValue(value: string): this {
    const result = SelectMenuOptionSchema.shape.value.safeParse(value);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.value = result.data;
    return this;
  }

  /**
   * Sets the description of the select option.
   * This is displayed below the option label.
   *
   * @param description - The description to set (max 100 characters)
   * @returns The option builder instance for method chaining
   */
  setDescription(description: string): this {
    const result =
      SelectMenuOptionSchema.shape.description.safeParse(description);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.description = result.data;
    return this;
  }

  /**
   * Sets the emoji to display with this option.
   *
   * @param emoji - The emoji to use
   * @returns The option builder instance for method chaining
   */
  setEmoji(emoji: EmojiResolvable): this {
    const result = SelectMenuEmojiSchema.safeParse(resolveEmoji(emoji));
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.emoji = result.data;
    return this;
  }

  /**
   * Sets whether this option is selected by default.
   *
   * @param isDefault - Whether this option should be selected by default
   * @returns The option builder instance for method chaining
   */
  setDefault(isDefault = true): this {
    this.#data.default = isDefault;
    return this;
  }

  /**
   * Builds the final select menu option object.
   *
   * @returns The complete select menu option
   * @throws Error if the option configuration is invalid
   */
  build(): SelectMenuOptionEntity {
    // Validate the entire option
    const result = SelectMenuOptionSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the select menu option.
   *
   * @returns A read-only copy of the option data
   */
  toJson(): Readonly<Partial<z.input<typeof SelectMenuOptionSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}

/**
 * Builder for select menu default values.
 *
 * Default values specify which options should be pre-selected when
 * an auto-populated select menu is displayed.
 */
export class SelectMenuDefaultValueBuilder {
  /** The internal default value data being constructed */
  readonly #data: Partial<z.input<typeof SelectMenuDefaultValueSchema>> = {};

  /**
   * Creates a new SelectMenuDefaultValueBuilder instance.
   *
   * @param data - Optional initial data to populate the default value with
   */
  constructor(data?: z.input<typeof SelectMenuDefaultValueSchema>) {
    if (data) {
      // Validate the initial data
      const result = SelectMenuDefaultValueSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = { ...result.data };
    }
  }

  /**
   * Creates a new SelectMenuDefaultValueBuilder from existing default value data.
   *
   * @param data - The default value data to use
   * @returns A new SelectMenuDefaultValueBuilder instance with the provided data
   */
  static from(
    data: z.input<typeof SelectMenuDefaultValueSchema>,
  ): SelectMenuDefaultValueBuilder {
    return new SelectMenuDefaultValueBuilder(data);
  }

  /**
   * Sets the ID of the default value.
   * This should be the ID of a user, role, or channel.
   *
   * @param id - The ID to set
   * @returns The default value builder instance for method chaining
   */
  setId(id: Snowflake): this {
    const result = SelectMenuDefaultValueSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Sets the type of the default value.
   * This determines what kind of resource the ID represents.
   *
   * @param type - The type of value: 'user', 'role', or 'channel'
   * @returns The default value builder instance for method chaining
   */
  setType(type: "user" | "role" | "channel"): this {
    const result = SelectMenuDefaultValueSchema.shape.type.safeParse(type);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.type = result.data;
    return this;
  }

  /**
   * Builds the final select menu default value object.
   *
   * @returns The complete select menu default value
   * @throws Error if the default value configuration is invalid
   */
  build(): SelectMenuDefaultValueEntity {
    // Validate the entire default value
    const result = SelectMenuDefaultValueSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the select menu default value.
   *
   * @returns A read-only copy of the default value data
   */
  toJson(): Readonly<Partial<z.input<typeof SelectMenuDefaultValueSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}

/**
 * Base builder for all select menu types.
 * This abstract class provides common methods for all select menu builders.
 *
 * @template T - The type of select menu entity this builder creates
 */
export abstract class BaseSelectMenuBuilder<T extends AnySelectMenuEntity> {
  /** The internal select menu data being constructed */
  protected readonly data: Partial<T>;

  /**
   * Creates a new BaseSelectMenuBuilder instance.
   *
   * @param componentType - The component type for this select menu
   * @param schema - The schema to use for validation
   * @param data - Optional initial data to populate the select menu with
   */
  protected constructor(
    componentType: ComponentType,
    schema: z.ZodObject,
    data?: Partial<T>,
  ) {
    if (data) {
      // Validate the initial data
      const result = schema.partial().safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data = {
        ...result.data,
        type: componentType, // Ensure type is set correctly
      } as Partial<T>;
    } else {
      this.data = {
        type: componentType,
      } as Partial<T>;
    }
  }

  /**
   * Sets the custom ID of the select menu.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The select menu builder instance for method chaining
   */
  setCustomId(customId: string): this {
    const result = BaseSelectMenuSchema.shape.custom_id.safeParse(customId);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.data.custom_id = customId;
    return this;
  }

  /**
   * Sets the placeholder text of the select menu.
   * This is shown when no option is selected.
   *
   * @param placeholder - The placeholder text to set (max 150 characters)
   * @returns The select menu builder instance for method chaining
   */
  setPlaceholder(placeholder: string): this {
    const result =
      BaseSelectMenuSchema.shape.placeholder.safeParse(placeholder);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.data.placeholder = placeholder;
    return this;
  }

  /**
   * Sets the minimum number of items that must be chosen.
   *
   * @param minValues - The minimum number of items (0-25)
   * @returns The select menu builder instance for method chaining
   */
  setMinValues(minValues: number): this {
    const result = BaseSelectMenuSchema.shape.min_values.safeParse(minValues);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    // Check if min_values would be greater than max_values
    if (
      this.data.max_values !== undefined &&
      minValues > this.data.max_values
    ) {
      throw new Error("Minimum values cannot be greater than maximum values");
    }

    this.data.min_values = minValues;
    return this;
  }

  /**
   * Sets the maximum number of items that can be chosen.
   *
   * @param maxValues - The maximum number of items (1-25)
   * @returns The select menu builder instance for method chaining
   */
  setMaxValues(maxValues: number): this {
    const result = BaseSelectMenuSchema.shape.min_values.safeParse(maxValues);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    // Check if max_values would be less than min_values
    if (
      this.data.min_values !== undefined &&
      maxValues < this.data.min_values
    ) {
      throw new Error("Maximum values cannot be less than minimum values");
    }

    this.data.max_values = maxValues;
    return this;
  }

  /**
   * Sets whether the select menu is disabled.
   *
   * @param disabled - Whether the select menu should be disabled
   * @returns The select menu builder instance for method chaining
   */
  setDisabled(disabled = true): this {
    this.data.disabled = disabled;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The select menu builder instance for method chaining
   */
  setId(id: number): this {
    const result = BaseSelectMenuSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.data.id = id;
    return this;
  }

  /**
   * Returns a JSON representation of the select menu.
   *
   * @returns A read-only copy of the select menu data
   */
  toJson(): Readonly<Partial<T>> {
    return Object.freeze({ ...this.data });
  }

  /**
   * Builds the final select menu entity object.
   * Must be implemented by derived classes.
   *
   * @returns The complete select menu entity
   * @throws Error if the select menu configuration is invalid
   */
  abstract build(): T;
}

/**
 * Builder for string select menu components.
 *
 * String select menus allow users to select from predefined text options.
 */
export class StringSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof StringSelectMenuSchema>
> {
  /**
   * Creates a new StringSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: z.input<typeof StringSelectMenuSchema>) {
    super(ComponentType.StringSelect, StringSelectMenuSchema, data);

    // Initialize options array if not present
    if (!this.data.options) {
      this.data.options = [];
    }
  }

  /**
   * Creates a new StringSelectMenuBuilder from existing select menu data.
   *
   * @param data - The select menu data to use
   * @returns A new StringSelectMenuBuilder instance with the provided data
   */
  static from(
    data: z.input<typeof StringSelectMenuSchema>,
  ): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(data);
  }

  /**
   * Adds an option to the select menu.
   *
   * @param option - The option to add
   * @returns The select menu builder instance for method chaining
   */
  addOption(option: z.input<typeof StringSelectMenuSchema>): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMPONENT_LIMITS.SELECT_OPTIONS) {
      throw new Error(
        `Select menus cannot have more than ${COMPONENT_LIMITS.SELECT_OPTIONS} options`,
      );
    }

    const result = SelectMenuOptionSchema.safeParse(option);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.data.options.push(result.data);
    return this;
  }

  /**
   * Adds multiple options to the select menu.
   *
   * @param options - The options to add
   * @returns The select menu builder instance for method chaining
   */
  addOptions(...options: z.input<typeof StringSelectMenuSchema>[]): this {
    for (const option of options) {
      this.addOption(option);
    }
    return this;
  }

  /**
   * Sets all options for the select menu, replacing any existing options.
   *
   * @param options - The options to set
   * @returns The select menu builder instance for method chaining
   */
  setOptions(options: z.input<typeof SelectMenuOptionSchema>[]): this {
    if (options.length > COMPONENT_LIMITS.SELECT_OPTIONS) {
      throw new Error(
        `Select menus cannot have more than ${COMPONENT_LIMITS.SELECT_OPTIONS} options`,
      );
    }

    // Validate each option
    const validOptions: z.input<typeof SelectMenuOptionSchema>[] = [];
    for (const option of options) {
      const result = SelectMenuOptionSchema.safeParse(option);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      validOptions.push(result.data);
    }

    this.data.options = validOptions;
    return this;
  }

  /**
   * Builds the final string select menu entity object.
   *
   * @returns The complete string select menu entity
   * @throws Error if the select menu configuration is invalid
   */
  build(): StringSelectMenuEntity {
    // Validate the entire string select menu
    const result = StringSelectMenuSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }
}

/**
 * Builder for user select menu components.
 *
 * User select menus allow users to select one or more members from the server.
 */
export class UserSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof UserSelectMenuSchema>
> {
  /**
   * Creates a new UserSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: z.input<typeof UserSelectMenuSchema>) {
    super(ComponentType.UserSelect, UserSelectMenuSchema, data);

    // Initialize default_values array if needed
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }
  }

  /**
   * Creates a new UserSelectMenuBuilder from existing select menu data.
   *
   * @param data - The select menu data to use
   * @returns A new UserSelectMenuBuilder instance with the provided data
   */
  static from(
    data: z.input<typeof UserSelectMenuSchema>,
  ): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(data);
  }

  /**
   * Adds a default user value to the select menu.
   *
   * @param userId - The ID of the user to select by default
   * @returns The select menu builder instance for method chaining
   */
  addDefaultUser(userId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId(userId)
      .setType("user")
      .build();

    this.data.default_values.push(defaultValue);
    return this;
  }

  /**
   * Sets the default user values for the select menu.
   *
   * @param userIds - The IDs of the users to select by default
   * @returns The select menu builder instance for method chaining
   */
  setDefaultUsers(userIds: Snowflake[]): this {
    this.data.default_values = userIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("user").build(),
    );

    return this;
  }

  /**
   * Builds the final user select menu entity object.
   *
   * @returns The complete user select menu entity
   * @throws Error if the select menu configuration is invalid
   */
  build(): UserSelectMenuEntity {
    // Validate the entire user select menu
    const result = UserSelectMenuSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }
}

/**
 * Builder for role select menu components.
 *
 * Role select menus allow users to select one or more roles from the server.
 */
export class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof RoleSelectMenuSchema>
> {
  /**
   * Creates a new RoleSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: z.input<typeof RoleSelectMenuSchema>) {
    super(ComponentType.RoleSelect, RoleSelectMenuSchema, data);

    // Initialize default_values array if needed
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }
  }

  /**
   * Creates a new RoleSelectMenuBuilder from existing select menu data.
   *
   * @param data - The select menu data to use
   * @returns A new RoleSelectMenuBuilder instance with the provided data
   */
  static from(
    data: z.input<typeof RoleSelectMenuSchema>,
  ): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(data);
  }

  /**
   * Adds a default role value to the select menu.
   *
   * @param roleId - The ID of the role to select by default
   * @returns The select menu builder instance for method chaining
   */
  addDefaultRole(roleId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId(roleId)
      .setType("role")
      .build();

    this.data.default_values.push(defaultValue);
    return this;
  }

  /**
   * Sets the default role values for the select menu.
   *
   * @param roleIds - The IDs of the roles to select by default
   * @returns The select menu builder instance for method chaining
   */
  setDefaultRoles(roleIds: Snowflake[]): this {
    this.data.default_values = roleIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("role").build(),
    );

    return this;
  }

  /**
   * Builds the final role select menu entity object.
   *
   * @returns The complete role select menu entity
   * @throws Error if the select menu configuration is invalid
   */
  build(): RoleSelectMenuEntity {
    // Validate the entire role select menu
    const result = RoleSelectMenuSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }
}

/**
 * Builder for mentionable select menu components.
 *
 * Mentionable select menus allow users to select users or roles from the server.
 */
export class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof MentionableSelectMenuSchema>
> {
  /**
   * Creates a new MentionableSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: z.input<typeof MentionableSelectMenuSchema>) {
    super(ComponentType.MentionableSelect, MentionableSelectMenuSchema, data);

    // Initialize default_values array if needed
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }
  }

  /**
   * Creates a new MentionableSelectMenuBuilder from existing select menu data.
   *
   * @param data - The select menu data to use
   * @returns A new MentionableSelectMenuBuilder instance with the provided data
   */
  static from(
    data: z.input<typeof MentionableSelectMenuSchema>,
  ): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(data);
  }

  /**
   * Adds a default user value to the select menu.
   *
   * @param userId - The ID of the user to select by default
   * @returns The select menu builder instance for method chaining
   */
  addDefaultUser(userId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId(userId)
      .setType("user")
      .build();

    this.data.default_values.push(defaultValue);
    return this;
  }

  /**
   * Adds a default role value to the select menu.
   *
   * @param roleId - The ID of the role to select by default
   * @returns The select menu builder instance for method chaining
   */
  addDefaultRole(roleId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId(roleId)
      .setType("role")
      .build();

    this.data.default_values.push(defaultValue);
    return this;
  }

  /**
   * Sets the default mentionable values for the select menu.
   *
   * @param values - The default values to set
   * @returns The select menu builder instance for method chaining
   */
  setDefaultValues(
    values: z.input<typeof SelectMenuDefaultValueSchema>[],
  ): this {
    // Validate each value
    const validValues: z.input<typeof SelectMenuDefaultValueSchema>[] = [];
    for (const value of values) {
      // Ensure they're user or role only
      if (value.type !== "user" && value.type !== "role") {
        throw new Error(
          "Mentionable select menu can only have user or role default values",
        );
      }

      const result = SelectMenuDefaultValueSchema.safeParse(value);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      validValues.push(result.data);
    }

    this.data.default_values = validValues;
    return this;
  }

  /**
   * Builds the final mentionable select menu entity object.
   *
   * @returns The complete mentionable select menu entity
   * @throws Error if the select menu configuration is invalid
   */
  build(): MentionableSelectMenuEntity {
    const result = MentionableSelectMenuSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }
}

/**
 * Builder for channel select menu components.
 *
 * Channel select menus allow users to select one or more channels from the server.
 */
export class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof ChannelSelectMenuSchema>
> {
  /**
   * Creates a new ChannelSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: z.input<typeof ChannelSelectMenuSchema>) {
    super(ComponentType.ChannelSelect, ChannelSelectMenuSchema, data);

    // Initialize arrays if needed
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }

    if (data?.channel_types && !this.data.channel_types) {
      this.data.channel_types = [...data.channel_types];
    }
  }

  /**
   * Creates a new ChannelSelectMenuBuilder from existing select menu data.
   *
   * @param data - The select menu data to use
   * @returns A new ChannelSelectMenuBuilder instance with the provided data
   */
  static from(
    data: z.input<typeof ChannelSelectMenuSchema>,
  ): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(data);
  }

  /**
   * Adds a channel type filter to the select menu.
   *
   * @param channelType - The channel type to add
   * @returns The select menu builder instance for method chaining
   */
  addChannelType(channelType: ChannelType): this {
    if (!this.data.channel_types) {
      this.data.channel_types = [];
    }

    const result =
      ChannelSelectMenuSchema.shape.channel_types.safeParse(channelType);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    if (!this.data.channel_types.includes(channelType)) {
      this.data.channel_types.push(channelType);
    }

    return this;
  }

  /**
   * Sets the channel types for the select menu.
   *
   * @param channelTypes - The channel types to set
   * @returns The select menu builder instance for method chaining
   */
  setChannelTypes(...channelTypes: ChannelType[]): this {
    // Validate each channel type
    const validChannelTypes: ChannelType[] = [];
    for (const type of channelTypes) {
      const result =
        ChannelSelectMenuSchema.shape.channel_types.safeParse(type);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      validChannelTypes.push(result.data as unknown as ChannelType);
    }

    this.data.channel_types = validChannelTypes;
    return this;
  }

  /**
   * Adds a default channel value to the select menu.
   *
   * @param channelId - The ID of the channel to select by default
   * @returns The select menu builder instance for method chaining
   */
  addDefaultChannel(channelId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId(channelId)
      .setType("channel")
      .build();

    this.data.default_values.push(defaultValue);
    return this;
  }

  /**
   * Sets the default channel values for the select menu.
   *
   * @param channelIds - The IDs of the channels to select by default
   * @returns The select menu builder instance for method chaining
   */
  setDefaultChannels(channelIds: Snowflake[]): this {
    this.data.default_values = channelIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("channel").build(),
    );

    return this;
  }

  /**
   * Creates a filter for text channels only.
   *
   * @returns The select menu builder instance for method chaining
   */
  textChannelsOnly(): this {
    return this.setChannelTypes(
      ChannelType.GuildText,
      ChannelType.GuildAnnouncement,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.AnnouncementThread,
    );
  }

  /**
   * Creates a filter for voice channels only.
   *
   * @returns The select menu builder instance for method chaining
   */
  voiceChannelsOnly(): this {
    return this.setChannelTypes(
      ChannelType.GuildVoice,
      ChannelType.GuildStageVoice,
    );
  }

  /**
   * Creates a filter for category channels only.
   *
   * @returns The select menu builder instance for method chaining
   */
  categoriesOnly(): this {
    return this.setChannelTypes(ChannelType.GuildCategory);
  }

  /**
   * Builds the final channel select menu entity object.
   *
   * @returns The complete channel select menu entity
   * @throws Error if the select menu configuration is invalid
   */
  build(): ChannelSelectMenuEntity {
    // Validate the entire channel select menu
    const result = ChannelSelectMenuSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }
}
