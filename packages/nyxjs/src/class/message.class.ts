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
    entity: Partial<z.input<typeof MessageCreateEntity>> = {},
  ) {
    super(
      client,
      MessageCreateEntity as z.ZodSchema,
      entity as MessageCreateEntity,
    );
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get channelId(): Snowflake {
    return this.entity.channel_id;
  }

  get author(): User | null {
    return this.entity.author
      ? new User(this.client, this.entity.author)
      : null;
  }

  get content(): string {
    return this.entity.content;
  }

  get timestamp(): string {
    return this.entity.timestamp;
  }

  get editedTimestamp(): string | null {
    return this.entity.edited_timestamp ?? null;
  }

  get tts(): boolean {
    return Boolean(this.entity.tts);
  }

  get mentionEveryone(): boolean {
    return Boolean(this.entity.mention_everyone);
  }

  get mentionRoles(): Snowflake[] {
    return Array.isArray(this.entity.mention_roles)
      ? [...this.entity.mention_roles]
      : [];
  }

  get attachments(): Attachment[] {
    return Array.isArray(this.entity.attachments)
      ? this.entity.attachments.map(
          (attachment) => new Attachment(this.client, attachment),
        )
      : [];
  }

  get embeds(): Embed[] {
    return Array.isArray(this.entity.embeds)
      ? this.entity.embeds.map((embed) => new Embed(this.client, embed))
      : [];
  }

  get pinned(): boolean {
    return Boolean(this.entity.pinned);
  }

  get type(): MessageType {
    return this.entity.type;
  }

  get mentionChannels(): ChannelMention[] | null {
    return this.entity.mention_channels
      ? this.entity.mention_channels.map(
          (mention) => new ChannelMention(this.client, mention),
        )
      : null;
  }

  get reactions(): Reaction[] | null {
    return this.entity.reactions
      ? this.entity.reactions.map(
          (reaction) => new Reaction(this.client, reaction),
        )
      : null;
  }

  get nonce(): string | number | null {
    return this.entity.nonce ?? null;
  }

  get webhookId(): Snowflake | null {
    return this.entity.webhook_id ?? null;
  }

  get activity(): MessageActivityEntity | null {
    return this.entity.activity ?? null;
  }

  get application(): Application | null {
    return this.entity.application
      ? new Application(this.client, this.entity.application)
      : null;
  }

  get applicationId(): Snowflake | null {
    return this.entity.application_id ?? null;
  }

  get flags(): BitFieldManager<MessageFlags> {
    return this.#flags;
  }

  get components(): ActionRow[] | null {
    return this.entity.components
      ? this.entity.components.map(
          (component) => new ActionRow(this.client, component),
        )
      : null;
  }

  get stickerItems(): StickerItem[] | null {
    return this.entity.sticker_items
      ? this.entity.sticker_items.map(
          (stickerItem) => new StickerItem(this.client, stickerItem),
        )
      : null;
  }

  get stickers(): Sticker[] | null {
    return this.entity.stickers
      ? this.entity.stickers.map((sticker) => new Sticker(this.client, sticker))
      : null;
  }

  get position(): number | null {
    return this.entity.position ?? null;
  }

  get roleSubscriptionData(): RoleSubscriptionDataEntity | null {
    return this.entity.role_subscription_data ?? null;
  }

  get poll(): Poll | null {
    return this.entity.poll ? new Poll(this.client, this.entity.poll) : null;
  }

  get call(): MessageCallEntity | null {
    return this.entity.call ?? null;
  }

  get messageReference(): MessageReferenceEntity | null {
    return this.entity.message_reference ?? null;
  }

  get interactionMetadata():
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity
    | null {
    return this.entity.interaction_metadata ?? null;
  }

  get thread(): AnyThreadChannel | null {
    return this.entity.thread
      ? resolveThreadChannel(this.client, this.entity.thread)
      : null;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get member(): GuildMember | null {
    return this.entity.member
      ? new GuildMember(this.client, this.entity.member)
      : null;
  }

  get mentions(): (UserEntity | Partial<GuildMemberEntity>)[] | null {
    return this.entity.mentions ?? null;
  }

  toJson(): MessageCreateEntity {
    return { ...this.entity };
  }
}

export const MessageSchema = z.instanceof(Message);
