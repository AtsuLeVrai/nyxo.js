import type { ApplicationIntegrationType } from "../application/index.js";
import { ApplicationCommandType } from "./application-command.entity.js";
import type {
  GlobalCommandCreateOptions,
  GuildCommandCreateOptions,
} from "./application-command.router.js";
import {
  AttachmentOptionBuilder,
  BooleanOptionBuilder,
  ChannelOptionBuilder,
  IntegerOptionBuilder,
  MentionableOptionBuilder,
  NumberOptionBuilder,
  RoleOptionBuilder,
  StringOptionBuilder,
  SubCommandBuilder,
  SubCommandGroupBuilder,
  UserOptionBuilder,
} from "./application-command-option.builder.js";

export abstract class BaseCommandBuilder<
  T extends GlobalCommandCreateOptions | GuildCommandCreateOptions,
> {
  protected readonly data: Partial<T>;
  protected readonly type: ApplicationCommandType;
  protected constructor(type: ApplicationCommandType, data?: T) {
    this.type = type;
    if (data) {
      this.data = {
        type,
        ...data,
      } as Partial<T>;
    } else {
      this.data = {
        type,
      } as Partial<T>;
    }
  }
  setName(name: string): this {
    this.data.name = this.type === ApplicationCommandType.ChatInput ? name.toLowerCase() : name;
    return this;
  }
  setNameLocalizations(localizations: Record<string, string> | null): this {
    this.data.name_localizations = localizations;
    return this;
  }
  setNsfw(nsfw = true): this {
    this.data.nsfw = nsfw;
    return this;
  }
  setDefaultMemberPermissions(permissions: string | null): this {
    this.data.default_member_permissions = permissions;
    return this;
  }
  setDmPermission(enabled: boolean | null): this {
    this.data.dm_permission = enabled;
    return this;
  }
  setDefaultPermission(enabled: boolean | null): this {
    this.data.default_permission = enabled;
    return this;
  }
  build(): T {
    return this.data as T;
  }
  toJson(): Readonly<T> {
    return Object.freeze({ ...this.data }) as T;
  }
}

export class GlobalCommandBuilder extends BaseCommandBuilder<GlobalCommandCreateOptions> {
  constructor(
    type: ApplicationCommandType = ApplicationCommandType.ChatInput,
    data?: GlobalCommandCreateOptions,
  ) {
    super(type, data);
    if (data?.description !== undefined) {
      this.data.description = data.description;
    } else {
      this.data.description = type === ApplicationCommandType.ChatInput ? "" : "";
    }
    if (data?.options) {
      this.data.options = [...data.options];
    }
  }
  static from(data: GlobalCommandCreateOptions): GlobalCommandBuilder {
    return new GlobalCommandBuilder(data.type, data);
  }
  setIntegrationTypes(...types: ApplicationIntegrationType[]): this {
    this.data.integration_types = types;
    return this;
  }
  setContexts(...contexts: number[]): this {
    this.data.contexts = contexts;
    return this;
  }
  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }
  setDescriptionLocalizations(localizations: Record<string, string> | null): this {
    this.data.description_localizations = localizations;
    return this;
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
  addSubcommand(subcommandBuilder: (builder: SubCommandBuilder) => SubCommandBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new SubCommandBuilder();
    const result = subcommandBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addSubcommandGroup(
    groupBuilder: (builder: SubCommandGroupBuilder) => SubCommandGroupBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new SubCommandGroupBuilder();
    const result = groupBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
}

export class GuildCommandBuilder extends BaseCommandBuilder<GuildCommandCreateOptions> {
  constructor(
    type: ApplicationCommandType = ApplicationCommandType.ChatInput,
    data?: GuildCommandCreateOptions,
  ) {
    super(type, data);
    if (data?.description !== undefined) {
      this.data.description = data.description;
    } else {
      this.data.description = type === ApplicationCommandType.ChatInput ? "" : "";
    }
    if (data?.options) {
      this.data.options = [...data.options];
    }
  }
  static from(data: GuildCommandCreateOptions): GuildCommandBuilder {
    return new GuildCommandBuilder(data.type, data);
  }
  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }
  setDescriptionLocalizations(localizations: Record<string, string> | null): this {
    this.data.description_localizations = localizations;
    return this;
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
  addSubcommand(subcommandBuilder: (builder: SubCommandBuilder) => SubCommandBuilder): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new SubCommandBuilder();
    const result = subcommandBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
  addSubcommandGroup(
    groupBuilder: (builder: SubCommandGroupBuilder) => SubCommandGroupBuilder,
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }
    const builder = new SubCommandGroupBuilder();
    const result = groupBuilder(builder);
    this.data.options.push(result.build());
    return this;
  }
}
