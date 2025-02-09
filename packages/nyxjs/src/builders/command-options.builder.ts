import {
  type ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  AttachmentOptionEntity,
  type AvailableLocale,
  type BaseApplicationCommandOptionEntity,
  BooleanOptionEntity,
  ChannelOptionEntity,
  type ChannelType,
  IntegerOptionEntity,
  MentionableOptionEntity,
  NumberOptionEntity,
  RoleOptionEntity,
  type SimpleApplicationCommandOptionEntity,
  StringOptionEntity,
  SubCommandGroupOptionEntity,
  SubCommandOptionEntity,
  UserOptionEntity,
} from "@nyxjs/core";
import { z } from "zod";

export abstract class BaseCommandOptionBuilder<
  T extends z.input<typeof BaseApplicationCommandOptionEntity> = z.input<
    typeof BaseApplicationCommandOptionEntity
  >,
> {
  protected data: Partial<T>;

  protected constructor(data: Partial<T> = {}) {
    this.data = {
      ...data,
    };
  }

  setName(name: string): this {
    this.data.name = name;
    return this;
  }

  setNameLocalizations(localizations: z.input<typeof AvailableLocale>): this {
    this.data.name_localizations = localizations;
    return this;
  }

  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  setDescriptionLocalizations(
    localizations: z.input<typeof AvailableLocale>,
  ): this {
    this.data.description_localizations = localizations;
    return this;
  }

  abstract toJson(): T;
}

export interface RequiredOption {
  setRequired(required?: boolean): this;
}

export interface ChoicesOption {
  setChoices(
    ...choices: z.input<typeof ApplicationCommandOptionChoiceEntity>[]
  ): this;
  addChoice(choice: z.input<typeof ApplicationCommandOptionChoiceEntity>): this;
}

export interface AutocompleteOption {
  setAutocomplete(autocomplete?: boolean): this;
}

export class StringOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof StringOptionEntity>>
  implements RequiredOption, ChoicesOption, AutocompleteOption
{
  constructor(data: Partial<z.input<typeof StringOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.String,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
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

  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }

  addChoice(
    choice: z.input<typeof ApplicationCommandOptionChoiceEntity>,
  ): this {
    this.data.choices = [...(this.data.choices || []), choice];
    return this;
  }

  setChoices(
    ...choices: z.input<typeof ApplicationCommandOptionChoiceEntity>[]
  ): this {
    this.data.choices = choices;
    return this;
  }

  toJson(): StringOptionEntity {
    return StringOptionEntity.parse(this.data);
  }
}

export const StringOptionBuilderSchema = z.instanceof(StringOptionBuilder);

export class NumberOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof NumberOptionEntity>>
  implements RequiredOption, ChoicesOption, AutocompleteOption
{
  constructor(data: Partial<z.input<typeof NumberOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.Number,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  setMinValue(value: number): this {
    this.data.min_value = value;
    return this;
  }

  setMaxValue(value: number): this {
    this.data.max_value = value;
    return this;
  }

  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }

  addChoice(
    choice: z.input<typeof ApplicationCommandOptionChoiceEntity>,
  ): this {
    this.data.choices = [...(this.data.choices || []), choice];
    return this;
  }

  setChoices(
    ...choices: z.input<typeof ApplicationCommandOptionChoiceEntity>[]
  ): this {
    this.data.choices = choices;
    return this;
  }

  toJson(): NumberOptionEntity {
    return NumberOptionEntity.parse(this.data);
  }
}

export const NumberOptionBuilderSchema = z.instanceof(NumberOptionBuilder);

export class IntegerOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof IntegerOptionEntity>>
  implements RequiredOption, ChoicesOption, AutocompleteOption
{
  constructor(data: Partial<z.input<typeof IntegerOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.Integer,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  setMinValue(value: number): this {
    this.data.min_value = value;
    return this;
  }

  setMaxValue(value: number): this {
    this.data.max_value = value;
    return this;
  }

  setAutocomplete(autocomplete = true): this {
    this.data.autocomplete = autocomplete;
    return this;
  }

  addChoice(
    choice: z.input<typeof ApplicationCommandOptionChoiceEntity>,
  ): this {
    this.data.choices = [...(this.data.choices || []), choice];
    return this;
  }

  setChoices(
    ...choices: z.input<typeof ApplicationCommandOptionChoiceEntity>[]
  ): this {
    this.data.choices = choices;
    return this;
  }

  toJson(): IntegerOptionEntity {
    return IntegerOptionEntity.parse(this.data);
  }
}

export const IntegerOptionBuilderSchema = z.instanceof(IntegerOptionBuilder);

export class BooleanOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof BooleanOptionEntity>>
  implements RequiredOption
{
  constructor(data: Partial<z.input<typeof BooleanOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.Boolean,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  toJson(): BooleanOptionEntity {
    return BooleanOptionEntity.parse(this.data);
  }
}

export const BooleanOptionBuilderSchema = z.instanceof(BooleanOptionBuilder);

export class UserOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof UserOptionEntity>>
  implements RequiredOption
{
  constructor(data: Partial<z.input<typeof UserOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.User,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  toJson(): UserOptionEntity {
    return UserOptionEntity.parse(this.data);
  }
}

export const UserOptionBuilderSchema = z.instanceof(UserOptionBuilder);

export class ChannelOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof ChannelOptionEntity>>
  implements RequiredOption
{
  constructor(data: Partial<z.input<typeof ChannelOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.Channel,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  setChannelTypes(...types: ChannelType[]): this {
    this.data.channel_types = types;
    return this;
  }

  toJson(): ChannelOptionEntity {
    return ChannelOptionEntity.parse(this.data);
  }
}

export const ChannelOptionBuilderSchema = z.instanceof(ChannelOptionBuilder);

export class RoleOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof RoleOptionEntity>>
  implements RequiredOption
{
  constructor(data: Partial<z.input<typeof RoleOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.Role,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  toJson(): RoleOptionEntity {
    return RoleOptionEntity.parse(this.data);
  }
}

export const RoleOptionBuilderSchema = z.instanceof(RoleOptionBuilder);

export class MentionableOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof MentionableOptionEntity>>
  implements RequiredOption
{
  constructor(data: Partial<z.input<typeof MentionableOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.Mentionable,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  toJson(): MentionableOptionEntity {
    return MentionableOptionEntity.parse(this.data);
  }
}

export const MentionableOptionBuilderSchema = z.instanceof(
  MentionableOptionBuilder,
);

export class AttachmentOptionBuilder
  extends BaseCommandOptionBuilder<z.input<typeof AttachmentOptionEntity>>
  implements RequiredOption
{
  constructor(data: Partial<z.input<typeof AttachmentOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.Attachment,
      ...data,
    });
  }

  setRequired(required = true): this {
    this.data.required = required;
    return this;
  }

  toJson(): AttachmentOptionEntity {
    return AttachmentOptionEntity.parse(this.data);
  }
}

export const AttachmentOptionBuilderSchema = z.instanceof(
  AttachmentOptionBuilder,
);

export class SubCommandOptionBuilder extends BaseCommandOptionBuilder<
  z.input<typeof SubCommandOptionEntity>
> {
  constructor(data: Partial<z.input<typeof SubCommandOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.SubCommand,
      ...data,
    });
  }

  addOption(
    option: BaseCommandOptionBuilder<
      z.input<typeof SimpleApplicationCommandOptionEntity>
    >,
  ): this {
    this.data.options = [...(this.data.options || []), option.toJson()];
    return this;
  }

  addOptions(
    ...options: BaseCommandOptionBuilder<
      z.input<typeof SimpleApplicationCommandOptionEntity>
    >[]
  ): this {
    this.data.options = [
      ...(this.data.options || []),
      ...options.map((o) => o.toJson()),
    ];
    return this;
  }

  toJson(): SubCommandOptionEntity {
    return SubCommandOptionEntity.parse(this.data);
  }
}

export const SubCommandOptionBuilderSchema = z.instanceof(
  SubCommandOptionBuilder,
);

export class SubCommandGroupOptionBuilder extends BaseCommandOptionBuilder<
  z.input<typeof SubCommandGroupOptionEntity>
> {
  constructor(data: Partial<z.input<typeof SubCommandGroupOptionEntity>> = {}) {
    super({
      type: ApplicationCommandOptionType.SubCommandGroup,
      ...data,
    });
  }

  addSubcommand(subcommand: SubCommandOptionBuilder): this {
    this.data.options = [...(this.data.options || []), subcommand.toJson()];
    return this;
  }

  addSubcommands(...subcommands: SubCommandOptionBuilder[]): this {
    this.data.options = [
      ...(this.data.options || []),
      ...subcommands.map((s) => s.toJson()),
    ];
    return this;
  }

  setSubcommands(...subcommands: SubCommandOptionBuilder[]): this {
    this.data.options = subcommands.map((s) => s.toJson());
    return this;
  }

  toJson(): SubCommandGroupOptionEntity {
    return SubCommandGroupOptionEntity.parse(this.data);
  }
}

export const SubCommandGroupOptionBuilderSchema = z.instanceof(
  SubCommandGroupOptionBuilder,
);

export type AnyOptionBuilder =
  | StringOptionBuilder
  | NumberOptionBuilder
  | IntegerOptionBuilder
  | BooleanOptionBuilder
  | UserOptionBuilder
  | ChannelOptionBuilder
  | RoleOptionBuilder
  | MentionableOptionBuilder
  | AttachmentOptionBuilder
  | SubCommandOptionBuilder
  | SubCommandGroupOptionBuilder;

export type SimpleOptionBuilder =
  | StringOptionBuilder
  | NumberOptionBuilder
  | IntegerOptionBuilder
  | BooleanOptionBuilder
  | UserOptionBuilder
  | ChannelOptionBuilder
  | RoleOptionBuilder
  | MentionableOptionBuilder
  | AttachmentOptionBuilder;

export const isSubCommandBuilder = (
  builder: AnyOptionBuilder,
): builder is SubCommandOptionBuilder => {
  return builder instanceof SubCommandOptionBuilder;
};

export const isSubCommandGroupBuilder = (
  builder: AnyOptionBuilder,
): builder is SubCommandGroupOptionBuilder => {
  return builder instanceof SubCommandGroupOptionBuilder;
};

export const isChoiceBuilder = (
  builder: AnyOptionBuilder,
): builder is
  | StringOptionBuilder
  | NumberOptionBuilder
  | IntegerOptionBuilder => {
  return (
    builder instanceof StringOptionBuilder ||
    builder instanceof NumberOptionBuilder ||
    builder instanceof IntegerOptionBuilder
  );
};

export const isAutocompleteBuilder = (
  builder: AnyOptionBuilder,
): builder is
  | StringOptionBuilder
  | NumberOptionBuilder
  | IntegerOptionBuilder => {
  return isChoiceBuilder(builder);
};
