import {
  type ActionRowEntity,
  type AnyThreadChannelEntity,
  type ApplicationEntity,
  BitFieldManager,
  type GuildMemberEntity,
  type MessageActivityEntity,
  type MessageCallEntity,
  type MessageFlags,
  type MessageReferenceEntity,
  MessageReferenceType,
  type MessageType,
  type PollEntity,
  type RoleSubscriptionDataEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { MessageCreateEntity } from "@nyxjs/gateway";
import type { CreateMessageSchema } from "@nyxjs/rest";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import { ChannelFactory } from "../../factories/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { Application } from "../applications/index.js";
import type { AnyThreadChannel } from "../channels/index.js";
import { GuildMember } from "../guilds/index.js";
import { Sticker, StickerItem } from "../stickers/index.js";
import { User } from "../users/index.js";
import { Attachment } from "./attachment.class.js";
import { ChannelMention } from "./channel-mention.class.js";
import { Embed } from "./embed.class.js";
import { Reaction } from "./reaction.class.js";

export class Message
  extends BaseClass<MessageCreateEntity>
  implements EnforceCamelCase<MessageCreateEntity>
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

    return GuildMember.from(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get author(): User {
    return User.from(this.client, this.data.author);
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
        return User.from(this.client, mention);
      }

      return GuildMember.from(
        this.client,
        mention as GuildBased<GuildMemberEntity>,
      );
    });
  }

  get mentionRoles(): Snowflake[] {
    return this.data.mention_roles;
  }

  get attachments(): Attachment[] {
    return this.data.attachments.map((attachment) =>
      Attachment.from(this.client, attachment),
    );
  }

  get embeds(): Embed[] {
    return this.data.embeds.map((embed) => Embed.from(this.client, embed));
  }

  get pinned(): boolean {
    return Boolean(this.data.pinned);
  }

  get type(): MessageType {
    return this.data.type;
  }

  get mentionChannels(): ChannelMention[] | undefined {
    if (!this.data.mention_channels) {
      return undefined;
    }

    return this.data.mention_channels.map((mention) =>
      ChannelMention.from(this.client, mention),
    );
  }

  get reactions(): Reaction[] | undefined {
    if (!this.data.reactions) {
      return undefined;
    }

    return this.data.reactions.map((reaction) =>
      Reaction.from(this.client, reaction),
    );
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

    return Application.from(
      this.client,
      this.data.application as ApplicationEntity,
    );
  }

  get applicationId(): Snowflake | undefined {
    return this.data.application_id;
  }

  get flags(): BitFieldManager<MessageFlags> {
    return new BitFieldManager<MessageFlags>(this.data.flags ?? 0n);
  }

  get components(): ActionRowEntity[] | undefined {
    return this.data.components;
  }

  get stickerItems(): StickerItem[] | undefined {
    if (!this.data.sticker_items) {
      return undefined;
    }

    return this.data.sticker_items.map((stickerItem) =>
      StickerItem.from(this.client, stickerItem),
    );
  }

  get stickers(): Sticker[] | undefined {
    if (!this.data.stickers) {
      return undefined;
    }

    return this.data.stickers.map((sticker) =>
      Sticker.from(this.client, sticker),
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

    return ChannelFactory.create(
      this.client,
      this.data.thread as AnyThreadChannelEntity,
    ) as AnyThreadChannel;
  }

  get referencedMessage(): Message | null | undefined {
    if (!this.data.referenced_message) {
      return null;
    }

    return Message.from(
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

    const reply = await this.client.rest.messages.createMessage(
      this.channelId,
      {
        ...message,
        message_reference: {
          message_id: this.id,
          channel_id: this.channelId,
          guild_id: this.guildId ?? undefined,
          type: MessageReferenceType.Default,
        },
      },
    );

    return Message.from(this.client, reply as MessageCreateEntity);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "messages",
      id: this.id,
    };
  }
}
