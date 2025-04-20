import {
  type ActionRowEntity,
  type AnyChannelEntity,
  type AnyInteractionCommandOptionEntity,
  type AnyInteractionEntity,
  type AnySimpleApplicationCommandOptionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type BotDmInteractionEntity,
  ComponentType,
  type GuildInteractionEntity,
  type GuildMemberEntity,
  type InteractionCallbackAutocompleteEntity,
  type InteractionCallbackMessagesEntity,
  type InteractionCallbackModalEntity,
  type InteractionCallbackResponseEntity,
  InteractionCallbackType,
  InteractionContextType,
  type InteractionResponseEntity,
  InteractionType,
  type Locale,
  type MessageComponentInteractionDataEntity,
  MessageFlags,
  type ModalSubmitInteractionDataEntity,
  type PrivateChannelInteractionEntity,
  type RoleEntity,
  type SelectMenuOptionEntity,
  type Snowflake,
  type SubCommandGroupOptionEntity,
  type SubCommandOptionEntity,
  type UserEntity,
} from "@nyxojs/core";
import type { MessageCreateEntity } from "@nyxojs/gateway";
import { BaseClass } from "../bases/index.js";
import { ChannelFactory } from "../factories/index.js";
import type { GuildBased } from "../types/index.js";
import type { AnyChannel } from "./channel.class.js";
import { GuildMember } from "./guild.class.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";

export abstract class Interaction<
  T extends AnyInteractionEntity,
> extends BaseClass<T> {
  get id(): Snowflake {
    return this.data.id;
  }

  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  get type(): InteractionType {
    return this.data.type;
  }

  get interactionData(): T["data"] {
    return this.data.data;
  }

  get context(): InteractionContextType {
    return this.data.context;
  }

  get token(): string {
    return this.data.token;
  }

  get channelId(): Snowflake | undefined {
    return this.data.channel_id;
  }

  get channel(): AnyChannel | undefined {
    if (!this.data.channel) {
      return undefined;
    }

    return ChannelFactory.create(
      this.client,
      this.data.channel as AnyChannelEntity,
    );
  }

  get appPermissions(): string {
    return this.data.app_permissions;
  }

  get locale(): Locale | undefined {
    return this.data.locale;
  }

  get guildId(): Snowflake | undefined {
    if (this.isGuildInteraction()) {
      return this.data.guild_id;
    }
    return undefined;
  }

  get user(): User | undefined {
    if (this.isGuildInteraction()) {
      return new User(this.client, this.data.member.user);
    }

    if (!this.data.user) {
      return undefined;
    }

    return new User(this.client, this.data.user);
  }

  get member(): GuildMember | undefined {
    if (this.isGuildInteraction()) {
      return new GuildMember(
        this.client,
        this.data.member as GuildBased<GuildMemberEntity>,
      );
    }

    return undefined;
  }

  isGuildInteraction(
    this: Interaction<AnyInteractionEntity>,
  ): this is GuildInteraction {
    return this.context === InteractionContextType.Guild;
  }

  isPrivateInteraction(
    this: Interaction<AnyInteractionEntity>,
  ): this is PrivateInteraction {
    return (
      this.context === InteractionContextType.BotDm ||
      this.context === InteractionContextType.PrivateChannel
    );
  }

  isCommand(
    this: Interaction<AnyInteractionEntity>,
  ): this is CommandInteraction {
    return this.type === InteractionType.ApplicationCommand;
  }

  isComponent(
    this: Interaction<AnyInteractionEntity>,
  ): this is ComponentInteraction {
    return this.type === InteractionType.MessageComponent;
  }

  isAutocomplete(
    this: Interaction<AnyInteractionEntity>,
  ): this is AutocompleteInteraction {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  isModalSubmit(
    this: Interaction<AnyInteractionEntity>,
  ): this is ModalSubmitInteraction {
    return this.type === InteractionType.ModalSubmit;
  }

  createResponse(
    options: InteractionResponseEntity,
    withResponse = false,
  ): Promise<InteractionCallbackResponseEntity | undefined> {
    return this.client.rest.interactions.createResponse(
      this.id,
      this.token,
      options,
      withResponse,
    );
  }

  async showModal(options: InteractionCallbackModalEntity): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.Modal,
      data: options,
    });
  }

  async reply(
    options: string | Partial<InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string" ? { content: options } : options;

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  async replyEphemeral(
    options: string | Partial<Omit<InteractionCallbackMessagesEntity, "flags">>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string"
        ? { content: options, flags: MessageFlags.Ephemeral }
        : { ...options, flags: MessageFlags.Ephemeral };

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  async deferReply(ephemeral = false): Promise<void> {
    const flags = ephemeral ? MessageFlags.Ephemeral : undefined;

    await this.createResponse({
      type: InteractionCallbackType.DeferredChannelMessageWithSource,
      data: flags ? { flags } : undefined,
    });
  }
}

// TODO: Add EnforceCamelCase implementation
export class AutocompleteInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  },
> extends Interaction<T> {
  get commandData(): ApplicationCommandInteractionDataEntity {
    return this.interactionData as ApplicationCommandInteractionDataEntity;
  }

  get name(): string {
    return this.commandData.name;
  }

  get commandId(): Snowflake {
    return this.commandData.id;
  }

  get options(): AnyInteractionCommandOptionEntity[] | undefined {
    return this.commandData.options;
  }

  getFocusedOption(): AnySimpleApplicationCommandOptionEntity | undefined {
    if (!this.options) {
      return undefined;
    }

    const focusedOption = this.options.find(
      (option) => "focused" in option && option.focused,
    ) as AnySimpleApplicationCommandOptionEntity | undefined;

    if (focusedOption) {
      return focusedOption;
    }

    for (const option of this.options) {
      if (
        option.type === ApplicationCommandOptionType.SubCommand &&
        option.options
      ) {
        const subFocused = option.options.find(
          (subOpt) => "focused" in subOpt && subOpt.focused,
        ) as AnySimpleApplicationCommandOptionEntity | undefined;
        if (subFocused) {
          return subFocused;
        }
      }

      if (
        option.type === ApplicationCommandOptionType.SubCommandGroup &&
        option.options
      ) {
        for (const subCmd of option.options) {
          if (subCmd.options) {
            const subGroupFocused = subCmd.options.find(
              (subOpt) => "focused" in subOpt && subOpt.focused,
            ) as AnySimpleApplicationCommandOptionEntity | undefined;
            if (subGroupFocused) {
              return subGroupFocused;
            }
          }
        }
      }
    }

    return undefined;
  }

  async autocomplete(
    choices: InteractionCallbackAutocompleteEntity["choices"],
  ): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.ApplicationCommandAutocompleteResult,
      data: { choices },
    });
  }
}

// TODO: Add EnforceCamelCase implementation
export class CommandInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  },
> extends Interaction<T> {
  get commandData(): ApplicationCommandInteractionDataEntity {
    return this.interactionData as ApplicationCommandInteractionDataEntity;
  }

  get name(): string {
    return this.commandData.name;
  }

  get commandId(): Snowflake {
    return this.commandData.id;
  }

  get commandType(): ApplicationCommandType {
    return this.commandData.type;
  }

  get options(): AnyInteractionCommandOptionEntity[] | undefined {
    return this.commandData.options;
  }

  isSlashCommand(this: CommandInteraction): this is CommandInteraction {
    return this.commandType === ApplicationCommandType.ChatInput;
  }

  isUserCommand(this: CommandInteraction): this is CommandInteraction {
    return this.commandType === ApplicationCommandType.User;
  }

  isMessageCommand(this: CommandInteraction): this is CommandInteraction {
    return this.commandType === ApplicationCommandType.Message;
  }

  getOption<V = string | number | boolean>(name: string): V | undefined {
    if (!this.options) {
      return undefined;
    }

    const option = this.options.find((opt) => opt.name === name);
    if (option && "value" in option) {
      return option.value as V;
    }

    for (const opt of this.options) {
      if (opt.type === ApplicationCommandOptionType.SubCommand && opt.options) {
        const subOption = opt.options.find((subOpt) => subOpt.name === name);
        if (subOption && "value" in subOption) {
          return subOption.value as V;
        }
      }

      if (
        opt.type === ApplicationCommandOptionType.SubCommandGroup &&
        opt.options
      ) {
        for (const subCmd of opt.options) {
          if (subCmd.options) {
            const subGroupOption = subCmd.options.find(
              (subOpt) => subOpt.name === name,
            );
            if (subGroupOption && "value" in subGroupOption) {
              return subGroupOption.value as V;
            }
          }
        }
      }
    }

    return undefined;
  }

  getSubcommand(): string | undefined {
    if (!(this.isSlashCommand() && this.options)) {
      return undefined;
    }

    const subcommand = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommand,
    ) as SubCommandOptionEntity | undefined;

    if (subcommand) {
      return subcommand.name;
    }

    const group = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommandGroup,
    ) as SubCommandGroupOptionEntity | undefined;

    if (group && group.options.length > 0) {
      return group.options[0]?.name;
    }

    return undefined;
  }

  getSubcommandGroup(): string | undefined {
    if (!(this.isSlashCommand() && this.options)) {
      return undefined;
    }

    const group = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommandGroup,
    ) as SubCommandGroupOptionEntity | undefined;

    if (group) {
      return group.name;
    }

    return undefined;
  }

  getTargetUser(): User | undefined {
    if (!(this.isUserCommand() && this.commandData.target_id)) {
      return undefined;
    }

    const targetId = this.commandData.target_id;
    if (this.commandData.resolved?.users?.[targetId]) {
      return new User(
        this.client,
        this.commandData.resolved.users[targetId] as UserEntity,
      );
    }

    return undefined;
  }

  getTargetMessage(): Message | undefined {
    if (!(this.isMessageCommand() && this.commandData.target_id)) {
      return undefined;
    }

    const targetId = this.commandData.target_id;
    if (this.commandData.resolved?.messages?.[targetId]) {
      return new Message(
        this.client,
        this.commandData.resolved.messages[targetId] as MessageCreateEntity,
      );
    }
    return undefined;
  }
}

// TODO: Add EnforceCamelCase implementation
export class ComponentInteraction<
  T extends AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity;
  },
> extends Interaction<T> {
  get componentData(): MessageComponentInteractionDataEntity {
    return this.interactionData as MessageComponentInteractionDataEntity;
  }

  get customId(): string {
    return this.componentData.custom_id;
  }

  get componentType(): ComponentType {
    return this.componentData.component_type;
  }

  get message(): Message {
    return new Message(this.client, this.data.message as MessageCreateEntity);
  }

  get values(): SelectMenuOptionEntity[] {
    return this.componentData.values || [];
  }

  isButton(): boolean {
    return this.componentType === ComponentType.Button;
  }

  isSelectMenu(): boolean {
    const type = this.componentType;
    return (
      type === ComponentType.StringSelect ||
      type === ComponentType.UserSelect ||
      type === ComponentType.RoleSelect ||
      type === ComponentType.MentionableSelect ||
      type === ComponentType.ChannelSelect
    );
  }

  getResolvedUsers(): Record<Snowflake, User> | undefined {
    if (!this.componentData.resolved?.users) {
      return undefined;
    }

    const users: Record<Snowflake, User> = {};
    for (const [id, userData] of Object.entries(
      this.componentData.resolved.users,
    )) {
      users[id] = new User(this.client, userData as UserEntity);
    }
    return users;
  }

  getResolvedRoles(): Record<Snowflake, RoleEntity> | undefined {
    return this.componentData.resolved?.roles;
  }

  getResolvedChannels():
    | Record<Snowflake, Partial<AnyChannelEntity>>
    | undefined {
    return this.componentData.resolved?.channels;
  }

  async deferUpdate(): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.DeferredUpdateMessage,
    });
  }

  async updateMessage(
    options: string | Partial<InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string" ? { content: options } : options;

    await this.createResponse({
      type: InteractionCallbackType.UpdateMessage,
      data: messageData,
    });
  }
}

// TODO: Add EnforceCamelCase implementation
export class GuildInteraction<
  T extends GuildInteractionEntity = GuildInteractionEntity,
> extends Interaction<T> {
  override get guildId(): Snowflake {
    return this.data.guild_id;
  }

  override get member(): GuildMember {
    return new GuildMember(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  get guildLocale(): Locale | undefined {
    return this.data.guild_locale;
  }
}

export class ModalSubmitInteraction<
  T extends AnyInteractionEntity & {
    data: ModalSubmitInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: ModalSubmitInteractionDataEntity;
  },
> extends Interaction<T> {
  get modalData(): ModalSubmitInteractionDataEntity {
    return this.interactionData as ModalSubmitInteractionDataEntity;
  }

  get customId(): string {
    return this.modalData.custom_id;
  }

  get components(): ActionRowEntity[] {
    return this.modalData.components;
  }

  getField(customId: string): string | undefined {
    if (!this.components) {
      return undefined;
    }

    for (const row of this.components) {
      for (const component of row.components) {
        if (component.custom_id === customId && "value" in component) {
          return component.value;
        }
      }
    }

    return undefined;
  }
}

// TODO: Add EnforceCamelCase implementation
export class PrivateInteraction<
  T extends BotDmInteractionEntity | PrivateChannelInteractionEntity =
    | BotDmInteractionEntity
    | PrivateChannelInteractionEntity,
> extends Interaction<T> {
  override get user(): User {
    return new User(this.client, this.data.user);
  }
}

/**
 * Union type of all possible interaction types
 */
export type AnyInteraction =
  | GuildInteraction
  | PrivateInteraction
  | CommandInteraction
  | ComponentInteraction
  | AutocompleteInteraction
  | ModalSubmitInteraction;
