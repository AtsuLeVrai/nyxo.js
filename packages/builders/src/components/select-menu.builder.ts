import {
  type AnySelectMenuEntity,
  type ChannelSelectMenuEntity,
  type ChannelType,
  ComponentType,
  type EmojiEntity,
  type MentionableSelectMenuEntity,
  type RoleSelectMenuEntity,
  type SelectMenuDefaultValueEntity,
  type SelectMenuOptionEntity,
  type Snowflake,
  type StringSelectMenuEntity,
  type UserSelectMenuEntity,
} from "@nyxojs/core";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Builder for select menu options used in string select menus.
 *
 * Each option represents a choice that users can select from a dropdown menu.
 *
 * @example
 * ```typescript
 * const option = new SelectMenuOptionBuilder()
 *   .setLabel('Option 1')
 *   .setValue('option_1')
 *   .setDescription('This is the first option')
 *   .build();
 * ```
 */
export class SelectMenuOptionBuilder {
  /** The internal option data being constructed */
  readonly #data: Partial<SelectMenuOptionEntity> = {};

  /**
   * Creates a new SelectMenuOptionBuilder instance.
   *
   * @param data - Optional initial data to populate the option with
   */
  constructor(data?: Partial<SelectMenuOptionEntity>) {
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
  static from(data: Partial<SelectMenuOptionEntity>): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(data);
  }

  /**
   * Sets the label of the select option.
   * This is the text displayed to users in the dropdown.
   *
   * @param label - The label to set (max 100 characters)
   * @returns The option builder instance for method chaining
   * @throws Error if label exceeds 100 characters
   *
   * @example
   * ```typescript
   * new SelectMenuOptionBuilder().setLabel('Option 1');
   * ```
   */
  setLabel(label: string): this {
    if (label.length > COMPONENT_LIMITS.SELECT_OPTION_LABEL) {
      throw new Error(
        `Select option label cannot exceed ${COMPONENT_LIMITS.SELECT_OPTION_LABEL} characters`,
      );
    }
    this.#data.label = label;
    return this;
  }

  /**
   * Sets the value of the select option.
   * This is the data sent to your application when this option is selected.
   *
   * @param value - The value to set (max 100 characters)
   * @returns The option builder instance for method chaining
   * @throws Error if value exceeds 100 characters
   *
   * @example
   * ```typescript
   * new SelectMenuOptionBuilder().setValue('option_1');
   * ```
   */
  setValue(value: string): this {
    if (value.length > COMPONENT_LIMITS.SELECT_OPTION_VALUE) {
      throw new Error(
        `Select option value cannot exceed ${COMPONENT_LIMITS.SELECT_OPTION_VALUE} characters`,
      );
    }
    this.#data.value = value;
    return this;
  }

  /**
   * Sets the description of the select option.
   * This is displayed below the option label.
   *
   * @param description - The description to set (max 100 characters)
   * @returns The option builder instance for method chaining
   * @throws Error if description exceeds 100 characters
   *
   * @example
   * ```typescript
   * new SelectMenuOptionBuilder().setDescription('This is the first option');
   * ```
   */
  setDescription(description: string): this {
    if (description.length > COMPONENT_LIMITS.SELECT_OPTION_DESCRIPTION) {
      throw new Error(
        `Select option description cannot exceed ${COMPONENT_LIMITS.SELECT_OPTION_DESCRIPTION} characters`,
      );
    }
    this.#data.description = description;
    return this;
  }

  /**
   * Sets the emoji to display with this option.
   *
   * @param emoji - The emoji object
   * @returns The option builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Unicode emoji
   * new SelectMenuOptionBuilder().setEmoji({ name: '👍' });
   *
   * // Custom emoji
   * new SelectMenuOptionBuilder().setEmoji({
   *   id: '123456789012345678',
   *   name: 'cool_emoji',
   *   animated: false
   * });
   * ```
   */
  setEmoji(emoji: Pick<EmojiEntity, "id" | "name" | "animated">): this {
    this.#data.emoji = emoji;
    return this;
  }

  /**
   * Sets whether this option is selected by default.
   *
   * @param isDefault - Whether this option should be selected by default
   * @returns The option builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SelectMenuOptionBuilder().setDefault(true);
   * ```
   */
  setDefault(isDefault = true): this {
    this.#data.default = isDefault;
    return this;
  }

  /**
   * Builds the final select menu option entity object.
   *
   * @returns The complete select menu option entity
   * @throws Error if the option configuration is invalid
   *
   * @example
   * ```typescript
   * const option = new SelectMenuOptionBuilder()
   *   .setLabel('Option 1')
   *   .setValue('option_1')
   *   .build();
   * ```
   */
  build(): SelectMenuOptionEntity {
    if (!this.#data.label) {
      throw new Error("Select menu option must have a label");
    }

    if (!this.#data.value) {
      throw new Error("Select menu option must have a value");
    }

    return this.#data as SelectMenuOptionEntity;
  }

  /**
   * Returns a JSON representation of the select menu option.
   *
   * @returns A read-only copy of the option data
   */
  toJson(): Readonly<Partial<SelectMenuOptionEntity>> {
    return Object.freeze({ ...this.#data });
  }
}

/**
 * Builder for select menu default values.
 *
 * Default values specify which options should be pre-selected when
 * an auto-populated select menu is displayed.
 *
 * @example
 * ```typescript
 * const defaultValue = new SelectMenuDefaultValueBuilder()
 *   .setId('123456789012345678')
 *   .setType('user')
 *   .build();
 * ```
 */
export class SelectMenuDefaultValueBuilder {
  /** The internal default value data being constructed */
  readonly #data: Partial<SelectMenuDefaultValueEntity> = {};

  /**
   * Creates a new SelectMenuDefaultValueBuilder instance.
   *
   * @param data - Optional initial data to populate the default value with
   */
  constructor(data?: Partial<SelectMenuDefaultValueEntity>) {
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
    data: Partial<SelectMenuDefaultValueEntity>,
  ): SelectMenuDefaultValueBuilder {
    return new SelectMenuDefaultValueBuilder(data);
  }

  /**
   * Sets the ID of the default value.
   * This should be the ID of a user, role, or channel.
   *
   * @param id - The ID to set
   * @returns The default value builder instance for method chaining
   *
   * @example
   * ```typescript
   * new SelectMenuDefaultValueBuilder().setId('123456789012345678');
   * ```
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
   *
   * @example
   * ```typescript
   * new SelectMenuDefaultValueBuilder().setType('user');
   * ```
   */
  setType(type: "user" | "role" | "channel"): this {
    this.#data.type = type;
    return this;
  }

  /**
   * Builds the final select menu default value entity object.
   *
   * @returns The complete select menu default value entity
   * @throws Error if the default value configuration is invalid
   *
   * @example
   * ```typescript
   * const defaultValue = new SelectMenuDefaultValueBuilder()
   *   .setId('123456789012345678')
   *   .setType('user')
   *   .build();
   * ```
   */
  build(): SelectMenuDefaultValueEntity {
    if (!this.#data.id) {
      throw new Error("Default value must have an ID");
    }

    if (!this.#data.type) {
      throw new Error("Default value must have a type");
    }

    if (!["user", "role", "channel"].includes(this.#data.type)) {
      throw new Error(
        "Default value type must be 'user', 'role', or 'channel'",
      );
    }

    return this.#data as SelectMenuDefaultValueEntity;
  }

  /**
   * Returns a JSON representation of the select menu default value.
   *
   * @returns A read-only copy of the default value data
   */
  toJson(): Readonly<Partial<SelectMenuDefaultValueEntity>> {
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

  /** The component type for this select menu */
  protected readonly componentType: ComponentType;

  /**
   * Creates a new BaseSelectMenuBuilder instance.
   *
   * @param componentType - The component type for this select menu
   * @param data - Optional initial data to populate the select menu with
   */
  protected constructor(componentType: ComponentType, data?: Partial<T>) {
    this.componentType = componentType;
    this.data = {
      type: componentType,
      ...(data || {}),
    } as Partial<T>;
  }

  /**
   * Sets the custom ID of the select menu.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The select menu builder instance for method chaining
   * @throws Error if customId exceeds 100 characters
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().setCustomId('my_select_menu');
   * ```
   */
  setCustomId(customId: string): this {
    if (customId.length > COMPONENT_LIMITS.CUSTOM_ID) {
      throw new Error(
        `Select menu custom ID cannot exceed ${COMPONENT_LIMITS.CUSTOM_ID} characters`,
      );
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
   * @throws Error if placeholder exceeds 150 characters
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().setPlaceholder('Choose an option');
   * ```
   */
  setPlaceholder(placeholder: string): this {
    if (placeholder.length > COMPONENT_LIMITS.SELECT_PLACEHOLDER) {
      throw new Error(
        `Select menu placeholder cannot exceed ${COMPONENT_LIMITS.SELECT_PLACEHOLDER} characters`,
      );
    }
    this.data.placeholder = placeholder;
    return this;
  }

  /**
   * Sets the minimum number of items that must be chosen.
   *
   * @param minValues - The minimum number of items (0-25)
   * @returns The select menu builder instance for method chaining
   * @throws Error if minValues is out of range
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().setMinValues(1);
   * ```
   */
  setMinValues(minValues: number): this {
    if (minValues < 0 || minValues > COMPONENT_LIMITS.SELECT_OPTIONS) {
      throw new Error(
        `Minimum values must be between 0 and ${COMPONENT_LIMITS.SELECT_OPTIONS}`,
      );
    }
    this.data.min_values = minValues;
    return this;
  }

  /**
   * Sets the maximum number of items that can be chosen.
   *
   * @param maxValues - The maximum number of items (1-25)
   * @returns The select menu builder instance for method chaining
   * @throws Error if maxValues is out of range
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().setMaxValues(3);
   * ```
   */
  setMaxValues(maxValues: number): this {
    if (maxValues < 1 || maxValues > COMPONENT_LIMITS.SELECT_OPTIONS) {
      throw new Error(
        `Maximum values must be between 1 and ${COMPONENT_LIMITS.SELECT_OPTIONS}`,
      );
    }
    this.data.max_values = maxValues;
    return this;
  }

  /**
   * Sets whether the select menu is disabled.
   *
   * @param disabled - Whether the select menu should be disabled
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().setDisabled(true);
   * ```
   */
  setDisabled(disabled = true): this {
    this.data.disabled = disabled;
    return this;
  }

  /**
   * Abstract build method that must be implemented by subclasses.
   * Should return the complete select menu entity.
   */
  abstract build(): T;

  /**
   * Returns a JSON representation of the select menu.
   *
   * @returns A read-only copy of the select menu data
   */
  toJson(): Readonly<Partial<T>> {
    return Object.freeze({ ...this.data });
  }

  /**
   * Validates the select menu configuration.
   * Ensures the select menu has the required properties.
   *
   * @throws Error if the select menu configuration is invalid
   * @protected
   */
  protected validate(): void {
    if (!this.data.custom_id) {
      throw new Error("Select menu must have a custom ID");
    }

    if (
      this.data.min_values !== undefined &&
      this.data.max_values !== undefined &&
      this.data.min_values > this.data.max_values
    ) {
      throw new Error("Minimum values cannot be greater than maximum values");
    }
  }
}

/**
 * Builder for string select menu components.
 *
 * String select menus allow users to select from predefined text options.
 *
 * @example
 * ```typescript
 * const selectMenu = new StringSelectMenuBuilder()
 *   .setCustomId('food_selection')
 *   .setPlaceholder('Select your favorite food')
 *   .addOptions(
 *     { label: 'Pizza', value: 'pizza', description: 'Italian cuisine' },
 *     { label: 'Sushi', value: 'sushi', description: 'Japanese cuisine' }
 *   )
 *   .setMinValues(1)
 *   .setMaxValues(1)
 *   .build();
 * ```
 */
export class StringSelectMenuBuilder extends BaseSelectMenuBuilder<StringSelectMenuEntity> {
  /**
   * Creates a new StringSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: Partial<StringSelectMenuEntity>) {
    super(ComponentType.StringSelect, data);

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
   *
   * @example
   * ```typescript
   * const menuData = {
   *   type: ComponentType.StringSelect,
   *   custom_id: 'existing_menu',
   *   options: [{ label: 'Option 1', value: 'option_1' }]
   * };
   * const builder = StringSelectMenuBuilder.from(menuData);
   * ```
   */
  static from(data: Partial<StringSelectMenuEntity>): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(data);
  }

  /**
   * Adds an option to the select menu.
   *
   * @param option - The option to add
   * @returns The select menu builder instance for method chaining
   * @throws Error if adding the option would exceed the maximum number of options
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().addOption({
   *   label: 'Option 1',
   *   value: 'option_1',
   *   description: 'This is the first option'
   * });
   * ```
   */
  addOption(option: SelectMenuOptionEntity): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    if (this.data.options.length >= COMPONENT_LIMITS.SELECT_OPTIONS) {
      throw new Error(
        `Select menus cannot have more than ${COMPONENT_LIMITS.SELECT_OPTIONS} options`,
      );
    }

    this.data.options.push(option);
    return this;
  }

  /**
   * Adds multiple options to the select menu.
   *
   * @param options - The options to add
   * @returns The select menu builder instance for method chaining
   * @throws Error if adding the options would exceed the maximum number of options
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().addOptions(
   *   { label: 'Option 1', value: 'option_1' },
   *   { label: 'Option 2', value: 'option_2' }
   * );
   * ```
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
   * @throws Error if too many options are provided
   *
   * @example
   * ```typescript
   * new StringSelectMenuBuilder().setOptions([
   *   { label: 'Option 1', value: 'option_1' },
   *   { label: 'Option 2', value: 'option_2' }
   * ]);
   * ```
   */
  setOptions(options: SelectMenuOptionEntity[]): this {
    if (options.length > COMPONENT_LIMITS.SELECT_OPTIONS) {
      throw new Error(
        `Select menus cannot have more than ${COMPONENT_LIMITS.SELECT_OPTIONS} options`,
      );
    }

    this.data.options = [...options];
    return this;
  }

  /**
   * Builds the final string select menu entity object.
   *
   * @returns The complete string select menu entity
   * @throws Error if the select menu configuration is invalid
   *
   * @example
   * ```typescript
   * const selectMenu = new StringSelectMenuBuilder()
   *   .setCustomId('food_selection')
   *   .setPlaceholder('Select your favorite food')
   *   .addOptions(
   *     { label: 'Pizza', value: 'pizza' },
   *     { label: 'Sushi', value: 'sushi' }
   *   )
   *   .build();
   * ```
   */
  build(): StringSelectMenuEntity {
    this.validate();

    if (!this.data.options || this.data.options.length === 0) {
      throw new Error("String select menu must have at least one option");
    }

    if (this.data.options.length > COMPONENT_LIMITS.SELECT_OPTIONS) {
      throw new Error(
        `Select menus cannot have more than ${COMPONENT_LIMITS.SELECT_OPTIONS} options`,
      );
    }

    return this.data as StringSelectMenuEntity;
  }
}

/**
 * Builder for user select menu components.
 *
 * User select menus allow users to select one or more members from the server.
 *
 * @example
 * ```typescript
 * const userSelect = new UserSelectMenuBuilder()
 *   .setCustomId('user_selection')
 *   .setPlaceholder('Select a user')
 *   .build();
 * ```
 */
export class UserSelectMenuBuilder extends BaseSelectMenuBuilder<UserSelectMenuEntity> {
  /**
   * Creates a new UserSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: Partial<UserSelectMenuEntity>) {
    super(ComponentType.UserSelect, data);

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
  static from(data: Partial<UserSelectMenuEntity>): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(data);
  }

  /**
   * Adds a default user value to the select menu.
   *
   * @param userId - The ID of the user to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new UserSelectMenuBuilder().addDefaultUser('123456789012345678');
   * ```
   */
  addDefaultUser(userId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    this.data.default_values.push({
      id: userId,
      type: "user",
    });

    return this;
  }

  /**
   * Sets the default user values for the select menu.
   *
   * @param userIds - The IDs of the users to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new UserSelectMenuBuilder().setDefaultUsers(['123456789012345678', '987654321098765432']);
   * ```
   */
  setDefaultUsers(userIds: Snowflake[]): this {
    this.data.default_values = userIds.map((id) => ({
      id,
      type: "user",
    }));

    return this;
  }

  /**
   * Builds the final user select menu entity object.
   *
   * @returns The complete user select menu entity
   * @throws Error if the select menu configuration is invalid
   *
   * @example
   * ```typescript
   * const userSelect = new UserSelectMenuBuilder()
   *   .setCustomId('user_selection')
   *   .setPlaceholder('Select a user')
   *   .build();
   * ```
   */
  build(): UserSelectMenuEntity {
    this.validate();

    // Validate default values if present
    if (this.data.default_values) {
      // Ensure all default values are of type 'user'
      for (const defaultValue of this.data.default_values) {
        if (defaultValue.type !== "user") {
          throw new Error("User select menu can only have user default values");
        }
      }

      // Ensure the number of default values is within min_values and max_values
      const minValues = this.data.min_values ?? 1;
      const maxValues = this.data.max_values ?? 1;

      if (this.data.default_values.length < minValues) {
        throw new Error(
          `User select menu must have at least ${minValues} default values`,
        );
      }

      if (this.data.default_values.length > maxValues) {
        throw new Error(
          `User select menu cannot have more than ${maxValues} default values`,
        );
      }
    }

    return this.data as UserSelectMenuEntity;
  }
}

/**
 * Builder for role select menu components.
 *
 * Role select menus allow users to select one or more roles from the server.
 *
 * @example
 * ```typescript
 * const roleSelect = new RoleSelectMenuBuilder()
 *   .setCustomId('role_selection')
 *   .setPlaceholder('Select a role')
 *   .build();
 * ```
 */
export class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<RoleSelectMenuEntity> {
  /**
   * Creates a new RoleSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: Partial<RoleSelectMenuEntity>) {
    super(ComponentType.RoleSelect, data);

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
  static from(data: Partial<RoleSelectMenuEntity>): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(data);
  }

  /**
   * Adds a default role value to the select menu.
   *
   * @param roleId - The ID of the role to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new RoleSelectMenuBuilder().addDefaultRole('123456789012345678');
   * ```
   */
  addDefaultRole(roleId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    this.data.default_values.push({
      id: roleId,
      type: "role",
    });

    return this;
  }

  /**
   * Sets the default role values for the select menu.
   *
   * @param roleIds - The IDs of the roles to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new RoleSelectMenuBuilder().setDefaultRoles(['123456789012345678', '987654321098765432']);
   * ```
   */
  setDefaultRoles(roleIds: Snowflake[]): this {
    this.data.default_values = roleIds.map((id) => ({
      id,
      type: "role",
    }));

    return this;
  }

  /**
   * Builds the final role select menu entity object.
   *
   * @returns The complete role select menu entity
   * @throws Error if the select menu configuration is invalid
   *
   * @example
   * ```typescript
   * const roleSelect = new RoleSelectMenuBuilder()
   *   .setCustomId('role_selection')
   *   .setPlaceholder('Select a role')
   *   .build();
   * ```
   */
  build(): RoleSelectMenuEntity {
    this.validate();

    // Validate default values if present
    if (this.data.default_values) {
      // Ensure all default values are of type 'role'
      for (const defaultValue of this.data.default_values) {
        if (defaultValue.type !== "role") {
          throw new Error("Role select menu can only have role default values");
        }
      }

      // Ensure the number of default values is within min_values and max_values
      const minValues = this.data.min_values ?? 1;
      const maxValues = this.data.max_values ?? 1;

      if (this.data.default_values.length < minValues) {
        throw new Error(
          `Role select menu must have at least ${minValues} default values`,
        );
      }

      if (this.data.default_values.length > maxValues) {
        throw new Error(
          `Role select menu cannot have more than ${maxValues} default values`,
        );
      }
    }

    return this.data as RoleSelectMenuEntity;
  }
}

/**
 * Builder for mentionable select menu components.
 *
 * Mentionable select menus allow users to select one or more users or roles from the server.
 *
 * @example
 * ```typescript
 * const mentionableSelect = new MentionableSelectMenuBuilder()
 *   .setCustomId('mentionable_selection')
 *   .setPlaceholder('Select a user or role')
 *   .build();
 * ```
 */
export class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<MentionableSelectMenuEntity> {
  /**
   * Creates a new MentionableSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: Partial<MentionableSelectMenuEntity>) {
    super(ComponentType.MentionableSelect, data);

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
    data: Partial<MentionableSelectMenuEntity>,
  ): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(data);
  }

  /**
   * Adds a default user value to the select menu.
   *
   * @param userId - The ID of the user to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new MentionableSelectMenuBuilder().addDefaultUser('123456789012345678');
   * ```
   */
  addDefaultUser(userId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    this.data.default_values.push({
      id: userId,
      type: "user",
    });

    return this;
  }

  /**
   * Adds a default role value to the select menu.
   *
   * @param roleId - The ID of the role to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new MentionableSelectMenuBuilder().addDefaultRole('123456789012345678');
   * ```
   */
  addDefaultRole(roleId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    this.data.default_values.push({
      id: roleId,
      type: "role",
    });

    return this;
  }

  /**
   * Sets the default mentionable values for the select menu.
   *
   * @param values - The default values to set
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new MentionableSelectMenuBuilder().setDefaultValues([
   *   { id: '123456789012345678', type: 'user' },
   *   { id: '987654321098765432', type: 'role' }
   * ]);
   * ```
   */
  setDefaultValues(values: SelectMenuDefaultValueEntity[]): this {
    this.data.default_values = values.map((value) => ({
      id: value.id,
      type: value.type,
    }));

    return this;
  }

  /**
   * Builds the final mentionable select menu entity object.
   *
   * @returns The complete mentionable select menu entity
   * @throws Error if the select menu configuration is invalid
   *
   * @example
   * ```typescript
   * const mentionableSelect = new MentionableSelectMenuBuilder()
   *   .setCustomId('mentionable_selection')
   *   .setPlaceholder('Select a user or role')
   *   .build();
   * ```
   */
  build(): MentionableSelectMenuEntity {
    this.validate();

    // Validate default values if present
    if (this.data.default_values) {
      // Ensure all default values are of type 'user' or 'role'
      for (const defaultValue of this.data.default_values) {
        if (defaultValue.type !== "user" && defaultValue.type !== "role") {
          throw new Error(
            "Mentionable select menu can only have user or role default values",
          );
        }
      }

      // Ensure the number of default values is within min_values and max_values
      const minValues = this.data.min_values ?? 1;
      const maxValues = this.data.max_values ?? 1;

      if (this.data.default_values.length < minValues) {
        throw new Error(
          `Mentionable select menu must have at least ${minValues} default values`,
        );
      }

      if (this.data.default_values.length > maxValues) {
        throw new Error(
          `Mentionable select menu cannot have more than ${maxValues} default values`,
        );
      }
    }

    return this.data as MentionableSelectMenuEntity;
  }
}

/**
 * Builder for channel select menu components.
 *
 * Channel select menus allow users to select one or more channels from the server.
 *
 * @example
 * ```typescript
 * const channelSelect = new ChannelSelectMenuBuilder()
 *   .setCustomId('channel_selection')
 *   .setPlaceholder('Select a channel')
 *   .build();
 * ```
 */
export class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<ChannelSelectMenuEntity> {
  /**
   * Creates a new ChannelSelectMenuBuilder instance.
   *
   * @param data - Optional initial data to populate the select menu with
   */
  constructor(data?: Partial<ChannelSelectMenuEntity>) {
    super(ComponentType.ChannelSelect, data);

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
    data: Partial<ChannelSelectMenuEntity>,
  ): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(data);
  }

  /**
   * Adds a channel type filter to the select menu.
   *
   * @param channelType - The channel type to add
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new ChannelSelectMenuBuilder().addChannelType(ChannelType.GuildText);
   * ```
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
   *
   * @example
   * ```typescript
   * new ChannelSelectMenuBuilder().setChannelTypes([
   *   ChannelType.GuildText,
   *   ChannelType.GuildVoice
   * ]);
   * ```
   */
  setChannelTypes(...channelTypes: ChannelType[]): this {
    this.data.channel_types = channelTypes;
    return this;
  }

  /**
   * Adds a default channel value to the select menu.
   *
   * @param channelId - The ID of the channel to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new ChannelSelectMenuBuilder().addDefaultChannel('123456789012345678');
   * ```
   */
  addDefaultChannel(channelId: Snowflake): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }

    this.data.default_values.push({
      id: channelId,
      type: "channel",
    });

    return this;
  }

  /**
   * Sets the default channel values for the select menu.
   *
   * @param channelIds - The IDs of the channels to select by default
   * @returns The select menu builder instance for method chaining
   *
   * @example
   * ```typescript
   * new ChannelSelectMenuBuilder().setDefaultChannels(['123456789012345678', '987654321098765432']);
   * ```
   */
  setDefaultChannels(channelIds: Snowflake[]): this {
    this.data.default_values = channelIds.map((id) => ({
      id,
      type: "channel",
    }));

    return this;
  }

  /**
   * Builds the final channel select menu entity object.
   *
   * @returns The complete channel select menu entity
   * @throws Error if the select menu configuration is invalid
   *
   * @example
   * ```typescript
   * const channelSelect = new ChannelSelectMenuBuilder()
   *   .setCustomId('channel_selection')
   *   .setPlaceholder('Select a channel')
   *   .setChannelTypes([ChannelType.GuildText])
   *   .build();
   * ```
   */
  build(): ChannelSelectMenuEntity {
    this.validate();

    // Validate default values if present
    if (this.data.default_values) {
      // Ensure all default values are of type 'channel'
      for (const defaultValue of this.data.default_values) {
        if (defaultValue.type !== "channel") {
          throw new Error(
            "Channel select menu can only have channel default values",
          );
        }
      }

      // Ensure the number of default values is within min_values and max_values
      const minValues = this.data.min_values ?? 1;
      const maxValues = this.data.max_values ?? 1;

      if (this.data.default_values.length < minValues) {
        throw new Error(
          `Channel select menu must have at least ${minValues} default values`,
        );
      }

      if (this.data.default_values.length > maxValues) {
        throw new Error(
          `Channel select menu cannot have more than ${maxValues} default values`,
        );
      }
    }

    return this.data as ChannelSelectMenuEntity;
  }
}
