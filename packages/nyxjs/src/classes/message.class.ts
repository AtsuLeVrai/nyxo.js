import {
  type ActionRowEntity,
  type AnyThreadChannelEntity,
  type ApplicationEntity,
  type AttachmentEntity,
  BitField,
  type ChannelMentionEntity,
  type EmbedEntity,
  type GuildMemberEntity,
  type MessageActivityEntity,
  type MessageCallEntity,
  type MessageFlags,
  type MessageReferenceEntity,
  MessageReferenceType,
  type MessageType,
  type PollEntity,
  type ReactionEntity,
  type RoleSubscriptionDataEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { MessageCreateEntity } from "@nyxjs/gateway";
import type { CreateMessageSchema } from "@nyxjs/rest";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import { ChannelFactory } from "../factories/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import { Application } from "./application.class.js";
import type { AnyThreadChannel } from "./channel.class.js";
import { GuildMember } from "./guild.class.js";
import { Sticker, StickerItem } from "./sticker.class.js";
import { User } from "./user.class.js";

@Cacheable("messages")
export class Message
  extends BaseClass<MessageCreateEntity>
  implements Enforce<CamelCasedProperties<MessageCreateEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return new GuildMember(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get author(): User {
    return new User(this.client, this.data.author);
  }

  get content(): string {
    return this.data.content;
  }

  get timestamp(): string {
    return this.data.timestamp;
  }

  get editedTimestamp(): string | null {
    return this.data.edited_timestamp;
  }

  get tts(): boolean {
    return Boolean(this.data.tts);
  }

  get mentionEveryone(): boolean {
    return Boolean(this.data.mention_everyone);
  }

  get mentions(): (User | GuildMember)[] | undefined {
    if (!this.data.mentions) {
      return undefined;
    }

    return this.data.mentions.map((mention) => {
      if ("id" in mention) {
        return new User(this.client, mention);
      }

      return new GuildMember(
        this.client,
        mention as GuildBased<GuildMemberEntity>,
      );
    });
  }

  get mentionRoles(): Snowflake[] {
    return this.data.mention_roles;
  }

  get attachments(): AttachmentEntity[] {
    return this.data.attachments;
  }

  get embeds(): EmbedEntity[] {
    return this.data.embeds;
  }

  get pinned(): boolean {
    return Boolean(this.data.pinned);
  }

  get type(): MessageType {
    return this.data.type;
  }

  get mentionChannels(): ChannelMentionEntity[] | undefined {
    return this.data.mention_channels;
  }

  get reactions(): ReactionEntity[] | undefined {
    return this.data.reactions;
  }

  get nonce(): string | number | undefined {
    return this.data.nonce;
  }

  get webhookId(): Snowflake | undefined {
    return this.data.webhook_id;
  }

  get activity(): MessageActivityEntity | undefined {
    return this.data.activity;
  }

  get application(): Application | undefined {
    if (!this.data.application) {
      return undefined;
    }

    return new Application(
      this.client,
      this.data.application as ApplicationEntity,
    );
  }

  get applicationId(): Snowflake | undefined {
    return this.data.application_id;
  }

  get flags(): BitField<MessageFlags> {
    return new BitField<MessageFlags>(this.data.flags ?? 0n);
  }

  get components(): ActionRowEntity[] | undefined {
    return this.data.components;
  }

  get stickerItems(): StickerItem[] | undefined {
    if (!this.data.sticker_items) {
      return undefined;
    }

    return this.data.sticker_items.map(
      (stickerItem) => new StickerItem(this.client, stickerItem),
    );
  }

  get stickers(): Sticker[] | undefined {
    if (!this.data.stickers) {
      return undefined;
    }

    return this.data.stickers.map(
      (sticker) => new Sticker(this.client, sticker),
    );
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get roleSubscriptionData(): RoleSubscriptionDataEntity | undefined {
    return this.data.role_subscription_data;
  }

  get poll(): PollEntity | undefined {
    return this.data.poll;
  }

  get call(): MessageCallEntity | undefined {
    return this.data.call;
  }

  get messageReference(): MessageReferenceEntity | undefined {
    return this.data.message_reference;
  }

  get thread(): AnyThreadChannel | undefined {
    if (!this.data.thread) {
      return undefined;
    }

    return ChannelFactory.createThread(
      this.client,
      this.data.thread as AnyThreadChannelEntity,
    );
  }

  get referencedMessage(): Message | null | undefined {
    if (!this.data.referenced_message) {
      return null;
    }

    return new Message(
      this.client,
      this.data.referenced_message as MessageCreateEntity,
    );
  }

  async reply(
    options: string | Omit<CreateMessageSchema, "message_reference">,
  ): Promise<Message> {
    let message = options as CreateMessageSchema;
    if (typeof options === "string") {
      message = { content: options };
    }

    const reply = await this.client.rest.messages.sendMessage(this.channelId, {
      ...message,
      message_reference: {
        message_id: this.id,
        channel_id: this.channelId,
        guild_id: this.guildId ?? undefined,
        type: MessageReferenceType.Default,
      },
    });

    return new Message(this.client, reply as MessageCreateEntity);
  }
}
