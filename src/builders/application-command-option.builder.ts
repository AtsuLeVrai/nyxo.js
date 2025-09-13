import type { LocaleValues } from "../../enum/index.js";
import type { ChannelType } from "../channel/index.js";
import {
  type AnyApplicationCommandOptionEntity,
  type ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  type AttachmentCommandOptionEntity,
  type BooleanCommandOptionEntity,
  type ChannelCommandOptionEntity,
  type IntegerCommandOptionEntity,
  type MentionableCommandOptionEntity,
  type NumberCommandOptionEntity,
  type RoleCommandOptionEntity,
  type StringCommandOptionEntity,
  type SubCommandGroupOptionEntity,
  type SubCommandOptionEntity,
  type UserCommandOptionEntity,
} from "./application-command.entity.js";

export abstract class BaseCommandOptionBuilder<T extends AnyApplicationCommandOptionEntity> {
  protected readonly data: Partial<T>;
  protected readonly type: ApplicationCommandOptionType;
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
  setName(name: string): this {
    this.data.name = name.toLowerCase();
    return this;
  }
  setNameLocalizations(localizations: Partial<Record<LocaleValues, string>> | null): this {
    this.data.name_localizations = localizations;
    return this;
  }
  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }
  setDescriptionLocalizations(localizations: Partial<Record<LocaleValues, string>> | null): this {
    this.data.description_localizations = localizations;
    return this;
  }
  build(): T {
    return this.data as T;
  }
  toJson(): Readonly<T> {
    return Object.freeze({ ...this.data }) as T;
  }
}

export class CommandOptionChoiceBuilder {
  readonly #data: Partial<ApplicationCommandOptionChoiceEntity> = {};
  constructor(data?: ApplicationCommandOptionChoiceEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: ApplicationCommandOptionChoiceEntity): CommandOptionChoiceBuilder {
    return new CommandOptionChoiceBuilder(data);
  }
  setName(name: string): this {
    this.#data.name = name;
    return this;
  }
  setNameLocalizations(localizations: Partial<Record<LocaleValues, string>>): this {
    this.#data.name_localizations = localizations;
    return this;
  }
  setValue(value: string | number): this {
    this.#data.value = value;
    return this;
  }
  build(): ApplicationCommandOptionChoiceEntity {
    return this.#data as ApplicationCommandOptionChoiceEntity;
  }
  toJson(): Readonly<ApplicationCommandOptionChoiceEntity> {
    return Object.freeze({
      ...this.#data,
    }) as ApplicationCommandOptionChoiceEntity;
  }
}

export class StringOptionBuilder extends BaseCommandOptionBuilder<StringCommandOptionEntity> {
  constructor(data?: StringCommandOptionEntity) {
    super(ApplicationCommandOptionType.String, data);
    if (data?.choices) {
      this.data.choices = [...data.choices];
    }
  }
  static from(data: StringCommandOptionEntity): StringOptionBuilder {
    return new StringOptionBuilder(data);
  }
  addChoice(
    choice:
      | ApplicationCommandOptionChoiceEntity
      | ((builder: CommandOptionChoiceBuilder) => CommandOptionChoiceBuilder),
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }
    if (typeof choice === "function") {
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      this.data.choices.push(choice);
    }
    return this;
  }
  addChoices(...choices: ApplicationCommandOptionChoiceEntity[]): this {
    for (const choice of choices) {
      this.addChoice(choice);
    }
    return this;
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }
  setMinLength(minLength: number): this {
    this.data.min_length = minLength;
    return this;
  }
  setMaxLength(maxLength: number): this {
    this.data.max_length = maxLength;
    return this;
  }
}

export class IntegerOptionBuilder extends BaseCommandOptionBuilder<IntegerCommandOptionEntity> {
  constructor(data?: IntegerCommandOptionEntity) {
    super(ApplicationCommandOptionType.Integer, data);
    if (data?.choices) {
      this.data.choices = [...data.choices];
    }
  }
  static from(data: IntegerCommandOptionEntity): IntegerOptionBuilder {
    return new IntegerOptionBuilder(data);
  }
  addChoice(
    choice:
      | ApplicationCommandOptionChoiceEntity
      | ((builder: CommandOptionChoiceBuilder) => CommandOptionChoiceBuilder),
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }
    if (typeof choice === "function") {
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      this.data.choices.push(choice);
    }
    return this;
  }
  addChoices(...choices: ApplicationCommandOptionChoiceEntity[]): this {
    for (const choice of choices) {
      this.addChoice(choice);
    }
    return this;
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }
  setMinValue(minValue: number): this {
    this.data.min_value = minValue;
    return this;
  }
  setMaxValue(maxValue: number): this {
    this.data.max_value = maxValue;
    return this;
  }
}

export class NumberOptionBuilder extends BaseCommandOptionBuilder<NumberCommandOptionEntity> {
  constructor(data?: NumberCommandOptionEntity) {
    super(ApplicationCommandOptionType.Number, data);
    if (data?.choices) {
      this.data.choices = [...data.choices];
    }
  }
  static from(data: NumberCommandOptionEntity): NumberOptionBuilder {
    return new NumberOptionBuilder(data);
  }
  addChoice(
    choice:
      | ApplicationCommandOptionChoiceEntity
      | ((builder: CommandOptionChoiceBuilder) => CommandOptionChoiceBuilder),
  ): this {
    if (!this.data.choices) {
      this.data.choices = [];
    }
    if (typeof choice === "function") {
      const builder = new CommandOptionChoiceBuilder();
      const result = choice(builder);
      this.data.choices.push(result.build());
    } else {
      this.data.choices.push(choice);
    }
    return this;
  }
  addChoices(...choices: ApplicationCommandOptionChoiceEntity[]): this {
    for (const choice of choices) {
      this.addChoice(choice);
    }
    return this;
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }
  setMinValue(minValue: number): this {
    this.data.min_value = minValue;
    return this;
  }
  setMaxValue(maxValue: number): this {
    this.data.max_value = maxValue;
    return this;
  }
}

export class BooleanOptionBuilder extends BaseCommandOptionBuilder<BooleanCommandOptionEntity> {
  constructor(data?: BooleanCommandOptionEntity) {
    super(ApplicationCommandOptionType.Boolean, data);
  }
  static from(data: BooleanCommandOptionEntity): BooleanOptionBuilder {
    return new BooleanOptionBuilder(data);
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

export class UserOptionBuilder extends BaseCommandOptionBuilder<UserCommandOptionEntity> {
  constructor(data?: UserCommandOptionEntity) {
    super(ApplicationCommandOptionType.User, data);
  }
  static from(data: UserCommandOptionEntity): UserOptionBuilder {
    return new UserOptionBuilder(data);
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

export class ChannelOptionBuilder extends BaseCommandOptionBuilder<ChannelCommandOptionEntity> {
  constructor(data?: ChannelCommandOptionEntity) {
    super(ApplicationCommandOptionType.Channel, data);
    if (data?.channel_types) {
      this.data.channel_types = [...data.channel_types];
    }
  }
  static from(data: ChannelCommandOptionEntity): ChannelOptionBuilder {
    return new ChannelOptionBuilder(data);
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
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

export class RoleOptionBuilder extends BaseCommandOptionBuilder<RoleCommandOptionEntity> {
  constructor(data?: RoleCommandOptionEntity) {
    super(ApplicationCommandOptionType.Role, data);
  }
  static from(data: RoleCommandOptionEntity): RoleOptionBuilder {
    return new RoleOptionBuilder(data);
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

export class MentionableOptionBuilder extends BaseCommandOptionBuilder<MentionableCommandOptionEntity> {
  constructor(data?: MentionableCommandOptionEntity) {
    super(ApplicationCommandOptionType.Mentionable, data);
  }
  static from(data: MentionableCommandOptionEntity): MentionableOptionBuilder {
    return new MentionableOptionBuilder(data);
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

export class AttachmentOptionBuilder extends BaseCommandOptionBuilder<AttachmentCommandOptionEntity> {
  constructor(data?: AttachmentCommandOptionEntity) {
    super(ApplicationCommandOptionType.Attachment, data);
  }
  static from(data: AttachmentCommandOptionEntity): AttachmentOptionBuilder {
    return new AttachmentOptionBuilder(data);
  }
  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }
}

export class SubCommandBuilder extends BaseCommandOptionBuilder<SubCommandOptionEntity> {
  constructor(data?: SubCommandOptionEntity) {
    super(ApplicationCommandOptionType.SubCommand, data);
    if (data?.options) {
      this.data.options = [...data.options];
    }
  }
  static from(data: SubCommandOptionEntity): SubCommandBuilder {
    return new SubCommandBuilder(data);
  }
  addStringOption(optionBuilder: (builder: StringOptionBuilder) => StringOptionBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new StringOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addIntegerOption(optionBuilder: (builder: IntegerOptionBuilder) => IntegerOptionBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new IntegerOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addNumberOption(optionBuilder: (builder: NumberOptionBuilder) => NumberOptionBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new NumberOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addBooleanOption(optionBuilder: (builder: BooleanOptionBuilder) => BooleanOptionBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new BooleanOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addUserOption(optionBuilder: (builder: UserOptionBuilder) => UserOptionBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new UserOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addChannelOption(optionBuilder: (builder: ChannelOptionBuilder) => ChannelOptionBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new ChannelOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addRoleOption(optionBuilder: (builder: RoleOptionBuilder) => RoleOptionBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new RoleOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addMentionableOption(
    optionBuilder: (builder: MentionableOptionBuilder) => MentionableOptionBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new MentionableOptionBuilder();
    const result = optionBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addAttachmentOption(
    optionBuilder: (builder: AttachmentOptionBuilder) => AttachmentOptionBuilder,
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

export class SubCommandGroupBuilder extends BaseCommandOptionBuilder<SubCommandGroupOptionEntity> {
  constructor(data?: SubCommandGroupOptionEntity) {
    super(ApplicationCommandOptionType.SubCommandGroup, data);
    if (data?.options) {
      this.data.options = [...data.options];
    } else {
      this.data.options = [];
    }
  }
  static from(data: SubCommandGroupOptionEntity): SubCommandGroupBuilder {
    return new SubCommandGroupBuilder(data);
  }
  addSubcommand(
    subcommand: SubCommandOptionEntity | ((builder: SubCommandBuilder) => SubCommandBuilder),
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    if (typeof subcommand === "function") {
      const builder = new SubCommandBuilder();
      const result = subcommand(builder);
      this.data.options.push(result.build());
    } else {
      this.data.options.push(subcommand);
    }
    return this;
  }
}
