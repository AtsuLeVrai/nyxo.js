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

/**
 * Builder for select menu options used in string select menus.
 *
 * Each option represents a choice that users can select from a dropdown menu.
 */
export class SelectMenuOptionBuilder {
  /** The internal option data being constructed */
  readonly #data: Partial<SelectMenuOptionEntity> = {};

  /**
   * Creates a new SelectMenuOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: SelectMenuOptionEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new SelectMenuOptionBuilder from existing option data.
   *
   * @param data - The option data to use
   * @returns A new SelectMenuOptionBuilder instance with the provided data
   */
  static from(data: SelectMenuOptionEntity): SelectMenuOptionBuilder {
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
    this.#data.label = label;
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
    this.#data.value = value;
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
    this.#data.description = description;
    return this;
  }

  /**
   * Sets the emoji to display with this option.
   *
   * @param emoji - The emoji to use
   * @returns The option builder instance for method chaining
   */
  setEmoji(emoji: EmojiResolvable): this {
    this.#data.emoji = resolveEmoji(emoji);
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
   * @returns The complete select menu option
   */
  build(): SelectMenuOptionEntity {
    return this.#data as SelectMenuOptionEntity;
  }

  /**
   * Converts the select menu option data to an immutable object.
   * @returns A read-only copy of the option data
   */
  toJson(): Readonly<SelectMenuOptionEntity> {
    return Object.freeze({ ...this.#data }) as SelectMenuOptionEntity;
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
  readonly #data: Partial<SelectMenuDefaultValueEntity> = {};

  /**
   * Creates a new SelectMenuDefaultValueBuilder instance.
   *
   * @param data - Optional initial data to populate the default value with
   */
  constructor(data?: SelectMenuDefaultValueEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new SelectMenuDefaultValueBuilder from existing default value data.
   *
   * @param data - The default value data to use
   * @returns A new SelectMenuDefaultValueBuilder instance with the provided data
   */
  static from(
    data: SelectMenuDefaultValueEntity,
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
    this.#data.id = id;
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
    this.#data.type = type;
    return this;
  }

  /**
   * Builds the final select menu default value object.
   * @returns The complete select menu default value
   */
  build(): SelectMenuDefaultValueEntity {
    return this.#data as SelectMenuDefaultValueEntity;
  }

  /**
   * Converts the select menu default value data to an immutable object.
   * @returns A read-only copy of the default value data
   */
  toJson(): Readonly<SelectMenuDefaultValueEntity> {
    return Object.freeze({ ...this.#data }) as SelectMenuDefaultValueEntity;
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
   * @param data - Optional initial data to populate the select menu with
   */
  protected constructor(componentType: ComponentType, data?: Partial<T>) {
    if (data) {
      this.data = {
        ...data,
        type: componentType,
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
    this.data.id = id;
    return this;
  }

  /**
   * Converts the select menu data to an immutable object.
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
   */
  abstract build(): T;
}

/**
 * Builder for string select menu components.
 *
 * String select menus allow users to select from predefined text options.
 */
export class StringSelectMenuBuilder extends BaseSelectMenuBuilder<StringSelectMenuEntity> {
  /**
   * Creates a new StringSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: StringSelectMenuEntity) {
    super(ComponentType.StringSelect, data);

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
  static from(data: StringSelectMenuEntity): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(data);
  }

  /**
   * Adds an option to the select menu.
   *
   * @param option - The option to add
   * @returns The select menu builder instance for method chaining
   */
  addOption(option: SelectMenuOptionEntity): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    this.data.options.push(option);
    return this;
  }

  /**
   * Adds multiple options to the select menu.
   *
   * @param options - The options to add
   * @returns The select menu builder instance for method chaining
   */
  addOptions(...options: SelectMenuOptionEntity[]): this {
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
  setOptions(options: SelectMenuOptionEntity[]): this {
    this.data.options = [...options];
    return this;
  }

  /**
   * Builds the final string select menu entity object.
   * @returns The complete string select menu entity
   */
  build(): StringSelectMenuEntity {
    return this.data as StringSelectMenuEntity;
  }
}

/**
 * Builder for user select menu components.
 *
 * User select menus allow users to select one or more members from the server.
 */
export class UserSelectMenuBuilder extends BaseSelectMenuBuilder<UserSelectMenuEntity> {
  /**
   * Creates a new UserSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: UserSelectMenuEntity) {
    super(ComponentType.UserSelect, data);

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
  static from(data: UserSelectMenuEntity): UserSelectMenuBuilder {
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
   * @returns The complete user select menu entity
   */
  build(): UserSelectMenuEntity {
    return this.data as UserSelectMenuEntity;
  }
}

/**
 * Builder for role select menu components.
 *
 * Role select menus allow users to select one or more roles from the server.
 */
export class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<RoleSelectMenuEntity> {
  /**
   * Creates a new RoleSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: RoleSelectMenuEntity) {
    super(ComponentType.RoleSelect, data);

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
  static from(data: RoleSelectMenuEntity): RoleSelectMenuBuilder {
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
   * @returns The complete role select menu entity
   */
  build(): RoleSelectMenuEntity {
    return this.data as RoleSelectMenuEntity;
  }
}

/**
 * Builder for mentionable select menu components.
 *
 * Mentionable select menus allow users to select users or roles from the server.
 */
export class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<MentionableSelectMenuEntity> {
  /**
   * Creates a new MentionableSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: MentionableSelectMenuEntity) {
    super(ComponentType.MentionableSelect, data);

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
  static from(data: MentionableSelectMenuEntity): MentionableSelectMenuBuilder {
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
  setDefaultValues(values: SelectMenuDefaultValueEntity[]): this {
    this.data.default_values = [...values];
    return this;
  }

  /**
   * Builds the final mentionable select menu entity object.
   * @returns The complete mentionable select menu entity
   */
  build(): MentionableSelectMenuEntity {
    return this.data as MentionableSelectMenuEntity;
  }
}

/**
 * Builder for channel select menu components.
 *
 * Channel select menus allow users to select one or more channels from the server.
 */
export class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<ChannelSelectMenuEntity> {
  /**
   * Creates a new ChannelSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: ChannelSelectMenuEntity) {
    super(ComponentType.ChannelSelect, data);

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
  static from(data: ChannelSelectMenuEntity): ChannelSelectMenuBuilder {
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
    this.data.channel_types = [...channelTypes];
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
   * @returns The complete channel select menu entity
   */
  build(): ChannelSelectMenuEntity {
    return this.data as ChannelSelectMenuEntity;
  }
}
