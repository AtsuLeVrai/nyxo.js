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

export class SelectMenuOptionBuilder extends BaseBuilder<SelectMenuOptionEntity> {
  constructor(data?: Partial<SelectMenuOptionEntity>) {
    super(data || {});
  }

  static from(data: SelectMenuOptionEntity): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(data);
  }

  setLabel(label: string): this {
    if (label.length > 100) {
      throw new Error("Select menu option label cannot exceed 100 characters");
    }
    return this.set("label", label);
  }

  setValue(value: string): this {
    if (value.length > 100) {
      throw new Error("Select menu option value cannot exceed 100 characters");
    }
    return this.set("value", value);
  }

  setDescription(description: string): this {
    if (description.length > 100) {
      throw new Error("Select menu option description cannot exceed 100 characters");
    }
    return this.set("description", description);
  }

  setEmoji(emoji: EmojiResolvable): this {
    return this.set("emoji", resolveEmoji(emoji));
  }

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

export class SelectMenuDefaultValueBuilder extends BaseBuilder<SelectMenuDefaultValueEntity> {
  constructor(data?: Partial<SelectMenuDefaultValueEntity>) {
    super(data || {});
  }

  static from(data: SelectMenuDefaultValueEntity): SelectMenuDefaultValueBuilder {
    return new SelectMenuDefaultValueBuilder(data);
  }

  setId(id: string): this {
    return this.set("id", id);
  }

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

export abstract class BaseSelectMenuBuilder<T extends AnySelectMenuEntity> extends BaseBuilder<T> {
  protected constructor(componentType: ComponentType, data?: Partial<T>) {
    super({
      type: componentType,
      ...data,
    } as Partial<T>);
  }

  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Select menu custom ID cannot exceed 100 characters");
    }
    return this.set("custom_id", customId);
  }

  setPlaceholder(placeholder: string): this {
    if (placeholder.length > 150) {
      throw new Error("Select menu placeholder cannot exceed 150 characters");
    }
    return this.set("placeholder", placeholder);
  }

  setMinValues(minValues: number): this {
    if (minValues < 0 || minValues > 25) {
      throw new Error("Select menu minimum values must be between 0 and 25");
    }
    return this.set("min_values", minValues);
  }

  setMaxValues(maxValues: number): this {
    if (maxValues < 1 || maxValues > 25) {
      throw new Error("Select menu maximum values must be between 1 and 25");
    }
    return this.set("max_values", maxValues);
  }

  setDisabled(disabled = true): this {
    return this.set("disabled", disabled);
  }

  setRequired(required = true): this {
    // @ts-expect-error - AnySelectMenuEntity doesn't include 'required' but it's valid in modals
    return this.set<SelectMenuEntity>("required", required);
  }

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

export class StringSelectMenuBuilder extends BaseSelectMenuBuilder<StringSelectMenuEntity> {
  constructor(data?: Partial<StringSelectMenuEntity>) {
    super(ComponentType.StringSelect, {
      options: [],
      ...data,
    });
  }

  static from(data: StringSelectMenuEntity): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(data);
  }

  addOption(option: SelectMenuOptionEntity): this {
    return this.pushToArray("options", option);
  }

  addOptions(...options: SelectMenuOptionEntity[]): this {
    for (const option of options) {
      this.addOption(option);
    }
    return this;
  }

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

export class UserSelectMenuBuilder extends BaseSelectMenuBuilder<UserSelectMenuEntity> {
  constructor(data?: Partial<UserSelectMenuEntity>) {
    super(ComponentType.UserSelect, data);
  }

  static from(data: UserSelectMenuEntity): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(data);
  }

  addDefaultUser(userId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(userId).setType("user").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  setDefaultUsers(userIds: string[]): this {
    const defaultValues = userIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("user").toJSON(),
    );
    return this.setArray("default_values", defaultValues);
  }
}

export class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<RoleSelectMenuEntity> {
  constructor(data?: Partial<RoleSelectMenuEntity>) {
    super(ComponentType.RoleSelect, data);
  }

  static from(data: RoleSelectMenuEntity): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(data);
  }

  addDefaultRole(roleId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(roleId).setType("role").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  setDefaultRoles(roleIds: string[]): this {
    const defaultValues = roleIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("role").toJSON(),
    );
    return this.setArray("default_values", defaultValues);
  }
}

export class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<MentionableSelectMenuEntity> {
  constructor(data?: Partial<MentionableSelectMenuEntity>) {
    super(ComponentType.MentionableSelect, data);
  }

  static from(data: MentionableSelectMenuEntity): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(data);
  }

  addDefaultUser(userId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(userId).setType("user").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  addDefaultRole(roleId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(roleId).setType("role").toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  setDefaultValues(values: SelectMenuDefaultValueEntity[]): this {
    return this.setArray("default_values", values);
  }
}

export class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<ChannelSelectMenuEntity> {
  constructor(data?: Partial<ChannelSelectMenuEntity>) {
    super(ComponentType.ChannelSelect, data);
  }

  static from(data: ChannelSelectMenuEntity): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(data);
  }

  addChannelType(channelType: ChannelType): this {
    return this.pushToArray("channel_types", channelType);
  }

  setChannelTypes(...channelTypes: ChannelType[]): this {
    return this.setArray("channel_types", channelTypes);
  }

  addDefaultChannel(channelId: string): this {
    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId(channelId)
      .setType("channel")
      .toJSON();
    return this.pushToArray("default_values", defaultValue);
  }

  setDefaultChannels(channelIds: string[]): this {
    const defaultValues = channelIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("channel").toJSON(),
    );
    return this.setArray("default_values", defaultValues);
  }

  textChannelsOnly(): this {
    return this.setChannelTypes(
      ChannelType.GuildText,
      ChannelType.GuildAnnouncement,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.AnnouncementThread,
    );
  }

  voiceChannelsOnly(): this {
    return this.setChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice);
  }

  categoriesOnly(): this {
    return this.setChannelTypes(ChannelType.GuildCategory);
  }
}
