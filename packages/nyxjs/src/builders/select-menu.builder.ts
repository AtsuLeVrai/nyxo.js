import {
  ChannelSelectMenuEntity,
  type ChannelType,
  ComponentType,
  MentionableSelectMenuEntity,
  RoleSelectMenuEntity,
  type SelectMenuBaseEntity,
  type SelectMenuDefaultValueEntity,
  type SelectMenuOptionEntity,
  StringSelectMenuEntity,
  UserSelectMenuEntity,
} from "@nyxjs/core";
import { z } from "zod";

export abstract class BaseSelectMenuBuilder<
  T extends z.input<typeof SelectMenuBaseEntity> = z.input<
    typeof SelectMenuBaseEntity
  >,
> {
  protected data: Partial<T>;

  protected constructor(data: Partial<T> = {}) {
    this.data = data;
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

  setDefaultValues(
    values: z.input<typeof SelectMenuDefaultValueEntity>[],
  ): this {
    this.data.default_values = values;
    return this;
  }

  abstract toJson(): T;
}

export class StringSelectMenuBuilder extends BaseSelectMenuBuilder<StringSelectMenuEntity> {
  constructor(data: Partial<z.input<typeof StringSelectMenuEntity>> = {}) {
    super({
      type: ComponentType.StringSelect,
      ...data,
    });
  }

  static from(
    data: z.input<typeof StringSelectMenuEntity>,
  ): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(data);
  }

  addOption(option: z.input<typeof SelectMenuOptionEntity>): this {
    this.data.options = [...(this.data.options || []), option];
    return this;
  }

  addOptions(...options: z.input<typeof SelectMenuOptionEntity>[]): this {
    this.data.options = [...(this.data.options || []), ...options];
    return this;
  }

  setOptions(options: z.input<typeof SelectMenuOptionEntity>[]): this {
    this.data.options = options;
    return this;
  }

  toJson(): StringSelectMenuEntity {
    return StringSelectMenuEntity.parse(this.data);
  }
}

export const StringSelectMenuBuilderSchema = z.instanceof(
  StringSelectMenuBuilder,
);

export class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<ChannelSelectMenuEntity> {
  constructor(data: Partial<z.input<typeof ChannelSelectMenuEntity>> = {}) {
    super({
      type: ComponentType.ChannelSelect,
      ...data,
    });
  }

  static from(
    data: z.input<typeof ChannelSelectMenuEntity>,
  ): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(data);
  }

  setChannelType(type: ChannelType): this {
    this.data.channel_types = type;
    return this;
  }

  toJson(): ChannelSelectMenuEntity {
    return ChannelSelectMenuEntity.parse(this.data);
  }
}

export const ChannelSelectMenuBuilderSchema = z.instanceof(
  ChannelSelectMenuBuilder,
);

export class UserSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof UserSelectMenuEntity>
> {
  constructor(data: Partial<z.input<typeof UserSelectMenuEntity>> = {}) {
    super({
      type: ComponentType.UserSelect,
      ...data,
    });
  }

  static from(
    data: z.input<typeof UserSelectMenuEntity>,
  ): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(data);
  }

  toJson(): UserSelectMenuEntity {
    return UserSelectMenuEntity.parse(this.data);
  }
}

export const UserSelectMenuBuilderSchema = z.instanceof(UserSelectMenuBuilder);

export class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof RoleSelectMenuEntity>
> {
  constructor(data: Partial<z.input<typeof RoleSelectMenuEntity>> = {}) {
    super({
      type: ComponentType.RoleSelect,
      ...data,
    });
  }

  static from(
    data: z.input<typeof RoleSelectMenuEntity>,
  ): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(data);
  }

  toJson(): RoleSelectMenuEntity {
    return RoleSelectMenuEntity.parse(this.data);
  }
}

export const RoleSelectMenuBuilderSchema = z.instanceof(RoleSelectMenuBuilder);

export class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<
  z.input<typeof MentionableSelectMenuEntity>
> {
  constructor(data: Partial<z.input<typeof MentionableSelectMenuEntity>> = {}) {
    super({
      type: ComponentType.MentionableSelect,
      ...data,
    });
  }

  static from(
    data: z.input<typeof MentionableSelectMenuEntity>,
  ): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(data);
  }

  toJson(): MentionableSelectMenuEntity {
    return MentionableSelectMenuEntity.parse(this.data);
  }
}

export const MentionableSelectMenuBuilderSchema = z.instanceof(
  MentionableSelectMenuBuilder,
);
