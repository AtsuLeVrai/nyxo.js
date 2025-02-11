import {
  type ApplicationCommandInteractionMetadataEntity,
  BitFieldManager,
  type GuildMemberEntity,
  type MessageActivityEntity,
  type MessageCallEntity,
  type MessageComponentInteractionMetadataEntity,
  type MessageFlags,
  type MessageReferenceEntity,
  type MessageType,
  type ModalSubmitInteractionMetadataEntity,
  type RoleSubscriptionDataEntity,
  type Snowflake,
  type UserEntity,
} from "@nyxjs/core";
import { MessageCreateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { type AnyThreadChannel, resolveThreadChannel } from "../utils/index.js";
import { ActionRow } from "./action-row.class.js";
import { Application } from "./application.class.js";
import { Attachment } from "./attachment.class.js";
import { ChannelMention } from "./channel-mention.class.js";
import { Embed } from "./embed.class.js";
import { GuildMember } from "./guild-member.class.js";
import { Poll } from "./poll.class.js";
import { Reaction } from "./reaction.class.js";
import { StickerItem } from "./sticker-item.class.js";
import { Sticker } from "./sticker.class.js";
import { User } from "./user.class.js";

export class Message extends BaseClass<MessageCreateEntity> {
  readonly #flags: BitFieldManager<MessageFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof MessageCreateEntity>> = {},
  ) {
    super(
      client,
      MessageCreateEntity as z.ZodSchema,
      data as MessageCreateEntity,
    );
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get author(): User | null {
    return this.data.author ? new User(this.client, this.data.author) : null;
  }

  get content(): string {
    return this.data.content;
  }

  get timestamp(): string {
    return this.data.timestamp;
  }

  get editedTimestamp(): string | null {
    return this.data.edited_timestamp ?? null;
  }

  get tts(): boolean {
    return Boolean(this.data.tts);
  }

  get mentionEveryone(): boolean {
    return Boolean(this.data.mention_everyone);
  }

  get mentionRoles(): Snowflake[] {
    return Array.isArray(this.data.mention_roles)
      ? [...this.data.mention_roles]
      : [];
  }

  get attachments(): Attachment[] {
    return Array.isArray(this.data.attachments)
      ? this.data.attachments.map(
          (attachment) => new Attachment(this.client, attachment),
        )
      : [];
  }

  get embeds(): Embed[] {
    return Array.isArray(this.data.embeds)
      ? this.data.embeds.map((embed) => new Embed(this.client, embed))
      : [];
  }

  get pinned(): boolean {
    return Boolean(this.data.pinned);
  }

  get type(): MessageType {
    return this.data.type;
  }

  get mentionChannels(): ChannelMention[] | null {
    return this.data.mention_channels
      ? this.data.mention_channels.map(
          (mention) => new ChannelMention(this.client, mention),
        )
      : null;
  }

  get reactions(): Reaction[] | null {
    return this.data.reactions
      ? this.data.reactions.map(
          (reaction) => new Reaction(this.client, reaction),
        )
      : null;
  }

  get nonce(): string | number | null {
    return this.data.nonce ?? null;
  }

  get webhookId(): Snowflake | null {
    return this.data.webhook_id ?? null;
  }

  get activity(): MessageActivityEntity | null {
    return this.data.activity ?? null;
  }

  get application(): Application | null {
    return this.data.application
      ? new Application(this.client, this.data.application)
      : null;
  }

  get applicationId(): Snowflake | null {
    return this.data.application_id ?? null;
  }

  get flags(): BitFieldManager<MessageFlags> {
    return this.#flags;
  }

  get components(): ActionRow[] | null {
    return this.data.components
      ? this.data.components.map(
          (component) => new ActionRow(this.client, component),
        )
      : null;
  }

  get stickerItems(): StickerItem[] | null {
    return this.data.sticker_items
      ? this.data.sticker_items.map(
          (stickerItem) => new StickerItem(this.client, stickerItem),
        )
      : null;
  }

  get stickers(): Sticker[] | null {
    return this.data.stickers
      ? this.data.stickers.map((sticker) => new Sticker(this.client, sticker))
      : null;
  }

  get position(): number | null {
    return this.data.position ?? null;
  }

  get roleSubscriptionData(): RoleSubscriptionDataEntity | null {
    return this.data.role_subscription_data ?? null;
  }

  get poll(): Poll | null {
    return this.data.poll ? new Poll(this.client, this.data.poll) : null;
  }

  get call(): MessageCallEntity | null {
    return this.data.call ?? null;
  }

  get messageReference(): MessageReferenceEntity | null {
    return this.data.message_reference ?? null;
  }

  get interactionMetadata():
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity
    | null {
    return this.data.interaction_metadata ?? null;
  }

  get thread(): AnyThreadChannel | null {
    return this.data.thread
      ? resolveThreadChannel(this.client, this.data.thread)
      : null;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get member(): GuildMember | null {
    return this.data.member
      ? new GuildMember(this.client, this.data.member)
      : null;
  }

  get mentions(): (UserEntity | Partial<GuildMemberEntity>)[] | null {
    return this.data.mentions ?? null;
  }

  toJson(): MessageCreateEntity {
    return { ...this.data };
  }
}

export const MessageSchema = z.instanceof(Message);
