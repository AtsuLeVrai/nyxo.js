import {
  type ActionRowEntity,
  type AnyThreadChannelEntity,
  type ApplicationCommandInteractionMetadataEntity,
  type ApplicationEntity,
  type AttachmentEntity,
  BitField,
  type ChannelMentionEntity,
  type EmbedEntity,
  type GuildMemberEntity,
  type InteractionResolvedDataEntity,
  type MessageActivityEntity,
  type MessageCallEntity,
  type MessageComponentInteractionMetadataEntity,
  MessageFlags,
  type MessageInteractionEntity,
  type MessageReferenceEntity,
  MessageReferenceType,
  type MessageSnapshotEntity,
  MessageType,
  type ModalSubmitInteractionMetadataEntity,
  type PollEntity,
  type ReactionEntity,
  type RoleSubscriptionDataEntity,
  type Snowflake,
  link,
} from "@nyxojs/core";
import type { MessageCreateEntity } from "@nyxojs/gateway";
import type {
  CreateMessageSchema,
  EditMessageSchema,
  GetReactionsQuerySchema,
  StartThreadFromMessageSchema,
} from "@nyxojs/rest";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import { ChannelFactory } from "../factories/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import {
  toCamelCasedProperties,
  toCamelCasedPropertiesDeep,
  toSnakeCaseProperties,
} from "../utils/index.js";
import { Application } from "./application.class.js";
import type { AnyChannel, AnyThreadChannel } from "./channel.class.js";
import { GuildMember } from "./guild.class.js";
import { Sticker, StickerItem } from "./sticker.class.js";
import { User } from "./user.class.js";

/**
 * Represents a message in a Discord channel.
 *
 * The Message class serves as a comprehensive wrapper around Discord's message API, offering:
 * - Access to message content and metadata
 * - Methods to interact with messages (reply, edit, delete, etc.)
 * - Tools for managing reactions and attachments
 * - Access to embedded content, components, and references
 * - Utilities for working with threads and replies
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @remarks
 * Messages are the core building blocks of communication in Discord. They can contain
 * text content, embeds, attachments, components (like buttons and select menus),
 * and can be part of threads or replies to other messages.
 *
 * Different message types exist for system messages, user messages, and application-generated
 * content, each with their own display behavior and capabilities.
 *
 * @example
 * ```typescript
 * // Fetching a message by ID
 * const message = await channel.fetchMessage('123456789012345678');
 * console.log(`Content: ${message.content}`);
 *
 * // Replying to a message
 * const reply = await message.reply('This is a reply!');
 *
 * // Adding a reaction
 * await message.react('👍');
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
@Cacheable("messages")
export class Message
  extends BaseClass<MessageCreateEntity>
  implements Enforce<CamelCasedProperties<MessageCreateEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this message.
   *
   * This ID is permanent and will not change for the lifetime of the message.
   * It can be used for API operations, referencing in replies, and persistent storage.
   *
   * @returns The message's ID as a Snowflake string
   *
   * @example
   * ```typescript
   * const messageId = message.id;
   * console.log(`Message ID: ${messageId}`);
   * ```
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * Gets the ID of the guild (server) where this message was sent.
   *
   * This property will be undefined for DM messages since they don't belong to any guild.
   *
   * @returns The guild ID, or undefined if the message was sent in a DM
   *
   * @example
   * ```typescript
   * if (message.guildId) {
   *   console.log(`This message was sent in guild: ${message.guildId}`);
   * } else {
   *   console.log('This message was sent in a DM');
   * }
   * ```
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * Gets the GuildMember object for the author of this message in the context of the guild.
   *
   * This property provides additional information about the message author specific to the guild,
   * such as their nickname, roles, and join date. It will be undefined for DM messages or
   * when the member data is not available.
   *
   * @returns The GuildMember object, or undefined if not available
   *
   * @example
   * ```typescript
   * if (message.member) {
   *   console.log(`Author's nickname: ${message.member.nickname ?? message.author.username}`);
   *   console.log(`Author's roles: ${message.member.roles.cache.size}`);
   * }
   * ```
   */
  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return new GuildMember(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  /**
   * Gets the ID of the channel where this message was sent.
   *
   * This ID uniquely identifies the channel and can be used for API operations.
   *
   * @returns The channel's ID as a Snowflake string
   *
   * @example
   * ```typescript
   * const channelId = message.channelId;
   * console.log(`This message was sent in channel: ${channelId}`);
   * ```
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  /**
   * Gets the User object for the author of this message.
   *
   * This provides information about the user who sent the message, such as
   * their username, discriminator, and avatar.
   *
   * @returns The User object for the message author
   *
   * @example
   * ```typescript
   * const author = message.author;
   * console.log(`Message sent by: ${author.tag}`);
   * console.log(`Author's avatar: ${author.getDisplayAvatarUrl()}`);
   * ```
   */
  get author(): User {
    return new User(this.client, this.data.author);
  }

  /**
   * Gets the text content of the message.
   *
   * This is the actual textual content of the message, which may include
   * markdown formatting, mentions, emoji, etc.
   *
   * @returns The message content as a string
   *
   * @example
   * ```typescript
   * const content = message.content;
   * console.log(`Message content: ${content}`);
   * ```
   */
  get content(): string {
    return this.data.content;
  }

  /**
   * Gets the timestamp when this message was sent.
   *
   * The timestamp is in ISO8601 format.
   *
   * @returns The message creation timestamp as a string
   *
   * @example
   * ```typescript
   * const timestamp = message.timestamp;
   * console.log(`Message sent at: ${timestamp}`);
   * ```
   */
  get timestamp(): string {
    return this.data.timestamp;
  }

  /**
   * Gets the timestamp when this message was last edited, or null if it was never edited.
   *
   * The timestamp is in ISO8601 format.
   *
   * @returns The message edit timestamp as a string, or null
   *
   * @example
   * ```typescript
   * const editTimestamp = message.editedTimestamp;
   * if (editTimestamp) {
   *   console.log(`Message was edited at: ${editTimestamp}`);
   * } else {
   *   console.log('Message has not been edited');
   * }
   * ```
   */
  get editedTimestamp(): string | null {
    return this.data.edited_timestamp;
  }

  /**
   * Checks if this message was sent as a text-to-speech message.
   *
   * TTS messages are read aloud to users in the channel who have text-to-speech enabled.
   *
   * @returns True if the message is TTS, false otherwise
   *
   * @example
   * ```typescript
   * if (message.tts) {
   *   console.log('This message was sent with text-to-speech');
   * }
   * ```
   */
  get tts(): boolean {
    return Boolean(this.data.tts);
  }

  /**
   * Checks if this message mentions everyone in the channel.
   *
   * This will be true if the message contains @everyone or @here mentions.
   *
   * @returns True if the message mentions everyone, false otherwise
   *
   * @example
   * ```typescript
   * if (message.mentionEveryone) {
   *   console.log('This message mentions everyone in the channel');
   * }
   * ```
   */
  get mentionEveryone(): boolean {
    return Boolean(this.data.mention_everyone);
  }

  /**
   * Gets an array of users or guild members mentioned in this message.
   *
   * For guild messages, this may include GuildMember objects with additional
   * guild-specific information about the mentioned users.
   *
   * @returns An array of User or GuildMember objects, or undefined if none
   *
   * @example
   * ```typescript
   * const mentions = message.mentions;
   * if (mentions && mentions.length > 0) {
   *   console.log(`This message mentions ${mentions.length} users:`);
   *   mentions.forEach(mention => console.log(`- ${mention instanceof GuildMember ? mention.displayName : mention.username}`));
   * }
   * ```
   */
  get mentions(): (User | GuildMember)[] | undefined {
    return this.data.mentions?.map((mention) => {
      if ("id" in mention) {
        return new User(this.client, mention);
      }

      return new GuildMember(
        this.client,
        mention as GuildBased<GuildMemberEntity>,
      );
    });
  }

  /**
   * Gets an array of role IDs that were mentioned in this message.
   *
   * These are the IDs of roles that were mentioned using the @role syntax.
   *
   * @returns An array of role IDs
   *
   * @example
   * ```typescript
   * const mentionedRoles = message.mentionRoles;
   * console.log(`This message mentions ${mentionedRoles.length} roles`);
   * ```
   */
  get mentionRoles(): Snowflake[] {
    return this.data.mention_roles;
  }

  /**
   * Gets an array of attachments included with this message.
   *
   * Attachments are files (images, documents, etc.) that are uploaded with a message.
   *
   * @returns An array of attachment objects
   *
   * @example
   * ```typescript
   * const attachments = message.attachments;
   * if (attachments.length > 0) {
   *   console.log(`This message has ${attachments.length} attachments:`);
   *   attachments.forEach(attachment => {
   *     console.log(`- ${attachment.filename} (${attachment.size} bytes)`);
   *     console.log(`  URL: ${attachment.url}`);
   *   });
   * }
   * ```
   */
  get attachments(): CamelCasedProperties<AttachmentEntity>[] {
    return this.data.attachments.map(toCamelCasedProperties);
  }

  /**
   * Gets an array of embeds included with this message.
   *
   * Embeds are rich content displays that can include formatted text, images,
   * and other media.
   *
   * @returns An array of embed objects
   *
   * @example
   * ```typescript
   * const embeds = message.embeds;
   * if (embeds.length > 0) {
   *   console.log(`This message has ${embeds.length} embeds`);
   *   embeds.forEach(embed => {
   *     if (embed.title) console.log(`- Title: ${embed.title}`);
   *     if (embed.description) console.log(`  Description: ${embed.description.substring(0, 50)}...`);
   *   });
   * }
   * ```
   */
  get embeds(): CamelCasedProperties<EmbedEntity>[] {
    return this.data.embeds.map(toCamelCasedProperties);
  }

  /**
   * Checks if this message is pinned in its channel.
   *
   * Pinned messages appear in the pinned messages list of the channel.
   *
   * @returns True if the message is pinned, false otherwise
   *
   * @example
   * ```typescript
   * if (message.pinned) {
   *   console.log('This message is pinned in its channel');
   * }
   * ```
   */
  get pinned(): boolean {
    return Boolean(this.data.pinned);
  }

  /**
   * Gets the type of this message.
   *
   * The message type determines how the message is displayed and what content it has.
   *
   * @returns The message type as a MessageType enum value
   *
   * @example
   * ```typescript
   * import { MessageType } from '@nyxojs/core';
   *
   * if (message.type === MessageType.Default) {
   *   console.log('This is a standard user message');
   * } else if (message.type === MessageType.Reply) {
   *   console.log('This is a reply to another message');
   * }
   * ```
   */
  get type(): MessageType {
    return this.data.type;
  }

  /**
   * Gets an array of channels that were mentioned in this message.
   *
   * These are channels that were mentioned using the #channel syntax.
   *
   * @returns An array of channel mention objects, or undefined if none
   *
   * @example
   * ```typescript
   * const mentionedChannels = message.mentionChannels;
   * if (mentionedChannels && mentionedChannels.length > 0) {
   *   console.log(`This message mentions ${mentionedChannels.length} channels:`);
   *   mentionedChannels.forEach(channel => console.log(`- #${channel.name}`));
   * }
   * ```
   */
  get mentionChannels():
    | CamelCasedProperties<ChannelMentionEntity>[]
    | undefined {
    return this.data.mention_channels?.map(toCamelCasedProperties);
  }

  /**
   * Gets an array of reactions to this message.
   *
   * Reactions are emoji that users have added to the message as quick responses.
   *
   * @returns An array of reaction objects, or undefined if none
   *
   * @example
   * ```typescript
   * const reactions = message.reactions;
   * if (reactions && reactions.length > 0) {
   *   console.log(`This message has ${reactions.length} reactions:`);
   *   reactions.forEach(reaction => {
   *     const emoji = reaction.emoji.name;
   *     console.log(`- ${emoji}: ${reaction.count} (${reaction.me ? 'You reacted' : 'You did not react'})`);
   *   });
   * }
   * ```
   */
  get reactions(): CamelCasedPropertiesDeep<ReactionEntity>[] | undefined {
    return this.data.reactions?.map(toCamelCasedPropertiesDeep);
  }

  /**
   * Gets the nonce of this message, which is a custom identifier used for validation.
   *
   * The nonce can be used to verify that a message was successfully sent.
   *
   * @returns The nonce as a string or number, or undefined if none
   *
   * @example
   * ```typescript
   * const nonce = message.nonce;
   * if (nonce) {
   *   console.log(`Message nonce: ${nonce}`);
   * }
   * ```
   */
  get nonce(): string | number | undefined {
    return this.data.nonce;
  }

  /**
   * Gets the webhook ID that sent this message, if it was sent by a webhook.
   *
   * @returns The webhook ID, or undefined if not sent by a webhook
   *
   * @example
   * ```typescript
   * const webhookId = message.webhookId;
   * if (webhookId) {
   *   console.log(`This message was sent by webhook with ID: ${webhookId}`);
   * } else {
   *   console.log('This message was sent by a regular user');
   * }
   * ```
   */
  get webhookId(): Snowflake | undefined {
    return this.data.webhook_id;
  }

  /**
   * Gets the activity associated with this message, if any.
   *
   * Activities are typically used with Rich Presence-related chat embeds.
   *
   * @returns The activity object, or undefined if none
   *
   * @example
   * ```typescript
   * const activity = message.activity;
   * if (activity) {
   *   console.log(`Message has activity of type: ${activity.type}`);
   *   if (activity.party_id) console.log(`Party ID: ${activity.party_id}`);
   * }
   * ```
   */
  get activity(): CamelCasedProperties<MessageActivityEntity> | undefined {
    if (!this.data.activity) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.activity);
  }

  /**
   * Gets the application associated with this message, if any.
   *
   * This is typically present for Rich Presence-related messages.
   *
   * @returns The Application object, or undefined if none
   *
   * @example
   * ```typescript
   * const application = message.application;
   * if (application) {
   *   console.log(`Message is associated with application: ${application.name}`);
   * }
   * ```
   */
  get application(): Application | undefined {
    if (!this.data.application) {
      return undefined;
    }

    return new Application(
      this.client,
      this.data.application as ApplicationEntity,
    );
  }

  /**
   * Gets the application ID associated with this message, if any.
   *
   * This is present for messages sent by interactions or application-owned webhooks.
   *
   * @returns The application ID, or undefined if none
   *
   * @example
   * ```typescript
   * const applicationId = message.applicationId;
   * if (applicationId) {
   *   console.log(`Message is associated with application ID: ${applicationId}`);
   * }
   * ```
   */
  get applicationId(): Snowflake | undefined {
    return this.data.application_id;
  }

  /**
   * Gets the flags associated with this message as a BitField.
   *
   * Message flags control various behaviors and display properties of the message.
   *
   * @returns A BitField of message flags
   *
   * @example
   * ```typescript
   * import { MessageFlags } from '@nyxojs/core';
   *
   * if (message.flags.has(MessageFlags.Crossposted)) {
   *   console.log('This message has been crossposted to other channels');
   * }
   *
   * if (message.flags.has(MessageFlags.Ephemeral)) {
   *   console.log('This message is ephemeral (only visible to the interaction user)');
   * }
   * ```
   */
  get flags(): BitField<MessageFlags> {
    return new BitField<MessageFlags>(this.data.flags ?? 0n);
  }

  /**
   * Gets the components (buttons, select menus, etc.) attached to this message.
   *
   * Components are interactive elements that users can interact with.
   *
   * @returns An array of action row components, or undefined if none
   *
   * @example
   * ```typescript
   * const components = message.components;
   * if (components && components.length > 0) {
   *   console.log(`This message has ${components.length} component rows`);
   *   components.forEach(row => {
   *     console.log(`- Row with ${row.components.length} components`);
   *   });
   * }
   * ```
   */
  get components(): CamelCasedPropertiesDeep<ActionRowEntity>[] | undefined {
    return this.data.components?.map(toCamelCasedPropertiesDeep);
  }

  /**
   * Gets the sticker items attached to this message.
   *
   * Stickers are small, expressive images that users can attach to messages.
   *
   * @returns An array of StickerItem objects, or undefined if none
   *
   * @example
   * ```typescript
   * const stickerItems = message.stickerItems;
   * if (stickerItems && stickerItems.length > 0) {
   *   console.log(`This message has ${stickerItems.length} stickers:`);
   *   stickerItems.forEach(sticker => console.log(`- ${sticker.name}`));
   * }
   * ```
   */
  get stickerItems(): StickerItem[] | undefined {
    return this.data.sticker_items?.map(
      (stickerItem) => new StickerItem(this.client, stickerItem),
    );
  }

  /**
   * Gets the stickers attached to this message.
   *
   * @deprecated Use stickerItems instead.
   *
   * @returns An array of Sticker objects, or undefined if none
   *
   * @example
   * ```typescript
   * // Using the non-deprecated stickerItems property instead
   * const stickers = message.stickerItems;
   * if (stickers && stickers.length > 0) {
   *   console.log(`This message has ${stickers.length} stickers`);
   * }
   * ```
   */
  get stickers(): Sticker[] | undefined {
    return this.data.stickers?.map(
      (sticker) => new Sticker(this.client, sticker),
    );
  }

  /**
   * Gets the approximate position of this message in a thread.
   *
   * This is only meaningful for messages in threads.
   *
   * @returns The message position as a number, or undefined if not applicable
   *
   * @example
   * ```typescript
   * const position = message.position;
   * if (position !== undefined) {
   *   console.log(`This message is at position ${position} in its thread`);
   * }
   * ```
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * Gets the role subscription data for this message, if it's a role subscription purchase event.
   *
   * This is only present for messages related to premium role subscriptions.
   *
   * @returns The role subscription data, or undefined if not applicable
   *
   * @example
   * ```typescript
   * const subscriptionData = message.roleSubscriptionData;
   * if (subscriptionData) {
   *   console.log(`Role subscription: ${subscriptionData.tier_name}`);
   *   console.log(`Total months subscribed: ${subscriptionData.total_months_subscribed}`);
   * }
   * ```
   */
  get roleSubscriptionData():
    | CamelCasedProperties<RoleSubscriptionDataEntity>
    | undefined {
    if (!this.data.role_subscription_data) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.role_subscription_data);
  }

  /**
   * Gets the poll attached to this message, if any.
   *
   * Polls are interactive voting elements that users can participate in.
   *
   * @returns The poll object, or undefined if none
   *
   * @example
   * ```typescript
   * const poll = message.poll;
   * if (poll) {
   *   console.log(`Poll question: ${poll.question}`);
   *   console.log(`${poll.options.length} options available`);
   * }
   * ```
   */
  get poll(): CamelCasedPropertiesDeep<PollEntity> | undefined {
    if (!this.data.poll) {
      return undefined;
    }

    return toCamelCasedPropertiesDeep(this.data.poll);
  }

  /**
   * Gets the call information associated with this message, if it's a call message.
   *
   * This is only present for messages related to Discord calls.
   *
   * @returns The call object, or undefined if not applicable
   *
   * @example
   * ```typescript
   * const call = message.call;
   * if (call) {
   *   console.log(`Call with ${call.participants.length} participants`);
   *   if (call.ended_timestamp) console.log(`Call ended at: ${call.ended_timestamp}`);
   * }
   * ```
   */
  get call(): CamelCasedProperties<MessageCallEntity> | undefined {
    if (!this.data.call) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.call);
  }

  /**
   * Gets the message reference for this message, if it's a reply or crosspost.
   *
   * The message reference contains information about the original message being referenced.
   *
   * @returns The message reference object, or undefined if not applicable
   *
   * @example
   * ```typescript
   * const reference = message.messageReference;
   * if (reference) {
   *   console.log(`This message references another message: ${reference.message_id}`);
   *   console.log(`In channel: ${reference.channel_id}`);
   * }
   * ```
   */
  get messageReference():
    | CamelCasedProperties<MessageReferenceEntity>
    | undefined {
    if (!this.data.message_reference) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.message_reference);
  }

  /**
   * Gets the thread associated with this message, if it created a thread.
   *
   * This is only present for messages that have created threads.
   *
   * @returns The thread channel object, or undefined if not applicable
   *
   * @example
   * ```typescript
   * const thread = message.thread;
   * if (thread) {
   *   console.log(`This message created thread: ${thread.name}`);
   *   console.log(`Thread has ${thread.memberCount} members`);
   * }
   * ```
   */
  get thread(): AnyThreadChannel | undefined {
    if (!this.data.thread) {
      return undefined;
    }

    return ChannelFactory.createThread(
      this.client,
      this.data.thread as AnyThreadChannelEntity,
    );
  }

  /**
   * Gets the referenced message for this message, if it's a reply.
   *
   * This is the message being replied to. It can be null if the original message
   * was deleted, or undefined if this message is not a reply.
   *
   * @returns The referenced Message object, null if deleted, or undefined if not a reply
   *
   * @example
   * ```typescript
   * const referencedMessage = message.referencedMessage;
   * if (referencedMessage === undefined) {
   *   console.log('This message is not a reply');
   * } else if (referencedMessage === null) {
   *   console.log('This message is a reply, but the original message was deleted');
   * } else {
   *   console.log(`This message is replying to: "${referencedMessage.content}"`);
   * }
   * ```
   */
  get referencedMessage(): Message | null | undefined {
    if (!this.data.referenced_message) {
      return null;
    }

    return new Message(
      this.client,
      this.data.referenced_message as MessageCreateEntity,
    );
  }

  /**
   * Gets the interaction that generated this message.
   *
   * @deprecated Use interactionMetadata instead.
   *
   * @returns The interaction object, or undefined if none
   *
   * @example
   * ```typescript
   * // Use interactionMetadata instead of this property
   * const interaction = message.interaction;
   * if (interaction) {
   *   console.log(`Message was triggered by ${interaction.user.username}`);
   * }
   * ```
   */
  get interaction():
    | CamelCasedPropertiesDeep<MessageInteractionEntity>
    | undefined {
    if (!this.data.interaction) {
      return undefined;
    }

    return toCamelCasedPropertiesDeep(this.data.interaction);
  }

  /**
   * Gets the metadata about the interaction that generated this message.
   *
   * This property provides detailed information about application commands,
   * component interactions, or modal submissions that created this message.
   *
   * @returns The interaction metadata, or undefined if none
   *
   * @example
   * ```typescript
   * const metadata = message.interactionMetadata;
   * if (metadata) {
   *   console.log(`Message created by interaction from user: ${metadata.user.username}`);
   *   console.log(`Interaction type: ${metadata.type}`);
   * }
   * ```
   */
  get interactionMetadata():
    | CamelCasedPropertiesDeep<ApplicationCommandInteractionMetadataEntity>
    | CamelCasedPropertiesDeep<MessageComponentInteractionMetadataEntity>
    | CamelCasedPropertiesDeep<ModalSubmitInteractionMetadataEntity>
    | undefined {
    if (!this.data.interaction_metadata) {
      return undefined;
    }

    return toCamelCasedPropertiesDeep(this.data.interaction_metadata);
  }

  /**
   * Gets the resolved data from the interaction that generated this message.
   *
   * Resolved data contains expanded objects like users, members, roles, and channels
   * that were referenced in the interaction.
   *
   * @returns The resolved data, or undefined if none
   *
   * @example
   * ```typescript
   * const resolved = message.resolved;
   * if (resolved?.users) {
   *   console.log('Resolved users:');
   *   for (const [id, user] of Object.entries(resolved.users)) {
   *     console.log(`- ${user.username} (${id})`);
   *   }
   * }
   * ```
   */
  get resolved():
    | CamelCasedProperties<InteractionResolvedDataEntity>
    | undefined {
    if (!this.data.resolved) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.resolved);
  }

  /**
   * Gets the message snapshots associated with this message, if it's a forwarded message.
   *
   * Message snapshots contain copies of messages at the time they were forwarded.
   *
   * @returns An array of message snapshots, or undefined if none
   *
   * @example
   * ```typescript
   * const snapshots = message.messageSnapshots;
   * if (snapshots?.length) {
   *   console.log(`This message contains ${snapshots.length} forwarded messages`);
   *   for (const snapshot of snapshots) {
   *     console.log(`- Content: ${snapshot.message.content}`);
   *   }
   * }
   * ```
   */
  get messageSnapshots():
    | CamelCasedPropertiesDeep<MessageSnapshotEntity>[]
    | undefined {
    return this.data.message_snapshots?.map((snapshot) =>
      toCamelCasedPropertiesDeep(snapshot),
    );
  }

  /**
   * Gets the channel where this message was sent.
   *
   * This property lazily fetches the channel from the client cache or API.
   *
   * @returns A promise resolving to the channel object
   *
   * @example
   * ```typescript
   * try {
   *   const channel = message.channel;
   *   console.log(`Message was sent in channel: ${channel.name}`);
   * } catch (error) {
   *   console.error('Failed to fetch channel:', error);
   * }
   * ```
   */
  get channel(): AnyChannel | undefined {
    return this.client.cache.channels.get(this.channelId);
  }

  /**
   * Gets the Date object for when this message was sent.
   *
   * @returns The Date when this message was created
   *
   * @example
   * ```typescript
   * const createdAt = message.createdAt;
   * console.log(`Message was created on: ${createdAt.toLocaleDateString()}`);
   * ```
   */
  get createdAt(): Date {
    return new Date(this.timestamp);
  }

  /**
   * Gets the Date object for when this message was edited, or null if never edited.
   *
   * @returns The Date when this message was edited, or null
   *
   * @example
   * ```typescript
   * const editedAt = message.editedAt;
   * if (editedAt) {
   *   console.log(`Message was edited on: ${editedAt.toLocaleDateString()}`);
   * } else {
   *   console.log('Message has not been edited');
   * }
   * ```
   */
  get editedAt(): Date | null {
    return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this message was created.
   *
   * @returns The creation timestamp in milliseconds
   *
   * @example
   * ```typescript
   * const timestamp = message.createdTimestamp;
   * console.log(`Message created at timestamp: ${timestamp}`);
   * ```
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Checks if this message was sent by the client user.
   *
   * @returns True if the message author is the client user, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isAuthor) {
   *   console.log('This message was sent by the bot/client');
   * } else {
   *   console.log('This message was sent by someone else');
   * }
   * ```
   */
  get isAuthor(): boolean {
    return this.author.id === this.client.user.id;
  }

  /**
   * Checks if this message was sent by a webhook.
   *
   * @returns True if the message was sent by a webhook, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isWebhook) {
   *   console.log('This message was sent by a webhook');
   * } else {
   *   console.log('This message was sent by a regular user');
   * }
   * ```
   */
  get isWebhook(): boolean {
    return this.webhookId !== undefined;
  }

  /**
   * Checks if this message is a system message.
   *
   * System messages are messages generated by Discord rather than users,
   * such as join messages, pin notifications, etc.
   *
   * @returns True if the message is a system message, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isSystem) {
   *   console.log('This is a system message');
   * } else {
   *   console.log('This is a user message');
   * }
   * ```
   */
  get isSystem(): boolean {
    return this.type !== MessageType.Default && this.type !== MessageType.Reply;
  }

  /**
   * Checks if this message is a reply to another message.
   *
   * @returns True if the message is a reply, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isReply) {
   *   console.log('This message is a reply to another message');
   *   if (message.referencedMessage) {
   *     console.log(`Replying to: "${message.referencedMessage.content}"`);
   *   }
   * }
   * ```
   */
  get isReply(): boolean {
    return this.type === MessageType.Reply || Boolean(this.messageReference);
  }

  /**
   * Checks if this message is a partial message.
   *
   * Partial messages may not have all properties available.
   *
   * @returns True if the message is partial, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isPartial) {
   *   console.log('This message is partial and may need to be fetched fully');
   * }
   * ```
   */
  get isPartial(): boolean {
    return !this.content;
  }

  /**
   * Checks if this message is crossposted (published to subscriber channels).
   *
   * @returns True if the message is crossposted, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isCrossposted) {
   *   console.log('This message has been published to subscriber channels');
   * }
   * ```
   */
  get isCrossposted(): boolean {
    return this.flags.has(MessageFlags.Crossposted);
  }

  /**
   * Checks if this message has a thread associated with it.
   *
   * @returns True if the message has created a thread, false otherwise
   *
   * @example
   * ```typescript
   * if (message.hasThread) {
   *   console.log('This message has a thread associated with it');
   *   console.log(`Thread name: ${message.thread?.name}`);
   * }
   * ```
   */
  get hasThread(): boolean {
    return this.flags.has(MessageFlags.HasThread) || Boolean(this.thread);
  }

  /**
   * Checks if this message is ephemeral (only visible to the interaction user).
   *
   * @returns True if the message is ephemeral, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isEphemeral) {
   *   console.log('This message is ephemeral (only visible to the interaction user)');
   * }
   * ```
   */
  get isEphemeral(): boolean {
    return this.flags.has(MessageFlags.Ephemeral);
  }

  /**
   * Checks if this message is from an interaction.
   *
   * @returns True if the message is from an interaction, false otherwise
   *
   * @example
   * ```typescript
   * if (message.isInteraction) {
   *   console.log('This message was generated by an interaction');
   * }
   * ```
   */
  get isInteraction(): boolean {
    return (
      Boolean(this.data.interaction) || Boolean(this.data.interaction_metadata)
    );
  }

  /**
   * Gets the URL to this message.
   *
   * The URL can be used to link directly to this message in a web browser.
   *
   * @returns The URL to this message
   *
   * @example
   * ```typescript
   * const url = message.url;
   * console.log(`Link to this message: ${url}`);
   * ```
   */
  get url(): string {
    return `https://discord.com/channels/${this.guildId ?? "@me"}/${this.channelId}/${this.id}`;
  }

  /**
   * Gets the age of this message in milliseconds (time since creation).
   *
   * @returns The age in milliseconds
   *
   * @example
   * ```typescript
   * const ageMs = message.age;
   * const ageSec = Math.floor(ageMs / 1000);
   * console.log(`Message is ${ageSec} seconds old`);
   * ```
   */
  get age(): number {
    return Date.now() - this.createdTimestamp;
  }

  /**
   * Replies to this message.
   *
   * This method creates a new message that references this message as a reply.
   *
   * @param options - The content or options for the reply
   * @returns A promise resolving to the sent reply message
   * @throws Error if the message could not be sent
   *
   * @example
   * ```typescript
   * // Simple text reply
   * const reply = await message.reply('Hello, this is a reply!');
   *
   * // Reply with more options
   * const replyWithEmbed = await message.reply({
   *   content: 'Check out this embed:',
   *   embeds: [{
   *     title: 'Example Embed',
   *     description: 'This is an example embed in a reply',
   *     color: 0x0099ff
   *   }]
   * });
   * ```
   */
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

  /**
   * Edits this message.
   *
   * This method can only edit messages sent by the client user.
   *
   * @param options - The new content or options for the message
   * @returns A promise resolving to the edited message
   * @throws Error if the message could not be edited or wasn't sent by the client
   *
   * @example
   * ```typescript
   * try {
   *   // Simple content edit
   *   const edited = await message.edit('This is the new content');
   *
   *   // Edit with more options
   *   const editedWithEmbed = await message.edit({
   *     content: 'Updated content',
   *     embeds: [{
   *       title: 'Updated Embed',
   *       description: 'This embed has been updated'
   *     }]
   *   });
   * } catch (error) {
   *   console.error('Failed to edit message:', error);
   * }
   * ```
   */
  async edit(options: string | EditMessageSchema): Promise<Message> {
    if (!this.isAuthor) {
      throw new Error("Cannot edit messages sent by other users");
    }

    let data = options as EditMessageSchema;
    if (typeof options === "string") {
      data = { content: options };
    }

    const editedMessage = await this.client.rest.messages.updateMessage(
      this.channelId,
      this.id,
      toSnakeCaseProperties(data),
    );

    return new Message(this.client, editedMessage as MessageCreateEntity);
  }

  /**
   * Deletes this message.
   *
   * This method can delete messages sent by the client user, or other messages
   * if the client has the MANAGE_MESSAGES permission.
   *
   * @param reason - The reason for deleting the message (for audit logs)
   * @returns A promise that resolves when the message is deleted
   * @throws Error if the message could not be deleted due to permissions or other issues
   *
   * @example
   * ```typescript
   * try {
   *   // Delete without a reason
   *   await message.delete();
   *
   *   // Delete with a reason (for audit logs)
   *   await message.delete('Inappropriate content');
   * } catch (error) {
   *   console.error('Failed to delete message:', error);
   * }
   * ```
   */
  delete(reason?: string): Promise<void> {
    return this.client.rest.messages.deleteMessage(
      this.channelId,
      this.id,
      reason,
    );
  }

  /**
   * Pins this message to its channel.
   *
   * Pinned messages appear in the channel's pinned messages list.
   *
   * @returns A promise that resolves when the message is pinned
   * @throws Error if the message could not be pinned
   *
   * @example
   * ```typescript
   * try {
   *   await message.pin();
   *   console.log('Message has been pinned');
   * } catch (error) {
   *   console.error('Failed to pin message:', error);
   * }
   * ```
   */
  async pin(): Promise<void> {
    if (this.pinned) {
      return;
    }
    await this.client.rest.channels.pinMessage(this.channelId, this.id);
    return;
  }

  /**
   * Unpins this message from its channel.
   *
   * @returns A promise that resolves when the message is unpinned
   * @throws Error if the message could not be unpinned
   *
   * @example
   * ```typescript
   * try {
   *   await message.unpin();
   *   console.log('Message has been unpinned');
   * } catch (error) {
   *   console.error('Failed to unpin message:', error);
   * }
   * ```
   */
  async unpin(): Promise<void> {
    if (!this.pinned) {
      return;
    }
    await this.client.rest.channels.unpinMessage(this.channelId, this.id);
    return;
  }

  /**
   * Creates a thread from this message.
   *
   * This will create a new thread with this message as the starter message.
   *
   * @param options - The options for the thread, including name and auto-archive duration
   * @param reason - The reason for creating the thread (for audit logs)
   * @returns A promise resolving to the created thread
   * @throws Error if the thread could not be created
   *
   * @example
   * ```typescript
   * try {
   *   const thread = await message.startThread({
   *     name: 'Discussion Thread',
   *     autoArchiveDuration: 60 // 1 hour
   *   });
   *   console.log(`Created thread: ${thread.name}`);
   * } catch (error) {
   *   console.error('Failed to create thread:', error);
   * }
   * ```
   */
  async startThread(
    options: CamelCasedProperties<StartThreadFromMessageSchema>,
    reason?: string,
  ): Promise<AnyThreadChannel> {
    const thread = await this.client.rest.channels.startThreadFromMessage(
      this.channelId,
      this.id,
      toSnakeCaseProperties(options),
      reason,
    );

    return ChannelFactory.createThread(
      this.client,
      thread as AnyThreadChannelEntity,
    );
  }

  /**
   * Reacts to this message with an emoji.
   *
   * @param emoji - The emoji to react with (Unicode emoji or custom emoji in name:id format)
   * @returns A promise that resolves when the reaction is added
   * @throws Error if the reaction could not be added
   *
   * @example
   * ```typescript
   * try {
   *   // React with a Unicode emoji
   *   await message.react('👍');
   *
   *   // React with a custom emoji
   *   await message.react('custom_emoji:123456789012345678');
   * } catch (error) {
   *   console.error('Failed to add reaction:', error);
   * }
   * ```
   */
  react(emoji: string): Promise<void> {
    return this.client.rest.messages.addReaction(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes the client user's reaction from this message.
   *
   * @param emoji - The emoji to remove reaction for
   * @returns A promise that resolves when the reaction is removed
   * @throws Error if the reaction could not be removed
   *
   * @example
   * ```typescript
   * try {
   *   await message.removeReaction('👍');
   *   console.log('Removed your 👍 reaction');
   * } catch (error) {
   *   console.error('Failed to remove reaction:', error);
   * }
   * ```
   */
  removeReaction(emoji: string): Promise<void> {
    return this.client.rest.messages.removeOwnReaction(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes a specific user's reaction from this message.
   *
   * @param emoji - The emoji to remove reaction for
   * @param userId - The ID of the user whose reaction to remove
   * @returns A promise that resolves when the reaction is removed
   * @throws Error if the reaction could not be removed
   *
   * @example
   * ```typescript
   * try {
   *   await message.removeUserReaction('👍', '123456789012345678');
   *   console.log('Removed user\'s 👍 reaction');
   * } catch (error) {
   *   console.error('Failed to remove user reaction:', error);
   * }
   * ```
   */
  removeUserReaction(emoji: string, userId: Snowflake): Promise<void> {
    return this.client.rest.messages.removeUserReaction(
      this.channelId,
      this.id,
      emoji,
      userId,
    );
  }

  /**
   * Removes all reactions of a specific emoji from this message.
   *
   * @param emoji - The emoji to remove all reactions for
   * @returns A promise that resolves when the reactions are removed
   * @throws Error if the reactions could not be removed
   *
   * @example
   * ```typescript
   * try {
   *   await message.removeAllReactionsForEmoji('👍');
   *   console.log('Removed all 👍 reactions');
   * } catch (error) {
   *   console.error('Failed to remove reactions:', error);
   * }
   * ```
   */
  removeAllReactionsForEmoji(emoji: string): Promise<void> {
    return this.client.rest.messages.removeAllReactionsForEmoji(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes all reactions from this message.
   *
   * @returns A promise that resolves when all reactions are removed
   * @throws Error if the reactions could not be removed
   *
   * @example
   * ```typescript
   * try {
   *   await message.removeAllReactions();
   *   console.log('Removed all reactions from the message');
   * } catch (error) {
   *   console.error('Failed to remove all reactions:', error);
   * }
   * ```
   */
  removeAllReactions(): Promise<void> {
    return this.client.rest.messages.removeAllReactions(
      this.channelId,
      this.id,
    );
  }

  /**
   * Fetches users who reacted to this message with a specific emoji.
   *
   * @param emoji - The emoji to get reactions for
   * @param options - Options for pagination and reaction type filtering
   * @returns A promise resolving to an array of user objects
   * @throws Error if the reaction users could not be fetched
   *
   * @example
   * ```typescript
   * try {
   *   // Get first 25 users who reacted with 👍
   *   const users = await message.fetchReactionUsers('👍');
   *   console.log(`${users.length} users reacted with 👍`);
   *
   *   // Get users with pagination
   *   const moreUsers = await message.fetchReactionUsers('👍', {
   *     limit: 50,
   *     after: users[users.length - 1].id
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch reaction users:', error);
   * }
   * ```
   */
  async fetchReactionUsers(
    emoji: string,
    options?: GetReactionsQuerySchema,
  ): Promise<User[]> {
    const users = await this.client.rest.messages.fetchReactionUsers(
      this.channelId,
      this.id,
      emoji,
      options,
    );

    return users.map((user) => new User(this.client, user));
  }

  /**
   * Fetches this message from the API to get the most current data.
   *
   * This is useful when you need to ensure you have the latest version of the message.
   *
   * @returns A promise resolving to the refreshed message
   * @throws Error if the message could not be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const freshMessage = await message.fetch();
   *   console.log('Message data refreshed from the API');
   * } catch (error) {
   *   console.error('Failed to fetch message:', error);
   * }
   * ```
   */
  async fetch(): Promise<Message> {
    const messageData = await this.client.rest.messages.fetchMessage(
      this.channelId,
      this.id,
    );

    return new Message(this.client, messageData as MessageCreateEntity);
  }

  /**
   * Crossposts (publishes) this message to all channels following the channel.
   *
   * This only works in announcement channels.
   *
   * @returns A promise resolving to the crossposted message
   * @throws Error if the message could not be crossposted
   *
   * @example
   * ```typescript
   * try {
   *   const publishedMessage = await message.crosspost();
   *   console.log('Message has been published to all following channels');
   * } catch (error) {
   *   console.error('Failed to crosspost message:', error);
   * }
   * ```
   */
  async crosspost(): Promise<Message> {
    const publishedMessage = await this.client.rest.messages.publishMessage(
      this.channelId,
      this.id,
    );

    return new Message(this.client, publishedMessage as MessageCreateEntity);
  }

  /**
   * Suppresses or unsuppresses embeds in this message.
   *
   * @param suppress - Whether to suppress embeds (true) or unsuppress them (false)
   * @returns A promise resolving to the updated message
   * @throws Error if the embeds could not be suppressed
   *
   * @example
   * ```typescript
   * try {
   *   // Suppress embeds
   *   const suppressedMessage = await message.suppressEmbeds(true);
   *   console.log('Embeds are now hidden');
   *
   *   // Unsuppress embeds
   *   const unsuppressedMessage = await message.suppressEmbeds(false);
   *   console.log('Embeds are now visible');
   * } catch (error) {
   *   console.error('Failed to change embed visibility:', error);
   * }
   * ```
   */
  suppressEmbeds(suppress = true): Promise<Message> {
    const flags = new BitField<MessageFlags>(this.flags.valueOf());

    if (suppress) {
      flags.add(MessageFlags.SuppressEmbeds);
    } else {
      flags.remove(MessageFlags.SuppressEmbeds);
    }

    return this.edit({
      flags: Number(flags.valueOf()) as MessageFlags,
    });
  }

  /**
   * Creates a formatted link to this message.
   *
   * @param text - The display text for the link
   * @returns The formatted markdown link
   *
   * @example
   * ```typescript
   * const messageLink = message.createMessageLink('Click here to see the message');
   * await channel.send(messageLink);
   * ```
   */
  createMessageLink(text: string): string {
    return link(text, this.url);
  }
}
