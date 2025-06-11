import {
  type AnyThreadBasedChannelEntity,
  type ApplicationEntity,
  BitField,
  type EmojiEntity,
  type GuildMemberEntity,
  type Link,
  type MessageEntity,
  MessageFlags,
  MessageReferenceType,
  MessageType,
  type Snowflake,
  link,
} from "@nyxojs/core";
import type {
  MessageCreateEntity,
  MessageReactionAddEntity,
  MessageReactionRemoveAllEntity,
  MessageReactionRemoveEmojiEntity,
  MessageReactionRemoveEntity,
} from "@nyxojs/gateway";
import type {
  CreateMessageSchema,
  EditMessageSchema,
  ReactionsFetchParams,
  ThreadFromMessageCreateOptions,
} from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased, PropsToCamel } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import { Application } from "./application.class.js";
import type { AnyThreadChannel } from "./channel.class.js";
import { Emoji } from "./emoji.class.js";
import { GuildMember } from "./guild.class.js";
import { Sticker, StickerItem } from "./sticker.class.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Message Reaction Add/Remove event, providing methods to interact with reaction events.
 *
 * The MessageReaction class serves as a wrapper around Discord's Reaction Gateway events,
 * which track when users add or remove reactions from messages. It provides:
 * - Access to reaction information (user, emoji, message, etc.)
 * - Methods to manage reactions (remove, get reactors)
 * - Utilities for emoji formatting and reaction analysis
 *
 * This is used for both message_reaction_add and message_reaction_remove Gateway events.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add}
 */
export class MessageReaction
  extends BaseClass<MessageReactionAddEntity | MessageReactionRemoveEntity>
  implements Enforce<PropsToCamel<MessageReactionAddEntity>>
{
  /**
   * Gets the ID of the user who added or removed the reaction.
   *
   * This identifies which user performed the reaction action.
   *
   * @returns The user's ID as a Snowflake string
   */
  readonly userId = this.rawData.user_id;

  /**
   * Gets the ID of the channel containing the message.
   *
   * This identifies which channel contains the reacted message.
   *
   * @returns The channel's ID as a Snowflake string
   */
  readonly channelId = this.rawData.channel_id;

  /**
   * Gets the ID of the message that received the reaction.
   *
   * This identifies which message was reacted to.
   *
   * @returns The message's ID as a Snowflake string
   */
  readonly messageId = this.rawData.message_id;

  /**
   * Gets the ID of the guild containing the message.
   *
   * This identifies which guild the message belongs to, if applicable.
   * May be undefined for reactions in DM channels.
   *
   * @returns The guild's ID as a Snowflake string, or undefined for DMs
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the emoji information for the reaction.
   *
   * Contains the ID, name, and animated status of the emoji.
   *
   * @returns The emoji object
   */
  readonly emoji = new Emoji(this.client, {
    ...(this.rawData.emoji as EmojiEntity),
    guild_id: this.guildId as Snowflake,
  });

  /**
   * Indicates whether this is a super-reaction (Nitro burst reaction).
   *
   * @returns True if this is a super-reaction, false otherwise
   */
  readonly burst = this.rawData.burst;

  /**
   * Gets the type of the reaction.
   *
   * Identifies the reaction's category (standard, super, etc.).
   *
   * @returns The reaction type
   */
  readonly type = this.rawData.type;

  /**
   * Gets the array of hexadecimal color codes used for super-reaction animation.
   *
   * Each color is in "#rrggbb" format. Only present for super-reactions.
   *
   * @returns Array of color strings, or undefined if not a super-reaction
   */
  readonly burstColors =
    "burst_colors" in this.rawData ? this.rawData.burst_colors : undefined;

  /**
   * Gets the ID of the user who authored the message which was reacted to.
   *
   * Useful for tracking reactions to specific users' messages.
   *
   * @returns The message author's ID, or undefined if not available
   */
  readonly messageAuthorId =
    "message_author_id" in this.rawData
      ? this.rawData.message_author_id
      : undefined;

  /**
   * Gets the guild member object for the user who added the reaction.
   *
   * Only present for reactions in guild channels.
   *
   * @returns The GuildMember object, or undefined if not available
   */
  get member(): GuildMember | undefined {
    if (!("member" in this.rawData && this.rawData.member && this.guildId)) {
      return undefined;
    }

    // Add the guild_id to the member since it's missing in the raw data
    const memberWithGuild: GuildBased<GuildMemberEntity> = {
      ...this.rawData.member,
      guild_id: this.guildId,
    };

    return new GuildMember(this.client, memberWithGuild);
  }

  /**
   * Fetches the message that was reacted to.
   *
   * @returns A promise resolving to the Message object
   * @throws Error if the message couldn't be fetched
   */
  async fetchMessage(): Promise<Message> {
    const messageData = await this.client.rest.messages.fetchMessage(
      this.channelId,
      this.messageId,
    );

    return new Message(this.client, messageData);
  }

  /**
   * Fetches the user who added/removed the reaction.
   *
   * @returns A promise resolving to the User object
   * @throws Error if the user couldn't be fetched
   */
  async fetchUser(): Promise<User> {
    const userData = await this.client.rest.users.fetchUser(this.userId);
    return new User(this.client, userData);
  }

  /**
   * Fetches all users who have reacted with the same emoji.
   *
   * @param params - Query parameters for pagination and filtering
   * @returns A promise resolving to an array of User objects who reacted with this emoji
   * @throws Error if the users couldn't be fetched
   */
  async fetchReactionUsers(params?: ReactionsFetchParams): Promise<User[]> {
    // Convert the emoji object to a URL-encoded string format
    const emojiString = this.emoji.id
      ? `${this.emoji.name}:${this.emoji.id}`
      : encodeURIComponent(this.emoji.name || "");

    const users = await this.client.rest.messages.fetchReactionUsers(
      this.channelId,
      this.messageId,
      emojiString,
      params,
    );

    return users.map((userData) => new User(this.client, userData));
  }

  /**
   * Removes this specific reaction from the message.
   *
   * If called without parameters, removes the current user's reaction.
   * If a userId is provided, removes that user's reaction (requires MANAGE_MESSAGES permission).
   *
   * @param userId - Optional user ID to remove reaction for
   * @returns A promise that resolves when the reaction is removed
   * @throws Error if the reaction couldn't be removed
   */
  removeReaction(userId?: Snowflake): Promise<void> {
    // Convert the emoji object to a URL-encoded string format
    const emojiString = this.emoji.id
      ? `${this.emoji.name}:${this.emoji.id}`
      : encodeURIComponent(this.emoji.name || "");

    if (userId) {
      return this.client.rest.messages.removeUserReaction(
        this.channelId,
        this.messageId,
        emojiString,
        userId,
      );
    }
    return this.client.rest.messages.removeOwnReaction(
      this.channelId,
      this.messageId,
      emojiString,
    );
  }

  /**
   * Removes all reactions of this emoji from the message.
   *
   * @returns A promise that resolves when the reactions are removed
   * @throws Error if the reactions couldn't be removed
   */
  removeAllReactionsForEmoji(): Promise<void> {
    // Convert the emoji object to a URL-encoded string format
    const emojiString = this.emoji.id
      ? `${this.emoji.name}:${this.emoji.id}`
      : encodeURIComponent(this.emoji.name || "");

    return this.client.rest.messages.removeEmojiReactions(
      this.channelId,
      this.messageId,
      emojiString,
    );
  }

  /**
   * Adds the current user's reaction with the same emoji.
   *
   * This allows the bot to add the same reaction that was observed.
   *
   * @returns A promise that resolves when the reaction is added
   * @throws Error if the reaction couldn't be added
   */
  react(): Promise<void> {
    // Convert the emoji object to a URL-encoded string format
    const emojiString = this.emoji.id
      ? `${this.emoji.name}:${this.emoji.id}`
      : encodeURIComponent(this.emoji.name || "");

    return this.client.rest.messages.addReaction(
      this.channelId,
      this.messageId,
      emojiString,
    );
  }
}

/**
 * Represents a Discord Message Reaction Remove All event, providing methods for bulk reaction removals.
 *
 * This class handles events when all reactions are removed from a message at once.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all}
 */
export class MessageReactionRemoveAll
  extends BaseClass<MessageReactionRemoveAllEntity>
  implements Enforce<PropsToCamel<MessageReactionRemoveAllEntity>>
{
  /**
   * Gets the ID of the channel containing the message.
   *
   * This identifies which channel contains the message.
   *
   * @returns The channel's ID as a Snowflake string
   */
  readonly channelId = this.rawData.channel_id;

  /**
   * Gets the ID of the message that had all reactions removed.
   *
   * This identifies which message had its reactions cleared.
   *
   * @returns The message's ID as a Snowflake string
   */
  readonly messageId = this.rawData.message_id;

  /**
   * Gets the ID of the guild containing the message.
   *
   * This identifies which guild the message belongs to, if applicable.
   * May be undefined for messages in DM channels.
   *
   * @returns The guild's ID as a Snowflake string, or undefined for DMs
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Fetches the message that had all reactions removed.
   *
   * @returns A promise resolving to the Message object
   * @throws Error if the message couldn't be fetched
   */
  async fetchMessage(): Promise<Message> {
    const messageData = await this.client.rest.messages.fetchMessage(
      this.channelId,
      this.messageId,
    );

    return new Message(this.client, messageData);
  }
}

/**
 * Represents a Discord Message Reaction Remove Emoji event, handling removal of a specific emoji type.
 *
 * This class handles events when all reactions of a specific emoji are removed from a message.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji}
 */
export class MessageReactionRemoveEmoji
  extends BaseClass<MessageReactionRemoveEmojiEntity>
  implements Enforce<PropsToCamel<MessageReactionRemoveEmojiEntity>>
{
  /**
   * Gets the ID of the channel containing the message.
   *
   * This identifies which channel contains the message.
   *
   * @returns The channel's ID as a Snowflake string
   */
  readonly channelId = this.rawData.channel_id;

  /**
   * Gets the ID of the guild containing the message.
   *
   * This identifies which guild the message belongs to, if applicable.
   * May be undefined for messages in DM channels.
   *
   * @returns The guild's ID as a Snowflake string, or undefined for DMs
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the ID of the message that had reactions removed.
   *
   * This identifies which message had its reactions modified.
   *
   * @returns The message's ID as a Snowflake string
   */
  readonly messageId = this.rawData.message_id;

  /**
   * Gets the partial emoji object for the removed emoji.
   *
   * Contains only the essential information needed to identify the emoji.
   *
   * @returns The partial emoji object
   */
  readonly emoji = new Emoji(this.client, {
    ...(this.rawData.emoji as EmojiEntity),
    guild_id: this.guildId as Snowflake,
  });

  /**
   * Fetches the message that had reactions removed.
   *
   * @returns A promise resolving to the Message object
   * @throws Error if the message couldn't be fetched
   */
  async fetchMessage(): Promise<Message> {
    const messageData = await this.client.rest.messages.fetchMessage(
      this.channelId,
      this.messageId,
    );

    return new Message(this.client, messageData);
  }
}

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
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
@Cacheable("messages")
export class Message
  extends BaseClass<MessageEntity | MessageCreateEntity>
  implements Enforce<PropsToCamel<MessageCreateEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this message.
   *
   * This ID is permanent and will not change for the lifetime of the message.
   * It can be used for API operations, referencing in replies, and persistent storage.
   *
   * @returns The message's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the ID of the guild (server) where this message was sent.
   *
   * This property will be undefined for DM messages since they don't belong to any guild.
   *
   * @returns The guild ID, or undefined if the message was sent in a DM
   */
  readonly guildId =
    "guild_id" in this.rawData ? this.rawData.guild_id : undefined;

  /**
   * Gets the GuildMember object for the author of this message in the context of the guild.
   *
   * This property provides additional information about the message author specific to the guild,
   * such as their nickname, roles, and join date. It will be undefined for DM messages or
   * when the member data is not available.
   *
   * @returns The GuildMember object, or undefined if not available
   */
  readonly member =
    "member" in this.rawData
      ? new GuildMember(this.client, {
          ...(this.rawData.member as GuildMemberEntity),
          user: this.rawData.author,
          guild_id: this.guildId as Snowflake,
        })
      : undefined;

  /**
   * Gets the ID of the channel where this message was sent.
   *
   * This ID uniquely identifies the channel and can be used for API operations.
   *
   * @returns The channel's ID as a Snowflake string
   */
  readonly channelId = this.rawData.channel_id;

  /**
   * Gets the User object for the author of this message.
   *
   * This provides information about the user who sent the message, such as
   * their username, discriminator, and avatar.
   *
   * @returns The User object for the message author
   */
  readonly author = new User(this.client, this.rawData.author);

  /**
   * Gets the text content of the message.
   *
   * This is the actual textual content of the message, which may include
   * markdown formatting, mentions, emoji, etc.
   *
   * @returns The message content as a string
   */
  readonly content = this.rawData.content;

  /**
   * Gets the timestamp when this message was sent.
   *
   * The timestamp is in ISO8601 format.
   *
   * @returns The message creation timestamp as a string
   */
  readonly timestamp = this.rawData.timestamp;

  /**
   * Gets the timestamp when this message was last edited, or null if it was never edited.
   *
   * The timestamp is in ISO8601 format.
   *
   * @returns The message edit timestamp as a string, or null
   */
  readonly editedTimestamp = this.rawData.edited_timestamp;

  /**
   * Checks if this message was sent as a text-to-speech message.
   *
   * TTS messages are read aloud to users in the channel who have text-to-speech enabled.
   *
   * @returns True if the message is TTS, false otherwise
   */
  readonly tts = Boolean(this.rawData.tts);

  /**
   * Checks if this message mentions everyone in the channel.
   *
   * This will be true if the message contains @everyone or @here mentions.
   *
   * @returns True if the message mentions everyone, false otherwise
   */
  readonly mentionEveryone = Boolean(this.rawData.mention_everyone);

  /**
   * Gets an array of users or guild members mentioned in this message.
   *
   * For guild messages, this may include GuildMember objects with additional
   * guild-specific information about the mentioned users.
   *
   * @returns An array of User or GuildMember objects, or undefined if none
   */
  readonly mentions = this.rawData.mentions?.map((mention) => {
    if ("id" in mention) {
      return new User(this.client, mention);
    }

    return new GuildMember(this.client, {
      ...(mention as GuildMemberEntity),
      guild_id: this.guildId as Snowflake,
    });
  });

  /**
   * Gets an array of role IDs that were mentioned in this message.
   *
   * These are the IDs of roles that were mentioned using the @role syntax.
   *
   * @returns An array of role IDs
   */
  readonly mentionRoles = this.rawData.mention_roles;

  /**
   * Gets an array of attachments included with this message.
   *
   * Attachments are files (images, documents, etc.) that are uploaded with a message.
   *
   * @returns An array of attachment objects
   */
  readonly attachments = this.rawData.attachments;

  /**
   * Gets an array of embeds included with this message.
   *
   * Embeds are rich content displays that can include formatted text, images,
   * and other media.
   *
   * @returns An array of embed objects
   */
  readonly embeds = this.rawData.embeds;

  /**
   * Checks if this message is pinned in its channel.
   *
   * Pinned messages appear in the pinned messages list of the channel.
   *
   * @returns True if the message is pinned, false otherwise
   */
  readonly pinned = Boolean(this.rawData.pinned);

  /**
   * Gets the type of this message.
   *
   * The message type determines how the message is displayed and what content it has.
   *
   * @returns The message type as a MessageType enum value
   */
  readonly type = this.rawData.type;

  /**
   * Gets an array of channels that were mentioned in this message.
   *
   * These are channels that were mentioned using the #channel syntax.
   *
   * @returns An array of channel mention objects, or undefined if none
   */
  readonly mentionChannels = this.rawData.mention_channels;

  /**
   * Gets an array of reactions to this message.
   *
   * Reactions are emoji that users have added to the message as quick responses.
   *
   * @returns An array of reaction objects, or undefined if none
   */
  readonly reactions = this.rawData.reactions;

  /**
   * Gets the nonce of this message, which is a custom identifier used for validation.
   *
   * The nonce can be used to verify that a message was successfully sent.
   *
   * @returns The nonce as a string or number, or undefined if none
   */
  readonly nonce = this.rawData.nonce;

  /**
   * Gets the webhook ID that sent this message, if it was sent by a webhook.
   *
   * @returns The webhook ID, or undefined if not sent by a webhook
   */
  readonly webhookId = this.rawData.webhook_id;

  /**
   * Gets the activity associated with this message, if any.
   *
   * Activities are typically used with Rich Presence-related chat embeds.
   *
   * @returns The activity object, or undefined if none
   */
  readonly activity = this.rawData.activity;

  /**
   * Gets the application associated with this message, if any.
   *
   * This is typically present for Rich Presence-related messages.
   *
   * @returns The Application object, or undefined if none
   */
  readonly application = this.rawData.application
    ? new Application(
        this.client,
        this.rawData.application as ApplicationEntity,
      )
    : undefined;

  /**
   * Gets the application ID associated with this message, if any.
   *
   * This is present for messages sent by interactions or application-owned webhooks.
   *
   * @returns The application ID, or undefined if none
   */
  readonly applicationId = this.rawData.application_id;

  /**
   * Gets the flags associated with this message as a BitField.
   *
   * Message flags control various behaviors and display properties of the message.
   *
   * @returns A BitField of message flags
   */
  readonly flags = new BitField<MessageFlags>(this.rawData.flags ?? 0n);

  /**
   * Gets the components (buttons, select menus, etc.) attached to this message.
   *
   * Components are interactive elements that users can interact with.
   *
   * @returns An array of action row components, or undefined if none
   */
  readonly components = this.rawData.components;

  /**
   * Gets the sticker items attached to this message.
   *
   * Stickers are small, expressive images that users can attach to messages.
   *
   * @returns An array of StickerItem objects, or undefined if none
   */
  readonly stickerItems = this.rawData.sticker_items?.map(
    (stickerItem) => new StickerItem(this.client, stickerItem),
  );

  /**
   * Gets the stickers attached to this message.
   *
   * @deprecated Use stickerItems instead.
   *
   * @returns An array of Sticker objects, or undefined if none
   */
  readonly stickers = this.rawData.stickers?.map(
    (sticker) => new Sticker(this.client, sticker),
  );

  /**
   * Gets the approximate position of this message in a thread.
   *
   * This is only meaningful for messages in threads.
   *
   * @returns The message position as a number, or undefined if not applicable
   */
  readonly position = this.rawData.position;

  /**
   * Gets the role subscription data for this message, if it's a role subscription purchase event.
   *
   * This is only present for messages related to premium role subscriptions.
   *
   * @returns The role subscription data, or undefined if not applicable
   */
  readonly roleSubscriptionData = this.rawData.role_subscription_data;

  /**
   * Gets the poll attached to this message, if any.
   *
   * Polls are interactive voting elements that users can participate in.
   *
   * @returns The poll object, or undefined if none
   */
  readonly poll = this.rawData.poll;

  /**
   * Gets the call information associated with this message, if it's a call message.
   *
   * This is only present for messages related to Discord calls.
   *
   * @returns The call object, or undefined if not applicable
   */
  readonly call = this.rawData.call;

  /**
   * Gets the message reference for this message, if it's a reply or crosspost.
   *
   * The message reference contains information about the original message being referenced.
   *
   * @returns The message reference object, or undefined if not applicable
   */
  readonly messageReference = this.rawData.message_reference;

  /**
   * Gets the thread associated with this message, if it created a thread.
   *
   * This is only present for messages that have created threads.
   *
   * @returns The thread channel object, or undefined if not applicable
   */
  readonly thread = this.rawData.thread
    ? (channelFactory(this.client, this.rawData.thread) as AnyThreadChannel)
    : undefined;

  /**
   * Gets the interaction that generated this message.
   *
   * @deprecated Use interactionMetadata instead.
   *
   * @returns The interaction object, or undefined if none
   */
  readonly interaction = this.rawData.interaction;

  /**
   * Gets the metadata about the interaction that generated this message.
   *
   * This property provides detailed information about application commands,
   * component interactions, or modal submissions that created this message.
   *
   * @returns The interaction metadata, or undefined if none
   */
  readonly interactionMetadata = this.rawData.interaction_metadata;

  /**
   * Gets the resolved data from the interaction that generated this message.
   *
   * Resolved data contains expanded objects like users, members, roles, and channels
   * that were referenced in the interaction.
   *
   * @returns The resolved data, or undefined if none
   */
  readonly resolved = this.rawData.resolved;

  /**
   * Gets the message snapshots associated with this message, if it's a forwarded message.
   *
   * Message snapshots contain copies of messages at the time they were forwarded.
   *
   * @returns An array of message snapshots, or undefined if none
   */
  readonly messageSnapshots = this.rawData.message_snapshots;

  /**
   * Gets the channel where this message was sent.
   *
   * This property lazily fetches the channel from the client cache or API.
   *
   * @returns A promise resolving to the channel object
   */
  readonly channel = this.client.cache.channels?.get(this.channelId);

  /**
   * Gets the referenced message for this message, if it's a reply.
   *
   * This is the message being replied to. It can be null if the original message
   * was deleted, or undefined if this message is not a reply.
   *
   * @returns The referenced Message object, null if deleted, or undefined if not a reply
   */
  get referencedMessage(): Message | null | undefined {
    return this.rawData.referenced_message
      ? new Message(
          this.client,
          this.rawData.referenced_message as MessageCreateEntity,
        )
      : undefined;
  }

  /**
   * Gets the Date object for when this message was sent.
   *
   * @returns The Date when this message was created
   */
  get createdAt(): Date {
    return new Date(this.timestamp);
  }

  /**
   * Gets the Date object for when this message was edited, or null if never edited.
   *
   * @returns The Date when this message was edited, or null
   */
  get editedAt(): Date | null {
    return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this message was created.
   *
   * @returns The creation timestamp in milliseconds
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Checks if this message was sent by the client user.
   *
   * @returns True if the message author is the client user, false otherwise
   */
  get isAuthor(): boolean {
    return this.author.id === this.client.user.id;
  }

  /**
   * Checks if this message was sent by a webhook.
   *
   * @returns True if the message was sent by a webhook, false otherwise
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
   */
  get isSystem(): boolean {
    return this.type !== MessageType.Default && this.type !== MessageType.Reply;
  }

  /**
   * Checks if this message is a reply to another message.
   *
   * @returns True if the message is a reply, false otherwise
   */
  get isReply(): boolean {
    return this.type === MessageType.Reply || Boolean(this.messageReference);
  }

  /**
   * Checks if this message is crossposted (published to subscriber channels).
   *
   * @returns True if the message is crossposted, false otherwise
   */
  get isCrossposted(): boolean {
    return this.flags.has(MessageFlags.Crossposted);
  }

  /**
   * Checks if this message has a thread associated with it.
   *
   * @returns True if the message has created a thread, false otherwise
   */
  get hasThread(): boolean {
    return this.flags.has(MessageFlags.HasThread) || Boolean(this.thread);
  }

  /**
   * Checks if this message is ephemeral (only visible to the interaction user).
   *
   * @returns True if the message is ephemeral, false otherwise
   */
  get isEphemeral(): boolean {
    return this.flags.has(MessageFlags.Ephemeral);
  }

  /**
   * Checks if this message is from an interaction.
   *
   * @returns True if the message is from an interaction, false otherwise
   */
  get isInteraction(): boolean {
    return (
      Boolean(this.rawData.interaction) ||
      Boolean(this.rawData.interaction_metadata)
    );
  }

  /**
   * Gets the URL to this message.
   *
   * The URL can be used to link directly to this message in a web browser.
   *
   * @returns The URL to this message
   */
  get url(): string {
    return `https://discord.com/channels/${this.guildId ?? "@me"}/${this.channelId}/${this.id}`;
  }

  /**
   * Gets the age of this message in milliseconds (time since creation).
   *
   * @returns The age in milliseconds
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
      data,
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
   */
  deleteMessage(reason?: string): Promise<void> {
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
   */
  async pin(): Promise<this> {
    if (this.pinned) {
      return this;
    }

    await this.client.rest.channels.pinMessage(this.channelId, this.id);
    this.patch({
      pinned: true,
    });
    return this;
  }

  /**
   * Unpins this message from its channel.
   *
   * @returns A promise that resolves when the message is unpinned
   * @throws Error if the message could not be unpinned
   */
  async unpin(): Promise<this> {
    if (!this.pinned) {
      return this;
    }

    await this.client.rest.channels.unpinMessage(this.channelId, this.id);
    this.patch({
      pinned: false,
    });
    return this;
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
   */
  async startThread(
    options: ThreadFromMessageCreateOptions,
    reason?: string,
  ): Promise<AnyThreadChannel> {
    const thread = await this.client.rest.channels.createThreadFromMessage(
      this.channelId,
      this.id,
      options,
      reason,
    );

    return channelFactory(
      this.client,
      thread as AnyThreadBasedChannelEntity,
    ) as AnyThreadChannel;
  }

  /**
   * Reacts to this message with an emoji.
   *
   * @param emoji - The emoji to react with (Unicode emoji or custom emoji in name:id format)
   * @returns A promise that resolves when the reaction is added
   * @throws Error if the reaction could not be added
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
   */
  removeAllReactionsForEmoji(emoji: string): Promise<void> {
    return this.client.rest.messages.removeEmojiReactions(
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
   */
  async fetchReactionUsers(
    emoji: string,
    options?: ReactionsFetchParams,
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
   */
  async fetch(): Promise<Message> {
    const messageData = await this.client.rest.messages.fetchMessage(
      this.channelId,
      this.id,
    );
    this.patch(messageData as MessageCreateEntity);
    return this;
  }

  /**
   * Crossposts (publishes) this message to all channels following the channel.
   *
   * This only works in announcement channels.
   *
   * @returns A promise resolving to the crossposted message
   * @throws Error if the message could not be crossposted
   */
  async crosspost(): Promise<Message> {
    const publishedMessage = await this.client.rest.messages.crosspostMessage(
      this.channelId,
      this.id,
    );
    this.patch(publishedMessage as MessageCreateEntity);
    return this;
  }

  /**
   * Suppresses or unsuppresses embeds in this message.
   *
   * @param suppress - Whether to suppress embeds (true) or unsuppress them (false)
   * @returns A promise resolving to the updated message
   * @throws Error if the embeds could not be suppressed
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
   */
  createMessageLink(text: string): Link {
    return link(text, this.url);
  }
}
