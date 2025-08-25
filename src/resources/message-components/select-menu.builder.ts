import { type EmojiResolvable, resolveEmoji } from "../../utils/index.js";
import { ChannelType } from "../channel/index.js";
import {
  type AnySelectMenuEntity,
  type ChannelSelectMenuEntity,
  ComponentType,
  type MentionableSelectMenuEntity,
  type RoleSelectMenuEntity,
  type SelectMenuDefaultValueEntity,
  type SelectMenuOptionEntity,
  type StringSelectMenuEntity,
  type UserSelectMenuEntity,
} from "./message-components.entity.js";

export class SelectMenuOptionBuilder {
  readonly #data: Partial<SelectMenuOptionEntity> = {};
  constructor(data?: SelectMenuOptionEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: SelectMenuOptionEntity): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(data);
  }
  setLabel(label: string): this {
    this.#data.label = label;
    return this;
  }
  setValue(value: string): this {
    this.#data.value = value;
    return this;
  }
  setDescription(description: string): this {
    this.#data.description = description;
    return this;
  }
  setEmoji(emoji: EmojiResolvable): this {
    this.#data.emoji = resolveEmoji(emoji);
    return this;
  }
  setDefault(isDefault = true): this {
    this.#data.default = isDefault;
    return this;
  }
  build(): SelectMenuOptionEntity {
    return this.#data as SelectMenuOptionEntity;
  }
  toJson(): Readonly<SelectMenuOptionEntity> {
    return Object.freeze({ ...this.#data }) as SelectMenuOptionEntity;
  }
}

export class SelectMenuDefaultValueBuilder {
  readonly #data: Partial<SelectMenuDefaultValueEntity> = {};
  constructor(data?: SelectMenuDefaultValueEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: SelectMenuDefaultValueEntity): SelectMenuDefaultValueBuilder {
    return new SelectMenuDefaultValueBuilder(data);
  }
  setId(id: string): this {
    this.#data.id = id;
    return this;
  }
  setType(type: "user" | "role" | "channel"): this {
    this.#data.type = type;
    return this;
  }
  build(): SelectMenuDefaultValueEntity {
    return this.#data as SelectMenuDefaultValueEntity;
  }
  toJson(): Readonly<SelectMenuDefaultValueEntity> {
    return Object.freeze({ ...this.#data }) as SelectMenuDefaultValueEntity;
  }
}

export abstract class BaseSelectMenuBuilder<T extends AnySelectMenuEntity> {
  protected readonly data: Partial<T>;
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
  setCustomId(customId: string): this {
    this.data.custom_id = customId;
    return this;
  }
  setPlaceholder(placeholder: string): this {
    this.data.placeholder = placeholder;
    return this;
  }
  setMinValues(minValues: number): this {
    this.data.min_values = minValues;
    return this;
  }
  setMaxValues(maxValues: number): this {
    this.data.max_values = maxValues;
    return this;
  }
  setDisabled(disabled = true): this {
    this.data.disabled = disabled;
    return this;
  }
  setId(id: number): this {
    this.data.id = id;
    return this;
  }
  toJson(): Readonly<Partial<T>> {
    return Object.freeze({ ...this.data });
  }
  abstract build(): T;
}

export class StringSelectMenuBuilder extends BaseSelectMenuBuilder<StringSelectMenuEntity> {
  constructor(data?: StringSelectMenuEntity) {
    super(ComponentType.StringSelect, data);
    if (!this.data.options) {
      this.data.options = [];
    }
  }
  static from(data: StringSelectMenuEntity): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(data);
  }
  addOption(option: SelectMenuOptionEntity): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    this.data.options.push(option);
    return this;
  }
  addOptions(...options: SelectMenuOptionEntity[]): this {
    for (const option of options) {
      this.addOption(option);
    }
    return this;
  }
  setOptions(options: SelectMenuOptionEntity[]): this {
    this.data.options = [...options];
    return this;
  }
  build(): StringSelectMenuEntity {
    return this.data as StringSelectMenuEntity;
  }
}

export class UserSelectMenuBuilder extends BaseSelectMenuBuilder<UserSelectMenuEntity> {
  constructor(data?: UserSelectMenuEntity) {
    super(ComponentType.UserSelect, data);
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }
  }
  static from(data: UserSelectMenuEntity): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(data);
  }
  addDefaultUser(userId: string): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(userId).setType("user").build();
    this.data.default_values.push(defaultValue);
    return this;
  }
  setDefaultUsers(userIds: string[]): this {
    this.data.default_values = userIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("user").build(),
    );
    return this;
  }
  build(): UserSelectMenuEntity {
    return this.data as UserSelectMenuEntity;
  }
}

export class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<RoleSelectMenuEntity> {
  constructor(data?: RoleSelectMenuEntity) {
    super(ComponentType.RoleSelect, data);
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }
  }
  static from(data: RoleSelectMenuEntity): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(data);
  }
  addDefaultRole(roleId: string): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(roleId).setType("role").build();
    this.data.default_values.push(defaultValue);
    return this;
  }
  setDefaultRoles(roleIds: string[]): this {
    this.data.default_values = roleIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("role").build(),
    );
    return this;
  }
  build(): RoleSelectMenuEntity {
    return this.data as RoleSelectMenuEntity;
  }
}

export class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<MentionableSelectMenuEntity> {
  constructor(data?: MentionableSelectMenuEntity) {
    super(ComponentType.MentionableSelect, data);
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }
  }
  static from(data: MentionableSelectMenuEntity): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(data);
  }
  addDefaultUser(userId: string): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(userId).setType("user").build();
    this.data.default_values.push(defaultValue);
    return this;
  }
  addDefaultRole(roleId: string): this {
    if (!this.data.default_values) {
      this.data.default_values = [];
    }
    const defaultValue = new SelectMenuDefaultValueBuilder().setId(roleId).setType("role").build();
    this.data.default_values.push(defaultValue);
    return this;
  }
  setDefaultValues(values: SelectMenuDefaultValueEntity[]): this {
    this.data.default_values = [...values];
    return this;
  }
  build(): MentionableSelectMenuEntity {
    return this.data as MentionableSelectMenuEntity;
  }
}

export class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<ChannelSelectMenuEntity> {
  constructor(data?: ChannelSelectMenuEntity) {
    super(ComponentType.ChannelSelect, data);
    if (data?.default_values && !this.data.default_values) {
      this.data.default_values = [...data.default_values];
    }
    if (data?.channel_types && !this.data.channel_types) {
      this.data.channel_types = [...data.channel_types];
    }
  }
  static from(data: ChannelSelectMenuEntity): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(data);
  }
  addChannelType(channelType: ChannelType): this {
    if (!this.data.channel_types) {
      this.data.channel_types = [];
    }
    if (!this.data.channel_types.includes(channelType)) {
      this.data.channel_types.push(channelType);
    }
    return this;
  }
  setChannelTypes(...channelTypes: ChannelType[]): this {
    this.data.channel_types = [...channelTypes];
    return this;
  }
  addDefaultChannel(channelId: string): this {
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
  setDefaultChannels(channelIds: string[]): this {
    this.data.default_values = channelIds.map((id) =>
      new SelectMenuDefaultValueBuilder().setId(id).setType("channel").build(),
    );
    return this;
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
  build(): ChannelSelectMenuEntity {
    return this.data as ChannelSelectMenuEntity;
  }
}
