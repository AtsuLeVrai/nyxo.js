import {
  type ActionRowEntity,
  type AnyChannelEntity,
  type AnyThreadChannelEntity,
  type ApplicationCommandInteractionMetadataEntity,
  type ApplicationEntity,
  type AttachmentEntity,
  type ChannelMentionEntity,
  type EmbedEntity,
  type EmojiEntity,
  type GuildMemberEntity,
  type InteractionResolvedDataEntity,
  type MessageActivityEntity,
  type MessageCallEntity,
  type MessageComponentInteractionMetadataEntity,
  type MessageEntity,
  type MessageFlags,
  type MessageReferenceEntity,
  MessageReferenceType,
  type MessageSnapshotEntity,
  MessageType,
  type ModalSubmitInteractionMetadataEntity,
  type PollEntity,
  type ReactionEntity,
  type RoleSubscriptionDataEntity,
  type Snowflake,
  type StickerEntity,
  type StickerItemEntity,
  type UserEntity,
} from "@nyxjs/core";
import type {
  MessageCreateEntity,
  MessageReactionAddEntity,
} from "@nyxjs/gateway";
import type {
  CreateMessageSchema,
  EditMessageSchema,
  ReactionTypeFlag,
} from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a Discord message.
 *
 * This class provides methods for interacting with message objects,
 * including retrieving message information, editing, deleting, and managing reactions.
 *
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
export class Message extends BaseClass<MessageCreateEntity> {
  /**
   * ID of the message
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * ID of the channel the message was sent in
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  /**
   * The author of this message
   */
  get author(): UserEntity {
    return this.data.author;
  }

  /**
   * Contents of the message
   */
  get content(): string {
    return this.data.content;
  }

  /**
   * When this message was sent
   */
  get timestamp(): string {
    return this.data.timestamp;
  }

  /**
   * When this message was edited (null if never)
   */
  get editedTimestamp(): string | null {
    return this.data.edited_timestamp;
  }

  /**
   * Whether this was a TTS message
   */
  get tts(): boolean {
    return Boolean(this.data.tts);
  }

  /**
   * Whether this message mentions everyone
   */
  get mentionEveryone(): boolean {
    return Boolean(this.data.mention_everyone);
  }

  /**
   * Users specifically mentioned in the message
   */
  get mentions(): (UserEntity | Partial<GuildMemberEntity>)[] {
    return this.data.mentions || [];
  }

  /**
   * Roles specifically mentioned in this message
   */
  get mentionRoles(): Snowflake[] {
    return this.data.mention_roles || [];
  }

  /**
   * Any attached files
   */
  get attachments(): AttachmentEntity[] {
    return this.data.attachments || [];
  }

  /**
   * Any embedded content
   */
  get embeds(): EmbedEntity[] {
    return this.data.embeds || [];
  }

  /**
   * Whether this message is pinned
   */
  get pinned(): boolean {
    return Boolean(this.data.pinned);
  }

  /**
   * Type of message
   */
  get type(): MessageType {
    return this.data.type;
  }

  /**
   * ID of the guild the message was sent in - unless it is an ephemeral message
   */
  get guildId(): Snowflake | null {
    return this.data.guild_id || null;
  }

  /**
   * Member properties for this message's author
   */
  get member(): Partial<GuildMemberEntity> | null {
    return this.data.member || null;
  }

  /**
   * Message flags combined as a bitfield
   */
  get flags(): MessageFlags | null {
    return this.data.flags || null;
  }

  /**
   * Components in the message (buttons, select menus, etc.)
   */
  get components(): ActionRowEntity[] | null {
    return this.data.components || null;
  }

  /**
   * Sticker items sent with the message
   */
  get stickerItems(): StickerItemEntity[] | null {
    return this.data.sticker_items || null;
  }

  /**
   * @deprecated The stickers sent with the message
   */
  get stickers(): StickerEntity[] | null {
    return this.data.stickers || null;
  }

  /**
   * Approximate position of the message in a thread
   */
  get position(): number | null {
    return this.data.position || null;
  }

  /**
   * Data from a role subscription purchase event
   */
  get roleSubscriptionData(): RoleSubscriptionDataEntity | null {
    return this.data.role_subscription_data || null;
  }

  /**
   * Poll data if this message contains a poll
   */
  get poll(): PollEntity | null {
    return this.data.poll || null;
  }

  /**
   * Call data if this message is a call
   */
  get call(): MessageCallEntity | null {
    return this.data.call || null;
  }

  /**
   * Data showing the source of a crosspost, channel follow add, pin, or reply message
   */
  get messageReference(): MessageReferenceEntity | null {
    return this.data.message_reference || null;
  }

  /**
   * Metadata about the interaction that generated this message
   */
  get interactionMetadata():
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity
    | null {
    return this.data.interaction_metadata || null;
  }

  /**
   * Thread associated with this message
   */
  get thread(): AnyThreadChannelEntity | null {
    return this.data.thread || null;
  }

  /**
   * Metadata about the interaction that generated this message
   */
  get resolved(): InteractionResolvedDataEntity | null {
    return this.data.resolved || null;
  }

  /**
   * For messages with type Forward, contains the message snapshots
   */
  get messageSnapshots(): MessageSnapshotEntity[] | null {
    return this.data.message_snapshots || null;
  }

  /**
   * The message associated with the message_reference
   */
  get referencedMessage(): MessageEntity | null {
    return this.data.referenced_message || null;
  }

  /**
   * Channels specifically mentioned in this message
   */
  get mentionChannels(): ChannelMentionEntity[] | null {
    return this.data.mention_channels || null;
  }

  /**
   * Reactions to the message
   */
  get reactions(): ReactionEntity[] | null {
    return this.data.reactions || null;
  }

  /**
   * Used for validating a message was sent
   */
  get nonce(): string | number | null {
    return this.data.nonce || null;
  }

  /**
   * If the message is generated by a webhook, this is the webhook's ID
   */
  get webhookId(): Snowflake | null {
    return this.data.webhook_id || null;
  }

  /**
   * Sent with Rich Presence-related chat embeds
   */
  get activity(): MessageActivityEntity | null {
    return this.data.activity || null;
  }

  /**
   * Sent with Rich Presence-related chat embeds
   */
  get application(): Partial<ApplicationEntity> | null {
    return this.data.application || null;
  }

  /**
   * If the message is an Interaction or application-owned webhook, this is the ID of the application
   */
  get applicationId(): Snowflake | null {
    return this.data.application_id || null;
  }

  /**
   * Edits the message content or properties
   * Can only edit your own messages unless you have MANAGE_MESSAGES permission
   *
   * @param options - Options for editing the message
   * @returns Promise resolving to the updated message
   * @throws Error if the message cannot be edited
   *
   * @example
   * ```typescript
   * // Edit message content
   * message.edit({ content: "Updated content" });
   *
   * // Edit message with an embed
   * message.edit({
   *   content: "Check out this embed!",
   *   embeds: [{
   *     title: "My Embed",
   *     description: "This is an updated embed",
   *     color: 0x00ff00
   *   }]
   * });
   * ```
   */
  async edit(options: EditMessageSchema): Promise<Message> {
    const updatedMessage = await this.client.rest.messages.editMessage(
      this.channelId,
      this.id,
      options,
    );

    // Update this instance with the new data
    Object.assign(this.data, updatedMessage);

    return this;
  }

  /**
   * Deletes this message
   * Can only delete your own messages unless you have MANAGE_MESSAGES permission
   *
   * @param reason - Audit log reason for the deletion
   * @returns Promise that resolves when the message is deleted
   * @throws Error if the message cannot be deleted
   *
   * @example
   * ```typescript
   * // Delete message
   * await message.delete();
   *
   * // Delete with reason
   * await message.delete("Inappropriate content");
   * ```
   */
  async delete(reason?: string): Promise<void> {
    return this.client.rest.messages.deleteMessage(
      this.channelId,
      this.id,
      reason,
    );
  }

  /**
   * Pins this message to the channel
   * Requires MANAGE_MESSAGES permission
   *
   * @returns Promise that resolves when the message is pinned
   * @throws Error if the message cannot be pinned
   *
   * @example
   * ```typescript
   * await message.pin();
   * ```
   */
  async pin(): Promise<void> {
    return this.client.rest.channels.pinMessage(this.channelId, this.id);
  }

  /**
   * Unpins this message from the channel
   * Requires MANAGE_MESSAGES permission
   *
   * @returns Promise that resolves when the message is unpinned
   * @throws Error if the message cannot be unpinned
   *
   * @example
   * ```typescript
   * await message.unpin();
   * ```
   */
  async unpin(): Promise<void> {
    return this.client.rest.channels.unpinMessage(this.channelId, this.id);
  }

  /**
   * Crosspost (publish) this message to all following channels
   * Only works in announcement channels
   *
   * @returns Promise resolving to the crossposted message
   * @throws Error if the message cannot be crossposted
   *
   * @example
   * ```typescript
   * // Publish an announcement message
   * if (message.channel.type === ChannelType.GuildAnnouncement) {
   *   await message.crosspost();
   * }
   * ```
   */
  async crosspost(): Promise<Message> {
    const crosspostedMessage = await this.client.rest.messages.crosspostMessage(
      this.channelId,
      this.id,
    );

    return new Message(this.client, crosspostedMessage);
  }

  /**
   * Adds a reaction to this message
   *
   * @param emoji - Unicode emoji or custom emoji in format `name:id`
   * @returns Promise that resolves when the reaction is added
   * @throws Error if the reaction cannot be added
   *
   * @example
   * ```typescript
   * // React with unicode emoji
   * await message.react("👍");
   *
   * // React with custom emoji
   * await message.react("custom_emoji:123456789012345678");
   * ```
   */
  async react(emoji: string): Promise<void> {
    return this.client.rest.messages.createReaction(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes the current user's reaction from this message
   *
   * @param emoji - Unicode emoji or custom emoji in format `name:id`
   * @returns Promise that resolves when the reaction is removed
   * @throws Error if the reaction cannot be removed
   *
   * @example
   * ```typescript
   * await message.removeReaction("👍");
   * ```
   */
  async removeReaction(emoji: string): Promise<void> {
    return this.client.rest.messages.deleteOwnReaction(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes a specific user's reaction from this message
   * Requires MANAGE_MESSAGES permission
   *
   * @param emoji - Unicode emoji or custom emoji in format `name:id`
   * @param userId - The ID of the user whose reaction to remove
   * @returns Promise that resolves when the reaction is removed
   * @throws Error if the reaction cannot be removed
   *
   * @example
   * ```typescript
   * await message.removeUserReaction("👍", "123456789012345678");
   * ```
   */
  async removeUserReaction(emoji: string, userId: Snowflake): Promise<void> {
    return this.client.rest.messages.deleteUserReaction(
      this.channelId,
      this.id,
      emoji,
      userId,
    );
  }

  /**
   * Removes all reactions of a specific emoji from this message
   * Requires MANAGE_MESSAGES permission
   *
   * @param emoji - Unicode emoji or custom emoji in format `name:id`
   * @returns Promise that resolves when the reactions are removed
   * @throws Error if the reactions cannot be removed
   *
   * @example
   * ```typescript
   * await message.removeAllReactionsForEmoji("👍");
   * ```
   */
  async removeAllReactionsForEmoji(emoji: string): Promise<void> {
    return this.client.rest.messages.deleteAllReactionsForEmoji(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes all reactions from this message
   * Requires MANAGE_MESSAGES permission
   *
   * @returns Promise that resolves when all reactions are removed
   * @throws Error if the reactions cannot be removed
   *
   * @example
   * ```typescript
   * await message.removeAllReactions();
   * ```
   */
  async removeAllReactions(): Promise<void> {
    return this.client.rest.messages.deleteAllReactions(
      this.channelId,
      this.id,
    );
  }

  /**
   * Gets users who reacted with a specific emoji
   *
   * @param emoji - Unicode emoji or custom emoji in format `name:id`
   * @param options - Options for fetching reactions
   * @param options.limit - Maximum number of users to retrieve (1-100)
   * @param options.after - Get users after this user ID
   * @param options.type - Type of reaction (normal or burst/super)
   * @returns Promise resolving to array of users who reacted
   * @throws Error if the reactions cannot be fetched
   *
   * @example
   * ```typescript
   * // Get first 50 users who reacted with 👍
   * const users = await message.getReactions("👍", { limit: 50 });
   *
   * // Get users who super-reacted
   * const superReactions = await message.getReactions("👍", {
   *   type: ReactionTypeFlag.Burst
   * });
   * ```
   */
  async getReactions(
    emoji: string,
    options: {
      limit?: number;
      after?: Snowflake;
      type?: ReactionTypeFlag;
    } = {},
  ): Promise<UserEntity[]> {
    return this.client.rest.messages.getReactions(
      this.channelId,
      this.id,
      emoji,
      options,
    );
  }

  /**
   * Creates a thread from this message
   * Message must be in a guild text channel or news channel
   *
   * @param name - Name of the thread
   * @param autoArchiveDuration - Duration in minutes to automatically archive the thread
   * @returns Promise resolving to the created thread
   * @throws Error if a thread cannot be created from this message
   *
   * @example
   * ```typescript
   * // Create a thread that archives after 1 day
   * const thread = await message.startThread("Discussion Thread", 1440);
   * ```
   */
  startThread(
    name: string,
    autoArchiveDuration?: 60 | 1440 | 4320 | 10080,
  ): Promise<AnyChannelEntity> {
    return this.client.rest.channels.startThreadFromMessage(
      this.channelId,
      this.id,
      {
        name,
        auto_archive_duration: autoArchiveDuration,
      },
    );
  }

  /**
   * Replies to this message
   *
   * @param options - Content and options for the reply
   * @returns Promise resolving to the sent message
   * @throws Error if the reply cannot be sent
   *
   * @example
   * ```typescript
   * // Simple text reply
   * const reply = await message.reply("Hello there!");
   *
   * // Reply with an embed
   * const embedReply = await message.reply({
   *   content: "Check this out!",
   *   embeds: [{
   *     title: "My Embed",
   *     description: "This is a reply embed",
   *     color: 0xff0000
   *   }]
   * });
   * ```
   */
  async reply(
    options: string | Omit<CreateMessageSchema, "message_reference">,
  ): Promise<Message> {
    let message = options as CreateMessageSchema;
    // Handle string content
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

    return new Message(this.client, reply);
  }

  /**
   * Fetches this message from the API to get the latest data
   *
   * @returns Promise resolving to the updated message
   * @throws Error if the message cannot be fetched
   *
   * @example
   * ```typescript
   * // Refresh message data
   * const updatedMessage = await message.fetch();
   * ```
   */
  async fetch(): Promise<Message> {
    const freshMessage = await this.client.rest.messages.getMessage(
      this.channelId,
      this.id,
    );

    // Update this instance with the fresh data
    Object.assign(this.data, freshMessage);

    return this;
  }

  /**
   * Gets the channel where this message was sent
   *
   * @returns Promise resolving to the channel
   * @throws Error if the channel cannot be fetched
   *
   * @example
   * ```typescript
   * const channel = await message.getChannel();
   * ```
   *
   * getChannel(): Promise<any> {
   * return this.client.channels.fetch(this.channelId);
   * }
   */

  /**
   * Checks if this message is from a bot
   *
   * @returns True if the message is from a bot
   *
   * @example
   * ```typescript
   * if (message.isFromBot()) {
   *   // Ignore bot messages
   *   return;
   * }
   * ```
   */
  isFromBot(): boolean {
    return Boolean(this.author.bot);
  }

  /**
   * Checks if this message is from a webhook
   *
   * @returns True if the message is from a webhook
   *
   * @example
   * ```typescript
   * if (message.isFromWebhook()) {
   *   // Process webhook message differently
   * }
   * ```
   */
  isFromWebhook(): boolean {
    return Boolean(this.webhookId);
  }

  /**
   * Checks if this message is a system message
   *
   * @returns True if the message is a system message
   *
   * @example
   * ```typescript
   * if (message.isSystemMessage()) {
   *   // Handle system message
   * }
   * ```
   */
  isSystemMessage(): boolean {
    return this.type !== MessageType.Default && this.type !== MessageType.Reply;
  }

  /**
   * Checks if this message is a reply to another message
   *
   * @returns True if the message is a reply
   *
   * @example
   * ```typescript
   * if (message.isReply()) {
   *   console.log(`This is a reply to message ID: ${message.messageReference.message_id}`);
   * }
   * ```
   */
  isReply(): boolean {
    return this.type === MessageType.Reply && Boolean(this.messageReference);
  }

  /**
   * Checks if this message has components (buttons, select menus, etc.)
   *
   * @returns True if the message has components
   *
   * @example
   * ```typescript
   * if (message.hasComponents()) {
   *   // Process message with interactive components
   * }
   * ```
   */
  hasComponents(): boolean {
    return Boolean(this.components && this.components.length > 0);
  }

  /**
   * Checks if this message has embeds
   *
   * @returns True if the message has embeds
   *
   * @example
   * ```typescript
   * if (message.hasEmbeds()) {
   *   console.log(`This message has ${message.embeds.length} embeds`);
   * }
   * ```
   */
  hasEmbeds(): boolean {
    return Boolean(this.embeds && this.embeds.length > 0);
  }

  /**
   * Checks if this message has attachments
   *
   * @returns True if the message has attachments
   *
   * @example
   * ```typescript
   * if (message.hasAttachments()) {
   *   console.log(`This message has ${message.attachments.length} attachments`);
   * }
   * ```
   */
  hasAttachments(): boolean {
    return Boolean(this.attachments && this.attachments.length > 0);
  }

  /**
   * Checks if this message has a specific flag
   *
   * @param flag - The flag to check for
   * @returns True if the message has the specified flag
   *
   * @example
   * ```typescript
   * // Check if the message is ephemeral
   * if (message.hasFlag(MessageFlags.Ephemeral)) {
   *   console.log("This message is ephemeral");
   * }
   * ```
   */
  hasFlag(flag: MessageFlags): boolean {
    return Boolean(this.flags && (this.flags & flag) === flag);
  }

  /**
   * Gets the URL to this message
   *
   * @returns URL to the message
   *
   * @example
   * ```typescript
   * console.log(`Message link: ${message.getURL()}`);
   * ```
   */
  getURL(): string {
    return `https://discord.com/channels/${this.guildId || "@me"}/${this.channelId}/${this.id}`;
  }

  /**
   * Formats the timestamp of this message into a human-readable string
   *
   * @param options - Formatting options
   * @returns Formatted timestamp string
   *
   * @example
   * ```typescript
   * console.log(`Message sent: ${message.getFormattedTimestamp()}`);
   * ```
   */
  getFormattedTimestamp(options: Intl.DateTimeFormatOptions = {}): string {
    const date = new Date(this.timestamp);

    const defaultOptions: Intl.DateTimeFormatOptions = {
      dateStyle: "medium",
      timeStyle: "short",
    };

    return new Intl.DateTimeFormat("en-US", {
      ...defaultOptions,
      ...options,
    }).format(date);
  }

  /**
   * Gets an array of all mentioned users in the message
   *
   * @returns Array of mentioned users
   *
   * @example
   * ```typescript
   * const mentionedUsers = message.getMentionedUsers();
   * console.log(`Mentioned users: ${mentionedUsers.map(u => u.username).join(', ')}`);
   * ```
   */
  getMentionedUsers(): UserEntity[] {
    return this.mentions.map((mention) => {
      if ("user" in mention) {
        return mention.user as UserEntity;
      }
      return mention as UserEntity;
    });
  }

  /**
   * Checks if a specific user is mentioned in this message
   *
   * @param userId - The ID of the user to check for
   * @returns True if the user is mentioned
   *
   * @example
   * ```typescript
   * if (message.mentionsUser('123456789012345678')) {
   *   console.log('This message mentions the user!');
   * }
   * ```
   */
  mentionsUser(userId: Snowflake): boolean {
    return this.mentions.some((mention) => {
      if ("id" in mention) {
        return mention.id === userId;
      }
      if ("user" in mention && mention.user) {
        return mention.user.id === userId;
      }
      return false;
    });
  }

  /**
   * Checks if this message mentions @everyone or @here
   *
   * @returns True if the message mentions everyone or here
   *
   * @example
   * ```typescript
   * if (message.mentionsEveryone()) {
   *   console.log('This message pings everyone!');
   * }
   * ```
   */
  mentionsEveryone(): boolean {
    return this.mentionEveryone || this.content.includes("@here");
  }
}

/**
 * Represents a MESSAGE_REACTION_ADD event dispatched when a user adds a reaction to a message.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add}
 */
export class MessageReaction extends BaseClass<MessageReactionAddEntity> {
  /**
   * ID of the user
   */
  get userId(): Snowflake {
    return this.data.user_id;
  }

  /**
   * ID of the channel
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  /**
   * ID of the message
   */
  get messageId(): Snowflake {
    return this.data.message_id;
  }

  /**
   * ID of the guild
   */
  get guildId(): Snowflake | null {
    return this.data.guild_id || null;
  }

  /**
   * Member who reacted if this happened in a guild
   */
  get member(): GuildMemberEntity | null {
    return this.data.member || null;
  }

  /**
   * Emoji used to react
   */
  get emoji(): Pick<EmojiEntity, "id" | "name" | "animated"> {
    return this.data.emoji;
  }

  /**
   * ID of the user who authored the message which was reacted to
   */
  get messageAuthorId(): Snowflake | null {
    return this.data.message_author_id || null;
  }

  /**
   * Whether this is a super-reaction
   */
  get burst(): boolean {
    return Boolean(this.data.burst);
  }

  /**
   * Colors used for super-reaction animation in "#rrggbb" format
   */
  get burstColors(): string[] | null {
    return this.data.burst_colors || null;
  }

  /**
   * The type of reaction
   */
  get type(): ReactionTypeFlag {
    return this.data.type;
  }

  /**
   * Fetches the message that was reacted to
   *
   * @returns Promise resolving to the message
   * @throws Error if the message cannot be fetched
   *
   * @example
   * ```typescript
   * const message = await reaction.fetchMessage();
   * ```
   */
  async fetchMessage(): Promise<Message> {
    const message = await this.client.rest.messages.getMessage(
      this.channelId,
      this.messageId,
    );

    return new Message(this.client, message);
  }

  /**
   * Fetches the user who added the reaction
   *
   * @returns Promise resolving to the user
   * @throws Error if the user cannot be fetched
   *
   * @example
   * ```typescript
   * const user = await reaction.fetchUser();
   * ```
   * */
  fetchUser(): Promise<UserEntity> {
    return this.client.rest.users.getUser(this.userId);
  }

  /**
   * Removes this reaction
   * Can only remove your own reactions or requires MANAGE_MESSAGES permission
   *
   * @returns Promise that resolves when the reaction is removed
   * @throws Error if the reaction cannot be removed
   *
   * @example
   * ```typescript
   * // Remove this reaction
   * await reaction.remove();
   * ```
   */
  async remove(): Promise<void> {
    const clientUser = await this.client.rest.users.getCurrentUser();

    if (this.userId === clientUser.id) {
      // Remove own reaction
      return this.client.rest.messages.deleteOwnReaction(
        this.channelId,
        this.messageId,
        `${this.emoji.name}:${this.emoji.id || ""}`,
      );
    }
    // Remove other user's reaction
    return this.client.rest.messages.deleteUserReaction(
      this.channelId,
      this.messageId,
      `${this.emoji.name}:${this.emoji.id || ""}`,
      this.userId,
    );
  }

  /**
   * Gets the formatted emoji string
   *
   * @returns Formatted emoji string for use in reactions
   *
   * @example
   * ```typescript
   * const emoji = reaction.getFormattedEmoji();
   * // Add the same emoji to another message
   * await otherMessage.react(emoji);
   * ```
   */
  getFormattedEmoji(): string | null {
    if (this.emoji.id) {
      return `${this.emoji.name}:${this.emoji.id}`;
    }

    return this.emoji.name;
  }

  /**
   * Checks if this reaction is a custom emoji
   *
   * @returns True if the reaction is a custom emoji
   *
   * @example
   * ```typescript
   * if (reaction.isCustomEmoji()) {
   *   console.log(`Custom emoji with ID: ${reaction.emoji.id}`);
   * } else {
   *   console.log(`Unicode emoji: ${reaction.emoji.name}`);
   * }
   * ```
   */
  isCustomEmoji(): boolean {
    return Boolean(this.emoji.id);
  }

  /**
   * Checks if this reaction is from a specific user
   *
   * @param userId - The user ID to check
   * @returns True if the reaction is from the specified user
   *
   * @example
   * ```typescript
   * if (reaction.isFromUser('123456789012345678')) {
   *   console.log('This reaction is from the specified user');
   * }
   * ```
   */
  isFromUser(userId: Snowflake): boolean {
    return this.userId === userId;
  }

  /**
   * Checks if this is a super reaction
   *
   * @returns True if this is a super reaction
   *
   * @example
   * ```typescript
   * if (reaction.isSuperReaction()) {
   *   console.log('This is a super reaction!');
   * }
   * ```
   */
  isSuperReaction(): boolean {
    return this.burst;
  }
}
