import { BaseBuilder } from "../../bases/index.js";
import { type EmojiResolvable, resolveEmoji } from "../../utils/index.js";
import { ChannelType } from "../channel/index.js";
import {
  type AnySelectMenuEntity,
  type ChannelSelectMenuEntity,
  ComponentType,
  type MentionableSelectMenuEntity,
  type RoleSelectMenuEntity,
  type SelectMenuDefaultValueEntity,
  type SelectMenuEntity,
  type SelectMenuOptionEntity,
  type StringSelectMenuEntity,
  type UserSelectMenuEntity,
} from "./components.entity.js";

/**
 * @description Builder for individual Discord select menu options.
 * @see {@link https://discord.com/developers/docs/components/reference#string-select-select-option-structure}
 */
export class SelectMenuOptionBuilder extends BaseBuilder<SelectMenuOptionEntity> {
  constructor(data?: Partial<SelectMenuOptionEntity>) {
    super(data || {});
  }

  /**
   * @description Creates an option builder from existing data.
   * @param data - Existing option data
   * @returns New option builder instance
   */
  static from(data: SelectMenuOptionEntity): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(data);
  }

  /**
   * @description Sets the user-facing label for this option.
   * @param label - Option label (max 100 characters)
   * @returns This builder instance for method chaining
   */
  setLabel(label: string): this {
    if (label.length > 100) {
      throw new Error("Select menu option label cannot exceed 100 characters");
    }
    return this.set("label", label);
  }

  /**
   * @description Sets the developer-defined value for this option.
   * @param value - Option value (max 100 characters)
   * @returns This builder instance for method chaining
   */
  setValue(value: string): this {
    if (value.length > 100) {
      throw new Error("Select menu option value cannot exceed 100 characters");
    }
    return this.set("value", value);
  }

  /**
   * @description Sets the detailed description for this option.
   * @param description - Option description (max 100 characters)
   * @returns This builder instance for method chaining
   */
  setDescription(description: string): this {
    if (description.length > 100) {
      throw new Error("Select menu option description cannot exceed 100 characters");
    }
    return this.set("description", description);
  }

  /**
   * @description Sets the emoji for this option.
   * @param emoji - Emoji resolvable
   * @returns This builder instance for method chaining
   */
  setEmoji(emoji: EmojiResolvable): this {
    return this.set("emoji", resolveEmoji(emoji));
  }

  /**
   * @description Sets whether this option is selected by default.
   * @param isDefault - Whether option is default (defaults to true)
   * @returns This builder instance for method chaining
   */
  setDefault(isDefault = true): this {
    return this.set("default", isDefault);
  }

  protected validate(): void {
    const data = this.rawData;
    if (!data.label) {
      throw new Error("Select menu option must have a label");
    }
    if (!data.value) {
      throw new Error("Select menu option must have a value");
    }
  }
}

/**
 * @description Builder for Discord select menu default values.
 * @see {@link https://discord.com/developers/docs/components/reference#user-select-select-default-value-structure}
 */
export class SelectMenuDefaultValueBuilder extends BaseBuilder<SelectMenuDefaultValueEntity> {
  constructor(data?: Partial<SelectMenuDefaultValueEntity>) {
    super(data || {});
  }

  /**
   * @description Creates a default value builder from existing data.
   * @param data - Existing default value data
   * @returns New default value builder instance
   */
  static from(data: SelectMenuDefaultValueEntity): SelectMenuDefaultValueBuilder {
    return new SelectMenuDefaultValueBuilder(data);
  }

  /**
   * @description Sets the Discord snowflake ID of the entity.
   * @param id - Entity ID
   * @returns This builder instance for method chaining
   */
  setId(id: string): this {
    return this.set("id", id);
  }

  /**
   * @description Sets the entity type for proper Discord API resolution.
   * @param type - Entity type
   * @returns This builder instance for method chaining
   */
  setType(type: "user" | "role" | "channel"): this {
    return this.set("type", type);
  }

  protected validate(): void {
    const data = this.rawData;
    if (!data.id) {
      throw new Error("Select menu default value must have an ID");
    }
    if (!data.type) {
      throw new Error("Select menu default value must have a type");
    }
  }
}

/**
 * @description Abstract base builder for all Discord select menu types.
 * @template T - The select menu entity type being built
 */
export abstract class BaseSelectMenuBuilder<T extends AnySelectMenuEntity> extends BaseBuilder<T> {
  protected constructor(componentType: ComponentType, data?: Partial<T>) {
    super({
      type: componentType,
      ...data,
    } as Partial<T>);
  }

  /**
   * @description Sets the custom ID for interaction responses.
   * @param customId - Developer-defined identifier (max 100 characters)
   * @returns This builder instance for method chaining
   */
  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Select menu custom ID cannot exceed 100 characters");
    }
    return this.set("custom_id", customId);
  }

  /**
   * @description Sets the placeholder text when nothing is selected.
   * @param placeholder - Placeholder text (max 150 characters)
   * @returns This builder instance for method chaining
   */
  setPlaceholder(placeholder: string): this {
    if (placeholder.length > 150) {
      throw new Error("Select menu placeholder cannot exceed 150 characters");
    }
    return this.set("placeholder", placeholder);
  }

  /**
   * @description Sets the minimum number of required selections.
   * @param minValues - Minimum selections (0-25, defaults to 1)
   * @returns This builder instance for method chaining
   */
  setMinValues(minValues: number): this {
    if (minValues < 0 || minValues > 25) {
      throw new Error("Select menu minimum values must be between 0 and 25");
    }
    return this.set("min_values", minValues);
  }

  /**
   * @description Sets the maximum number of allowed selections.
   * @param maxValues - Maximum selections (1-25, defaults to 1)
   * @returns This builder instance for method chaining
   */
  setMaxValues(maxValues: number): this {
    if (maxValues < 1 || maxValues > 25) {
      throw new Error("Select menu maximum values must be between 1 and 25");
    }
    return this.set("max_values", maxValues);
  }

  /**
   * @description Sets whether the select menu is disabled.
   * @param disabled - Whether select menu is disabled (defaults to true)
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled = true): this {
    return this.set("disabled", disabled);
  }

  /**
   * @description Sets whether the select menu is required in modals.
   * @param required - Whether select menu is required (defaults to true)
   * @returns This builder instance for method chaining
   */
  setRequired(required = true): this {
    // @ts-expect-error - AnySelectMenuEntity doesn't include 'required' but it's valid in modals
    return this.set<SelectMenuEntity>("required", required);
  }

  /**
   * @description Sets the unique component identifier.
   * @param id - Component identifier
   * @returns This builder instance for method chaining
   */
  setId(id: number): this {
    return this.set("id", id);
  }

  protected validate(): void {
    const data = this.rawData;
    if (!data.custom_id) {
      throw new Error("Select menu must have a custom_id");
    }

    // Validate min/max values relationship
    if (data.min_values !== undefined && data.max_values !== undefined) {
      if (data.min_values > data.max_values) {
        throw new Error("Select menu minimum values cannot exceed maximum values");
      }
    }
  }
}

/**
 * @description Builder for Discord string select menu components with developer-defined options.
 * @see {@link https://discord.com/developers/docs/components/reference#string-select}
 */
export class StringSelectMenuBuilder extends BaseSelectMenuBuilder<StringSelectMenuEntity> {
  constructor(data?: Partial<StringSelectMenuEntity>) {
    super(ComponentType.StringSelect, {
      options: [],
      ...data,
    });
  }

  /**
   * @description Creates a string select menu builder from existing data.
   * @param data - Existing string select menu data
   * @returns New string select menu builder instance
   */
  static from(data: StringSelectMenuEntity): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(data);
  }

  /**
   * @description Adds a single option to the select menu.
   * @param option - Select menu option
   * @returns This builder instance for method chaining
   */
  addOption(option: SelectMenuOptionEntity): this {
    return this.pushToArray("options", option);
  }

  /**
   * @description Adds multiple options to the select menu.
   * @param options - Select menu options
   * @returns This builder instance for method chaining
   */
  addOptions(...options: SelectMenuOptionEntity[]): this {
    for (const option of options) {
      this.addOption(option);
    }
    return this;
  }

  /**
   * @description Sets all options for the select menu, replacing existing ones.
   * @param options - Select menu options (max 25)
   * @returns This builder instance for method chaining
   */
  setOptions(options: SelectMenuOptionEntity[]): this {
    if (options.length > 25) {
      throw new Error("String select menu cannot have more than 25 options");
    }
    return this.setArray("options", options);
  }

  protected override validate(): void {
    super.validate();
    const data = this.rawData;

    if (!data.options || data.options.length === 0) {
      throw new Error("String select menu must have at least one option");
    }

    if (data.options.length > 25) {
      throw new Error("String select menu cannot have more than 25 options");
    }
  }
}

/**
 * @description Builder for Discord user select menu components with auto-populated users.
 * @see {@link https://discord.com/developers/docs/components/reference#user-select}
 */
export class UserSelectMenuBuilder extends BaseSelectMenuBuilder<UserSelectMenuEntity> {
  constructor(data?: Partial<UserSelectMenuEntity>) {
    super(ComponentType.UserSelect, data);
  }

  /**
   * @description Creates a user select menu builder from existing data.
   * @param data - Existing user select menu data
   * @returns New user select menu builder instance
   */
  static from(data: UserSelectMenuEntity): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(data);
  }

  /**
   * @description Adds a default selected user.
   * @param userId - Discord user ID
   * @returns This builder instance for method chaining
   */
  addDefaultUser(userId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(userId).setType("user").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  /**
   * @description Sets all default selected users, replacing existing ones.
   * @param userIds - Array of Discord user IDs
   * @returns This builder instance for method chaining
   */
  setDefaultUsers(userIds: string[]): this {
    const defaultValues = userIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("user").toJSON(),
    );
    return this.setArray("default_values", defaultValues);
  }
}

/**
 * @description Builder for Discord role select menu components with auto-populated roles.
 * @see {@link https://discord.com/developers/docs/components/reference#role-select}
 */
export class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<RoleSelectMenuEntity> {
  constructor(data?: Partial<RoleSelectMenuEntity>) {
    super(ComponentType.RoleSelect, data);
  }

  /**
   * @description Creates a role select menu builder from existing data.
   * @param data - Existing role select menu data
   * @returns New role select menu builder instance
   */
  static from(data: RoleSelectMenuEntity): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(data);
  }

  /**
   * @description Adds a default selected role.
   * @param roleId - Discord role ID
   * @returns This builder instance for method chaining
   */
  addDefaultRole(roleId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(roleId).setType("role").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  /**
   * @description Sets all default selected roles, replacing existing ones.
   * @param roleIds - Array of Discord role IDs
   * @returns This builder instance for method chaining
   */
  setDefaultRoles(roleIds: string[]): this {
    const defaultValues = roleIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("role").toJSON(),
    );
    return this.setArray("default_values", defaultValues);
  }
}

/**
 * @description Builder for Discord mentionable select menu components combining users and roles.
 * @see {@link https://discord.com/developers/docs/components/reference#mentionable-select}
 */
export class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<MentionableSelectMenuEntity> {
  constructor(data?: Partial<MentionableSelectMenuEntity>) {
    super(ComponentType.MentionableSelect, data);
  }

  /**
   * @description Creates a mentionable select menu builder from existing data.
   * @param data - Existing mentionable select menu data
   * @returns New mentionable select menu builder instance
   */
  static from(data: MentionableSelectMenuEntity): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(data);
  }

  /**
   * @description Adds a default selected user.
   * @param userId - Discord user ID
   * @returns This builder instance for method chaining
   */
  addDefaultUser(userId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(userId).setType("user").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  /**
   * @description Adds a default selected role.
   * @param roleId - Discord role ID
   * @returns This builder instance for method chaining
   */
  addDefaultRole(roleId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(roleId).setType("role").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  /**
   * @description Sets all default selected values, replacing existing ones.
   * @param values - Array of default values
   * @returns This builder instance for method chaining
   */
  setDefaultValues(values: SelectMenuDefaultValueEntity[]): this {
    return this.setArray("default_values", values);
  }
}

/**
 * @description Builder for Discord channel select menu components with optional type filtering.
 * @see {@link https://discord.com/developers/docs/components/reference#channel-select}
 */
export class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<ChannelSelectMenuEntity> {
  constructor(data?: Partial<ChannelSelectMenuEntity>) {
    super(ComponentType.ChannelSelect, data);
  }

  /**
   * @description Creates a channel select menu builder from existing data.
   * @param data - Existing channel select menu data
   * @returns New channel select menu builder instance
   */
  static from(data: ChannelSelectMenuEntity): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(data);
  }

  /**
   * @description Adds a channel type filter.
   * @param channelType - Discord channel type
   * @returns This builder instance for method chaining
   */
  addChannelType(channelType: ChannelType): this {
    return this.pushToArray("channel_types", channelType);
  }

  /**
   * @description Sets all channel type filters, replacing existing ones.
   * @param channelTypes - Array of Discord channel types
   * @returns This builder instance for method chaining
   */
  setChannelTypes(...channelTypes: ChannelType[]): this {
    return this.setArray("channel_types", channelTypes);
  }

  /**
   * @description Adds a default selected channel.
   * @param channelId - Discord channel ID
   * @returns This builder instance for method chaining
   */
  addDefaultChannel(channelId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId(channelId)
      .setType("channel")
      .toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  /**
   * @description Sets all default selected channels, replacing existing ones.
   * @param channelIds - Array of Discord channel IDs
   * @returns This builder instance for method chaining
   */
  setDefaultChannels(channelIds: string[]): this {
    const defaultValues = channelIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("channel").toJSON(),
    );
    return this.setArray("default_values", defaultValues);
  }

  /**
   * @description Filters to only show text-based channels.
   * @returns This builder instance for method chaining
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
   * @description Filters to only show voice-based channels.
   * @returns This builder instance for method chaining
   */
  voiceChannelsOnly(): this {
    return this.setChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice);
  }

  /**
   * @description Filters to only show category channels.
   * @returns This builder instance for method chaining
   */
  categoriesOnly(): this {
    return this.setChannelTypes(ChannelType.GuildCategory);
  }
}
