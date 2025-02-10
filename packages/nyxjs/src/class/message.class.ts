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
import { fromError } from "zod-validation-error";
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

export class Message {
  readonly #data: MessageCreateEntity;
  readonly #flags: BitFieldManager<MessageFlags>;

  constructor(data: Partial<z.input<typeof MessageCreateEntity>> = {}) {
    try {
      this.#data = MessageCreateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get channelId(): Snowflake {
    return this.#data.channel_id;
  }

  get author(): User | null {
    return this.#data.author ? new User(this.#data.author) : null;
  }

  get content(): string {
    return this.#data.content;
  }

  get timestamp(): string {
    return this.#data.timestamp;
  }

  get editedTimestamp(): string | null {
    return this.#data.edited_timestamp ?? null;
  }

  get tts(): boolean {
    return Boolean(this.#data.tts);
  }

  get mentionEveryone(): boolean {
    return Boolean(this.#data.mention_everyone);
  }

  get mentionRoles(): Snowflake[] {
    return Array.isArray(this.#data.mention_roles)
      ? [...this.#data.mention_roles]
      : [];
  }

  get attachments(): Attachment[] {
    return Array.isArray(this.#data.attachments)
      ? this.#data.attachments.map((attachment) => new Attachment(attachment))
      : [];
  }

  get embeds(): Embed[] {
    return Array.isArray(this.#data.embeds)
      ? this.#data.embeds.map((embed) => new Embed(embed))
      : [];
  }

  get pinned(): boolean {
    return Boolean(this.#data.pinned);
  }

  get type(): MessageType {
    return this.#data.type;
  }

  get mentionChannels(): ChannelMention[] | null {
    return this.#data.mention_channels
      ? this.#data.mention_channels.map(
          (mention) => new ChannelMention(mention),
        )
      : null;
  }

  get reactions(): Reaction[] | null {
    return this.#data.reactions
      ? this.#data.reactions.map((reaction) => new Reaction(reaction))
      : null;
  }

  get nonce(): string | number | null {
    return this.#data.nonce ?? null;
  }

  get webhookId(): Snowflake | null {
    return this.#data.webhook_id ?? null;
  }

  get activity(): MessageActivityEntity | null {
    return this.#data.activity ?? null;
  }

  get application(): Application | null {
    return this.#data.application
      ? new Application(this.#data.application)
      : null;
  }

  get applicationId(): Snowflake | null {
    return this.#data.application_id ?? null;
  }

  get flags(): BitFieldManager<MessageFlags> {
    return this.#flags;
  }

  get components(): ActionRow[] | null {
    return this.#data.components
      ? this.#data.components.map((component) => new ActionRow(component))
      : null;
  }

  get stickerItems(): StickerItem[] | null {
    return this.#data.sticker_items
      ? this.#data.sticker_items.map(
          (stickerItem) => new StickerItem(stickerItem),
        )
      : null;
  }

  get stickers(): Sticker[] | null {
    return this.#data.stickers
      ? this.#data.stickers.map((sticker) => new Sticker(sticker))
      : null;
  }

  get position(): number | null {
    return this.#data.position ?? null;
  }

  get roleSubscriptionData(): RoleSubscriptionDataEntity | null {
    return this.#data.role_subscription_data ?? null;
  }

  get poll(): Poll | null {
    return this.#data.poll ? new Poll(this.#data.poll) : null;
  }

  get call(): MessageCallEntity | null {
    return this.#data.call ?? null;
  }

  get messageReference(): MessageReferenceEntity | null {
    return this.#data.message_reference ?? null;
  }

  get interactionMetadata():
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity
    | null {
    return this.#data.interaction_metadata ?? null;
  }

  get thread(): AnyThreadChannel | null {
    return this.#data.thread ? resolveThreadChannel(this.#data.thread) : null;
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get member(): GuildMember | null {
    return this.#data.member ? new GuildMember(this.#data.member) : null;
  }

  get mentions(): (UserEntity | Partial<GuildMemberEntity>)[] | null {
    return this.#data.mentions ?? null;
  }

  toJson(): MessageCreateEntity {
    return { ...this.#data };
  }

  clone(): Message {
    return new Message(this.toJson());
  }

  validate(): boolean {
    try {
      MessageSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<MessageCreateEntity>): Message {
    return new Message({ ...this.toJson(), ...other });
  }

  equals(other: Message): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const MessageSchema = z.instanceof(Message);
