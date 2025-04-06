import {
  type ActionRowEntity,
  type AnyThreadChannelEntity,
  type ApplicationEntity,
  type AttachmentEntity,
  type AttachmentFlags,
  BitFieldManager,
  type ChannelMentionEntity,
  type ChannelType,
  type EmbedAuthorEntity,
  type EmbedEntity,
  type EmbedFieldEntity,
  type EmbedFooterEntity,
  type EmbedImageEntity,
  type EmbedProviderEntity,
  type EmbedThumbnailEntity,
  type EmbedType,
  type EmbedVideoEntity,
  type EmojiEntity,
  type GuildMemberEntity,
  type MessageActivityEntity,
  type MessageCallEntity,
  type MessageFlags,
  type MessageReferenceEntity,
  MessageReferenceType,
  type MessageType,
  type PollEntity,
  type ReactionCountDetailsEntity,
  type ReactionEntity,
  type RoleSubscriptionDataEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { MessageCreateEntity } from "@nyxjs/gateway";
import type { CreateMessageSchema } from "@nyxjs/rest";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import { ChannelFactory } from "../factories/index.js";
import type { GuildBased } from "../types/index.js";
import { Application } from "./application.class.js";
import type { AnyThreadChannel } from "./channel.class.js";
import { Emoji } from "./emoji.class.js";
import { GuildMember } from "./guild.class.js";
import { Sticker, StickerItem } from "./sticker.class.js";
import { User } from "./user.class.js";

export class ChannelMention extends BaseClass<ChannelMentionEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get type(): ChannelType {
    return this.data.type;
  }

  get name(): string {
    return this.data.name;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class Attachment extends BaseClass<AttachmentEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get filename(): string {
    return this.data.filename;
  }

  get title(): string | undefined {
    return this.data.title;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get contentType(): string | undefined {
    return this.data.content_type;
  }

  get size(): number {
    return this.data.size;
  }

  get url(): string {
    return this.data.url;
  }

  get proxyUrl(): string {
    return this.data.proxy_url;
  }

  get height(): number | null | undefined {
    return this.data.height;
  }

  get width(): number | null | undefined {
    return this.data.width;
  }

  get ephemeral(): boolean {
    return Boolean(this.data.ephemeral);
  }

  get durationSecs(): number | undefined {
    return this.data.duration_secs;
  }

  get waveform(): string | undefined {
    return this.data.waveform;
  }

  get flags(): AttachmentFlags | undefined {
    return this.data.flags;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedFooter extends BaseClass<EmbedFooterEntity> {
  get text(): string {
    return this.data.text;
  }

  get iconUrl(): string | undefined {
    return this.data.icon_url;
  }

  get proxyIconUrl(): string | undefined {
    return this.data.proxy_icon_url;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedImage extends BaseClass<EmbedImageEntity> {
  get url(): string {
    return this.data.url;
  }

  get proxyUrl(): string | undefined {
    return this.data.proxy_url;
  }

  get height(): number | undefined {
    return this.data.height;
  }

  get width(): number | undefined {
    return this.data.width;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedThumbnail extends BaseClass<EmbedThumbnailEntity> {
  get url(): string {
    return this.data.url;
  }

  get proxyUrl(): string | undefined {
    return this.data.proxy_url;
  }

  get height(): number | undefined {
    return this.data.height;
  }

  get width(): number | undefined {
    return this.data.width;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedVideo extends BaseClass<EmbedVideoEntity> {
  get url(): string | undefined {
    return this.data.url;
  }

  get proxyUrl(): string | undefined {
    return this.data.proxy_url;
  }

  get height(): number | undefined {
    return this.data.height;
  }

  get width(): number | undefined {
    return this.data.width;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedProvider extends BaseClass<EmbedProviderEntity> {
  get name(): string | undefined {
    return this.data.name;
  }

  get url(): string | undefined {
    return this.data.url;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedAuthor extends BaseClass<EmbedAuthorEntity> {
  get name(): string {
    return this.data.name;
  }

  get url(): string | undefined {
    return this.data.url;
  }

  get iconUrl(): string | undefined {
    return this.data.icon_url;
  }

  get proxyIconUrl(): string | undefined {
    return this.data.proxy_icon_url;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedField extends BaseClass<EmbedFieldEntity> {
  get name(): string {
    return this.data.name;
  }

  get value(): string {
    return this.data.value;
  }

  get inline(): boolean {
    return Boolean(this.data.inline);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class Embed extends BaseClass<EmbedEntity> {
  get title(): string | undefined {
    return this.data.title;
  }

  get type(): EmbedType {
    return this.data.type;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get url(): string | undefined {
    return this.data.url;
  }

  get timestamp(): string | undefined {
    return this.data.timestamp;
  }

  get color(): number | undefined {
    return this.data.color;
  }

  get footer(): EmbedFooter | undefined {
    if (!this.data.footer) {
      return undefined;
    }

    return EmbedFooter.from(this.client, this.data.footer);
  }

  get image(): EmbedImage | undefined {
    if (!this.data.image) {
      return undefined;
    }

    return EmbedImage.from(this.client, this.data.image);
  }

  get thumbnail(): EmbedThumbnail | undefined {
    if (!this.data.thumbnail) {
      return undefined;
    }

    return EmbedThumbnail.from(this.client, this.data.thumbnail);
  }

  get video(): EmbedVideo | undefined {
    if (!this.data.video) {
      return undefined;
    }

    return EmbedVideo.from(this.client, this.data.video);
  }

  get provider(): EmbedProvider | undefined {
    if (!this.data.provider) {
      return undefined;
    }

    return EmbedProvider.from(this.client, this.data.provider);
  }

  get author(): EmbedAuthor | undefined {
    if (!this.data.author) {
      return undefined;
    }

    return EmbedAuthor.from(this.client, this.data.author);
  }

  get fields(): EmbedField[] | undefined {
    if (!this.data.fields) {
      return undefined;
    }

    return this.data.fields.map((field) => EmbedField.from(this.client, field));
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class ReactionCountDetails extends BaseClass<ReactionCountDetailsEntity> {
  get burst(): number {
    return this.data.burst;
  }

  get normal(): number {
    return this.data.normal;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class Reaction extends BaseClass<ReactionEntity> {
  get count(): number {
    return this.data.count;
  }

  get countDetails(): ReactionCountDetails {
    return ReactionCountDetails.from(this.client, this.data.count_details);
  }

  get me(): boolean {
    return Boolean(this.data.me);
  }

  get meBurst(): boolean {
    return Boolean(this.data.me_burst);
  }

  get emoji(): Emoji {
    return Emoji.from(this.client, this.data.emoji as EmojiEntity);
  }

  get burstColors(): string[] | undefined {
    return this.data.burst_colors;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class Message extends BaseClass<MessageCreateEntity> {
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
