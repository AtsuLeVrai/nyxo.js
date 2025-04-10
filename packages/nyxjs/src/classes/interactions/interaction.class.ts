import {
  type AnyChannelEntity,
  type AnyInteractionEntity,
  type GuildMemberEntity,
  type InteractionCallbackMessagesEntity,
  type InteractionCallbackModalEntity,
  type InteractionCallbackResponseEntity,
  InteractionCallbackType,
  InteractionContextType,
  type InteractionResponseEntity,
  InteractionType,
  type Locale,
  MessageFlags,
  type Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import { ChannelFactory } from "../../factories/index.js";
import type { GuildBased } from "../../types/index.js";
import type { AnyChannel } from "../channels/index.js";
import { GuildMember } from "../guilds/index.js";
import { User } from "../users/index.js";
import type { AutocompleteInteraction } from "./autocomplete-interaction.class.js";
import type { CommandInteraction } from "./command-interaction.class.js";
import type { ComponentInteraction } from "./component-interaction.class.js";
import type { GuildInteraction } from "./guild-interaction.class.js";
import type { ModalSubmitInteraction } from "./modal-submit-interaction.class.js";
import type { PrivateInteraction } from "./private-interaction.class.js";

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
      return User.from(this.client, this.data.member.user);
    }

    if (!this.data.user) {
      return undefined;
    }

    return User.from(this.client, this.data.user);
  }

  get member(): GuildMember | undefined {
    if (this.isGuildInteraction()) {
      return GuildMember.from(
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
    return this.client.rest.interactions.createInteractionResponse(
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

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
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
